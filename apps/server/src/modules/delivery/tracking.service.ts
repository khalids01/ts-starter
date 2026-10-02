import { canRetryUnsubmittedHold, canReconcileBooking } from "./dispatch-policy";
import { releaseDeliveredShipmentClaim } from "./shipment-claim";
import { reconcileCourierSettlement } from "./settlement-accounting";
import prisma from "@db/server";
import { normalizeCourierState, type CourierStateDecision } from "./tracking";
import { sanitizeCourierEventPayload } from "./redaction";

type Dependencies = Readonly<{ db: any }>;

export type RecordCourierEventInput = Readonly<{
  connectionId: string;
  source: "webhook" | "polling";
  eventKey: string;
  eventType: string;
  externalId?: string;
  invoice?: string;
  trackingCode?: string;
  providerState: string;
  payload: Record<string, unknown>;
  occurredAt?: Date;
}>;

function uniqueError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as any).code === "P2002";
}

export class CourierTrackingService {
  constructor(private readonly dependencies: Dependencies) {}

  async record(input: RecordCourierEventInput) {
    const consignment = await this.dependencies.db.courierConsignment.findFirst({
      where: {
        connectionId: input.connectionId,
        OR: [
          ...(input.externalId ? [{ externalId: input.externalId }] : []),
          ...(input.invoice ? [{ invoice: input.invoice }] : []),
          ...(input.trackingCode ? [{ trackingCode: input.trackingCode }] : []),
        ],
      },
      include: { order: { select: { deliveryStatus: true } } },
    });
    if (!consignment) throw new Error("Courier event does not match a known consignment");
    const identityConflict = Boolean(input.externalId && consignment.externalId && input.externalId !== consignment.externalId || input.invoice && consignment.invoice && input.invoice !== consignment.invoice || input.trackingCode && consignment.trackingCode && input.trackingCode !== consignment.trackingCode);
    if (input.eventType === "tracking_update" && !identityConflict) {
      try {
        await this.dependencies.db.courierEvent.create({
          data: {
            consignmentId: consignment.id,
            source: input.source,
            eventKey: input.eventKey,
            eventType: input.eventType,
            providerState: null,
            normalizedState: null,
            payload: sanitizeCourierEventPayload(input.payload),
            occurredAt: input.occurredAt,
          },
        });
        return { processed: true, duplicate: false, normalizedState: null };
      } catch (error) {
        if (uniqueError(error)) return { processed: false, duplicate: true, normalizedState: null };
        throw error;
      }
    }
    const normalized = normalizeCourierState(input.providerState);
    let decision: CourierStateDecision = normalized;
    try {
      await this.dependencies.db.$transaction(async (tx: any) => {
        // Serialize lifecycle decisions with the current row, not the earlier invoice lookup.
        const current = await tx.courierConsignment.findUnique({ where: { id: consignment.id }, include: { order: { select: { deliveryStatus: true, orderStatus: true } } } });
        if (!current) throw new Error("Courier consignment no longer exists");
        const currentIdentityConflict = identityConflict || Boolean(input.externalId && current.externalId && input.externalId !== current.externalId || input.invoice && current.invoice && input.invoice !== current.invoice || input.trackingCode && current.trackingCode && input.trackingCode !== current.trackingCode);
        const terminalConflict = ["delivered", "cancelled"].includes(current.state) && normalized.normalizedState !== current.state;
        const rank: Record<string, number> = { submitted: 1, in_transit: 2, delivery_pending_approval: 3, delivered: 4 };
        const regression = Boolean(rank[current.state] && rank[normalized.normalizedState] && rank[normalized.normalizedState]! < rank[current.state]!);
        decision = currentIdentityConflict ? { normalizedState: "exception", exceptionKind: "conflicting_consignment_identity" }
          : terminalConflict ? { normalizedState: "exception", exceptionKind: "conflicting_terminal_event" }
          : regression ? { normalizedState: "exception", exceptionKind: "out_of_order_delivery_event" }
          : normalized;
        await tx.courierEvent.create({
          data: {
            consignmentId: consignment.id,
            source: input.source,
            eventKey: input.eventKey,
            eventType: input.eventType,
            providerState: input.providerState,
            normalizedState: decision.normalizedState,
            payload: sanitizeCourierEventPayload(input.payload),
            occurredAt: input.occurredAt,
          },
        });
        if (!currentIdentityConflict && !terminalConflict && !regression) await tx.courierConsignment.update({
          where: { id: consignment.id },
          data: {
            providerState: input.providerState,
            state: decision.normalizedState,
            ...(decision.normalizedState === "delivered" ? { deliveredAt: current.deliveredAt ?? input.occurredAt ?? new Date(), active: false } : {}),
            ...(decision.normalizedState === "cancelled" ? { active: false } : {}),
          },
        });
        if (decision.orderDeliveryStatus) {
          await tx.order.update({
            where: { id: consignment.orderId },
            data: {
              deliveryStatus: decision.orderDeliveryStatus,
              ...(decision.orderDeliveryStatus === "delivered" ? { deliveredAt: current.deliveredAt ?? input.occurredAt ?? new Date() } : {}),
            },
          });
          await tx.orderStatusEvent.create({
            data: {
              orderId: consignment.orderId,
              type: "delivery",
              previousValue: current.order.deliveryStatus,
              newValue: decision.orderDeliveryStatus,
              note: `Courier ${input.source} update`,
              metadata: { consignmentId: consignment.id, eventKey: input.eventKey },
            },
          });
          if (decision.orderDeliveryStatus === "delivered") {
            const settlements = await tx.courierSettlement.findMany({
              where: { consignmentId: consignment.id, state: "matched_pending_delivery" },
              orderBy: { createdAt: "asc" },
            });
            for (const settlement of settlements) {
              const delivered = await tx.courierConsignment.findUnique({ where: { id: consignment.id } });
              const evidence = settlement.evidence as { recordedByUserId?: string } | null;
              if (evidence?.recordedByUserId) await reconcileCourierSettlement(tx, delivered, settlement, evidence.recordedByUserId);
              else {
                await tx.courierSettlement.update({ where: { id: settlement.id }, data: { state: "mismatch" } });
                await tx.courierException.create({ data: { consignmentId: consignment.id, kind: "settlement_mismatch", details: { settlementId: settlement.id, reason: "Legacy settlement lacks authenticated collection evidence" } } });
              }
            }
          }
        }
        if (decision.orderDeliveryStatus === "delivered") await releaseDeliveredShipmentClaim(tx, consignment.id);
        if (decision.exceptionKind) {
          const existing = await tx.courierException.findFirst({ where: { consignmentId: consignment.id, kind: decision.exceptionKind, state: "open" } });
          if (!existing) await tx.courierException.create({ data: { consignmentId: consignment.id, kind: decision.exceptionKind, details: { eventKey: input.eventKey, providerState: input.providerState } } });
        }
      }, { isolationLevel: "Serializable" });
      return { processed: true, duplicate: false, normalizedState: decision.normalizedState };
    } catch (error) {
      if (uniqueError(error)) return { processed: false, duplicate: true, normalizedState: decision.normalizedState };
      throw error;
    }
  }

  async timelineForOrder(orderId: string) {
    const consignments = await this.dependencies.db.courierConsignment.findMany({
      where: { orderId },
      include: {
        connection: { include: { provider: true } },
        service: true,
        operations: { orderBy: { createdAt: "desc" } },
        events: { orderBy: { createdAt: "desc" }, take: 100 },
        exceptions: { where: { state: "open" }, orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return consignments.map((row: any) => ({
      id: row.id,
      connectionName: row.connection.displayName,
      providerName: row.connection.provider.displayName,
      serviceName: row.service.displayName,
      invoice: row.invoice,
      canReconcileBooking: row.operations?.length === 1 && canReconcileBooking(row.operations[0], row),
      canRetryHold: row.operations?.length === 1 && canRetryUnsubmittedHold(row.operations[0], row),
      operation: row.operations?.[0] ? { state: row.operations[0].state, attemptCount: row.operations[0].attemptCount, lastErrorCode: row.operations[0].lastErrorCode, nextAttemptAt: row.operations[0].nextAttemptAt?.toISOString() ?? null } : null,
      trackingCode: row.trackingCode,
      trackingUrl: row.trackingUrl,
      state: row.state,
      providerState: row.providerState,
      submittedAt: row.submittedAt?.toISOString() ?? null,
      deliveredAt: row.deliveredAt?.toISOString() ?? null,
      events: row.events.map((event: any) => ({ id: event.id, source: event.source, eventType: event.eventType, providerState: event.providerState, normalizedState: event.normalizedState, occurredAt: event.occurredAt?.toISOString() ?? null, createdAt: event.createdAt.toISOString() })),
      exceptions: row.exceptions.map((exception: any) => ({ id: exception.id, kind: exception.kind, state: exception.state, createdAt: exception.createdAt.toISOString() })),
    }));
  }
}

export const courierTrackingService = new CourierTrackingService({ db: prisma });
