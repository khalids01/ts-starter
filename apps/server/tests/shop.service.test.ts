import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

mock.restore();

const productCountMock = mock(async () => 1);
const productFindManyMock = mock(async () => [productRow()]);
const productFindFirstMock = mock(async () => productRow());
const productVariantFindManyMock = mock(async () => [variantRow()]);
const categoryFindManyMock = mock(async () => [
  categoryRow({
    id: "cat-featured",
    name: "Food",
    slug: "food",
    isFeatured: true,
    sortOrder: 20,
  }),
  categoryRow({
    id: "cat-gadgets",
    name: "Gadgets",
    slug: "gadgets",
    isFeatured: false,
    sortOrder: 30,
  }),
]);
const categoryAttributeFindManyMock = mock(async () => []);

const orderCreateMock = mock(async () => ({
  id: "order-1",
  orderNumber: "ORD-TEST",
}));
const orderFindUniqueMock = mock(async () => null as any);
const orderFindManyMock = mock(async () => []);
const shippingRateFindFirstMock = mock(async () => shippingRateRow());
const shippingRateFindManyMock = mock(async () => [shippingRateRow()]);
const inventoryStockFindManyMock = mock(async () => [stockRow()]);
const inventoryStockUpdateMock = mock(async () => stockRow({ quantityReserved: 2 }));
const stockReservationCreateMock = mock(async (args: any) => ({ id: "reservation-1", ...args.data }));
const inventoryMovementCreateMock = mock(async (args: any) => ({ id: "movement-1", ...args.data }));
const transactionMock = mock(async (callback: any) => callback(prismaMock));

const prismaMock = {
  $transaction: transactionMock,
  product: {
    count: productCountMock,
    findMany: productFindManyMock,
    findFirst: productFindFirstMock,
  },
  productVariant: {
    findMany: productVariantFindManyMock,
  },
  category: {
    findMany: categoryFindManyMock,
  },
  categoryAttribute: {
    findMany: categoryAttributeFindManyMock,
  },
  order: {
    findUnique: orderFindUniqueMock,
    findMany: orderFindManyMock,
    create: orderCreateMock,
  },
  shippingRate: {
    findFirst: shippingRateFindFirstMock,
    findMany: shippingRateFindManyMock,
  },
  inventoryStock: {
    findMany: inventoryStockFindManyMock,
    update: inventoryStockUpdateMock,
  },
  stockReservation: {
    create: stockReservationCreateMock,
  },
  inventoryMovement: {
    create: inventoryMovementCreateMock,
  },
};

mock.module("@db/server", () => ({
  default: prismaMock,
}));

function productRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "product-1",
    name: overrides.name ?? "Mango",
    slug: overrides.slug ?? "mango",
    description: overrides.description ?? "Fresh mango",
    descriptionHtml: overrides.descriptionHtml ?? null,
    categoryId: overrides.categoryId ?? "cat-1",
    category: overrides.category ?? { id: "cat-1", name: "Fruit", slug: "fruit", isActive: true },
    brandId: overrides.brandId ?? null,
    brand: overrides.brand ?? null,
    status: overrides.status ?? "active",
    isActive: overrides.isActive ?? true,
    isFeatured: overrides.isFeatured ?? false,
    isTrending: overrides.isTrending ?? false,
    badgeLabel: overrides.badgeLabel ?? null,
    coverImageUrl: overrides.coverImageUrl ?? null,
    searchKeywords: overrides.searchKeywords ?? [],
    seoTitle: overrides.seoTitle ?? null,
    seoDescription: overrides.seoDescription ?? null,
    variants: overrides.variants ?? [variantRow({ product: undefined })],
    highlights: overrides.highlights ?? [],
    attributeAssignments: overrides.attributeAssignments ?? [],
    updatedAt: new Date("2026-06-15T10:00:00.000Z"),
  };
}

function categoryRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "cat-1",
    name: overrides.name ?? "Fruit",
    slug: overrides.slug ?? "fruit",
    description: overrides.description ?? "Fresh food and essentials",
    imageUrl: overrides.imageUrl ?? null,
    iconUrl: overrides.iconUrl ?? null,
    parentId: overrides.parentId ?? null,
    isFeatured: overrides.isFeatured ?? false,
    sortOrder: overrides.sortOrder ?? 10,
    _count: overrides._count ?? { products: 2 },
  };
}

function attributeValueRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "value-1",
    attributeId: overrides.attributeId ?? "attr-1",
    value: overrides.value ?? "value-1",
    label: overrides.label ?? "Value 1",
    sortOrder: overrides.sortOrder ?? 10,
  };
}

function categoryAttributeRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "category-attribute-1",
    categoryId: overrides.categoryId ?? "cat-1",
    attributeId: overrides.attributeId ?? "attr-1",
    scope: overrides.scope ?? "product",
    required: overrides.required ?? false,
    filterable: overrides.filterable ?? true,
    variantDefining: overrides.variantDefining ?? false,
    comparable: overrides.comparable ?? false,
    inputType: overrides.inputType ?? "select",
    unit: overrides.unit ?? null,
    groupName: overrides.groupName ?? null,
    helpText: overrides.helpText ?? null,
    placeholder: overrides.placeholder ?? null,
    sortOrder: overrides.sortOrder ?? 10,
    attribute: overrides.attribute ?? {
      id: "attr-1",
      name: "Specification",
      slug: "specification",
      type: "text",
      filterable: true,
      variantDefining: false,
      sortOrder: 10,
      values: [attributeValueRow()],
    },
  };
}

function variantRow(overrides: Record<string, any> = {}) {
  const product =
    overrides.product === undefined
      ? {
          id: "product-1",
          name: "Mango",
          slug: "mango",
          coverImageUrl: null,
          isActive: true,
          status: "active",
          category: { id: "cat-1", name: "Fruit", slug: "fruit", isActive: true },
          brand: null,
        }
      : overrides.product;

  return {
    id: overrides.id ?? "variant-1",
    productId: overrides.productId ?? "product-1",
    product,
    sku: overrides.sku ?? "MANGO-1KG",
    barcode: overrides.barcode ?? null,
    name: overrides.name ?? "1kg",
    attributesSnapshot: overrides.attributesSnapshot ?? null,
    price: overrides.price ?? "120.00",
    compareAtPrice: overrides.compareAtPrice ?? null,
    currency: overrides.currency ?? "BDT",
    isDefault: overrides.isDefault ?? true,
    isActive: overrides.isActive ?? true,
    imageUrls: overrides.imageUrls ?? [],
    inventoryStocks: overrides.inventoryStocks ?? [stockRow()],
    weightValue: overrides.weightValue ?? null,
    weightUnit: overrides.weightUnit ?? null,
    attributeValues: overrides.attributeValues ?? [],
  };
}

function stockRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "stock-1",
    stockKey: overrides.stockKey ?? "variant-1:loc-main:no_batch",
    variantId: overrides.variantId ?? "variant-1",
    locationId: overrides.locationId ?? "loc-main",
    batchId: overrides.batchId ?? null,
    quantityOnHand: overrides.quantityOnHand ?? 10,
    quantityReserved: overrides.quantityReserved ?? 0,
    reorderLevel: overrides.reorderLevel ?? null,
    createdAt: new Date("2026-06-15T10:00:00.000Z"),
    updatedAt: new Date("2026-06-15T10:00:00.000Z"),
  };
}

function shippingRateRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "ship-inside",
    code: overrides.code ?? "inside_city",
    label: overrides.label ?? "Inside city",
    amount: overrides.amount ?? "60.00",
    freeOverAmount: overrides.freeOverAmount ?? null,
    isDefault: overrides.isDefault ?? true,
    isActive: overrides.isActive ?? true,
    sortOrder: overrides.sortOrder ?? 10,
  };
}

beforeEach(() => {
  categoryFindManyMock.mockResolvedValue([
    categoryRow({
      id: "cat-featured",
      name: "Food",
      slug: "food",
      isFeatured: true,
      sortOrder: 20,
    }),
    categoryRow({
      id: "cat-gadgets",
      name: "Gadgets",
      slug: "gadgets",
      isFeatured: false,
      sortOrder: 30,
    }),
  ]);
  categoryAttributeFindManyMock.mockResolvedValue([]);
  productCountMock.mockResolvedValue(1);
  productFindManyMock.mockResolvedValue([productRow()]);
  productVariantFindManyMock.mockResolvedValue([variantRow()]);
  orderFindUniqueMock.mockResolvedValue(null);
  orderFindManyMock.mockResolvedValue([]);
  shippingRateFindFirstMock.mockResolvedValue(shippingRateRow());
  shippingRateFindManyMock.mockResolvedValue([shippingRateRow()]);
  inventoryStockFindManyMock.mockResolvedValue([stockRow()]);
  transactionMock.mockImplementation(async (callback: any) => callback(prismaMock));
});

afterEach(() => {
  for (const fn of [
    productCountMock,
    productFindManyMock,
    productFindFirstMock,
    productVariantFindManyMock,
    categoryFindManyMock,
    categoryAttributeFindManyMock,
    orderCreateMock,
    orderFindUniqueMock,
    orderFindManyMock,
    shippingRateFindFirstMock,
    shippingRateFindManyMock,
    inventoryStockFindManyMock,
    inventoryStockUpdateMock,
    stockReservationCreateMock,
    inventoryMovementCreateMock,
    transactionMock,
  ]) {
    fn.mockClear();
  }
});

describe("shop service", () => {
  it("lists only public active categories with product counts", async () => {
    const { categoryService } = await import("../src/modules/shop/services/category.service.ts");

    const result = await categoryService.listCategories();

    expect(categoryFindManyMock).toHaveBeenCalledWith({
      where: { isActive: true },
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
    expect(result).toEqual([
      expect.objectContaining({
        id: "cat-featured",
        name: "Food",
        slug: "food",
        productCount: 2,
      }),
      expect.objectContaining({
        id: "cat-gadgets",
        name: "Gadgets",
        slug: "gadgets",
        productCount: 2,
      }),
    ]);
    expect(result[0]).not.toHaveProperty("attributes");
    expect(result[0]).not.toHaveProperty("brandPolicy");
  });

  it("lists common public filters without category attributes by default", async () => {
    const { productService } = await import("../src/modules/shop/services/product.service.ts");

    productFindManyMock.mockResolvedValueOnce([
      productRow({
        brand: { id: "brand-1", name: "Acme", slug: "acme", logoUrl: null, isActive: true },
        variants: [variantRow({ price: "100.00" })],
      }),
    ]);

    const result = await productService.listFilters();

    expect(result.categories).toHaveLength(2);
    expect(result.brands).toEqual([
      expect.objectContaining({ id: "brand-1", name: "Acme", productCount: 1 }),
    ]);
    expect(result.priceRange).toEqual({ min: 100, max: 100, currency: "BDT" });
    expect(result.availability).toEqual({ inStock: 1, outOfStock: 0 });
    expect(result.attributes).toEqual([]);
    expect(categoryAttributeFindManyMock).not.toHaveBeenCalled();
  });

  it("lists selected category public filterable attributes", async () => {
    const { productService } = await import("../src/modules/shop/services/product.service.ts");

    categoryFindManyMock
      .mockResolvedValueOnce([
        categoryRow({ id: "cat-parent", parentId: null }),
        categoryRow({ id: "cat-child", parentId: "cat-parent" }),
      ])
      .mockResolvedValueOnce([categoryRow({ id: "cat-parent" })]);
    categoryAttributeFindManyMock.mockResolvedValueOnce([
      categoryAttributeRow({
        categoryId: "cat-parent",
        attributeId: "attr-1",
        attribute: {
          id: "attr-1",
          name: "Size",
          slug: "size",
          type: "text",
          filterable: true,
          variantDefining: false,
          sortOrder: 10,
          values: [attributeValueRow({ id: "value-1", label: "Large" })],
        },
      }),
    ]);
    productFindManyMock.mockResolvedValueOnce([
      productRow({
        attributeAssignments: [
          {
            attributeId: "attr-1",
            attributeValueId: "value-1",
            attributeValue: attributeValueRow({ id: "value-1", label: "Large" }),
            values: [],
          },
        ],
      }),
    ]);

    const result = await productService.listFilters({ categoryId: "cat-parent" });

    expect(categoryAttributeFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categoryId: "cat-parent",
          filterable: true,
        }),
      }),
    );
    expect(result.attributes).toEqual([
      expect.objectContaining({
        attributeId: "attr-1",
        name: "Size",
        values: [expect.objectContaining({ id: "value-1", productCount: 1 })],
      }),
    ]);
  });

  it("applies category descendants, price, stock, brand, and dynamic filters to products", async () => {
    const { productService } = await import("../src/modules/shop/services/product.service.ts");

    categoryFindManyMock.mockResolvedValueOnce([
      categoryRow({ id: "cat-parent", parentId: null }),
      categoryRow({ id: "cat-child", parentId: "cat-parent" }),
    ]);
    categoryAttributeFindManyMock.mockResolvedValueOnce([
      categoryAttributeRow({ categoryId: "cat-parent", attributeId: "attr-1" }),
    ]);

    await productService.listProducts({
      categoryId: "cat-parent",
      brandId: "brand-1",
      minPrice: 10,
      maxPrice: 99,
      inStock: true,
      filters: JSON.stringify({ "attr-1": ["value-1"] }),
    });

    expect(productCountMock).toHaveBeenCalledWith({
      where: expect.objectContaining({
        AND: expect.arrayContaining([
          { categoryId: { in: ["cat-parent", "cat-child"] } },
          { brandId: { in: ["brand-1"] } },
          { variants: { some: { isActive: true, price: { gte: 10, lte: 99 } } } },
          {
            variants: {
              some: {
                isActive: true,
                inventoryStocks: { some: { quantityOnHand: { gt: 0 } } },
              },
            },
          },
          {
            attributeAssignments: {
              some: {
                attributeId: "attr-1",
                OR: [
                  { attributeValueId: { in: ["value-1"] } },
                  { values: { some: { attributeValueId: { in: ["value-1"] } } } },
                ],
              },
            },
          },
        ]),
      }),
    });
  });

  it("applies multiple categories, brands, and out-of-stock availability to products", async () => {
    const { productService } = await import("../src/modules/shop/services/product.service.ts");

    categoryFindManyMock.mockResolvedValueOnce([
      categoryRow({ id: "cat-a", parentId: null }),
      categoryRow({ id: "cat-a-child", parentId: "cat-a" }),
      categoryRow({ id: "cat-b", parentId: null }),
    ]);

    await productService.listProducts({
      categoryIds: "cat-a,cat-b",
      brandIds: "brand-1,brand-2",
      availability: "out-of-stock",
    });

    expect(productCountMock).toHaveBeenCalledWith({
      where: expect.objectContaining({
        AND: expect.arrayContaining([
          { categoryId: { in: ["cat-a", "cat-b", "cat-a-child"] } },
          { brandId: { in: ["brand-1", "brand-2"] } },
          {
            NOT: {
              variants: {
                some: {
                  isActive: true,
                  inventoryStocks: { some: { quantityOnHand: { gt: 0 } } },
                },
              },
            },
          },
        ]),
      }),
    });
  });

  it("creates an order and reserves stock during checkout", async () => {
    const { orderService } = await import("../src/modules/shop/services/order.service.ts");

    const result = await orderService.checkout(
      "user-1",
      {
        items: [{ variantId: "variant-1", quantity: 2 }],
        customerName: "Customer",
        customerEmail: "customer@example.com",
        customerPhone: null,
        shippingAddress: { line1: "House 1", city: "Dhaka" },
        billingAddress: null,
        customerNotes: null,
        shippingRateCode: "inside_city",
        idempotencyKey: "checkout-1",
      },
    );

    expect(result.orderId).toBe("order-1");
    expect(orderCreateMock).toHaveBeenCalled();
    expect(orderCreateMock.mock.calls[0]?.[0].data).toEqual(
      expect.objectContaining({
        checkoutKey: "user-1:checkout-1",
        paymentMethod: "cash_on_delivery",
        shippingAmount: "60.00",
        totalAmount: "300.00",
        inventoryStatus: "reserved",
        shippingMethodCode: "inside_city",
        addresses: {
          create: [
            expect.objectContaining({
              type: "shipping",
              line1: "House 1",
              city: "Dhaka",
              country: "Bangladesh",
            }),
            expect.objectContaining({
              type: "billing",
              line1: "House 1",
            }),
          ],
        },
      }),
    );
    expect(inventoryStockUpdateMock).toHaveBeenCalledWith({
      where: { id: "stock-1" },
      data: { quantityReserved: { increment: 2 } },
    });
    expect(stockReservationCreateMock).toHaveBeenCalled();
    expect(inventoryMovementCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "sale_reserve",
        delta: 0,
        referenceType: "order",
        referenceId: "order-1",
      }),
    });
    expect(productVariantFindManyMock).toHaveBeenCalledWith({
      where: { id: { in: ["variant-1"] } },
      include: expect.any(Object),
    });
  });

  it("returns an existing order for a duplicate idempotency key", async () => {
    const { orderService } = await import("../src/modules/shop/services/order.service.ts");
    orderFindUniqueMock.mockResolvedValueOnce({
      id: "order-existing",
      orderNumber: "ORD-EXISTING",
      totalAmount: "300.00",
      currency: "BDT",
    });

    const result = await orderService.checkout(
      "user-1",
      {
        items: [{ variantId: "variant-1", quantity: 2 }],
        customerName: "Customer",
        customerEmail: "customer@example.com",
        shippingAddress: { line1: "House 1" },
        idempotencyKey: "checkout-1",
      },
    );

    expect(result.orderId).toBe("order-existing");
    expect(orderCreateMock).not.toHaveBeenCalled();
    expect(inventoryStockUpdateMock).not.toHaveBeenCalled();
  });

  it("fails checkout when stock cannot be reserved", async () => {
    const { orderService } = await import("../src/modules/shop/services/order.service.ts");
    productVariantFindManyMock.mockResolvedValueOnce([
      variantRow({ inventoryStocks: [stockRow({ quantityOnHand: 1 })] }),
    ]);

    await expect(
      orderService.checkout(
        "user-1",
        {
          items: [{ variantId: "variant-1", quantity: 2 }],
          customerName: "Customer",
          customerEmail: "customer@example.com",
          shippingAddress: { line1: "House 1", city: "Dhaka" },
          shippingRateCode: "inside_city",
        },
      ),
    ).rejects.toThrow("Not enough stock");

    expect(orderCreateMock).not.toHaveBeenCalled();
    expect(inventoryStockUpdateMock).not.toHaveBeenCalled();
  });

  it("rejects inactive variants", async () => {
    const { orderService } = await import("../src/modules/shop/services/order.service.ts");
    productVariantFindManyMock.mockResolvedValueOnce([variantRow({ isActive: false })]);

    await expect(
      orderService.checkout("user-1", {
        items: [{ variantId: "variant-1", quantity: 1 }],
        customerName: "Customer",
        customerEmail: "customer@example.com",
        shippingAddress: { line1: "House 1", city: "Dhaka" },
      }),
    ).rejects.toThrow("is no longer available");
    expect(orderCreateMock).not.toHaveBeenCalled();
  });
});
