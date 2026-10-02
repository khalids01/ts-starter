import {
  COURIER_LEASE_MS,
  withCourierDeadline,
  CourierRequestDeadlineError,
} from "./request-deadline";
import { assertNicheShipmentReady } from "../ecommerce/niche/fulfillment";
import { markOrderUnits } from "../ecommerce/niche/gadgets";
import { orderHasUnsafeCommittedStock } from "../ecommerce/inventory/stock-policy";
import { assertShipmentClaim } from "./shipment-claim";
import { assertReviewedCourierRequest } from "./dispatch-snapshot";
import prisma from "@db/server";
import { createConfiguredCourierCredentialResolver } from "./credentials.config";
import type {
  CourierCredentialResolver,
  CourierRecoveryResult,
  ConsignmentResult,
  CreateConsignmentRequest,
} from "./provider";
import { CourierProviderRequestError } from "./provider";
import { createCourierProviderRegistry } from "./registry.config";
import type { CourierProviderRegistry } from "./registry";

const RETRY_DELAYS_MS = [
  60_000, 300_000, 900_000, 1_800_000, 1_800_000,
] as const;
const LEASE_MS = COURIER_LEASE_MS;

type Dependencies = Readonly<{
  db: any;
  resolver: CourierCredentialResolver;
  registry: CourierProviderRegistry;
  now?: () => Date;
  requestTimeoutMs?: number;
}>;

function credentialConfig(connection: any) {
  return {
    credentialContext: `${connection.provider.code}:${connection.publicId}`,
    providerCode: connection.provider.code,
    credentialSource: connection.credentialSource,
    encryptedCredentials:
      connection.credentialCiphertext &&
      connection.credentialNonce &&
      connection.credentialAuthTag &&
      connection.credentialKeyVersion
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

  private now() {
    return this.dependencies.now?.() ?? new Date();
  }

  async runOnce(limit = 10) {
    const now = this.now();
    const eligibleLease = {
      OR: [
        { state: { in: ["pending", "retry"] }, leaseUntil: null },
        {
          state: { in: ["pending", "retry", "processing"] },
          leaseUntil: { lt: now },
        },
      ],
    };
    const rows = await this.dependencies.db.courierOperation.findMany({
      where: { nextAttemptAt: { lte: now }, ...eligibleLease },
      include: { consignment: { select: { connectionId: true } } },
      orderBy: [{ nextAttemptAt: "asc" }, { createdAt: "asc" }],
      take: Math.min(Math.max(limit, 1), 50),
    });
    let processed = 0;
    for (const row of rows) {
      const token = crypto.randomUUID();
      const connectionId = row.consignment.connectionId;
      const leased = await this.dependencies.db.$transaction(
        async (tx: any) => {
          // One provider request per connection across runtimes, not just this process.
          const connection = await tx.courierConnection.updateMany({
            where: {
              id: connectionId,
              OR: [
                { dispatchLeaseUntil: null },
                { dispatchLeaseUntil: { lt: now } },
              ],
            },
            data: {
              dispatchLeaseToken: token,
              dispatchLeaseUntil: new Date(now.getTime() + LEASE_MS),
            },
          });
          if (connection.count !== 1) return false;
          const claimed = await tx.courierOperation.updateMany({
            where: { id: row.id, ...eligibleLease },
            data: {
              state: "processing",
              leaseToken: token,
              leaseUntil: new Date(now.getTime() + LEASE_MS),
              attemptCount: { increment: 1 },
            },
          });
          if (claimed.count !== 1)
            await tx.courierConnection.updateMany({
              where: { id: connectionId, dispatchLeaseToken: token },
              data: { dispatchLeaseToken: null, dispatchLeaseUntil: null },
            });
          return claimed.count === 1;
        },
      );
      if (!leased) continue;
      let releaseConnectionLease = false;
      try {
        releaseConnectionLease = (await this.process(row.id, token)) !== false;
        processed += 1;
      } finally {
        if (releaseConnectionLease)
          await this.dependencies.db.courierConnection.updateMany({
            where: { id: connectionId, dispatchLeaseToken: token },
            data: { dispatchLeaseToken: null, dispatchLeaseUntil: null },
          });
      }
    }
    return processed;
  }

  private async load(operationId: string) {
    return this.dependencies.db.courierOperation.findUnique({
      where: { id: operationId },
      include: {
        consignment: {
          include: {
            connection: { include: { provider: true } },
            service: true,
            dispatch: true,
            order: {
              include: {
                recovery: true,
                payments: true,
                refunds: true,
                addresses: true,
              },
            },
          },
        },
      },
    });
  }

  private owned(operation: any, token: string) {
    return (
      operation?.state === "processing" &&
      operation.leaseToken === token &&
      operation.leaseUntil > this.now()
    );
  }

  private async eligibility(operation: any) {
    const c = operation.consignment;
    if (operation.kind !== "create") return "unsupported_operation";
    if (
      !["confirmed", "processing"].includes(c.order.orderStatus) ||
      c.order.inventoryStatus !== "committed" ||
      c.order.recovery ||
      c.order.shippedAt ||
      c.order.deliveredAt
    )
      return "order_no_longer_dispatchable";
    if (
      !c.connection.enabled ||
      c.connection.archivedAt ||
      c.connection.healthState !== "healthy"
    )
      return "connection_unavailable";
    if (
      !c.service?.enabled ||
      c.service.archivedAt ||
      c.service.connectionId !== c.connectionId
    )
      return "service_unavailable";
    try {
      if (
        (
          await assertNicheShipmentReady(
            this.dependencies.db,
            c.orderId,
            this.now(),
          )
        ).freshFood
      )
        return "fresh_food_requires_local_delivery";
    } catch {
      return "niche_fulfillment_not_ready";
    }
    if (
      await orderHasUnsafeCommittedStock(
        this.dependencies.db,
        c.orderId,
        this.now(),
      )
    )
      return "inventory_expired_or_unsafe";
    try {
      await assertShipmentClaim(this.dependencies.db, c.orderId, c.dispatchId);
    } catch {
      return "shipment_claim_missing_or_changed";
    }
    try {
      assertReviewedCourierRequest(c.order, c.requestSnapshot);
    } catch {
      return "payment_or_address_review_changed";
    }
    try {
      this.dependencies.registry.require(
        c.connection.provider.code,
        "createConsignment",
      );
    } catch {
      return "provider_capability_unavailable";
    }
    return null;
  }

  private async process(operationId: string, token: string) {
    let operation = await this.load(operationId);
    if (!this.owned(operation, token)) return;
    let invalid = await this.eligibility(operation);
    if (invalid) {
      await this.manualReview(operation, token, invalid);
      return;
    }
    const connection = operation.consignment.connection;
    if (connection.cooldownUntil > this.now()) {
      await this.retry(
        operation,
        token,
        "connection_cooldown",
        connection.cooldownUntil,
      );
      return;
    }
    let submitted = false;
    try {
      const credentials = await this.dependencies.resolver.resolve(
        credentialConfig(connection),
      );
      const adapter = this.dependencies.registry.require(
        connection.provider.code,
        "createConsignment",
      );
      // Credential resolution is asynchronous: reread all gates immediately before HTTP.
      operation = await this.load(operationId);
      if (!this.owned(operation, token)) return;
      invalid = await this.eligibility(operation);
      if (invalid) {
        await this.manualReview(operation, token, invalid);
        return;
      }
      const request = operation.consignment
        .requestSnapshot as CreateConsignmentRequest;
      if (operation.attemptCount > 1 && !adapter.recoverConsignment) {
        await this.manualReview(operation, token, "recovery_not_supported");
        return;
      }
      const response = await withCourierDeadline<
        ConsignmentResult | CourierRecoveryResult
      >(
        (signal) =>
          operation.attemptCount > 1
            ? adapter.recoverConsignment!(credentials, request.invoice, {
                signal,
              })
            : adapter.createConsignment(credentials, request, { signal }),
        this.dependencies.requestTimeoutMs,
      );
      let result;
      if ("kind" in response) {
        if (response.kind !== "found") {
          await this.manualReview(operation, token, "uncertain_submission");
          return;
        }
        result = response.consignment;
      } else result = response;
      submitted = true;
      if (!result.externalId || result.invoice !== request.invoice) {
        await this.manualReview(operation, token, "invalid_response");
        return;
      }
      await this.dependencies.db.$transaction(async (tx: any) => {
        const claimed = await tx.courierOperation.updateMany({
          where: {
            id: operation.id,
            state: "processing",
            leaseToken: token,
            leaseUntil: { gt: this.now() },
          },
          data: {
            state: "completed",
            leaseToken: null,
            leaseUntil: null,
            lastErrorCode: null,
          },
        });
        if (claimed.count !== 1) return;
        await tx.courierConsignment.update({
          where: { id: operation.consignmentId },
          data: {
            externalId: result.externalId,
            trackingCode: result.trackingCode,
            providerState: result.providerState,
            state: "submitted",
            submittedAt: this.now(),
          },
        });
        await tx.courierDispatch.update({
          where: { id: operation.consignment.dispatchId },
          data: { status: "submitted" },
        });
        await markOrderUnits(tx, operation.consignment.orderId, "shipped");
      });
    } catch (error) {
      if (submitted) {
        await this.manualReview(
          operation,
          token,
          "provider_success_local_save_failed",
        );
        return;
      }
      const details =
        error instanceof CourierProviderRequestError ? error.details : null;
      const code = details?.code ?? "configuration";
      if (code === "authentication") {
        await this.dependencies.db.courierConnection.updateMany({
          where: {
            id: operation.consignment.connectionId,
            dispatchLeaseToken: token,
          },
          data: { enabled: false, healthState: "auth_failed" },
        });
      }
      if (
        !details?.retryable ||
        operation.attemptCount > RETRY_DELAYS_MS.length
      ) {
        await this.manualReview(operation, token, code);
        return;
      }
      const delay = Math.max(
        RETRY_DELAYS_MS[operation.attemptCount - 1] ?? RETRY_DELAYS_MS.at(-1)!,
        Math.min(details.retryAfterSeconds ?? 0, 86_400) * 1000,
      );
      const next = new Date(this.now().getTime() + delay);
      if (code === "rate_limited")
        await this.dependencies.db.courierConnection.updateMany({
          where: {
            id: operation.consignment.connectionId,
            dispatchLeaseToken: token,
          },
          data: { cooldownUntil: next },
        });
      await this.retry(operation, token, code, next);
      if (error instanceof CourierRequestDeadlineError) return false;
    }
  }

  private async retry(
    operation: any,
    token: string,
    code: string,
    nextAttemptAt: Date,
  ) {
    await this.dependencies.db.courierOperation.updateMany({
      where: {
        id: operation.id,
        state: "processing",
        leaseToken: token,
        leaseUntil: { gt: this.now() },
      },
      data: {
        state: "retry",
        leaseToken: null,
        leaseUntil: null,
        lastErrorCode: code,
        nextAttemptAt,
        ...(code === "connection_cooldown"
          ? { attemptCount: { decrement: 1 } }
          : {}),
      },
    });
  }

  private async manualReview(operation: any, token: string, code: string) {
    await this.dependencies.db.$transaction(async (tx: any) => {
      const changed = await tx.courierOperation.updateMany({
        where: {
          id: operation.id,
          state: "processing",
          leaseToken: token,
          leaseUntil: { gt: this.now() },
        },
        data: {
          state: "manual_review",
          leaseToken: null,
          leaseUntil: null,
          lastErrorCode: code,
        },
      });
      if (changed.count !== 1) return;
      await tx.courierConsignment.update({
        where: { id: operation.consignmentId },
        data: { state: "manual_review" },
      });
      await tx.courierDispatch.update({
        where: { id: operation.consignment.dispatchId },
        data: { status: "manual_review" },
      });
      await tx.courierException.create({
        data: {
          consignmentId: operation.consignmentId,
          kind: code,
          details: { operationIdentity: operation.identity },
        },
      });
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
  const tick = () =>
    void courierDispatchWorker.runOnce().catch(() => {
      // Operational details remain in the durable operation record; avoid leaking payloads.
    });
  timer = setInterval(tick, 15_000);
  timer.unref?.();
  tick();
}
