import { chromium, request, type APIRequestContext, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import prisma from "../../packages/db/src/client.server";
import { e2eRuntimeConfig } from "../../packages/config/src/e2e.config";
import { assertTestEnvironment } from "../setup/assert-test-environment";
import { TEST_USERS } from "../users-config";

assertTestEnvironment();

const marker = "tutorial-product-order-v1";
const productName = "Tutorial Golden Honey";
const categorySlug = `${marker}-category`;
const brandSlug = `${marker}-brand`;
const productSlug = `${marker}-product`;
const locationCode = `${marker}-location`;
const shippingCode = `${marker}-shipping`;
const sku = `${marker}-sku`;
const output = resolve(
  import.meta.dir,
  "../../docs/tutorials/01-product-to-completed-order/frames",
);

type Created = {
  categoryId?: string;
  brandId?: string;
  productId?: string;
  variantId?: string;
  locationId?: string;
  shippingRateId?: string;
  orderId?: string;
};

const created: Created = {};

async function json<T>(response: Awaited<ReturnType<APIRequestContext["get"]>>) {
  if (!response.ok()) {
    throw new Error(`${response.status()} ${await response.text()}`);
  }
  return response.json() as Promise<T>;
}

async function post<T>(api: APIRequestContext, path: string, data: unknown) {
  return json<T>(await api.post(path, { data }));
}

async function frame(page: Page, name: string) {
  await page.waitForTimeout(300);
  await page.screenshot({ path: resolve(output, `${name}.png`) });
}

async function waitForOrderDetail(page: Page) {
  await page.getByRole("heading", { name: "Cancellation and refunds" }).waitFor();
  await page.getByRole("heading", { name: "Fulfillment" }).waitFor();
}

async function selectStatus(page: Page, current: string, next: string) {
  await page.getByRole("combobox").filter({ hasText: current }).click();
  await page.getByRole("option", { name: next, exact: true }).click();
}

function field(page: Page, label: string) {
  return page
    .locator("label")
    .filter({ hasText: new RegExp(`^${label}$`) })
    .first()
    .locator("..");
}

async function cleanOwnedData() {
  const ownedEmail = `${marker}@northstar.example.test`;
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { customerEmail: ownedEmail },
        ...(created.orderId ? [{ id: created.orderId }] : []),
      ],
    },
    select: { id: true },
  });
  const orderIds = orders.map(({ id }) => id);
  if (orderIds.length) {
    const consignments = await prisma.courierConsignment.findMany({
      where: { orderId: { in: orderIds } },
      select: { id: true },
    });
    const consignmentIds = consignments.map(({ id }) => id);
    await prisma.courierException.deleteMany({
      where: { consignmentId: { in: consignmentIds } },
    });
    await prisma.courierSettlement.deleteMany({
      where: { consignmentId: { in: consignmentIds } },
    });
    await prisma.courierReturn.deleteMany({
      where: { consignmentId: { in: consignmentIds } },
    });
    await prisma.courierEvent.deleteMany({
      where: { consignmentId: { in: consignmentIds } },
    });
    await prisma.courierOperation.deleteMany({
      where: { consignmentId: { in: consignmentIds } },
    });
    await prisma.courierConsignment.deleteMany({
      where: { id: { in: consignmentIds } },
    });
    await prisma.courierDispatch.deleteMany({
      where: { orderId: { in: orderIds } },
    });
    await prisma.stockReservation.deleteMany({
      where: { referenceType: "order", referenceId: { in: orderIds } },
    });
    await prisma.inventoryMovement.deleteMany({
      where: { referenceType: "order", referenceId: { in: orderIds } },
    });
    await prisma.orderPayment.deleteMany({
      where: { orderId: { in: orderIds } },
    });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
  }

  const products = await prisma.product.findMany({
    where: { slug: productSlug },
    select: { variants: { select: { id: true } } },
  });
  const variantIds = products.flatMap((product) =>
    product.variants.map(({ id }) => id),
  );
  if (variantIds.length) {
    await prisma.stockReservation.deleteMany({
      where: { variantId: { in: variantIds } },
    });
    await prisma.inventoryMovement.deleteMany({
      where: { variantId: { in: variantIds } },
    });
    await prisma.inventoryStock.deleteMany({
      where: { variantId: { in: variantIds } },
    });
    await prisma.inventoryBatch.deleteMany({
      where: { variantId: { in: variantIds } },
    });
  }
  await prisma.product.deleteMany({ where: { slug: productSlug } });
  await prisma.productBrand.deleteMany({ where: { slug: brandSlug } });
  await prisma.category.deleteMany({ where: { slug: categorySlug } });
  await prisma.inventoryLocation.deleteMany({ where: { code: locationCode } });
  await prisma.shippingRate.deleteMany({ where: { code: shippingCode } });
  await prisma.ecommerceCustomer.deleteMany({
    where: { normalizedEmail: ownedEmail },
  });
}

await mkdir(output, { recursive: true });
await cleanOwnedData();

const api = await request.newContext({
  baseURL: e2eRuntimeConfig.serverUrl,
  storageState: TEST_USERS.owner.storageStatePath,
});
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  baseURL: e2eRuntimeConfig.webUrl,
  storageState: TEST_USERS.owner.storageStatePath,
  viewport: { width: 1440, height: 900 },
  colorScheme: "light",
  reducedMotion: "reduce",
});
const page = await context.newPage();
page.setDefaultTimeout(20_000);

try {
  const category = await post<{ id: string }>(api, "/admin/catalog/categories", {
    name: "Tutorial Pantry",
    slug: categorySlug,
    brandPolicy: "optional",
    fulfillmentKind: "packaged_food",
    isActive: true,
  });
  created.categoryId = category.id;
  const brand = await post<{ id: string }>(api, "/admin/catalog/brands", {
    name: "Tutorial Harvest",
    slug: brandSlug,
    isActive: true,
  });
  created.brandId = brand.id;
  const location = await post<{ id: string }>(api, "/admin/inventory/locations", {
    name: "Tutorial Main Store",
    code: locationCode,
    isActive: true,
  });
  created.locationId = location.id;
  const rate = await post<{ id: string }>(api, "/admin/shipping/rates", {
    code: shippingCode,
    label: "Tutorial Dhaka Delivery",
    amount: "80.00",
    currency: "BDT",
    isDefault: false,
    isActive: true,
    sortOrder: 999,
  });
  created.shippingRateId = rate.id;

  await page.goto("/admin/products");
  await page
    .getByText("Create product drafts, manage specs, and build sellable variants.", {
      exact: true,
    })
    .waitFor();
  await page.waitForLoadState("networkidle");
  await frame(page, "01-products-start");

  await page.getByRole("link", { name: "Product", exact: true }).click();
  await page.getByRole("heading", { name: "New product" }).waitFor();
  await page.waitForLoadState("networkidle");
  await field(page, "Category").getByRole("combobox").click();
  await page.getByText("Tutorial Pantry", { exact: true }).last().click();
  await frame(page, "02-category");

  await page.getByRole("button", { name: /Basics/ }).click();
  await page.getByLabel("Name", { exact: true }).fill(productName);
  await page.getByLabel("Slug").fill(productSlug);
  await page.getByText("No brand", { exact: true }).click();
  await page.getByText("Tutorial Harvest", { exact: true }).last().click();
  await field(page, "Cover image")
    .locator("input")
    .fill("http://localhost:3001/brands/foodshop/products/honey.webp");
  await field(page, "Description").locator("textarea").fill(
    "Pure floral honey prepared for this fictional tutorial store.",
  );
  await field(page, "Search keywords").locator("textarea").fill("honey, pantry, tutorial");
  await page.getByLabel("SEO title").fill("Golden Honey | Tutorial Store");
  await page.getByLabel("SEO description").fill(
    "A fictional honey product used in the store administration tutorial.",
  );
  await frame(page, "03-product-basics");
  await page.getByRole("button", { name: "Save basics" }).click();
  await page.getByText("Product basics saved", { exact: true }).waitFor();
  await page.waitForURL(/\/admin\/products\/.+/);
  created.productId = page.url().split("/").at(-1)!;

  await page.getByRole("button", { name: /Specs/ }).click();
  await frame(page, "04-product-specs");

  await page.getByRole("button", { name: /Highlights/ }).click();
  await page.getByRole("button", { name: "Highlight", exact: true }).click();
  await page.getByLabel("Title").fill("Carefully sourced");
  await field(page, "Description").locator("textarea").fill(
    "A concise, factual selling point for the customer.",
  );
  await frame(page, "05-product-highlights");
  await page.getByRole("button", { name: "Save highlights" }).click();
  await page.getByText("Highlights saved", { exact: true }).waitFor();

  await page.getByRole("button", { name: /Variants/ }).click();
  await page.getByRole("button", { name: "Add variant", exact: true }).click();
  await page.getByLabel("SKU").fill(sku);
  await page.getByLabel("Name", { exact: true }).fill("500 gram jar");
  await page.getByLabel("Price", { exact: true }).fill("650");
  await page.getByLabel("Compare at price").fill("700");
  await page.getByLabel("Cost price").fill("420");
  await page.getByLabel("Weight", { exact: true }).fill("500");
  await page.getByText("Not set", { exact: true }).click();
  await page.getByText("g", { exact: true }).last().click();
  await field(page, "Default variant").getByRole("switch").click();
  await frame(page, "06-product-variant");
  await page.getByRole("button", { name: "Save variants" }).click();
  await page.getByText("Variants saved", { exact: true }).waitFor();

  const detail = await json<{ variants: Array<{ id: string }> }>(
    await api.get(`/admin/products/${created.productId}`),
  );
  created.variantId = detail.variants[0]!.id;

  await page.goto("/admin/inventory");
  await page.getByRole("heading", { name: "Inventory" }).waitFor();
  await page.waitForLoadState("networkidle");
  await page.getByRole("tab", { name: "Receive" }).click();
  await page.getByText("Select product", { exact: true }).click();
  await page.getByText(productName, { exact: true }).last().click();
  await page.getByText("Select SKU", { exact: true }).click();
  await page.getByText(new RegExp(sku)).last().click();
  await page.getByText("Select location", { exact: true }).click();
  await page.getByText("Tutorial Main Store", { exact: true }).last().click();
  await page.getByLabel("Quantity").fill("25");
  await page.getByLabel("Unit cost").fill("420");
  await page.getByLabel("Reorder level").fill("5");
  await frame(page, "07-receive-inventory");
  await page.getByRole("button", { name: "Receive stock" }).click();
  await page.getByText("Stock received", { exact: true }).waitFor();
  await page.getByRole("tab", { name: "Stock" }).click();
  await frame(page, "08-inventory-confirmed");

  await page.goto(`/admin/products/${created.productId}`);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /Validate/ }).click();
  await page.getByRole("button", { name: "Validate", exact: true }).click();
  await page.getByText("Product is ready", { exact: true }).waitFor();
  await frame(page, "09-product-ready");
  await page.getByRole("button", { name: "Activate product" }).click();
  await page.getByText("Product activated", { exact: true }).waitFor();

  await page.goto(`/shop/products/${productSlug}`);
  await page.getByRole("heading", { name: productName }).waitFor();
  await frame(page, "10-storefront-product");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/checkout");
  await page.getByLabel("Name").fill("Samiha Ahmed");
  await page.getByLabel("Email").fill(`${marker}@northstar.example.test`);
  await page.getByLabel("Phone").fill("+8801812345679");
  await page.getByLabel("Address line 1").fill("18 Tutorial Avenue");
  await page.getByLabel("City").fill("Dhaka");
  await page.getByLabel("Postal code").fill("1205");
  const delivery = page.getByText("Tutorial Dhaka Delivery", { exact: false });
  if (await delivery.isVisible()) await delivery.click();
  await frame(page, "11-customer-checkout");
  await page.getByRole("button", { name: "Place order" }).click();
  await page.waitForURL(/\/checkout\/success\//);
  created.orderId = page.url().split("/").at(-1)!;
  await frame(page, "12-order-created");

  await page.goto(`/admin/orders/${created.orderId}`);
  await waitForOrderDetail(page);
  await frame(page, "13-admin-order-review");
  await selectStatus(page, "Pending", "Confirmed");
  await page.getByRole("button", { name: "Update order" }).click();
  await page.getByText("Order updated", { exact: true }).waitFor();
  await page.reload();
  await waitForOrderDetail(page);
  await frame(page, "14-order-confirmed");

  await page.getByRole("button", { name: "Record confirmed payment" }).click();
  const payment = page.getByRole("dialog", { name: "Record confirmed payment" });
  await payment.getByLabel("Amount (BDT)").fill("730");
  await payment.getByLabel("Method").click();
  await page.getByRole("option", { name: "Mobile collection" }).click();
  await payment.getByLabel("Collection reference").fill("TUTORIAL-PAY-001");
  await payment.getByLabel("Evidence / correction reason").fill(
    "Confirmed fictional tutorial payment.",
  );
  await frame(page, "15-payment-evidence");
  await payment.getByRole("button", { name: "Record evidence" }).click();
  await page.getByText("Payment evidence recorded", { exact: true }).waitFor();
  await page.reload();
  await waitForOrderDetail(page);

  const fulfillment = page.getByRole("heading", { name: "Fulfillment" });
  await fulfillment.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Mark shipped" }).click();
  const shipping = page.getByRole("dialog", { name: "Mark order shipped" });
  await shipping.getByLabel("Carrier").fill("Tutorial Courier");
  await shipping.getByLabel("Tracking number").fill("TUTORIAL-TRACK-001");
  await shipping.getByLabel("Note").fill("Parcel handed to the fictional courier.");
  await frame(page, "16-mark-shipped");
  await shipping.getByRole("button", { name: "Mark shipped" }).click();
  await page.getByText("Order marked as shipped", { exact: true }).waitFor();
  await page.reload();
  await waitForOrderDetail(page);
  await fulfillment.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Mark delivered" }).click();
  const delivered = page.getByRole("dialog", { name: "Mark order delivered" });
  await delivered.getByLabel("Note").fill("Received by the fictional customer.");
  await frame(page, "17-mark-delivered");
  await delivered.getByRole("button", { name: "Mark delivered" }).click();
  await page.getByText("Order marked as delivered", { exact: true }).waitFor();
  await page.reload();
  await waitForOrderDetail(page);
  await selectStatus(page, "Confirmed", "Completed");
  await page.getByRole("button", { name: "Update order" }).click();
  await page.getByText("Order updated", { exact: true }).waitFor();
  await page.reload();
  await waitForOrderDetail(page);
  await frame(page, "18-order-completed");

  const persisted = await json<{
    orderStatus: string;
    paymentStatus: string;
    deliveryStatus: string;
    inventoryStatus: string;
  }>(await api.get(`/admin/orders/${created.orderId}`));
  if (
    persisted.orderStatus !== "completed" ||
    persisted.paymentStatus !== "paid" ||
    persisted.deliveryStatus !== "delivered" ||
    persisted.inventoryStatus !== "committed"
  ) {
    throw new Error(`Unexpected persisted tutorial outcome: ${JSON.stringify(persisted)}`);
  }

  const stock = await json<{
    items: Array<{ quantityOnHand: number; quantityReserved: number }>;
  }>(await api.get(`/admin/inventory/stocks?variantId=${created.variantId}`));
  if (stock.items[0]?.quantityOnHand !== 24 || stock.items[0]?.quantityReserved !== 0) {
    throw new Error(`Unexpected tutorial stock outcome: ${JSON.stringify(stock.items[0])}`);
  }
} finally {
  await context.close();
  await browser.close();
  await api.dispose();
  await cleanOwnedData();
  await prisma.$disconnect();
}
