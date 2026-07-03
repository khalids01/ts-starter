import prisma, { type Prisma } from "@db/server";
import type { ListShopProductsQuery } from "../dto/product.dto";
import { nullableTrimmed, optionalNumber } from "./format";

type ParsedDynamicFilter = {
  valueIds?: string[];
  min?: number;
  max?: number;
  boolean?: boolean;
};

function csvValues(value: string | null | undefined) {
  return [
    ...new Set(
      (value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item && item !== "all"),
    ),
  ];
}

export function selectedCategoryIds(query: Pick<ListShopProductsQuery, "categoryId" | "categoryIds">) {
  const ids = csvValues(query.categoryIds);
  const legacyId = nullableTrimmed(query.categoryId);
  if (legacyId && legacyId !== "all") {
    ids.push(legacyId);
  }
  return [...new Set(ids)];
}

function selectedBrandIds(query: Pick<ListShopProductsQuery, "brandId" | "brandIds">) {
  const ids = csvValues(query.brandIds);
  const legacyId = nullableTrimmed(query.brandId);
  if (legacyId && legacyId !== "all") {
    ids.push(legacyId);
  }
  return [...new Set(ids)];
}

function parseDynamicFilters(value: string | undefined) {
  if (!value?.trim()) {
    return {} as Record<string, ParsedDynamicFilter>;
  }

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const output: Record<string, ParsedDynamicFilter> = {};
    for (const [attributeId, raw] of Object.entries(parsed)) {
      if (!attributeId) {
        continue;
      }
      if (Array.isArray(raw)) {
        const valueIds = raw.map(String).filter(Boolean);
        if (valueIds.length > 0) {
          output[attributeId] = { valueIds };
        }
        continue;
      }
      if (typeof raw === "string") {
        if (raw.trim()) {
          output[attributeId] = { valueIds: [raw.trim()] };
        }
        continue;
      }
      if (typeof raw === "boolean") {
        output[attributeId] = { boolean: raw };
        continue;
      }
      if (raw && typeof raw === "object") {
        const input = raw as Record<string, unknown>;
        const valueIds = Array.isArray(input.valueIds)
          ? input.valueIds.map(String).filter(Boolean)
          : undefined;
        const min = optionalNumber(input.min);
        const max = optionalNumber(input.max);
        const boolean =
          typeof input.boolean === "boolean" ? input.boolean : undefined;
        if (valueIds?.length || min !== undefined || max !== undefined || boolean !== undefined) {
          output[attributeId] = { valueIds, min, max, boolean };
        }
      }
    }
    return output;
  } catch {
    return {};
  }
}

async function categoryIdsForSelection(selectedIds: string[]) {
  if (selectedIds.length === 0) {
    return undefined;
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, parentId: true },
  });
  const activeIds = new Set(categories.map((category) => category.id));
  const validSelectedIds = selectedIds.filter((id) => activeIds.has(id));
  if (validSelectedIds.length === 0) {
    return [] as string[];
  }

  const byParent = new Map<string | null, string[]>();
  for (const category of categories) {
    const list = byParent.get(category.parentId ?? null) ?? [];
    list.push(category.id);
    byParent.set(category.parentId ?? null, list);
  }

  const ids = new Set<string>(validSelectedIds);
  const queue = [...validSelectedIds];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const childId of byParent.get(current) ?? []) {
      if (!ids.has(childId)) {
        ids.add(childId);
        queue.push(childId);
      }
    }
  }
  return [...ids];
}

function variantPriceWhere(query: ListShopProductsQuery) {
  const price: Prisma.DecimalFilter = {};
  if (query.minPrice !== undefined) {
    price.gte = query.minPrice;
  }
  if (query.maxPrice !== undefined) {
    price.lte = query.maxPrice;
  }
  return Object.keys(price).length > 0 ? price : undefined;
}

export async function publicFilterableAttributes(categoryId?: string | null) {
  const selectedId = nullableTrimmed(categoryId);
  if (!selectedId || selectedId === "all") {
    return [] as any[];
  }

  return prisma.categoryAttribute.findMany({
    where: {
      categoryId: selectedId,
      filterable: true,
      attribute: { filterable: true },
    },
    include: {
      attribute: {
        include: {
          values: { orderBy: [{ sortOrder: "asc" }, { label: "asc" }] },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }],
  });
}

function dynamicFilterWhere(
  filterableAttributes: any[],
  filters: Record<string, ParsedDynamicFilter>,
) {
  const publicAttributes = new Map(
    filterableAttributes.map((row) => [row.attributeId, row]),
  );
  const output: Prisma.ProductWhereInput[] = [];

  for (const [attributeId, filter] of Object.entries(filters)) {
    const categoryAttribute = publicAttributes.get(attributeId);
    if (!categoryAttribute) {
      continue;
    }

    const valueIds = filter.valueIds?.filter(Boolean) ?? [];
    if (valueIds.length > 0) {
      if (categoryAttribute.scope === "variant") {
        output.push({
          variants: {
            some: {
              isActive: true,
              attributeValues: {
                some: { attributeValueId: { in: valueIds } },
              },
            },
          },
        });
      } else {
        output.push({
          attributeAssignments: {
            some: {
              attributeId,
              OR: [
                { attributeValueId: { in: valueIds } },
                { values: { some: { attributeValueId: { in: valueIds } } } },
              ],
            },
          },
        });
      }
      continue;
    }

    if (typeof filter.boolean === "boolean" && categoryAttribute.scope === "product") {
      output.push({
        attributeAssignments: {
          some: { attributeId, rawBoolean: filter.boolean },
        },
      });
      continue;
    }

    if (
      categoryAttribute.scope === "product" &&
      (filter.min !== undefined || filter.max !== undefined)
    ) {
      const rawNumber: Prisma.DecimalNullableFilter = {};
      if (filter.min !== undefined) {
        rawNumber.gte = filter.min;
      }
      if (filter.max !== undefined) {
        rawNumber.lte = filter.max;
      }
      output.push({
        attributeAssignments: {
          some: { attributeId, rawNumber },
        },
      });
    }
  }

  return output;
}

export async function buildProductWhere(query: ListShopProductsQuery = {}) {
  const where: Prisma.ProductWhereInput = {
    status: "active",
    isActive: true,
    category: { isActive: true },
    OR: [{ brandId: null }, { brand: { isActive: true } }],
    variants: { some: { isActive: true } },
  };

  const and: Prisma.ProductWhereInput[] = [];
  if (query.search?.trim()) {
    const search = query.search.trim();
    and.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { searchKeywords: { has: search } },
        { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
      ],
    });
  }

  const selectedCategories = selectedCategoryIds(query);
  const categoryIds = await categoryIdsForSelection(selectedCategories);
  if (categoryIds) {
    and.push({ categoryId: { in: categoryIds } });
  }
  const brandIds = selectedBrandIds(query);
  if (brandIds.length > 0) {
    and.push({ brandId: { in: brandIds } });
  }

  const price = variantPriceWhere(query);
  if (price) {
    and.push({ variants: { some: { isActive: true, price } } });
  }

  const availability = query.availability ?? (query.inStock === true ? "in-stock" : query.inStock === false ? "out-of-stock" : "all");
  if (availability === "in-stock" || availability === "out-of-stock") {
    const stockWhere = {
      variants: {
        some: {
          isActive: true,
          inventoryStocks: { some: { quantityOnHand: { gt: 0 } } },
        },
      },
    };
    and.push(availability === "in-stock" ? stockWhere : { NOT: stockWhere });
  }

  const dynamicFilters = parseDynamicFilters(query.filters);
  if (selectedCategories.length === 1 && Object.keys(dynamicFilters).length > 0) {
    const filterableAttributes = await publicFilterableAttributes(selectedCategories[0]);
    and.push(...dynamicFilterWhere(filterableAttributes, dynamicFilters));
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return where;
}

export function productOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "name_asc":
      return [{ name: "asc" }];
    case "name_desc":
      return [{ name: "desc" }];
    case "oldest":
      return [{ updatedAt: "asc" }];
    case "featured":
      return [{ isFeatured: "desc" }, { updatedAt: "desc" }];
    case "newest":
    default:
      return [{ isFeatured: "desc" }, { updatedAt: "desc" }];
  }
}
