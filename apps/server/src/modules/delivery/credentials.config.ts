import { env } from "@env/server";
import {
  DefaultCourierCredentialResolver,
  parseCourierCredentialKeyring,
} from "./credentials";

export function createConfiguredCourierCredentialResolver() {
  const hasEncryptionConfiguration =
    env.COURIER_CREDENTIAL_ACTIVE_KEY_VERSION !== undefined ||
    env.COURIER_CREDENTIAL_ENCRYPTION_KEYS !== undefined;
  const keyring = hasEncryptionConfiguration
    ? parseCourierCredentialKeyring({
        activeVersion: env.COURIER_CREDENTIAL_ACTIVE_KEY_VERSION,
        serializedKeys: env.COURIER_CREDENTIAL_ENCRYPTION_KEYS,
      })
    : undefined;

  return new DefaultCourierCredentialResolver(
    {
      STEAD_FAST_API_KEY: env.STEAD_FAST_API_KEY,
      STEAD_FAST_SECRET_KEY: env.STEAD_FAST_SECRET_KEY,
      STEAD_FAST_BASE_URL: env.STEAD_FAST_BASE_URL,
    },
    keyring,
  );
}
