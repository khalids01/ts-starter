import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import {
  assertTestEnvironment,
  printValidatedTestEnvironment,
} from "../setup/assert-test-environment";

// Validate before importing any DB/env/service module or registering teardown.
const validatedTarget = assertTestEnvironment();
if (validatedTarget.isRemote)
  throw new Error("Step 10 requires a dedicated local test database");
const { default: prisma } = await import("../../packages/db/src/client.server");
const { orderService } =
  await import("../../apps/server/src/modules/shop/services/order.service");
const { STORE_SETTINGS_ID, storeSettingsService } =
  await import("../../apps/server/src/modules/ecommerce/store-settings/store-settings.service");
const { adminOrdersService } =
  await import("../../apps/server/src/modules/admin/orders/orders.service");
const { orderOperationsService } =
  await import("../../apps/server/src/modules/admin/orders/order-operations.service");
const { orderRecoveryService } =
  await import("../../apps/server/src/modules/admin/orders/order-recovery.service");
const { orderPaymentsService } =
  await import("../../apps/server/src/modules/admin/orders/order-payments.service");
const { reserveFoodSlot, cancelFoodBooking } =
  await import("../../apps/server/src/modules/ecommerce/niche/food");
const { orderMoney } =
  await import("../../apps/server/src/modules/ecommerce/orders/payment-accounting");
const { CourierDispatchWorker } =
  await import("../../apps/server/src/modules/delivery/dispatch-worker");
const { courierRequestSnapshot } =
  await import("../../apps/server/src/modules/delivery/dispatch-snapshot");
const { createPeerClient, fakeWorkerDependencies } =
  await import("./fixtures/courier-worker");
const peer = createPeerClient();
let setupStarted = false;
let settingsLoaded = false;
const orderIds: string[] = [];
let providerId = "",
  connectionId = "",
  serviceId = "";
const slotIds: string[] = [];

const runId = crypto.randomUUID();
const marker = `v3-step10-${runId}`;
const email = `${marker}@northstar.example.test`;
const rollbackEmail = `${marker}-rollback@northstar.example.test`;
const userIds = [`${marker}-user-a`, `${marker}-user-b`] as const;
const categorySlug = `${marker}-category`;
const productSlug = `${marker}-product`;
const locationCode = `${marker}-location`;
const shippingCode = `${marker}-shipping`;
const discountCode = `${marker}-once`.toUpperCase();
const variantSkus = {
  lastItem: `${marker}-last-item`,
  idempotency: `${marker}-idempotency`,
  discount: `${marker}-discount`,
  rollback: `${marker}-rollback`,
  recovery: `${marker}-recovery`,
  money: `${marker}-money`,
  expiry: `${marker}-expiry`,
  claim: `${marker}-claim`,
  cancel: `${marker}-cancel`,
  workers: `${marker}-workers`,
  inflight: `${marker}-inflight`,
  crash: `${marker}-crash`,
};

let originalSettings: Awaited<
  ReturnType<typeof prisma.storeSettings.findUnique>
>;
let productId = "";
let locationId = "";
let shippingRateId = "";
let discountId = "";
const variantIds: Record<keyof typeof variantSkus, string> = {
  lastItem: "",
  idempotency: "",
  discount: "",
  rollback: "",
  recovery: "",
  money: "",
  expiry: "",
  claim: "",
  cancel: "",
  workers: "",
  inflight: "",
  crash: "",
};

function checkoutInput(
  variantId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    items: [{ variantId, quantity: 1 }],
    customerName: "Step 8 Customer",
    customerEmail: `${marker}-customer@northstar.example.test`,
    customerPhone: "+8801700000000",
    shippingAddress: {
      fullName: "Step 8 Customer",
      email: `${marker}-customer@northstar.example.test`,
      phone: "+8801700000000",
      line1: "1 Test Avenue",
      city: "Dhaka",
      postalCode: "1205",
      country: "Bangladesh",
    },
    shippingRateId,
    paymentMethod: "cash_on_delivery" as const,
    ...overrides,
  };
}

describe("ecommerce real PostgreSQL invariants", () => {
  beforeAll(async () => {
    printValidatedTestEnvironment(validatedTarget);
    setupStarted = true;
    originalSettings = await prisma.storeSettings.findUnique({
      where: { id: STORE_SETTINGS_ID },
    });
    settingsLoaded = true;
    await storeSettingsService.update({
      storeName: "Step 8 Test Store",
      supportEmail: null,
      supportPhone: null,
      defaultCurrency: "BDT",
      orderNumberPrefix: "E2E",
      reservationDurationMinutes: 30,
      checkoutEnabled: true,
      checkoutNotice: null,
    });
    await prisma.user.createMany({
      data: userIds.map((id, index) => ({
        id,
        name: `Step 8 User ${index + 1}`,
        email: `${marker}-user-${index + 1}@northstar.example.test`,
        emailVerified: true,
      })),
    });
    const category = await prisma.category.create({
      data: { name: "Step 8 Category", slug: categorySlug },
    });
    const product = await prisma.product.create({
      data: {
        name: "Step 8 Product",
        slug: productSlug,
        categoryId: category.id,
        status: "active",
        isActive: true,
      },
    });
    productId = product.id;
    for (const [key, sku] of Object.entries(variantSkus) as [
      keyof typeof variantSkus,
      string,
    ][]) {
      const variant = await prisma.productVariant.create({
        data: {
          productId,
          sku,
          name: key,
          price: "100.00",
          currency: "BDT",
          isDefault: key === "lastItem",
          isActive: true,
        },
      });
      variantIds[key] = variant.id;
    }
    const location = await prisma.inventoryLocation.create({
      data: { name: "Step 8 Location", code: locationCode },
    });
    locationId = location.id;
    await prisma.inventoryStock.createMany({
      data: [
        {
          stockKey: `${variantIds.lastItem}:${locationId}:none`,
          variantId: variantIds.lastItem,
          locationId,
          quantityOnHand: 1,
        },
        {
          stockKey: `${variantIds.idempotency}:${locationId}:none`,
          variantId: variantIds.idempotency,
          locationId,
          quantityOnHand: 4,
        },
        {
          stockKey: `${variantIds.discount}:${locationId}:none`,
          variantId: variantIds.discount,
          locationId,
          quantityOnHand: 4,
        },
        {
          stockKey: `${variantIds.rollback}:${locationId}:none`,
          variantId: variantIds.rollback,
          locationId,
          quantityOnHand: 1,
        },
      ],
    });
    await prisma.inventoryStock.createMany({
      data: [
        "recovery",
        "money",
        "claim",
        "cancel",
        "workers",
        "inflight",
        "crash",
      ].map((key) => ({
        stockKey: `${variantIds[key as keyof typeof variantIds]}:${locationId}:none`,
        variantId: variantIds[key as keyof typeof variantIds],
        locationId,
        quantityOnHand: 2,
      })),
    });
    const provider = await prisma.courierProvider.create({
      data: {
        code: `v3_${runId.replaceAll("-", "")}`,
        displayName: "Fictional local adapter",
        capabilities: ["createConsignment"],
      },
    });
    providerId = provider.id;
    const connection = await prisma.courierConnection.create({
      data: {
        providerId,
        publicId: marker,
        displayName: "Fictional connection",
        enabled: true,
        healthState: "healthy",
        environment: "test",
        credentialSource: "server_environment",
      },
    });
    connectionId = connection.id;
    const service = await prisma.courierService.create({
      data: {
        connectionId,
        code: "fictional",
        displayName: "Fictional parcel",
        enabled: true,
      },
    });
    serviceId = service.id;
    const shipping = await prisma.shippingRate.create({
      data: {
        code: shippingCode,
        label: "Step 8 Shipping",
        amount: "10.00",
        currency: "BDT",
        isDefault: true,
      },
    });
    shippingRateId = shipping.id;
    const discount = await prisma.discountCode.create({
      data: {
        code: discountCode,
        description: "Single use concurrency probe",
        type: "fixed_amount",
        value: "10.00",
        currency: "BDT",
        totalUsageLimit: 1,
        isActive: true,
      },
    });
    discountId = discount.id;
  });

  afterAll(async () => {
    if (!setupStarted) return;
    // Delete only this run's owned courier rows before restrictive order FKs.
    const consignments = { consignment: { connectionId } };
    if (connectionId) {
      await prisma.courierException.deleteMany({ where: consignments });
      await prisma.courierEvent.deleteMany({ where: consignments });
      await prisma.courierOperation.deleteMany({ where: consignments });
      await prisma.courierShipmentClaim.deleteMany({
        where: { orderId: { in: orderIds } },
      });
      await prisma.courierConsignment.deleteMany({ where: { connectionId } });
      await prisma.courierDispatch.deleteMany({ where: { connectionId } });
      await prisma.courierService.deleteMany({ where: { connectionId } });
      await prisma.courierConnection.deleteMany({
        where: { id: connectionId },
      });
    }
    if (providerId)
      await prisma.courierProvider.deleteMany({ where: { id: providerId } });
    await prisma.foodOrderBooking.deleteMany({
      where: { slotId: { in: slotIds } },
    });
    await prisma.foodDeliverySlot.deleteMany({
      where: { id: { in: slotIds } },
    });
    await prisma.inventoryUnit.deleteMany({
      where: { variantId: { in: Object.values(variantIds) } },
    });
    await prisma.orderPayment.deleteMany({
      where: { orderId: { in: orderIds } },
    });
    await prisma.orderRecovery.deleteMany({
      where: { orderId: { in: orderIds } },
    });
    await prisma.order.deleteMany({
      where: {
        orderNumber: { startsWith: "E2E-" },
        userId: { in: [...userIds] },
      },
    });
    await prisma.discountCode.deleteMany({ where: { id: discountId } });
    await prisma.stockReservation.deleteMany({
      where: { variantId: { in: Object.values(variantIds) } },
    });
    await prisma.inventoryMovement.deleteMany({
      where: { variantId: { in: Object.values(variantIds) } },
    });
    await prisma.inventoryStock.deleteMany({
      where: { variantId: { in: Object.values(variantIds) } },
    });
    await prisma.inventoryBatch.deleteMany({
      where: { variantId: { in: Object.values(variantIds) } },
    });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.category.deleteMany({ where: { slug: categorySlug } });
    await prisma.inventoryLocation.deleteMany({ where: { id: locationId } });
    await prisma.shippingRate.deleteMany({ where: { id: shippingRateId } });
    await prisma.ecommerceCustomer.deleteMany({
      where: { normalizedEmail: { startsWith: marker } },
    });
    await prisma.user.deleteMany({ where: { id: { in: [...userIds] } } });
    if (settingsLoaded && originalSettings) {
      await prisma.storeSettings.update({
        where: { id: STORE_SETTINGS_ID },
        data: {
          storeName: originalSettings.storeName,
          supportEmail: originalSettings.supportEmail,
          supportPhone: originalSettings.supportPhone,
          defaultCurrency: originalSettings.defaultCurrency,
          orderNumberPrefix: originalSettings.orderNumberPrefix,
          reservationDurationMinutes:
            originalSettings.reservationDurationMinutes,
          checkoutEnabled: originalSettings.checkoutEnabled,
          checkoutNotice: originalSettings.checkoutNotice,
        },
      });
    } else if (settingsLoaded) {
      await prisma.storeSettings.deleteMany({
        where: { id: STORE_SETTINGS_ID },
      });
    }
    storeSettingsService.clearCache();
    await Promise.all([prisma.$disconnect(), peer.$disconnect()]);
  });

  it("enforces normalized customer email uniqueness under concurrent writes", async () => {
    const writes = await Promise.allSettled([
      prisma.ecommerceCustomer.create({
        data: { name: "Concurrency One", email, normalizedEmail: email },
      }),
      prisma.ecommerceCustomer.create({
        data: {
          name: "Concurrency Two",
          email: email.toUpperCase(),
          normalizedEmail: email,
        },
      }),
    ]);
    expect(writes.filter(({ status }) => status === "fulfilled")).toHaveLength(
      1,
    );
    expect(writes.filter(({ status }) => status === "rejected")).toHaveLength(
      1,
    );
    expect(
      await prisma.ecommerceCustomer.count({
        where: { normalizedEmail: email },
      }),
    ).toBe(1);
  });

  it("rolls back all writes when a transaction fails", async () => {
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.ecommerceCustomer.create({
          data: {
            name: "Rollback",
            email: rollbackEmail,
            normalizedEmail: rollbackEmail,
          },
        });
        throw new Error("intentional rollback probe");
      }),
    ).rejects.toThrow("intentional rollback probe");
    expect(
      await prisma.ecommerceCustomer.count({
        where: { normalizedEmail: rollbackEmail },
      }),
    ).toBe(0);
  });

  it("allows only one concurrent checkout to reserve the last item", async () => {
    const attempts = await Promise.allSettled([
      orderService.checkout(
        userIds[0],
        checkoutInput(variantIds.lastItem, {
          idempotencyKey: `${marker}-last-a`,
        }),
      ),
      orderService.checkout(
        userIds[1],
        checkoutInput(variantIds.lastItem, {
          idempotencyKey: `${marker}-last-b`,
        }),
      ),
    ]);
    expect(
      attempts.filter(({ status }) => status === "fulfilled"),
    ).toHaveLength(1);
    expect(attempts.filter(({ status }) => status === "rejected")).toHaveLength(
      1,
    );
    expect(
      (
        await prisma.inventoryStock.findFirstOrThrow({
          where: { variantId: variantIds.lastItem },
        })
      ).quantityReserved,
    ).toBe(1);
  });

  it("returns one order for concurrent duplicate idempotency keys", async () => {
    const key = `${marker}-same-checkout`;
    const attempts = await Promise.all([
      orderService.checkout(
        userIds[0],
        checkoutInput(variantIds.idempotency, { idempotencyKey: key }),
      ),
      orderService.checkout(
        userIds[0],
        checkoutInput(variantIds.idempotency, { idempotencyKey: key }),
      ),
    ]);
    expect(new Set(attempts.map(({ orderId }) => orderId)).size).toBe(1);
    expect(
      await prisma.order.count({
        where: { checkoutKey: `${userIds[0]}:${key}` },
      }),
    ).toBe(1);
  });

  it("does not let concurrent discount redemptions cross the total limit", async () => {
    const attempts = await Promise.allSettled([
      orderService.checkout(
        userIds[0],
        checkoutInput(variantIds.discount, {
          discountCode,
          idempotencyKey: `${marker}-discount-a`,
        }),
      ),
      orderService.checkout(
        userIds[1],
        checkoutInput(variantIds.discount, {
          discountCode,
          idempotencyKey: `${marker}-discount-b`,
        }),
      ),
    ]);
    expect(
      attempts.filter(({ status }) => status === "fulfilled"),
    ).toHaveLength(1);
    expect(attempts.filter(({ status }) => status === "rejected")).toHaveLength(
      1,
    );
    expect(
      await prisma.discountRedemption.count({
        where: { discountCodeId: discountId },
      }),
    ).toBe(1);
    expect(
      (
        await prisma.discountCode.findUniqueOrThrow({
          where: { id: discountId },
        })
      ).usageCount,
    ).toBe(1);
  });

  it("rolls back customer, order, and stock changes when checkout fails", async () => {
    const failedEmail = `${marker}-failed@northstar.example.test`;
    await expect(
      orderService.checkout(
        userIds[1],
        checkoutInput(variantIds.rollback, {
          customerEmail: failedEmail,
          shippingAddress: { line1: "1 Test Avenue", email: failedEmail },
          discountCode: `${marker}-missing`,
          idempotencyKey: `${marker}-rollback-checkout`,
        }),
      ),
    ).rejects.toThrow();
    expect(
      await prisma.order.count({
        where: { checkoutKey: `${userIds[1]}:${marker}-rollback-checkout` },
      }),
    ).toBe(0);
    expect(
      await prisma.ecommerceCustomer.count({
        where: { normalizedEmail: failedEmail },
      }),
    ).toBe(0);
    expect(
      (
        await prisma.inventoryStock.findFirstOrThrow({
          where: { variantId: variantIds.rollback },
        })
      ).quantityReserved,
    ).toBe(0);
  });

  async function newOrder(key: keyof typeof variantIds, committed = true) {
    const result = await orderService.checkout(
      userIds[0],
      checkoutInput(variantIds[key], {
        idempotencyKey: `${marker}-${key}-${crypto.randomUUID()}`,
      }),
    );
    orderIds.push(result.orderId);
    if (committed)
      await adminOrdersService.updateOrderStatuses(
        result.orderId,
        { orderStatus: "confirmed" },
        { userId: userIds[0] },
      );
    return result.orderId;
  }
  async function queuedOrder(key: keyof typeof variantIds) {
    const id = await newOrder(key);
    const order = await prisma.order.findUniqueOrThrow({
      where: { id },
      include: { addresses: true, payments: true, refunds: true },
    });
    const snapshot = courierRequestSnapshot(order);
    const dispatch = await prisma.courierDispatch.create({
      data: {
        orderId: id,
        connectionId,
        serviceId,
        routingSnapshot: snapshot,
        confirmedByUserId: userIds[0],
        status: "queued",
      },
    });
    await prisma.courierShipmentClaim.create({
      data: { orderId: id, dispatchId: dispatch.id },
    });
    const consignment = await prisma.courierConsignment.create({
      data: {
        orderId: id,
        dispatchId: dispatch.id,
        connectionId,
        serviceId,
        invoice: snapshot.invoice,
        codAmount: snapshot.codAmount,
        currency: snapshot.currency,
        requestSnapshot: snapshot,
        operations: {
          create: { kind: "create", identity: `create:${dispatch.id}` },
        },
      },
    });
    return { id, dispatch, consignment };
  }

  it("keeps one active shipment claim across independent database clients", async () => {
    const id = await newOrder("claim");
    const dispatches = await Promise.all(
      [prisma, peer].map((db) =>
        db.courierDispatch.create({
          data: {
            orderId: id,
            connectionId,
            serviceId,
            routingSnapshot: {},
            confirmedByUserId: userIds[0],
          },
        }),
      ),
    );
    const results = await Promise.allSettled(
      [prisma, peer].map((db, i) =>
        db.courierShipmentClaim.create({
          data: { orderId: id, dispatchId: dispatches[i]!.id },
        }),
      ),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find(
      (r) => r.status === "rejected",
    ) as PromiseRejectedResult;
    expect(rejected.reason.code).toBe("P2002");
    expect(
      await peer.courierShipmentClaim.count({ where: { orderId: id } }),
    ).toBe(1);
  });

  it("restocks physically received sellable goods exactly once under concurrent actions", async () => {
    const id = await newOrder("recovery");
    await orderOperationsService.cancelOrder(
      id,
      { reason: "Fictional return" },
      { userId: userIds[0], canRestock: false },
    );
    await orderRecoveryService.receive(
      id,
      { allItemsReceived: true, note: "Fictional full receipt" },
      userIds[0],
    );
    await orderRecoveryService.inspect(
      id,
      { disposition: "sellable", note: "Fictional inspection" },
      userIds[0],
    );
    const before = await peer.inventoryStock.findFirstOrThrow({
      where: { variantId: variantIds.recovery },
    });
    const results = await Promise.allSettled([
      orderRecoveryService.restock(id, "Fictional restock A", userIds[0]),
      orderRecoveryService.restock(id, "Fictional restock B", userIds[1]),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
    const after = await peer.inventoryStock.findUniqueOrThrow({
      where: { id: before.id },
    });
    expect(after.quantityOnHand).toBe(before.quantityOnHand + 1);
    expect(
      (await peer.order.findUniqueOrThrow({ where: { id } })).inventoryStatus,
    ).toBe("restocked");
    expect(
      (await peer.orderRecovery.findUniqueOrThrow({ where: { orderId: id } }))
        .restockedAt,
    ).not.toBeNull();
  });

  it("records one deposit for concurrent duplicate collection evidence and preserves exact balance", async () => {
    const id = await newOrder("money");
    const input = {
      amount: "30.00",
      currency: "BDT",
      method: "manual_bank" as const,
      reference: `${marker}-deposit`,
      note: "Fictional bank receipt",
    };
    const results = await Promise.allSettled([
      orderPaymentsService.receive(id, input, userIds[0]),
      orderPaymentsService.receive(id, input, userIds[1]),
    ]);
    expect(results.some((r) => r.status === "fulfilled")).toBe(true);
    // A concurrent unique/serialization loser may fail; an explicit replay must succeed.
    await orderPaymentsService.receive(id, input, userIds[0]);
    const order = await peer.order.findUniqueOrThrow({
      where: { id },
      include: { payments: true, refunds: true },
    });
    expect(order.payments).toHaveLength(1);
    expect(order.paymentStatus).toBe("partially_paid");
    expect(orderMoney(order).outstanding).toBe(8000n);
    const refunds = await Promise.allSettled([
      orderOperationsService.recordRefund(
        id,
        {
          amount: "20.00",
          reason: "Fictional concurrent refund A",
          restockInventory: false,
        },
        { userId: userIds[0] },
      ),
      orderOperationsService.recordRefund(
        id,
        {
          amount: "20.00",
          reason: "Fictional concurrent refund B",
          restockInventory: false,
        },
        { userId: userIds[1] },
      ),
    ]);
    expect(refunds.filter((row) => row.status === "fulfilled")).toHaveLength(1);
    expect(refunds.filter((row) => row.status === "rejected")).toHaveLength(1);
    const refunded = await peer.order.findUniqueOrThrow({
      where: { id },
      include: { payments: true, refunds: true },
    });
    expect(refunded.refunds).toHaveLength(1);
    expect(orderMoney(refunded).refunded).toBe(2000n);
    expect(orderMoney(refunded).netReceived).toBe(1000n);
    expect(orderMoney(refunded).outstanding).toBe(8000n);
    expect(refunded.inventoryStatus).toBe("committed");
  });

  it("uses FEFO sellable stock and rolls commitment back if its reserved batch expires", async () => {
    const now = Date.now();
    for (const [code, expiry, disposition] of [
      ["expired", now - 60000, "sellable"],
      ["unsafe", now + 3600000, "unsafe"],
      ["early", now + 1800000, "sellable"],
      ["late", now + 7200000, "sellable"],
    ] as const) {
      const batch = await prisma.inventoryBatch.create({
        data: {
          variantId: variantIds.expiry,
          batchNumber: `${marker}-${code}`,
          expiryDate: new Date(expiry),
          disposition,
        },
      });
      await prisma.inventoryStock.create({
        data: {
          variantId: variantIds.expiry,
          locationId,
          batchId: batch.id,
          stockKey: `${variantIds.expiry}:${locationId}:${batch.id}`,
          quantityOnHand: 1,
        },
      });
    }
    const id = await newOrder("expiry", false);
    const reservation = await peer.stockReservation.findFirstOrThrow({
      where: { referenceType: "order", referenceId: id },
      include: { batch: true },
    });
    expect(reservation.batch!.batchNumber).toBe(`${marker}-early`);
    await prisma.inventoryBatch.update({
      where: { id: reservation.batchId! },
      data: { expiryDate: new Date(now - 1000) },
    });
    await expect(
      adminOrdersService.updateOrderStatuses(
        id,
        { orderStatus: "confirmed" },
        { userId: userIds[0] },
      ),
    ).rejects.toThrow();
    expect(
      (await peer.order.findUniqueOrThrow({ where: { id } })).inventoryStatus,
    ).toBe("reserved");
    expect(
      (
        await peer.inventoryStock.findFirstOrThrow({
          where: {
            variantId: reservation.variantId,
            locationId: reservation.locationId,
            batchId: reservation.batchId,
          },
        })
      ).quantityOnHand,
    ).toBe(1);
    expect(
      (
        await peer.stockReservation.findUniqueOrThrow({
          where: { id: reservation.id },
        })
      ).status,
    ).toBe("active");
  });

  it("cancellation wins before submission and releases an unattempted claim without calling a provider", async () => {
    const q = await queuedOrder("cancel");
    await orderOperationsService.cancelOrder(
      q.id,
      { reason: "Fictional pre-submit cancellation" },
      { userId: userIds[0], canRestock: true },
    );
    let calls = 0;
    await new CourierDispatchWorker(
      fakeWorkerDependencies(peer, connectionId, async (request) => {
        calls++;
        return {
          invoice: request.invoice,
          externalId: `fake-${request.invoice}`,
          trackingCode: null,
          providerState: "pending",
        };
      }),
    ).runOnce();
    expect(calls).toBe(0);
    expect(
      await peer.courierShipmentClaim.count({ where: { orderId: q.id } }),
    ).toBe(0);
    expect(
      (
        await peer.courierConsignment.findUniqueOrThrow({
          where: { id: q.consignment.id },
        })
      ).state,
    ).toBe("cancelled_before_submission");
    expect(
      (await peer.order.findUniqueOrThrow({ where: { id: q.id } }))
        .inventoryStatus,
    ).toBe("restocked");
  });

  it("cancellation during an external request keeps custody and accepts only the original result", async () => {
    const q = await queuedOrder("inflight");
    let entered!: () => void, release!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });
    let calls = 0;
    const worker = new CourierDispatchWorker(
      fakeWorkerDependencies(peer, connectionId, async (request) => {
        calls++;
        entered();
        await blocked;
        return {
          invoice: request.invoice,
          externalId: `fake-${request.invoice}`,
          trackingCode: null,
          providerState: "pending",
        };
      }),
    );
    const running = worker.runOnce();
    try {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          started,
          running.then(() => {
            throw new Error("Worker did not enter provider");
          }),
          new Promise<never>((_, reject) => {
            timer = setTimeout(
              () => reject(new Error("Provider entry timed out")),
              5000,
            );
          }),
        ]);
      } finally {
        if (timer) clearTimeout(timer);
      }
      const cancelled = await orderOperationsService.cancelOrder(
        q.id,
        { reason: "Fictional in-flight cancellation" },
        { userId: userIds[0], canRestock: true },
      );
      expect(cancelled.recoveryRequired).toBe(true);
      expect(
        (await prisma.order.findUniqueOrThrow({ where: { id: q.id } }))
          .inventoryStatus,
      ).toBe("committed");
    } finally {
      release();
      await running;
    }
    expect(calls).toBe(1);
    expect(
      (await prisma.order.findUniqueOrThrow({ where: { id: q.id } }))
        .orderStatus,
    ).toBe("cancelled");
    expect(
      await prisma.courierShipmentClaim.count({ where: { orderId: q.id } }),
    ).toBe(1);
    expect(
      (
        await prisma.courierConsignment.findUniqueOrThrow({
          where: { id: q.consignment.id },
        })
      ).externalId,
    ).toBe(`fake-${q.consignment.invoice}`);
  });

  it("recovers a crashed expired lease before create and rejects completion by the old token", async () => {
    const q = await queuedOrder("crash");
    const past = new Date(Date.now() - 1000);
    await prisma.courierOperation.updateMany({
      where: { consignmentId: q.consignment.id },
      data: {
        state: "processing",
        attemptCount: 1,
        leaseToken: "dead-worker-token",
        leaseUntil: past,
      },
    });
    await prisma.courierConnection.update({
      where: { id: connectionId },
      data: {
        dispatchLeaseToken: "dead-worker-token",
        dispatchLeaseUntil: past,
      },
    });
    let creates = 0,
      recoveries = 0;
    const result = {
      invoice: q.consignment.invoice,
      externalId: `fake-${q.consignment.invoice}`,
      trackingCode: null,
      providerState: "pending",
    };
    await new CourierDispatchWorker(
      fakeWorkerDependencies(
        peer,
        connectionId,
        async () => {
          creates++;
          throw new Error("Must recover before any new create");
        },
        async (invoice) => {
          recoveries++;
          expect(invoice).toBe(q.consignment.invoice);
          return { kind: "found", consignment: result };
        },
      ),
    ).runOnce();
    expect(creates).toBe(0);
    expect(recoveries).toBe(1);
    expect(
      (
        await prisma.courierConsignment.findUniqueOrThrow({
          where: { id: q.consignment.id },
        })
      ).externalId,
    ).toBe(result.externalId);
    const stale = await prisma.courierOperation.updateMany({
      where: {
        consignmentId: q.consignment.id,
        state: "processing",
        leaseToken: "dead-worker-token",
      },
      data: { state: "retry" },
    });
    expect(stale.count).toBe(0);
    expect(
      (
        await prisma.courierOperation.findFirstOrThrow({
          where: { consignmentId: q.consignment.id },
        })
      ).attemptCount,
    ).toBe(2);
  });

  it("last fresh-food slot capacity is atomic and cancellation releases it once", async () => {
    const ids = await Promise.all([
      newOrder("idempotency", false),
      newOrder("discount", false),
    ]);
    const now = Date.now();
    const slot = await prisma.foodDeliverySlot.create({
      data: {
        label: `${marker}-slot`,
        postalCodes: ["1205"],
        capacityUnits: 1,
        cutoffAt: new Date(now + 3600000),
        startsAt: new Date(now + 7200000),
        endsAt: new Date(now + 10800000),
      },
    });
    slotIds.push(slot.id);
    const results = await Promise.allSettled(
      [prisma, peer].map((db, index) =>
        db.$transaction(
          (tx) =>
            reserveFoodSlot(tx, {
              orderId: ids[index]!,
              slotId: slot.id,
              postalCode: "1205",
              quantity: 1,
            }),
          { isolationLevel: "Serializable" },
        ),
      ),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(
      (
        await peer.foodDeliverySlot.findUniqueOrThrow({
          where: { id: slot.id },
        })
      ).reservedUnits,
    ).toBe(1);
    const booking = await prisma.foodOrderBooking.findFirstOrThrow({
      where: { slotId: slot.id },
    });
    await prisma.$transaction((tx) => cancelFoodBooking(tx, booking.orderId), {
      isolationLevel: "Serializable",
    });
    await peer.$transaction((tx) => cancelFoodBooking(tx, booking.orderId), {
      isolationLevel: "Serializable",
    });
    expect(
      (
        await prisma.foodDeliverySlot.findUniqueOrThrow({
          where: { id: slot.id },
        })
      ).reservedUnits,
    ).toBe(0);
  });

  it("serial and IMEI database uniqueness reject competing registrations", async () => {
    for (const field of ["serial", "imei"] as const) {
      const identity =
        field === "serial"
          ? `${marker}-serial`
          : (
              crypto.getRandomValues(new BigUint64Array(1))[0]! %
              1000000000000000n
            )
              .toString()
              .padStart(15, "0");
      const results = await Promise.allSettled(
        [prisma, peer].map((db) =>
          db.inventoryUnit.create({
            data: {
              variantId: variantIds.claim,
              locationId,
              registeredByUserId: userIds[0],
              [field]: identity,
            },
          }),
        ),
      );
      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      const rejected = results.find(
        (r) => r.status === "rejected",
      ) as PromiseRejectedResult;
      expect(rejected.reason.code).toBe("P2002");
    }
  });

  it("two separate worker processes submit the original operation once and a fresh client sees the persisted result", async () => {
    const q = await queuedOrder("workers");
    const ready: Promise<void>[] = [];
    const children = [0, 1].map(() => {
      let signal!: () => void;
      ready.push(
        new Promise<void>((resolve) => {
          signal = resolve;
        }),
      );
      return Bun.spawn(
        [
          process.execPath,
          "tests/integration/fixtures/courier-worker.ts",
          connectionId,
        ],
        {
          cwd: process.cwd(),
          env: { ...process.env },
          stdout: "pipe",
          stderr: "pipe",
          ipc: (message) => {
            if (message?.type === "ready") signal();
          },
        },
      );
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        Promise.all(ready),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error("Worker startup barrier timed out")),
            15000,
          );
        }),
      ]);
    } catch (error) {
      for (const child of children) child.kill();
      await Promise.all(children.map((child) => child.exited));
      throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
    // Both independently initialized processes reach this barrier before either may acquire a lease.
    for (const child of children) child.send({ type: "go" });
    const watchdog = setTimeout(() => {
      for (const child of children) child.kill();
    }, 20000);
    let outputs: { calls: number }[];
    try {
      outputs = await Promise.all(
        children.map(async (child) => {
          const [exit, stdout] = await Promise.all([
            child.exited,
            new Response(child.stdout).text(),
            new Response(child.stderr).text(),
          ]);
          if (exit !== 0)
            throw new Error(
              "Isolated worker probe failed; inspect sanitized fixture output",
            );
          const result = stdout
            .split("\n")
            .find((line) => line.startsWith("V3_WORKER_RESULT "));
          if (!result) throw new Error("Worker probe did not emit its result");
          return JSON.parse(result.slice("V3_WORKER_RESULT ".length)) as {
            calls: number;
          };
        }),
      );
    } finally {
      clearTimeout(watchdog);
      for (const child of children) {
        if (child.exitCode === null) child.kill();
      }
      await Promise.all(children.map((child) => child.exited));
    }
    expect(outputs.reduce((sum, row) => sum + row.calls, 0)).toBe(1);
    const restarted = createPeerClient();
    try {
      expect(
        (
          await restarted.courierConsignment.findUniqueOrThrow({
            where: { id: q.consignment.id },
          })
        ).externalId,
      ).toBe(`fake-${q.consignment.invoice}`);
      expect(
        (
          await restarted.courierOperation.findFirstOrThrow({
            where: { consignmentId: q.consignment.id },
          })
        ).state,
      ).toBe("completed");
      expect(
        await restarted.courierShipmentClaim.count({
          where: { orderId: q.id },
        }),
      ).toBe(1);
    } finally {
      await restarted.$disconnect();
    }
  }, 60000);
});
