import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const supplierCountMock = mock(async () => 0);
const supplierFindManyMock = mock(async () => []);
const supplierFindUniqueMock = mock(async () => null as any);
const supplierCreateMock = mock(async (args: any) => supplierRow(args.data));
const supplierUpdateMock = mock(async (args: any) =>
  supplierRow({ id: args.where.id, ...args.data }),
);

const locationCountMock = mock(async () => 0);
const locationFindManyMock = mock(async () => []);
const locationFindUniqueMock = mock(async () => null as any);
const locationCreateMock = mock(async (args: any) => locationRow(args.data));
const locationUpdateMock = mock(async (args: any) =>
  locationRow({ id: args.where.id, ...args.data }),
);

const productVariantFindUniqueMock = mock(async () => variantRow());
const inventoryBatchFindUniqueMock = mock(async () => null as any);
const inventoryBatchCreateMock = mock(async (args: any) =>
  batchRow({ id: "batch-new", ...args.data }),
);
const inventoryBatchFindUniqueAfterMock = mock(async () =>
  batchRow({ id: "batch-new" }),
);
const batchAttributeDeleteManyMock = mock(async () => ({ count: 0 }));
const batchAttributeCreateMock = mock(async () => ({ id: "batch-attr-1" }));
const productAttributeValueFindManyMock = mock(async () => []);

const inventoryStockCountMock = mock(async () => 0);
const inventoryStockFindManyMock = mock(async () => []);
const inventoryStockFindUniqueMock = mock(async () => null as any);
const inventoryStockFindUniqueOrThrowMock = mock(async () => stockRow());
const inventoryStockUpsertMock = mock(async (args: any) =>
  stockRow({ id: "stock-1", ...args.create }),
);
const inventoryStockUpdateMock = mock(async (args: any) =>
  stockRow({ id: "stock-1", stockKey: args.where.stockKey }),
);

const inventoryMovementCountMock = mock(async () => 0);
const inventoryMovementFindManyMock = mock(async () => []);
const inventoryMovementFindUniqueOrThrowMock = mock(async () => movementRow());
const inventoryMovementCreateMock = mock(async (args: any) =>
  movementRow({ id: "movement-1", ...args.data }),
);

const transactionMock = mock(async (callback: any) => callback(prismaMock));

const prismaMock = {
  $transaction: transactionMock,
  supplier: {
    count: supplierCountMock,
    findMany: supplierFindManyMock,
    findUnique: supplierFindUniqueMock,
    create: supplierCreateMock,
    update: supplierUpdateMock,
  },
  inventoryLocation: {
    count: locationCountMock,
    findMany: locationFindManyMock,
    findUnique: locationFindUniqueMock,
    create: locationCreateMock,
    update: locationUpdateMock,
  },
  productVariant: {
    findUnique: productVariantFindUniqueMock,
  },
  inventoryBatch: {
    findUnique: inventoryBatchFindUniqueMock,
    create: inventoryBatchCreateMock,
  },
  inventoryBatchAttributeAssignment: {
    deleteMany: batchAttributeDeleteManyMock,
    create: batchAttributeCreateMock,
  },
  productAttributeValue: {
    findMany: productAttributeValueFindManyMock,
  },
  inventoryStock: {
    count: inventoryStockCountMock,
    findMany: inventoryStockFindManyMock,
    findUnique: inventoryStockFindUniqueMock,
    findUniqueOrThrow: inventoryStockFindUniqueOrThrowMock,
    upsert: inventoryStockUpsertMock,
    update: inventoryStockUpdateMock,
  },
  inventoryMovement: {
    count: inventoryMovementCountMock,
    findMany: inventoryMovementFindManyMock,
    findUniqueOrThrow: inventoryMovementFindUniqueOrThrowMock,
    create: inventoryMovementCreateMock,
  },
};

mock.module("@db/server", () => ({
  default: prismaMock,
}));

function supplierRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "supplier-1",
    name: overrides.name ?? "Supplier",
    contactName: overrides.contactName ?? null,
    email: overrides.email ?? null,
    phone: overrides.phone ?? null,
    address: overrides.address ?? null,
    notes: overrides.notes ?? null,
    isActive: overrides.isActive ?? true,
    _count: overrides._count ?? { batches: 0 },
    createdAt: new Date("2026-06-13T10:00:00.000Z"),
    updatedAt: new Date("2026-06-13T10:00:00.000Z"),
  };
}

function locationRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "loc-main",
    name: overrides.name ?? "Main Warehouse",
    code: overrides.code ?? "main",
    address: overrides.address ?? null,
    isActive: overrides.isActive ?? true,
    _count: overrides._count ?? { stocks: 0 },
    createdAt: new Date("2026-06-13T10:00:00.000Z"),
    updatedAt: new Date("2026-06-13T10:00:00.000Z"),
  };
}

function variantRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "variant-1",
    sku: overrides.sku ?? "MANGO-1KG",
    name: overrides.name ?? "Mango - 1kg",
    product: {
      id: "product-1",
      name: "Mango",
      slug: "mango",
      status: "active",
      category: {
        attributes: overrides.batchAttributes ?? [
          {
            id: "field-harvest",
            attributeId: "attr-harvest",
            scope: "batch",
            required: true,
            attribute: {
              id: "attr-harvest",
              name: "Harvest Season",
              slug: "harvest-season",
              type: "text",
            },
          },
        ],
      },
    },
  };
}

function batchRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "batch-1",
    variantId: overrides.variantId ?? "variant-1",
    supplierId: overrides.supplierId ?? null,
    supplier: overrides.supplier ?? null,
    batchNumber: overrides.batchNumber ?? null,
    expiryDate: overrides.expiryDate ?? null,
    receivedAt: overrides.receivedAt ?? new Date("2026-06-13T10:00:00.000Z"),
    unitCost: overrides.unitCost ?? null,
    notes: overrides.notes ?? null,
    attributeAssignments: overrides.attributeAssignments ?? [],
  };
}

function stockRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "stock-1",
    stockKey: overrides.stockKey ?? "variant-1:loc-main:no_batch",
    variantId: overrides.variantId ?? "variant-1",
    variant:
      overrides.variant ??
      {
        id: "variant-1",
        sku: "MANGO-1KG",
        name: "Mango - 1kg",
        productId: "product-1",
        product: { id: "product-1", name: "Mango", slug: "mango", status: "active" },
      },
    locationId: overrides.locationId ?? "loc-main",
    location: overrides.location ?? locationRow(),
    batchId: overrides.batchId ?? null,
    batch: overrides.batch ?? null,
    quantityOnHand: overrides.quantityOnHand ?? 10,
    quantityReserved: overrides.quantityReserved ?? 2,
    reorderLevel: overrides.reorderLevel ?? 5,
    createdAt: new Date("2026-06-13T10:00:00.000Z"),
    updatedAt: new Date("2026-06-13T10:00:00.000Z"),
  };
}

function movementRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "movement-1",
    variantId: overrides.variantId ?? "variant-1",
    variant: overrides.variant ?? stockRow().variant,
    locationId: overrides.locationId ?? "loc-main",
    location: overrides.location ?? locationRow(),
    batchId: overrides.batchId ?? null,
    batch: overrides.batch ?? null,
    type: overrides.type ?? "purchase",
    delta: overrides.delta ?? 10,
    unitCost: overrides.unitCost ?? null,
    reason: overrides.reason ?? null,
    referenceType: overrides.referenceType ?? null,
    referenceId: overrides.referenceId ?? null,
    actorUserId: overrides.actorUserId ?? null,
    createdAt: new Date("2026-06-13T10:00:00.000Z"),
  };
}

beforeEach(() => {
  supplierFindUniqueMock.mockResolvedValue(supplierRow());
  locationFindUniqueMock.mockResolvedValue(locationRow());
  productVariantFindUniqueMock.mockResolvedValue(variantRow());
  inventoryBatchFindUniqueMock.mockResolvedValue(null);
  inventoryBatchFindUniqueAfterMock.mockResolvedValue(batchRow({ id: "batch-new" }));
  productAttributeValueFindManyMock.mockResolvedValue([]);
  inventoryStockFindUniqueMock.mockResolvedValue(stockRow());
  inventoryStockFindUniqueOrThrowMock.mockResolvedValue(stockRow());
  inventoryMovementFindUniqueOrThrowMock.mockResolvedValue(movementRow());
});

afterEach(() => {
  for (const fn of [
    supplierCountMock,
    supplierFindManyMock,
    supplierFindUniqueMock,
    supplierCreateMock,
    supplierUpdateMock,
    locationCountMock,
    locationFindManyMock,
    locationFindUniqueMock,
    locationCreateMock,
    locationUpdateMock,
    productVariantFindUniqueMock,
    inventoryBatchFindUniqueMock,
    inventoryBatchCreateMock,
    inventoryBatchFindUniqueAfterMock,
    batchAttributeDeleteManyMock,
    batchAttributeCreateMock,
    productAttributeValueFindManyMock,
    inventoryStockCountMock,
    inventoryStockFindManyMock,
    inventoryStockFindUniqueMock,
    inventoryStockFindUniqueOrThrowMock,
    inventoryStockUpsertMock,
    inventoryStockUpdateMock,
    inventoryMovementCountMock,
    inventoryMovementFindManyMock,
    inventoryMovementFindUniqueOrThrowMock,
    inventoryMovementCreateMock,
    transactionMock,
  ]) {
    fn.mockClear();
  }
});

describe("AdminInventoryService", () => {
  it("creates supplier/location and soft-disables them", async () => {
    const { adminInventoryService } = await import(
      "../src/modules/admin/inventory/inventory.service"
    );

    await adminInventoryService.createSupplier({ name: "Fresh Supplier" });
    await adminInventoryService.createLocation({
      name: "Kitchen Store",
      code: "Kitchen Store",
    });
    await adminInventoryService.disableSupplier("supplier-1");
    await adminInventoryService.disableLocation("loc-main");

    expect(supplierCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Fresh Supplier" }),
      }),
    );
    expect(locationCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: "kitchen-store" }),
      }),
    );
    expect(supplierUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
    expect(locationUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
  });

  it("lists stock with available quantity", async () => {
    inventoryStockCountMock.mockResolvedValueOnce(1);
    inventoryStockFindManyMock.mockResolvedValueOnce([
      stockRow({ quantityOnHand: 12, quantityReserved: 3 }),
    ]);
    const { adminInventoryService } = await import(
      "../src/modules/admin/inventory/inventory.service"
    );

    const result = await adminInventoryService.listStocks();

    expect(result.items[0]).toMatchObject({
      quantityOnHand: 12,
      quantityReserved: 3,
      availableQuantity: 9,
    });
  });

  it("receives stock with a new batch and batch attributes", async () => {
    inventoryBatchFindUniqueMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(batchRow({ id: "batch-new" }));
    inventoryStockFindUniqueOrThrowMock.mockResolvedValueOnce(
      stockRow({ batchId: "batch-new", stockKey: "variant-1:loc-main:batch-new" }),
    );
    inventoryMovementFindUniqueOrThrowMock.mockResolvedValueOnce(
      movementRow({ batchId: "batch-new", actorUserId: "admin-1" }),
    );

    const { adminInventoryService } = await import(
      "../src/modules/admin/inventory/inventory.service"
    );

    await adminInventoryService.receiveStock(
      {
        variantId: "variant-1",
        locationId: "loc-main",
        quantity: 10,
        batchNumber: "MANGO-JUNE",
        batchAttributes: [
          {
            attributeId: "attr-harvest",
            rawText: "Summer 2026",
          },
        ],
      },
      { userId: "admin-1" },
    );

    expect(inventoryBatchCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ batchNumber: "MANGO-JUNE" }),
      }),
    );
    expect(batchAttributeCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          batchId: "batch-new",
          attributeId: "attr-harvest",
          rawText: "Summer 2026",
        }),
      }),
    );
    expect(inventoryMovementCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "purchase",
          delta: 10,
          actorUserId: "admin-1",
        }),
      }),
    );
  });

  it("receives no-batch stock using stockKey", async () => {
    productVariantFindUniqueMock.mockResolvedValueOnce(
      variantRow({ batchAttributes: [] }),
    );
    const { adminInventoryService } = await import(
      "../src/modules/admin/inventory/inventory.service"
    );

    await adminInventoryService.receiveStock({
      variantId: "variant-1",
      locationId: "loc-main",
      quantity: 5,
    });

    expect(inventoryStockUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stockKey: "variant-1:loc-main:no_batch" },
        create: expect.objectContaining({
          stockKey: "variant-1:loc-main:no_batch",
          quantityOnHand: 5,
        }),
        update: expect.objectContaining({
          quantityOnHand: { increment: 5 },
        }),
      }),
    );
  });

  it("validates required batch template fields", async () => {
    const { adminInventoryService } = await import(
      "../src/modules/admin/inventory/inventory.service"
    );

    await expect(
      adminInventoryService.receiveStock({
        variantId: "variant-1",
        locationId: "loc-main",
        quantity: 5,
        batchNumber: "MISSING-ATTR",
      }),
    ).rejects.toThrow("Harvest Season is required");
  });

  it("rejects adjustments that would make on-hand lower than reserved", async () => {
    inventoryStockFindUniqueMock.mockResolvedValueOnce(
      stockRow({ quantityOnHand: 5, quantityReserved: 4 }),
    );
    const { adminInventoryService } = await import(
      "../src/modules/admin/inventory/inventory.service"
    );

    await expect(
      adminInventoryService.adjustStock({
        variantId: "variant-1",
        locationId: "loc-main",
        delta: -2,
        reason: "Damaged",
      }),
    ).rejects.toThrow("reserved stock");
  });

  it("adjusts stock and creates a signed movement", async () => {
    inventoryStockFindUniqueMock.mockResolvedValueOnce(
      stockRow({ quantityOnHand: 10, quantityReserved: 2 }),
    );
    inventoryMovementFindUniqueOrThrowMock.mockResolvedValueOnce(
      movementRow({ type: "adjustment", delta: -2, actorUserId: "admin-1" }),
    );
    const { adminInventoryService } = await import(
      "../src/modules/admin/inventory/inventory.service"
    );

    await adminInventoryService.adjustStock(
      {
        variantId: "variant-1",
        locationId: "loc-main",
        delta: -2,
        reason: "Damaged",
      },
      { userId: "admin-1" },
    );

    expect(inventoryStockUpdateMock).toHaveBeenCalledWith({
      where: { stockKey: "variant-1:loc-main:no_batch" },
      data: { quantityOnHand: { increment: -2 } },
    });
    expect(inventoryMovementCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "adjustment",
          delta: -2,
          reason: "Damaged",
          actorUserId: "admin-1",
        }),
      }),
    );
  });
});
