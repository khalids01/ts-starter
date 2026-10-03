import prisma, { Prisma } from "@db/server";

type BrandSummary = { id: string; name: string; slug: string; logoUrl: string | null; productCount: number };
type SummaryRow = { min: string | null; max: string | null; currency: string | null; currencies: number; inStock: number; outOfStock: number; brands: BrandSummary[] | null };

/** Unscoped facets have no attribute values to hydrate; aggregate the same stock/price facts in SQL. */
export async function summarizeProductsWithoutAttributes(where: Prisma.ProductWhereInput) {
  const products = await prisma.product.findMany({ where, select: { id: true } });
  if (!products.length) return { brands: [] as BrandSummary[], priceRange: { min: 0, max: 0, currency: "BDT" }, availability: { inStock: 0, outOfStock: 0 } };
  const ids = products.map((product) => product.id);
  const now = new Date();
  const [row] = await prisma.$queryRaw<SummaryRow[]>(Prisma.sql`
    WITH selected AS (
      SELECT p.id, p."brandId" FROM "product" p WHERE p.id = ANY(${ids}::text[])
    ), prices AS (
      SELECT DISTINCT ON (v."productId") v."productId", v.price, v.currency
      FROM "product_variant" v JOIN selected p ON p.id = v."productId"
      WHERE v."isActive" = true
      ORDER BY v."productId", v."isDefault" DESC, v."createdAt" ASC
    ), available AS (
      SELECT DISTINCT v."productId"
      FROM "product_variant" v
      JOIN selected p ON p.id = v."productId"
      JOIN "inventory_stock" s ON s."variantId" = v.id
      JOIN "inventory_location" l ON l.id = s."locationId"
      LEFT JOIN "inventory_batch" b ON b.id = s."batchId"
      WHERE v."isActive" = true AND l."isActive" = true
        AND s."quantityOnHand" > s."quantityReserved"
        AND (s."batchId" IS NULL OR (b.disposition = 'sellable' AND (b."expiryDate" IS NULL OR b."expiryDate" > ${now})))
    ), brand_counts AS (
      SELECT b.id, b.name, b.slug, b."logoUrl", COUNT(*)::int AS "productCount"
      FROM selected p JOIN "product_brand" b ON b.id = p."brandId"
      WHERE b."isActive" = true GROUP BY b.id
    )
    SELECT MIN(v.price)::text AS min, MAX(v.price)::text AS max,
      MAX(v.currency) AS currency, COUNT(DISTINCT v.currency)::int AS currencies,
      COUNT(*) FILTER (WHERE a."productId" IS NOT NULL)::int AS "inStock",
      COUNT(*) FILTER (WHERE a."productId" IS NULL)::int AS "outOfStock",
      (SELECT jsonb_agg(b) FROM brand_counts b) AS brands
    FROM selected p LEFT JOIN prices v ON v."productId" = p.id
    LEFT JOIN available a ON a."productId" = p.id
  `);
  // The existing mapper chooses the last currency in its product iteration. Keep that behavior for mixed currencies.
  if (!row || row.currencies > 1) return null;
  return {
    brands: (row.brands ?? []).sort((a, b) => a.name.localeCompare(b.name)),
    priceRange: { min: Number(row.min ?? 0), max: Number(row.max ?? 0), currency: row.currency ?? "BDT" },
    availability: { inStock: row.inStock, outOfStock: row.outOfStock },
  };
}
