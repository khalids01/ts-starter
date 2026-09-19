import { t } from "elysia";

export const UpdateStoreSettingsDto = t.Object({
  storeName: t.String({ minLength: 1, maxLength: 120 }),
  supportEmail: t.Union([t.String({ format: "email", maxLength: 254 }), t.Null()]),
  supportPhone: t.Union([t.String({ maxLength: 40 }), t.Null()]),
  defaultCurrency: t.String({ minLength: 3, maxLength: 3 }),
  orderNumberPrefix: t.String({ minLength: 1, maxLength: 12 }),
  reservationDurationMinutes: t.Integer({ minimum: 1, maximum: 1440 }),
  checkoutEnabled: t.Boolean(),
  checkoutNotice: t.Union([t.String({ maxLength: 500 }), t.Null()]),
});

export type UpdateStoreSettingsInput = typeof UpdateStoreSettingsDto.static;
