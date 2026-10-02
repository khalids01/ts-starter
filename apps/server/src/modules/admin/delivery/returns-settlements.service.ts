import { paymentMinorUnits } from "../../ecommerce/orders/payment-policy";
import { reconcileCourierSettlement } from "../../delivery/settlement-accounting";
import { randomUUID } from "node:crypto";
import prisma from "@db/server";
import { activityService } from "../activity/activity.service";
import { createConfiguredCourierCredentialResolver } from "../../delivery/credentials.config";
import type { CourierCredentialResolver } from "../../delivery/provider";
import { createCourierProviderRegistry } from "../../delivery/registry.config";
import type { CourierProviderRegistry } from "../../delivery/registry";
import { AdminDeliveryServiceError } from "./delivery.service";
import type {
  CourierHandoffInput,
  CourierPickupRequestInput,
  CreateCourierReturnInput,
  RecordCourierSettlementInput,
  UpdateCourierReturnInput,
} from "./delivery.dto";

type Dependencies = Readonly<{ db: any; activity: Pick<typeof activityService, "record">; resolver?: CourierCredentialResolver; registry?: CourierProviderRegistry }>;

function credentialConfig(row: any) {
  return {
    credentialContext: `${row.provider.code}:${row.publicId}`,
    providerCode: row.provider.code,
    credentialSource: row.credentialSource,
    encryptedCredentials: row.credentialCiphertext && row.credentialNonce && row.credentialAuthTag && row.credentialKeyVersion
      ? { ciphertext: row.credentialCiphertext, nonce: row.credentialNonce, authTag: row.credentialAuthTag, keyVersion: row.credentialKeyVersion }
      : undefined,
  } as const;
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

  async submitReturn(id: string, actorUserId: string) {
    if (!this.dependencies.resolver || !this.dependencies.registry) throw new AdminDeliveryServiceError("Courier provider integration is unavailable", 503);
    const existing = await this.dependencies.db.courierReturn.findUnique({ where: { id }, include: { consignment: { include: { order: true, connection: { include: { provider: true } } } } } });
    if (!existing) throw new AdminDeliveryServiceError("Courier return not found", 404);
    if (existing.externalId) throw new AdminDeliveryServiceError("This return has already been submitted to the courier", 409);
    if (!existing.consignment.externalId) throw new AdminDeliveryServiceError("The parcel has not been accepted by the courier yet", 409);
    const connection = existing.consignment.connection;
    if (!connection.enabled || connection.archivedAt) throw new AdminDeliveryServiceError("The courier connection is not available", 409);
    const adapter = this.dependencies.registry.require(connection.provider.code, "createReturn");
    if (!adapter.createReturn) throw new AdminDeliveryServiceError("This courier does not support returns", 409);
    const credentials = await this.dependencies.resolver.resolve(credentialConfig(connection));
    const submitted = await adapter.createReturn(credentials, { externalId: existing.consignment.externalId, reason: existing.reason ?? undefined });
    const row = await this.dependencies.db.courierReturn.update({ where: { id }, data: { externalId: submitted.externalId, providerState: submitted.providerState, state: submitted.providerState } });
    await this.dependencies.activity.record({ type: "courier.return.submitted", actorUserId, message: `Submitted return for ${existing.consignment.order.orderNumber} to ${connection.provider.displayName}`, metadata: { returnId: id, consignmentId: existing.consignmentId, providerReturnId: submitted.externalId } });
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
    const externalId = input.externalId.trim();
    const currency = input.currency.trim().toUpperCase();
    if (!externalId) throw new AdminDeliveryServiceError("Collection evidence reference is required");
    try { if (paymentMinorUnits(input.amount) <= 0n) throw new Error("Collection amount must be positive"); }
    catch (error) { throw new AdminDeliveryServiceError((error as Error).message); }
    let row;
    try {
      row = await this.dependencies.db.$transaction(async (tx: any) => {
        const consignment = await tx.courierConsignment.findUnique({ where: { id: input.consignmentId }, include: { order: true } });
        if (!consignment) throw new AdminDeliveryServiceError("Courier consignment not found", 404);
        const prior = await tx.courierSettlement.findUnique({ where: { consignmentId_externalId: { consignmentId: consignment.id, externalId } } });
        if (prior) {
          if (prior.currency !== currency || paymentMinorUnits(String(prior.amount)) !== paymentMinorUnits(input.amount)) throw new AdminDeliveryServiceError("Settlement reference conflicts with existing collection evidence", 409);
          return { ...prior, duplicate: true };
        }
        const settlement = await tx.courierSettlement.create({ data: {
          consignmentId: consignment.id, externalId, amount: input.amount, currency, state: "pending_review",
          evidence: { source: "manual_admin_gross_collection", note: input.note?.trim() ?? null, recordedByUserId: actorUserId },
        } });
        const state = await reconcileCourierSettlement(tx, consignment, settlement, actorUserId);
        return { ...settlement, state, duplicate: false };
      }, { isolationLevel: "Serializable" });
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && ["P2034", "P2002"].includes(String(error.code))) throw new AdminDeliveryServiceError("Collection changed concurrently; reload and retry", 409);
      throw error;
    }
    if (!row.duplicate) await this.dependencies.activity.record({ type: "courier.settlement.recorded", actorUserId, severity: row.state === "mismatch" ? "warning" : "info", message: "Recorded courier gross collection evidence", metadata: { settlementId: row.id, consignmentId: input.consignmentId, state: row.state } });
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

  async requestPickup(consignmentId: string, input: CourierPickupRequestInput, actorUserId: string) {
    if (!this.dependencies.resolver || !this.dependencies.registry) throw new AdminDeliveryServiceError("Courier provider integration is unavailable", 503);
    const consignment = await this.dependencies.db.courierConsignment.findUnique({ where: { id: consignmentId }, include: { order: true, connection: { include: { provider: true } } } });
    if (!consignment) throw new AdminDeliveryServiceError("Courier consignment not found", 404);
    if (!consignment.externalId) throw new AdminDeliveryServiceError("The parcel has not been accepted by the courier yet", 409);
    const connection = consignment.connection;
    if (!connection.enabled || connection.archivedAt) throw new AdminDeliveryServiceError("The courier connection is not available", 409);
    const adapter = this.dependencies.registry.require(connection.provider.code, "requestPickup");
    if (!adapter.requestPickup) throw new AdminDeliveryServiceError("This courier does not support pickup requests", 409);
    const credentials = await this.dependencies.resolver.resolve(credentialConfig(connection));
    const pickup = await adapter.requestPickup(credentials, input);
    const eventKey = `pickup:${pickup.externalId}`;
    await this.dependencies.db.$transaction(async (tx: any) => {
      await tx.courierEvent.create({ data: { consignmentId, source: "manual", eventKey, eventType: "pickup_requested", providerState: pickup.providerState, normalizedState: "pickup_requested_externally", payload: { pickupRequestId: pickup.externalId }, occurredAt: pickup.createdAt ?? new Date() } });
      await tx.courierConsignment.update({ where: { id: consignmentId }, data: { state: "pickup_requested_externally" } });
    });
    await this.dependencies.activity.record({ type: "courier.pickup.requested", actorUserId, message: `Requested courier pickup for ${consignment.order.orderNumber}`, metadata: { consignmentId, providerPickupId: pickup.externalId } });
    return pickup;
  }
}

export const courierReturnsSettlementsService = new CourierReturnsSettlementsService({ db: prisma, activity: activityService, resolver: createConfiguredCourierCredentialResolver(), registry: createCourierProviderRegistry() });
