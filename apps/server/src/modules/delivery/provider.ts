export type CourierCapability =
  | "createConsignment"
  | "getConsignmentStatus"
  | "bulkCreateConsignments"
  | "requestPickup"
  | "cancelConsignment"
  | "createReturn"
  | "listReturns"
  | "getReturn"
  | "getBalance"
  | "listSettlements"
  | "getSettlement"
  | "getServiceAreas";

export class UnsupportedCourierCapabilityError extends Error {
  constructor(readonly providerCode: string, readonly capability: CourierCapability) {
    super(`${providerCode} does not support ${capability}`);
  }
}

export type CourierCredentials = Readonly<{
  baseUrl: string;
  values: Readonly<Record<string, string>>;
}>;

export type CourierCredentialSource = "server_environment" | "encrypted_database";

export type CourierConnectionCredentialConfig = Readonly<{
  credentialContext: string;
  providerCode: string;
  credentialSource: CourierCredentialSource;
  encryptedCredentials?: Readonly<{
    ciphertext: Uint8Array;
    nonce: Uint8Array;
    authTag: Uint8Array;
    keyVersion: number;
  }>;
}>;

export interface CourierCredentialResolver {
  resolve(connection: CourierConnectionCredentialConfig): Promise<CourierCredentials>;
}

export type CreateConsignmentRequest = Readonly<{
  invoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: string;
  currency: string;
  note?: string;
}>;

export type ConsignmentResult = Readonly<{
  externalId: string;
  invoice: string;
  trackingCode: string | null;
  providerState: string;
}>;

export type CourierWebhookEvent = Readonly<{
  eventId: string;
  eventType: "delivery_status" | "tracking_update";
  externalId?: string;
  invoice?: string;
  trackingCode?: string;
  providerState?: string;
  occurredAt?: Date;
  payload: Record<string, unknown>;
}>;

export interface CourierProviderAdapter {
  readonly code: string;
  readonly capabilities: ReadonlySet<CourierCapability>;
  healthCheck(credentials: CourierCredentials): Promise<{ available: boolean }>;
  createConsignment(credentials: CourierCredentials, request: CreateConsignmentRequest): Promise<ConsignmentResult>;
  getConsignmentStatus(credentials: CourierCredentials, externalId: string): Promise<{ providerState: string }>;
  verifyAndParseWebhook?(
    credentials: CourierCredentials,
    input: Readonly<{ authorization: string | null; body: string }>,
  ): Promise<CourierWebhookEvent>;
}

export function requireCourierCapability(adapter: CourierProviderAdapter, capability: CourierCapability) {
  if (!adapter.capabilities.has(capability)) {
    throw new UnsupportedCourierCapabilityError(adapter.code, capability);
  }
}
