import { expect, it, mock } from "bun:test";
import {
  categoryPolicy,
  unitIdentifiers,
  warrantyDeadline,
} from "../src/modules/ecommerce/niche/policy";
import {
  assertFoodSlot,
  reserveFoodSlot,
  cancelFoodBooking,
} from "../src/modules/ecommerce/niche/food";
import { assertNicheShipmentReady } from "../src/modules/ecommerce/niche/fulfillment";
import {
  assignUnit,
  registerUnit,
  markOrderUnits,
  openWarrantyClaim,
} from "../src/modules/ecommerce/niche/gadgets";

const now = new Date("2026-10-03T00:00:00Z");
const slot = () => ({
  id: "slot",
  isActive: true,
  cutoffAt: new Date("2099-01-01"),
  startsAt: new Date("2099-01-02"),
  endsAt: new Date("2099-01-03"),
  postalCodes: ["1207"],
  capacityUnits: 2,
  reservedUnits: 0,
});
const unit = () => ({
  id: "unit-1",
  variantId: "variant",
  locationId: "location",
  batchId: null,
  serial: "SERIAL-1",
  imei: null,
  state: "available",
  lineItemId: null,
  location: { isActive: true },
  batch: null,
});
const line = () => ({
  id: "line",
  orderId: "order",
  variantId: "variant",
  quantity: 1,
  fulfillmentKind: "gadget",
  serialTracking: "serial",
  warrantyDays: 30,
  units: [] as any[],
  order: {
    id: "order",
    userId: "customer",
    orderStatus: "confirmed",
    deliveryStatus: "unfulfilled",
    inventoryStatus: "committed",
    shipmentClaim: null,
    recovery: null,
    courierConsignments: [],
    deliveredAt: new Date(),
    paymentStatus: "paid",
  },
});

it.each(["packaged_food", "fresh_food", "clothing", "standard"] as const)(
  "%s cannot acquire warranty or serial policies",
  (fulfillmentKind) => {
    expect(() => categoryPolicy({ fulfillmentKind, warrantyDays: 30 })).toThrow(
      "only to gadget",
    );
    expect(() =>
      categoryPolicy({ fulfillmentKind, serialTracking: "serial" }),
    ).toThrow("only to gadget");
  },
);
it("warranty requires tracking and is opt-in, bounded and explicit", () => {
  expect(categoryPolicy({})).toEqual({
    fulfillmentKind: "standard",
    serialTracking: "none",
    warrantyDays: 0,
  });
  expect(() =>
    categoryPolicy({ fulfillmentKind: "gadget", warrantyDays: 30 }),
  ).toThrow("requires individual");
  expect(() =>
    categoryPolicy({
      fulfillmentKind: "gadget",
      serialTracking: "serial",
      warrantyDays: 3651,
    }),
  ).toThrow();
  expect(warrantyDeadline(now, 30)).toEqual(new Date("2026-11-02T00:00:00Z"));
});
it("normalizes serial identity and enforces selected IMEI mode", () => {
  expect(unitIdentifiers("serial", " sn-1 ")).toEqual({
    serial: "SN-1",
    imei: null,
  });
  expect(() => unitIdentifiers("serial_and_imei", "SN-1")).toThrow(
    "IMEI is required",
  );
  expect(() => unitIdentifiers("imei", null, "123")).toThrow("15 digits");
  expect(() => unitIdentifiers("serial", "bad serial")).toThrow();
});
it.each(["cutoff", "area", "capacity", "disabled"])(
  "fresh checkout rejects %s",
  (reason) => {
    const s = slot();
    if (reason === "cutoff") s.cutoffAt = now;
    if (reason === "capacity") s.reservedUnits = 2;
    if (reason === "disabled") s.isActive = false;
    expect(() =>
      assertFoodSlot(s, reason === "area" ? "9999" : "1207", 1, now),
    ).toThrow();
  },
);
it("fresh reservation increments capacity atomically and creates one order booking", async () => {
  const s = slot();
  const create = mock(async () => ({}));
  const db: any = {
    foodDeliverySlot: {
      findUnique: async () => s,
      updateMany: mock(async ({ data }: any) => {
        s.reservedUnits += data.reservedUnits.increment;
        return { count: 1 };
      }),
    },
    foodOrderBooking: { create },
  };
  await reserveFoodSlot(db, {
    orderId: "order",
    slotId: "slot",
    postalCode: "1207",
    quantity: 2,
  });
  expect(s.reservedUnits).toBe(2);
  expect(create).toHaveBeenCalledTimes(1);
  await expect(
    reserveFoodSlot(db, {
      orderId: "other",
      slotId: "slot",
      postalCode: "1207",
      quantity: 1,
    }),
  ).rejects.toThrow("full");
  expect(create).toHaveBeenCalledTimes(1);
});
it("capacity CAS loss creates no booking", async () => {
  const create = mock(async () => ({}));
  const db: any = {
    foodDeliverySlot: {
      findUnique: async () => slot(),
      updateMany: async () => ({ count: 0 }),
    },
    foodOrderBooking: { create },
  };
  await expect(
    reserveFoodSlot(db, {
      orderId: "order",
      slotId: "slot",
      postalCode: "1207",
      quantity: 1,
    }),
  ).rejects.toThrow("changed");
  expect(create).not.toHaveBeenCalled();
});
it.each(["reserved", "preparing", "ready"])(
  "cancellation of %s preserves correct preparation capacity",
  async (state) => {
    const booking = { state, slotId: "slot", quantity: 2 };
    const update = mock(async () => ({}));
    const db: any = {
      foodOrderBooking: {
        findUnique: async () => booking,
        updateMany: async ({ data }: any) => {
          Object.assign(booking, data);
          return { count: 1 };
        },
      },
      foodDeliverySlot: { update },
    };
    expect(await cancelFoodBooking(db, "order")).toBe(state !== "reserved");
    expect(update.mock.calls.length).toBe(state === "reserved" ? 1 : 0);
    expect(await cancelFoodBooking(db, "order")).toBe(false);
    expect(update.mock.calls.length).toBe(state === "reserved" ? 1 : 0);
  },
);
it("dispatch requires complete assigned identities", async () => {
  const l = line();
  const db: any = { orderLineItem: { findMany: async () => [l] } };
  await expect(assertNicheShipmentReady(db, "order")).rejects.toThrow(
    "one eligible",
  );
  l.units = [{ ...unit(), state: "assigned" }];
  expect(await assertNicheShipmentReady(db, "order")).toEqual({
    freshFood: false,
  });
  l.units[0].state = "returned";
  await expect(assertNicheShipmentReady(db, "order")).rejects.toThrow();
});
it("fresh delivery requires ready state and active window", async () => {
  const s = slot();
  s.startsAt = new Date(now.getTime() - 1000);
  s.endsAt = new Date(now.getTime() + 1000);
  const booking = { state: "preparing", slot: s };
  const db: any = {
    orderLineItem: {
      findMany: async () => [
        { ...line(), fulfillmentKind: "fresh_food", serialTracking: "none" },
      ],
    },
    foodOrderBooking: { findUnique: async () => booking },
  };
  await expect(assertNicheShipmentReady(db, "order", now)).rejects.toThrow(
    "ready",
  );
  booking.state = "ready";
  expect(await assertNicheShipmentReady(db, "order", now)).toEqual({
    freshFood: true,
  });
  await expect(assertNicheShipmentReady(db, "order", s.endsAt)).rejects.toThrow(
    "window",
  );
});
it("registration cannot invent stock quantity or register food units", async () => {
  const create = mock(async () => unit());
  const variant = {
    product: {
      category: { fulfillmentKind: "gadget", serialTracking: "serial" },
    },
  };
  const db: any = {
    productVariant: { findUnique: async () => variant },
    inventoryStock: { findMany: async () => [] },
    inventoryUnit: { count: async () => 0, create },
  };
  await expect(
    registerUnit(
      db,
      { variantId: "variant", locationId: "location", serial: "SN" },
      "operator",
    ),
  ).rejects.toThrow("Receive eligible");
  expect(create).not.toHaveBeenCalled();
  variant.product.category.fulfillmentKind = "packaged_food";
  await expect(
    registerUnit(
      db,
      { variantId: "variant", locationId: "location", serial: "SN" },
      "operator",
    ),
  ).rejects.toThrow("gadget variant");
});
it("assignment CAS loss has no allocation or audit", async () => {
  const l = line();
  const allocate = mock(async () => ({}));
  const event = mock(async () => ({}));
  const db: any = {
    orderLineItem: { findFirst: async () => l },
    inventoryUnit: {
      findUnique: async () => unit(),
      count: async () => 0,
      updateMany: async () => ({ count: 0 }),
    },
    stockReservation: { findMany: async () => [{ quantity: 1 }] },
    unitAllocation: { upsert: allocate },
    orderStatusEvent: { create: event },
  };
  await expect(
    assignUnit(db, "order", "line", "unit-1", "operator"),
  ).rejects.toThrow("assigned elsewhere");
  expect(allocate).not.toHaveBeenCalled();
  expect(event).not.toHaveBeenCalled();
});
it("assignment freezes at courier review and must match committed batch", async () => {
  const l = line();
  const u = unit();
  const update = mock(async () => ({ count: 1 }));
  const db: any = {
    orderLineItem: { findFirst: async () => l },
    inventoryUnit: {
      findUnique: async () => u,
      count: async () => 0,
      updateMany: update,
    },
    stockReservation: { findMany: async () => [] },
  };
  await expect(
    assignUnit(db, "order", "line", "unit-1", "operator"),
  ).rejects.toThrow("committed location");
  expect(update).not.toHaveBeenCalled();
  (l.order as any).shipmentClaim = { dispatchId: "dispatch" };
  await expect(
    assignUnit(db, "order", "line", "unit-1", "operator"),
  ).rejects.toThrow("before courier");
});
it("physical return/restock retains immutable purchase allocation history", async () => {
  const u = {
    ...unit(),
    state: "shipped",
    lineItemId: "line" as string | null,
  };
  const allocation = { state: "shipped", lineItemId: "line" };
  const db: any = {
    inventoryUnit: {
      updateMany: async ({ data }: any) => {
        Object.assign(u, data);
        return { count: 1 };
      },
    },
    unitAllocation: {
      updateMany: async ({ data }: any) => {
        Object.assign(allocation, data);
        return { count: 1 };
      },
    },
  };
  await markOrderUnits(db, "order", "returned");
  expect(u.state).toBe("returned");
  expect(allocation.state).toBe("returned");
  await markOrderUnits(db, "order", "available");
  expect(u.lineItemId).toBeNull();
  expect(allocation.lineItemId).toBe("line");
  expect(allocation.state).toBe("returned");
});
function warrantyHarness() {
  const allocation: any = {
    id: "allocation",
    state: "shipped",
    lineItem: line(),
  };
  const claims: any[] = [];
  const events: any[] = [];
  const db: any = {
    unitAllocation: { findUnique: async () => allocation },
    warrantyClaim: {
      findUnique: async ({ where }: any) =>
        claims.find((c) => c.reference === where.reference) ?? null,
      findFirst: async () => claims.find((c) => c.state === "open") ?? null,
      create: async ({ data }: any) => {
        const c = { id: "claim", state: "open", ...data };
        claims.push(c);
        return c;
      },
    },
    orderStatusEvent: { create: async ({ data }: any) => events.push(data) },
  };
  return {
    allocation,
    claims,
    events,
    db,
    input: {
      allocationId: "allocation",
      reference: "ref",
      issue: "Broken screen",
    },
  };
}
it("warranty ownership is the purchase, not knowledge of a serial", async () => {
  const h = warrantyHarness();
  await expect(
    openWarrantyClaim(h.db, h.input, "other", "other"),
  ).rejects.toThrow("not found");
  expect(h.claims).toHaveLength(0);
  await openWarrantyClaim(h.db, h.input, "customer", "customer");
  await openWarrantyClaim(h.db, h.input, "customer", "customer");
  expect(h.claims).toHaveLength(1);
  expect(h.events).toHaveLength(1);
  await expect(
    openWarrantyClaim(
      h.db,
      { ...h.input, issue: "Different" },
      "customer",
      "customer",
    ),
  ).rejects.toThrow("different evidence");
});
it.each(["expired", "food", "returned", "refund", "undelivered"])(
  "warranty rejects %s purchase",
  async (reason) => {
    const h = warrantyHarness();
    const l = h.allocation.lineItem;
    if (reason === "expired") l.order.deliveredAt = new Date(0);
    if (reason === "food") l.fulfillmentKind = "packaged_food";
    if (reason === "returned") h.allocation.state = "returned";
    if (reason === "refund") l.order.paymentStatus = "refunded";
    if (reason === "undelivered") l.order.deliveredAt = null;
    await expect(
      openWarrantyClaim(h.db, h.input, "customer", "customer"),
    ).rejects.toThrow("not eligible");
    expect(h.claims).toHaveLength(0);
  },
);
it("a second open warranty claim is rejected without credit/refund/stock side effects", async () => {
  const h = warrantyHarness();
  await openWarrantyClaim(h.db, h.input, "customer", "customer");
  await expect(
    openWarrantyClaim(
      h.db,
      { ...h.input, reference: "new-ref" },
      "customer",
      "customer",
    ),
  ).rejects.toThrow("already has an open");
  expect(h.claims).toHaveLength(1);
});

it("registration identifies an existing unit without increasing stock", async () => {
  const create = mock(async ({ data }: any) => ({ id: "registered", ...data }));
  const db: any = {
    productVariant: {
      findUnique: async () => ({
        product: {
          category: { fulfillmentKind: "gadget", serialTracking: "serial" },
        },
      }),
    },
    inventoryStock: {
      findMany: async () => [
        {
          batchId: null,
          batch: null,
          location: { isActive: true },
          quantityOnHand: 1,
          quantityReserved: 0,
        },
      ],
    },
    inventoryUnit: { count: async () => 0, create },
  };
  const result = await registerUnit(
    db,
    { variantId: "variant", locationId: "location", serial: " sn-1 " },
    "operator",
  );
  expect(result.serial).toBe("SN-1");
  expect(result.registeredByUserId).toBe("operator");
  expect(create).toHaveBeenCalledTimes(1);
});
it("positive assignment and correction retain allocation history", async () => {
  const { unassignUnit } =
    await import("../src/modules/ecommerce/niche/gadgets");
  const l = line();
  const u: any = unit();
  const allocations: any[] = [];
  const events: any[] = [];
  const db: any = {
    orderLineItem: {
      findFirst: async () => ({
        ...l,
        units: u.lineItemId === l.id ? [u] : [],
      }),
    },
    inventoryUnit: {
      findUnique: async () => structuredClone(u),
      findFirst: async () => ({ ...u, lineItem: l }),
      count: async () => (u.state === "assigned" ? 1 : 0),
      updateMany: async ({ where, data }: any) => {
        if (u.state !== where.state || u.lineItemId !== where.lineItemId)
          return { count: 0 };
        Object.assign(u, data);
        return { count: 1 };
      },
    },
    stockReservation: { findMany: async () => [{ quantity: 1 }] },
    unitAllocation: {
      upsert: async ({ create, update }: any) => {
        const a = allocations.find(
          (a) =>
            a.unitId === create.unitId && a.lineItemId === create.lineItemId,
        );
        if (a) Object.assign(a, update);
        else allocations.push({ ...create, state: "assigned" });
      },
      update: async ({ data }: any) => Object.assign(allocations[0], data),
    },
    orderStatusEvent: { create: async ({ data }: any) => events.push(data) },
  };
  await assignUnit(db, "order", "line", "unit-1", "operator");
  expect(u.state).toBe("assigned");
  expect(u.lineItemId).toBe("line");
  expect(allocations).toHaveLength(1);
  await assignUnit(db, "order", "line", "unit-1", "operator");
  expect(events).toHaveLength(1);
  await unassignUnit(db, "order", "unit-1", "operator");
  expect(u.state).toBe("available");
  expect(u.lineItemId).toBeNull();
  expect(allocations[0].state).toBe("released");
  expect(events).toHaveLength(2);
  await assignUnit(db, "order", "line", "unit-1", "operator");
  expect(allocations).toHaveLength(1);
  expect(allocations[0].state).toBe("assigned");
});
it("unit assignment contention gives one owner and one purchase allocation", async () => {
  const u: any = unit();
  const allocations: any[] = [];
  const events: any[] = [];
  const db: any = {
    orderLineItem: {
      findFirst: async ({ where }: any) => ({
        ...line(),
        id: where.id,
        orderId: where.orderId,
      }),
    },
    inventoryUnit: {
      findUnique: async () => structuredClone(u),
      count: async () => 0,
      updateMany: async ({ data }: any) => {
        if (u.state !== "available") return { count: 0 };
        Object.assign(u, data);
        return { count: 1 };
      },
    },
    stockReservation: { findMany: async () => [{ quantity: 1 }] },
    unitAllocation: {
      upsert: async ({ create }: any) => allocations.push(create),
    },
    orderStatusEvent: { create: async ({ data }: any) => events.push(data) },
  };
  const results = await Promise.allSettled([
    assignUnit(db, "order-A", "line-A", "unit-1", "operator"),
    assignUnit(db, "order-B", "line-B", "unit-1", "operator"),
  ]);
  expect(
    results.filter((result) => result.status === "fulfilled"),
  ).toHaveLength(1);
  expect(allocations).toHaveLength(1);
  expect(events).toHaveLength(1);
});
it("uncertain/shipped unit cannot be unassigned", async () => {
  const { unassignUnit } =
    await import("../src/modules/ecommerce/niche/gadgets");
  const update = mock(async () => ({ count: 1 }));
  const db: any = {
    inventoryUnit: {
      findFirst: async () => ({
        ...unit(),
        state: "shipped",
        lineItem: line(),
      }),
      updateMany: update,
    },
  };
  await expect(unassignUnit(db, "order", "unit-1", "operator")).rejects.toThrow(
    "Only unshipped",
  );
  expect(update).not.toHaveBeenCalled();
});
it("slot selection is mandatory only for fresh items", async () => {
  await reserveFoodSlot({} as any, { orderId: "order", quantity: 0 });
  await expect(
    reserveFoodSlot({} as any, {
      orderId: "order",
      quantity: 0,
      slotId: "slot",
    }),
  ).rejects.toThrow("only for fresh");
  await expect(
    reserveFoodSlot({} as any, { orderId: "order", quantity: 1 }),
  ).rejects.toThrow("Choose a delivery slot");
});
