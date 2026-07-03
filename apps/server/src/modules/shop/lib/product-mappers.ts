import { decimalToNumber, decimalToString, optionalNumber, toIso } from "./format";

export function mapVariant(row: any) {
  return {
    id: row.id,
    productId: row.productId,
    sku: row.sku,
    barcode: row.barcode,
    name: row.name,
    attributesSnapshot: row.attributesSnapshot ?? null,
    price: decimalToString(row.price),
    compareAtPrice: decimalToString(row.compareAtPrice),
    currency: row.currency,
    isDefault: row.isDefault,
    isActive: row.isActive,
    imageUrls: row.imageUrls ?? [],
    weightValue: decimalToString(row.weightValue),
    weightUnit: row.weightUnit,
    attributeValues: (row.attributeValues ?? []).map((entry: any) => ({
      id: entry.attributeValue.id,
      attributeId: entry.attributeValue.attributeId,
      value: entry.attributeValue.value,
      label: entry.attributeValue.label,
      attribute: entry.attributeValue.attribute ?? null,
    })),
    availableQuantity: availableQuantityFromStocks(row.inventoryStocks),
  };
}

export function mapProduct(row: any) {
  const specs = [...(row.attributeAssignments ?? [])]
    .sort((left: any, right: any) => {
      const leftOrder = left.attribute?.sortOrder ?? 0;
      const rightOrder = right.attribute?.sortOrder ?? 0;
      return leftOrder - rightOrder;
    })
    .map((assignment: any) => {
      const value =
        assignment.displayValue ??
        assignment.attributeValue?.label ??
        assignment.values
          ?.map((entry: any) => entry.attributeValue?.label)
          .filter(Boolean)
          .join(", ") ??
        assignment.rawText ??
        decimalToString(assignment.rawNumber) ??
        (typeof assignment.rawBoolean === "boolean"
          ? assignment.rawBoolean
            ? "Yes"
            : "No"
          : null) ??
        toIso(assignment.rawDate);
      if (!assignment.attribute || !value) {
        return null;
      }
      return {
        attributeId: assignment.attributeId,
        name: assignment.attribute.name,
        slug: assignment.attribute.slug,
        value,
      };
    })
    .filter(Boolean)
    .slice(0, 5);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    descriptionHtml: row.descriptionHtml,
    categoryId: row.categoryId,
    category: row.category ?? null,
    brandId: row.brandId,
    brand: row.brand ?? null,
    status: row.status,
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    isTrending: row.isTrending,
    badgeLabel: row.badgeLabel,
    coverImageUrl: row.coverImageUrl,
    searchKeywords: row.searchKeywords ?? [],
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    variants: (row.variants ?? []).map(mapVariant),
    highlights: (row.highlights ?? []).map((highlight: any) => ({
      id: highlight.id,
      productId: highlight.productId,
      title: highlight.title,
      description: highlight.description,
      iconUrl: highlight.iconUrl,
      imageUrl: highlight.imageUrl,
      sortOrder: highlight.sortOrder,
    })),
    specs,
    updatedAt: toIso(row.updatedAt),
  };
}

export function mapCategory(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.imageUrl,
    iconUrl: row.iconUrl,
    parentId: row.parentId,
    isFeatured: row.isFeatured,
    sortOrder: row.sortOrder,
    productCount: row._count?.products ?? 0,
  };
}

export function isVariantSellable(variant: any) {
  return (
    variant?.isActive === true &&
    variant.product?.isActive === true &&
    variant.product?.status === "active" &&
    variant.product?.category?.isActive === true &&
    (!variant.product?.brand || variant.product.brand.isActive === true)
  );
}

export function availableQuantityFromStocks(stocks: any[] = []) {
  return stocks.reduce(
    (sum, stock) => sum + Math.max(0, stock.quantityOnHand - stock.quantityReserved),
    0,
  );
}

export function productHasStock(product: any) {
  return (product.variants ?? []).some((variant: any) =>
    (variant.inventoryStocks ?? []).some(
      (stock: any) => stock.quantityOnHand > stock.quantityReserved,
    ),
  );
}

export function defaultVariantPrice(product: any) {
  const variant = (product.variants ?? [])[0];
  return variant ? decimalToNumber(variant.price) : null;
}

export function mapFilterAttribute(row: any, products: any[]) {
  const valueCounts = new Map<string, number>();
  let min: number | null = null;
  let max: number | null = null;
  let trueCount = 0;
  let falseCount = 0;

  for (const product of products) {
    if (row.scope === "variant") {
      for (const variant of product.variants ?? []) {
        for (const entry of variant.attributeValues ?? []) {
          if (entry.attributeValue?.attributeId === row.attributeId) {
            valueCounts.set(
              entry.attributeValueId,
              (valueCounts.get(entry.attributeValueId) ?? 0) + 1,
            );
          }
        }
      }
      continue;
    }

    const assignment = (product.attributeAssignments ?? []).find(
      (item: any) => item.attributeId === row.attributeId,
    );
    if (!assignment) {
      continue;
    }
    if (assignment.attributeValueId) {
      valueCounts.set(
        assignment.attributeValueId,
        (valueCounts.get(assignment.attributeValueId) ?? 0) + 1,
      );
    }
    for (const entry of assignment.values ?? []) {
      valueCounts.set(
        entry.attributeValueId,
        (valueCounts.get(entry.attributeValueId) ?? 0) + 1,
      );
    }
    const numberValue = optionalNumber(assignment.rawNumber);
    if (numberValue !== undefined) {
      min = min === null ? numberValue : Math.min(min, numberValue);
      max = max === null ? numberValue : Math.max(max, numberValue);
    }
    if (typeof assignment.rawBoolean === "boolean") {
      if (assignment.rawBoolean) {
        trueCount += 1;
      } else {
        falseCount += 1;
      }
    }
  }

  return {
    id: row.id,
    attributeId: row.attributeId,
    name: row.attribute.name,
    slug: row.attribute.slug,
    type: row.attribute.type,
    scope: row.scope,
    inputType: row.inputType,
    unit: row.unit,
    sortOrder: row.sortOrder,
    values: (row.attribute.values ?? []).map((value: any) => ({
      id: value.id,
      attributeId: value.attributeId,
      value: value.value,
      label: value.label,
      sortOrder: value.sortOrder,
      productCount: valueCounts.get(value.id) ?? 0,
    })),
    range: min !== null && max !== null ? { min, max } : null,
    booleanCounts: trueCount || falseCount ? { true: trueCount, false: falseCount } : null,
  };
}
