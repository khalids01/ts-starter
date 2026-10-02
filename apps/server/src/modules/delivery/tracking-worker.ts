import {
  COURIER_LEASE_MS,
  withCourierDeadline,
  CourierRequestDeadlineError,
} from "./request-deadline";
import prisma from "@db/server";
import { createConfiguredCourierCredentialResolver } from "./credentials.config";
import type { CourierCredentialResolver } from "./provider";
import { CourierProviderRequestError } from "./provider";
import { createCourierProviderRegistry } from "./registry.config";
import type { CourierProviderRegistry } from "./registry";
import {
  courierTrackingService,
  type CourierTrackingService,
} from "./tracking.service";

type Dependencies = Readonly<{
  db: any;
  resolver: CourierCredentialResolver;
  registry: CourierProviderRegistry;
  tracking: CourierTrackingService;
  now?: () => Date;
}>;

function encryptedConfig(row: any) {
  return {
    credentialContext: `${row.provider.code}:${row.publicId}`,
    providerCode: row.provider.code,
    credentialSource: row.credentialSource,
    encryptedCredentials:
      row.credentialCiphertext &&
      row.credentialNonce &&
      row.credentialAuthTag &&
      row.credentialKeyVersion
        ? {
            ciphertext: row.credentialCiphertext,
            nonce: row.credentialNonce,
            authTag: row.credentialAuthTag,
            keyVersion: row.credentialKeyVersion,
          }
        : undefined,
  };
}

export class CourierTrackingWorker {
  constructor(private readonly dependencies: Dependencies) {}

  async runOnce(limit = 50) {
    const consignments = await this.dependencies.db.courierConsignment.findMany(
      {
        where: {
          active: true,
          externalId: { not: null },
          connection: { enabled: true, healthState: "healthy" },
        },
        include: { connection: { include: { provider: true } } },
        orderBy: { updatedAt: "asc" },
        take: Math.min(Math.max(limit, 1), 100),
      },
    );
    let processed = 0;
    for (const consignment of consignments) {
      const now = this.dependencies.now?.() ?? new Date();
      const token = crypto.randomUUID();
      const leased = await this.dependencies.db.courierConnection.updateMany({
        where: {
          id: consignment.connectionId,
          enabled: true,
          healthState: "healthy",
          archivedAt: null,
          AND: [
            { OR: [{ cooldownUntil: null }, { cooldownUntil: { lte: now } }] },
            {
              OR: [
                { dispatchLeaseUntil: null },
                { dispatchLeaseUntil: { lt: now } },
              ],
            },
          ],
        },
        data: {
          dispatchLeaseToken: token,
          dispatchLeaseUntil: new Date(now.getTime() + COURIER_LEASE_MS),
        },
      });
      if (leased.count !== 1) continue;
      let releaseLease = false;
      try {
        const credentials = await this.dependencies.resolver.resolve(
          encryptedConfig(consignment.connection),
        );
        const adapter = this.dependencies.registry.require(
          consignment.connection.provider.code,
          "getConsignmentStatus",
        );
        const current = await this.dependencies.db.courierConnection.findUnique(
          { where: { id: consignment.connectionId } },
        );
        const beforeRequest = this.dependencies.now?.() ?? new Date();
        if (
          !current?.enabled ||
          current.archivedAt ||
          current.healthState !== "healthy" ||
          current.cooldownUntil > beforeRequest ||
          current.dispatchLeaseToken !== token ||
          current.dispatchLeaseUntil <= beforeRequest
        ) {
          releaseLease = true;
          continue;
        }
        const status = await withCourierDeadline((signal) =>
          adapter.getConsignmentStatusWithReturn
            ? adapter.getConsignmentStatusWithReturn(
                credentials,
                consignment.externalId!,
                { signal },
              )
            : adapter.getConsignmentStatus(
                credentials,
                consignment.externalId!,
                { signal },
              ),
        );
        releaseLease = true;
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
        releaseLease = !(error instanceof CourierRequestDeadlineError);
        if (
          error instanceof CourierProviderRequestError &&
          error.details.code === "authentication"
        ) {
          await this.dependencies.db.courierConnection.updateMany({
            where: { id: consignment.connectionId, dispatchLeaseToken: token },
            data: { healthState: "auth_failed", enabled: false },
          });
        }
        if (
          error instanceof CourierProviderRequestError &&
          error.details.code === "rate_limited"
        ) {
          const delay =
            Math.max(
              60,
              Math.min(error.details.retryAfterSeconds ?? 60, 86_400),
            ) * 1000;
          await this.dependencies.db.courierConnection.updateMany({
            where: { id: consignment.connectionId, dispatchLeaseToken: token },
            data: {
              cooldownUntil: new Date(
                (this.dependencies.now?.() ?? new Date()).getTime() + delay,
              ),
            },
          });
        }
      } finally {
        if (releaseLease)
          await this.dependencies.db.courierConnection.updateMany({
            where: { id: consignment.connectionId, dispatchLeaseToken: token },
            data: { dispatchLeaseToken: null, dispatchLeaseUntil: null },
          });
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
