import { assertTestEnvironment } from "../../setup/assert-test-environment";
import type {
  ConsignmentResult,
  CreateConsignmentRequest,
  CourierRecoveryResult,
} from "../../../apps/server/src/modules/delivery/provider";
import type { PrismaClient } from "../../../packages/db/prisma/generated/client";

// This helper is also an executable worker-process fixture. Never initialize DB imports before the guard.
const target = assertTestEnvironment();
if (target.isRemote)
  throw new Error("Step 10 worker fixtures require local test-only targets");
const { PrismaClient: Client } =
  await import("../../../packages/db/prisma/generated/client");
const { PrismaPg } =
  await import("../../../packages/db/node_modules/@prisma/adapter-pg");
const { CourierProviderRegistry } =
  await import("../../../apps/server/src/modules/delivery/registry");

export function createPeerClient() {
  return new Client({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });
}
export function fakeWorkerDependencies(
  db: PrismaClient,
  connectionId: string,
  create: (request: CreateConsignmentRequest) => Promise<ConsignmentResult>,
  recover?: (invoice: string) => Promise<CourierRecoveryResult>,
) {
  // Only discovery is scoped: all actual transactions, leases and writes use real Prisma.
  const scoped = new Proxy(db, {
    get(client, property) {
      if (property === "courierOperation")
        return new Proxy(client.courierOperation, {
          get(model, key) {
            if (key === "findMany")
              return (args: any) =>
                model.findMany({
                  ...args,
                  where: {
                    AND: [args.where, { consignment: { connectionId } }],
                  },
                });
            const value = Reflect.get(model, key);
            return typeof value === "function" ? value.bind(model) : value;
          },
        });
      const value = Reflect.get(client, property);
      return typeof value === "function" ? value.bind(client) : value;
    },
  });
  const registry = new CourierProviderRegistry();
  // Require only the exact fictional provider associated with this connection.
  const wrappedRegistry = Object.create(registry) as InstanceType<
    typeof CourierProviderRegistry
  >;
  wrappedRegistry.require = (_code, capability) => {
    if (capability !== "createConsignment")
      throw new Error("Unexpected fictional capability");
    return {
      code: _code,
      displayName: "Fictional adapter",
      capabilities: new Set(["createConsignment"] as const),
      healthCheck: async () => ({ available: true }),
      getConsignmentStatus: async () => {
        throw new Error("Unexpected tracking call");
      },
      createConsignment: async (_credentials, request) => create(request),
      ...(recover
        ? {
            recoverConsignment: async (
              _credentials: unknown,
              invoice: string,
            ) => recover(invoice),
          }
        : {}),
    };
  };
  return {
    db: scoped,
    registry: wrappedRegistry,
    resolver: {
      resolve: async () => ({ baseUrl: "http://courier.invalid", values: {} }),
    },
  };
}
if (import.meta.main) {
  const connectionId = process.argv[2];
  if (!connectionId) throw new Error("Missing fictional connection ID");
  const db = createPeerClient();
  let calls = 0;
  try {
    const connection = await db.courierConnection.findUniqueOrThrow({
      where: { id: connectionId },
      include: { provider: true },
    });
    if (
      !connection.provider.code.startsWith("v3_") ||
      connection.environment !== "test" ||
      !connection.publicId.startsWith("v3-step10-")
    )
      throw new Error("Worker fixture rejects non-fictional connections");
    const { CourierDispatchWorker } =
      await import("../../../apps/server/src/modules/delivery/dispatch-worker");
    if (!process.send)
      throw new Error(
        "Worker fixture must be launched with IPC by the isolated integration suite",
      );
    await new Promise<void>((resolve) => {
      process.once("message", (message) => {
        if ((message as { type?: string }).type === "go") resolve();
      });
      process.send!({ type: "ready" });
    });
    await new CourierDispatchWorker(
      fakeWorkerDependencies(db, connectionId, async (request) => {
        calls++;
        await new Promise((resolve) => setTimeout(resolve, 150));
        return {
          invoice: request.invoice,
          externalId: `fake-${request.invoice}`,
          trackingCode: null,
          providerState: "pending",
        };
      }),
    ).runOnce();
    console.log(`V3_WORKER_RESULT ${JSON.stringify({ calls })}`);
  } finally {
    await db.$disconnect();
  }
}
