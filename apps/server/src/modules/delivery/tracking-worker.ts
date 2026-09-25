import prisma from "@db/server";
import { createConfiguredCourierCredentialResolver } from "./credentials.config";
import type { CourierCredentialResolver } from "./provider";
import { CourierProviderRequestError } from "./providers/steadfast";
import { createCourierProviderRegistry } from "./registry.config";
import type { CourierProviderRegistry } from "./registry";
import { courierTrackingService, type CourierTrackingService } from "./tracking.service";

type Dependencies = Readonly<{ db: any; resolver: CourierCredentialResolver; registry: CourierProviderRegistry; tracking: CourierTrackingService }>;

function encryptedConfig(row: any) {
  return {
    credentialContext: `${row.provider.code}:${row.publicId}`,
    providerCode: row.provider.code,
    credentialSource: row.credentialSource,
    encryptedCredentials: row.credentialCiphertext && row.credentialNonce && row.credentialAuthTag && row.credentialKeyVersion
      ? { ciphertext: row.credentialCiphertext, nonce: row.credentialNonce, authTag: row.credentialAuthTag, keyVersion: row.credentialKeyVersion }
      : undefined,
  };
}

export class CourierTrackingWorker {
  constructor(private readonly dependencies: Dependencies) {}

  async runOnce(limit = 50) {
    const consignments = await this.dependencies.db.courierConsignment.findMany({
      where: { active: true, externalId: { not: null }, connection: { enabled: true, healthState: "healthy" } },
      include: { connection: { include: { provider: true } } },
      orderBy: { updatedAt: "asc" },
      take: Math.min(Math.max(limit, 1), 100),
    });
    let processed = 0;
    for (const consignment of consignments) {
      try {
        const credentials = await this.dependencies.resolver.resolve(encryptedConfig(consignment.connection));
        const adapter = this.dependencies.registry.require(consignment.connection.provider.code, "getConsignmentStatus");
        const status = adapter.getConsignmentStatusWithReturn
          ? await adapter.getConsignmentStatusWithReturn(credentials, consignment.externalId!)
          : await adapter.getConsignmentStatus(credentials, consignment.externalId!);
        await this.dependencies.tracking.record({
          connectionId: consignment.connectionId,
          source: "polling",
          eventKey: `status:${consignment.externalId}:${status.providerState.trim().toLowerCase()}`,
          eventType: "delivery_status",
          externalId: consignment.externalId!,
          providerState: status.providerState,
          payload: { providerState: status.providerState },
        });
        processed += 1;
      } catch (error) {
        if (error instanceof CourierProviderRequestError && error.details.code === "authentication") {
          await this.dependencies.db.courierConnection.update({ where: { id: consignment.connectionId }, data: { healthState: "auth_failed", enabled: false } });
        }
      }
    }
    return processed;
  }
}

export const courierTrackingWorker = new CourierTrackingWorker({
  db: prisma,
  resolver: createConfiguredCourierCredentialResolver(),
  registry: createCourierProviderRegistry(),
  tracking: courierTrackingService,
});

let timer: ReturnType<typeof setInterval> | undefined;
export function startCourierTrackingWorker() {
  if (timer || process.env.E2E_MODE === "true") return;
  const tick = () => void courierTrackingWorker.runOnce().catch(() => {});
  timer = setInterval(tick, 60_000);
  timer.unref?.();
  setTimeout(tick, 5_000).unref?.();
}
