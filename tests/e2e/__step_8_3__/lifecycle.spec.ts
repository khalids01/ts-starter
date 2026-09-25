import { expect, request, test, type APIRequestContext, type Page } from "@playwright/test";
import prisma from "../../../packages/db/src/client.server";
import { e2eRuntimeConfig } from "../../../packages/config/src/e2e.config";
import { TEST_USERS } from "../../users-config";
import { assertTestEnvironment } from "../../setup/assert-test-environment";

test.describe.configure({ mode: "serial" });
test.setTimeout(180_000);

const marker = `e2e-flow-${Date.now()}`;
const categorySlug = `${marker}-category`;
const attributeSlug = `${marker}-material`;
const brandSlug = `${marker}-brand`;
const productSlug = `${marker}-product`;
const locationCode = `${marker}-location`;
const supplierName = `${marker}-supplier`;
const shippingCode = `${marker}-shipping`;
const discountCode = `${marker}-10`.toUpperCase();
const sku = `${marker}-sku`;
const guestEmail = `${marker}-guest@northstar.example.test`;
let originalSettings: Record<string, unknown>;
let createdOrderIds: string[] = [];
let courierConnectionId: string | undefined;

async function json<T>(response: Awaited<ReturnType<APIRequestContext["get"]>>, expected = 200) {
  expect(response.status(), await response.text()).toBe(expected);
  return response.json() as Promise<T>;
}

async function post<T>(context: APIRequestContext, path: string, data?: unknown, expected = 200) {
  return json<T>(await context.post(path, data === undefined ? undefined : { data }), expected);
}

async function patch<T>(context: APIRequestContext, path: string, data: unknown, expected = 200) {
  return json<T>(await context.patch(path, { data }), expected);
}

async function put<T>(context: APIRequestContext, path: string, data: unknown, expected = 200) {
  return json<T>(await context.put(path, { data }), expected);
}

async function completeCheckout(page: Page, email: string, discount?: string) {
  await page.goto(`/shop?search=${encodeURIComponent(marker)}`);
  await page.getByRole("link", { name: `${marker} Product`, exact: true }).click();
  await expect(page.getByRole("heading", { name: `${marker} Product` })).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/checkout");
  await page.getByLabel("Name").fill("Step 8 Shopper");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Phone").fill("+8801700000000");
  await page.getByLabel("Address line 1").fill("8 Commerce Road");
  await page.getByLabel("City").fill("Dhaka");
  await page.getByLabel("Postal code").fill("1205");
  if (discount) {
    await page.getByLabel("Discount code").fill(discount);
    await page.getByRole("button", { name: "Apply" }).click();
    await expect(page.getByText(new RegExp(`${discount} applied`))).toBeVisible();
  }
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page).toHaveURL(/\/checkout\/success\//);
  const orderId = page.url().split("/").at(-1)!;
  createdOrderIds.push(orderId);
  return orderId;
}

async function selectStatus(page: Page, current: string, next: string) {
  await page.getByRole("combobox").filter({ hasText: current }).click();
  await page.getByRole("option", { name: next, exact: true }).click();
}

async function confirmOrder(page: Page, orderId: string, markPaid = true) {
  await page.goto(`/admin/orders/${orderId}`);
  await expect(page.getByRole("heading", { name: /^E2E-/ })).toBeVisible();
  await selectStatus(page, "Pending", "Confirmed");
  if (markPaid) await selectStatus(page, "Payment due", "Paid");
  await page.getByRole("button", { name: "Update order" }).click();
  await expect(page.getByText("Order updated", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("combobox").filter({ hasText: "Confirmed" })).toBeVisible();
  if (markPaid) await expect(page.getByRole("combobox").filter({ hasText: "Paid" })).toBeVisible();
}

async function openCourierTab(page: Page, name: "Shipments" | "Returns" | "COD payouts", orderNumber: string) {
  const tab = page.getByRole("tab", { name });
  const card = page.locator('[data-slot="card"]').filter({ hasText: orderNumber });
  await expect(async () => {
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(card).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 20_000 });
  return card;
}

async function confirmAndQueueCourier(page: Page, orderId: string, orderNumber: string) {
  await page.goto(`/admin/orders/${orderId}`);
  const routing = page.locator('[data-slot="card"]').filter({ hasText: "Courier routing" });
  await expect(routing.getByRole("combobox", { name: "Connection and service" })).toHaveValue(/.+:.+/);
  const confirmRoute = routing.getByRole("button", { name: "Confirm route" });
  await expect(confirmRoute).toBeEnabled();
  const confirmResponse = page.waitForResponse((response) =>
    response.url().includes(`/admin/delivery/orders/${orderId}/confirm`) && response.request().method() === "POST",
  );
  await confirmRoute.click();
  expect((await confirmResponse).status()).toBe(200);
  await expect(page.getByText("Courier route confirmed; dispatch remains manual", { exact: true })).toBeVisible();

  await page.goto("/admin/couriers");
  const dispatchCard = await openCourierTab(page, "Shipments", orderNumber);
  const queueResponse = page.waitForResponse((response) =>
    response.url().includes("/admin/delivery/dispatches/") && response.url().endsWith("/queue") && response.request().method() === "POST",
  );
  await dispatchCard.getByRole("button", { name: "Queue dispatch" }).click();
  expect((await queueResponse).status()).toBe(200);
  await expect(page.getByText("Dispatch queued", { exact: true })).toBeVisible();

  const consignment = await prisma.courierConsignment.findFirstOrThrow({ where: { orderId } });
  // The provider boundary is deterministic in E2E: no real Steadfast parcel is created.
  await prisma.$transaction([
    prisma.courierConsignment.update({
      where: { id: consignment.id },
      data: {
        externalId: `${marker}-${orderNumber}`,
        trackingCode: `${marker}-COURIER`,
        providerState: "pending",
        state: "submitted",
        submittedAt: new Date(),
      },
    }),
    prisma.courierOperation.updateMany({ where: { consignmentId: consignment.id }, data: { state: "completed" } }),
    prisma.courierDispatch.update({ where: { id: consignment.dispatchId }, data: { status: "submitted" } }),
  ]);
  await page.reload();
  return { ...consignment, externalId: `${marker}-${orderNumber}` };
}

async function simulateCourierDelivery(consignmentId: string, orderId: string) {
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.courierEvent.create({
      data: {
        consignmentId,
        source: "polling",
        eventKey: `${marker}-delivered`,
        eventType: "delivery_status",
        providerState: "delivered",
        normalizedState: "delivered",
        payload: { status: "delivered", fixture: true },
        occurredAt: now,
      },
    });
    await tx.courierConsignment.update({
      where: { id: consignmentId },
      data: { providerState: "delivered", state: "delivered", deliveredAt: now, active: false },
    });
    await tx.courierSettlement.updateMany({
      where: { consignmentId, state: "matched_pending_delivery" },
      data: { state: "reconciled" },
    });
    await tx.order.update({ where: { id: orderId }, data: { paymentStatus: "paid" } });
  });
}

test("full ecommerce and courier lifecycle persists dispatch, delivery, returns, settlements, refunds, and inventory", async ({ browser }) => {
  assertTestEnvironment();
  const owner = await request.newContext({
    baseURL: e2eRuntimeConfig.serverUrl,
    storageState: TEST_USERS.owner.storageStatePath,
  });
  const manager = await request.newContext({
    baseURL: e2eRuntimeConfig.serverUrl,
    storageState: TEST_USERS.commerceManager.storageStatePath,
  });
  const admin = await request.newContext({
    baseURL: e2eRuntimeConfig.serverUrl,
    storageState: TEST_USERS.admin.storageStatePath,
  });
  const anonymous = await request.newContext({ baseURL: e2eRuntimeConfig.serverUrl });
  const user = await request.newContext({
    baseURL: e2eRuntimeConfig.serverUrl,
    storageState: TEST_USERS.user.storageStatePath,
  });

  originalSettings = await json<Record<string, unknown>>(await owner.get("/admin/store-settings"));
  await put(owner, "/admin/store-settings", {
    storeName: "Step 8 E2E Store", supportEmail: null, supportPhone: null,
    defaultCurrency: "BDT", orderNumberPrefix: "E2E", reservationDurationMinutes: 30,
    checkoutEnabled: true, checkoutNotice: "Step 8 isolated checkout",
  });
  const shipping = await post<{ id: string }>(manager, "/admin/shipping/rates", {
    code: shippingCode, label: "Step 8 Delivery", amount: "50.00", currency: "BDT",
    freeOverAmount: null, isDefault: true, isActive: true, sortOrder: 0,
  });
  const provider = await prisma.courierProvider.upsert({
    where: { code: "steadfast" },
    create: { code: "steadfast", displayName: "Steadfast Courier", capabilities: ["createConsignment", "getConsignmentStatus"] },
    update: {},
  });
  const courierConnection = await prisma.courierConnection.create({
    data: {
      providerId: provider.id,
      publicId: `${marker}-connection`,
      displayName: "Step 9 Steadfast",
      enabled: true,
      environment: "sandbox",
      priority: 1,
      credentialSource: "server_environment",
      healthState: "healthy",
    },
  });
  courierConnectionId = courierConnection.id;
  const courierService = await prisma.courierService.create({
    data: {
      connectionId: courierConnection.id,
      code: `${marker}-home-delivery`,
      displayName: "Step 9 Home Delivery",
      enabled: true,
      methods: { create: { shippingRateId: shipping.id } },
    },
  });
  await prisma.courierRoutingRule.create({
    data: {
      name: "Step 9 deterministic route",
      priority: 1,
      enabled: true,
      conditions: {},
      connectionId: courierConnection.id,
      serviceId: courierService.id,
    },
  });
  const category = await post<{ id: string }>(manager, "/admin/catalog/categories", {
    name: `${marker} Category`, slug: categorySlug, brandPolicy: "optional", isActive: true,
  });
  const attribute = await post<{ id: string }>(manager, "/admin/catalog/attributes", {
    name: `${marker} Material`, slug: attributeSlug, type: "text", filterable: true,
  });
  const attributeValue = await post<{ id: string }>(manager, `/admin/catalog/attributes/${attribute.id}/values`, {
    value: "cotton", label: "Cotton",
  });
  await post(manager, `/admin/catalog/categories/${category.id}/attributes`, {
    attributeId: attribute.id, scope: "variant", required: false,
    filterable: true, variantDefining: true, inputType: "select",
  });
  const brand = await post<{ id: string }>(manager, "/admin/catalog/brands", {
    name: `${marker} Brand`, slug: brandSlug, isActive: true,
  });
  const product = await post<{ id: string }>(manager, "/admin/products", {
    categoryId: category.id, brandId: brand.id, name: `${marker} Product`, slug: productSlug,
    description: "Step 8 complete lifecycle product", searchKeywords: [marker],
  });

  const invalidActivation = await manager.patch(`/admin/products/${product.id}`, { data: { status: "active" } });
  expect(invalidActivation.status()).toBe(400);
  await put(manager, `/admin/products/${product.id}/variants`, {
    variants: [{ sku, name: "Default", price: "1000.00", currency: "BDT", isDefault: true, isActive: true, attributeValueIds: [attributeValue.id] }],
  });
  await put(manager, `/admin/products/${product.id}/highlights`, {
    highlights: [{ title: "Lifecycle verified", description: "Created by the isolated Step 8 suite", sortOrder: 0 }],
  });
  await post(manager, `/admin/products/${product.id}/validate`);
  await patch(manager, `/admin/products/${product.id}`, { status: "active" });
  const productDetail = await json<{ variants: Array<{ id: string }> }>(await manager.get(`/admin/products/${product.id}`));
  const variantId = productDetail.variants[0]!.id;

  const supplier = await post<{ id: string }>(manager, "/admin/inventory/suppliers", { name: supplierName, isActive: true });
  const location = await post<{ id: string }>(manager, "/admin/inventory/locations", { name: `${marker} Warehouse`, code: locationCode, isActive: true });
  await post(manager, "/admin/inventory/receive", {
    variantId, locationId: location.id, supplierId: supplier.id, quantity: 30,
    batchNumber: `${marker}-batch`, unitCost: "600.00", notes: "Lifecycle receipt", reorderLevel: 5,
  });
  const receivedStock = await json<{ items: Array<{ batchId: string | null }> }>(
    await manager.get(`/admin/inventory/stocks?variantId=${variantId}`),
  );
  await post(manager, "/admin/inventory/adjust", {
    variantId, locationId: location.id, batchId: receivedStock.items[0]!.batchId,
    delta: 2, reason: "Lifecycle count correction",
  });
  const discount = await post<{ id: string }>(manager, "/admin/discounts", {
    code: discountCode, description: "Lifecycle discount", type: "percentage", value: "10",
    currency: "BDT", isActive: true, totalUsageLimit: 10, perCustomerUsageLimit: 1,
  });

  const guestContext = await browser.newContext({ baseURL: e2eRuntimeConfig.webUrl });
  const guestOrderId = await completeCheckout(await guestContext.newPage(), guestEmail, discountCode);
  const shopperContext = await browser.newContext({
    baseURL: e2eRuntimeConfig.webUrl,
    storageState: TEST_USERS.user.storageStatePath,
  });
  const shopperOrderId = await completeCheckout(await shopperContext.newPage(), TEST_USERS.user.email);

  const managerBrowser = await browser.newContext({
    baseURL: e2eRuntimeConfig.webUrl,
    storageState: TEST_USERS.owner.storageStatePath,
  });
  const orderPage = await managerBrowser.newPage();
  orderPage.setDefaultTimeout(15_000);
  let dialog = orderPage.getByRole("dialog");

  const customerList = await json<{ items: Array<{ id: string; email: string }> }>(await admin.get(`/admin/customers?search=${encodeURIComponent(guestEmail)}`));
  const guestCustomer = customerList.items.find((item) => item.email === guestEmail)!;
  expect(guestCustomer).toBeTruthy();
  await patch(admin, `/admin/customers/${guestCustomer.id}`, {
    phone: "+8801800000000", adminNote: "Verified through Step 8 lifecycle",
  });

  await confirmOrder(orderPage, guestOrderId, false);
  const guestOrder = await json<{ orderNumber: string }>(await manager.get(`/admin/orders/${guestOrderId}`));
  const guestConsignment = await confirmAndQueueCourier(orderPage, guestOrderId, guestOrder.orderNumber);
  await orderPage.goto(`/admin/orders/${guestOrderId}`);
  await orderPage.getByRole("button", { name: "Mark shipped" }).click();
  dialog = orderPage.getByRole("dialog");
  await dialog.getByLabel("Carrier").fill("Step 8 Carrier");
  await dialog.getByLabel("Tracking number").fill(`${marker}-TRACK-1`);
  await dialog.getByLabel("Note").fill("Shipped through the admin UI");
  await dialog.getByRole("button", { name: "Mark shipped" }).click();
  await expect(orderPage.getByText("Order marked as shipped", { exact: true })).toBeVisible();
  await orderPage.reload();
  await expect(orderPage.getByText(`${marker}-TRACK-1`, { exact: true })).toBeVisible();

  await orderPage.getByRole("button", { name: "Edit tracking" }).click();
  dialog = orderPage.getByRole("dialog");
  await dialog.getByLabel("Tracking number").fill(`${marker}-TRACK-2`);
  await dialog.getByLabel("Note").fill("Tracking corrected through the admin UI");
  await dialog.getByRole("button", { name: "Save tracking" }).click();
  await expect(orderPage.getByText("Tracking updated", { exact: true })).toBeVisible();
  await orderPage.reload();
  await expect(orderPage.getByText(`${marker}-TRACK-2`, { exact: true })).toBeVisible();

  await orderPage.goto("/admin/couriers");
  let courierCard = await openCourierTab(orderPage, "Shipments", guestOrder.orderNumber);
  let handoffResponse = orderPage.waitForResponse((response) =>
    response.url().includes(`/admin/delivery/consignments/${guestConsignment.id}/handoff`) && response.request().method() === "POST",
  );
  await courierCard.getByRole("button", { name: "Mark handed over" }).click();
  expect((await handoffResponse).status()).toBe(200);
  handoffResponse = orderPage.waitForResponse((response) =>
    response.url().includes(`/admin/delivery/consignments/${guestConsignment.id}/handoff`) && response.request().method() === "POST",
  );
  await courierCard.getByRole("button", { name: "Mark in transit" }).click();
  expect((await handoffResponse).status()).toBe(200);
  const recordSettlementButton = courierCard.getByRole("button", { name: "Record settlement" });
  await expect(recordSettlementButton).toBeVisible();
  await recordSettlementButton.click();
  dialog = orderPage.getByRole("dialog", { name: "Record COD settlement evidence" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Payout/reference ID").fill(`${marker}-payout`);
  await dialog.getByLabel("Evidence note").fill("E2E courier settlement evidence");
  await dialog.getByRole("button", { name: "Record settlement" }).click();
  await expect(orderPage.getByText("Settlement evidence recorded", { exact: true })).toBeVisible();

  await orderPage.goto(`/admin/orders/${guestOrderId}`);
  await orderPage.getByRole("button", { name: "Mark delivered" }).click();
  dialog = orderPage.getByRole("dialog");
  await dialog.getByLabel("Note").fill("Delivered through the admin UI");
  await dialog.getByRole("button", { name: "Mark delivered" }).click();
  await expect(orderPage.getByText("Order marked as delivered", { exact: true })).toBeVisible();
  await simulateCourierDelivery(guestConsignment.id, guestOrderId);
  await orderPage.goto("/admin/couriers");
  courierCard = await openCourierTab(orderPage, "COD payouts", guestOrder.orderNumber);
  await expect(courierCard.getByText("reconciled", { exact: true })).toBeVisible();
  await orderPage.goto(`/admin/orders/${guestOrderId}`);
  await orderPage.reload();
  await selectStatus(orderPage, "Confirmed", "Completed");
  await orderPage.getByRole("button", { name: "Update order" }).click();
  await expect(orderPage.getByText("Order updated", { exact: true })).toBeVisible();

  const cancelOrder = await post<{ orderId: string }>(anonymous, "/shop/checkout", {
    items: [{ variantId, quantity: 1 }], customerName: "Cancel Customer", customerEmail: `${marker}-cancel@northstar.example.test`,
    shippingAddress: { line1: "1 Cancel Road", city: "Dhaka", country: "Bangladesh" }, shippingRateId: shipping.id,
    paymentMethod: "cash_on_delivery", idempotencyKey: `${marker}-cancel-key`,
  });
  createdOrderIds.push(cancelOrder.orderId);
  await orderPage.goto(`/admin/orders/${cancelOrder.orderId}`);
  await orderPage.getByRole("button", { name: "Cancel order" }).click();
  dialog = orderPage.getByRole("dialog");
  await dialog.getByLabel("Reason").fill("Lifecycle cancellation through the admin UI");
  await dialog.getByLabel("Internal note").fill("Cancellation UI verified");
  await dialog.getByRole("button", { name: "Cancel order" }).click();
  await expect(orderPage.getByText("Order cancelled", { exact: true })).toBeVisible();
  await orderPage.reload();
  await expect(orderPage.getByText("This order is already cancelled.")).toBeVisible();
  expect((await manager.post(`/admin/orders/${cancelOrder.orderId}/cancel`, { data: { reason: "Repeated cancellation" } })).status()).toBe(409);

  await confirmOrder(orderPage, shopperOrderId);
  const shopperOrder = await json<{ orderNumber: string }>(await manager.get(`/admin/orders/${shopperOrderId}`));
  await confirmAndQueueCourier(orderPage, shopperOrderId, shopperOrder.orderNumber);
  await orderPage.goto("/admin/couriers");
  courierCard = await openCourierTab(orderPage, "Shipments", shopperOrder.orderNumber);
  await courierCard.getByRole("button", { name: "Request return" }).click();
  dialog = orderPage.getByRole("dialog", { name: "Record courier return request" });
  await dialog.getByLabel("Reason").fill("E2E customer return");
  await dialog.getByRole("button", { name: "Record return" }).click();
  await expect(orderPage.getByText("Return request recorded", { exact: true })).toBeVisible();
  const returnCard = await openCourierTab(orderPage, "Returns", shopperOrder.orderNumber);
  await returnCard.getByRole("button", { name: "Approve" }).click();
  await expect(returnCard.getByRole("button", { name: "Mark processing" })).toBeVisible();
  await returnCard.getByRole("button", { name: "Mark processing" }).click();
  await expect(returnCard.getByRole("button", { name: "Mark completed" })).toBeVisible();
  await returnCard.getByRole("button", { name: "Mark completed" }).click();
  await expect(returnCard.getByText(/completed/)).toBeVisible();

  await orderPage.goto(`/admin/orders/${shopperOrderId}`);
  await orderPage.getByRole("button", { name: "Record refund" }).click();
  dialog = orderPage.getByRole("dialog");
  await dialog.getByLabel("Amount (BDT)").fill("100.00");
  await dialog.getByLabel("Reason").fill("Lifecycle partial refund through the admin UI");
  await dialog.getByRole("button", { name: "Record refund" }).click();
  await expect(orderPage.getByText("Manual refund recorded", { exact: true })).toBeVisible();
  await orderPage.reload();
  await expect(orderPage.getByRole("combobox").filter({ hasText: "Partially refunded" })).toBeVisible();
  const shopperDetail = await json<{ totalAmount: string }>(await manager.get(`/admin/orders/${shopperOrderId}`));
  const remainder = (Number(shopperDetail.totalAmount) - 100).toFixed(2);
  await orderPage.getByRole("button", { name: "Record refund" }).click();
  dialog = orderPage.getByRole("dialog");
  await dialog.getByLabel("Amount (BDT)").fill(remainder);
  await dialog.getByLabel("Reason").fill("Lifecycle full refund through the admin UI");
  await dialog.getByRole("checkbox", { name: /Restock committed inventory/ }).check();
  await dialog.getByRole("button", { name: "Record refund" }).click();
  await expect(orderPage.getByText("Manual refund recorded", { exact: true })).toBeVisible();
  await orderPage.reload();
  await expect(orderPage.getByRole("combobox").filter({ hasText: "Refunded" })).toBeVisible();
  await expect(orderPage.getByRole("button", { name: "Record refund" })).toBeDisabled();
  expect((await manager.post(`/admin/orders/${shopperOrderId}/refunds`, { data: { amount: "1.00", reason: "Repeated refund" } })).status()).toBe(409);

  const orderDetail = await json<{
    orderStatus: string; paymentStatus: string; deliveryStatus: string; trackingNumber: string;
    discountCodeSnapshot: string; statusEvents: unknown[];
  }>(await manager.get(`/admin/orders/${guestOrderId}`));
  expect(orderDetail).toMatchObject({
    orderStatus: "completed", paymentStatus: "paid", deliveryStatus: "delivered",
    trackingNumber: `${marker}-TRACK-2`, discountCodeSnapshot: discountCode,
  });
  expect(orderDetail.statusEvents.length).toBeGreaterThanOrEqual(5);
  const stock = await json<{ items: Array<{ quantityOnHand: number; quantityReserved: number }> }>(await manager.get(`/admin/inventory/stocks?variantId=${variantId}`));
  // 30 received + 2 adjusted - 2 committed + 1 refund restock.
  expect(stock.items[0]!.quantityOnHand).toBe(31);
  expect(stock.items[0]!.quantityReserved).toBe(0);
  const discountDetail = await json<Array<{ id: string; usageCount: number }>>(await manager.get(`/admin/discounts?search=${discountCode}`));
  expect(discountDetail.find((item) => item.id === discount.id)?.usageCount).toBe(1);
  expect(await prisma.courierException.count({
    where: { consignment: { orderId: shopperOrderId }, kind: "return_reconciliation_required", state: "open" },
  })).toBe(1);

  await guestContext.close();
  await shopperContext.close();
  await managerBrowser.close();
  await Promise.all([owner.dispose(), manager.dispose(), admin.dispose(), anonymous.dispose(), user.dispose()]);
});

test.afterAll(async () => {
  assertTestEnvironment();
  if (originalSettings) {
    const owner = await request.newContext({ baseURL: e2eRuntimeConfig.serverUrl, storageState: TEST_USERS.owner.storageStatePath });
    await owner.put("/admin/store-settings", { data: originalSettings });
    await owner.dispose();
  }
  if (createdOrderIds.length) {
    const consignments = await prisma.courierConsignment.findMany({ where: { orderId: { in: createdOrderIds } }, select: { id: true } });
    const consignmentIds = consignments.map(({ id }) => id);
    await prisma.courierException.deleteMany({ where: { consignmentId: { in: consignmentIds } } });
    await prisma.courierSettlement.deleteMany({ where: { consignmentId: { in: consignmentIds } } });
    await prisma.courierReturn.deleteMany({ where: { consignmentId: { in: consignmentIds } } });
    await prisma.courierEvent.deleteMany({ where: { consignmentId: { in: consignmentIds } } });
    await prisma.courierOperation.deleteMany({ where: { consignmentId: { in: consignmentIds } } });
    await prisma.courierConsignment.deleteMany({ where: { id: { in: consignmentIds } } });
    await prisma.courierDispatch.deleteMany({ where: { orderId: { in: createdOrderIds } } });
    await prisma.stockReservation.deleteMany({ where: { referenceType: "order", referenceId: { in: createdOrderIds } } });
    await prisma.inventoryMovement.deleteMany({ where: { referenceType: "order", referenceId: { in: createdOrderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });
  }
  await prisma.discountCode.deleteMany({ where: { code: discountCode } });
  const variants = await prisma.productVariant.findMany({ where: { sku }, select: { id: true } });
  const variantIds = variants.map(({ id }) => id);
  await prisma.stockReservation.deleteMany({ where: { variantId: { in: variantIds } } });
  await prisma.inventoryMovement.deleteMany({ where: { variantId: { in: variantIds } } });
  await prisma.inventoryStock.deleteMany({ where: { variantId: { in: variantIds } } });
  await prisma.inventoryBatch.deleteMany({ where: { variantId: { in: variantIds } } });
  await prisma.product.deleteMany({ where: { slug: productSlug } });
  await prisma.productBrand.deleteMany({ where: { slug: brandSlug } });
  await prisma.categoryAttribute.deleteMany({ where: { category: { slug: categorySlug } } });
  await prisma.productAttributeValue.deleteMany({ where: { attribute: { slug: attributeSlug } } });
  await prisma.productAttribute.deleteMany({ where: { slug: attributeSlug } });
  await prisma.category.deleteMany({ where: { slug: categorySlug } });
  await prisma.inventoryLocation.deleteMany({ where: { code: locationCode } });
  await prisma.supplier.deleteMany({ where: { name: supplierName } });
  await prisma.shippingRate.deleteMany({ where: { code: shippingCode } });
  if (courierConnectionId) {
    await prisma.courierRoutingRule.deleteMany({ where: { connectionId: courierConnectionId } });
    await prisma.courierServiceMethod.deleteMany({ where: { service: { connectionId: courierConnectionId } } });
    await prisma.courierService.deleteMany({ where: { connectionId: courierConnectionId } });
    await prisma.courierConnection.deleteMany({ where: { id: courierConnectionId } });
  }
  await prisma.ecommerceCustomer.deleteMany({ where: { normalizedEmail: { startsWith: marker } } });
  await prisma.$disconnect();
});
