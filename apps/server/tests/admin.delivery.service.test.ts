import { describe, expect, it, mock } from "bun:test";
import {
  AdminDeliveryService,
  AdminDeliveryServiceError,
} from "../src/modules/admin/delivery/delivery.service";
import { parseCourierCredentialKeyring } from "../src/modules/delivery/credentials";
import type { CourierProviderAdapter } from "../src/modules/delivery/provider";
import { CourierProviderRegistry } from "../src/modules/delivery/registry";

const provider = {
  id: "provider-1",
  code: "steadfast",
  displayName: "Steadfast Courier",
  capabilities: ["createConsignment", "getConsignmentStatus"],
};

function createHarness(healthFails = false) {
  let connection: any;
  const activities: any[] = [];
  const create = mock(async ({ data, include }: any) => {
    connection = {
      id: "connection-1",
      ...data,
      provider,
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    expect(include).toEqual({ provider: true });
    return connection;
  });
  const update = mock(async ({ data }: any) => {
    connection = { ...connection, ...data, provider, updatedAt: new Date() };
    return connection;
  });
  const serviceCount = mock(async () => 0);
  const ruleCount = mock(async () => 0);
  const dispatchCount = mock(async () => 0);
  const consignmentCount = mock(async () => 0);
  const remove = mock(async () => connection);
  const db = {
    courierProvider: {
      findMany: mock(async () => [provider]),
      findUnique: mock(async () => provider),
    },
    courierConnection: {
      findMany: mock(async () => (connection ? [connection] : [])),
      findUnique: mock(async () => connection),
      create,
      update,
      delete: remove,
    },
    courierService: { count: serviceCount },
    courierRoutingRule: { count: ruleCount },
    courierDispatch: { count: dispatchCount },
    courierConsignment: { count: consignmentCount },
  };
  const adapter: CourierProviderAdapter = {
    code: "steadfast",
    capabilities: new Set(["createConsignment", "getConsignmentStatus"]),
    async healthCheck() {
      if (healthFails) throw new Error("provider unavailable");
      return { available: true };
    },
    async createConsignment(_credentials, request) {
      return {
        externalId: "1",
        invoice: request.invoice,
        trackingCode: null,
        providerState: "in_review",
      };
    },
    async getConsignmentStatus() {
      return { providerState: "pending" };
    },
  };
  const resolver = {
    resolve: mock(async () => ({
      baseUrl: "https://portal.packzy.com/api/v1",
      values: { apiKey: "api-secret", secretKey: "secret-secret" },
    })),
  };
  const keyring = parseCourierCredentialKeyring({
    activeVersion: 1,
    serializedKeys: JSON.stringify({
      1: Buffer.alloc(32, 1).toString("base64"),
    }),
  });
  const service = new AdminDeliveryService({
    db: db as any,
    activity: {
      record: mock(async (entry: any) => {
        activities.push(entry);
        return entry;
      }),
    },
    resolver,
    registry: new CourierProviderRegistry().register(adapter),
    keyring,
  });
  return { service, db, activities, resolver, serviceCount, ruleCount, dispatchCount, consignmentCount, remove, getConnection: () => connection };
}

describe("admin courier connection service", () => {
  it("lists provider availability without creating a connection", async () => {
    const { service, db } = createHarness();
    const providers = await service.listProviders();
    expect(providers[0]).not.toHaveProperty("apiKey");
    expect(db.courierConnection.create).not.toHaveBeenCalled();
  });

  it("encrypts submitted credentials and never returns secret material", async () => {
    const { service, getConnection, activities } = createHarness();
    const result = await service.createConnection(
      {
        providerCode: "steadfast",
        displayName: "Primary Steadfast",
        environment: "production",
        credentialSource: "encrypted_database",
        credentials: {
          apiKey: "api-secret",
          secretKey: "secret-secret",
          baseUrl: "https://portal.packzy.com/api/v1",
        },
      },
      "admin-1",
    );

    expect(result.enabled).toBe(false);
    expect(result.hasStoredCredentials).toBe(true);
    expect(JSON.stringify(result)).not.toContain("api-secret");
    expect(JSON.stringify(result)).not.toContain("credentialCiphertext");
    expect(getConnection().credentialCiphertext).toBeInstanceOf(Uint8Array);
    expect(activities[0].metadata).toEqual({
      connectionId: "connection-1",
      providerCode: "steadfast",
      credentialSource: "encrypted_database",
    });
  });

  it("requires a successful health check before enabling", async () => {
    const { service, resolver } = createHarness();
    await service.createConnection({
      providerCode: "steadfast",
      displayName: "Primary Steadfast",
      environment: "production",
      credentialSource: "encrypted_database",
      credentials: {
        apiKey: "api-secret",
        secretKey: "secret-secret",
        baseUrl: "https://portal.packzy.com/api/v1",
      },
    });
    await expect(service.setEnabled("connection-1", true)).rejects.toBeInstanceOf(
      AdminDeliveryServiceError,
    );
    const checked = await service.testConnection("connection-1", "admin-1");
    expect(checked.healthState).toBe("healthy");
    expect(resolver.resolve).toHaveBeenCalledTimes(1);
    const enabled = await service.setEnabled("connection-1", true, "admin-1");
    expect(enabled.enabled).toBe(true);
  });

  it("records degraded health without leaking provider failures", async () => {
    const { service, activities } = createHarness(true);
    await service.createConnection({
      providerCode: "steadfast",
      displayName: "Primary Steadfast",
      environment: "production",
      credentialSource: "encrypted_database",
      credentials: {
        apiKey: "api-secret",
        secretKey: "secret-secret",
        baseUrl: "https://portal.packzy.com/api/v1",
      },
    });
    const result = await service.testConnection("connection-1", "admin-1");
    expect(result.healthState).toBe("degraded");
    expect(activities.at(-1).metadata).toEqual({
      connectionId: "connection-1",
      healthState: "degraded",
      errorCode: "unknown",
    });
  });

  it("blocks archive while current delivery options depend on the connection", async () => {
    const { service, serviceCount } = createHarness();
    await service.createConnection({ providerCode: "steadfast", displayName: "Primary", environment: "production", credentialSource: "encrypted_database", credentials: { apiKey: "api", secretKey: "secret", baseUrl: "https://example.com" } });
    serviceCount.mockResolvedValue(2);
    await expect(service.archiveConnection("connection-1", "admin-1")).rejects.toMatchObject({
      code: "RESOURCE_IN_USE",
      dependencies: [expect.objectContaining({ type: "delivery_options", count: 2 })],
    });
  });

  it("archives and restores a connection without enabling it", async () => {
    const { service } = createHarness();
    await service.createConnection({ providerCode: "steadfast", displayName: "Primary", environment: "production", credentialSource: "encrypted_database", credentials: { apiKey: "api", secretKey: "secret", baseUrl: "https://example.com" } });
    const archived = await service.archiveConnection("connection-1", "admin-1");
    expect(archived.archivedAt).not.toBeNull();
    const restored = await service.restoreConnection("connection-1", "admin-1");
    expect(restored).toMatchObject({ archivedAt: null, enabled: false });
  });

  it("retains an archived connection referenced by historical shipments", async () => {
    const { service, dispatchCount, remove } = createHarness();
    await service.createConnection({ providerCode: "steadfast", displayName: "Primary", environment: "production", credentialSource: "encrypted_database", credentials: { apiKey: "api", secretKey: "secret", baseUrl: "https://example.com" } });
    await service.archiveConnection("connection-1", "admin-1");
    dispatchCount.mockResolvedValue(1);
    await expect(service.deleteConnection("connection-1", "admin-1")).rejects.toMatchObject({ code: "RESOURCE_IN_USE" });
    expect(remove).not.toHaveBeenCalled();
  });
});
