import prisma, { type Prisma } from "@db/server";
import type {
  AddCartItemInput,
  CheckoutInput,
  ListShopFiltersQuery,
  ListShopProductsQuery,
  OrderLookupQuery,
  UpdateCartItemInput,
} from "./shop.dto";

const CART_TTL_DAYS = 30;
const RESERVATION_TTL_MINUTES = 30;

export class ShopServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

type ShopActor = {
  userId?: string;
  cartToken?: string;
};

type CartContext = {
  cartId: string;
  cartToken: string | null;
  shouldSetCookie: boolean;
};

type ParsedDynamicFilter = {
  valueIds?: string[];
  min?: number;
  max?: number;
  boolean?: boolean;
};

function normalizePagination(page?: number, limit?: number) {
  const normalizedLimit = Math.min(Math.max(limit ?? 20, 1), 100);
  return {
    limit: normalizedLimit,
    requestedPage: Math.max(page ?? 1, 1),
  };
}

function paginationResult<T>({
  items,
  total,
  requestedPage,
  limit,
}: {
  items: T[];
  total: number;
  requestedPage: number;
  limit: number;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    total,
    pages,
    page: Math.min(requestedPage, pages),
    limit,
  };
}

function toIso(value: Date | string | null | undefined) {
  if (!value) {
    return value ?? null;
  }
  return value instanceof Date ? value.toISOString() : value;
}

function decimalToString(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }
  return String(value);
}

function decimalToNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function money(value: number) {
  return value.toFixed(2);
}

function cartExpiresAt() {
  return new Date(Date.now() + CART_TTL_DAYS * 24 * 60 * 60 * 1000);
}

function nullableTrimmed(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

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

function selectedCategoryIds(query: Pick<ListShopProductsQuery, "categoryId" | "categoryIds">) {
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

function normalizedEmail(value: string | null | undefined) {
  return nullableTrimmed(value)?.toLowerCase() ?? null;
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

function normalizedCheckoutKey(actor: ShopActor, context: CartContext, key?: string) {
  const trimmed = nullableTrimmed(key);
  if (!trimmed) {
    return null;
  }
  const owner = actor.userId ?? context.cartToken ?? context.cartId;
  return `${owner}:${trimmed}`;
}

function reservationExpiresAt() {
  return new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000);
}

function normalizeQuantity(quantity: number) {
  const normalized = Math.trunc(quantity);
  if (normalized < 1) {
    throw new ShopServiceError("Quantity must be at least 1");
  }
  return Math.min(normalized, 99);
}

function isValidCartToken(value: string | undefined | null): value is string {
  return Boolean(value && /^[a-zA-Z0-9-]{20,100}$/.test(value));
}

function productInclude() {
  return {
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
      },
    },
    brand: {
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        isActive: true,
      },
    },
    variants: {
      where: { isActive: true },
      include: {
        inventoryStocks: {
          where: { location: { isActive: true } },
          select: {
            quantityOnHand: true,
            quantityReserved: true,
          },
        },
        attributeValues: {
          include: {
            attributeValue: {
              include: {
                attribute: {
                  select: { id: true, name: true, slug: true, type: true },
                },
              },
            },
          },
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    },
    highlights: {
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    },
    attributeAssignments: {
      include: {
        attribute: {
          select: { id: true, name: true, slug: true, type: true, sortOrder: true },
        },
        attributeValue: true,
        values: {
          include: { attributeValue: true },
        },
      },
      orderBy: [{ createdAt: "asc" }],
    },
  } satisfies Prisma.ProductInclude;
}

function cartInclude() {
  return {
    items: {
      include: {
        variant: {
          include: {
            inventoryStocks: {
              where: { location: { isActive: true } },
              select: {
                quantityOnHand: true,
                quantityReserved: true,
              },
            },
            product: {
              include: {
                category: {
                  select: { id: true, name: true, slug: true, isActive: true },
                },
                brand: {
                  select: { id: true, name: true, slug: true, isActive: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    },
  } satisfies Prisma.CartInclude;
}

function orderInclude() {
  return {
    addresses: {
      orderBy: { type: "desc" },
    },
    lineItems: {
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            coverImageUrl: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            name: true,
            imageUrls: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    },
    statusEvents: {
      orderBy: { createdAt: "desc" },
    },
  } satisfies Prisma.OrderInclude;
}

function mapVariant(row: any) {
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
    availableQuantity: (row.inventoryStocks ?? []).reduce(
      (sum: number, stock: any) =>
        sum + Math.max(0, stock.quantityOnHand - stock.quantityReserved),
      0,
    ),
  };
}

function mapProduct(row: any) {
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

function mapCategory(row: any) {
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

function mapShippingRate(row: any) {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    amount: decimalToString(row.amount),
    freeOverAmount: decimalToString(row.freeOverAmount),
    isDefault: row.isDefault,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

function mapOrderAddress(row: any) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    orderId: row.orderId,
    type: row.type,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    postalCode: row.postalCode,
    country: row.country,
    notes: row.notes,
  };
}

function mapOrder(row: any) {
  const addresses = (row.addresses ?? []).map(mapOrderAddress);
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    userId: row.userId,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    shippingAddress: addresses.find((address: any) => address.type === "shipping") ?? null,
    billingAddress: addresses.find((address: any) => address.type === "billing") ?? null,
    addresses,
    subtotalAmount: decimalToString(row.subtotalAmount),
    discountAmount: decimalToString(row.discountAmount),
    taxAmount: decimalToString(row.taxAmount),
    shippingAmount: decimalToString(row.shippingAmount),
    totalAmount: decimalToString(row.totalAmount),
    currency: row.currency,
    paymentMethod: row.paymentMethod,
    orderStatus: row.orderStatus,
    paymentStatus: row.paymentStatus,
    deliveryStatus: row.deliveryStatus,
    inventoryStatus: row.inventoryStatus,
    stockReservedUntil: toIso(row.stockReservedUntil),
    stockCommittedAt: toIso(row.stockCommittedAt),
    stockReleasedAt: toIso(row.stockReleasedAt),
    shippingRateId: row.shippingRateId,
    shippingMethodCode: row.shippingMethodCode,
    shippingMethodLabel: row.shippingMethodLabel,
    customerNotes: row.customerNotes,
    adminNotes: row.adminNotes,
    placedAt: toIso(row.placedAt),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    lineItems: (row.lineItems ?? []).map((item: any) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      product: item.product ?? null,
      variantId: item.variantId,
      variant: item.variant ?? null,
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      imageUrl: item.imageUrl,
      attributesSnapshot: item.attributesSnapshot ?? null,
      quantity: item.quantity,
      unitPrice: decimalToString(item.unitPrice),
      discountAmount: decimalToString(item.discountAmount),
      taxAmount: decimalToString(item.taxAmount),
      subtotalAmount: decimalToString(item.subtotalAmount),
      totalAmount: decimalToString(item.totalAmount),
    })),
    statusEvents: row.statusEvents ?? [],
  };
}

function isVariantSellable(variant: any) {
  return (
    variant?.isActive === true &&
    variant.product?.isActive === true &&
    variant.product?.status === "active" &&
    variant.product?.category?.isActive === true &&
    (!variant.product?.brand || variant.product.brand.isActive === true)
  );
}

function availableQuantityFromStocks(stocks: any[] = []) {
  return stocks.reduce(
    (sum, stock) => sum + Math.max(0, stock.quantityOnHand - stock.quantityReserved),
    0,
  );
}

function mapCart(cart: any) {
  const items = (cart.items ?? [])
    .filter((item: any) => isVariantSellable(item.variant))
    .map((item: any) => {
      const unitPrice = decimalToNumber(item.variant.price);
      const availableQuantity = availableQuantityFromStocks(item.variant.inventoryStocks);
      const quantity = Math.min(item.quantity, availableQuantity);
      const lineTotal = unitPrice * quantity;
      return {
        id: item.id,
        cartId: item.cartId,
        variantId: item.variantId,
        quantity,
        unitPrice: money(unitPrice),
        lineTotal: money(lineTotal),
        variant: mapVariant(item.variant),
        product: {
          id: item.variant.product.id,
          name: item.variant.product.name,
          slug: item.variant.product.slug,
          coverImageUrl: item.variant.product.coverImageUrl,
          category: item.variant.product.category ?? null,
          brand: item.variant.product.brand ?? null,
        },
      };
    });

  const subtotal = items.reduce((sum: number, item: any) => sum + Number(item.lineTotal), 0);
  return {
    id: cart.id,
    cartToken: cart.cartToken,
    userId: cart.userId,
    items,
    itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    subtotalAmount: subtotal.toFixed(2),
    discountAmount: "0.00",
    taxAmount: "0.00",
    shippingAmount: "0.00",
    totalAmount: subtotal.toFixed(2),
    currency: items[0]?.variant.currency ?? "BDT",
    expiresAt: toIso(cart.expiresAt),
    updatedAt: toIso(cart.updatedAt),
  };
}

function checkoutLineFromItem(item: any) {
  if (!isVariantSellable(item.variant)) {
    throw new ShopServiceError(
      `${item.variant?.product?.name ?? "Product"} is no longer available`,
      409,
    );
  }

  const unitPrice = decimalToNumber(item.variant.price);
  if (unitPrice <= 0) {
    throw new ShopServiceError("Product price is not available", 409);
  }

  const availableQuantity = availableQuantityFromStocks(item.variant.inventoryStocks);
  if (availableQuantity < item.quantity) {
    throw new ShopServiceError(
      `Not enough stock for ${item.variant.product.name}`,
      409,
    );
  }

  const subtotal = unitPrice * item.quantity;
  return {
    cartItemId: item.id,
    variantId: item.variantId,
    productId: item.variant.productId,
    productName: item.variant.product.name,
    variantName: item.variant.name,
    sku: item.variant.sku,
    imageUrl: item.variant.imageUrls?.[0] ?? item.variant.product.coverImageUrl ?? null,
    attributesSnapshot: item.variant.attributesSnapshot ?? null,
    quantity: item.quantity,
    unitPrice,
    subtotal,
    total: subtotal,
    currency: item.variant.currency,
  };
}

async function reserveLineStock(tx: Prisma.TransactionClient, input: {
  orderId: string;
  line: ReturnType<typeof checkoutLineFromItem>;
  expiresAt: Date;
  userId?: string;
}) {
  const stocks = await tx.inventoryStock.findMany({
    where: {
      variantId: input.line.variantId,
      location: { isActive: true },
    },
    orderBy: [{ updatedAt: "asc" }],
  });
  let remaining = input.line.quantity;
  for (const stock of stocks) {
    const available = stock.quantityOnHand - stock.quantityReserved;
    if (available <= 0) {
      continue;
    }

    const quantity = Math.min(available, remaining);
    await tx.inventoryStock.update({
      where: { id: stock.id },
      data: { quantityReserved: { increment: quantity } },
    });
    await tx.stockReservation.create({
      data: {
        variantId: stock.variantId,
        locationId: stock.locationId,
        batchId: stock.batchId,
        quantity,
        status: "active",
        expiresAt: input.expiresAt,
        referenceType: "order",
        referenceId: input.orderId,
      },
    });
    await tx.inventoryMovement.create({
      data: {
        variantId: stock.variantId,
        locationId: stock.locationId,
        batchId: stock.batchId,
        type: "sale_reserve",
        delta: 0,
        reason: "Order stock reserved",
        referenceType: "order",
        referenceId: input.orderId,
        actorUserId: input.userId ?? null,
      },
    });

    remaining -= quantity;
    if (remaining === 0) {
      break;
    }
  }

  if (remaining > 0) {
    throw new ShopServiceError(
      `Not enough stock for ${input.line.productName}`,
      409,
    );
  }
}

function normalizeAddress(input: CheckoutInput["shippingAddress"], fallback: {
  name: string;
  email: string;
  phone: string | null;
}) {
  return {
    fullName: nullableTrimmed(input.fullName) ?? fallback.name,
    email: normalizedEmail(input.email) ?? fallback.email,
    phone: nullableTrimmed(input.phone) ?? fallback.phone,
    line1: input.line1.trim(),
    line2: nullableTrimmed(input.line2),
    city: nullableTrimmed(input.city),
    state: nullableTrimmed(input.state),
    postalCode: nullableTrimmed(input.postalCode),
    country: nullableTrimmed(input.country) ?? "Bangladesh",
    notes: nullableTrimmed(input.notes),
  };
}

function shippingAmountForRate(rate: any, subtotal: number) {
  const freeOverAmount = decimalToNumber(rate.freeOverAmount);
  if (freeOverAmount > 0 && subtotal >= freeOverAmount) {
    return 0;
  }
  return decimalToNumber(rate.amount);
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

async function publicFilterableAttributes(categoryId?: string | null) {
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

async function buildProductWhere(query: ListShopProductsQuery = {}) {
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

function productOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
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

async function listPublicCategories() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      iconUrl: true,
      parentId: true,
      isFeatured: true,
      sortOrder: true,
      _count: {
        select: {
          products: {
            where: {
              status: "active",
              isActive: true,
              variants: { some: { isActive: true } },
            },
          },
        },
      },
    },
    orderBy: [
      { isFeatured: "desc" },
      { sortOrder: "asc" },
      { name: "asc" },
    ],
  });

  return categories.map(mapCategory);
}

function productHasStock(product: any) {
  return (product.variants ?? []).some((variant: any) =>
    (variant.inventoryStocks ?? []).some(
      (stock: any) => stock.quantityOnHand > stock.quantityReserved,
    ),
  );
}

function defaultVariantPrice(product: any) {
  const variant = (product.variants ?? [])[0];
  return variant ? decimalToNumber(variant.price) : null;
}

function mapFilterAttribute(row: any, products: any[]) {
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

export const shopService = {
  async listCategories() {
    return listPublicCategories();
  },

  async listFilters(query: ListShopFiltersQuery = {}) {
    const selectedCategories = selectedCategoryIds(query);
    const singleSelectedCategoryId = selectedCategories.length === 1 ? selectedCategories[0] : undefined;
    const productWhere = await buildProductWhere({
      categoryIds: selectedCategories.join(","),
    });
    const [categories, products, attributes] = await Promise.all([
      listPublicCategories(),
      prisma.product.findMany({
        where: productWhere,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              isActive: true,
            },
          },
          variants: {
            where: { isActive: true },
            include: {
              inventoryStocks: {
                where: { location: { isActive: true } },
                select: {
                  quantityOnHand: true,
                  quantityReserved: true,
                },
              },
              attributeValues: {
                include: { attributeValue: true },
              },
            },
            orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
          },
          attributeAssignments: {
            include: {
              attributeValue: true,
              values: { include: { attributeValue: true } },
            },
          },
        },
      }),
      publicFilterableAttributes(singleSelectedCategoryId),
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

  async listShippingRates() {
    const rates = await prisma.shippingRate.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    });
    return rates.map(mapShippingRate);
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
        isActive: true,
        category: { isActive: true },
        OR: [{ brandId: null }, { brand: { isActive: true } }],
        variants: { some: { isActive: true } },
      },
      include: productInclude(),
    });

    if (!product) {
      throw new ShopServiceError("Product not found", 404);
    }

    return mapProduct(product);
  },

  async getOrCreateCart(actor: ShopActor): Promise<CartContext> {
    const expiresAt = cartExpiresAt();
    if (actor.userId) {
      let cart = await prisma.cart.findFirst({
        where: { userId: actor.userId, expiresAt: { gt: new Date() } },
        orderBy: { updatedAt: "desc" },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: actor.userId, cartToken: null, expiresAt },
        });
      }

      if (isValidCartToken(actor.cartToken)) {
        const guestCart = await prisma.cart.findUnique({
          where: { cartToken: actor.cartToken },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    inventoryStocks: {
                      where: { location: { isActive: true } },
                      select: { quantityOnHand: true, quantityReserved: true },
                    },
                    product: { include: { category: true, brand: true } },
                  },
                },
              },
            },
          },
        });
        if (guestCart && guestCart.id !== cart.id && !guestCart.userId) {
          await prisma.$transaction(async (tx) => {
            for (const item of guestCart.items) {
              if (!isVariantSellable(item.variant)) {
                continue;
              }
              const availableQuantity = availableQuantityFromStocks(
                item.variant.inventoryStocks,
              );
              if (availableQuantity < 1) {
                continue;
              }
              const existingItem = await tx.cartItem.findUnique({
                where: {
                  cartId_variantId: {
                    cartId: cart.id,
                    variantId: item.variantId,
                  },
                },
              });
              const quantity = Math.min(
                (existingItem?.quantity ?? 0) + item.quantity,
                availableQuantity,
                99,
              );
              await tx.cartItem.upsert({
                where: {
                  cartId_variantId: {
                    cartId: cart.id,
                    variantId: item.variantId,
                  },
                },
                create: {
                  cartId: cart.id,
                  variantId: item.variantId,
                  quantity,
                },
                update: { quantity },
              });
            }
            await tx.cart.delete({ where: { id: guestCart.id } });
          });
        }
      }

      await prisma.cart.update({
        where: { id: cart.id },
        data: { expiresAt },
      });
      return { cartId: cart.id, cartToken: null, shouldSetCookie: false };
    }

    const token = isValidCartToken(actor.cartToken) ? actor.cartToken : crypto.randomUUID();
    const cart = await prisma.cart.upsert({
      where: { cartToken: token },
      create: { cartToken: token, expiresAt },
      update: { expiresAt },
    });

    return {
      cartId: cart.id,
      cartToken: token,
      shouldSetCookie: token !== actor.cartToken,
    };
  },

  async getCart(actor: ShopActor) {
    const context = await this.getOrCreateCart(actor);
    const cart = await prisma.cart.findUniqueOrThrow({
      where: { id: context.cartId },
      include: cartInclude(),
    });
    return { cart: mapCart(cart), context };
  },

  async addCartItem(actor: ShopActor, input: AddCartItemInput) {
    const quantity = normalizeQuantity(input.quantity);
    const variant = await prisma.productVariant.findUnique({
      where: { id: input.variantId },
      include: {
        inventoryStocks: {
          where: { location: { isActive: true } },
          select: { quantityOnHand: true, quantityReserved: true },
        },
        product: { include: { category: true, brand: true } },
      },
    });
    if (!isVariantSellable(variant)) {
      throw new ShopServiceError("Product variant is not available", 404);
    }
    const sellableVariant = variant!;

    const context = await this.getOrCreateCart(actor);
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: context.cartId, variantId: input.variantId },
    });
    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    const availableQuantity = availableQuantityFromStocks(sellableVariant.inventoryStocks);
    if (nextQuantity > availableQuantity) {
      throw new ShopServiceError("Not enough stock for this quantity", 409);
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: context.cartId,
          variantId: input.variantId,
        },
      },
      create: {
        cartId: context.cartId,
        variantId: input.variantId,
        quantity,
      },
      update: {
        quantity: { increment: quantity },
      },
    });

    return this.getCart({ userId: actor.userId, cartToken: context.cartToken ?? actor.cartToken });
  },

  async updateCartItem(actor: ShopActor, id: string, input: UpdateCartItemInput) {
    const quantity = normalizeQuantity(input.quantity);
    const context = await this.getOrCreateCart(actor);
    const existing = await prisma.cartItem.findFirst({
      where: { id, cartId: context.cartId },
      include: {
        variant: {
          include: {
            inventoryStocks: {
              where: { location: { isActive: true } },
              select: { quantityOnHand: true, quantityReserved: true },
            },
            product: { include: { category: true, brand: true } },
          },
        },
      },
    });
    if (!existing) {
      throw new ShopServiceError("Cart item not found", 404);
    }
    if (!isVariantSellable(existing.variant)) {
      throw new ShopServiceError("Product variant is not available", 404);
    }
    const availableQuantity = availableQuantityFromStocks(existing.variant.inventoryStocks);
    if (quantity > availableQuantity) {
      throw new ShopServiceError("Not enough stock for this quantity", 409);
    }

    await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return this.getCart({ userId: actor.userId, cartToken: context.cartToken ?? actor.cartToken });
  },

  async removeCartItem(actor: ShopActor, id: string) {
    const context = await this.getOrCreateCart(actor);
    const existing = await prisma.cartItem.findFirst({
      where: { id, cartId: context.cartId },
    });
    if (!existing) {
      throw new ShopServiceError("Cart item not found", 404);
    }

    await prisma.cartItem.delete({ where: { id } });

    return this.getCart({ userId: actor.userId, cartToken: context.cartToken ?? actor.cartToken });
  },

  async checkout(actor: ShopActor, input: CheckoutInput) {
    const context = await this.getOrCreateCart(actor);
    const checkoutKey = normalizedCheckoutKey(actor, context, input.idempotencyKey);
    if (checkoutKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { checkoutKey },
      });
      if (existingOrder) {
        return {
          orderId: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          totalAmount: decimalToString(existingOrder.totalAmount) ?? "0.00",
          currency: existingOrder.currency,
          context,
        };
      }
    }

    const cart = await prisma.cart.findUnique({
      where: { id: context.cartId },
      include: cartInclude(),
    });
    if (!cart || cart.items.length === 0) {
      throw new ShopServiceError("Cart is empty");
    }

    const lines = cart.items.map(checkoutLineFromItem);
    const currencies = new Set(lines.map((line) => line.currency));
    if (currencies.size > 1) {
      throw new ShopServiceError("Cart contains multiple currencies");
    }

    const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
    const shippingRate = await prisma.shippingRate.findFirst({
      where: input.shippingRateId
        ? { id: input.shippingRateId, isActive: true }
        : input.shippingRateCode
          ? { code: input.shippingRateCode, isActive: true }
          : { isDefault: true, isActive: true },
      orderBy: [{ sortOrder: "asc" }],
    });
    if (!shippingRate) {
      throw new ShopServiceError("Shipping method is not available", 409);
    }
    const shippingAmount = shippingAmountForRate(shippingRate, subtotal);
    const total = subtotal + shippingAmount;
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const expiresAt = reservationExpiresAt();
    const customerName = input.customerName.trim();
    const customerEmail = input.customerEmail.trim().toLowerCase();
    const customerPhone = nullableTrimmed(input.customerPhone);
    const addressFallback = {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
    };
    const shippingAddress = normalizeAddress(input.shippingAddress, addressFallback);
    const billingAddress = normalizeAddress(
      input.billingAddress ?? input.shippingAddress,
      addressFallback,
    );

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          checkoutKey,
          userId: actor.userId ?? null,
          customerName,
          customerEmail,
          customerPhone,
          subtotalAmount: subtotal.toFixed(2),
          discountAmount: "0.00",
          taxAmount: "0.00",
          shippingAmount: money(shippingAmount),
          totalAmount: total.toFixed(2),
          currency: lines[0]?.currency ?? "BDT",
          paymentMethod: input.paymentMethod ?? "cash_on_delivery",
          orderStatus: "pending",
          paymentStatus: "unpaid",
          deliveryStatus: "unfulfilled",
          inventoryStatus: "reserved",
          stockReservedUntil: expiresAt,
          shippingRateId: shippingRate.id,
          shippingMethodCode: shippingRate.code,
          shippingMethodLabel: shippingRate.label,
          customerNotes: input.customerNotes?.trim() || null,
          addresses: {
            create: [
              { type: "shipping", ...shippingAddress },
              { type: "billing", ...billingAddress },
            ],
          },
          lineItems: {
            create: lines.map((line) => ({
              productId: line.productId,
              variantId: line.variantId,
              productName: line.productName,
              variantName: line.variantName,
              sku: line.sku,
              imageUrl: line.imageUrl,
              attributesSnapshot: line.attributesSnapshot,
              quantity: line.quantity,
              unitPrice: line.unitPrice.toFixed(2),
              discountAmount: "0.00",
              taxAmount: "0.00",
              subtotalAmount: line.subtotal.toFixed(2),
              totalAmount: line.total.toFixed(2),
            })),
          },
          statusEvents: {
            create: [
              {
                type: "order",
                previousValue: null,
                newValue: "pending",
                note: "Order placed from checkout",
                actorUserId: actor.userId ?? null,
              },
            ],
          },
        },
      });

      for (const line of lines) {
        await reserveLineStock(tx, {
          orderId: created.id,
          line,
          expiresAt,
          userId: actor.userId,
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: total.toFixed(2),
      currency: lines[0]?.currency ?? "BDT",
      context,
    };
  },

  async listCustomerOrders(actor: ShopActor) {
    if (!actor.userId) {
      return { items: [], total: 0, pages: 1, page: 1, limit: 20 };
    }

    const items = await prisma.order.findMany({
      where: { userId: actor.userId },
      include: orderInclude(),
      orderBy: [{ placedAt: "desc" }, { createdAt: "desc" }],
      take: 20,
    });

    return {
      items: items.map(mapOrder),
      total: items.length,
      pages: 1,
      page: 1,
      limit: 20,
    };
  },

  async getCustomerOrder(
    actor: ShopActor,
    orderNumber: string,
    query: OrderLookupQuery = {},
  ) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: orderInclude(),
    });
    if (!order) {
      throw new ShopServiceError("Order not found", 404);
    }

    const email = normalizedEmail(query.email);
    const phone = nullableTrimmed(query.phone);
    const canRead =
      (actor.userId && order.userId === actor.userId) ||
      (email && order.customerEmail.toLowerCase() === email) ||
      (phone && order.customerPhone === phone);

    if (!canRead) {
      throw new ShopServiceError("Order not found", 404);
    }

    return mapOrder(order);
  },
};
