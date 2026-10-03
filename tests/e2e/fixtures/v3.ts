import {
  expect,
  type APIRequestContext,
  type Browser,
  type Page,
} from "@playwright/test";
import { createHmac } from "node:crypto";
import { assertTestEnvironment } from "../../setup/assert-test-environment";
import { TEST_USERS } from "../../users-config";
const target = assertTestEnvironment();
if (target.isRemote)
  throw new Error("Step 11 requires an isolated local target");
if (process.env.STEAD_FAST_BASE_URL !== "http://localhost:3903")
  throw new Error("Step 11 requires the local fictional courier HTTP target");
export const { default: db } =
  await import("../../../packages/db/src/client.server");
const { CourierDispatchWorker } =
  await import("../../../apps/server/src/modules/delivery/dispatch-worker");
const { fakeWorkerDependencies } =
  await import("../../integration/fixtures/courier-worker");
export const serverUrl = "http://localhost:3000";
export async function body<T = any>(
  response: Awaited<ReturnType<APIRequestContext["get"]>>,
  status = 200,
): Promise<T> {
  expect(response.status(), await response.text()).toBe(status);
  return (await response.json()) as T;
}
export async function post<T = any>(
  api: APIRequestContext,
  path: string,
  data: unknown,
) {
  return body<T>(await api.post(serverUrl + path, { data }));
}
export async function fixture(api: APIRequestContext) {
  const marker = `v3-browser-${crypto.randomUUID()}`;
  await body(
    await api.put(serverUrl + "/admin/store-settings", {
      data: {
        storeName: "Fictional V3 shop",
        supportEmail: null,
        supportPhone: null,
        defaultCurrency: "BDT",
        orderNumberPrefix: "E2E",
        reservationDurationMinutes: 30,
        checkoutEnabled: true,
        checkoutNotice: null,
      },
    }),
  );
  const shipping = await post(api, "/admin/shipping/rates", {
    code: marker,
    label: "Fictional delivery",
    amount: "10.00",
    currency: "BDT",
    isDefault: true,
    isActive: true,
    sortOrder: 0,
  });
  const category = await post(api, "/admin/catalog/categories", {
    name: marker,
    slug: marker,
    brandPolicy: "optional",
    isActive: true,
  });
  const product = await post(api, "/admin/products", {
    categoryId: category.id,
    name: marker,
    slug: marker,
    description: "Fictional browser test product",
    searchKeywords: [marker],
  });
  await body(
    await api.put(serverUrl + `/admin/products/${product.id}/variants`, {
      data: {
        variants: [
          {
            sku: marker,
            name: "Default",
            price: "100.00",
            currency: "BDT",
            isDefault: true,
            isActive: true,
            attributeValueIds: [],
          },
        ],
      },
    }),
  );
  await body(
    await api.put(serverUrl + `/admin/products/${product.id}/highlights`, {
      data: {
        highlights: [
          {
            title: "Fictional",
            description: "Local browser evidence",
            sortOrder: 0,
          },
        ],
      },
    }),
  );
  await body(
    await api.patch(serverUrl + `/admin/products/${product.id}`, {
      data: { status: "active" },
    }),
  );
  const details = await body(
    await api.get(serverUrl + `/admin/products/${product.id}`),
  );
  const variantId = details.variants[0].id as string;
  const location = await post(api, "/admin/inventory/locations", {
    name: marker,
    code: marker,
    isActive: true,
  });
  await post(api, "/admin/inventory/receive", {
    variantId,
    locationId: location.id,
    quantity: 30,
    batchNumber: marker,
    notes: "Fictional initial stock",
  });
  const provider = await db.courierProvider.upsert({
    where: { code: "steadfast" },
    create: {
      code: "steadfast",
      displayName: "Local HTTP fixtures",
      capabilities: [
        "createConsignment",
        "getConsignmentStatus",
        "requestPickup",
        "createReturn",
      ],
    },
    update: {},
  });
  const connection = await db.courierConnection.create({
    data: {
      providerId: provider.id,
      publicId: marker,
      displayName: marker,
      enabled: true,
      environment: "test",
      credentialSource: "server_environment",
      healthState: "healthy",
    },
  });
  const service = await db.courierService.create({
    data: {
      connectionId: connection.id,
      code: marker,
      displayName: marker,
      enabled: true,
      methods: { create: { shippingRateId: shipping.id } },
    },
  });
  await db.courierRoutingRule.create({
    data: {
      name: marker,
      priority: 1,
      enabled: true,
      conditions: {},
      connectionId: connection.id,
      serviceId: service.id,
    },
  });
  return {
    marker,
    shipping,
    category,
    product,
    variantId,
    location,
    connection,
    service,
  };
}
export async function checkout(
  api: APIRequestContext,
  f: Awaited<ReturnType<typeof fixture>>,
) {
  return post<{ orderId: string }>(api, "/shop/checkout", {
    items: [{ variantId: f.variantId, quantity: 1 }],
    customerName: "Fictional customer",
    customerEmail: `${f.marker}@northstar.example.test`,
    customerPhone: "01700000000",
    shippingAddress: {
      fullName: "Fictional customer",
      phone: "01700000000",
      line1: "1 Fictional Road",
      city: "Dhaka",
      postalCode: "1205",
      country: "Bangladesh",
    },
    shippingRateId: f.shipping.id,
    paymentMethod: "cash_on_delivery",
    idempotencyKey: crypto.randomUUID(),
  });
}
export async function confirm(page: Page, id: string) {
  await page.goto(`/admin/orders/${id}`, { waitUntil: "networkidle" });
  await page.getByRole("combobox").filter({ hasText: "Pending" }).click();
  await page.getByRole("option", { name: "Confirmed", exact: true }).click();
  await page.getByRole("button", { name: "Update order", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await db.order.findUniqueOrThrow({ where: { id } })).inventoryStatus,
    )
    .toBe("committed");
}
export async function payment(page: Page, amount: string, reference: string) {
  await page
    .getByRole("button", { name: "Record confirmed payment", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: "Record evidence" }),
  ).toBeDisabled();
  await dialog.getByLabel("Amount (BDT)").focus();
  await dialog.getByLabel("Amount (BDT)").press("Tab");
  await expect(
    dialog.getByRole("combobox", { name: "Method", exact: true }),
  ).toBeFocused();
  await dialog.getByLabel("Amount (BDT)").fill(amount);
  await dialog.getByLabel("Collection reference").fill(reference);
  await dialog
    .getByLabel("Evidence / correction reason")
    .fill("Fictional bank evidence");
  await dialog.getByRole("button", { name: "Record evidence" }).click();
  await expect(dialog).toBeHidden();
}
export async function routeAndQueue(
  page: Page,
  id: string,
  f: Awaited<ReturnType<typeof fixture>>,
) {
  await page.goto(`/admin/orders/${id}`, { waitUntil: "networkidle" });
  const routing = page
    .locator('[data-slot="card"]')
    .filter({ hasText: "Courier routing" });
  await routing
    .getByRole("combobox", { name: "Connection and service" })
    .selectOption(`${f.connection.id}:${f.service.id}`);
  const override = routing.getByLabel("Override reason");
  if (await override.count()) await override.fill("Fictional route reviewed");
  await routing
    .getByRole("button", { name: "Confirm route", exact: true })
    .click();
  await expect
    .poll(() =>
      db.courierDispatch.count({ where: { orderId: id, status: "confirmed" } }),
    )
    .toBe(1);
  const dispatch = await db.courierDispatch.findFirstOrThrow({
    where: { orderId: id, status: "confirmed" },
  });
  await page.goto("/admin/couriers/shipments", { waitUntil: "networkidle" });
  const order = await db.order.findUniqueOrThrow({ where: { id } });
  const card = page
    .locator('[data-slot="card"]')
    .filter({ hasText: order.orderNumber });
  await card.getByRole("button", { name: "Queue dispatch" }).click();
  await expect
    .poll(() => db.courierConsignment.count({ where: { orderId: id } }))
    .toBe(1);
  return { dispatch, card, order };
}
export async function submit(id: string, connectionId: string) {
  await new CourierDispatchWorker(
    fakeWorkerDependencies(db, connectionId, async (request) => ({
      invoice: request.invoice,
      externalId: `fake-${request.invoice}`,
      trackingCode: `track-${request.invoice}`,
      providerState: "pending",
    })),
  ).runOnce();
  const c = await db.courierConsignment.findFirstOrThrow({
    where: { orderId: id },
  });
  expect(c.externalId).not.toBeNull();
  return {
    ...c,
    orderNumber: (await db.order.findUniqueOrThrow({ where: { id } }))
      .orderNumber,
  };
}
export async function webhook(
  api: APIRequestContext,
  c: { invoice: string; externalId: string | null },
  connection: { publicId: string },
  state: string,
  event: string = crypto.randomUUID(),
) {
  const raw = JSON.stringify({
    notification_type: "delivery_status",
    consignment_id: c.externalId,
    invoice: c.invoice,
    status: state,
    updated_at: new Date().toISOString(),
  });
  return body(
    await api.post(serverUrl + `/courier/webhooks/${connection.publicId}`, {
      data: raw,
      headers: {
        "content-type": "application/json",
        authorization: "Bearer step11-fictional-webhook",
        "x-signature": createHmac("sha256", "step11-fictional-webhook")
          .update(raw)
          .digest("hex"),
        "idempotency-key": event,
      },
    }),
  );
}
export async function shopper(browser: Browser) {
  return browser.newContext({
    baseURL: "http://localhost:3001",
    storageState: TEST_USERS.user.storageStatePath,
  });
}
