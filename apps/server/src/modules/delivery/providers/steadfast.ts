import { z } from "zod";
import type {
  ConsignmentResult,
  CourierCredentials,
  CourierProviderAdapter,
  CreateConsignmentRequest,
} from "../provider";

const STEADFAST_STATUSES = [
  "pending",
  "delivered_approval_pending",
  "partial_delivered_approval_pending",
  "cancelled_approval_pending",
  "unknown_approval_pending",
  "delivered",
  "partial_delivered",
  "cancelled",
  "hold",
  "in_review",
  "unknown",
] as const;

const statusSchema = z.object({
  status: z.number().optional(),
  delivery_status: z.enum(STEADFAST_STATUSES),
});

const createResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  consignment: z.object({
    consignment_id: z.union([z.number(), z.string()]),
    invoice: z.string(),
    tracking_code: z.string().nullable().optional(),
    status: z.string(),
  }),
});

const balanceResponseSchema = z.object({
  status: z.number(),
  current_balance: z.union([z.number(), z.string()]),
});

type Fetch = typeof fetch;

export type SteadfastSubmissionResult =
  | Readonly<{ kind: "created"; consignment: ConsignmentResult }>
  | Readonly<{
      kind: "uncertain";
      invoice: string;
      providerState: string | null;
      reason: "provider_found_invoice" | "status_not_found" | "status_unavailable";
    }>;

export class CourierProviderRequestError extends Error {
  constructor(
    message: string,
    readonly details: Readonly<{
      code: "authentication" | "rate_limited" | "validation" | "provider" | "network" | "invalid_response";
      retryable: boolean;
      httpStatus?: number;
      retryAfterSeconds?: number;
    }>,
  ) {
    super(message);
  }
}

function normalizedBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function requiredCredential(credentials: CourierCredentials, key: string) {
  const value = credentials.values[key]?.trim();
  if (!value) {
    throw new CourierProviderRequestError(
      `Steadfast credentials are missing ${key}`,
      { code: "authentication", retryable: false },
    );
  }
  return value;
}

function normalizedStatus(value: string) {
  return value.trim().toLowerCase();
}

function validateCreateRequest(request: CreateConsignmentRequest) {
  const invoice = request.invoice.trim();
  const recipientName = request.recipientName.trim();
  const recipientPhone = request.recipientPhone.trim();
  const recipientAddress = request.recipientAddress.trim();
  const note = request.note?.trim() || undefined;
  const codAmount = Number(request.codAmount);
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(invoice)) {
    throw new CourierProviderRequestError(
      "Steadfast invoice must use 1-100 alphanumeric, hyphen, or underscore characters",
      { code: "validation", retryable: false },
    );
  }
  if (!recipientName || recipientName.length > 100) {
    throw new CourierProviderRequestError(
      "Steadfast recipient name must use 1-100 characters",
      { code: "validation", retryable: false },
    );
  }
  if (!/^01\d{9}$/.test(recipientPhone)) {
    throw new CourierProviderRequestError(
      "Steadfast recipient phone must be an 11-digit Bangladesh mobile number",
      { code: "validation", retryable: false },
    );
  }
  if (!recipientAddress || recipientAddress.length > 250) {
    throw new CourierProviderRequestError(
      "Steadfast recipient address must use 1-250 characters",
      { code: "validation", retryable: false },
    );
  }
  if (request.currency !== "BDT" || !Number.isFinite(codAmount) || codAmount < 0) {
    throw new CourierProviderRequestError(
      "Steadfast COD amount must be a non-negative BDT value",
      { code: "validation", retryable: false },
    );
  }
  if (note && note.length > 480) {
    throw new CourierProviderRequestError(
      "Steadfast delivery note cannot exceed 480 characters",
      { code: "validation", retryable: false },
    );
  }
  return {
    invoice,
    recipient_name: recipientName,
    recipient_phone: recipientPhone,
    recipient_address: recipientAddress,
    cod_amount: codAmount,
    delivery_type: 0,
    ...(note ? { note } : {}),
  };
}

export class SteadfastCourierAdapter implements CourierProviderAdapter {
  readonly code = "steadfast";
  readonly capabilities = new Set([
    "createConsignment",
    "getConsignmentStatus",
    "bulkCreateConsignments",
    "requestPickup",
    "createReturn",
    "listReturns",
    "getReturn",
    "getBalance",
    "listSettlements",
    "getSettlement",
    "getServiceAreas",
  ] as const);

  constructor(
    private readonly fetchImplementation: Fetch = fetch,
    private readonly timeoutMs = 10_000,
  ) {}

  private async request(
    credentials: CourierCredentials,
    path: string,
    init: RequestInit = {},
  ) {
    const headers = new Headers(init.headers);
    headers.set("Api-Key", requiredCredential(credentials, "apiKey"));
    headers.set("Secret-Key", requiredCredential(credentials, "secretKey"));
    if (init.body !== undefined) headers.set("Content-Type", "application/json");

    let response: Response;
    try {
      response = await this.fetchImplementation(
        `${normalizedBaseUrl(credentials.baseUrl)}${path}`,
        {
          ...init,
          headers,
          signal: init.signal ?? AbortSignal.timeout(this.timeoutMs),
        },
      );
    } catch {
      throw new CourierProviderRequestError(
        "Steadfast request failed before a response was received",
        { code: "network", retryable: true },
      );
    }

    if (!response.ok) {
      const retryAfter = Number(response.headers.get("retry-after"));
      if (response.status === 401) {
        throw new CourierProviderRequestError(
          "Steadfast rejected the configured credentials",
          { code: "authentication", retryable: false, httpStatus: 401 },
        );
      }
      if (response.status === 429) {
        throw new CourierProviderRequestError(
          "Steadfast rate limit was reached",
          {
            code: "rate_limited",
            retryable: true,
            httpStatus: 429,
            ...(Number.isFinite(retryAfter) && retryAfter >= 0
              ? { retryAfterSeconds: retryAfter }
              : {}),
          },
        );
      }
      throw new CourierProviderRequestError(
        response.status >= 500
          ? "Steadfast is temporarily unavailable"
          : "Steadfast rejected the request",
        {
          code: response.status >= 500 ? "provider" : "validation",
          retryable: response.status >= 500,
          httpStatus: response.status,
        },
      );
    }

    try {
      return await response.json();
    } catch {
      throw new CourierProviderRequestError(
        "Steadfast returned an invalid JSON response",
        {
          code: "invalid_response",
          retryable: false,
          httpStatus: response.status,
        },
      );
    }
  }

  async healthCheck(credentials: CourierCredentials) {
    const parsed = balanceResponseSchema.safeParse(
      await this.request(credentials, "/get_balance"),
    );
    if (!parsed.success) {
      throw new CourierProviderRequestError(
        "Steadfast returned an invalid balance response",
        { code: "invalid_response", retryable: false },
      );
    }
    return { available: true };
  }

  async createConsignment(
    credentials: CourierCredentials,
    request: CreateConsignmentRequest,
  ): Promise<ConsignmentResult> {
    const payload = validateCreateRequest(request);
    const raw = await this.request(credentials, "/create_order", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const parsed = createResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new CourierProviderRequestError(
        "Steadfast returned an invalid create-order response",
        { code: "invalid_response", retryable: false },
      );
    }
    const consignment = parsed.data.consignment;
    if (consignment.invoice !== payload.invoice) {
      throw new CourierProviderRequestError(
        "Steadfast returned a different invoice than requested",
        { code: "invalid_response", retryable: false },
      );
    }
    return {
      externalId: String(consignment.consignment_id),
      invoice: consignment.invoice,
      trackingCode: consignment.tracking_code ?? null,
      providerState: normalizedStatus(consignment.status),
    };
  }

  async getConsignmentStatus(
    credentials: CourierCredentials,
    externalId: string,
  ) {
    return this.getStatus(credentials, `/status_by_cid/${encodeURIComponent(externalId)}`);
  }

  async getStatusByInvoice(
    credentials: CourierCredentials,
    invoice: string,
  ) {
    return this.getStatus(
      credentials,
      `/status_by_invoice/${encodeURIComponent(invoice)}`,
    );
  }

  async getStatusByTrackingCode(
    credentials: CourierCredentials,
    trackingCode: string,
  ) {
    return this.getStatus(
      credentials,
      `/status_by_trackingcode/${encodeURIComponent(trackingCode)}`,
    );
  }

  private async getStatus(credentials: CourierCredentials, path: string) {
    const parsed = statusSchema.safeParse(
      await this.request(credentials, path),
    );
    if (!parsed.success) {
      throw new CourierProviderRequestError(
        "Steadfast returned an invalid status response",
        { code: "invalid_response", retryable: false },
      );
    }
    return { providerState: parsed.data.delivery_status };
  }

  async createConsignmentWithRecovery(
    credentials: CourierCredentials,
    request: CreateConsignmentRequest,
  ): Promise<SteadfastSubmissionResult> {
    try {
      return {
        kind: "created",
        consignment: await this.createConsignment(credentials, request),
      };
    } catch (error) {
      if (
        !(error instanceof CourierProviderRequestError) ||
        !error.details.retryable
      ) {
        throw error;
      }
      try {
        const status = await this.getStatusByInvoice(
          credentials,
          request.invoice.trim(),
        );
        return {
          kind: "uncertain",
          invoice: request.invoice.trim(),
          providerState: status.providerState,
          reason: "provider_found_invoice",
        };
      } catch (lookupError) {
        return {
          kind: "uncertain",
          invoice: request.invoice.trim(),
          providerState: null,
          reason:
            lookupError instanceof CourierProviderRequestError &&
            lookupError.details.httpStatus === 404
              ? "status_not_found"
              : "status_unavailable",
        };
      }
    }
  }
}
