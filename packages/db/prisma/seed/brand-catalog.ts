import type { PrismaClient } from "../generated/client";
import { resolveBrand } from "../../../config/src/brand.config";
import { foodshopProducts } from "./data/brands/foodshop";

export function assertBrandSeedTarget(env: Record<string, string | undefined>) {
  const brand = resolveBrand(env.BRAND);
  const url = new URL(env.DATABASE_URL ?? "");
  if (
    !new Set(["localhost", "127.0.0.1", "[::1]"]).has(url.hostname) ||
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    env.NODE_ENV === "production" ||
    env.E2E_MODE === "true" ||
    env.BRAND_SEED_DATABASE !== decodeURIComponent(url.pathname.slice(1))
  )
    throw new Error(
      "Brand demo seed requires a local non-production database and matching BRAND_SEED_DATABASE. It must not target the isolated E2E database.",
    );
  if (/prod|live|staging|e2e/i.test(url.pathname))
    throw new Error("Refusing production/staging/E2E seed target");
  if (brand.key !== "foodshop")
    throw new Error(`Seed dataset for ${brand.key} is not prepared yet`);
  return { brand, target: `${url.host}${url.pathname}` };
}

export async function seedBrandCatalog(
  prisma: PrismaClient,
  env: Record<string, string | undefined>,
) {
  const { brand, target } = assertBrandSeedTarget(env);
  console.log(
    `Seeding owned ${brand.key} demo catalog into ${target}; no orders, settings or shipping changes`,
  );
  await prisma.$transaction(
    async (tx) => {
      const location = await tx.inventoryLocation.upsert({
        where: { code: "foodshop-demo" },
        create: { code: "foodshop-demo", name: "FoodShop demo stock" },
        update: {},
      });
      const storeBrand = await tx.productBrand.upsert({
        where: { slug: "foodshop-demo" },
        create: { slug: "foodshop-demo", name: brand.name },
        update: {},
      });
      const categoryIds = new Map<string, string>();
      for (const [key, name, kind, image] of [
        ["mangoes", "Mangoes", "fresh_food", "mangoes"],
        ["honey", "Honey", "packaged_food", "honey"],
        ["dates", "Dates", "packaged_food", "dates"],
      ] as const) {
        const category = await tx.category.upsert({
          where: { slug: `foodshop-demo-${key}` },
          create: {
            slug: `foodshop-demo-${key}`,
            name,
            description: `Explore ${name.toLowerCase()} at ${brand.name}.`,
            fulfillmentKind: kind,
            warrantyDays: 0,
            serialTracking: "none",
            brandPolicy: "default_store",
            showStoreBrand: true,
            isFeatured: true,
            imageUrl: `/brands/foodshop/products/${image}.webp`,
          },
          update: {},
        });
        categoryIds.set(key, category.id);
      }
      for (const [index, item] of foodshopProducts.entries()) {
        const slug = `foodshop-demo-${item.key}`;
        const image = `/brands/foodshop/products/${item.image}.webp`;
        const product = await tx.product.upsert({
          where: { slug },
          create: {
            slug,
            name: item.name,
            description: item.description,
            categoryId: categoryIds.get(item.category)!,
            brandId: storeBrand.id,
            status: "active",
            isFeatured: index < 6,
            isTrending: index < 3,
            coverImageUrl: image,
            searchKeywords: [item.name, item.category],
            seoTitle: `${item.name} | ${brand.name}`,
            seoDescription: item.description,
          },
          update: {},
        });
        const variant = await tx.productVariant.upsert({
          where: { sku: `FOODSHOP-DEMO-${item.key.toUpperCase()}` },
          create: {
            productId: product.id,
            sku: `FOODSHOP-DEMO-${item.key.toUpperCase()}`,
            name: `${item.weight} ${item.unit} pack`,
            price: item.price,
            currency: "BDT",
            isDefault: true,
            imageUrls: [image],
            weightValue: item.weight,
            weightUnit: item.unit,
          },
          update: {},
        });
        if (variant.productId !== product.id)
          throw new Error(`Seed SKU collision: ${variant.sku}`);
        // Receipt only when first creating owned stock: repeat runs do not replenish it.
        const batchNumber = `foodshop-demo-v1-${item.key}`;
        let batch = await tx.inventoryBatch.findFirst({
          where: { variantId: variant.id, batchNumber },
        });
        if (!batch)
          batch = await tx.inventoryBatch.create({
            data: {
              variantId: variant.id,
              batchNumber,
              expiryDate: new Date(
                Date.now() + (item.kind === "fresh_food" ? 7 : 365) * 86400000,
              ),
              notes:
                "Fictional local brand seed stock; not verified merchant inventory.",
            },
          });
        const stockKey = `${variant.id}:${location.id}:${batch.id}`;
        const stock = await tx.inventoryStock.findUnique({
          where: { stockKey },
        });
        if (!stock) {
          await tx.inventoryStock.create({
            data: {
              stockKey,
              variantId: variant.id,
              locationId: location.id,
              batchId: batch.id,
              quantityOnHand: 30,
              quantityReserved: 0,
              reorderLevel: 5,
            },
          });
          await tx.inventoryMovement.create({
            data: {
              variantId: variant.id,
              locationId: location.id,
              batchId: batch.id,
              type: "purchase",
              delta: 30,
              reason: "Initial fictional FoodShop demo receipt",
              referenceType: "brand_catalog_seed",
              referenceId: `foodshop:v1:${item.key}`,
            },
          });
        }
      }
    },
    { timeout: 30000 },
  );
  console.log(
    `FoodShop catalog ready: ${foodshopProducts.length} products; existing balances and unrelated rows preserved`,
  );
}
