import { expect, request, test, type APIRequestContext, type BrowserContext } from "@playwright/test";
import prisma from "../../../packages/db/src/client.server";
import { e2eRuntimeConfig } from "../../../packages/config/src/e2e.config";
import { TEST_USERS } from "../../users-config";
import { assertTestEnvironment } from "../../setup/assert-test-environment";

test.setTimeout(120_000);
test("customer checkout, ledger, ownership and responsive account pages", async ({
  browser,
}) => {
  assertTestEnvironment();
  const marker = `e2e-customer-${Date.now()}`;
  const contexts: Array<APIRequestContext | BrowserContext> = [];
  let variantId: string | undefined;
  let categoryId: string | undefined;
  let productId: string | undefined;
  let locationId: string | undefined;
  let shippingId: string | undefined;
  const originalOrders = await prisma.order.count();
  const profile = await prisma.user.findUniqueOrThrow({
    where: { email: TEST_USERS.user.email },
    select: { id: true, name: true },
  });
  try {
    const customer = await request.newContext({
      baseURL: e2eRuntimeConfig.serverUrl,
      storageState: TEST_USERS.user.storageStatePath,
    });
    contexts.push(customer);
    const owner = await request.newContext({
      baseURL: e2eRuntimeConfig.serverUrl,
      storageState: TEST_USERS.owner.storageStatePath,
    });
    contexts.push(owner);
    const other = await request.newContext({
      baseURL: e2eRuntimeConfig.serverUrl,
      storageState: TEST_USERS.commerceViewer.storageStatePath,
    });
    contexts.push(other);
    const anonymous = await request.newContext({
      baseURL: e2eRuntimeConfig.serverUrl,
    });
    contexts.push(anonymous);
    expect((await customer.get("/shop/orders")).status()).toBe(200);
    expect((await owner.get("/admin/store-settings")).status()).toBe(200);
    const category = await prisma.category.create({
      data: { name: marker, slug: marker, fulfillmentKind: "packaged_food" },
    });
    categoryId = category.id;
    const product = await prisma.product.create({
      data: {
        categoryId,
        name: marker,
        slug: marker,
        status: "active",
        coverImageUrl: "/brands/foodshop/products/honey.webp",
        variants: {
          create: {
            sku: marker,
            name: "500g",
            price: "1000.00",
            imageUrls: ["/brands/foodshop/products/honey.webp"],
            isDefault: true,
          },
        },
      },
      include: { variants: true },
    });
    productId = product.id;
    variantId = product.variants[0]!.id;
    const location = await prisma.inventoryLocation.create({
      data: { name: marker, code: marker },
    });
    locationId = location.id;
    const receipt = await owner.post("/admin/inventory/receive", {
      data: {
        variantId,
        locationId,
        quantity: 10,
        batchNumber: marker,
        notes: "Fictional customer journey fixture",
      },
    });
    expect(receipt.status(), await receipt.text()).toBe(200);
    const shipping = await prisma.shippingRate.create({
      data: {
        code: marker,
        label: marker,
        amount: "50.00",
        currency: "BDT",
        isDefault: false,
      },
    });
    shippingId = shipping.id;
    const context = await browser.newContext({
      baseURL: e2eRuntimeConfig.webUrl,
      storageState: TEST_USERS.user.storageStatePath,
    });
    contexts.push(context);
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(15_000);
    await page.goto(`/shop/products/${marker}`);
    await page
      .getByRole("button", { name: "Add to cart", exact: true })
      .click();
    await expect(page.getByText("Added to cart", { exact: true })).toBeVisible();
    await page.goto("/cart");
    await expect(
      page.getByRole("heading", { name: "Your shopping bag" }),
    ).toBeVisible();
    await page.goto("/checkout");
    for (const [label, value] of Object.entries({
      Name: "Fictional Shopper",
      Email: TEST_USERS.user.email,
      Phone: "+8801700000000",
      "Address line 1": "Fictional Local Road",
      City: "Dhaka",
      "Postal code": "1205",
    }))
      await page.getByLabel(label, { exact: true }).fill(value);
    await page.getByRole("radio", { name: new RegExp(marker) }).check();
    await page
      .getByRole("button", { name: "Place order", exact: true })
      .click();
    await expect(page).toHaveURL(/\/checkout\/success\//);
    await expect(
      page.getByRole("heading", { name: "Thank you for your order" }),
    ).toBeVisible();
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: page.url().split("/").at(-1)! },
      include: { statusEvents: true },
    });
    expect(order.totalAmount.toString()).toBe("1050");
    expect(order.customerEmail).toBe(TEST_USERS.user.email);
    expect(order.statusEvents.length).toBeGreaterThan(0);
    const stock = await prisma.inventoryStock.findFirstOrThrow({
      where: { variantId },
    });
    expect(stock.quantityOnHand).toBe(10);
    expect(stock.quantityReserved).toBe(1);
    expect(
      await prisma.stockReservation.count({
        where: { variantId, referenceId: order.id, status: "active" },
      }),
    ).toBe(1);
    await expect(
      page.getByText(order.orderNumber, { exact: true }),
    ).toBeVisible();
    const payment = await owner.post(`/admin/orders/${order.id}/payments`, {
      data: {
        amount: "300.00",
        currency: "BDT",
        method: "manual_bank",
        reference: marker,
        note: "Fictional partial receipt",
      },
    });
    expect(payment.status(), await payment.text()).toBe(200);
    const detail = await customer.get(`/shop/orders/${order.orderNumber}`);
    expect(detail.status()).toBe(200);
    expect((await detail.json()).money).toMatchObject({
      received: "300.00",
      outstanding: "750.00",
    });
    expect(
      (
        await other.get(
          `/shop/orders/${order.orderNumber}?email=${encodeURIComponent(TEST_USERS.user.email)}`,
        )
      ).status(),
    ).toBe(404);
    expect(
      (await anonymous.get(`/shop/orders/${order.orderNumber}`)).status(),
    ).toBe(404);
    const list = await (
      await customer.get("/shop/orders?page=1&limit=1")
    ).json();
    expect(list.items).toHaveLength(1);
    expect(list.total).toBeGreaterThan(0);
    expect((await customer.get("/shop/orders?limit=51")).status()).toBe(422);
    await page.goto(`/orders/${order.orderNumber}`);
    await expect(
      page.getByText("Remaining to pay", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/^BDT\s+750\.00$/)).toBeVisible();
    await page.goto("/account");
    await page.getByLabel("Name", { exact: true }).fill(marker);
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await expect
      .poll(
        async () =>
          (await prisma.user.findUniqueOrThrow({ where: { id: profile.id } }))
            .name,
      )
      .toBe(marker);
    await page.reload();
    await expect(page.getByLabel("Name", { exact: true })).toHaveValue(marker);
    await page.goto("/settings");
    await page.getByRole("button", { name: "dark", exact: true }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.getByRole("button", { name: "light", exact: true }).click();
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "/",
        "/about",
        "/dashboard",
        "/orders",
        `/orders/${order.orderNumber}`,
        "/account",
        "/settings",
        "/contact",
        "/shipping",
        "/saved",
        "/cart",
      ]) {
        await page.goto(route);
        await expect(page.locator("h1").first()).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${route} at ${width}`,
        ).toBe(true);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    await page.screenshot({
      path: "tests/artifacts/customer/mobile-dashboard.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/orders/${order.orderNumber}`);
    await page.screenshot({
      path: "tests/artifacts/customer/desktop-order.png",
      fullPage: true,
    });
    await prisma.category.update({
      where: { id: categoryId },
      data: { fulfillmentKind: "fresh_food" },
    });
    await page.goto(`/shop/products/${marker}`);
    await page
      .getByRole("button", { name: "Add to cart", exact: true })
      .click();
    await expect(page.getByText("Added to cart", { exact: true })).toBeVisible();
    await page.goto("/checkout");
    await expect(
      page.getByLabel("Fresh-food delivery slot", { exact: true }),
    ).toBeVisible();
    await page.evaluate(() => {
      const cart = JSON.parse(localStorage.getItem("shop-cart")!);
      for (const item of cart.state.items) delete item.product.fulfillmentKind;
      localStorage.setItem("shop-cart", JSON.stringify(cart));
    });
    await page.reload();
    await expect(page.getByLabel("Fresh-food delivery slot", { exact: true })).toBeVisible();
    for (const [label, value] of Object.entries({
      Name: "Fictional Shopper",
      Email: TEST_USERS.user.email,
      Phone: "+8801700000000",
      "Address line 1": "Fictional Local Road",
      City: "Dhaka",
      "Postal code": "99999",
    }))
      await page.getByLabel(label, { exact: true }).fill(value);
    await expect(
      page.getByRole("button", { name: "Place order", exact: true }),
    ).toBeDisabled();
    for (const route of ["/terms", "/privacy", "/returns"])
      expect((await page.request.get(route)).status()).toBe(404);
  } finally {
    // Only this run's product determines owned orders, including a checkout that failed after persistence.
    const orders = productId
      ? await prisma.order.findMany({
          where: { lineItems: { some: { productId } } },
          select: { id: true, ecommerceCustomerId: true },
        })
      : [];
    const ids = orders.map((order) => order.id);
    await prisma.orderPayment.deleteMany({ where: { orderId: { in: ids } } });
    if (variantId) {
      await prisma.stockReservation.deleteMany({ where: { variantId } });
      await prisma.inventoryMovement.deleteMany({ where: { variantId } });
    }
    await prisma.order.deleteMany({ where: { id: { in: ids } } });
    if (variantId) {
      await prisma.inventoryStock.deleteMany({ where: { variantId } });
      await prisma.inventoryBatch.deleteMany({ where: { variantId } });
    }
    if (productId) await prisma.product.delete({ where: { id: productId } });
    if (categoryId) await prisma.category.delete({ where: { id: categoryId } });
    if (locationId)
      await prisma.inventoryLocation.delete({ where: { id: locationId } });
    if (shippingId)
      await prisma.shippingRate.delete({ where: { id: shippingId } });
    for (const context of contexts) {
      if ("dispose" in context) await context.dispose();
      else await context.close();
    }
    expect(await prisma.order.count()).toBe(originalOrders);
    await prisma.user.update({
      where: { id: profile.id },
      data: { name: profile.name },
    });
    await prisma.$disconnect();
  }
});
