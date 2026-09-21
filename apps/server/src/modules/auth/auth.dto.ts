import { t } from "elysia";

export const CheckEmailDto = t.Object({
  email: t.String({ maxLength: 254 }),
});

export const MagicLinkLoginDto = t.Object({
  email: t.String({ maxLength: 254 }),
  callbackURL: t.Optional(t.String({ maxLength: 2048 })),
});

export const MagicLinkSignupDto = t.Object({
  email: t.String({ maxLength: 254 }),
  name: t.String({ minLength: 1, maxLength: 120 }),
  callbackURL: t.Optional(t.String({ maxLength: 2048 })),
});
