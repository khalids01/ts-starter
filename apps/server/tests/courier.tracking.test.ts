import { describe, expect, it, mock } from "bun:test";
import { normalizeCourierState } from "../src/modules/delivery/tracking";
import { CourierTrackingService } from "../src/modules/delivery/tracking.service";

describe("courier status normalization", () => {
  it("maps safe Steadfast states without treating approval-pending as final", () => {
    expect(normalizeCourierState("Delivered")).toMatchObject({ normalizedState: "delivered", orderDeliveryStatus: "delivered" });
    expect(normalizeCourierState("delivered_approval_pending")).toEqual({ normalizedState: "delivery_pending_approval" });
    expect(normalizeCourierState("cancelled_approval_pending")).toEqual({ normalizedState: "cancel_pending_approval" });
  });

  it("routes partial and unknown states to exceptions", () => {
    expect(normalizeCourierState("partial_delivered").exceptionKind).toBe("partial_delivery");
    expect(normalizeCourierState("new_provider_state").exceptionKind).toBe("unknown_provider_state");
  });
});

describe("courier tracking persistence", () => {
  it("redacts customer and credential fields before storing event payloads", async () => {
    const consignment: any = { id: "consignment-1", orderId: "order-1", connectionId: "connection-1", state: "submitted", order: { deliveryStatus: "preparing" } };
    let storedPayload: any;
    const db: any = {
      courierConsignment: { findFirst: mock(async () => consignment), update: mock(async () => {}) },
      courierEvent: { create: mock(async ({ data }: any) => { storedPayload = data.payload; }) },
      courierException: { findFirst: mock(async () => null), create: mock(async () => {}) },
      order: { update: mock(async () => {}) },
      orderStatusEvent: { create: mock(async () => {}) },
    };
    db.$transaction = async (callback: any) => callback(db);
    await new CourierTrackingService({ db }).record({ connectionId: "connection-1", source: "webhook", eventKey: "event-private", eventType: "delivery_status", externalId: "external-1", providerState: "pending", payload: { status: "pending", recipient_phone: "01712345678", address: "Secret road", api_key: "secret" } });
    expect(storedPayload).toEqual({ status: "pending", recipient_phone: "[REDACTED]", address: "[REDACTED]", api_key: "[REDACTED]" });
  });

  it("deduplicates events and prevents terminal state regression", async () => {
    const consignment: any = { id: "consignment-1", orderId: "order-1", connectionId: "connection-1", state: "delivered", order: { deliveryStatus: "delivered" } };
    const events: any[] = [];
    const exceptions: any[] = [];
    const db: any = {
      courierConsignment: {
        findFirst: mock(async () => consignment),
        update: mock(async ({ data }: any) => Object.assign(consignment, data)),
      },
      courierEvent: { create: mock(async ({ data }: any) => { if (events.some((item) => item.eventKey === data.eventKey)) throw Object.assign(new Error("duplicate"), { code: "P2002" }); events.push(data); }) },
      courierException: {
        findFirst: mock(async () => null),
        create: mock(async ({ data }: any) => { exceptions.push(data); }),
      },
      order: { update: mock(async () => {}) },
      orderStatusEvent: { create: mock(async () => {}) },
    };
    db.$transaction = async (callback: any) => callback(db);
    const service = new CourierTrackingService({ db });
    const input = { connectionId: "connection-1", source: "webhook" as const, eventKey: "evt-1", eventType: "delivery_status", externalId: "external-1", providerState: "pending", payload: {} };
    const first = await service.record(input);
    const duplicate = await service.record(input);
    expect(first.normalizedState).toBe("exception");
    expect(duplicate.duplicate).toBe(true);
    expect(consignment.state).toBe("exception");
    expect(db.order.update).not.toHaveBeenCalled();
    expect(exceptions[0].kind).toBe("conflicting_terminal_event");
  });

  it("stores tracking messages without changing delivery state", async () => {
    const consignment: any = { id: "consignment-1", orderId: "order-1", connectionId: "connection-1", state: "in_transit", order: { deliveryStatus: "out_for_delivery" } };
    const create = mock(async () => ({}));
    const update = mock(async () => ({}));
    const db: any = { courierConsignment: { findFirst: mock(async () => consignment), update }, courierEvent: { create } };
    const result = await new CourierTrackingService({ db }).record({ connectionId: "connection-1", source: "webhook", eventKey: "tracking-1", eventType: "tracking_update", externalId: "external-1", providerState: "tracking_update", payload: { tracking_message: "At sorting center" } });
    expect(result).toMatchObject({ processed: true, normalizedState: null });
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({ eventType: "tracking_update", normalizedState: null }) });
    expect(update).not.toHaveBeenCalled();
    expect(consignment.state).toBe("in_transit");
  });
});
