import { describe, expect, it, mock } from "bun:test";
import { CourierDispatchWorker } from "../src/modules/delivery/dispatch-worker";
import { CourierProviderRegistry } from "../src/modules/delivery/registry";
import type { CourierProviderAdapter } from "../src/modules/delivery/provider";

function harness() {
  const operation: any = { id: "operation-1", consignmentId: "consignment-1", kind: "create", identity: "create:dispatch-1", state: "pending", attemptCount: 0, nextAttemptAt: new Date(0), leaseUntil: null };
  const consignment: any = { id: "consignment-1", dispatchId: "dispatch-1", requestSnapshot: { invoice: "ORD-1", recipientName: "Jahid", recipientPhone: "01712345678", recipientAddress: "Dhaka", codAmount: "100", currency: "BDT" }, connection: { publicId: "public-1", credentialSource: "server_environment", provider: { code: "fake" } }, dispatch: { id: "dispatch-1" } };
  const updates: any[] = [];
  const db: any = {
    courierOperation: {
      findMany: mock(async () => [operation]),
      updateMany: mock(async ({ data }: any) => { operation.state = data.state; operation.attemptCount += 1; operation.leaseUntil = data.leaseUntil; return { count: 1 }; }),
      findUnique: mock(async () => ({ ...operation, consignment })),
      update: mock(async ({ data }: any) => { Object.assign(operation, data); updates.push(["operation", data]); return operation; }),
    },
    courierConsignment: { update: mock(async ({ data }: any) => { Object.assign(consignment, data); updates.push(["consignment", data]); }) },
    courierDispatch: { update: mock(async ({ data }: any) => updates.push(["dispatch", data])) },
    courierException: { create: mock(async ({ data }: any) => updates.push(["exception", data])) },
  };
  db.$transaction = async (callback: any) => callback(db);
  const adapter: CourierProviderAdapter = {
    code: "fake",
    capabilities: new Set(["createConsignment", "getConsignmentStatus"]),
    healthCheck: async () => ({ available: true }),
    createConsignment: mock(async (_credentials, request) => ({ externalId: "external-1", invoice: request.invoice, trackingCode: "track-1", providerState: "in_review" })),
    getConsignmentStatus: async () => ({ providerState: "pending" }),
  };
  const worker = new CourierDispatchWorker({
    db,
    resolver: { resolve: mock(async () => ({ baseUrl: "https://example.test", values: {} })) },
    registry: new CourierProviderRegistry().register(adapter),
    now: () => new Date("2026-01-01T00:00:00Z"),
  });
  return { worker, operation, consignment, updates, adapter };
}

describe("courier dispatch outbox worker", () => {
  it("leases and completes a create operation exactly through its identity", async () => {
    const { worker, operation, consignment, updates, adapter } = harness();
    expect(await worker.runOnce()).toBe(1);
    expect(adapter.createConsignment).toHaveBeenCalledTimes(1);
    expect(operation.state).toBe("completed");
    expect(consignment).toMatchObject({ externalId: "external-1", trackingCode: "track-1", state: "submitted" });
    expect(updates).toContainEqual(["dispatch", { status: "submitted" }]);
  });
});
