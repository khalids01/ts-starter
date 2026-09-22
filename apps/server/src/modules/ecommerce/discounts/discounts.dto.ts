import { t } from "elysia";

export const DiscountIdParamDto = t.Object({ id: t.String({ minLength: 1, maxLength: 128 }) });
export const DiscountTypeDto = t.Union([
  t.Literal("percentage"),
  t.Literal("fixed_amount"),
]);

export const ListDiscountsQueryDto = t.Object({
  active: t.Optional(t.Boolean()),
  search: t.Optional(t.String({ maxLength: 200 })),
});

export const CreateDiscountDto = t.Object({
  code: t.String({ minLength: 1, maxLength: 80 }),
  description: t.Optional(t.Union([t.String({ maxLength: 500 }), t.Null()])),
  type: DiscountTypeDto,
  value: t.Union([t.String({ maxLength: 32 }), t.Number()]),
  currency: t.Optional(t.Union([t.String({ minLength: 3, maxLength: 3 }), t.Null()])),
  isActive: t.Optional(t.Boolean()),
  startsAt: t.Optional(t.Union([t.String({ maxLength: 64 }), t.Null()])),
  endsAt: t.Optional(t.Union([t.String({ maxLength: 64 }), t.Null()])),
  minimumOrderAmount: t.Optional(t.Union([t.String({ maxLength: 32 }), t.Number(), t.Null()])),
  totalUsageLimit: t.Optional(t.Union([t.Integer({ minimum: 1 }), t.Null()])),
  perCustomerUsageLimit: t.Optional(t.Union([t.Integer({ minimum: 1 }), t.Null()])),
});

export const UpdateDiscountDto = t.Partial(CreateDiscountDto);

export const ValidateDiscountDto = t.Object({
  code: t.String({ minLength: 1, maxLength: 80 }),
  subtotalAmount: t.Union([t.String({ maxLength: 32 }), t.Number()]),
  currency: t.String({ minLength: 3, maxLength: 3 }),
  customerEmail: t.Optional(t.String({ format: "email", maxLength: 254 })),
});

export type ListDiscountsQuery = typeof ListDiscountsQueryDto.static;
export type CreateDiscountInput = typeof CreateDiscountDto.static;
export type UpdateDiscountInput = typeof UpdateDiscountDto.static;
export type ValidateDiscountInput = typeof ValidateDiscountDto.static;
