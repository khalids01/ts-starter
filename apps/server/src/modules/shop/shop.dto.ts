import { t } from "elysia";

export const IdParamDto = t.Object({
  id: t.String({ minLength: 1 }),
});

export const SlugParamDto = t.Object({
  slug: t.String({ minLength: 1 }),
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

const AddressValueDto = t.Union([
  t.String(),
  t.Number(),
  t.Boolean(),
  t.Null(),
]);

export const CheckoutAddressDto = t.Record(t.String(), AddressValueDto);

export const CheckoutDto = t.Object({
  customerName: t.String({ minLength: 1 }),
  customerEmail: t.String({ minLength: 1 }),
  customerPhone: t.Optional(t.Union([t.String(), t.Null()])),
  shippingAddress: CheckoutAddressDto,
  billingAddress: t.Optional(t.Union([CheckoutAddressDto, t.Null()])),
  customerNotes: t.Optional(t.Union([t.String(), t.Null()])),
});

export type ListShopProductsQuery = typeof ListShopProductsQueryDto.static;
export type AddCartItemInput = typeof AddCartItemDto.static;
export type UpdateCartItemInput = typeof UpdateCartItemDto.static;
export type CheckoutInput = typeof CheckoutDto.static;
