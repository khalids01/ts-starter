import { t } from "elysia";

export const IdParamDto = t.Object({
  id: t.String({ minLength: 1, maxLength: 128 }),
});

export const InventoryMovementTypeDto = t.Union([
  t.Literal("purchase"),
  t.Literal("sale_reserve"),
  t.Literal("sale_commit"),
  t.Literal("reservation_release"),
  t.Literal("return"),
  t.Literal("adjustment"),
  t.Literal("transfer_in"),
  t.Literal("transfer_out"),
]);

export const ListInventoryQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String({ maxLength: 200 })),
  active: t.Optional(t.Boolean()),
});

export const ListStocksQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String({ maxLength: 200 })),
  variantId: t.Optional(t.String({ maxLength: 128 })),
  productId: t.Optional(t.String({ maxLength: 128 })),
  locationId: t.Optional(t.String({ maxLength: 128 })),
  batchId: t.Optional(t.String({ maxLength: 128 })),
  lowStock: t.Optional(t.Boolean()),
  expiringBefore: t.Optional(t.String({ maxLength: 64 })),
});

export const ListMovementsQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  variantId: t.Optional(t.String({ maxLength: 128 })),
  locationId: t.Optional(t.String({ maxLength: 128 })),
  batchId: t.Optional(t.String({ maxLength: 128 })),
  type: t.Optional(InventoryMovementTypeDto),
  from: t.Optional(t.String({ maxLength: 64 })),
  to: t.Optional(t.String({ maxLength: 64 })),
});

export const CreateSupplierDto = t.Object({
  name: t.String({ minLength: 1, maxLength: 120 }),
  contactName: t.Optional(t.Union([t.String({ maxLength: 120 }), t.Null()])),
  email: t.Optional(t.Union([t.String({ format: "email", maxLength: 254 }), t.Null()])),
  phone: t.Optional(t.Union([t.String({ maxLength: 40 }), t.Null()])),
  address: t.Optional(t.Union([t.String({ maxLength: 500 }), t.Null()])),
  notes: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
  isActive: t.Optional(t.Boolean()),
});

export const UpdateSupplierDto = t.Partial(CreateSupplierDto);

export const CreateLocationDto = t.Object({
  name: t.String({ minLength: 1, maxLength: 120 }),
  code: t.String({ minLength: 1, maxLength: 80 }),
  address: t.Optional(t.Union([t.String({ maxLength: 500 }), t.Null()])),
  isActive: t.Optional(t.Boolean()),
});

export const UpdateLocationDto = t.Partial(CreateLocationDto);

export const BatchAttributeAssignmentDto = t.Object({
  attributeId: t.String({ minLength: 1, maxLength: 128 }),
  attributeValueId: t.Optional(t.Union([t.String({ maxLength: 128 }), t.Null()])),
  rawText: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
  rawNumber: t.Optional(t.Union([t.String({ maxLength: 64 }), t.Number(), t.Null()])),
  rawBoolean: t.Optional(t.Union([t.Boolean(), t.Null()])),
  rawDate: t.Optional(t.Union([t.String({ maxLength: 64 }), t.Null()])),
  displayValue: t.Optional(t.Union([t.String({ maxLength: 500 }), t.Null()])),
});

export const ReceiveStockDto = t.Object({
  variantId: t.String({ minLength: 1, maxLength: 128 }),
  locationId: t.String({ minLength: 1, maxLength: 128 }),
  quantity: t.Numeric({ minimum: 1 }),
  supplierId: t.Optional(t.Union([t.String({ maxLength: 128 }), t.Null()])),
  batchId: t.Optional(t.Union([t.String({ maxLength: 128 }), t.Null()])),
  batchNumber: t.Optional(t.Union([t.String({ maxLength: 120 }), t.Null()])),
  expiryDate: t.Optional(t.Union([t.String({ maxLength: 64 }), t.Null()])),
  receivedAt: t.Optional(t.Union([t.String({ maxLength: 64 }), t.Null()])),
  unitCost: t.Optional(t.Union([t.String({ maxLength: 32 }), t.Number(), t.Null()])),
  notes: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
  batchAttributes: t.Optional(t.Array(BatchAttributeAssignmentDto, { maxItems: 100 })),
  reorderLevel: t.Optional(t.Union([t.Numeric({ minimum: 0 }), t.Null()])),
});

export const AdjustStockDto = t.Object({
  variantId: t.String({ minLength: 1, maxLength: 128 }),
  locationId: t.String({ minLength: 1, maxLength: 128 }),
  batchId: t.Optional(t.Union([t.String({ maxLength: 128 }), t.Null()])),
  delta: t.Number(),
  reason: t.String({ minLength: 1, maxLength: 500 }),
  unitCost: t.Optional(t.Union([t.String({ maxLength: 32 }), t.Number(), t.Null()])),
});

export type ListInventoryQuery = typeof ListInventoryQueryDto.static;
export type ListStocksQuery = typeof ListStocksQueryDto.static;
export type ListMovementsQuery = typeof ListMovementsQueryDto.static;
export type CreateSupplierInput = typeof CreateSupplierDto.static;
export type UpdateSupplierInput = typeof UpdateSupplierDto.static;
export type CreateLocationInput = typeof CreateLocationDto.static;
export type UpdateLocationInput = typeof UpdateLocationDto.static;
export type BatchAttributeAssignmentInput =
  typeof BatchAttributeAssignmentDto.static;
export type ReceiveStockInput = typeof ReceiveStockDto.static;
export type AdjustStockInput = typeof AdjustStockDto.static;
