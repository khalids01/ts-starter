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
import { assertTestEnvironment } from "../../tests/setup/assert-test-environment";
import { TEST_USERS } from "../../tests/users-config";
import { cursorClick, cursorFill, installCursor, narrate } from "../shared/cursor";
import { Pacer, TUTORIAL_DURATION_SEC } from "./segments.legacy";

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
          "see tutorial/README.md.",
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
const artifactDir = resolve(import.meta.dir, "artifacts");
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
/**
 * Walks the spotlight through fields, performs each beat's real action at the
 * moment it is described, then holds until that narration cue ends.
 */
const beats = async (
  items: Array<{ at: Locator; until: number; act?: () => Promise<void> }>,
) => {
  for (const item of items) {
    await pointAt(item.at);
    if (item.act) {
      await item.act();
      await pointAt(item.at);
    }
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

  // 1. Welcome on the overview, then show the existing category and location.
  await page.goto("/admin/overview");
  await page.waitForLoadState("networkidle");
  await pacer.holdUntil(12.5);

  await navTo(page, "Shop Management", "Catalog");
  await page.waitForLoadState("networkidle");
  await pointAt(page.getByText(categoryName).first());
  await pacer.holdUntil(22);

  await navTo(page, "Shop Management", "Inventory");
  await page.waitForLoadState("networkidle");
  await click(page.getByRole("tab", { name: "Locations" }));
  await pointAt(page.getByText(locationName).first());
  await pacer.holdUntil(33);

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
  await click(field(page, "Category").getByRole("combobox"));
  await click(page.getByText(categoryName, { exact: true }).last());
  await beats([
    { at: field(page, "Category").getByRole("combobox"), until: 52 },
    { at: page.getByText(/Product fields:/), until: 58.1 },
  ]);

  // 3. Basics.
  await click(page.getByRole("button", { name: /Basics/ }));
  await beats([
    {
      at: page.getByLabel("Name", { exact: true }),
      until: 62,
      act: () => fill(page.getByLabel("Name", { exact: true }), productName),
    },
    {
      at: field(page, "Description").locator("textarea"),
      until: 66.2,
      act: () =>
        fill(
          field(page, "Description").locator("textarea"),
          "Raw wildflower honey harvested from the Sundarban mangrove forests.",
        ),
    },
    {
      at: page.getByLabel("Slug"),
      until: 73.2,
      act: () => fill(page.getByLabel("Slug"), productSlug),
    },
    {
      at: field(page, "Brand"),
      until: 77,
      act: async () => {
        await click(page.getByText("No brand", { exact: true }));
        await click(page.getByText(brandName, { exact: true }).last());
      },
    },
    {
      at: field(page, "Cover image"),
      until: 79.5,
      act: () =>
        fill(
          field(page, "Cover image").locator("input"),
          "http://localhost:3001/brands/foodshop/products/honey.webp",
        ),
    },
    { at: field(page, "Featured"), until: 84.5 },
    { at: field(page, "Trending"), until: 87.5 },
    {
      at: field(page, "Search keywords").locator("textarea"),
      until: 89.8,
      act: () =>
        fill(
          field(page, "Search keywords").locator("textarea"),
          "honey, wildflower, sundarban, raw",
        ),
    },
    {
      at: page.getByLabel("SEO title"),
      until: 94,
      act: () => fill(page.getByLabel("SEO title"), "Sundarban Wildflower Honey | Khamar Foods"),
    },
    {
      at: page.getByLabel("SEO description"),
      until: 96.5,
      act: () =>
        fill(
          page.getByLabel("SEO description"),
          "Raw wildflower honey from the Sundarban mangrove forests, packed in 500 g jars.",
        ),
    },
    { at: page.getByRole("button", { name: "Save basics" }), until: 100 },
  ]);
  await click(page.getByRole("button", { name: "Save basics" }));
  await page.getByText("Product basics saved", { exact: true }).waitFor();
  await page.waitForURL(/\/admin\/products\/.+/);
  created.productId = page.url().split("/").at(-1)!;

  // 4. Specs.
  await click(page.getByRole("button", { name: /Specs/ }));
  await pointAt(page.getByText(/Specs/).first());
  await pacer.holdUntil(110);
  await pointAt(page.getByRole("button", { name: "Save specs" }));
  await click(page.getByRole("button", { name: "Save specs" }));
  await pacer.holdUntil(113.6);

  // 5. Highlights.
  await click(page.getByRole("button", { name: /Highlights/ }));
  await click(page.getByRole("button", { name: "Highlight", exact: true }));
  await beats([
    {
      at: page.getByLabel("Title"),
      until: 120,
      act: () => fill(page.getByLabel("Title"), "Single-origin harvest"),
    },
    {
      at: field(page, "Description").locator("textarea"),
      until: 124,
      act: () =>
        fill(
          field(page, "Description").locator("textarea"),
          "Harvested once a year from Sundarban mangrove flowers.",
        ),
    },
    { at: page.getByRole("button", { name: "Save highlights" }), until: 126.4 },
  ]);
  await click(page.getByRole("button", { name: "Save highlights" }));
  await page.getByText("Highlights saved", { exact: true }).waitFor();

  // 6. Variants.
  await click(page.getByRole("button", { name: /Variants/ }));
  await click(page.getByRole("button", { name: "Add variant", exact: true }));
  await beats([
    { at: page.getByLabel("SKU"), until: 135, act: () => fill(page.getByLabel("SKU"), sku) },
    {
      at: page.getByLabel("Name", { exact: true }),
      until: 138,
      act: () => fill(page.getByLabel("Name", { exact: true }), variantName),
    },
    {
      at: page.getByLabel("Price", { exact: true }),
      until: 140.5,
      act: () => fill(page.getByLabel("Price", { exact: true }), "650"),
    },
    {
      at: page.getByLabel("Currency"),
      until: 142,
      act: () => fill(page.getByLabel("Currency"), "BDT"),
    },
    {
      at: page.getByLabel("Compare at price"),
      until: 143.8,
      act: () => fill(page.getByLabel("Compare at price"), "700"),
    },
    { at: field(page, "Variant images"), until: 146.5 },
    {
      at: page.getByLabel("Weight", { exact: true }),
      until: 149,
      act: async () => {
        await fill(page.getByLabel("Weight", { exact: true }), "500");
        await click(page.getByText("Not set", { exact: true }));
        await click(page.getByText("g", { exact: true }).last());
      },
    },
    {
      at: field(page, "Default variant"),
      until: 150.5,
      act: () => click(field(page, "Default variant").getByRole("switch")),
    },
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
  await beats([
    {
      at: field(page, "Product"),
      until: 161,
      act: async () => {
        await click(page.getByText("Select product", { exact: true }));
        await click(page.getByText(productName, { exact: true }).last());
      },
    },
    {
      at: field(page, "SKU"),
      until: 163.5,
      act: async () => {
        await click(page.getByText("Select SKU", { exact: true }));
        await click(page.getByText(new RegExp(sku)).last());
      },
    },
    {
      at: field(page, "Location"),
      until: 166.2,
      act: async () => {
        await click(page.getByText("Select location", { exact: true }));
        await click(page.getByText(locationName, { exact: true }).last());
      },
    },
    {
      at: page.getByLabel("Quantity"),
      until: 170,
      act: () => fill(page.getByLabel("Quantity"), "25"),
    },
    {
      at: page.getByLabel("Unit cost"),
      until: 173,
      act: () => fill(page.getByLabel("Unit cost"), "420"),
    },
    {
      at: page.getByLabel("Reorder level"),
      until: 175.5,
      act: () => fill(page.getByLabel("Reorder level"), "5"),
    },
    { at: page.getByRole("button", { name: "Receive stock" }), until: 181.5 },
  ]);
  await click(page.getByRole("button", { name: "Receive stock" }));
  await page.getByText("Stock received", { exact: true }).waitFor();
  await click(page.getByRole("tab", { name: "Stock" }));
  await pointAt(page.getByText(productName).first());
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
  await beats([
    {
      at: page.getByLabel("Name"),
      until: 210,
      act: async () => {
        await fill(page.getByLabel("Name"), customerName);
        await fill(page.getByLabel("Email"), customerEmail);
        await fill(page.getByLabel("Phone"), customerPhone);
      },
    },
    {
      at: page.getByLabel("Address line 1"),
      until: 214,
      act: async () => {
        await fill(page.getByLabel("Address line 1"), customerAddress);
        await fill(page.getByLabel("City"), customerCity);
        await fill(page.getByLabel("Postal code"), customerPostal);
      },
    },
    {
      at: page.getByText(shippingLabel, { exact: false }),
      until: 216.5,
      act: async () => {
        const delivery = page.getByText(shippingLabel, { exact: false });
        if (await delivery.isVisible()) await click(delivery);
      },
    },
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
  await beats([
    { at: page.getByText("Customer", { exact: true }), until: 229 },
    { at: page.getByText("Addresses", { exact: true }), until: 230.5 },
    { at: page.getByText("Line items", { exact: true }), until: 232 },
    { at: page.getByText("Totals", { exact: true }).first(), until: 233.5 },
    { at: page.getByText("Timeline", { exact: true }).first(), until: 235.2 },
  ]);

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
  await beats([
    {
      at: payment.getByLabel("Amount (BDT)"),
      until: 258,
      act: () => fill(payment.getByLabel("Amount (BDT)"), "730"),
    },
    {
      at: payment.getByLabel("Method"),
      until: 262,
      act: async () => {
        await click(payment.getByLabel("Method"));
        await click(page.getByRole("option", { name: "Mobile collection" }));
      },
    },
    {
      at: payment.getByLabel("Collection reference"),
      until: 270,
      act: () => fill(payment.getByLabel("Collection reference"), "bKash-88213497"),
    },
    {
      at: payment.getByLabel("Evidence / correction reason"),
      until: 277,
      act: () =>
        fill(
          payment.getByLabel("Evidence / correction reason"),
          "Mobile collection receipt confirmed by the customer.",
        ),
    },
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
  await pointAt(page.getByText("Timeline", { exact: true }).first());
  await pacer.holdUntil(324);
  await pointAt(page.getByText("Totals", { exact: true }).first());
  await pacer.holdUntil(335.6);
  await navTo(page, "Shop Management", "Inventory");
  await page.waitForLoadState("networkidle");
  await pointAt(page.getByText(productName).first());
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
    console.log("Render it with: bun run tutorial:render:legacy");
  } else if (rawVideoPath) {
    console.warn(
      `Recording did not complete; ignoring raw video at ${rawVideoPath} ` +
        "(no manifest written, so the renderer will not use it).",
    );
  }
}
