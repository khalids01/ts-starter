import { t } from "elysia";

export const CourierConnectionIdDto = t.Object({
  id: t.String({ minLength: 1, maxLength: 128 }),
});

export const CourierResourceIdDto = t.Object({
  id: t.String({ minLength: 1, maxLength: 128 }),
});

export const CourierOrderIdDto = t.Object({
  orderId: t.String({ minLength: 1, maxLength: 128 }),
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

export const CreateCourierServiceDto = t.Object({
  connectionId: t.String({ minLength: 1, maxLength: 128 }),
  code: t.String({ minLength: 1, maxLength: 80, pattern: "^[a-z][a-z0-9_-]*$" }),
  displayName: t.String({ minLength: 1, maxLength: 120 }),
  shippingRateIds: t.Array(t.String({ minLength: 1, maxLength: 128 }), { minItems: 1, maxItems: 50 }),
});

export const UpdateCourierServiceDto = t.Partial(t.Object({
  displayName: t.String({ minLength: 1, maxLength: 120 }),
  enabled: t.Boolean(),
  shippingRateIds: t.Array(t.String({ minLength: 1, maxLength: 128 }), { minItems: 1, maxItems: 50 }),
}));

const RoutingConditionsDto = t.Object({
  shippingMethodIds: t.Optional(t.Array(t.String(), { maxItems: 50 })),
  countries: t.Optional(t.Array(t.String(), { maxItems: 50 })),
  cities: t.Optional(t.Array(t.String(), { maxItems: 100 })),
  zones: t.Optional(t.Array(t.String(), { maxItems: 100 })),
  postalCodes: t.Optional(t.Array(t.String(), { maxItems: 100 })),
  paymentKinds: t.Optional(t.Array(t.Union([t.Literal("cod"), t.Literal("prepaid")]), { maxItems: 2 })),
  minimumCodAmount: t.Optional(t.Number({ minimum: 0 })),
  maximumCodAmount: t.Optional(t.Number({ minimum: 0 })),
  maximumWeightGrams: t.Optional(t.Number({ minimum: 0 })),
});

export const CreateCourierRoutingRuleDto = t.Object({
  name: t.String({ minLength: 1, maxLength: 120 }),
  priority: t.Integer({ minimum: 0, maximum: 10_000 }),
  connectionId: t.String({ minLength: 1, maxLength: 128 }),
  serviceId: t.String({ minLength: 1, maxLength: 128 }),
  conditions: RoutingConditionsDto,
});

export const UpdateCourierRoutingRuleDto = t.Partial(t.Object({
  name: t.String({ minLength: 1, maxLength: 120 }),
  priority: t.Integer({ minimum: 0, maximum: 10_000 }),
  enabled: t.Boolean(),
  connectionId: t.String({ minLength: 1, maxLength: 128 }),
  serviceId: t.String({ minLength: 1, maxLength: 128 }),
  conditions: RoutingConditionsDto,
}));

export const ConfirmCourierRouteDto = t.Object({
  connectionId: t.String({ minLength: 1, maxLength: 128 }),
  serviceId: t.String({ minLength: 1, maxLength: 128 }),
  overrideReason: t.Optional(t.String({ minLength: 5, maxLength: 500 })),
});

export type CreateCourierConnectionInput =
  typeof CreateCourierConnectionDto.static;
export type UpdateCourierConnectionInput =
  typeof UpdateCourierConnectionDto.static;
export type CreateCourierServiceInput = typeof CreateCourierServiceDto.static;
export type UpdateCourierServiceInput = typeof UpdateCourierServiceDto.static;
export type CreateCourierRoutingRuleInput = typeof CreateCourierRoutingRuleDto.static;
export type UpdateCourierRoutingRuleInput = typeof UpdateCourierRoutingRuleDto.static;
export type ConfirmCourierRouteInput = typeof ConfirmCourierRouteDto.static;
