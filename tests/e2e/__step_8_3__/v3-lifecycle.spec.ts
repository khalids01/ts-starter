import { expect, test, request } from "@playwright/test";
import {
  db,
  fixture,
  checkout,
  confirm,
  payment,
  routeAndQueue,
  submit,
  webhook,
  body,
  serverUrl,
  shopper,
} from "../fixtures/v3";
import { TEST_USERS } from "../../users-config";
test.setTimeout(180000);
test.beforeEach(({ page }) => {
  page.setDefaultTimeout(15000);
});

test("V3 checkout, deposit, courier pickup/handoff, signed tracking, settlement and completion persist", async ({
  page,
  browser,
}) => {
  const f = await fixture(page.request);
  const customer = await shopper(browser);
  try {
    const shop = await customer.newPage();
    // Navigate through the actual catalog link, then checkout UI.
    await shop.goto(`/shop?search=${encodeURIComponent(f.marker)}`);
    await shop.waitForLoadState("networkidle");
    await shop
      .getByRole("article")
      .getByRole("link", { name: f.marker, exact: true })
      .click();
    await shop
      .getByRole("button", { name: "Add to cart", exact: true })
      .click();
    await shop.goto("/checkout");
    await shop.waitForLoadState("networkidle");
    await shop.getByLabel("Name", { exact: true }).fill("Fictional buyer");
    await shop.getByLabel("Email", { exact: true }).fill(TEST_USERS.user.email);
    await shop.getByLabel("Phone", { exact: true }).fill("01700000000");
    await shop.getByLabel("Address line 1").fill("1 Fictional Road");
    await shop.getByLabel("City", { exact: true }).fill("Dhaka");
    await shop.getByLabel("Postal code").fill("1205");
    await shop
      .getByRole("button", { name: "Place order", exact: true })
      .click();
    await expect(shop).toHaveURL(/\/checkout\/success\//);
    const id = shop.url().split("/").at(-1)!;
    await confirm(page, id);
    await payment(page, "30.00", `${f.marker}-deposit`);
    expect(
      (await db.order.findUniqueOrThrow({ where: { id } })).paymentStatus,
    ).toBe("partially_paid");
    await routeAndQueue(page, id, f);
    const c = await submit(id, f.connection.id);
    expect(String(c.codAmount)).toBe("80");
    await body(
      await page.request.post(serverUrl + `/admin/orders/${id}/ship`, {
        data: { carrier: "Forbidden bypass", trackingNumber: "fake" },
      }),
      409,
    );
    await page.reload();
    let card = page
      .locator('[data-slot="card"]')
      .filter({ hasText: c.orderNumber });
    await card
      .getByRole("button", { name: "Request pickup", exact: true })
      .click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("Pickup address ID", { exact: true }).fill("1");
    await dialog.getByLabel("Police station ID").fill("1");
    await dialog
      .getByLabel("Pickup address", { exact: true })
      .fill("1 Fictional Warehouse");
    await dialog.getByLabel("Contact number").fill("01700000000");
    await dialog.getByRole("button", { name: "Send pickup request" }).click();
    await expect(dialog).toBeHidden();
    await card.getByRole("button", { name: "Mark handed over" }).click();
    await expect
      .poll(
        async () =>
          (await db.order.findUniqueOrThrow({ where: { id } })).deliveryStatus,
      )
      .toBe("shipped");
    await webhook(
      page.request,
      c,
      f.connection,
      "delivered",
      `${f.marker}-delivered`,
    );
    await expect
      .poll(
        async () =>
          (await db.order.findUniqueOrThrow({ where: { id } })).deliveryStatus,
      )
      .toBe("delivered");
    expect(
      (
        await webhook(
          page.request,
          c,
          f.connection,
          "delivered",
          `${f.marker}-delivered`,
        )
      ).duplicate,
    ).toBe(true);
    await page.reload();
    card = page
      .locator('[data-slot="card"]')
      .filter({ hasText: c.orderNumber });
    await card
      .getByRole("button", { name: "Record settlement", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("Collection/reference ID")
      .fill(`${f.marker}-payout`);
    await dialog.getByLabel("Amount", { exact: true }).fill("80.00");
    await dialog.getByLabel("Evidence note").fill("Fictional merchant payout");
    await dialog
      .getByRole("button", { name: "Record settlement", exact: true })
      .click();
    await expect(dialog).toBeHidden();
    await expect
      .poll(
        async () =>
          (await db.order.findUniqueOrThrow({ where: { id } })).paymentStatus,
      )
      .toBe("paid");
    await page.goto(`/admin/orders/${id}`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("combobox").filter({ hasText: "Confirmed" }).click();
    await page.getByRole("option", { name: "Completed", exact: true }).click();
    await page
      .getByRole("button", { name: "Update order", exact: true })
      .click();
    await expect
      .poll(
        async () =>
          (await db.order.findUniqueOrThrow({ where: { id } })).orderStatus,
      )
      .toBe("completed");
    expect(
      await db.courierShipmentClaim.count({ where: { orderId: id } }),
    ).toBe(0);
    expect(await db.orderPayment.count({ where: { orderId: id } })).toBe(2);
    expect(
      await db.orderStatusEvent.count({ where: { orderId: id } }),
    ).toBeGreaterThan(5);
    await body(
      await page.request.patch(serverUrl + `/admin/orders/${id}`, {
        data: { adminNotes: `${f.marker}-private-note` },
      }),
    );
    const privateOrder = await body(
      await shop.request.get(serverUrl + `/shop/orders/${c.orderNumber}`),
    );
    expect(JSON.stringify(privateOrder)).not.toContain(
      `${f.marker}-private-note`,
    );
    const anon = await request.newContext({
      storageState: { cookies: [], origins: [] },
    });
    try {
      expect([401, 404]).toContain(
        (await anon.get(serverUrl + `/shop/orders/${c.orderNumber}`)).status(),
      );
    } finally {
      await anon.dispose();
    }
    await shop.goto("/track-order");
    await shop.waitForLoadState("networkidle");
    await shop.getByLabel("Order number").fill(c.orderNumber);
    await shop.getByRole("button", { name: "Find order", exact: true }).click();
    await expect(shop.getByText(c.orderNumber, { exact: true })).toBeVisible();
  } finally {
    await customer.close();
  }
});

test("V3 cancellation and return require physical receipt, inspection and one explicit restock", async ({
  page,
}) => {
  const f = await fixture(page.request);
  const first = await checkout(page.request, f);
  await confirm(page, first.orderId);
  await routeAndQueue(page, first.orderId, f);
  await page.goto(`/admin/orders/${first.orderId}`);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Cancel order", exact: true }).click();
  let dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Reason", { exact: true })
    .fill("Fictional pre-submit cancellation");
  await dialog
    .getByRole("button", { name: "Cancel order", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  expect(
    (await db.order.findUniqueOrThrow({ where: { id: first.orderId } }))
      .inventoryStatus,
  ).toBe("restocked");
  expect(
    await db.courierShipmentClaim.count({ where: { orderId: first.orderId } }),
  ).toBe(0);
  const second = await checkout(page.request, f);
  await confirm(page, second.orderId);
  await payment(page, "30.00", `${f.marker}-return-deposit`);
  await routeAndQueue(page, second.orderId, f);
  const c = await submit(second.orderId, f.connection.id);
  await page.reload();
  let card = page
    .locator('[data-slot="card"]')
    .filter({ hasText: c.orderNumber });
  await card.getByRole("button", { name: "Mark handed over" }).click();
  await card
    .getByRole("button", { name: "Request return", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Reason", { exact: true })
    .fill("Fictional return review");
  await dialog
    .getByRole("button", { name: "Record return", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  await page.goto("/admin/couriers/returns");
  await page.waitForLoadState("networkidle");
  card = page.locator('[data-slot="card"]').filter({ hasText: c.orderNumber });
  await card.getByRole("button", { name: "Submit to courier" }).click();
  await expect
    .poll(
      async () =>
        (
          await db.courierReturn.findFirstOrThrow({
            where: { consignmentId: c.id },
          })
        ).externalId,
    )
    .not.toBeNull();
  await card.getByRole("button", { name: "Mark processing" }).click();
  await card.getByRole("button", { name: "Mark completed" }).click();
  expect(
    (await db.order.findUniqueOrThrow({ where: { id: second.orderId } }))
      .inventoryStatus,
  ).toBe("committed");
  await page.goto(`/admin/orders/${second.orderId}`);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Cancel order", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Reason", { exact: true })
    .fill("Fictional failed delivery cancellation");
  await dialog
    .getByRole("button", { name: "Cancel order", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  await page
    .getByRole("button", { name: "Record receipt", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByRole("checkbox", { name: "Every order item physically received" })
    .check();
  await dialog
    .getByLabel("Evidence / reason")
    .fill("Fictional full warehouse receipt");
  await dialog
    .getByRole("button", { name: "Record full physical receipt" })
    .click();
  await expect(dialog).toBeHidden();
  await page
    .getByRole("button", { name: "Inspect inventory", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Condition").click();
  await page.getByRole("option", { name: "Every item sellable" }).click();
  await dialog
    .getByLabel("Evidence / reason")
    .fill("Fictional sellable inspection");
  await dialog
    .getByRole("button", { name: "Inspect received inventory" })
    .click();
  await expect(dialog).toBeHidden();
  await page
    .getByRole("button", { name: "Restock all items", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Evidence / reason")
    .fill("Fictional whole-order restock");
  await dialog
    .getByRole("button", { name: "Restock all inspected inventory" })
    .click();
  await expect(dialog).toBeHidden();
  await expect
    .poll(
      async () =>
        (await db.order.findUniqueOrThrow({ where: { id: second.orderId } }))
          .inventoryStatus,
    )
    .toBe("restocked");
  await page
    .getByRole("button", { name: "Record refund", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  const refundAmount = dialog.getByLabel("Amount (BDT)");
  const refundReason = dialog.getByLabel("Reason", { exact: true });
  await expect(refundAmount).toBeFocused();
  await refundAmount.pressSequentially("30.00");
  await refundReason.pressSequentially("Fictional returned deposit");
  await expect(refundAmount).toHaveValue("30.00");
  await expect(refundReason).toHaveValue("Fictional returned deposit");
  await dialog
    .getByRole("button", { name: "Record refund", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  expect(
    (await db.order.findUniqueOrThrow({ where: { id: second.orderId } }))
      .paymentStatus,
  ).toBe("refunded");
  const stock = await db.inventoryStock.findFirstOrThrow({
    where: { variantId: f.variantId },
  });
  expect(stock.quantityOnHand).toBe(30);
  expect(stock.quantityReserved).toBe(0);
  expect(
    await db.orderRecovery.count({
      where: { orderId: second.orderId, restockedAt: { not: null } },
    }),
  ).toBe(1);
});

test("V3 duplicate routing and changed payment preserve one shipment; expiry rejection is visible", async ({
  page,
}) => {
  const f = await fixture(page.request);
  const order = await checkout(page.request, f);
  await confirm(page, order.orderId);
  await routeAndQueue(page, order.orderId, f);
  await body(
    await page.request.post(
      serverUrl + `/admin/delivery/orders/${order.orderId}/confirm`,
      { data: { connectionId: f.connection.id, serviceId: f.service.id } },
    ),
    409,
  );
  expect(
    await db.courierShipmentClaim.count({ where: { orderId: order.orderId } }),
  ).toBe(1);
  await page.goto(`/admin/orders/${order.orderId}`, {
    waitUntil: "networkidle",
  });
  await payment(page, "20.00", `${f.marker}-changed-payment`);
  expect(
    (
      await db.courierConsignment.findFirstOrThrow({
        where: { orderId: order.orderId },
      })
    ).state,
  ).toBe("cancelled_before_submission");
  expect(
    await db.courierShipmentClaim.count({ where: { orderId: order.orderId } }),
  ).toBe(0);
  const expired = await checkout(page.request, f);
  const stock = await db.inventoryStock.findFirstOrThrow({
    where: { variantId: f.variantId },
  });
  await db.inventoryBatch.update({
    where: { id: stock.batchId! },
    data: { expiryDate: new Date(Date.now() - 1000) },
  });
  await page.goto(`/admin/orders/${expired.orderId}`, {
    waitUntil: "networkidle",
  });
  await page.getByRole("combobox").filter({ hasText: "Pending" }).click();
  await page.getByRole("option", { name: "Confirmed", exact: true }).click();
  const response = page.waitForResponse(
    (r) =>
      r.url().includes(`/admin/orders/${expired.orderId}/status`) &&
      r.request().method() === "PATCH",
  );
  await page.getByRole("button", { name: "Update order", exact: true }).click();
  expect((await response).status()).toBe(409);
  await expect(
    page.getByText(
      "Reserved inventory expired or is unavailable; release and place a new order",
      { exact: true },
    ),
  ).toBeVisible();
  expect(
    (await db.order.findUniqueOrThrow({ where: { id: expired.orderId } }))
      .inventoryStatus,
  ).toBe("reserved");
  await page.goto(`/shop/products/${f.marker}`, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("button", { name: "Add to cart", exact: true }),
  ).toBeDisabled();
});
