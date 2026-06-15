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

export const ListOrdersQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String()),
  orderStatus: t.Optional(OrderStatusDto),
  paymentStatus: t.Optional(PaymentStatusDto),
  deliveryStatus: t.Optional(DeliveryStatusDto),
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

export type ListOrdersQuery = typeof ListOrdersQueryDto.static;
export type UpdateOrderStatusesInput = typeof UpdateOrderStatusesDto.static;
