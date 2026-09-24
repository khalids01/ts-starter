import prisma from "@db/server";
import { normalizeCourierState } from "./tracking";
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
    const normalized = normalizeCourierState(input.providerState);
    const terminalConflict = ["delivered", "cancelled"].includes(consignment.state) && normalized.normalizedState !== consignment.state;
    const decision = terminalConflict
      ? { normalizedState: "exception" as const, exceptionKind: "conflicting_terminal_event" }
      : normalized;
    try {
      await this.dependencies.db.$transaction(async (tx: any) => {
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
        await tx.courierConsignment.update({
          where: { id: consignment.id },
          data: {
            providerState: input.providerState,
            state: decision.normalizedState,
            ...(decision.normalizedState === "delivered" ? { deliveredAt: input.occurredAt ?? new Date(), active: false } : {}),
            ...(decision.normalizedState === "cancelled" ? { active: false } : {}),
          },
        });
        if (decision.orderDeliveryStatus) {
          await tx.order.update({
            where: { id: consignment.orderId },
            data: {
              deliveryStatus: decision.orderDeliveryStatus,
              ...(decision.orderDeliveryStatus === "delivered" ? { deliveredAt: input.occurredAt ?? new Date() } : {}),
            },
          });
          await tx.orderStatusEvent.create({
            data: {
              orderId: consignment.orderId,
              type: "delivery",
              previousValue: consignment.order.deliveryStatus,
              newValue: decision.orderDeliveryStatus,
              note: `Courier ${input.source} update`,
              metadata: { consignmentId: consignment.id, eventKey: input.eventKey },
            },
          });
        }
        if (decision.exceptionKind) {
          const existing = await tx.courierException.findFirst({ where: { consignmentId: consignment.id, kind: decision.exceptionKind, state: "open" } });
          if (!existing) await tx.courierException.create({ data: { consignmentId: consignment.id, kind: decision.exceptionKind, details: { eventKey: input.eventKey, providerState: input.providerState } } });
        }
      });
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
