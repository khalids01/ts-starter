import { describe, expect, it } from "bun:test";
import {
  CourierCredentialConfigurationError,
  DefaultCourierCredentialResolver,
  decryptCourierCredentials,
  encryptCourierCredentials,
  parseCourierCredentialKeyring,
  resolveSteadfastEnvironmentCredentials,
} from "../src/modules/delivery/credentials";

const credentials = {
  baseUrl: "https://portal.packzy.com/api/v1",
  values: { apiKey: "api-secret", secretKey: "secret-secret" },
};

function serializedKey(byte: number) {
  return Buffer.alloc(32, byte).toString("base64");
}

describe("courier credential encryption", () => {
  it("round trips credentials with authenticated connection context", () => {
    const keyring = parseCourierCredentialKeyring({
      activeVersion: 1,
      serializedKeys: JSON.stringify({ 1: serializedKey(1) }),
    });
    const encrypted = encryptCourierCredentials(
      credentials,
      "steadfast:connection-one",
      keyring,
    );

    expect(
      decryptCourierCredentials(
        encrypted,
        "steadfast:connection-one",
        keyring,
      ),
    ).toEqual(credentials);
    expect(() =>
      decryptCourierCredentials(
        encrypted,
        "steadfast:connection-two",
        keyring,
      ),
    ).toThrow("could not be decrypted");
  });

  it("decrypts an old key version during rotation and encrypts with the active version", () => {
    const oldKeyring = parseCourierCredentialKeyring({
      activeVersion: 1,
      serializedKeys: JSON.stringify({ 1: serializedKey(1) }),
    });
    const rotatingKeyring = parseCourierCredentialKeyring({
      activeVersion: 2,
      serializedKeys: JSON.stringify({
        1: serializedKey(1),
        2: serializedKey(2),
      }),
    });
    const oldEncrypted = encryptCourierCredentials(
      credentials,
      "steadfast:connection-one",
      oldKeyring,
    );

    expect(
      decryptCourierCredentials(
        oldEncrypted,
        "steadfast:connection-one",
        rotatingKeyring,
      ),
    ).toEqual(credentials);
    expect(
      encryptCourierCredentials(
        credentials,
        "steadfast:connection-one",
        rotatingKeyring,
      ).keyVersion,
    ).toBe(2);
  });

  it("rejects malformed keyrings", () => {
    expect(() =>
      parseCourierCredentialKeyring({
        activeVersion: 2,
        serializedKeys: JSON.stringify({ 1: serializedKey(1) }),
      }),
    ).toThrow("active key version");
    expect(() =>
      parseCourierCredentialKeyring({
        activeVersion: 1,
        serializedKeys: JSON.stringify({ 1: "too-short" }),
      }),
    ).toThrow("32 bytes");
  });

  it("accepts a single active base64 key for initial setup", () => {
    const keyring = parseCourierCredentialKeyring({
      activeVersion: 3,
      serializedKeys: serializedKey(3),
    });
    expect(keyring.activeVersion).toBe(3);
    expect(keyring.keys.get(3)?.byteLength).toBe(32);
  });
});

describe("courier credential resolution", () => {
  it("resolves the configured Steadfast environment without exposing env names as values", async () => {
    const environment = {
      STEAD_FAST_API_KEY: "api-secret",
      STEAD_FAST_SECRET_KEY: "secret-secret",
      STEAD_FAST_BASE_URL: "https://portal.packzy.com/api/v1/",
    };
    expect(resolveSteadfastEnvironmentCredentials(environment)).toEqual(
      credentials,
    );

    const resolver = new DefaultCourierCredentialResolver(environment);
    await expect(
      resolver.resolve({
        credentialContext: "steadfast:default",
        providerCode: "steadfast",
        credentialSource: "server_environment",
      }),
    ).resolves.toEqual(credentials);
  });

  it("fails closed for missing environment values or invalid source combinations", async () => {
    expect(() => resolveSteadfastEnvironmentCredentials({})).toThrow(
      CourierCredentialConfigurationError,
    );
    const resolver = new DefaultCourierCredentialResolver({
      STEAD_FAST_API_KEY: "api-secret",
      STEAD_FAST_SECRET_KEY: "secret-secret",
      STEAD_FAST_BASE_URL: "https://portal.packzy.com/api/v1",
    });
    await expect(
      resolver.resolve({
        credentialContext: "steadfast:default",
        providerCode: "steadfast",
        credentialSource: "server_environment",
        encryptedCredentials: {
          ciphertext: new Uint8Array(),
          nonce: new Uint8Array(),
          authTag: new Uint8Array(),
          keyVersion: 1,
        },
      }),
    ).rejects.toThrow("cannot contain encrypted credentials");
  });
});
