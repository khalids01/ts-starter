import { t } from "elysia";

export const ShippingRateIdParamDto = t.Object({
  id: t.String({ minLength: 1, maxLength: 128 }),
});

export const ListShippingRatesQueryDto = t.Object({
  currency: t.Optional(t.String({ minLength: 3, maxLength: 3 })),
  active: t.Optional(t.Boolean()),
  archived: t.Optional(t.Boolean()),
});

export const CreateShippingRateDto = t.Object({
  code: t.String({ minLength: 1, maxLength: 80 }),
  label: t.String({ minLength: 1, maxLength: 120 }),
  amount: t.Union([t.String({ maxLength: 32 }), t.Number()]),
  currency: t.String({ minLength: 3, maxLength: 3 }),
  freeOverAmount: t.Optional(t.Union([t.String({ maxLength: 32 }), t.Number(), t.Null()])),
  isDefault: t.Optional(t.Boolean()),
  isActive: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Integer()),
});

export const UpdateShippingRateDto = t.Partial(CreateShippingRateDto);

export type ListShippingRatesQuery = typeof ListShippingRatesQueryDto.static;
export type CreateShippingRateInput = typeof CreateShippingRateDto.static;
export type UpdateShippingRateInput = typeof UpdateShippingRateDto.static;
