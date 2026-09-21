import { t } from "elysia";

export const OrderNumberParamDto = t.Object({
  orderNumber: t.String({ minLength: 1, maxLength: 64 }),
});

export const CheckoutAddressDto = t.Object({
  fullName: t.Optional(t.String({ maxLength: 120 })),
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

export const PaymentMethodDto = t.Union([
  t.Literal("cash_on_delivery"),
  t.Literal("manual_bank"),
  t.Literal("manual_mobile"),
  t.Literal("online_gateway"),
]);

export const OrderLookupQueryDto = t.Object({
  email: t.Optional(t.String({ format: "email", maxLength: 254 })),
  phone: t.Optional(t.String({ maxLength: 40 })),
});

export const CheckoutItemDto = t.Object({
  variantId: t.String({ minLength: 1, maxLength: 128 }),
  quantity: t.Integer({ minimum: 1, maximum: 10_000 }),
});

export const CheckoutDto = t.Object({
  items: t.Array(CheckoutItemDto, { minItems: 1, maxItems: 100 }),
  customerName: t.String({ minLength: 1, maxLength: 120 }),
  customerEmail: t.String({ format: "email", maxLength: 254 }),
  customerPhone: t.Optional(t.Union([t.String({ maxLength: 40 }), t.Null()])),
  shippingAddress: CheckoutAddressDto,
  billingAddress: t.Optional(t.Union([CheckoutAddressDto, t.Null()])),
  shippingRateId: t.Optional(t.String({ maxLength: 128 })),
  shippingRateCode: t.Optional(t.String({ maxLength: 80 })),
  paymentMethod: t.Optional(PaymentMethodDto),
  idempotencyKey: t.Optional(t.String({ minLength: 8, maxLength: 128 })),
  customerNotes: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
  discountCode: t.Optional(t.Union([t.String({ maxLength: 80 }), t.Null()])),
});

export type CheckoutInput = typeof CheckoutDto.static;
export type OrderLookupQuery = typeof OrderLookupQueryDto.static;
