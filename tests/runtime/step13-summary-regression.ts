import { assertTestEnvironment } from "../setup/assert-test-environment";
import { isDeepStrictEqual } from "node:util";
import { resolve } from "node:path";
const target = assertTestEnvironment();
if (target.isRemote || target.databaseName !== "e2e_v3_step13_capacity_20261003_a" || process.env.STEP13_LOAD_APPROVED !== "true") throw new Error("Approved exact capacity target required");
const baselinePath = process.env.STEP13_FACET_BASELINE_MODULE;
if (!baselinePath?.startsWith(resolve("tests/artifacts/step13") + "/")) throw new Error("Reviewed ignored original service required");
const { productService: original } = await import(baselinePath);
const { productService: current } = await import("../../apps/server/src/modules/shop/services/product.service");
const { summarizeProductsWithoutAttributes } = await import("../../apps/server/src/modules/shop/lib/filter-summary");
const { buildProductWhere } = await import("../../apps/server/src/modules/shop/lib/product-query");
const { default: db } = await import("../../packages/db/src/client.server");
const prefix = `cap13-summary-${crypto.randomUUID()}`;
let checks = 0;
const check = (value: unknown, message: string) => { if (!value) throw new Error(message); checks++; };
try {
  for (const suffix of ["category", "empty"]) await db.category.create({ data: { id: `${prefix}-${suffix}`, name: "Fictional summary regression", slug: `${prefix}-${suffix}` } });
  for (const [n, name] of ["Zed", "Alpha", "Inactive"].entries()) await db.productBrand.create({ data: { id: `${prefix}-brand-${n}`, slug: `${prefix}-brand-${n}`, name, isActive: n !== 2 } });
  for (let n = 0; n < 4; n++) {
    await db.product.create({ data: { id: `${prefix}-product-${n}`, slug: `${prefix}-product-${n}`, name: "Fictional summary product", categoryId: `${prefix}-category`, status: "active", brandId: n === 2 ? null : `${prefix}-brand-${n === 3 ? 2 : n}` } });
    await db.productVariant.create({ data: { id: `${prefix}-variant-${n}`, sku: `${prefix}-variant-${n}`, productId: `${prefix}-product-${n}`, name: "Fictional summary variant", price: n === 3 ? "1.00" : `${(n + 1) * 10}.00`, currency: n === 3 ? "USD" : "BDT", isDefault: true } });
  }
  await db.productVariant.create({ data: { id: `${prefix}-inactive-variant`, sku: `${prefix}-inactive-variant`, productId: `${prefix}-product-0`, name: "Inactive default", price: "1.00", isDefault: true, isActive: false } });
  for (let n = 0; n < 2; n++) await db.inventoryLocation.create({ data: { id: `${prefix}-location-${n}`, code: `${prefix}-location-${n}`, name: "Fictional summary stock", isActive: n === 0 } });
  const batches = [ { variant: 0, expiryDate: new Date("2099-01-01"), disposition: "sellable" as const, location: 0 }, { variant: 1, expiryDate: new Date("2020-01-01"), disposition: "sellable" as const, location: 0 }, { variant: 2, expiryDate: null, disposition: "quarantined" as const, location: 0 }, { variant: 1, expiryDate: null, disposition: "sellable" as const, location: 1 } ];
  for (const [n, b] of batches.entries()) {
    await db.inventoryBatch.create({ data: { id: `${prefix}-batch-${n}`, variantId: `${prefix}-variant-${b.variant}`, expiryDate: b.expiryDate, disposition: b.disposition } });
    await db.inventoryStock.create({ data: { id: `${prefix}-stock-${n}`, stockKey: `${prefix}-stock-${n}`, variantId: `${prefix}-variant-${b.variant}`, batchId: `${prefix}-batch-${n}`, locationId: `${prefix}-location-${b.location}`, quantityOnHand: 2, quantityReserved: 1 } });
  }
  const query = { categoryId: `${prefix}-category` };
  const result = await current.listFilters(query);
  check(isDeepStrictEqual(result, await original.listFilters(query)), "Aggregated response differs from original");
  check(result.priceRange.min === 10 && result.priceRange.max === 30 && result.priceRange.currency === "BDT", "Active/default prices and inactive-brand exclusion");
  check(result.availability.inStock === 1 && result.availability.outOfStock === 2, "Expiry/quarantine/inactive-location eligibility");
  check(result.brands.map((b: { name: string }) => b.name).join(",") === "Alpha,Zed" && result.brands.every((b: { productCount: number }) => b.productCount === 1), "Brand counts/order and null-brand handling");
  await db.productVariant.update({ where: { id: `${prefix}-variant-2` }, data: { currency: "USD" } });
  check(await summarizeProductsWithoutAttributes(await buildProductWhere(query)) === null, "Mixed currencies must use legacy mapping path");
  check(isDeepStrictEqual(await current.listFilters(query), await original.listFilters(query)), "Mixed-currency fallback changes response");
  const empty = await current.listFilters({ categoryId: `${prefix}-empty` });
  check(empty.priceRange.min === 0 && empty.priceRange.max === 0 && empty.priceRange.currency === "BDT" && empty.brands.length === 0 && empty.availability.inStock === 0 && empty.availability.outOfStock === 0, "Empty-summary defaults");
  await Bun.write("tests/artifacts/step13/summary-regression.json", JSON.stringify({ passed: true, checks, scope: "prices, brands, stock eligibility, mixed currency, empty selection; own fixtures cleaned up" }, null, 2));
  console.log(`${checks} real PostgreSQL summary/fallback checks passed`);
} finally {
  try {
    await db.inventoryStock.deleteMany({ where: { id: { startsWith: prefix } } });
    await db.inventoryBatch.deleteMany({ where: { id: { startsWith: prefix } } });
    await db.inventoryLocation.deleteMany({ where: { id: { startsWith: prefix } } });
    await db.product.deleteMany({ where: { id: { startsWith: prefix } } });
    await db.productBrand.deleteMany({ where: { id: { startsWith: prefix } } });
    await db.category.deleteMany({ where: { id: { in: [`${prefix}-category`, `${prefix}-empty`] } } });
  } finally { await db.$disconnect(); }
}
