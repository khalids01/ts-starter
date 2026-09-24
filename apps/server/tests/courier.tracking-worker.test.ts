import { describe, expect, it, mock } from "bun:test";
import { CourierTrackingWorker } from "../src/modules/delivery/tracking-worker";
import { CourierProviderRegistry } from "../src/modules/delivery/registry";
import { CourierProviderRequestError } from "../src/modules/delivery/providers/steadfast";
import type { CourierProviderAdapter } from "../src/modules/delivery/provider";

describe("courier polling repair worker", () => {
  it("records normalized polling updates", async () => {
    const connection = { id: "connection-1", publicId: "public-1", credentialSource: "server_environment", provider: { code: "fake" } };
    const db: any = { courierConsignment: { findMany: mock(async () => [{ id: "consignment-1", connectionId: connection.id, externalId: "external-1", connection }]) }, courierConnection: { update: mock(async () => {}) } };
    const adapter: CourierProviderAdapter = { code: "fake", capabilities: new Set(["getConsignmentStatus"]), healthCheck: async () => ({ available: true }), createConsignment: async () => { throw new Error(); }, getConsignmentStatus: mock(async () => ({ providerState: "delivered" })) };
    const tracking = { record: mock(async () => ({ processed: true })) };
    const worker = new CourierTrackingWorker({ db, resolver: { resolve: mock(async () => ({ baseUrl: "https://example.test", values: {} })) }, registry: new CourierProviderRegistry().register(adapter), tracking: tracking as any });
    expect(await worker.runOnce()).toBe(1);
    expect(tracking.record).toHaveBeenCalledWith(expect.objectContaining({ source: "polling", eventKey: "status:external-1:delivered" }));
  });

  it("disables a connection after provider authentication failure", async () => {
    const connection = { id: "connection-1", publicId: "public-1", credentialSource: "server_environment", provider: { code: "fake" } };
    const update = mock(async () => {});
    const db: any = { courierConsignment: { findMany: mock(async () => [{ connectionId: connection.id, externalId: "external-1", connection }]) }, courierConnection: { update } };
    const adapter: CourierProviderAdapter = { code: "fake", capabilities: new Set(["getConsignmentStatus"]), healthCheck: async () => ({ available: true }), createConsignment: async () => { throw new Error(); }, getConsignmentStatus: async () => { throw new CourierProviderRequestError("bad auth", { code: "authentication", retryable: false }); } };
    const worker = new CourierTrackingWorker({ db, resolver: { resolve: mock(async () => ({ baseUrl: "https://example.test", values: {} })) }, registry: new CourierProviderRegistry().register(adapter), tracking: { record: mock(async () => ({})) } as any });
    await worker.runOnce();
    expect(update).toHaveBeenCalledWith({ where: { id: "connection-1" }, data: { healthState: "auth_failed", enabled: false } });
  });
});
