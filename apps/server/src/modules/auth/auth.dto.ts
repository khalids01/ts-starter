import { t } from "elysia";

export const CheckEmailDto = t.Object({
  email: t.String(),
});

export const MagicLinkLoginDto = t.Object({
  email: t.String(),
});

export const MagicLinkSignupDto = t.Object({
  email: t.String(),
  name: t.String(),
});
