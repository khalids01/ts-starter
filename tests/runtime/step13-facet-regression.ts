import { assertTestEnvironment } from "../setup/assert-test-environment";
import { writeFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
const target = assertTestEnvironment();
if (target.isRemote || target.databaseName !== "e2e_v3_step13_capacity_20261003_a" || process.env.STEP13_LOAD_APPROVED !== "true") throw new Error("Approved exact capacity target required");
const { default: db } = await import("../../packages/db/src/client.server");
const capture = process.argv.includes("--capture-baseline");
const baselineModule = process.env.STEP13_FACET_BASELINE_MODULE;
if (baselineModule && !baselineModule.startsWith(`${process.cwd()}/tests/artifacts/step13/`)) throw new Error("Ignored local baseline module required");
const { productService } = capture && baselineModule
  ? await import(baselineModule)
  : await import("../../apps/server/src/modules/shop/services/product.service");
const path = "tests/artifacts/step13/facet-regression-baseline.json";
let prefix: string | undefined;
try {
  if (capture) {
    if (await Bun.file(path).exists()) throw new Error("Preserve the existing facet baseline");
    prefix = `cap13-facet-${crypto.randomUUID()}`;
    await db.category.create({ data: { id: prefix, name: "Fictional facet regression", slug: prefix } });
    const fields = [{ id: `${prefix}-number`, type: "number" as const, scope: "product" as const }, { id: `${prefix}-bool`, type: "boolean" as const, scope: "product" as const }, { id: `${prefix}-multi`, type: "text" as const, scope: "product" as const }, { id: `${prefix}-variant`, type: "text" as const, scope: "variant" as const }];
    for (const [n, field] of fields.entries()) {
      await db.productAttribute.create({ data: { id: field.id, name: `Fictional facet ${n}`, slug: field.id, type: field.type, filterable: true } });
      await db.categoryAttribute.create({ data: { categoryId: prefix, attributeId: field.id, scope: field.scope, filterable: true, inputType: field.type === "number" ? "number" : field.type === "boolean" ? "boolean" : "multiselect" } });
    }
    for (const field of fields.slice(2)) for (let n = 0; n < 2; n++) await db.productAttributeValue.create({ data: { id: `${field.id}-value-${n}`, attributeId: field.id, value: `v${n}`, label: `Value ${n}` } });
    for (let n = 0; n < 2; n++) {
      const productId = `${prefix}-product-${n}`;
      await db.product.create({ data: { id: productId, categoryId: prefix, name: "Fictional facet product", slug: productId, status: "active" } });
      const variant = await db.productVariant.create({ data: { id: `${prefix}-sku-${n}`, productId, sku: `${prefix}-sku-${n}`, name: "Fictional variant", price: n ? "75.00" : "50.00", isDefault: true } });
      await db.productVariantAttributeValue.create({ data: { variantId: variant.id, attributeValueId: `${prefix}-variant-value-${n}` } });
      await db.productAttributeAssignment.create({ data: { productId, attributeId: `${prefix}-number`, rawNumber: n ? 20 : 10 } });
      await db.productAttributeAssignment.create({ data: { productId, attributeId: `${prefix}-bool`, rawBoolean: n === 0 } });
      await db.productAttributeAssignment.create({ data: { productId, attributeId: `${prefix}-multi`, attributeValueId: `${prefix}-multi-value-${n}`, values: { create: { attributeValueId: `${prefix}-multi-value-${1 - n}` } } } });
    }
    await db.inventoryLocation.create({ data: { id: `${prefix}-location`, code: `${prefix}-location`, name: "Fictional facet stock" } });
    for (const [n, batch] of [{ expiryDate: new Date("2020-01-01"), disposition: "sellable" as const }, { expiryDate: null, disposition: "quarantined" as const }, { expiryDate: new Date("2099-01-01"), disposition: "sellable" as const }].entries()) {
      await db.inventoryBatch.create({ data: { id: `${prefix}-batch-${n}`, variantId: `${prefix}-sku-0`, ...batch } });
      await db.inventoryStock.create({ data: { id: `${prefix}-stock-${n}`, stockKey: `${prefix}-stock-${n}`, variantId: `${prefix}-sku-0`, locationId: `${prefix}-location`, batchId: `${prefix}-batch-${n}`, quantityOnHand: 2, quantityReserved: 1 } });
    }
    await db.inventoryStock.create({ data: { id: `${prefix}-stock-3`, stockKey: `${prefix}-stock-3`, variantId: `${prefix}-sku-1`, locationId: `${prefix}-location`, quantityOnHand: 1, quantityReserved: 1 } });
    const queries = [{}, { categoryId: prefix }, { categoryId: `cap13-${process.env.STEP13_FIXTURE_RUN_ID}-category-0` }];
    const baseline = [];
    for (const query of queries) { const start = performance.now(); baseline.push({ query, response: await productService.listFilters(query), ms: performance.now() - start }); }
    await writeFile(path, JSON.stringify({ prefix, baseline }, null, 2), { mode: 0o600 });
    console.log(JSON.stringify({ phase: "baseline", queries: baseline.map((row) => ({ query: row.query, ms: row.ms })) }));
  } else {
    const state = await Bun.file(path).json(); prefix = state.prefix;
    const timings = [];
    for (const row of state.baseline) {
      const start = performance.now(); const response = await productService.listFilters(row.query);
      if (!isDeepStrictEqual(JSON.parse(JSON.stringify(response)), row.response)) throw new Error("Facet projection changed API response");
      timings.push({ query: row.query, beforeMs: row.ms, afterMs: performance.now() - start });
    }
    await writeFile("tests/artifacts/step13/facet-regression.json", JSON.stringify({ passed: true, equivalentQueries: 3, covers: "global/category selection, numeric ranges, boolean counts, product and variant values, price and availability", timings }, null, 2), { mode: 0o600 });
    console.log("Three real PostgreSQL facet responses match the original query exactly");
  }
} finally {
  try {
    // Capture retains its own fixtures only until the paired verification; no merchant rows are targets.
    if (prefix && !capture) {
      await db.inventoryStock.deleteMany({ where: { id: { startsWith: prefix } } });
      await db.inventoryBatch.deleteMany({ where: { id: { startsWith: prefix } } });
      await db.inventoryLocation.delete({ where: { id: `${prefix}-location` } });
      await db.product.deleteMany({ where: { categoryId: prefix } });
      await db.categoryAttribute.deleteMany({ where: { categoryId: prefix } });
      await db.productAttribute.deleteMany({ where: { id: { startsWith: prefix } } });
      await db.category.delete({ where: { id: prefix } });
    }
  } finally { await db.$disconnect(); }
}
