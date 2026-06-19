import { t } from "elysia";

export const IdParamDto = t.Object({
  id: t.String({ minLength: 1 }),
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
  fullName: t.String({ minLength: 1 }),
  email: t.Optional(t.Union([t.String(), t.Null()])),
  phone: t.Optional(t.Union([t.String(), t.Null()])),
  line1: t.String({ minLength: 1 }),
  line2: t.Optional(t.Union([t.String(), t.Null()])),
  city: t.Optional(t.Union([t.String(), t.Null()])),
  state: t.Optional(t.Union([t.String(), t.Null()])),
  postalCode: t.Optional(t.Union([t.String(), t.Null()])),
  country: t.Optional(t.Union([t.String(), t.Null()])),
  notes: t.Optional(t.Union([t.String(), t.Null()])),
});

export const ListOrdersQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String()),
  orderStatus: t.Optional(OrderStatusDto),
  paymentStatus: t.Optional(PaymentStatusDto),
  deliveryStatus: t.Optional(DeliveryStatusDto),
  inventoryStatus: t.Optional(OrderInventoryStatusDto),
  paymentMethod: t.Optional(PaymentMethodDto),
  shippingRateId: t.Optional(t.String()),
  userId: t.Optional(t.String()),
  customer: t.Optional(t.String()),
  placedFrom: t.Optional(t.String()),
  placedTo: t.Optional(t.String()),
});

export const UpdateOrderStatusesDto = t.Object({
  orderStatus: t.Optional(OrderStatusDto),
  paymentStatus: t.Optional(PaymentStatusDto),
  deliveryStatus: t.Optional(DeliveryStatusDto),
  note: t.Optional(t.Union([t.String(), t.Null()])),
});

export const UpdateOrderDto = t.Object({
  customerName: t.Optional(t.String({ minLength: 1 })),
  customerEmail: t.Optional(t.String()),
  customerPhone: t.Optional(t.Union([t.String(), t.Null()])),
  customerNotes: t.Optional(t.Union([t.String(), t.Null()])),
  adminNotes: t.Optional(t.Union([t.String(), t.Null()])),
  addresses: t.Optional(t.Array(OrderAddressInputDto)),
});

export type ListOrdersQuery = typeof ListOrdersQueryDto.static;
export type UpdateOrderStatusesInput = typeof UpdateOrderStatusesDto.static;
export type UpdateOrderInput = typeof UpdateOrderDto.static;
