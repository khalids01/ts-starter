import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type {
  CourierConnectionCredentialConfig,
  CourierCredentialResolver,
  CourierCredentials,
} from "./provider";

const ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32;
const NONCE_BYTES = 12;

export type CourierCredentialKeyring = Readonly<{
  activeVersion: number;
  keys: ReadonlyMap<number, Uint8Array>;
}>;

export type EncryptedCourierCredentials = Readonly<{
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  authTag: Uint8Array;
  keyVersion: number;
}>;

export class CourierCredentialConfigurationError extends Error {}

function requiredValue(value: string | undefined, name: string) {
  const normalized = value?.trim();
  if (!normalized) {
    throw new CourierCredentialConfigurationError(
      `Courier credential configuration is missing ${name}`,
    );
  }
  return normalized;
}

function validCredentials(credentials: CourierCredentials): CourierCredentials {
  let baseUrl: URL;
  try {
    baseUrl = new URL(credentials.baseUrl);
  } catch {
    throw new CourierCredentialConfigurationError(
      "Courier credential configuration contains an invalid base URL",
    );
  }
  if (baseUrl.protocol !== "https:" && baseUrl.hostname !== "localhost") {
    throw new CourierCredentialConfigurationError(
      "Courier credential base URL must use HTTPS",
    );
  }
  const values = Object.fromEntries(
    Object.entries(credentials.values).map(([key, value]) => [
      key,
      requiredValue(value, key),
    ]),
  );
  if (Object.keys(values).length === 0) {
    throw new CourierCredentialConfigurationError(
      "Courier credential configuration contains no credentials",
    );
  }
  return {
    baseUrl: baseUrl.toString().replace(/\/$/, ""),
    values,
  };
}

export function parseCourierCredentialKeyring(input: {
  activeVersion?: number;
  serializedKeys?: string;
}): CourierCredentialKeyring {
  if (!input.activeVersion || !input.serializedKeys?.trim()) {
    throw new CourierCredentialConfigurationError(
      "Courier credential encryption keyring is not configured",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(input.serializedKeys);
  } catch {
    throw new CourierCredentialConfigurationError(
      "Courier credential encryption keys must be valid JSON",
    );
  }
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new CourierCredentialConfigurationError(
      "Courier credential encryption keys must be a version-to-key object",
    );
  }

  const keys = new Map<number, Uint8Array>();
  for (const [rawVersion, rawKey] of Object.entries(parsed)) {
    const version = Number(rawVersion);
    if (!Number.isInteger(version) || version <= 0 || typeof rawKey !== "string") {
      throw new CourierCredentialConfigurationError(
        "Courier credential encryption key versions must be positive integers",
      );
    }
    const key = Buffer.from(rawKey, "base64");
    if (key.byteLength !== KEY_BYTES) {
      throw new CourierCredentialConfigurationError(
        `Courier credential encryption key version ${version} must decode to 32 bytes`,
      );
    }
    keys.set(version, key);
  }
  if (!keys.has(input.activeVersion)) {
    throw new CourierCredentialConfigurationError(
      "Courier credential active key version is not present in the keyring",
    );
  }
  return { activeVersion: input.activeVersion, keys };
}

export function encryptCourierCredentials(
  credentials: CourierCredentials,
  credentialContext: string,
  keyring: CourierCredentialKeyring,
): EncryptedCourierCredentials {
  const key = keyring.keys.get(keyring.activeVersion);
  if (!key) {
    throw new CourierCredentialConfigurationError(
      "Courier credential active encryption key is unavailable",
    );
  }
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, nonce);
  cipher.setAAD(Buffer.from(requiredValue(credentialContext, "credential context")));
  const plaintext = Buffer.from(JSON.stringify(validCredentials(credentials)));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return {
    ciphertext,
    nonce,
    authTag: cipher.getAuthTag(),
    keyVersion: keyring.activeVersion,
  };
}

export function decryptCourierCredentials(
  encrypted: EncryptedCourierCredentials,
  credentialContext: string,
  keyring: CourierCredentialKeyring,
): CourierCredentials {
  const key = keyring.keys.get(encrypted.keyVersion);
  if (!key) {
    throw new CourierCredentialConfigurationError(
      `Courier credential encryption key version ${encrypted.keyVersion} is unavailable`,
    );
  }
  try {
    const decipher = createDecipheriv(ALGORITHM, key, encrypted.nonce);
    decipher.setAAD(
      Buffer.from(requiredValue(credentialContext, "credential context")),
    );
    decipher.setAuthTag(Buffer.from(encrypted.authTag));
    const plaintext = Buffer.concat([
      decipher.update(encrypted.ciphertext),
      decipher.final(),
    ]);
    return validCredentials(JSON.parse(plaintext.toString("utf8")));
  } catch (error) {
    if (error instanceof CourierCredentialConfigurationError) throw error;
    throw new CourierCredentialConfigurationError(
      "Courier credentials could not be decrypted",
    );
  }
}

export function resolveSteadfastEnvironmentCredentials(
  environment: Readonly<Record<string, string | undefined>>,
): CourierCredentials {
  return validCredentials({
    baseUrl: requiredValue(
      environment.STEAD_FAST_BASE_URL,
      "STEAD_FAST_BASE_URL",
    ),
    values: {
      apiKey: requiredValue(
        environment.STEAD_FAST_API_KEY,
        "STEAD_FAST_API_KEY",
      ),
      secretKey: requiredValue(
        environment.STEAD_FAST_SECRET_KEY,
        "STEAD_FAST_SECRET_KEY",
      ),
    },
  });
}

export class DefaultCourierCredentialResolver
  implements CourierCredentialResolver
{
  constructor(
    private readonly environment: Readonly<
      Record<string, string | undefined>
    >,
    private readonly keyring?: CourierCredentialKeyring,
  ) {}

  async resolve(
    connection: CourierConnectionCredentialConfig,
  ): Promise<CourierCredentials> {
    if (connection.credentialSource === "server_environment") {
      if (connection.encryptedCredentials) {
        throw new CourierCredentialConfigurationError(
          "Environment courier connections cannot contain encrypted credentials",
        );
      }
      if (connection.providerCode === "steadfast") {
        return resolveSteadfastEnvironmentCredentials(this.environment);
      }
      throw new CourierCredentialConfigurationError(
        `No environment credential resolver is registered for ${connection.providerCode}`,
      );
    }

    if (!connection.encryptedCredentials || !this.keyring) {
      throw new CourierCredentialConfigurationError(
        "Encrypted courier credentials are not configured",
      );
    }
    return decryptCourierCredentials(
      connection.encryptedCredentials,
      connection.credentialContext,
      this.keyring,
    );
  }
}
