import { t } from "elysia";

export const OrderNumberParamDto = t.Object({
  orderNumber: t.String({ minLength: 1 }),
});

export const CheckoutAddressDto = t.Object({
  fullName: t.Optional(t.String()),
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

export const PaymentMethodDto = t.Union([
  t.Literal("cash_on_delivery"),
  t.Literal("manual_bank"),
  t.Literal("manual_mobile"),
  t.Literal("online_gateway"),
]);

export const OrderLookupQueryDto = t.Object({
  email: t.Optional(t.String()),
  phone: t.Optional(t.String()),
});

export const CheckoutItemDto = t.Object({
  variantId: t.String({ minLength: 1 }),
  quantity: t.Integer({ minimum: 1 }),
});

export const CheckoutDto = t.Object({
  items: t.Array(CheckoutItemDto, { minItems: 1 }),
  customerName: t.String({ minLength: 1 }),
  customerEmail: t.String({ minLength: 1 }),
  customerPhone: t.Optional(t.Union([t.String(), t.Null()])),
  shippingAddress: CheckoutAddressDto,
  billingAddress: t.Optional(t.Union([CheckoutAddressDto, t.Null()])),
  shippingRateId: t.Optional(t.String()),
  shippingRateCode: t.Optional(t.String()),
  paymentMethod: t.Optional(PaymentMethodDto),
  idempotencyKey: t.Optional(t.String()),
  customerNotes: t.Optional(t.Union([t.String(), t.Null()])),
});

export type CheckoutInput = typeof CheckoutDto.static;
export type OrderLookupQuery = typeof OrderLookupQueryDto.static;
