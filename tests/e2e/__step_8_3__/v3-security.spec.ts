import { expect, request, test } from "@playwright/test";
import { createHmac } from "node:crypto";
import { db, fixture, checkout, confirm, routeAndQueue, submit, body, serverUrl } from "../fixtures/v3";
import { TEST_USERS } from "../../users-config";

test("customer order ownership fails closed despite matching contact details", async ({ page }) => {
  const f = await fixture(page.request);
  const customer = await request.newContext({ baseURL: serverUrl, storageState: TEST_USERS.user.storageStatePath });
  const other = await request.newContext({ baseURL: serverUrl, storageState: TEST_USERS.commerceViewer.storageStatePath });
  const anonymous = await request.newContext({ baseURL: serverUrl, storageState: { cookies: [], origins: [] } });
  try {
    const created = await checkout(customer, f);
    const before = await db.order.findUniqueOrThrow({ where: { id: created.orderId } });
    await body(await customer.get(`/shop/orders/${before.orderNumber}`));
    for (const api of [other, anonymous]) {
      const response = await api.get(`/shop/orders/${before.orderNumber}`, { params: { email: before.customerEmail ?? "", phone: before.customerPhone ?? "" } });
      expect([401, 404]).toContain(response.status());
      expect(await response.text()).not.toContain(before.customerEmail);
    }
    const after = await db.order.findUniqueOrThrow({ where: { id: created.orderId } });
    expect(after).toEqual(before);
  } finally { await Promise.all([customer.dispose(), other.dispose(), anonymous.dispose()]); }
});

test("raw webhook authentication, tampering and replay cannot alter money or duplicate tracking", async ({ page }) => {
  test.setTimeout(120000);
  const f = await fixture(page.request);
  const created = await checkout(page.request, f);
  await confirm(page, created.orderId);
  await routeAndQueue(page, created.orderId, f);
  const consignment = await submit(created.orderId, f.connection.id);
  const raw = JSON.stringify({ notification_type: "tracking_update", consignment_id: consignment.externalId, invoice: consignment.invoice, tracking_message: "Fictional security update", updated_at: new Date().toISOString() });
  const headers = { "content-type": "application/json", authorization: "Bearer step11-fictional-webhook", "x-signature": createHmac("sha256", "step11-fictional-webhook").update(raw).digest("hex"), "idempotency-key": "fictional-security-event" };
  const path = serverUrl + `/courier/webhooks/${f.connection.publicId}`;
  const before = await db.order.findUniqueOrThrow({ where: { id: created.orderId } });
  for (const [data, override] of [
    [raw, { authorization: "Bearer wrong-fictional-token" }],
    [raw, { "x-signature": "invalid-signature" }],
    [raw + " ", {}],
  ] as const) {
    expect((await page.request.post(path, { data, headers: { ...headers, ...override } })).status()).toBe(401);
  }
  for (const malformed of ["{", JSON.stringify({ notification_type: "unknown" })]) {
    const signature = createHmac("sha256", "step11-fictional-webhook").update(malformed).digest("hex");
    expect((await page.request.post(path, { data: malformed, headers: { ...headers, "x-signature": signature } })).status()).toBe(401);
  }
  expect((await page.request.post(path, { data: "x".repeat(1_100_000), headers })).status()).toBe(413);
  expect((await page.request.post(serverUrl + "/courier/webhooks/unknown-fictional-connection", { data: raw, headers })).status()).toBe(404);
  const first = await body(await page.request.post(path, { data: raw, headers }));
  expect(first.duplicate).toBe(false);
  const second = await body(await page.request.post(path, { data: raw, headers: { ...headers, "idempotency-key": "changed-unsigned-header" } }));
  expect(second.duplicate).toBe(true);
  expect(await db.courierEvent.count({ where: { consignmentId: consignment.id, eventType: "tracking_update" } })).toBe(1);
  const otherConnection = await fixture(page.request);
  const crossConnection = await page.request.post(serverUrl + `/courier/webhooks/${otherConnection.connection.publicId}`, { data: raw, headers });
  expect(crossConnection.status()).toBe(500);
  expect(await crossConnection.text()).toBe('{"received":false}');
  expect(await db.courierEvent.count({ where: { consignmentId: consignment.id, eventType: "tracking_update" } })).toBe(1);
  expect(await db.order.findUniqueOrThrow({ where: { id: created.orderId } })).toEqual(before);
});

test("cross-origin form submissions cannot create payment evidence using an owner cookie", async ({ page }) => {
  const f = await fixture(page.request);
  const created = await checkout(page.request, f);
  const before = await db.order.findUniqueOrThrow({ where: { id: created.orderId } });
  const paymentCount = await db.orderPayment.count({ where: { orderId: created.orderId } });
  const response = await page.request.post(serverUrl + `/admin/orders/${created.orderId}/payments`, {
    headers: { origin: "https://attacker.example.test" },
    form: { amount: "10.00", currency: "BDT", method: "manual_bank", reference: f.marker, note: "Fictional hostile-origin receipt" },
  });
  expect(response.status()).toBe(403);
  expect(await db.orderPayment.count({ where: { orderId: created.orderId } })).toBe(paymentCount);
  expect(await db.order.findUniqueOrThrow({ where: { id: created.orderId } })).toEqual(before);
});
