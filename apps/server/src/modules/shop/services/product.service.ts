import { eligibleStockWhere } from "@/modules/ecommerce/inventory/stock-policy";
import prisma, { type Prisma } from "@db/server";
import type {
  ListShopFiltersQuery,
  ListShopProductsQuery,
} from "../dto/product.dto";
import { productInclude } from "../lib/includes";
import { normalizePagination, paginationResult } from "../lib/format";
import { ShopServiceError } from "../lib/errors";
import {
  defaultVariantPrice,
  mapFilterAttribute,
  mapProduct,
  productHasStock,
} from "../lib/product-mappers";
import {
  buildProductWhere,
  productOrderBy,
  publicFilterableAttributes,
  selectedCategoryIds,
} from "../lib/product-query";
import { summarizeProductsWithoutAttributes } from "../lib/filter-summary";
import { listPublicCategories } from "./category.service";

export const productService = {
  async listFilters(query: ListShopFiltersQuery = {}) {
    const selectedCategories = selectedCategoryIds(query);
    const singleSelectedCategoryId = selectedCategories.length === 1 ? selectedCategories[0] : undefined;
    const productWhere = await buildProductWhere({
      categoryIds: selectedCategories.join(","),
    });
    const attributes = await publicFilterableAttributes(singleSelectedCategoryId);
    if (!attributes.length) {
      const summary = await summarizeProductsWithoutAttributes(productWhere);
      if (summary) return { categories: await listPublicCategories(), ...summary, attributes: [] };
    }
    const productAttributeIds = attributes.filter((row) => row.scope !== "variant").map((row) => row.attributeId);
    const variantAttributeIds = attributes.filter((row) => row.scope === "variant").map((row) => row.attributeId);
    // Facets need counts/prices/stock, not each product's complete detail graph.
    const select = {
      id: true,
      brand: { select: { id: true, name: true, slug: true, logoUrl: true, isActive: true } },
      variants: {
        where: { isActive: true },
        select: {
          price: true,
          currency: true,
          inventoryStocks: {
            where: eligibleStockWhere(),
            select: {
              quantityOnHand: true,
              quantityReserved: true,
              batchId: true,
              batch: { select: { expiryDate: true, disposition: true } },
            },
          },
          ...(variantAttributeIds.length ? {
            attributeValues: {
              where: { attributeValue: { attributeId: { in: variantAttributeIds } } },
              select: { attributeValueId: true, attributeValue: { select: { attributeId: true } } },
            },
          } : {}),
        },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      },
      ...(productAttributeIds.length ? {
        attributeAssignments: {
          where: { attributeId: { in: productAttributeIds } },
          select: {
            attributeId: true,
            attributeValueId: true,
            rawNumber: true,
            rawBoolean: true,
            values: { select: { attributeValueId: true } },
          },
        },
      } : {}),
    } satisfies Prisma.ProductSelect;
    const [categories, products] = await Promise.all([
      listPublicCategories(),
      prisma.product.findMany({ where: productWhere, select }),
    ]);

    const brandCounts = new Map<string, { brand: any; productCount: number }>();
    const prices: number[] = [];
    let inStock = 0;
    let outOfStock = 0;
    let currency = "BDT";

    for (const product of products) {
      if (product.brand?.isActive) {
        const existing = brandCounts.get(product.brand.id);
        brandCounts.set(product.brand.id, {
          brand: product.brand,
          productCount: (existing?.productCount ?? 0) + 1,
        });
      }
      const price = defaultVariantPrice(product);
      if (price !== null) {
        prices.push(price);
        currency = product.variants[0]?.currency ?? currency;
      }
      if (productHasStock(product)) {
        inStock += 1;
      } else {
        outOfStock += 1;
      }
    }

    return {
      categories,
      brands: [...brandCounts.values()]
        .sort((left, right) => left.brand.name.localeCompare(right.brand.name))
        .map(({ brand, productCount }) => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          logoUrl: brand.logoUrl,
          productCount,
        })),
      priceRange: {
        min: prices.length ? Math.min(...prices) : 0,
        max: prices.length ? Math.max(...prices) : 0,
        currency,
      },
      availability: {
        inStock,
        outOfStock,
      },
      attributes: attributes.map((attribute) => mapFilterAttribute(attribute, products)),
    };
  },

  async listProducts(query: ListShopProductsQuery = {}) {
    const { limit, requestedPage } = normalizePagination(query.page, query.limit);
    const where = await buildProductWhere(query);

    const total = await prisma.product.count({ where });
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const items = await prisma.product.findMany({
      where,
      include: productInclude(),
      orderBy: productOrderBy(query.sort),
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginationResult({
      items: items.map(mapProduct),
      total,
      requestedPage,
      limit,
    });
  },

  async getProduct(slug: string) {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        status: "active",
              archivedAt: null,
        isActive: true,
        category: { isActive: true, archivedAt: null },
        OR: [{ brandId: null }, { brand: { isActive: true, archivedAt: null } }],
        variants: { some: { isActive: true } },
      },
      include: productInclude(),
    });

    if (!product) {
      throw new ShopServiceError("Product not found", 404);
    }

    return mapProduct(product);
  },
};
