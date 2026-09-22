import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import prisma from "../../packages/db/src/client.server";
import { orderService } from "../../apps/server/src/modules/shop/services/order.service";
import { STORE_SETTINGS_ID, storeSettingsService } from "../../apps/server/src/modules/ecommerce/store-settings/store-settings.service";
import { assertTestEnvironment, printValidatedTestEnvironment } from "../setup/assert-test-environment";

const runId = crypto.randomUUID();
const marker = `step82-${runId}`;
const email = `${marker}@northstar.example.test`;
const rollbackEmail = `${marker}-rollback@northstar.example.test`;
const userIds = [`${marker}-user-a`, `${marker}-user-b`];
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
};

let originalSettings: Awaited<ReturnType<typeof prisma.storeSettings.findUnique>>;
let productId = "";
let locationId = "";
let shippingRateId = "";
let discountId = "";
const variantIds: Record<keyof typeof variantSkus, string> = {
  lastItem: "", idempotency: "", discount: "", rollback: "",
};

function checkoutInput(variantId: string, overrides: Record<string, unknown> = {}) {
  return {
    items: [{ variantId, quantity: 1 }],
    customerName: "Step 8 Customer",
    customerEmail: `${marker}-customer@northstar.example.test`,
    customerPhone: "+8801700000000",
    shippingAddress: {
      fullName: "Step 8 Customer",
      email: `${marker}-customer@northstar.example.test`,
      phone: "+8801700000000",
      line1: "1 Test Avenue", city: "Dhaka", postalCode: "1205", country: "Bangladesh",
    },
    shippingRateId,
    paymentMethod: "cash_on_delivery" as const,
    ...overrides,
  };
}

describe("ecommerce real PostgreSQL invariants", () => {
  beforeAll(async () => {
    printValidatedTestEnvironment(assertTestEnvironment());
    originalSettings = await prisma.storeSettings.findUnique({ where: { id: STORE_SETTINGS_ID } });
    await storeSettingsService.update({
      storeName: "Step 8 Test Store", supportEmail: null, supportPhone: null,
      defaultCurrency: "BDT", orderNumberPrefix: "E2E", reservationDurationMinutes: 30,
      checkoutEnabled: true, checkoutNotice: null,
    });
    await prisma.user.createMany({
      data: userIds.map((id, index) => ({
        id, name: `Step 8 User ${index + 1}`,
        email: `${marker}-user-${index + 1}@northstar.example.test`, emailVerified: true,
      })),
    });
    const category = await prisma.category.create({ data: { name: "Step 8 Category", slug: categorySlug } });
    const product = await prisma.product.create({
      data: { name: "Step 8 Product", slug: productSlug, categoryId: category.id, status: "active", isActive: true },
    });
    productId = product.id;
    for (const [key, sku] of Object.entries(variantSkus) as [keyof typeof variantSkus, string][]) {
      const variant = await prisma.productVariant.create({
        data: { productId, sku, name: key, price: "100.00", currency: "BDT", isDefault: key === "lastItem", isActive: true },
      });
      variantIds[key] = variant.id;
    }
    const location = await prisma.inventoryLocation.create({ data: { name: "Step 8 Location", code: locationCode } });
    locationId = location.id;
    await prisma.inventoryStock.createMany({
      data: [
        { stockKey: `${variantIds.lastItem}:${locationId}:none`, variantId: variantIds.lastItem, locationId, quantityOnHand: 1 },
        { stockKey: `${variantIds.idempotency}:${locationId}:none`, variantId: variantIds.idempotency, locationId, quantityOnHand: 2 },
        { stockKey: `${variantIds.discount}:${locationId}:none`, variantId: variantIds.discount, locationId, quantityOnHand: 2 },
        { stockKey: `${variantIds.rollback}:${locationId}:none`, variantId: variantIds.rollback, locationId, quantityOnHand: 1 },
      ],
    });
    const shipping = await prisma.shippingRate.create({
      data: { code: shippingCode, label: "Step 8 Shipping", amount: "10.00", currency: "BDT", isDefault: true },
    });
    shippingRateId = shipping.id;
    const discount = await prisma.discountCode.create({
      data: { code: discountCode, description: "Single use concurrency probe", type: "fixed_amount", value: "10.00", currency: "BDT", totalUsageLimit: 1, isActive: true },
    });
    discountId = discount.id;
  });

  afterAll(async () => {
    await prisma.order.deleteMany({ where: { orderNumber: { startsWith: "E2E-" }, userId: { in: userIds } } });
    await prisma.discountCode.deleteMany({ where: { id: discountId } });
    await prisma.stockReservation.deleteMany({ where: { variantId: { in: Object.values(variantIds) } } });
    await prisma.inventoryMovement.deleteMany({ where: { variantId: { in: Object.values(variantIds) } } });
    await prisma.inventoryStock.deleteMany({ where: { variantId: { in: Object.values(variantIds) } } });
    await prisma.product.deleteMany({ where: { id: productId } });
    await prisma.category.deleteMany({ where: { slug: categorySlug } });
    await prisma.inventoryLocation.deleteMany({ where: { id: locationId } });
    await prisma.shippingRate.deleteMany({ where: { id: shippingRateId } });
    await prisma.ecommerceCustomer.deleteMany({ where: { normalizedEmail: { startsWith: marker } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    if (originalSettings) {
      await prisma.storeSettings.update({
        where: { id: STORE_SETTINGS_ID },
        data: {
          storeName: originalSettings.storeName, supportEmail: originalSettings.supportEmail,
          supportPhone: originalSettings.supportPhone, defaultCurrency: originalSettings.defaultCurrency,
          orderNumberPrefix: originalSettings.orderNumberPrefix,
          reservationDurationMinutes: originalSettings.reservationDurationMinutes,
          checkoutEnabled: originalSettings.checkoutEnabled, checkoutNotice: originalSettings.checkoutNotice,
        },
      });
    } else {
      await prisma.storeSettings.deleteMany({ where: { id: STORE_SETTINGS_ID } });
    }
    storeSettingsService.clearCache();
    await prisma.$disconnect();
  });

  it("enforces normalized customer email uniqueness under concurrent writes", async () => {
    const writes = await Promise.allSettled([
      prisma.ecommerceCustomer.create({ data: { name: "Concurrency One", email, normalizedEmail: email } }),
      prisma.ecommerceCustomer.create({ data: { name: "Concurrency Two", email: email.toUpperCase(), normalizedEmail: email } }),
    ]);
    expect(writes.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(writes.filter(({ status }) => status === "rejected")).toHaveLength(1);
    expect(await prisma.ecommerceCustomer.count({ where: { normalizedEmail: email } })).toBe(1);
  });

  it("rolls back all writes when a transaction fails", async () => {
    await expect(prisma.$transaction(async (tx) => {
      await tx.ecommerceCustomer.create({ data: { name: "Rollback", email: rollbackEmail, normalizedEmail: rollbackEmail } });
      throw new Error("intentional rollback probe");
    })).rejects.toThrow("intentional rollback probe");
    expect(await prisma.ecommerceCustomer.count({ where: { normalizedEmail: rollbackEmail } })).toBe(0);
  });

  it("allows only one concurrent checkout to reserve the last item", async () => {
    const attempts = await Promise.allSettled([
      orderService.checkout(userIds[0], checkoutInput(variantIds.lastItem, { idempotencyKey: `${marker}-last-a` })),
      orderService.checkout(userIds[1], checkoutInput(variantIds.lastItem, { idempotencyKey: `${marker}-last-b` })),
    ]);
    expect(attempts.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(attempts.filter(({ status }) => status === "rejected")).toHaveLength(1);
    expect((await prisma.inventoryStock.findFirstOrThrow({ where: { variantId: variantIds.lastItem } })).quantityReserved).toBe(1);
  });

  it("returns one order for concurrent duplicate idempotency keys", async () => {
    const key = `${marker}-same-checkout`;
    const attempts = await Promise.all([
      orderService.checkout(userIds[0], checkoutInput(variantIds.idempotency, { idempotencyKey: key })),
      orderService.checkout(userIds[0], checkoutInput(variantIds.idempotency, { idempotencyKey: key })),
    ]);
    expect(new Set(attempts.map(({ orderId }) => orderId)).size).toBe(1);
    expect(await prisma.order.count({ where: { checkoutKey: `${userIds[0]}:${key}` } })).toBe(1);
  });

  it("does not let concurrent discount redemptions cross the total limit", async () => {
    const attempts = await Promise.allSettled([
      orderService.checkout(userIds[0], checkoutInput(variantIds.discount, { discountCode, idempotencyKey: `${marker}-discount-a` })),
      orderService.checkout(userIds[1], checkoutInput(variantIds.discount, { discountCode, idempotencyKey: `${marker}-discount-b` })),
    ]);
    expect(attempts.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(attempts.filter(({ status }) => status === "rejected")).toHaveLength(1);
    expect(await prisma.discountRedemption.count({ where: { discountCodeId: discountId } })).toBe(1);
    expect((await prisma.discountCode.findUniqueOrThrow({ where: { id: discountId } })).usageCount).toBe(1);
  });

  it("rolls back customer, order, and stock changes when checkout fails", async () => {
    const failedEmail = `${marker}-failed@northstar.example.test`;
    await expect(orderService.checkout(userIds[1], checkoutInput(variantIds.rollback, {
      customerEmail: failedEmail,
      shippingAddress: { line1: "1 Test Avenue", email: failedEmail },
      discountCode: `${marker}-missing`, idempotencyKey: `${marker}-rollback-checkout`,
    }))).rejects.toThrow();
    expect(await prisma.order.count({ where: { checkoutKey: `${userIds[1]}:${marker}-rollback-checkout` } })).toBe(0);
    expect(await prisma.ecommerceCustomer.count({ where: { normalizedEmail: failedEmail } })).toBe(0);
    expect((await prisma.inventoryStock.findFirstOrThrow({ where: { variantId: variantIds.rollback } })).quantityReserved).toBe(0);
  });
});
