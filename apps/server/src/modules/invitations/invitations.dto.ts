import { t } from "elysia";

export const InvitationParamsDto = t.Object({
  id: t.String({ minLength: 1 }),
});

