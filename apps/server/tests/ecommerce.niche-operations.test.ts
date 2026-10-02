import { beforeEach, expect, it, mock } from "bun:test";
mock.module("@env/server", () => ({ env: {} }));
let booking: any, events: any[], claim: any;
const db: any = {
  foodOrderBooking: {
    count: mock(async () => 0),
    findUnique: async () => structuredClone(booking),
    updateMany: async ({ where, data }: any) => {
      if (booking.state !== where.state) return { count: 0 };
      Object.assign(booking, data);
      return { count: 1 };
    },
  },
  orderStatusEvent: {
    create: async ({ data }: any) => {
      events.push(data);
      return data;
    },
  },
  warrantyClaim: {
    findFirst: async ({ where }: any) =>
      where.allocation.lineItem.orderId === "order"
        ? structuredClone(claim)
        : null,
    updateMany: async ({ where, data }: any) => {
      if (claim.state !== where.state) return { count: 0 };
      Object.assign(claim, data);
      return { count: 1 };
    },
  },
  foodDeliverySlot: {
    update: mock(async () => ({ isActive: false })),
    create: mock(async ({ data }: any) => ({ id: "slot", ...data })),
  },
};
db.$transaction = async (callback: any) => callback(db);
mock.module("@db/server", () => ({ default: db }));
const { nicheOperationsService } =
  await import("../src/modules/admin/orders/niche-operations.service");
beforeEach(() => {
  booking = {
    state: "reserved",
    orderId: "order",
    slotId: "slot",
    order: {
      inventoryStatus: "committed",
      orderStatus: "confirmed",
      deliveryStatus: "unfulfilled",
      recovery: null,
      shippedAt: null,
    },
    slot: { isActive: true, endsAt: new Date("2099-01-01") },
  };
  events = [];
  claim = {
    id: "claim",
    state: "open",
    allocation: { lineItem: { order: { deliveryStatus: "delivered" } } },
  };
  db.foodDeliverySlot.create.mockClear();
});
it("preparation has ordered, audited transitions and an irreversible preparation timestamp", async () => {
  await expect(
    nicheOperationsService.preparation("order", "ready", "Ready", "actor"),
  ).rejects.toThrow("reserved to preparing");
  await nicheOperationsService.preparation(
    "order",
    "preparing",
    "Kitchen started",
    "actor",
  );
  const timestamp = booking.preparedAt;
  expect(timestamp).toBeInstanceOf(Date);
  expect(events).toHaveLength(1);
  await nicheOperationsService.preparation(
    "order",
    "preparing",
    "Replay",
    "actor",
  );
  expect(events).toHaveLength(1);
  await nicheOperationsService.preparation(
    "order",
    "ready",
    "Packaged for rider",
    "actor",
  );
  expect(booking.preparedAt).toEqual(timestamp);
  expect(events).toHaveLength(2);
});
it.each(["cancelled", "expired", "uncommitted"])(
  "cannot prepare %s food",
  async (reason) => {
    if (reason === "cancelled") booking.order.orderStatus = "cancelled";
    if (reason === "expired") booking.slot.endsAt = new Date(0);
    if (reason === "uncommitted") booking.order.inventoryStatus = "reserved";
    await expect(
      nicheOperationsService.preparation(
        "order",
        "preparing",
        "Kitchen",
        "actor",
      ),
    ).rejects.toThrow("unavailable");
    expect(events).toHaveLength(0);
  },
);
it("warranty decision records evidence once without changing stock or money", async () => {
  await nicheOperationsService.resolveClaim(
    "order",
    "claim",
    "approved",
    "Repair accepted",
    "actor",
  );
  expect(claim.state).toBe("approved");
  expect(claim.resolvedByUserId).toBe("actor");
  expect(events).toHaveLength(1);
  await expect(
    nicheOperationsService.resolveClaim(
      "order",
      "claim",
      "rejected",
      "Other",
      "actor",
    ),
  ).rejects.toThrow("already been resolved");
  expect(events).toHaveLength(1);
  await expect(
    nicheOperationsService.resolveClaim(
      "other-order",
      "claim",
      "approved",
      "Other",
      "actor",
    ),
  ).rejects.toThrow("not found");
});
it("slot configuration requires area and ordered future absolute times", async () => {
  const input = {
    label: "Morning",
    postalCodes: ["1207"],
    startsAt: "2099-01-01T10:00:00+06:00",
    endsAt: "2099-01-01T11:00:00+06:00",
    cutoffAt: "2099-01-01T09:00:00+06:00",
    capacityUnits: 2,
  };
  const slot = await nicheOperationsService.createSlot(input);
  expect(slot.startsAt).toEqual(new Date("2099-01-01T04:00:00Z"));
  await expect(
    nicheOperationsService.createSlot({ ...input, postalCodes: [" "] }),
  ).rejects.toThrow("Provide an area");
  await expect(
    nicheOperationsService.createSlot({ ...input, cutoffAt: input.endsAt }),
  ).rejects.toThrow();
  expect(db.foodDeliverySlot.create).toHaveBeenCalledTimes(1);
});

it("closing a slot cannot strand active fresh bookings", async () => {
  db.foodOrderBooking.count.mockResolvedValueOnce(1);
  await expect(nicheOperationsService.disableSlot("slot")).rejects.toThrow(
    "Resolve active slot bookings",
  );
  expect(db.foodDeliverySlot.update).not.toHaveBeenCalled();
  await nicheOperationsService.disableSlot("slot");
  expect(db.foodDeliverySlot.update).toHaveBeenCalledTimes(1);
});
