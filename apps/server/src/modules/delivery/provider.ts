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

export type CourierPickupRequest = Readonly<{
  addressId: number;
  policeStationId: number;
  address: string;
  contactNumber: string;
  note?: string;
  estimatedQuantity?: number;
}>;

export type CourierPickupResult = Readonly<{
  externalId: string;
  providerState: string;
  createdAt?: Date;
}>;

export type CourierReturnRequest = Readonly<{
  externalId?: string;
  invoice?: string;
  trackingCode?: string;
  reason?: string;
}>;

export type CourierReturnResult = Readonly<{
  externalId: string;
  consignmentExternalId: string;
  providerState: string;
  reason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}>;

export type CourierTrackingEntry = Readonly<{
  externalId: string;
  providerType: string;
  message: string;
  occurredAt: Date;
}>;

export type CourierPayoutSummary = Readonly<{
  externalId: string;
  amount: string;
  method?: string;
  providerState: string;
  createdAt?: Date;
  readyAt?: Date;
  paidAt?: Date;
  raw: Record<string, unknown>;
}>;

export interface CourierProviderAdapter {
  readonly code: string;
  readonly capabilities: ReadonlySet<CourierCapability>;
  healthCheck(credentials: CourierCredentials): Promise<{ available: boolean }>;
  createConsignment(credentials: CourierCredentials, request: CreateConsignmentRequest): Promise<ConsignmentResult>;
  getConsignmentStatus(credentials: CourierCredentials, externalId: string): Promise<{ providerState: string }>;
  getConsignmentStatusWithReturn?(credentials: CourierCredentials, externalId: string): Promise<{ providerState: string }>;
  getTrackingHistory?(credentials: CourierCredentials, invoice: string): Promise<readonly CourierTrackingEntry[]>;
  requestPickup?(credentials: CourierCredentials, request: CourierPickupRequest): Promise<CourierPickupResult>;
  createReturn?(credentials: CourierCredentials, request: CourierReturnRequest): Promise<CourierReturnResult>;
  listReturns?(credentials: CourierCredentials, page?: number): Promise<{ items: readonly CourierReturnResult[]; page: number }>;
  getReturn?(credentials: CourierCredentials, externalId: string): Promise<CourierReturnResult>;
  getBalance?(credentials: CourierCredentials): Promise<{ amount: string; currency: "BDT" }>;
  listSettlements?(credentials: CourierCredentials, page?: number): Promise<{ items: readonly CourierPayoutSummary[]; page: number }>;
  getSettlement?(credentials: CourierCredentials, externalId: string): Promise<Record<string, unknown>>;
  getServiceAreas?(credentials: CourierCredentials): Promise<readonly Record<string, unknown>[]>;
  verifyAndParseWebhook?(
    credentials: CourierCredentials,
    input: Readonly<{ authorization: string | null; signature: string | null; idempotencyKey: string | null; body: string }>,
  ): Promise<CourierWebhookEvent>;
}

export function requireCourierCapability(adapter: CourierProviderAdapter, capability: CourierCapability) {
  if (!adapter.capabilities.has(capability)) {
    throw new UnsupportedCourierCapabilityError(adapter.code, capability);
  }
}
