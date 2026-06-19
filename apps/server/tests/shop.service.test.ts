import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const cartFindFirstMock = mock(async () => null as any);
const cartCreateMock = mock(async (args: any) => cartRow(args.data));
const cartUpdateMock = mock(async (args: any) => cartRow({ id: args.where.id, ...args.data }));
const cartUpsertMock = mock(async (args: any) => cartRow({ cartToken: args.where.cartToken, ...args.create }));
const cartFindUniqueMock = mock(async () => null as any);
const cartFindUniqueOrThrowMock = mock(async () => cartRow({ items: [cartItemRow()] }));
const cartDeleteMock = mock(async () => cartRow());

const cartItemUpsertMock = mock(async (args: any) => cartItemRow(args.create));
const cartItemFindFirstMock = mock(async () => cartItemRow());
const cartItemUpdateMock = mock(async (args: any) => cartItemRow(args.data));
const cartItemDeleteMock = mock(async () => cartItemRow());
const cartItemDeleteManyMock = mock(async () => ({ count: 1 }));

const productCountMock = mock(async () => 1);
const productFindManyMock = mock(async () => [productRow()]);
const productFindFirstMock = mock(async () => productRow());
const productVariantFindUniqueMock = mock(async () => variantRow());

const orderCreateMock = mock(async () => ({
  id: "order-1",
  orderNumber: "ORD-TEST",
}));
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
    findUnique: productVariantFindUniqueMock,
  },
  cart: {
    findFirst: cartFindFirstMock,
    create: cartCreateMock,
    update: cartUpdateMock,
    upsert: cartUpsertMock,
    findUnique: cartFindUniqueMock,
    findUniqueOrThrow: cartFindUniqueOrThrowMock,
    delete: cartDeleteMock,
  },
  cartItem: {
    upsert: cartItemUpsertMock,
    findFirst: cartItemFindFirstMock,
    update: cartItemUpdateMock,
    delete: cartItemDeleteMock,
    deleteMany: cartItemDeleteManyMock,
  },
  order: {
    create: orderCreateMock,
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
    updatedAt: new Date("2026-06-15T10:00:00.000Z"),
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
    weightValue: overrides.weightValue ?? null,
    weightUnit: overrides.weightUnit ?? null,
    attributeValues: overrides.attributeValues ?? [],
  };
}

function cartItemRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "item-1",
    cartId: overrides.cartId ?? "cart-1",
    variantId: overrides.variantId ?? "variant-1",
    variant: overrides.variant ?? variantRow(),
    quantity: overrides.quantity ?? 2,
    createdAt: new Date("2026-06-15T10:00:00.000Z"),
    updatedAt: new Date("2026-06-15T10:00:00.000Z"),
  };
}

function cartRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "cart-1",
    cartToken: overrides.cartToken ?? "cart-token-123456789012345",
    userId: overrides.userId ?? null,
    expiresAt: overrides.expiresAt ?? new Date("2026-07-15T10:00:00.000Z"),
    createdAt: new Date("2026-06-15T10:00:00.000Z"),
    updatedAt: new Date("2026-06-15T10:00:00.000Z"),
    items: overrides.items ?? [],
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

beforeEach(() => {
  cartFindFirstMock.mockResolvedValue(null);
  cartCreateMock.mockImplementation(async (args: any) => cartRow(args.data));
  cartUpdateMock.mockImplementation(async (args: any) => cartRow({ id: args.where.id, ...args.data }));
  cartUpsertMock.mockImplementation(async (args: any) => cartRow({ cartToken: args.where.cartToken, ...args.create }));
  cartFindUniqueMock.mockResolvedValue(cartRow({ items: [cartItemRow()] }));
  cartFindUniqueOrThrowMock.mockResolvedValue(cartRow({ items: [cartItemRow()] }));
  cartItemFindFirstMock.mockResolvedValue(cartItemRow());
  productVariantFindUniqueMock.mockResolvedValue(variantRow());
  inventoryStockFindManyMock.mockResolvedValue([stockRow()]);
  transactionMock.mockImplementation(async (callback: any) => callback(prismaMock));
});

afterEach(() => {
  for (const fn of [
    cartFindFirstMock,
    cartCreateMock,
    cartUpdateMock,
    cartUpsertMock,
    cartFindUniqueMock,
    cartFindUniqueOrThrowMock,
    cartDeleteMock,
    cartItemUpsertMock,
    cartItemFindFirstMock,
    cartItemUpdateMock,
    cartItemDeleteMock,
    cartItemDeleteManyMock,
    productCountMock,
    productFindManyMock,
    productFindFirstMock,
    productVariantFindUniqueMock,
    orderCreateMock,
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
  it("creates a guest cart and maps server-calculated totals", async () => {
    const { shopService } = await import("../src/modules/shop/shop.service");

    const result = await shopService.getCart({});

    expect(cartUpsertMock).toHaveBeenCalled();
    expect(result.context.shouldSetCookie).toBe(true);
    expect(result.cart.itemCount).toBe(2);
    expect(result.cart.totalAmount).toBe("240.00");
  });

  it("adds sellable variants to the cart", async () => {
    const { shopService } = await import("../src/modules/shop/shop.service");

    await shopService.addCartItem({ cartToken: "cart-token-123456789012345" }, {
      variantId: "variant-1",
      quantity: 1,
    });

    expect(cartItemUpsertMock).toHaveBeenCalledWith({
      where: {
        cartId_variantId: {
          cartId: "cart-1",
          variantId: "variant-1",
        },
      },
      create: {
        cartId: "cart-1",
        variantId: "variant-1",
        quantity: 1,
      },
      update: {
        quantity: { increment: 1 },
      },
    });
  });

  it("creates an order and reserves stock during checkout", async () => {
    const { shopService } = await import("../src/modules/shop/shop.service");

    const result = await shopService.checkout(
      { cartToken: "cart-token-123456789012345", userId: "user-1" },
      {
        customerName: "Customer",
        customerEmail: "customer@example.com",
        customerPhone: null,
        shippingAddress: { city: "Dhaka" },
        billingAddress: null,
        customerNotes: null,
      },
    );

    expect(result.orderId).toBe("order-1");
    expect(orderCreateMock).toHaveBeenCalled();
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
    expect(cartItemDeleteManyMock).toHaveBeenCalledWith({ where: { cartId: "cart-1" } });
  });

  it("fails checkout when stock cannot be reserved", async () => {
    const { shopService } = await import("../src/modules/shop/shop.service");
    inventoryStockFindManyMock.mockResolvedValueOnce([stockRow({ quantityOnHand: 1 })]);

    await expect(
      shopService.checkout(
        { cartToken: "cart-token-123456789012345" },
        {
          customerName: "Customer",
          customerEmail: "customer@example.com",
          shippingAddress: { city: "Dhaka" },
        },
      ),
    ).rejects.toThrow("Not enough stock");

    expect(cartItemDeleteManyMock).not.toHaveBeenCalled();
  });

  it("rejects inactive variants", async () => {
    const { shopService } = await import("../src/modules/shop/shop.service");
    productVariantFindUniqueMock.mockResolvedValueOnce(variantRow({ isActive: false }));

    await expect(
      shopService.addCartItem({}, { variantId: "variant-1", quantity: 1 }),
    ).rejects.toThrow("Product variant is not available");
  });
});
