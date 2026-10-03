import { expect, test } from "@playwright/test";
import {
  db,
  fixture,
  body,
  post,
  checkout,
  confirm,
  submit,
  routeAndQueue,
  webhook,
  serverUrl,
  shopper,
} from "../fixtures/v3";
test.setTimeout(180000);
test.beforeEach(({ page }) => {
  page.setDefaultTimeout(15000);
});
test("gadget serial/IMEI registration, assignment and purchaser warranty review work through the UI", async ({
  page,
  browser,
}) => {
  const f = await fixture(page.request);
  await body(
    await page.request.patch(
      serverUrl + `/admin/catalog/categories/${f.category.id}`,
      {
        data: {
          fulfillmentKind: "gadget",
          serialTracking: "serial_and_imei",
          warrantyDays: 30,
        },
      },
    ),
  );
  const stock = await db.inventoryStock.findFirstOrThrow({
    where: { variantId: f.variantId },
  });
  const serial = f.marker.toUpperCase(),
    imei = (
      crypto.getRandomValues(new BigUint64Array(1))[0]! % 1000000000000000n
    )
      .toString()
      .padStart(15, "0");
  await page.goto("/admin/inventory", { waitUntil: "networkidle" });
  await page
    .getByLabel("Received stock", { exact: true })
    .selectOption(stock.id);
  await page.getByLabel("Serial", { exact: true }).fill(serial);
  await page.getByLabel("IMEI", { exact: true }).fill(imei);
  await page
    .getByRole("button", { name: "Register unit", exact: true })
    .click();
  await expect
    .poll(() => db.inventoryUnit.count({ where: { serial } }))
    .toBe(1);
  expect(
    (await db.inventoryStock.findUniqueOrThrow({ where: { id: stock.id } }))
      .quantityOnHand,
  ).toBe(30);
  const customer = await shopper(browser);
  try {
    const order = await checkout(customer.request, f);
    await confirm(page, order.orderId);
    const line = await db.orderLineItem.findFirstOrThrow({
        where: { orderId: order.orderId },
      }),
      unit = await db.inventoryUnit.findUniqueOrThrow({ where: { serial } });
    await page
      .getByRole("combobox", { name: "Order item", exact: true })
      .selectOption(line.id);
    await page
      .getByRole("combobox", { name: "Available unit", exact: true })
      .selectOption(unit.id);
    await page
      .getByRole("button", { name: "Assign unit", exact: true })
      .click();
    await expect
      .poll(
        async () =>
          (await db.inventoryUnit.findUniqueOrThrow({ where: { id: unit.id } }))
            .state,
      )
      .toBe("assigned");
    await routeAndQueue(page, order.orderId, f);
    const c = await submit(order.orderId, f.connection.id);
    await webhook(page.request, c, f.connection, "delivered");
    const shop = await customer.newPage();
    await shop.goto("/track-order", { waitUntil: "networkidle" });
    await shop.getByLabel("Order number", { exact: true }).fill(c.orderNumber);
    await shop.getByRole("button", { name: "Find order", exact: true }).click();
    await expect(shop.getByText(new RegExp(serial))).toBeVisible();
    await shop
      .getByLabel("Describe the problem", { exact: true })
      .fill("Fictional gadget fault");
    await shop
      .getByRole("button", { name: "Request warranty review", exact: true })
      .click();
    await expect
      .poll(() =>
        db.warrantyClaim.count({
          where: { allocation: { unitId: unit.id }, state: "open" },
        }),
      )
      .toBe(1);
    await page.goto(`/admin/orders/${order.orderId}`, {
      waitUntil: "networkidle",
    });
    await page
      .getByLabel("Preparation, issue or resolution evidence", { exact: true })
      .fill("Fictional warranty evidence reviewed");
    await page
      .getByRole("button", { name: "Approve claim", exact: true })
      .click();
    await expect
      .poll(() =>
        db.warrantyClaim.count({
          where: { allocation: { unitId: unit.id }, state: "approved" },
        }),
      )
      .toBe(1);
  } finally {
    await customer.close();
  }
});

test("fresh food preparation retains capacity on cancellation and cannot use parcel routing or warranty", async ({
  page,
}) => {
  const f = await fixture(page.request);
  await body(
    await page.request.patch(
      serverUrl + `/admin/catalog/categories/${f.category.id}`,
      {
        data: {
          fulfillmentKind: "fresh_food",
          serialTracking: "none",
          warrantyDays: 0,
        },
      },
    ),
  );
  await body(
    await page.request.patch(
      serverUrl + `/admin/catalog/categories/${f.category.id}`,
      { data: { warrantyDays: 30 } },
    ),
    400,
  );
  const now = Date.now();
  const slot = await post(page.request, "/admin/orders/food-slots", {
    label: f.marker,
    postalCodes: ["1205"],
    capacityUnits: 1,
    cutoffAt: new Date(now + 3600000).toISOString(),
    startsAt: new Date(now + 7200000).toISOString(),
    endsAt: new Date(now + 10800000).toISOString(),
  });
  const order = await post(page.request, "/shop/checkout", {
    items: [{ variantId: f.variantId, quantity: 1 }],
    customerName: "Fictional food customer",
    customerEmail: `${f.marker}@northstar.example.test`,
    shippingAddress: {
      line1: "1 Fictional Road",
      postalCode: "1205",
      country: "Bangladesh",
    },
    shippingRateId: f.shipping.id,
    paymentMethod: "cash_on_delivery",
    foodSlotId: slot.id,
    idempotencyKey: crypto.randomUUID(),
  });
  await confirm(page, order.orderId);
  await page
    .getByLabel("Preparation, issue or resolution evidence", { exact: true })
    .fill("Fictional food preparation started");
  await page
    .getByRole("button", { name: "Start preparation", exact: true })
    .click();
  await expect
    .poll(
      async () =>
        (
          await db.foodOrderBooking.findUniqueOrThrow({
            where: { orderId: order.orderId },
          })
        ).state,
    )
    .toBe("preparing");
  await body(
    await page.request.post(
      serverUrl + `/admin/delivery/orders/${order.orderId}/confirm`,
      { data: { connectionId: f.connection.id, serviceId: f.service.id } },
    ),
    409,
  );
  await page.getByRole("button", { name: "Cancel order", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Reason", { exact: true })
    .fill("Fictional preparation cancellation");
  await dialog
    .getByRole("button", { name: "Cancel order", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  expect(
    (await db.foodDeliverySlot.findUniqueOrThrow({ where: { id: slot.id } }))
      .reservedUnits,
  ).toBe(1);
  expect(
    (await db.order.findUniqueOrThrow({ where: { id: order.orderId } }))
      .inventoryStatus,
  ).toBe("committed");
  await expect(
    page.getByRole("button", { name: "Restock all items", exact: true }),
  ).toBeDisabled();
});
