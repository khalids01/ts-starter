import {
  chromium,
  request,
  type APIRequestContext,
  type Locator,
  type Page,
} from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import prisma from "../../packages/db/src/client.server";
import { e2eRuntimeConfig } from "../../packages/config/src/e2e.config";
import { assertTestEnvironment } from "../setup/assert-test-environment";
import { TEST_USERS } from "../users-config";
import { cursorClick, cursorFill, installCursor, narrate } from "./cursor";
import { Pacer, TUTORIAL_DURATION_SEC } from "./segments";

assertTestEnvironment();

async function assertAppRunning() {
  const targets = [
    ["API", e2eRuntimeConfig.serverUrl],
    ["web", e2eRuntimeConfig.webUrl],
  ] as const;
  for (const [label, url] of targets) {
    try {
      await fetch(url, { signal: AbortSignal.timeout(3_000) });
    } catch {
      throw new Error(
        `${label} is not reachable at ${url}. Start the isolated runtime ` +
          "(Postgres, Redis, API on :3000, web on :3001) before recording; " +
          "see tests/tutorials/README.md.",
      );
    }
  }
}

await assertAppRunning();

const marker = "tutorial-product-order-v1";
const categorySlug = `${marker}-category`;
const brandSlug = `${marker}-brand`;
const productSlug = `${marker}-product`;
const locationCode = `${marker}-location`;
const shippingCode = `${marker}-shipping`;

const categoryName = "Pantry & Grocery";
const brandName = "Khamar Foods";
const locationName = "Gulshan Warehouse";
const shippingLabel = "Dhaka Metro Delivery";
const productName = "Sundarban Wildflower Honey";
const variantName = "500 g jar";
const sku = "HNY-500G";
const customerName = "Rafiul Karim";
const customerEmail = "rafiul.karim@northstar.example.test";
const customerPhone = "+8801712345678";
const customerAddress = "18 Gulshan Avenue";
const customerCity = "Dhaka";
const customerPostal = "1212";
const artifactDir = resolve(import.meta.dir, "../artifacts/tutorials/product-to-order");
const rawVideoDir = resolve(artifactDir, "raw");

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

async function waitForOrderDetail(page: Page) {
  await page.getByRole("heading", { name: "Cancellation and refunds" }).waitFor();
  await page.getByRole("heading", { name: "Fulfillment" }).waitFor();
}

async function selectStatus(page: Page, current: string, next: string) {
  await cursorClick(page, page.getByRole("combobox").filter({ hasText: current }));
  await cursorClick(page, page.getByRole("option", { name: next, exact: true }));
}

function field(page: Page, label: string) {
  return page
    .locator("label")
    .filter({ hasText: new RegExp(`^${label}$`) })
    .first()
    .locator("..");
}

/** Opens an admin sidebar group if needed, then clicks the item link. */
async function navTo(page: Page, group: string, item: string) {
  const link = page.getByRole("link", { name: item, exact: true }).first();
  if (!(await link.isVisible().catch(() => false))) {
    await cursorClick(page, page.getByRole("button", { name: group, exact: true }).first());
  }
  await cursorClick(page, link);
}

async function cleanOwnedData() {
  const ownedEmail = customerEmail;
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

await mkdir(rawVideoDir, { recursive: true });
await cleanOwnedData();

const api = await request.newContext({
  baseURL: e2eRuntimeConfig.serverUrl,
  storageState: TEST_USERS.owner.storageStatePath,
});
const browser = await chromium.launch({ headless: process.env.TUTORIAL_HEADED !== "true" });
const context = await browser.newContext({
  baseURL: e2eRuntimeConfig.webUrl,
  storageState: TEST_USERS.owner.storageStatePath,
  viewport: { width: 1440, height: 900 },
  colorScheme: "light",
  reducedMotion: "reduce",
  recordVideo: { dir: rawVideoDir, size: { width: 1440, height: 900 } },
});
await installCursor(context);
const page = await context.newPage();
page.setDefaultTimeout(20_000);

const pacer = new Pacer();
const video = page.video();
const click = (target: Locator) => cursorClick(page, target);
const fill = (target: Locator, value: string) => cursorFill(page, target, value);
const pointAt = (target: Locator) => narrate(page, target);
/** Walks the spotlight through fields, holding each until its narration cue ends. */
const beats = async (items: Array<{ at: Locator; until: number }>) => {
  for (const item of items) {
    await pointAt(item.at);
    await pacer.holdUntil(item.until);
  }
};

let rawVideoPath: string | undefined;
let completed = false;

try {
  const category = await post<{ id: string }>(api, "/admin/catalog/categories", {
    name: categoryName,
    slug: categorySlug,
    brandPolicy: "optional",
    fulfillmentKind: "packaged_food",
    isActive: true,
  });
  created.categoryId = category.id;
  const brand = await post<{ id: string }>(api, "/admin/catalog/brands", {
    name: brandName,
    slug: brandSlug,
    isActive: true,
  });
  created.brandId = brand.id;
  const location = await post<{ id: string }>(api, "/admin/inventory/locations", {
    name: locationName,
    code: locationCode,
    isActive: true,
  });
  created.locationId = location.id;
  const rate = await post<{ id: string }>(api, "/admin/shipping/rates", {
    code: shippingCode,
    label: shippingLabel,
    amount: "80.00",
    currency: "BDT",
    isDefault: false,
    isActive: true,
    sortOrder: 999,
  });
  created.shippingRateId = rate.id;

  // 1. Land on the admin overview, then open Products from the sidebar.
  await page.goto("/admin/overview");
  await page.waitForLoadState("networkidle");
  await pacer.holdUntil(34);
  await navTo(page, "Shop Management", "Products");
  await page
    .getByText("Create product drafts, manage specs, and build sellable variants.", {
      exact: true,
    })
    .waitFor();
  await pointAt(page.getByRole("heading", { name: "Products" }).first());
  await pacer.reach("01-products-start");

  // 2. Start a new product and pick the category.
  await click(page.getByRole("link", { name: "Product", exact: true }));
  await page.getByRole("heading", { name: "New product" }).waitFor();
  await page.waitForLoadState("networkidle");
  await pointAt(field(page, "Category").getByRole("combobox"));
  await click(field(page, "Category").getByRole("combobox"));
  await click(page.getByText(categoryName, { exact: true }).last());
  await pacer.reach("02-category");

  // 3. Basics.
  await click(page.getByRole("button", { name: /Basics/ }));
  await pointAt(page.getByLabel("Name", { exact: true }));
  await fill(page.getByLabel("Name", { exact: true }), productName);
  await fill(page.getByLabel("Slug"), productSlug);
  await click(page.getByText("No brand", { exact: true }));
  await click(page.getByText(brandName, { exact: true }).last());
  await fill(
    field(page, "Cover image").locator("input"),
    "http://localhost:3001/brands/foodshop/products/honey.webp",
  );
  await fill(
    field(page, "Description").locator("textarea"),
    "Raw wildflower honey harvested from the Sundarban mangrove forests.",
  );
  await fill(field(page, "Search keywords").locator("textarea"), "honey, wildflower, sundarban, raw");
  await fill(page.getByLabel("SEO title"), "Sundarban Wildflower Honey | Khamar Foods");
  await fill(
    page.getByLabel("SEO description"),
    "Raw wildflower honey from the Sundarban mangrove forests, packed in 500 g jars.",
  );
  await beats([
    { at: page.getByLabel("Name", { exact: true }), until: 62 },
    { at: field(page, "Description").locator("textarea"), until: 66.2 },
    { at: page.getByLabel("Slug"), until: 73.2 },
    { at: field(page, "Brand").getByRole("combobox"), until: 77 },
    { at: field(page, "Cover image"), until: 79.5 },
    { at: field(page, "Featured"), until: 84.5 },
    { at: field(page, "Search keywords").locator("textarea"), until: 89.8 },
    { at: page.getByLabel("SEO title"), until: 94 },
    { at: page.getByLabel("SEO description"), until: 97.3 },
    { at: page.getByRole("button", { name: "Save basics" }), until: 103.5 },
  ]);
  await click(page.getByRole("button", { name: "Save basics" }));
  await page.getByText("Product basics saved", { exact: true }).waitFor();
  await page.waitForURL(/\/admin\/products\/.+/);
  created.productId = page.url().split("/").at(-1)!;

  // 4. Specs.
  await click(page.getByRole("button", { name: /Specs/ }));
  await pointAt(page.getByRole("button", { name: /Specs/ }));
  await pacer.reach("04-product-specs");

  // 5. Highlights.
  await click(page.getByRole("button", { name: /Highlights/ }));
  await click(page.getByRole("button", { name: "Highlight", exact: true }));
  await fill(page.getByLabel("Title"), "Single-origin harvest");
  await fill(
    field(page, "Description").locator("textarea"),
    "Harvested once a year from Sundarban mangrove flowers.",
  );
  await beats([
    { at: page.getByLabel("Title"), until: 120 },
    { at: field(page, "Description").locator("textarea"), until: 124 },
    { at: page.getByRole("button", { name: "Save highlights" }), until: 126.4 },
  ]);
  await click(page.getByRole("button", { name: "Save highlights" }));
  await page.getByText("Highlights saved", { exact: true }).waitFor();

  // 6. Variants.
  await click(page.getByRole("button", { name: /Variants/ }));
  await click(page.getByRole("button", { name: "Add variant", exact: true }));
  await fill(page.getByLabel("SKU"), sku);
  await fill(page.getByLabel("Name", { exact: true }), variantName);
  await fill(page.getByLabel("Price", { exact: true }), "650");
  await fill(page.getByLabel("Compare at price"), "700");
  await fill(page.getByLabel("Cost price"), "420");
  await fill(page.getByLabel("Weight", { exact: true }), "500");
  await click(page.getByText("Not set", { exact: true }));
  await click(page.getByText("g", { exact: true }).last());
  await click(field(page, "Default variant").getByRole("switch"));
  await beats([
    { at: page.getByLabel("SKU"), until: 135 },
    { at: page.getByLabel("Name", { exact: true }), until: 138 },
    { at: page.getByLabel("Price", { exact: true }), until: 141 },
    { at: page.getByLabel("Compare at price"), until: 143.8 },
    { at: page.getByLabel("Weight", { exact: true }), until: 148 },
    { at: field(page, "Default variant"), until: 150.5 },
    { at: page.getByRole("button", { name: "Save variants" }), until: 152.6 },
  ]);
  await click(page.getByRole("button", { name: "Save variants" }));
  await page.getByText("Variants saved", { exact: true }).waitFor();

  const detail = await json<{ variants: Array<{ id: string }> }>(
    await api.get(`/admin/products/${created.productId}`),
  );
  created.variantId = detail.variants[0]!.id;

  // 7. Inventory (reached through the builder's Inventory step).
  await click(page.getByRole("button", { name: /Inventory/ }));
  await pointAt(page.getByRole("link", { name: "Open inventory" }));
  await click(page.getByRole("link", { name: "Open inventory" }));
  await page.getByRole("heading", { name: "Inventory" }).waitFor();
  await page.waitForLoadState("networkidle");
  await click(page.getByRole("tab", { name: "Receive" }));
  await click(page.getByText("Select product", { exact: true }));
  await click(page.getByText(productName, { exact: true }).last());
  await click(page.getByText("Select SKU", { exact: true }));
  await click(page.getByText(new RegExp(sku)).last());
  await click(page.getByText("Select location", { exact: true }));
  await click(page.getByText(locationName, { exact: true }).last());
  await fill(page.getByLabel("Quantity"), "25");
  await fill(page.getByLabel("Unit cost"), "420");
  await fill(page.getByLabel("Reorder level"), "5");
  await beats([
    { at: field(page, "Product"), until: 161 },
    { at: field(page, "SKU"), until: 163.5 },
    { at: field(page, "Location"), until: 166.2 },
    { at: page.getByLabel("Quantity"), until: 170 },
    { at: page.getByLabel("Unit cost"), until: 173 },
    { at: page.getByLabel("Reorder level"), until: 175.5 },
    { at: page.getByRole("button", { name: "Receive stock" }), until: 181.5 },
  ]);
  await click(page.getByRole("button", { name: "Receive stock" }));
  await page.getByText("Stock received", { exact: true }).waitFor();
  await click(page.getByRole("tab", { name: "Stock" }));
  await pointAt(page.getByRole("tab", { name: "Stock" }));
  await pacer.reach("08-inventory-confirmed");

  // 8. Back to the product: Validate and activate.
  await navTo(page, "Shop Management", "Products");
  await click(page.getByRole("button", { name: "Open product actions" }).first());
  await click(page.getByRole("menuitem", { name: "Edit" }));
  await page.waitForLoadState("networkidle");
  await click(page.getByRole("button", { name: /Validate/ }));
  await pointAt(page.getByRole("button", { name: "Validate", exact: true }).last());
  await pacer.reach("09-product-ready");
  await click(page.getByRole("button", { name: "Validate", exact: true }).last());
  await page.getByText("Product is ready", { exact: true }).waitFor();
  await click(page.getByRole("button", { name: "Activate product" }));
  await page.getByText("Product activated", { exact: true }).waitFor();

  // 9. Storefront: open the shop, the product, then add to cart.
  await click(page.getByRole("link", { name: /FoodShop BD/ }).first());
  await page.waitForLoadState("networkidle");
  await click(page.getByRole("link", { name: "Shop", exact: true }).first());
  await page.waitForLoadState("networkidle");
  await pointAt(page.getByRole("link", { name: productName }).first());
  await click(page.getByRole("link", { name: productName }).first());
  await page.getByRole("heading", { name: productName }).waitFor();
  await pointAt(page.getByRole("button", { name: "Add to cart" }));
  await pacer.reach("10-storefront-product");
  await click(page.getByRole("button", { name: "Add to cart" }));

  // 10. Checkout: adding to cart opens the cart sheet, so continue from there.
  await page.getByRole("link", { name: "Checkout", exact: true }).waitFor();
  await click(page.getByRole("link", { name: "Checkout", exact: true }));
  await fill(page.getByLabel("Name"), customerName);
  await fill(page.getByLabel("Email"), customerEmail);
  await fill(page.getByLabel("Phone"), customerPhone);
  await fill(page.getByLabel("Address line 1"), customerAddress);
  await fill(page.getByLabel("City"), customerCity);
  await fill(page.getByLabel("Postal code"), customerPostal);
  const delivery = page.getByText(shippingLabel, { exact: false });
  if (await delivery.isVisible()) await click(delivery);
  await beats([
    { at: page.getByLabel("Name"), until: 209 },
    { at: page.getByLabel("Address line 1"), until: 213 },
    { at: page.getByText(shippingLabel, { exact: false }), until: 216 },
    { at: page.getByRole("button", { name: "Place order" }), until: 218.6 },
  ]);
  await click(page.getByRole("button", { name: "Place order" }));
  await page.waitForURL(/\/checkout\/success\//);
  created.orderId = page.url().split("/").at(-1)!;
  await pacer.reach("12-order-created");

  // 11. Back to admin through the account menu, then open the order from the list.
  await click(page.locator("header button.p-0").first());
  await page.waitForTimeout(300);
  const adminEntry = page.getByRole("menuitem", { name: "Admin Dashboard" });
  if (await adminEntry.isVisible().catch(() => false)) {
    await click(adminEntry);
  } else {
    await page.keyboard.press("Escape");
    await page.goto("/admin/overview");
    await page.waitForLoadState("networkidle");
  }
  await navTo(page, "Sales", "Orders");
  await page.waitForLoadState("networkidle");
  await click(page.locator('a[href^="/admin/orders/"]').first());
  await waitForOrderDetail(page);
  await pointAt(page.getByRole("heading", { name: "Fulfillment" }));
  await pacer.reach("13-admin-order-review");

  // 12. Confirm the order.
  await selectStatus(page, "Pending", "Confirmed");
  await pointAt(page.getByRole("button", { name: "Update order" }));
  await click(page.getByRole("button", { name: "Update order" }));
  await page.getByText("Order updated", { exact: true }).waitFor();
  await page.waitForTimeout(600);
  await pacer.reach("14-order-confirmed");

  // 13. Record payment evidence.
  await click(page.getByRole("button", { name: "Record confirmed payment" }));
  const payment = page.getByRole("dialog", { name: "Record confirmed payment" });
  await fill(payment.getByLabel("Amount (BDT)"), "730");
  await click(payment.getByLabel("Method"));
  await click(page.getByRole("option", { name: "Mobile collection" }));
  await fill(payment.getByLabel("Collection reference"), "bKash-88213497");
  await fill(
    payment.getByLabel("Evidence / correction reason"),
    "Mobile collection receipt confirmed by the customer.",
  );
  await beats([
    { at: payment.getByLabel("Amount (BDT)"), until: 258 },
    { at: payment.getByLabel("Method"), until: 262 },
    { at: payment.getByLabel("Collection reference"), until: 270 },
    { at: payment.getByLabel("Evidence / correction reason"), until: 277 },
    { at: payment.getByRole("button", { name: "Record evidence" }), until: 284.5 },
  ]);
  await click(payment.getByRole("button", { name: "Record evidence" }));
  await page.getByText("Payment evidence recorded", { exact: true }).waitFor();
  await page.waitForTimeout(600);
  await waitForOrderDetail(page);

  // 14. Ship the parcel.
  const fulfillment = page.getByRole("heading", { name: "Fulfillment" });
  await fulfillment.scrollIntoViewIfNeeded();
  await click(page.getByRole("button", { name: "Mark shipped" }));
  const shipping = page.getByRole("dialog", { name: "Mark order shipped" });
  await fill(shipping.getByLabel("Carrier"), "Pathao Courier");
  await fill(shipping.getByLabel("Tracking number"), "PTH-2K9F31");
  await fill(shipping.getByLabel("Note"), "Parcel handed to the Pathao rider at the Gulshan hub.");
  await pointAt(shipping.getByRole("button", { name: "Mark shipped" }));
  await pacer.reach("16-mark-shipped");
  await click(shipping.getByRole("button", { name: "Mark shipped" }));
  await page.getByText("Order marked as shipped", { exact: true }).waitFor();
  await page.waitForTimeout(600);
  await waitForOrderDetail(page);

  // 15. Deliver.
  await fulfillment.scrollIntoViewIfNeeded();
  await click(page.getByRole("button", { name: "Mark delivered" }));
  const delivered = page.getByRole("dialog", { name: "Mark order delivered" });
  await fill(delivered.getByLabel("Note"), "Received by Rafiul Karim at the delivery address.");
  await pointAt(delivered.getByRole("button", { name: "Mark delivered" }));
  await pacer.reach("17-mark-delivered");
  await click(delivered.getByRole("button", { name: "Mark delivered" }));
  await page.getByText("Order marked as delivered", { exact: true }).waitFor();
  await page.waitForTimeout(600);
  await waitForOrderDetail(page);

  // 16. Complete the order, then review the timeline for the closing narration.
  await selectStatus(page, "Confirmed", "Completed");
  await pointAt(page.getByRole("button", { name: "Update order" }));
  await click(page.getByRole("button", { name: "Update order" }));
  await page.getByText("Order updated", { exact: true }).waitFor();
  await page.waitForTimeout(600);
  await pacer.reach("18-order-completed");
  await pointAt(page.getByRole("heading", { name: "Fulfillment" }));
  await pacer.holdUntil(346);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(500);
  await pointAt(page.getByText(/timeline/i).last());
  await pacer.finish();

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

  completed = true;
} finally {
  await context.close();
  rawVideoPath = video ? await video.path() : undefined;
  await browser.close();
  await api.dispose();
  await cleanOwnedData();
  await prisma.$disconnect();

  if (rawVideoPath && completed) {
    await writeFile(
      resolve(artifactDir, "last-recording.json"),
      JSON.stringify(
        {
          rawVideo: rawVideoPath,
          durationSec: TUTORIAL_DURATION_SEC,
          recordedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
    console.log(`Recorded raw video: ${rawVideoPath}`);
    console.log("Render it with: bun tests/tutorials/render-tutorial.ts");
  } else if (rawVideoPath) {
    console.warn(
      `Recording did not complete; ignoring raw video at ${rawVideoPath} ` +
        "(no manifest written, so the renderer will not use it).",
    );
  }
}
