import { t } from "elysia";

export const CustomerIdParamDto = t.Object({ id: t.String({ minLength: 1, maxLength: 128 }) });

export const ListCustomersQueryDto = t.Object({
  page: t.Optional(t.Integer({ minimum: 1 })),
  limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
  search: t.Optional(t.String({ maxLength: 200 })),
});

export const UpdateCustomerDto = t.Partial(t.Object({
  name: t.String({ minLength: 1, maxLength: 120 }),
  email: t.String({ format: "email", maxLength: 254 }),
  phone: t.Union([t.String({ maxLength: 40 }), t.Null()]),
  adminNote: t.Union([t.String({ maxLength: 5000 }), t.Null()]),
}));

export type ListCustomersQuery = typeof ListCustomersQueryDto.static;
export type UpdateCustomerInput = typeof UpdateCustomerDto.static;
