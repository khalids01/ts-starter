import { request } from "@playwright/test";
import { e2eRuntimeConfig } from "../../packages/config/src/e2e.config";
import { TEST_USERS } from "../../tests/users-config";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { assertTestEnvironment } from "../../tests/setup/assert-test-environment";

export type ProductFulfillmentKind = "standard" | "packaged_food" | "fresh_food" | "gadget" | "clothing";
export type SerialTrackingMode = "none" | "serial" | "imei" | "serial_and_imei";

export type ProductFixtureSpec = {
  key: string;
  sku: string;
  fulfillmentKind?: ProductFulfillmentKind;
  serialTracking?: SerialTrackingMode;
  warrantyDays?: number;
  registerUnits?: number;
};

export type FoodSlotFixtureSpec = {
  label: string;
  postalCodes: string[];
  startsAt: string;
  endsAt: string;
  cutoffAt: string;
  capacityUnits: number;
};

export type OrderStep =
  | "confirm"
  | "pay"
  | "ship"
  | "deliver"
  | "complete"
  | "cancel"
  | "receive"
  | "inspect"
  | "restock"
  | "assign-unit";

export type OrderFixtureSpec = {
  marker: string;
  sku: string;
  locationCode: string;
  receiptPath: string;
  products?: ProductFixtureSpec[];
  foodSlot?: FoodSlotFixtureSpec;
  orders: Array<{
    key: string;
    customerName: string;
    productKey?: string;
    steps: OrderStep[];
    verify: Record<string, string>;
  }>;
};

export async function runOrderFixture(spec: OrderFixtureSpec, mode: "prepare" | "cleanup") {
  const environment = assertTestEnvironment();
  if (environment.isRemote || !/^tutorial-[a-z0-9-]+$/.test(spec.marker) || process.env.COURIER_WORKERS_ENABLED !== "false" || process.env.ENABLE_POLAR !== "false") throw new Error("Local isolated tutorial fixtures with disabled integrations required");
  const prismaScript = `
    import { assertTestEnvironment } from ${JSON.stringify(resolve(import.meta.dir, "../../tests/setup/assert-test-environment.ts"))};
    assertTestEnvironment();
    import prisma from "@db/server";
    const marker = ${JSON.stringify(spec.marker)};
    const orders = await prisma.order.findMany({ where: { customerName: { startsWith: marker } }, select: { id: true } });
    for (const order of orders) {
      await prisma.orderStatusEvent.deleteMany({ where: { orderId: order.id } }).catch(() => {});
      await prisma.orderPayment.deleteMany({ where: { orderId: order.id } }).catch(() => {});
      await prisma.stockReservation.deleteMany({ where: { referenceType: "order", referenceId: order.id } });
      await prisma.unitAllocation.deleteMany({ where: { lineItem: { orderId: order.id } } }).catch(() => {});
      await prisma.foodOrderBooking.deleteMany({ where: { orderId: order.id } }).catch(() => {});
      await prisma.orderAddress.deleteMany({ where: { orderId: order.id } }).catch(() => {});
      await prisma.orderLineItem.deleteMany({ where: { orderId: order.id } }).catch(() => {});
      await prisma.orderRefund.deleteMany({ where: { orderId: order.id } }).catch(() => {});
      await prisma.orderRecovery.deleteMany({ where: { orderId: order.id } }).catch(() => {});
      await prisma.order.delete({ where: { id: order.id } }).catch((e) => console.log("order delete skipped:", e.message.slice(0, 120)));
    }
    await prisma.ecommerceCustomer.deleteMany({ where: { email: { startsWith: marker } } }).catch(() => {});
    const products = await prisma.product.findMany({ where: { name: { startsWith: marker } }, select: { id: true } });
    const variantIds = (await prisma.productVariant.findMany({ where: { productId: { in: products.map(p => p.id) } }, select: { id: true } })).map(v => v.id);
    await prisma.stockReservation.deleteMany({ where: { variantId: { in: variantIds } } });
    await prisma.inventoryUnit.deleteMany({ where: { variantId: { in: variantIds } } }).catch(() => {});
    await prisma.inventoryMovement.deleteMany({ where: { variantId: { in: variantIds } } }).catch(() => {});
    await prisma.inventoryStock.deleteMany({ where: { variantId: { in: variantIds } } }).catch(() => {});
    await prisma.inventoryBatchAttributeAssignment.deleteMany({ where: { batch: { variantId: { in: variantIds } } } }).catch(() => {});
    await prisma.inventoryBatch.deleteMany({ where: { variantId: { in: variantIds } } }).catch(() => {});
    await prisma.productVariant.deleteMany({ where: { productId: { in: products.map(p => p.id) } } }).catch(() => {});
    await prisma.product.deleteMany({ where: { id: { in: products.map(p => p.id) } } }).catch(() => {});
    await prisma.inventoryLocation.deleteMany({ where: { name: { startsWith: marker } } }).catch(() => {});
    await prisma.category.deleteMany({ where: { name: { startsWith: marker } } }).catch(() => {});
    await prisma.foodDeliverySlot.deleteMany({ where: { label: { startsWith: marker } } }).catch(() => {});
    const remaining = await Promise.all([
      prisma.order.count({ where: { customerName: { startsWith: marker } } }),
      prisma.product.count({ where: { name: { startsWith: marker } } }),
      prisma.category.count({ where: { name: { startsWith: marker } } }),
      prisma.inventoryLocation.count({ where: { name: { startsWith: marker } } }),
      prisma.ecommerceCustomer.count({ where: { email: { startsWith: marker } } }),
      prisma.foodDeliverySlot.count({ where: { label: { startsWith: marker } } }),
    ]);
    if (remaining.some(Boolean)) throw new Error("Marker-owned tutorial fixture cleanup incomplete");
    console.log("prisma cleanup complete");
  `;

  async function hardCleanup() {
    const child = Bun.spawn(["bun", "--env-file=../../tests/env/.env", "-e", prismaScript], { cwd: resolve(import.meta.dir, "../../apps/server"), stdout: "inherit", stderr: "inherit", env: { ...process.env, REDIS_KEY_PREFIX: environment.redisKeyPrefix } });
    if (await child.exited !== 0) throw new Error("Prisma cleanup failed");
  }

  const api = await request.newContext({ baseURL: e2eRuntimeConfig.serverUrl, storageState: TEST_USERS.owner.storageStatePath });
  async function call<T>(method: string, path: string, data?: unknown): Promise<T> {
    const response = await api.fetch(path, { method, data: data as never });
    if (!response.ok()) throw new Error(`${method} ${path} -> ${response.status()}: ${(await response.text()).slice(0, 300)}`);
    return (await response.json()) as T;
  }
  async function ensureShippingRate() {
    const rates = await call<Array<{ id: string; isDefault: boolean }>>("GET", "/admin/shipping/rates?limit=100");
    if (Array.isArray(rates) && rates.some((rate) => rate.isDefault)) return;
    await call("POST", "/admin/shipping/rates", { code: "STD", label: "Standard delivery", amount: "60", currency: "BDT", isDefault: true, isActive: true });
    console.log("created default shipping rate");
  }

  try {
    if (mode === "cleanup") {
      await hardCleanup();
      return;
    }
    await hardCleanup();
    const session = await call<{ primaryRoleSlug?: string; user?: { email?: string } }>("GET", "/session/context");
    if (session.primaryRoleSlug !== "platform.owner" || session.user?.email !== TEST_USERS.owner.email) throw new Error("Fictional owner session required");
    await ensureShippingRate();

    const location = await call<{ id: string }>("POST", "/admin/inventory/locations", { name: `${spec.marker}-location`, code: spec.locationCode, address: "Fictional demonstration site", isActive: true });
    let foodSlotId: string | null = null;
    if (spec.foodSlot) {
      const slot = await call<{ id: string }>("POST", "/admin/orders/food-slots", spec.foodSlot);
      foodSlotId = slot.id;
      console.log(`created food slot: ${spec.foodSlot.label}`);
    }

    const productSpecs = spec.products ?? [{ key: "default", sku: spec.sku, fulfillmentKind: "standard" as const, serialTracking: "none" as const, warrantyDays: 0 }];
    const products: Array<{ key: string; variantId: string; fulfillmentKind: string; unitIds: string[] }> = [];
    for (const productSpec of productSpecs) {
      const category = await call<{ id: string }>("POST", "/admin/catalog/categories", { name: `${spec.marker}-${productSpec.key}-category`, slug: `${spec.marker}-${productSpec.key}-category-record`, fulfillmentKind: productSpec.fulfillmentKind ?? "standard", serialTracking: productSpec.serialTracking ?? "none", warrantyDays: productSpec.warrantyDays ?? 0, brandPolicy: "optional", isActive: true });
      const product = await call<{ id: string }>("POST", "/admin/products", { categoryId: category.id, name: `${spec.marker}-${productSpec.key}-product`, slug: `${spec.marker}-${productSpec.key}-product-record`, brandId: null });
      await call("PUT", `/admin/products/${product.id}/variants`, { variants: [{ sku: productSpec.sku, name: "Prepared variant", price: "900", currency: "BDT", isDefault: true, isActive: true, attributeValueIds: [] }] });
      const detail = await call<{ variants: Array<{ id: string }> }>("GET", `/admin/products/${product.id}`);
      const variantId = detail.variants[0]!.id;
      const received = await call<{ batch: { id: string } | null }>("POST", "/admin/inventory/receive", { variantId, locationId: location.id, quantity: 200, batchNumber: `${spec.marker}-${productSpec.key}-batch`, unitCost: "500", reorderLevel: 5, batchAttributes: [] });
      const batchId = received.batch?.id ?? null;
      await call("PATCH", `/admin/products/${product.id}`, { status: "active" });
      const unitIds: string[] = [];
      for (let index = 1; index <= (productSpec.registerUnits ?? 0); index++) {
        const unit = await call<{ id: string }>("POST", "/admin/inventory/units", { variantId, locationId: location.id, batchId, serial: `${spec.marker}-${productSpec.key}-unit-${index}` });
        unitIds.push(unit.id);
      }
      products.push({ key: productSpec.key, variantId, fulfillmentKind: productSpec.fulfillmentKind ?? "standard", unitIds });
      console.log(`prepared product ${productSpec.key}: ${variantId} (${productSpec.fulfillmentKind ?? "standard"})`);
    }

    const receipt: { marker: string; createdAt: string; orders: Record<string, string> } = { marker: spec.marker, createdAt: new Date().toISOString(), orders: {} };
    for (const order of spec.orders) {
      const product = products.find((item) => item.key === (order.productKey ?? products[0]!.key)) ?? products[0]!;
      const checkout = await call<{ orderId: string; orderNumber: string }>("POST", "/shop/checkout", {
        items: [{ variantId: product.variantId, quantity: 2 }],
        customerName: order.customerName,
        customerEmail: `${order.customerName}@example.test`,
        customerPhone: "+880 1700-000000",
        shippingAddress: { fullName: order.customerName, line1: "12 Fictional Road", city: "Dhaka", postalCode: "1205", country: "BD" },
        paymentMethod: "cash_on_delivery",
        idempotencyKey: `${order.customerName}-checkout`,
        ...(product.fulfillmentKind === "fresh_food" && foodSlotId ? { foodSlotId } : {}),
      });
      const orderId = checkout.orderId;
      for (const step of order.steps) {
        if (step === "confirm") await call("PATCH", `/admin/orders/${orderId}/status`, { orderStatus: "confirmed", note: `${spec.marker} fixture confirmation` });
        if (step === "pay") {
          const current = await call<{ totalAmount: string; currency: string }>("GET", `/admin/orders/${orderId}`);
          await call("POST", `/admin/orders/${orderId}/payments`, { amount: current.totalAmount, currency: current.currency, method: "manual_bank", reference: `${spec.marker}-${order.key}-payment`, note: `${spec.marker} fixture collection evidence` });
        }
        if (step === "ship") await call("POST", `/admin/orders/${orderId}/ship`, { carrier: "Tutorial Courier", trackingNumber: `${spec.marker}-${order.key}-TRACK`, note: `${spec.marker} fixture handoff` });
        if (step === "deliver") await call("POST", `/admin/orders/${orderId}/delivered`, { note: `${spec.marker} fixture delivery` });
        if (step === "complete") await call("PATCH", `/admin/orders/${orderId}/status`, { orderStatus: "completed", note: `${spec.marker} fixture completion` });
        if (step === "cancel") await call("POST", `/admin/orders/${orderId}/cancel`, { reason: `${spec.marker} fixture cancellation`, note: `${spec.marker} fixture cancellation note` });
        if (step === "receive") await call("POST", `/admin/orders/${orderId}/recovery`, { allItemsReceived: true, note: `${spec.marker} fixture physical receipt` });
        if (step === "inspect") await call("PATCH", `/admin/orders/${orderId}/recovery`, { disposition: "sellable", note: `${spec.marker} fixture sellable inspection` });
        if (step === "restock") await call("POST", `/admin/orders/${orderId}/recovery/restock`, { note: `${spec.marker} fixture restock` });
        if (step === "assign-unit") {
          const detail = await call<{ lineItems: Array<{ id: string; variantId: string }> }>("GET", `/admin/orders/${orderId}`);
          const line = detail.lineItems.find((item) => item.variantId === product.variantId) ?? detail.lineItems[0]!;
          const unitId = product.unitIds.find((id) => id) ?? product.unitIds[0]!;
          if (!unitId) throw new Error(`No registered unit available for ${order.customerName}`);
          await call("POST", `/admin/orders/${orderId}/units`, { lineItemId: line.id, unitId });
        }
      }
      const final = await call<Record<string, unknown>>("GET", `/admin/orders/${orderId}`);
      for (const [field, expected] of Object.entries(order.verify)) {
        const actual = field.split(".").reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], final);
        if (String(actual) !== expected) throw new Error(`${order.customerName}: ${field} = ${String(actual)}, expected ${expected}`);
      }
      receipt.orders[order.key] = orderId;
      console.log(`prepared ${order.key}: ${orderId} (${checkout.orderNumber})`);
    }
    await writeFile(spec.receiptPath, JSON.stringify(receipt, null, 2) + "\n");
    console.log(`Prepared ${spec.marker}: ${Object.keys(receipt.orders).length} orders`);
  } finally {
    await api.dispose();
  }
}
