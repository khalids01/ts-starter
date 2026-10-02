import { describe, expect, it, mock } from "bun:test";
mock.module("@db/server", () => ({ default: {} }));
mock.module("@env/server", () => ({ env: {} }));
const { CourierTrackingWorker } =
  await import("../src/modules/delivery/tracking-worker");
import { CourierProviderRegistry } from "../src/modules/delivery/registry";
import {
  CourierProviderRequestError,
  type CourierProviderAdapter,
} from "../src/modules/delivery/provider";
function harness() {
  const now = new Date("2026-10-03T00:00:00Z");
  const connection: any = {
    id: "connection-1",
    publicId: "public-1",
    credentialSource: "server_environment",
    provider: { code: "fake" },
    enabled: true,
    healthState: "healthy",
    archivedAt: null,
    cooldownUntil: null,
    dispatchLeaseUntil: null,
    dispatchLeaseToken: null,
  };
  const consignments = [
    {
      id: "consignment-1",
      connectionId: connection.id,
      externalId: "external-1",
      connection,
    },
  ];
  const updateMany = mock(async ({ where, data }: any) => {
    if (
      where.AND &&
      (!connection.enabled ||
        connection.healthState !== "healthy" ||
        connection.archivedAt ||
        connection.cooldownUntil > now ||
        connection.dispatchLeaseUntil > now)
    )
      return { count: 0 };
    if (
      where.dispatchLeaseToken &&
      where.dispatchLeaseToken !== connection.dispatchLeaseToken
    )
      return { count: 0 };
    Object.assign(connection, data);
    return { count: 1 };
  });
  const db: any = {
    courierConsignment: { findMany: mock(async () => consignments) },
    courierConnection: { updateMany, findUnique: mock(async () => connection) },
  };
  const adapter: CourierProviderAdapter = {
    code: "fake",
    capabilities: new Set(["getConsignmentStatus"]),
    healthCheck: async () => ({ available: true }),
    createConsignment: async () => {
      throw new Error();
    },
    getConsignmentStatus: mock(async () => ({ providerState: "delivered" })),
  };
  const tracking = { record: mock(async () => ({ processed: true })) };
  const resolver = {
    resolve: mock(async () => ({
      baseUrl: "https://example.test",
      values: {},
    })),
  };
  const worker = new CourierTrackingWorker({
    db,
    resolver,
    registry: new CourierProviderRegistry().register(adapter),
    tracking: tracking as any,
    now: () => now,
  });
  return { worker, connection, consignments, db, adapter, tracking, resolver };
}
describe("courier polling repair worker", () => {
  it("records normalized polling updates and releases the shared connection lease", async () => {
    const h = harness();
    expect(await h.worker.runOnce()).toBe(1);
    expect(h.tracking.record).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "polling",
        eventKey: "status:external-1:delivered",
      }),
    );
    expect(h.connection.dispatchLeaseToken).toBeNull();
  });
  it("authentication failure disables the connection and stops stale scanned siblings", async () => {
    const h = harness();
    h.consignments.push({
      ...h.consignments[0]!,
      id: "consignment-2",
      externalId: "external-2",
    });
    h.adapter.getConsignmentStatus = mock(async () => {
      throw new CourierProviderRequestError("bad auth", {
        code: "authentication",
        retryable: false,
      });
    });
    await h.worker.runOnce();
    expect(h.connection.enabled).toBe(false);
    expect(h.connection.healthState).toBe("auth_failed");
    expect(h.adapter.getConsignmentStatus).toHaveBeenCalledTimes(1);
  });
  it("polling observes dispatch leases and rate cooldowns", async () => {
    const h = harness();
    h.connection.dispatchLeaseUntil = new Date("2026-10-03T00:02:00Z");
    expect(await h.worker.runOnce()).toBe(0);
    expect(h.adapter.getConsignmentStatus).not.toHaveBeenCalled();
    h.connection.dispatchLeaseUntil = null;
    h.connection.cooldownUntil = new Date("2026-10-03T00:05:00Z");
    expect(await h.worker.runOnce()).toBe(0);
  });
  it("rereads connection state after credential resolution", async () => {
    const h = harness();
    h.resolver.resolve = async () => {
      h.connection.enabled = false;
      return { baseUrl: "https://example.test", values: {} };
    };
    await h.worker.runOnce();
    expect(h.adapter.getConsignmentStatus).not.toHaveBeenCalled();
    expect(h.connection.dispatchLeaseToken).toBeNull();
  });
  it("polling rate limit creates a durable connection cooldown", async () => {
    const h = harness();
    h.adapter.getConsignmentStatus = async () => {
      throw new CourierProviderRequestError("rate", {
        code: "rate_limited",
        retryable: true,
        retryAfterSeconds: 120,
      });
    };
    await h.worker.runOnce();
    expect(h.connection.cooldownUntil).toEqual(
      new Date("2026-10-03T00:02:00Z"),
    );
    expect(h.tracking.record).not.toHaveBeenCalled();
  });
});
