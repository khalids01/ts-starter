import prisma from "@db/server";
import { createConfiguredCourierCredentialResolver } from "./credentials.config";
import type { CourierCredentialResolver } from "./provider";
import { createCourierProviderRegistry } from "./registry.config";
import type { CourierProviderRegistry } from "./registry";
import { courierTrackingService, type CourierTrackingService } from "./tracking.service";

const PROCESSING_TIMEOUT_MS = 10 * 60 * 1000;

type Dependencies = Readonly<{
  db: any;
  resolver: CourierCredentialResolver;
  registry: CourierProviderRegistry;
  tracking: CourierTrackingService;
}>;

export class CourierWebhookError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

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

function uniqueError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as any).code === "P2002";
}

export class CourierWebhookService {
  constructor(private readonly dependencies: Dependencies) {}

  async process(connectionPublicId: string, authorization: string | null, body: string) {
    const connection = await this.dependencies.db.courierConnection.findUnique({
      where: { publicId: connectionPublicId },
      include: { provider: true },
    });
    if (!connection) throw new CourierWebhookError("Courier webhook endpoint not found", 404);
    const adapter = this.dependencies.registry.get(connection.provider.code);
    if (!adapter.verifyAndParseWebhook) {
      throw new CourierWebhookError("Courier webhook contract is not configured", 503);
    }
    const credentials = await this.dependencies.resolver.resolve(encryptedConfig(connection));
    let event;
    try {
      event = await adapter.verifyAndParseWebhook(credentials, { authorization, body });
    } catch {
      throw new CourierWebhookError("Courier webhook authentication or payload is invalid", 401);
    }
    const provider = `courier:${connection.provider.code}:${connection.publicId}`;
    const claimed = await this.claim(provider, event.eventId, event.eventType);
    if (!claimed) return { received: true, duplicate: true };
    try {
      await this.dependencies.tracking.record({
        connectionId: connection.id,
        source: "webhook",
        eventKey: event.eventId,
        eventType: event.eventType,
        externalId: event.externalId,
        invoice: event.invoice,
        trackingCode: event.trackingCode,
        providerState: event.providerState ?? "unknown",
        payload: event.payload,
        occurredAt: event.occurredAt,
      });
      await this.dependencies.db.webhookEvent.update({
        where: { provider_eventId: { provider, eventId: event.eventId } },
        data: { status: "processed", processedAt: new Date(), errorMessage: null },
      });
      return { received: true, duplicate: false };
    } catch (error) {
      await this.dependencies.db.webhookEvent.update({
        where: { provider_eventId: { provider, eventId: event.eventId } },
        data: { status: "failed", errorMessage: (error instanceof Error ? error.message : "Courier webhook processing failed").slice(0, 1_000) },
      });
      throw new CourierWebhookError("Courier webhook could not be processed", 500);
    }
  }

  private async claim(provider: string, eventId: string, eventType: string) {
    try {
      await this.dependencies.db.webhookEvent.create({ data: { provider, eventId, eventType, status: "processing" } });
      return true;
    } catch (error) {
      if (!uniqueError(error)) throw error;
      const existing = await this.dependencies.db.webhookEvent.findUnique({ where: { provider_eventId: { provider, eventId } } });
      if (!existing) return false;
      const stale = existing.status === "processing" && existing.updatedAt.getTime() < Date.now() - PROCESSING_TIMEOUT_MS;
      if (existing.status !== "failed" && !stale) return false;
      await this.dependencies.db.webhookEvent.update({
        where: { provider_eventId: { provider, eventId } },
        data: { eventType, status: "processing", errorMessage: null, attemptCount: { increment: 1 } },
      });
      return true;
    }
  }
}

export const courierWebhookService = new CourierWebhookService({
  db: prisma,
  resolver: createConfiguredCourierCredentialResolver(),
  registry: createCourierProviderRegistry(),
  tracking: courierTrackingService,
});
