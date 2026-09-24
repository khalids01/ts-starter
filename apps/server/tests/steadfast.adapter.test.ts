import { describe, expect, it } from "bun:test";
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
});
