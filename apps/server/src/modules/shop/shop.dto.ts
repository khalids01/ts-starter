import { t } from "elysia";

export const IdParamDto = t.Object({
  id: t.String({ minLength: 1 }),
});

export const SlugParamDto = t.Object({
  slug: t.String({ minLength: 1 }),
});

export const OrderNumberParamDto = t.Object({
  orderNumber: t.String({ minLength: 1 }),
});

export const ListShopProductsQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String()),
  categoryId: t.Optional(t.String()),
  brandId: t.Optional(t.String()),
});

export const AddCartItemDto = t.Object({
  variantId: t.String({ minLength: 1 }),
  quantity: t.Numeric({ minimum: 1 }),
});

export const UpdateCartItemDto = t.Object({
  quantity: t.Numeric({ minimum: 1 }),
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

export const CheckoutDto = t.Object({
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

export type ListShopProductsQuery = typeof ListShopProductsQueryDto.static;
export type AddCartItemInput = typeof AddCartItemDto.static;
export type UpdateCartItemInput = typeof UpdateCartItemDto.static;
export type CheckoutInput = typeof CheckoutDto.static;
export type OrderLookupQuery = typeof OrderLookupQueryDto.static;
