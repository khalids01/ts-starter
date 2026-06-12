import prisma, { type Prisma } from "@db/server";
import type {
  AdjustStockInput,
  BatchAttributeAssignmentInput,
  CreateLocationInput,
  CreateSupplierInput,
  ListInventoryQuery,
  ListMovementsQuery,
  ListStocksQuery,
  ReceiveStockInput,
  UpdateLocationInput,
  UpdateSupplierInput,
} from "./inventory.dto";

export class AdminInventoryServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

type InventoryActor = {
  userId?: string;
};

function normalizeCode(input: string) {
  const code = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!code) {
    throw new AdminInventoryServiceError("Location code cannot be empty");
  }
  return code;
}

function stockKey(variantId: string, locationId: string, batchId?: string | null) {
  return `${variantId}:${locationId}:${batchId ?? "no_batch"}`;
}

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

function toDecimalString(value: string | number | null | undefined, field: string) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new AdminInventoryServiceError(`${field} must be a valid number`);
  }
  if (parsed < 0) {
    throw new AdminInventoryServiceError(`${field} cannot be negative`);
  }
  return String(value);
}

function parseDate(value: string | null | undefined, field: string) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AdminInventoryServiceError(`${field} must be a valid date`);
  }
  return date;
}

function mapSupplier(row: any) {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contactName,
    email: row.email,
    phone: row.phone,
    address: row.address,
    notes: row.notes,
    isActive: row.isActive,
    batchCount: row._count?.batches,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapLocation(row: any) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    address: row.address,
    isActive: row.isActive,
    stockCount: row._count?.stocks,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapBatchAttribute(row: any) {
  return {
    id: row.id,
    batchId: row.batchId,
    attributeId: row.attributeId,
    attribute: row.attribute ?? null,
    attributeValueId: row.attributeValueId,
    attributeValue: row.attributeValue ?? null,
    rawText: row.rawText,
    rawNumber: decimalToString(row.rawNumber),
    rawBoolean: row.rawBoolean,
    rawDate: toIso(row.rawDate),
    displayValue: row.displayValue,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapBatch(row: any) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    variantId: row.variantId,
    supplierId: row.supplierId,
    supplier: row.supplier ? mapSupplier(row.supplier) : null,
    batchNumber: row.batchNumber,
    expiryDate: toIso(row.expiryDate),
    receivedAt: toIso(row.receivedAt),
    unitCost: decimalToString(row.unitCost),
    notes: row.notes,
    attributeAssignments: (row.attributeAssignments ?? []).map(mapBatchAttribute),
  };
}

function mapStock(row: any) {
  return {
    id: row.id,
    stockKey: row.stockKey,
    variantId: row.variantId,
    variant: row.variant
      ? {
          id: row.variant.id,
          sku: row.variant.sku,
          name: row.variant.name,
          productId: row.variant.productId,
          product: row.variant.product ?? null,
        }
      : null,
    locationId: row.locationId,
    location: row.location ? mapLocation(row.location) : null,
    batchId: row.batchId,
    batch: mapBatch(row.batch),
    quantityOnHand: row.quantityOnHand,
    quantityReserved: row.quantityReserved,
    availableQuantity: row.quantityOnHand - row.quantityReserved,
    reorderLevel: row.reorderLevel,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapMovement(row: any) {
  return {
    id: row.id,
    variantId: row.variantId,
    variant: row.variant
      ? {
          id: row.variant.id,
          sku: row.variant.sku,
          name: row.variant.name,
          productId: row.variant.productId,
          product: row.variant.product ?? null,
        }
      : null,
    locationId: row.locationId,
    location: row.location ? mapLocation(row.location) : null,
    batchId: row.batchId,
    batch: mapBatch(row.batch),
    type: row.type,
    delta: row.delta,
    unitCost: decimalToString(row.unitCost),
    reason: row.reason,
    referenceType: row.referenceType,
    referenceId: row.referenceId,
    actorUserId: row.actorUserId,
    createdAt: toIso(row.createdAt),
  };
}

function stockInclude() {
  return {
    variant: {
      select: {
        id: true,
        sku: true,
        name: true,
        productId: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
    },
    location: {
      include: {
        _count: { select: { stocks: true } },
      },
    },
    batch: {
      include: {
        supplier: {
          include: { _count: { select: { batches: true } } },
        },
        attributeAssignments: {
          include: {
            attribute: { select: { id: true, name: true, slug: true, type: true } },
            attributeValue: {
              select: { id: true, value: true, label: true, attributeId: true },
            },
          },
        },
      },
    },
  } satisfies Prisma.InventoryStockInclude;
}

function movementInclude() {
  return {
    variant: {
      select: {
        id: true,
        sku: true,
        name: true,
        productId: true,
        product: { select: { id: true, name: true, slug: true, status: true } },
      },
    },
    location: {
      include: { _count: { select: { stocks: true } } },
    },
    batch: {
      include: {
        supplier: { include: { _count: { select: { batches: true } } } },
        attributeAssignments: true,
      },
    },
  } satisfies Prisma.InventoryMovementInclude;
}

function hasBatchInput(input: ReceiveStockInput) {
  return Boolean(
    input.batchId ||
      input.batchNumber ||
      input.expiryDate ||
      input.receivedAt ||
      input.unitCost !== undefined ||
      input.notes ||
      (input.batchAttributes?.length ?? 0) > 0,
  );
}

function assignmentHasValue(assignment: BatchAttributeAssignmentInput) {
  return Boolean(
    assignment.attributeValueId ||
      assignment.rawText ||
      assignment.rawNumber !== undefined ||
      assignment.rawBoolean !== undefined ||
      assignment.rawDate ||
      assignment.displayValue,
  );
}

export class AdminInventoryService {
  async listSuppliers(query: ListInventoryQuery = {}) {
    const { requestedPage, limit } = normalizePagination(query.page, query.limit);
    const where: Prisma.SupplierWhereInput = {};

    if (query.active !== undefined) {
      where.isActive = query.active;
    }
    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.supplier.count({ where });
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const rows = await prisma.supplier.findMany({
      where,
      include: { _count: { select: { batches: true } } },
      orderBy: [{ name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginationResult({
      items: rows.map(mapSupplier),
      total,
      requestedPage,
      limit,
    });
  }

  async getSupplier(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { _count: { select: { batches: true } } },
    });
    if (!supplier) {
      throw new AdminInventoryServiceError("Supplier not found", 404);
    }
    return mapSupplier(supplier);
  }

  async createSupplier(input: CreateSupplierInput) {
    const supplier = await prisma.supplier.create({
      data: {
        name: input.name.trim(),
        contactName: input.contactName ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        address: input.address ?? null,
        notes: input.notes ?? null,
        isActive: input.isActive ?? true,
      },
      include: { _count: { select: { batches: true } } },
    });
    return mapSupplier(supplier);
  }

  async updateSupplier(id: string, input: UpdateSupplierInput) {
    await this.assertSupplierExists(id);
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.contactName !== undefined ? { contactName: input.contactName } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
      include: { _count: { select: { batches: true } } },
    });
    return mapSupplier(supplier);
  }

  async disableSupplier(id: string) {
    await this.assertSupplierExists(id);
    const supplier = await prisma.supplier.update({
      where: { id },
      data: { isActive: false },
      include: { _count: { select: { batches: true } } },
    });
    return mapSupplier(supplier);
  }

  async listLocations(query: ListInventoryQuery = {}) {
    const { requestedPage, limit } = normalizePagination(query.page, query.limit);
    const where: Prisma.InventoryLocationWhereInput = {};

    if (query.active !== undefined) {
      where.isActive = query.active;
    }
    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.inventoryLocation.count({ where });
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const rows = await prisma.inventoryLocation.findMany({
      where,
      include: { _count: { select: { stocks: true } } },
      orderBy: [{ code: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginationResult({
      items: rows.map(mapLocation),
      total,
      requestedPage,
      limit,
    });
  }

  async getLocation(id: string) {
    const location = await prisma.inventoryLocation.findUnique({
      where: { id },
      include: { _count: { select: { stocks: true } } },
    });
    if (!location) {
      throw new AdminInventoryServiceError("Inventory location not found", 404);
    }
    return mapLocation(location);
  }

  async createLocation(input: CreateLocationInput) {
    const location = await prisma.inventoryLocation.create({
      data: {
        name: input.name.trim(),
        code: normalizeCode(input.code),
        address: input.address ?? null,
        isActive: input.isActive ?? true,
      },
      include: { _count: { select: { stocks: true } } },
    });
    return mapLocation(location);
  }

  async updateLocation(id: string, input: UpdateLocationInput) {
    await this.assertLocationExists(id);
    const location = await prisma.inventoryLocation.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.code !== undefined ? { code: normalizeCode(input.code) } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
      include: { _count: { select: { stocks: true } } },
    });
    return mapLocation(location);
  }

  async disableLocation(id: string) {
    await this.assertLocationExists(id);
    const location = await prisma.inventoryLocation.update({
      where: { id },
      data: { isActive: false },
      include: { _count: { select: { stocks: true } } },
    });
    return mapLocation(location);
  }

  async listStocks(query: ListStocksQuery = {}) {
    const { requestedPage, limit } = normalizePagination(query.page, query.limit);
    const where: Prisma.InventoryStockWhereInput = {};

    if (query.variantId) {
      where.variantId = query.variantId;
    }
    if (query.locationId) {
      where.locationId = query.locationId;
    }
    if (query.batchId) {
      where.batchId = query.batchId;
    }
    if (query.productId) {
      where.variant = { productId: query.productId };
    }
    if (query.expiringBefore) {
      const expiringBefore = parseDate(query.expiringBefore, "Expiring before");
      if (expiringBefore) {
        (where as any).batch = {
          ...(typeof (where as any).batch === "object" ? (where as any).batch : {}),
          expiryDate: { lte: expiringBefore },
        };
      }
    }
    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { variant: { sku: { contains: search, mode: "insensitive" } } },
        { variant: { name: { contains: search, mode: "insensitive" } } },
        {
          variant: {
            product: { name: { contains: search, mode: "insensitive" } },
          },
        },
        { batch: { batchNumber: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (query.lowStock) {
      const rows = await prisma.inventoryStock.findMany({
        where,
        include: stockInclude(),
        orderBy: [{ updatedAt: "desc" }],
      });
      const filtered = rows
        .map(mapStock)
        .filter(
          (stock) =>
            stock.reorderLevel !== null &&
            stock.reorderLevel !== undefined &&
            stock.availableQuantity <= stock.reorderLevel,
        );
      const page = Math.min(
        requestedPage,
        Math.max(1, Math.ceil(filtered.length / limit)),
      );
      return paginationResult({
        items: filtered.slice((page - 1) * limit, page * limit),
        total: filtered.length,
        requestedPage,
        limit,
      });
    }

    const total = await prisma.inventoryStock.count({ where });
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const rows = await prisma.inventoryStock.findMany({
      where,
      include: stockInclude(),
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginationResult({
      items: rows.map(mapStock),
      total,
      requestedPage,
      limit,
    });
  }

  async listMovements(query: ListMovementsQuery = {}) {
    const { requestedPage, limit } = normalizePagination(query.page, query.limit);
    const where: Prisma.InventoryMovementWhereInput = {};

    if (query.variantId) {
      where.variantId = query.variantId;
    }
    if (query.locationId) {
      where.locationId = query.locationId;
    }
    if (query.batchId) {
      where.batchId = query.batchId;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.from || query.to) {
      const from = query.from ? parseDate(query.from, "From date") : undefined;
      const to = query.to ? parseDate(query.to, "To date") : undefined;
      where.createdAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    const total = await prisma.inventoryMovement.count({ where });
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const rows = await prisma.inventoryMovement.findMany({
      where,
      include: movementInclude(),
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginationResult({
      items: rows.map(mapMovement),
      total,
      requestedPage,
      limit,
    });
  }

  async receiveStock(input: ReceiveStockInput, actor: InventoryActor = {}) {
    const quantity = Math.trunc(input.quantity);
    if (quantity <= 0) {
      throw new AdminInventoryServiceError("Quantity must be greater than 0");
    }

    const variant = await this.getReceiveVariant(input.variantId);
    const location = await this.getActiveLocation(input.locationId);
    const supplier = input.supplierId
      ? await this.getActiveSupplier(input.supplierId)
      : null;
    const batchFields = this.getBatchTemplateFields(variant);
    const requiredBatchFields = batchFields.filter((field: any) => field.required);
    const batchAttributes = input.batchAttributes ?? [];
    const shouldUseBatch = hasBatchInput(input) || requiredBatchFields.length > 0;

    let existingBatch: any = null;
    if (input.batchId) {
      existingBatch = await prisma.inventoryBatch.findUnique({
        where: { id: input.batchId },
        include: { attributeAssignments: true },
      });
      if (!existingBatch) {
        throw new AdminInventoryServiceError("Inventory batch not found", 404);
      }
      if (existingBatch.variantId !== input.variantId) {
        throw new AdminInventoryServiceError("Batch does not belong to variant");
      }
    }

    if (requiredBatchFields.length > 0 && !shouldUseBatch && !existingBatch) {
      throw new AdminInventoryServiceError("Batch is required for this category");
    }

    await this.validateBatchAttributes({
      fields: batchFields,
      assignments: batchAttributes,
      existingAssignments: existingBatch?.attributeAssignments ?? [],
      enforceRequired: shouldUseBatch || Boolean(existingBatch),
    });

    const valueIds = batchAttributes
      .map((assignment) => assignment.attributeValueId)
      .filter((id): id is string => Boolean(id));
    const valuesById = await this.getValuesById(valueIds);

    const unitCost = toDecimalString(input.unitCost, "Unit cost");
    const expiryDate = parseDate(input.expiryDate, "Expiry date");
    const receivedAt = parseDate(input.receivedAt, "Received at");

    const result = await prisma.$transaction(async (tx) => {
      const batch =
        existingBatch ??
        (shouldUseBatch
          ? await tx.inventoryBatch.create({
              data: {
                variantId: input.variantId,
                supplierId: supplier?.id ?? null,
                batchNumber: input.batchNumber ?? null,
                expiryDate,
                receivedAt: receivedAt ?? undefined,
                unitCost,
                notes: input.notes ?? null,
              },
            })
          : null);

      if (batch && batchAttributes.length > 0) {
        await tx.inventoryBatchAttributeAssignment.deleteMany({
          where: { batchId: batch.id },
        });
        for (const assignment of batchAttributes) {
          if (assignment.attributeValueId) {
            const value = valuesById.get(assignment.attributeValueId);
            if (!value) {
              throw new AdminInventoryServiceError("Attribute value not found", 404);
            }
            if (value.attributeId !== assignment.attributeId) {
              throw new AdminInventoryServiceError(
                "Attribute value does not belong to the provided attribute",
              );
            }
          }

          await tx.inventoryBatchAttributeAssignment.create({
            data: {
              batchId: batch.id,
              attributeId: assignment.attributeId,
              attributeValueId: assignment.attributeValueId ?? null,
              rawText: assignment.rawText ?? null,
              rawNumber: toDecimalString(
                assignment.rawNumber,
                "Batch attribute number",
              ),
              rawBoolean: assignment.rawBoolean ?? null,
              rawDate: parseDate(assignment.rawDate, "Batch attribute date"),
              displayValue: assignment.displayValue ?? null,
            },
          });
        }
      }

      const key = stockKey(input.variantId, input.locationId, batch?.id ?? null);
      const stock = await tx.inventoryStock.upsert({
        where: { stockKey: key },
        create: {
          stockKey: key,
          variantId: input.variantId,
          locationId: input.locationId,
          batchId: batch?.id ?? null,
          quantityOnHand: quantity,
          quantityReserved: 0,
          reorderLevel: input.reorderLevel ?? null,
        },
        update: {
          quantityOnHand: { increment: quantity },
          ...(input.reorderLevel !== undefined
            ? { reorderLevel: input.reorderLevel }
            : {}),
        },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          variantId: input.variantId,
          locationId: location.id,
          batchId: batch?.id ?? null,
          type: "purchase",
          delta: quantity,
          unitCost,
          reason: "Stock received",
          referenceType: "inventory_receive",
          referenceId: batch?.id ?? stock.id,
          actorUserId: actor.userId,
        },
      });

      return { stock, batch, movement };
    });

    return {
      stock: mapStock(
        await prisma.inventoryStock.findUniqueOrThrow({
          where: { id: result.stock.id },
          include: stockInclude(),
        }),
      ),
      batch: result.batch
        ? mapBatch(
            await prisma.inventoryBatch.findUnique({
              where: { id: result.batch.id },
              include: {
                supplier: { include: { _count: { select: { batches: true } } } },
                attributeAssignments: {
                  include: {
                    attribute: {
                      select: { id: true, name: true, slug: true, type: true },
                    },
                    attributeValue: {
                      select: {
                        id: true,
                        value: true,
                        label: true,
                        attributeId: true,
                      },
                    },
                  },
                },
              },
            }),
          )
        : null,
      movement: mapMovement(
        await prisma.inventoryMovement.findUniqueOrThrow({
          where: { id: result.movement.id },
          include: movementInclude(),
        }),
      ),
    };
  }

  async adjustStock(input: AdjustStockInput, actor: InventoryActor = {}) {
    const delta = Math.trunc(input.delta);
    if (delta === 0) {
      throw new AdminInventoryServiceError("Adjustment delta cannot be 0");
    }

    await this.getReceiveVariant(input.variantId);
    await this.getActiveLocation(input.locationId);

    const key = stockKey(input.variantId, input.locationId, input.batchId ?? null);
    const existing = await prisma.inventoryStock.findUnique({
      where: { stockKey: key },
    });
    if (!existing) {
      throw new AdminInventoryServiceError("Inventory stock row not found", 404);
    }
    if (existing.quantityOnHand + delta < existing.quantityReserved) {
      throw new AdminInventoryServiceError(
        "Adjustment would make on-hand stock lower than reserved stock",
      );
    }

    const unitCost = toDecimalString(input.unitCost, "Unit cost");
    const result = await prisma.$transaction(async (tx) => {
      const stock = await tx.inventoryStock.update({
        where: { stockKey: key },
        data: { quantityOnHand: { increment: delta } },
      });
      const movement = await tx.inventoryMovement.create({
        data: {
          variantId: input.variantId,
          locationId: input.locationId,
          batchId: input.batchId ?? null,
          type: "adjustment",
          delta,
          unitCost,
          reason: input.reason,
          referenceType: "inventory_adjustment",
          referenceId: stock.id,
          actorUserId: actor.userId,
        },
      });
      return { stock, movement };
    });

    return {
      stock: mapStock(
        await prisma.inventoryStock.findUniqueOrThrow({
          where: { id: result.stock.id },
          include: stockInclude(),
        }),
      ),
      movement: mapMovement(
        await prisma.inventoryMovement.findUniqueOrThrow({
          where: { id: result.movement.id },
          include: movementInclude(),
        }),
      ),
    };
  }

  private async assertSupplierExists(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!supplier) {
      throw new AdminInventoryServiceError("Supplier not found", 404);
    }
  }

  private async assertLocationExists(id: string) {
    const location = await prisma.inventoryLocation.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!location) {
      throw new AdminInventoryServiceError("Inventory location not found", 404);
    }
  }

  private async getActiveLocation(id: string) {
    const location = await prisma.inventoryLocation.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });
    if (!location) {
      throw new AdminInventoryServiceError("Inventory location not found", 404);
    }
    if (!location.isActive) {
      throw new AdminInventoryServiceError("Inventory location is inactive");
    }
    return location;
  }

  private async getActiveSupplier(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });
    if (!supplier) {
      throw new AdminInventoryServiceError("Supplier not found", 404);
    }
    if (!supplier.isActive) {
      throw new AdminInventoryServiceError("Supplier is inactive");
    }
    return supplier;
  }

  private async getReceiveVariant(id: string) {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: {
              include: {
                attributes: {
                  where: { scope: "batch" },
                  include: {
                    attribute: {
                      select: { id: true, name: true, slug: true, type: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!variant) {
      throw new AdminInventoryServiceError("Product variant not found", 404);
    }
    if (variant.product.status === "archived") {
      throw new AdminInventoryServiceError(
        "Inventory cannot be received for archived products",
      );
    }
    return variant;
  }

  private getBatchTemplateFields(variant: any) {
    return variant.product.category.attributes ?? [];
  }

  private async validateBatchAttributes({
    fields,
    assignments,
    existingAssignments,
    enforceRequired,
  }: {
    fields: any[];
    assignments: BatchAttributeAssignmentInput[];
    existingAssignments: Array<{ attributeId: string }>;
    enforceRequired: boolean;
  }) {
    const fieldsByAttribute = new Map(fields.map((field) => [field.attributeId, field]));
    const seen = new Set<string>();

    for (const assignment of assignments) {
      if (seen.has(assignment.attributeId)) {
        throw new AdminInventoryServiceError(
          `Duplicate batch attribute: ${assignment.attributeId}`,
        );
      }
      seen.add(assignment.attributeId);
      if (!fieldsByAttribute.has(assignment.attributeId)) {
        throw new AdminInventoryServiceError(
          "Batch attribute is not allowed for this category",
        );
      }
    }

    if (!enforceRequired) {
      return;
    }

    const existingAttributeIds = new Set(
      existingAssignments.map((assignment) => assignment.attributeId),
    );
    for (const field of fields.filter((entry) => entry.required)) {
      const assignment = assignments.find(
        (item) => item.attributeId === field.attributeId,
      );
      if (!assignment && existingAttributeIds.has(field.attributeId)) {
        continue;
      }
      if (!assignment || !assignmentHasValue(assignment)) {
        throw new AdminInventoryServiceError(
          `${field.attribute?.name ?? "Batch attribute"} is required`,
        );
      }
    }
  }

  private async getValuesById(valueIds: string[]) {
    if (valueIds.length === 0) {
      return new Map<string, any>();
    }

    const values = await prisma.productAttributeValue.findMany({
      where: { id: { in: valueIds } },
      include: {
        attribute: {
          select: { id: true, name: true, slug: true, type: true },
        },
      },
    });

    return new Map(values.map((value) => [value.id, value]));
  }
}

export const adminInventoryService = new AdminInventoryService();
