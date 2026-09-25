import { describe, expect, it } from "bun:test";
import { createHmac } from "node:crypto";
import {
  CourierProviderRequestError,
  SteadfastCourierAdapter,
} from "../src/modules/delivery/providers/steadfast";

const createFixture = await Bun.file(
  new URL("./fixtures/steadfast/create-order.success.json", import.meta.url),
).json();
const statusFixture = await Bun.file(
  new URL("./fixtures/steadfast/status.success.json", import.meta.url),
).json();

const credentials = {
  baseUrl: "https://portal.packzy.com/api/v1",
  values: { apiKey: "api-secret", secretKey: "secret-secret" },
};
const request = {
  invoice: "ORD-10231",
  recipientName: "Jahid Hasan",
  recipientPhone: "01712345678",
  recipientAddress: "Dhanmondi, Dhaka",
  codAmount: "1060",
  currency: "BDT",
  note: "Call before delivery",
};

function jsonResponse(value: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

function queuedFetch(
  responses: Array<Response | Error>,
  calls: Array<{ url: string; init?: RequestInit }> = [],
) {
  return Object.assign(
    async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(input), init });
      const response = responses.shift();
      if (response instanceof Error) throw response;
      if (!response) throw new Error("Missing fake response");
      return response;
    },
    { preconnect() {} },
  ) as typeof fetch;
}

describe("Steadfast courier adapter", () => {
  it("authenticates a health check without exposing credentials in the URL", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const adapter = new SteadfastCourierAdapter(
      queuedFetch([jsonResponse({ status: 200, current_balance: 100 })], calls),
    );

    await expect(adapter.healthCheck(credentials)).resolves.toEqual({
      available: true,
    });
    expect(calls[0]?.url).toBe(
      "https://portal.packzy.com/api/v1/get_balance",
    );
    const headers = new Headers(calls[0]?.init?.headers);
    expect(headers.get("Api-Key")).toBe("api-secret");
    expect(headers.get("Secret-Key")).toBe("secret-secret");
  });

  it("creates and maps a home-delivery consignment", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const adapter = new SteadfastCourierAdapter(
      queuedFetch([jsonResponse(createFixture)], calls),
    );

    await expect(adapter.createConsignment(credentials, request)).resolves.toEqual(
      {
        externalId: "1424107",
        invoice: "ORD-10231",
        trackingCode: "15BAEB8A",
        providerState: "in_review",
      },
    );
    expect(calls[0]?.url).toEndWith("/create_order");
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      invoice: "ORD-10231",
      recipient_name: "Jahid Hasan",
      recipient_phone: "01712345678",
      recipient_address: "Dhanmondi, Dhaka",
      cod_amount: 1060,
      delivery_type: 0,
      note: "Call before delivery",
    });
  });

  it("validates dispatch data before making a request", async () => {
    let requested = false;
    const trackingAdapter = new SteadfastCourierAdapter(
      (async () => {
        requested = true;
        return jsonResponse(createFixture);
      }) as typeof fetch,
    );

    await expect(
      trackingAdapter.createConsignment(credentials, {
        ...request,
        recipientPhone: "123",
      }),
    ).rejects.toMatchObject({ details: { retryable: false, code: "validation" } });
    expect(requested).toBe(false);
    expect(trackingAdapter.code).toBe("steadfast");
  });

  it("looks up status by encoded identifiers", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const adapter = new SteadfastCourierAdapter(
      queuedFetch(
        [jsonResponse(statusFixture), jsonResponse(statusFixture), jsonResponse(statusFixture)],
        calls,
      ),
    );

    await adapter.getConsignmentStatus(credentials, "cid/1");
    await adapter.getStatusByInvoice(credentials, "ORDER/1");
    await adapter.getStatusByTrackingCode(credentials, "TRACK/1");
    expect(calls.map(({ url }) => url)).toEqual([
      "https://portal.packzy.com/api/v1/status_by_cid/cid%2F1",
      "https://portal.packzy.com/api/v1/status_by_invoice/ORDER%2F1",
      "https://portal.packzy.com/api/v1/status_by_trackingcode/TRACK%2F1",
    ]);
  });

  it("normalizes authentication and rate-limit failures without response bodies", async () => {
    const authenticationAdapter = new SteadfastCourierAdapter(
      queuedFetch([jsonResponse({ secret: "must-not-leak" }, { status: 401 })]),
    );
    await expect(authenticationAdapter.healthCheck(credentials)).rejects.toMatchObject(
      {
        message: "Steadfast rejected the configured credentials",
        details: { code: "authentication", retryable: false, httpStatus: 401 },
      },
    );

    const rateLimitedAdapter = new SteadfastCourierAdapter(
      queuedFetch([
        jsonResponse({}, { status: 429, headers: { "retry-after": "60" } }),
      ]),
    );
    await expect(rateLimitedAdapter.healthCheck(credentials)).rejects.toMatchObject({
      details: {
        code: "rate_limited",
        retryable: true,
        retryAfterSeconds: 60,
      },
    });
  });

  it("recovers a timed-out create by invoice without submitting twice", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const adapter = new SteadfastCourierAdapter(
      queuedFetch([new Error("timeout"), jsonResponse(statusFixture)], calls),
    );

    await expect(
      adapter.createConsignmentWithRecovery(credentials, request),
    ).resolves.toEqual({
      kind: "uncertain",
      invoice: "ORD-10231",
      providerState: "in_review",
      reason: "provider_found_invoice",
    });
    expect(calls.map(({ url }) => url)).toEqual([
      "https://portal.packzy.com/api/v1/create_order",
      "https://portal.packzy.com/api/v1/status_by_invoice/ORD-10231",
    ]);
  });

  it("rejects malformed success responses", async () => {
    const adapter = new SteadfastCourierAdapter(
      queuedFetch([jsonResponse({ status: 200, consignment: null })]),
    );
    await expect(adapter.createConsignment(credentials, request)).rejects.toBeInstanceOf(
      CourierProviderRequestError,
    );
  });

  it("requests pickup using the official field names", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const adapter = new SteadfastCourierAdapter(queuedFetch([jsonResponse({
      message: "Pickup request created successfully.",
      data: { id: 9081, req_status: 0, created_at: "2026-09-20T07:05:31.000000Z" },
    }, { status: 201 })], calls));

    await expect(adapter.requestPickup(credentials, {
      addressId: 42,
      policeStationId: 17,
      address: "House 17/1, Road 3/A, Dhanmondi, Dhaka",
      contactNumber: "01712345678",
      estimatedQuantity: 25,
    })).resolves.toMatchObject({ externalId: "9081", providerState: "0" });
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      address_id: 42,
      police_station_id: 17,
      address: "House 17/1, Road 3/A, Dhanmondi, Dhaka",
      contact_number: "01712345678",
      estim_qty: 25,
    });
  });

  it("creates and reads provider return requests", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const result = { id: 1, consignment_id: 1424107, reason: "Customer changed their mind", status: "pending", created_at: "2026-09-20T23:11:45.000000Z", updated_at: "2026-09-20T23:11:45.000000Z" };
    const adapter = new SteadfastCourierAdapter(queuedFetch([
      jsonResponse(result, { status: 201 }),
      jsonResponse({ data: [result] }),
      jsonResponse(result),
    ], calls));

    await expect(adapter.createReturn(credentials, { invoice: "ORD-10231", reason: "Customer changed their mind" })).resolves.toMatchObject({ externalId: "1", consignmentExternalId: "1424107", providerState: "pending" });
    await expect(adapter.listReturns(credentials, 2)).resolves.toMatchObject({ page: 2, items: [{ externalId: "1" }] });
    await expect(adapter.getReturn(credentials, "1")).resolves.toMatchObject({ externalId: "1" });
    expect(calls.map(({ url }) => url)).toEqual([
      "https://portal.packzy.com/api/v1/create_return_request",
      "https://portal.packzy.com/api/v1/get_return_requests?page=2",
      "https://portal.packzy.com/api/v1/get_return_request/1",
    ]);
  });

  it("reads return-aware status and tracking history", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const adapter = new SteadfastCourierAdapter(queuedFetch([
      jsonResponse({ status: 200, delivery_status: "cancelled_return_rider_assigned" }),
      jsonResponse({ status: 200, tracking: [{ consignment_id: 1424107, tracking_type: 2, text: "Parcel received at Dhanmondi hub.", created_at: "2026-09-20T11:22:04.000000Z" }] }),
    ], calls));
    await expect(adapter.getConsignmentStatusWithReturn(credentials, "1424107")).resolves.toEqual({ providerState: "cancelled_return_rider_assigned" });
    await expect(adapter.getTrackingHistory(credentials, "ORD-10231")).resolves.toMatchObject([{ externalId: "1424107", providerType: "2", message: "Parcel received at Dhanmondi hub." }]);
  });

  it("reads balances and paginated payout summaries without treating them as reconciliation", async () => {
    const adapter = new SteadfastCourierAdapter(queuedFetch([
      jsonResponse({ status: 200, current_balance: 12450 }),
      jsonResponse({ status: 1, payments: [{ payment_id: "SFC-88213", amount: 12450, method: "bKash", status_label: "Paid", created_at: "2026-09-18 11:04:22", paid_at: "2026-09-19 10:31:07" }] }),
      jsonResponse({ payment_id: "SFC-88213", consignments: [{ invoice: "ORD-10231" }] }),
    ]));
    await expect(adapter.getBalance(credentials)).resolves.toEqual({ amount: "12450", currency: "BDT" });
    await expect(adapter.listSettlements(credentials)).resolves.toMatchObject({ page: 1, items: [{ externalId: "SFC-88213", providerState: "paid" }] });
    await expect(adapter.getSettlement(credentials, "SFC-88213")).resolves.toMatchObject({ payment_id: "SFC-88213" });
  });

  it("rejects invalid pickup, return, and pagination inputs before requesting", async () => {
    let requested = false;
    const adapter = new SteadfastCourierAdapter((async () => { requested = true; return jsonResponse({}); }) as typeof fetch);
    await expect(adapter.requestPickup(credentials, { addressId: 0, policeStationId: 1, address: "Dhaka", contactNumber: "01712345678" })).rejects.toMatchObject({ details: { code: "validation" } });
    await expect(adapter.createReturn(credentials, { invoice: "ORD-1", trackingCode: "TRACK-1" })).rejects.toMatchObject({ details: { code: "validation" } });
    await expect(adapter.listSettlements(credentials, 0)).rejects.toMatchObject({ details: { code: "validation" } });
    expect(requested).toBe(false);
  });

  it("verifies signed webhook delivery events and preserves the idempotency key", async () => {
    const token = "webhook-secret";
    const body = JSON.stringify({ notification_type: "delivery_status", consignment_id: 1424107, invoice: "ORD-10231", status: "delivered", tracking_message: "Delivered", updated_at: "2026-09-25 13:30:00" });
    const adapter = new SteadfastCourierAdapter();
    await expect(adapter.verifyAndParseWebhook({ ...credentials, values: { ...credentials.values, webhookToken: token } }, {
      authorization: `Bearer ${token}`,
      signature: createHmac("sha256", token).update(body).digest("hex"),
      idempotencyKey: "steadfast-event-1",
      body,
    })).resolves.toMatchObject({ eventId: "steadfast-event-1", eventType: "delivery_status", externalId: "1424107", providerState: "delivered" });
  });

  it("rejects unsigned or incorrectly signed webhooks", async () => {
    const adapter = new SteadfastCourierAdapter();
    await expect(adapter.verifyAndParseWebhook({ ...credentials, values: { ...credentials.values, webhookToken: "token" } }, { authorization: "Bearer token", signature: "bad", idempotencyKey: "event-1", body: "{}" })).rejects.toMatchObject({ details: { code: "authentication" } });
  });
});
