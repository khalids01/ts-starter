import { z } from "zod";
import type {
  ConsignmentResult,
  CourierCredentials,
  CourierPickupRequest,
  CourierProviderAdapter,
  CourierReturnRequest,
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
  "exceptional",
  "unknown",
  "partial_delivered_return_proccessing",
  "partial_delivered_return_rider_assigned",
  "partial_delivered_return_received",
  "cancelled_return_proccessing",
  "cancelled_return_rider_assigned",
  "cancelled_return_received",
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

const pickupResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.union([z.number(), z.string()]),
    req_status: z.union([z.number(), z.string()]),
    created_at: z.string().optional(),
  }),
});

const returnSchema = z.object({
  id: z.union([z.number(), z.string()]),
  consignment_id: z.union([z.number(), z.string()]),
  reason: z.string().nullable().optional(),
  status: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

const trackingResponseSchema = z.object({
  status: z.number(),
  tracking: z.array(z.object({
    consignment_id: z.union([z.number(), z.string()]),
    tracking_type: z.union([z.number(), z.string()]),
    text: z.string(),
    created_at: z.string(),
  })),
});

const paymentSchema = z.object({
  payment_id: z.union([z.number(), z.string()]),
  amount: z.union([z.number(), z.string()]),
  method: z.string().optional(),
  status_label: z.string(),
  created_at: z.string().optional(),
  ready_at: z.string().nullable().optional(),
  paid_at: z.string().nullable().optional(),
}).passthrough();

const paymentsResponseSchema = z.object({
  payments: z.array(paymentSchema),
});

function parsedDate(value: string | null | undefined) {
  if (!value) return undefined;
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function positivePage(page = 1) {
  if (!Number.isInteger(page) || page < 1) {
    throw new CourierProviderRequestError("Steadfast page must be a positive integer", { code: "validation", retryable: false });
  }
  return page;
}

function mapReturn(value: z.infer<typeof returnSchema>) {
  return {
    externalId: String(value.id),
    consignmentExternalId: String(value.consignment_id),
    providerState: normalizedStatus(value.status),
    reason: value.reason,
    createdAt: parsedDate(value.created_at),
    updatedAt: parsedDate(value.updated_at),
  };
}

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

  async getConsignmentStatusWithReturn(credentials: CourierCredentials, externalId: string) {
    return this.getStatus(credentials, `/status_with_return_status_by_cid/${encodeURIComponent(externalId)}`);
  }

  async getTrackingHistory(credentials: CourierCredentials, invoice: string) {
    const parsed = trackingResponseSchema.safeParse(
      await this.request(credentials, `/trackings_by_invoice/${encodeURIComponent(invoice)}`),
    );
    if (!parsed.success) throw new CourierProviderRequestError("Steadfast returned an invalid tracking-history response", { code: "invalid_response", retryable: false });
    return parsed.data.tracking.map((entry) => ({
      externalId: String(entry.consignment_id),
      providerType: String(entry.tracking_type),
      message: entry.text,
      occurredAt: parsedDate(entry.created_at)!,
    }));
  }

  async requestPickup(credentials: CourierCredentials, request: CourierPickupRequest) {
    const address = request.address.trim();
    const contactNumber = request.contactNumber.trim();
    const note = request.note?.trim() || undefined;
    if (!Number.isInteger(request.addressId) || request.addressId < 1 || !Number.isInteger(request.policeStationId) || request.policeStationId < 1) throw new CourierProviderRequestError("Steadfast pickup address and police-station IDs must be positive integers", { code: "validation", retryable: false });
    if (!address || address.length > 255) throw new CourierProviderRequestError("Steadfast pickup address must use 1-255 characters", { code: "validation", retryable: false });
    if (!/^01[3-9]\d{8}$/.test(contactNumber)) throw new CourierProviderRequestError("Steadfast pickup contact must be an 11-digit Bangladesh mobile number", { code: "validation", retryable: false });
    if (note && note.length > 500) throw new CourierProviderRequestError("Steadfast pickup note cannot exceed 500 characters", { code: "validation", retryable: false });
    if (request.estimatedQuantity !== undefined && (!Number.isInteger(request.estimatedQuantity) || request.estimatedQuantity < 1)) throw new CourierProviderRequestError("Steadfast pickup estimated quantity must be a positive integer", { code: "validation", retryable: false });
    const parsed = pickupResponseSchema.safeParse(await this.request(credentials, "/create_pickup_request", { method: "POST", body: JSON.stringify({ address_id: request.addressId, police_station_id: request.policeStationId, address, contact_number: contactNumber, ...(note ? { note } : {}), ...(request.estimatedQuantity === undefined ? {} : { estim_qty: request.estimatedQuantity }) }) }));
    if (!parsed.success) throw new CourierProviderRequestError("Steadfast returned an invalid pickup response", { code: "invalid_response", retryable: false });
    return { externalId: String(parsed.data.data.id), providerState: String(parsed.data.data.req_status), createdAt: parsedDate(parsed.data.data.created_at) };
  }

  async createReturn(credentials: CourierCredentials, request: CourierReturnRequest) {
    const identifiers = [request.externalId, request.invoice, request.trackingCode].filter((value) => value?.trim());
    if (identifiers.length !== 1) throw new CourierProviderRequestError("Steadfast return requires exactly one consignment, invoice, or tracking identifier", { code: "validation", retryable: false });
    const reason = request.reason?.trim() || undefined;
    if (reason && reason.length > 500) throw new CourierProviderRequestError("Steadfast return reason cannot exceed 500 characters", { code: "validation", retryable: false });
    const raw = await this.request(credentials, "/create_return_request", { method: "POST", body: JSON.stringify({ ...(request.externalId ? { consignment_id: request.externalId.trim() } : {}), ...(request.invoice ? { invoice: request.invoice.trim() } : {}), ...(request.trackingCode ? { tracking_code: request.trackingCode.trim() } : {}), ...(reason ? { reason } : {}) }) });
    const parsed = returnSchema.safeParse(raw);
    if (!parsed.success) throw new CourierProviderRequestError("Steadfast returned an invalid return response", { code: "invalid_response", retryable: false });
    return mapReturn(parsed.data);
  }

  async getReturn(credentials: CourierCredentials, externalId: string) {
    const parsed = returnSchema.safeParse(await this.request(credentials, `/get_return_request/${encodeURIComponent(externalId)}`));
    if (!parsed.success) throw new CourierProviderRequestError("Steadfast returned an invalid return-detail response", { code: "invalid_response", retryable: false });
    return mapReturn(parsed.data);
  }

  async listReturns(credentials: CourierCredentials, page = 1) {
    const currentPage = positivePage(page);
    const raw = await this.request(credentials, `/get_return_requests?page=${currentPage}`);
    const candidates = Array.isArray(raw) ? raw : typeof raw === "object" && raw !== null && Array.isArray((raw as any).data) ? (raw as any).data : typeof raw === "object" && raw !== null && Array.isArray((raw as any).return_requests) ? (raw as any).return_requests : null;
    const parsed = z.array(returnSchema).safeParse(candidates);
    if (!parsed.success) throw new CourierProviderRequestError("Steadfast returned an invalid returns response", { code: "invalid_response", retryable: false });
    return { items: parsed.data.map(mapReturn), page: currentPage };
  }

  async getBalance(credentials: CourierCredentials) {
    const parsed = balanceResponseSchema.safeParse(await this.request(credentials, "/get_balance"));
    if (!parsed.success) throw new CourierProviderRequestError("Steadfast returned an invalid balance response", { code: "invalid_response", retryable: false });
    return { amount: String(parsed.data.current_balance), currency: "BDT" as const };
  }

  async listSettlements(credentials: CourierCredentials, page = 1) {
    const currentPage = positivePage(page);
    const parsed = paymentsResponseSchema.safeParse(await this.request(credentials, `/payments?page=${currentPage}`));
    if (!parsed.success) throw new CourierProviderRequestError("Steadfast returned an invalid payments response", { code: "invalid_response", retryable: false });
    return { items: parsed.data.payments.map((payment) => ({ externalId: String(payment.payment_id), amount: String(payment.amount), method: payment.method, providerState: normalizedStatus(payment.status_label), createdAt: parsedDate(payment.created_at), readyAt: parsedDate(payment.ready_at), paidAt: parsedDate(payment.paid_at), raw: payment })), page: currentPage };
  }

  async getSettlement(credentials: CourierCredentials, externalId: string) {
    const numericId = externalId.replace(/\D/g, "");
    if (!numericId) throw new CourierProviderRequestError("Steadfast payment ID must contain a number", { code: "validation", retryable: false });
    const raw = await this.request(credentials, `/payments/${numericId}`);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new CourierProviderRequestError("Steadfast returned an invalid payment-detail response", { code: "invalid_response", retryable: false });
    return raw as Record<string, unknown>;
  }

  async getServiceAreas(credentials: CourierCredentials) {
    const raw = await this.request(credentials, "/police_stations");
    const candidates = Array.isArray(raw) ? raw : typeof raw === "object" && raw !== null && Array.isArray((raw as any).data) ? (raw as any).data : typeof raw === "object" && raw !== null && Array.isArray((raw as any).police_stations) ? (raw as any).police_stations : null;
    if (!candidates || !candidates.every((item: unknown) => item && typeof item === "object" && !Array.isArray(item))) throw new CourierProviderRequestError("Steadfast returned an invalid police-stations response", { code: "invalid_response", retryable: false });
    return candidates as Record<string, unknown>[];
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
