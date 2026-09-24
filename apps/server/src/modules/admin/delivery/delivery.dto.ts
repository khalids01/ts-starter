import { t } from "elysia";

export const CourierConnectionIdDto = t.Object({
  id: t.String({ minLength: 1, maxLength: 128 }),
});

const CredentialSourceDto = t.Union([
  t.Literal("server_environment"),
  t.Literal("encrypted_database"),
]);

const CredentialsDto = t.Object({
  apiKey: t.String({ minLength: 1, maxLength: 500 }),
  secretKey: t.String({ minLength: 1, maxLength: 500 }),
  baseUrl: t.String({ minLength: 1, maxLength: 500 }),
});

export const CreateCourierConnectionDto = t.Object({
  providerCode: t.String({ minLength: 1, maxLength: 80 }),
  displayName: t.String({ minLength: 1, maxLength: 120 }),
  environment: t.Union([t.Literal("production"), t.Literal("sandbox")]),
  credentialSource: CredentialSourceDto,
  credentials: t.Optional(CredentialsDto),
  priority: t.Optional(t.Integer({ minimum: 0, maximum: 10_000 })),
});

export const UpdateCourierConnectionDto = t.Partial(
  t.Object({
    displayName: t.String({ minLength: 1, maxLength: 120 }),
    environment: t.Union([t.Literal("production"), t.Literal("sandbox")]),
    priority: t.Integer({ minimum: 0, maximum: 10_000 }),
    credentials: CredentialsDto,
  }),
);

export type CreateCourierConnectionInput =
  typeof CreateCourierConnectionDto.static;
export type UpdateCourierConnectionInput =
  typeof UpdateCourierConnectionDto.static;
