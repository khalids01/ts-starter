import { t } from "elysia";

export const CreateOwnerDto = t.Object({
  name: t.String({ minLength: 2 }),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
});

export type CreateOwner = typeof CreateOwnerDto.static;

export const SetupStatusResponseDto = t.Object({
  hasOwner: t.Boolean(),
});

export const OwnerCreatedResponseDto = t.Object({
  message: t.String(),
  user: t.Object({
    id: t.String(),
    name: t.String(),
    email: t.String(),
  }),
});

export const ErrorResponseDto = t.Object({
  error: t.String(),
});
