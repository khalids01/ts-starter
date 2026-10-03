import { describe, expect, it, mock } from "bun:test";
import { CourierWebhookService, CourierWebhookError } from "../src/modules/delivery/webhook.service";
import { CourierProviderRegistry } from "../src/modules/delivery/registry";
import type { CourierProviderAdapter } from "../src/modules/delivery/provider";

function harness(withParser = true) {
  const webhookEvents: any[] = [];
  const db: any = {
    courierConnection: { findUnique: mock(async () => ({ id: "connection-1", publicId: "public-1", credentialSource: "server_environment", provider: { code: "fake" } })) },
    webhookEvent: {
      create: mock(async ({ data }: any) => { if (webhookEvents.length) throw Object.assign(new Error("duplicate"), { code: "P2002" }); webhookEvents.push({ ...data, updatedAt: new Date() }); }),
      findUnique: mock(async () => webhookEvents[0] ? { ...webhookEvents[0] } : null),
      update: mock(async ({ data }: any) => Object.assign(webhookEvents[0], data)),
      updateMany: mock(async ({ where, data }: any) => {
        const row = webhookEvents[0];
        if (row.status !== where.status || row.updatedAt.getTime() !== where.updatedAt.getTime()) return { count: 0 };
        Object.assign(row, data, { updatedAt: new Date() });
        return { count: 1 };
      }),
    },
  };
  const adapter: CourierProviderAdapter = {
    code: "fake",
    capabilities: new Set(["createConsignment", "getConsignmentStatus"]),
    healthCheck: async () => ({ available: true }),
    createConsignment: async (_credentials, request) => ({ externalId: "1", invoice: request.invoice, trackingCode: null, providerState: "in_review" }),
    getConsignmentStatus: async () => ({ providerState: "pending" }),
    ...(withParser ? { verifyAndParseWebhook: mock(async (_credentials: any, input: any) => {
      if (input.authorization !== "Bearer token") throw new Error("unauthorized");
      return { eventId: "event-1", eventType: "delivery_status" as const, externalId: "external-1", providerState: "delivered", payload: { status: "delivered" } };
    }) } : {}),
  };
  const tracking = { record: mock(async () => ({ processed: true, duplicate: false, normalizedState: "delivered" })) };
  const service = new CourierWebhookService({ db, resolver: { resolve: mock(async () => ({ baseUrl: "https://example.test", values: { webhookToken: "token" } })) }, registry: new CourierProviderRegistry().register(adapter), tracking: tracking as any });
  return { service, tracking, webhookEvents };
}

describe("courier webhook pipeline", () => {
  it("authenticates, records through tracking, and deduplicates through shared webhook events", async () => {
    const { service, tracking, webhookEvents } = harness();
    expect(await service.process("public-1", "Bearer token", "signature", "event-1", "{}" )).toEqual({ received: true, duplicate: false });
    expect(await service.process("public-1", "Bearer token", "signature", "event-1", "{}" )).toEqual({ received: true, duplicate: true });
    expect(tracking.record).toHaveBeenCalledTimes(1);
    expect(webhookEvents[0]).toMatchObject({ provider: "courier:fake:public-1", status: "processed" });
  });

  it("allows only one concurrent retry to reclaim a failed event", async () => {
    const { service, tracking, webhookEvents } = harness();
    await service.process("public-1", "Bearer token", "signature", "event-1", "{}");
    webhookEvents[0].status = "failed";
    tracking.record.mockClear();
    const results = await Promise.all([
      service.process("public-1", "Bearer token", "signature", "event-1", "{}"),
      service.process("public-1", "Bearer token", "signature", "event-1", "{}"),
    ]);
    expect(results.filter((result) => !result.duplicate)).toHaveLength(1);
    expect(tracking.record).toHaveBeenCalledTimes(1);
  });

  it("fails closed for invalid authentication and unimplemented provider contracts", async () => {
    const authenticated = harness().service.process("public-1", "wrong", "signature", "event-1", "{}");
    await expect(authenticated).rejects.toBeInstanceOf(CourierWebhookError);
    await expect(harness(false).service.process("public-1", null, null, null, "{}")).rejects.toMatchObject({ status: 503 });
  });
});
