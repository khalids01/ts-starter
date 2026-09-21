import { t } from "elysia";

export const IdParamDto = t.Object({
  id: t.String({ minLength: 1, maxLength: 128 }),
});

export const OrderStatusDto = t.Union([
  t.Literal("pending"),
  t.Literal("confirmed"),
  t.Literal("processing"),
  t.Literal("completed"),
  t.Literal("cancelled"),
]);

export const PaymentStatusDto = t.Union([
  t.Literal("unpaid"),
  t.Literal("authorized"),
  t.Literal("paid"),
  t.Literal("partially_refunded"),
  t.Literal("refunded"),
  t.Literal("failed"),
]);

export const DeliveryStatusDto = t.Union([
  t.Literal("unfulfilled"),
  t.Literal("preparing"),
  t.Literal("ready_to_ship"),
  t.Literal("shipped"),
  t.Literal("out_for_delivery"),
  t.Literal("delivered"),
  t.Literal("returned"),
  t.Literal("failed"),
]);

export const OrderInventoryStatusDto = t.Union([
  t.Literal("reserved"),
  t.Literal("committed"),
  t.Literal("released"),
  t.Literal("restocked"),
]);

export const PaymentMethodDto = t.Union([
  t.Literal("cash_on_delivery"),
  t.Literal("manual_bank"),
  t.Literal("manual_mobile"),
  t.Literal("online_gateway"),
]);

export const OrderAddressTypeDto = t.Union([
  t.Literal("shipping"),
  t.Literal("billing"),
]);

export const OrderAddressInputDto = t.Object({
  type: OrderAddressTypeDto,
  fullName: t.String({ minLength: 1, maxLength: 120 }),
  email: t.Optional(t.Union([t.String({ format: "email", maxLength: 254 }), t.Null()])),
  phone: t.Optional(t.Union([t.String({ maxLength: 40 }), t.Null()])),
  line1: t.String({ minLength: 1, maxLength: 200 }),
  line2: t.Optional(t.Union([t.String({ maxLength: 200 }), t.Null()])),
  city: t.Optional(t.Union([t.String({ maxLength: 100 }), t.Null()])),
  state: t.Optional(t.Union([t.String({ maxLength: 100 }), t.Null()])),
  postalCode: t.Optional(t.Union([t.String({ maxLength: 32 }), t.Null()])),
  country: t.Optional(t.Union([t.String({ maxLength: 100 }), t.Null()])),
  notes: t.Optional(t.Union([t.String({ maxLength: 1000 }), t.Null()])),
});

export const ListOrdersQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String({ maxLength: 200 })),
  orderStatus: t.Optional(OrderStatusDto),
  paymentStatus: t.Optional(PaymentStatusDto),
  deliveryStatus: t.Optional(DeliveryStatusDto),
  inventoryStatus: t.Optional(OrderInventoryStatusDto),
  paymentMethod: t.Optional(PaymentMethodDto),
  shippingRateId: t.Optional(t.String({ maxLength: 128 })),
  userId: t.Optional(t.String({ maxLength: 128 })),
  customer: t.Optional(t.String({ maxLength: 254 })),
  placedFrom: t.Optional(t.String({ maxLength: 64 })),
  placedTo: t.Optional(t.String({ maxLength: 64 })),
});

export const UpdateOrderStatusesDto = t.Object({
  orderStatus: t.Optional(OrderStatusDto),
  paymentStatus: t.Optional(PaymentStatusDto),
  deliveryStatus: t.Optional(DeliveryStatusDto),
  note: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
});

export const UpdateOrderDto = t.Object({
  customerName: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
  customerEmail: t.Optional(t.String({ format: "email", maxLength: 254 })),
  customerPhone: t.Optional(t.Union([t.String({ maxLength: 40 }), t.Null()])),
  customerNotes: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
  adminNotes: t.Optional(t.Union([t.String({ maxLength: 5000 }), t.Null()])),
  addresses: t.Optional(t.Array(OrderAddressInputDto, { maxItems: 10 })),
});

export const MarkOrderShippedDto = t.Object({
  carrier: t.String({ minLength: 1, maxLength: 120 }),
  trackingNumber: t.String({ minLength: 1, maxLength: 200 }),
  note: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
});

export const UpdateOrderTrackingDto = t.Object({
  carrier: t.Optional(t.String({ minLength: 1, maxLength: 120 })),
  trackingNumber: t.Optional(t.String({ minLength: 1, maxLength: 200 })),
  note: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
});

export const MarkOrderDeliveredDto = t.Object({
  note: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
});

export const CancelOrderDto = t.Object({
  reason: t.String({ minLength: 1, maxLength: 200 }),
  note: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
});

export const RecordOrderRefundDto = t.Object({
  amount: t.String({ minLength: 1, maxLength: 32 }),
  reason: t.String({ minLength: 1, maxLength: 200 }),
  note: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
  restockInventory: t.Optional(t.Boolean({ default: false })),
});

export type ListOrdersQuery = typeof ListOrdersQueryDto.static;
export type UpdateOrderStatusesInput = typeof UpdateOrderStatusesDto.static;
export type UpdateOrderInput = typeof UpdateOrderDto.static;
export type MarkOrderShippedInput = typeof MarkOrderShippedDto.static;
export type UpdateOrderTrackingInput = typeof UpdateOrderTrackingDto.static;
export type MarkOrderDeliveredInput = typeof MarkOrderDeliveredDto.static;
export type CancelOrderInput = typeof CancelOrderDto.static;
export type RecordOrderRefundInput = typeof RecordOrderRefundDto.static;
