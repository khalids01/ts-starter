import { randomUUID } from "node:crypto";
import prisma from "@db/server";
import { activityService } from "../activity/activity.service";
import {
  CourierCredentialConfigurationError,
  encryptCourierCredentials,
  type CourierCredentialKeyring,
} from "../../delivery/credentials";
import {
  createConfiguredCourierCredentialResolver,
  getConfiguredCourierCredentialKeyring,
} from "../../delivery/credentials.config";
import type { CourierCredentialResolver } from "../../delivery/provider";
import { CourierProviderRequestError } from "../../delivery/providers/steadfast";
import { createCourierProviderRegistry } from "../../delivery/registry.config";
import type { CourierProviderRegistry } from "../../delivery/registry";
import type {
  CreateCourierConnectionInput,
  UpdateCourierConnectionInput,
} from "./delivery.dto";

export class AdminDeliveryServiceError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

type DeliveryPrisma = Pick<typeof prisma, "courierProvider" | "courierConnection">;

type DeliveryActivity = Pick<typeof activityService, "record">;

type ServiceDependencies = Readonly<{
  db: DeliveryPrisma;
  activity: DeliveryActivity;
  resolver: CourierCredentialResolver;
  registry: CourierProviderRegistry;
  keyring?: CourierCredentialKeyring;
}>;

function environmentAvailable(providerCode: string) {
  if (providerCode !== "steadfast") return false;
  return Boolean(
    process.env.STEAD_FAST_API_KEY?.trim() &&
      process.env.STEAD_FAST_SECRET_KEY?.trim() &&
      process.env.STEAD_FAST_BASE_URL?.trim(),
  );
}

function prismaBytes(value: Uint8Array) {
  return Uint8Array.from(value);
}

function mapProvider(row: any) {
  return {
    id: row.id,
    code: row.code,
    displayName: row.displayName,
    capabilities: row.capabilities,
    environmentConfigurationAvailable: environmentAvailable(row.code),
  };
}

function mapConnection(row: any) {
  return {
    id: row.id,
    publicId: row.publicId,
    displayName: row.displayName,
    provider: mapProvider(row.provider),
    enabled: row.enabled,
    environment: row.environment,
    priority: row.priority,
    credentialSource: row.credentialSource,
    hasStoredCredentials:
      row.credentialSource === "encrypted_database" &&
      Boolean(row.credentialCiphertext),
    healthState: row.healthState,
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : row.updatedAt,
  };
}

function encryptedConfig(row: any) {
  const encryptedCredentials =
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
      : undefined;
  return {
    credentialContext: `${row.provider.code}:${row.publicId}`,
    providerCode: row.provider.code,
    credentialSource: row.credentialSource,
    encryptedCredentials,
  };
}

export class AdminDeliveryService {
  constructor(private readonly dependencies: ServiceDependencies) {}

  async listProviders() {
    const rows = await this.dependencies.db.courierProvider.findMany({
      orderBy: { displayName: "asc" },
    });
    return rows.map(mapProvider);
  }

  async listConnections() {
    const rows = await this.dependencies.db.courierConnection.findMany({
      include: { provider: true },
      orderBy: [{ priority: "asc" }, { displayName: "asc" }],
    });
    return rows.map(mapConnection);
  }

  async createConnection(
    input: CreateCourierConnectionInput,
    actorUserId?: string,
  ) {
    const providerCode = input.providerCode.trim().toLowerCase();
    this.dependencies.registry.get(providerCode);
    const provider = await this.dependencies.db.courierProvider.findUnique({
      where: { code: providerCode },
    });
    if (!provider) throw new AdminDeliveryServiceError("Courier provider not found", 404);

    const publicId = randomUUID();
    let encrypted:
      | ReturnType<typeof encryptCourierCredentials>
      | undefined;
    if (input.credentialSource === "server_environment") {
      if (input.credentials) {
        throw new AdminDeliveryServiceError(
          "Environment connections cannot include submitted credentials",
        );
      }
      if (!environmentAvailable(providerCode)) {
        throw new AdminDeliveryServiceError(
          "The server environment configuration is unavailable",
          409,
        );
      }
    } else {
      if (!input.credentials) {
        throw new AdminDeliveryServiceError(
          "Credentials are required for a new courier connection",
        );
      }
      if (!this.dependencies.keyring) {
        throw new AdminDeliveryServiceError(
          "Courier credential encryption is not configured",
          503,
        );
      }
      encrypted = encryptCourierCredentials(
        {
          baseUrl: input.credentials.baseUrl,
          values: {
            apiKey: input.credentials.apiKey,
            secretKey: input.credentials.secretKey,
          },
        },
        `${providerCode}:${publicId}`,
        this.dependencies.keyring,
      );
    }

    const connection = await this.dependencies.db.courierConnection.create({
      data: {
        providerId: provider.id,
        publicId,
        displayName: input.displayName.trim(),
        enabled: false,
        environment: input.environment,
        priority: input.priority ?? 0,
        credentialSource: input.credentialSource,
        credentialCiphertext: encrypted
          ? prismaBytes(encrypted.ciphertext)
          : undefined,
        credentialNonce: encrypted ? prismaBytes(encrypted.nonce) : undefined,
        credentialAuthTag: encrypted
          ? prismaBytes(encrypted.authTag)
          : undefined,
        credentialKeyVersion: encrypted?.keyVersion,
        healthState: "unchecked",
      },
      include: { provider: true },
    });
    await this.dependencies.activity.record({
      type: "courier.connection.created",
      actorUserId,
      message: `Created courier connection ${connection.displayName}`,
      metadata: {
        connectionId: connection.id,
        providerCode,
        credentialSource: input.credentialSource,
      },
    });
    return mapConnection(connection);
  }

  async updateConnection(
    id: string,
    input: UpdateCourierConnectionInput,
    actorUserId?: string,
  ) {
    const existing = await this.getConnectionRow(id);
    let encrypted:
      | ReturnType<typeof encryptCourierCredentials>
      | undefined;
    if (input.credentials) {
      if (existing.credentialSource !== "encrypted_database") {
        throw new AdminDeliveryServiceError(
          "Environment connection credentials cannot be replaced",
        );
      }
      if (!this.dependencies.keyring) {
        throw new AdminDeliveryServiceError(
          "Courier credential encryption is not configured",
          503,
        );
      }
      encrypted = encryptCourierCredentials(
        {
          baseUrl: input.credentials.baseUrl,
          values: {
            apiKey: input.credentials.apiKey,
            secretKey: input.credentials.secretKey,
          },
        },
        `${existing.provider.code}:${existing.publicId}`,
        this.dependencies.keyring,
      );
    }
    const connection = await this.dependencies.db.courierConnection.update({
      where: { id },
      data: {
        ...(input.displayName === undefined
          ? {}
          : { displayName: input.displayName.trim() }),
        ...(input.environment === undefined
          ? {}
          : { environment: input.environment }),
        ...(input.priority === undefined ? {} : { priority: input.priority }),
        ...(encrypted
          ? {
              credentialCiphertext: prismaBytes(encrypted.ciphertext),
              credentialNonce: prismaBytes(encrypted.nonce),
              credentialAuthTag: prismaBytes(encrypted.authTag),
              credentialKeyVersion: encrypted.keyVersion,
              healthState: "unchecked",
            }
          : {}),
      },
      include: { provider: true },
    });
    await this.dependencies.activity.record({
      type: input.credentials
        ? "courier.connection.credentials_replaced"
        : "courier.connection.updated",
      actorUserId,
      message: `Updated courier connection ${connection.displayName}`,
      metadata: {
        connectionId: connection.id,
        credentialsReplaced: Boolean(input.credentials),
      },
    });
    return mapConnection(connection);
  }

  async testConnection(id: string, actorUserId?: string) {
    const existing = await this.getConnectionRow(id);
    let healthState = "healthy";
    let errorCode: string | undefined;
    try {
      const credentials = await this.dependencies.resolver.resolve(
        encryptedConfig(existing),
      );
      const adapter = this.dependencies.registry.get(existing.provider.code);
      await adapter.healthCheck(credentials);
    } catch (error) {
      healthState =
        error instanceof CourierProviderRequestError &&
        error.details.code === "authentication"
          ? "auth_failed"
          : "degraded";
      errorCode =
        error instanceof CourierProviderRequestError
          ? error.details.code
          : error instanceof CourierCredentialConfigurationError
            ? "configuration"
            : "unknown";
    }
    const connection = await this.dependencies.db.courierConnection.update({
      where: { id },
      data: { healthState },
      include: { provider: true },
    });
    await this.dependencies.activity.record({
      type: "courier.connection.health_checked",
      actorUserId,
      severity: healthState === "healthy" ? "info" : "warning",
      message: `Checked courier connection ${connection.displayName}`,
      metadata: {
        connectionId: connection.id,
        healthState,
        ...(errorCode ? { errorCode } : {}),
      },
    });
    return mapConnection(connection);
  }

  async setEnabled(id: string, enabled: boolean, actorUserId?: string) {
    const existing = await this.getConnectionRow(id);
    if (enabled && existing.healthState !== "healthy") {
      throw new AdminDeliveryServiceError(
        "Test the courier connection successfully before enabling it",
        409,
      );
    }
    const connection = await this.dependencies.db.courierConnection.update({
      where: { id },
      data: { enabled },
      include: { provider: true },
    });
    await this.dependencies.activity.record({
      type: enabled
        ? "courier.connection.enabled"
        : "courier.connection.disabled",
      actorUserId,
      message: `${enabled ? "Enabled" : "Disabled"} courier connection ${connection.displayName}`,
      metadata: { connectionId: connection.id },
    });
    return mapConnection(connection);
  }

  private async getConnectionRow(id: string) {
    const connection = await this.dependencies.db.courierConnection.findUnique({
      where: { id },
      include: { provider: true },
    });
    if (!connection) {
      throw new AdminDeliveryServiceError("Courier connection not found", 404);
    }
    return connection;
  }
}

export const adminDeliveryService = new AdminDeliveryService({
  db: prisma,
  activity: activityService,
  resolver: createConfiguredCourierCredentialResolver(),
  registry: createCourierProviderRegistry(),
  keyring: getConfiguredCourierCredentialKeyring(),
});
