import prisma from "@db/server";
import { createConfiguredCourierCredentialResolver } from "./credentials.config";
import type { CourierCredentialResolver, CreateConsignmentRequest } from "./provider";
import { CourierProviderRequestError, type SteadfastCourierAdapter } from "./providers/steadfast";
import { createCourierProviderRegistry } from "./registry.config";
import type { CourierProviderRegistry } from "./registry";

const RETRY_DELAYS_MS = [60_000, 300_000, 900_000, 1_800_000, 1_800_000] as const;
const LEASE_MS = 60_000;

type Dependencies = Readonly<{
  db: any;
  resolver: CourierCredentialResolver;
  registry: CourierProviderRegistry;
  now?: () => Date;
}>;

function credentialConfig(connection: any) {
  return {
    credentialContext: `${connection.provider.code}:${connection.publicId}`,
    providerCode: connection.provider.code,
    credentialSource: connection.credentialSource,
    encryptedCredentials:
      connection.credentialCiphertext && connection.credentialNonce && connection.credentialAuthTag && connection.credentialKeyVersion
        ? {
            ciphertext: connection.credentialCiphertext,
            nonce: connection.credentialNonce,
            authTag: connection.credentialAuthTag,
            keyVersion: connection.credentialKeyVersion,
          }
        : undefined,
  };
}

export class CourierDispatchWorker {
  constructor(private readonly dependencies: Dependencies) {}

  async runOnce(limit = 10) {
    const now = this.dependencies.now?.() ?? new Date();
    const rows = await this.dependencies.db.courierOperation.findMany({
      where: {
        nextAttemptAt: { lte: now },
        OR: [
          { state: { in: ["pending", "retry"] }, leaseUntil: null },
          { state: { in: ["pending", "retry", "processing"] }, leaseUntil: { lt: now } },
        ],
      },
      orderBy: [{ nextAttemptAt: "asc" }, { createdAt: "asc" }],
      take: Math.min(Math.max(limit, 1), 50),
    });
    let processed = 0;
    for (const row of rows) {
      const claimed = await this.dependencies.db.courierOperation.updateMany({
        where: {
          id: row.id,
          OR: [
            { state: { in: ["pending", "retry"] }, leaseUntil: null },
            { state: { in: ["pending", "retry", "processing"] }, leaseUntil: { lt: now } },
          ],
        },
        data: { state: "processing", leaseUntil: new Date(now.getTime() + LEASE_MS), attemptCount: { increment: 1 } },
      });
      if (claimed.count !== 1) continue;
      await this.process(row.id);
      processed += 1;
    }
    return processed;
  }

  private async process(operationId: string) {
    const operation = await this.dependencies.db.courierOperation.findUnique({
      where: { id: operationId },
      include: { consignment: { include: { connection: { include: { provider: true } }, dispatch: true } } },
    });
    if (!operation || operation.kind !== "create") return;
    const { consignment } = operation;
    try {
      const credentials = await this.dependencies.resolver.resolve(credentialConfig(consignment.connection));
      const adapter = this.dependencies.registry.require(consignment.connection.provider.code, "createConsignment");
      const request = consignment.requestSnapshot as CreateConsignmentRequest;
      const steadfast = adapter as SteadfastCourierAdapter;
      const submission = typeof steadfast.createConsignmentWithRecovery === "function"
        ? await steadfast.createConsignmentWithRecovery(credentials, request)
        : { kind: "created" as const, consignment: await adapter.createConsignment(credentials, request) };
      if (submission.kind === "uncertain") {
        if (submission.reason === "status_not_found") throw new CourierProviderRequestError("Courier create result was not found during recovery", { code: "network", retryable: true });
        await this.manualReview(operation, "uncertain_submission");
        return;
      }
      await this.dependencies.db.$transaction(async (tx: any) => {
        await tx.courierConsignment.update({
          where: { id: consignment.id },
          data: { externalId: submission.consignment.externalId, trackingCode: submission.consignment.trackingCode, providerState: submission.consignment.providerState, state: "submitted", submittedAt: new Date() },
        });
        await tx.courierOperation.update({ where: { id: operation.id }, data: { state: "completed", leaseUntil: null, lastErrorCode: null } });
        await tx.courierDispatch.update({ where: { id: consignment.dispatchId }, data: { status: "submitted" } });
      });
    } catch (error) {
      const retryable = error instanceof CourierProviderRequestError && error.details.retryable;
      const code = error instanceof CourierProviderRequestError ? error.details.code : "configuration";
      const attempt = operation.attemptCount;
      if (!retryable || attempt > RETRY_DELAYS_MS.length) {
        await this.manualReview(operation, code);
        return;
      }
      const configuredDelay = RETRY_DELAYS_MS[attempt - 1] ?? RETRY_DELAYS_MS.at(-1)!;
      const retryDelay = error instanceof CourierProviderRequestError && error.details.retryAfterSeconds !== undefined
        ? Math.max(configuredDelay, error.details.retryAfterSeconds * 1000)
        : configuredDelay;
      await this.dependencies.db.courierOperation.update({
        where: { id: operation.id },
        data: { state: "retry", leaseUntil: null, lastErrorCode: code, nextAttemptAt: new Date((this.dependencies.now?.() ?? new Date()).getTime() + retryDelay) },
      });
    }
  }

  private async manualReview(operation: any, code: string) {
    await this.dependencies.db.$transaction(async (tx: any) => {
      await tx.courierOperation.update({ where: { id: operation.id }, data: { state: "manual_review", leaseUntil: null, lastErrorCode: code } });
      await tx.courierConsignment.update({ where: { id: operation.consignmentId }, data: { state: "manual_review" } });
      await tx.courierDispatch.update({ where: { id: operation.consignment.dispatchId }, data: { status: "manual_review" } });
      await tx.courierException.create({ data: { consignmentId: operation.consignmentId, kind: code, details: { operationIdentity: operation.identity } } });
    });
  }
}

export const courierDispatchWorker = new CourierDispatchWorker({
  db: prisma,
  resolver: createConfiguredCourierCredentialResolver(),
  registry: createCourierProviderRegistry(),
});

let timer: ReturnType<typeof setInterval> | undefined;

export function startCourierDispatchWorker() {
  if (timer || process.env.E2E_MODE === "true") return;
  const tick = () => void courierDispatchWorker.runOnce().catch(() => {
    // Operational details remain in the durable operation record; avoid leaking payloads.
  });
  timer = setInterval(tick, 15_000);
  timer.unref?.();
  tick();
}
