import { randomUUID } from "node:crypto";
import prisma from "@db/server";
import { activityService } from "../activity/activity.service";
import { AdminDeliveryServiceError } from "./delivery.service";
import type {
  CourierHandoffInput,
  CreateCourierReturnInput,
  RecordCourierSettlementInput,
  UpdateCourierReturnInput,
} from "./delivery.dto";

type Dependencies = Readonly<{ db: any; activity: Pick<typeof activityService, "record"> }>;

function money(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new AdminDeliveryServiceError("Settlement amount is invalid");
  return Math.round(amount * 100);
}

export class CourierReturnsSettlementsService {
  constructor(private readonly dependencies: Dependencies) {}

  listReturns() {
    return this.dependencies.db.courierReturn.findMany({
      include: { consignment: { include: { order: { select: { orderNumber: true } }, connection: { select: { displayName: true, provider: { select: { displayName: true } } } }, service: { select: { displayName: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async createReturn(input: CreateCourierReturnInput, actorUserId: string) {
    const consignment = await this.dependencies.db.courierConsignment.findUnique({ where: { id: input.consignmentId }, include: { order: true } });
    if (!consignment) throw new AdminDeliveryServiceError("Courier consignment not found", 404);
    const open = await this.dependencies.db.courierReturn.findFirst({ where: { consignmentId: consignment.id, state: { notIn: ["completed", "cancelled"] } } });
    if (open) throw new AdminDeliveryServiceError("This consignment already has an active return", 409);
    const row = await this.dependencies.db.courierReturn.create({
      data: {
        consignmentId: consignment.id,
        state: "pending",
        reason: input.reason?.trim(),
        requestedByUserId: actorUserId,
      },
    });
    await this.dependencies.activity.record({
      type: "courier.return.requested",
      actorUserId,
      message: `Recorded return request for ${consignment.order.orderNumber}`,
      metadata: { returnId: row.id, consignmentId: consignment.id, providerSubmission: "manual_until_contract_verified" },
    });
    return row;
  }

  async updateReturn(id: string, input: UpdateCourierReturnInput, actorUserId: string) {
    const existing = await this.dependencies.db.courierReturn.findUnique({ where: { id }, include: { consignment: true } });
    if (!existing) throw new AdminDeliveryServiceError("Courier return not found", 404);
    const transitions: Record<string, readonly string[]> = {
      pending: ["approved", "processing", "cancelled"],
      approved: ["processing", "cancelled"],
      processing: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };
    if (!transitions[existing.state]?.includes(input.state)) throw new AdminDeliveryServiceError(`Return cannot move from ${existing.state} to ${input.state}`, 409);
    const row = await this.dependencies.db.$transaction(async (tx: any) => {
      const updated = await tx.courierReturn.update({ where: { id }, data: { state: input.state } });
      if (input.state === "completed") {
        const open = await tx.courierException.findFirst({ where: { consignmentId: existing.consignmentId, kind: "return_reconciliation_required", state: "open" } });
        if (!open) await tx.courierException.create({ data: { consignmentId: existing.consignmentId, kind: "return_reconciliation_required", details: { returnId: id, inventoryAndRefundRemainManual: true } } });
      }
      return updated;
    });
    await this.dependencies.activity.record({ type: "courier.return.updated", actorUserId, message: `Updated courier return to ${input.state}`, metadata: { returnId: id, consignmentId: existing.consignmentId, state: input.state } });
    return row;
  }

  listSettlements() {
    return this.dependencies.db.courierSettlement.findMany({
      include: { consignment: { include: { order: { select: { orderNumber: true, paymentStatus: true } }, connection: { select: { displayName: true, provider: { select: { displayName: true } } } }, service: { select: { displayName: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async recordSettlement(input: RecordCourierSettlementInput, actorUserId: string) {
    const consignment = await this.dependencies.db.courierConsignment.findUnique({ where: { id: input.consignmentId }, include: { order: true } });
    if (!consignment) throw new AdminDeliveryServiceError("Courier consignment not found", 404);
    const currency = input.currency.trim().toUpperCase();
    const matches = currency === consignment.currency && money(input.amount) === money(consignment.codAmount);
    const state = matches ? (consignment.state === "delivered" ? "reconciled" : "matched_pending_delivery") : "mismatch";
    const row = await this.dependencies.db.$transaction(async (tx: any) => {
      const settlement = await tx.courierSettlement.create({
        data: {
          consignmentId: consignment.id,
          externalId: input.externalId.trim(),
          amount: input.amount,
          currency,
          state,
          evidence: { source: "manual_admin", note: input.note?.trim() ?? null, recordedByUserId: actorUserId },
        },
      });
      if (state === "reconciled" && consignment.order.paymentStatus !== "paid") {
        await tx.order.update({ where: { id: consignment.orderId }, data: { paymentStatus: "paid" } });
        await tx.orderStatusEvent.create({ data: { orderId: consignment.orderId, type: "payment", previousValue: consignment.order.paymentStatus, newValue: "paid", note: "Courier COD settlement reconciled", actorUserId, metadata: { settlementId: settlement.id } } });
      }
      if (!matches) {
        await tx.courierException.create({ data: { consignmentId: consignment.id, kind: "settlement_mismatch", details: { settlementId: settlement.id, expectedAmount: String(consignment.codAmount), expectedCurrency: consignment.currency, receivedAmount: input.amount, receivedCurrency: currency } } });
      }
      return settlement;
    });
    await this.dependencies.activity.record({ type: "courier.settlement.recorded", actorUserId, severity: matches ? "info" : "warning", message: `Recorded courier settlement for ${consignment.order.orderNumber}`, metadata: { settlementId: row.id, consignmentId: consignment.id, state } });
    return row;
  }

  async markHandoff(consignmentId: string, input: CourierHandoffInput, actorUserId: string) {
    const consignment = await this.dependencies.db.courierConsignment.findUnique({ where: { id: consignmentId }, include: { order: true } });
    if (!consignment) throw new AdminDeliveryServiceError("Courier consignment not found", 404);
    if (["delivered", "cancelled", "exception"].includes(consignment.state)) throw new AdminDeliveryServiceError("A terminal or exceptional consignment cannot change handoff state", 409);
    const orderStatus = input.state === "in_transit" ? "out_for_delivery" : input.state === "handed_to_courier" ? "shipped" : "preparing";
    const eventKey = `manual:${randomUUID()}`;
    await this.dependencies.db.$transaction(async (tx: any) => {
      await tx.courierEvent.create({ data: { consignmentId, source: "manual", eventKey, eventType: "handoff", normalizedState: input.state, payload: { note: input.note?.trim() ?? null }, occurredAt: new Date() } });
      await tx.courierConsignment.update({ where: { id: consignmentId }, data: { state: input.state } });
      await tx.order.update({ where: { id: consignment.orderId }, data: { deliveryStatus: orderStatus } });
      await tx.orderStatusEvent.create({ data: { orderId: consignment.orderId, type: "delivery", previousValue: consignment.order.deliveryStatus, newValue: orderStatus, note: input.note?.trim() ?? `Courier handoff: ${input.state}`, actorUserId, metadata: { consignmentId, eventKey } } });
    });
    await this.dependencies.activity.record({ type: "courier.handoff.updated", actorUserId, message: `Updated courier handoff for ${consignment.order.orderNumber}`, metadata: { consignmentId, state: input.state } });
    return { consignmentId, state: input.state };
  }
}

export const courierReturnsSettlementsService = new CourierReturnsSettlementsService({ db: prisma, activity: activityService });
