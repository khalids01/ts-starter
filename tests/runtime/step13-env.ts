import { getE2eServerEnvDefaults } from "../../packages/config/src/e2e.config";
import { resolve } from "node:path";

export function step13ProductionEnv(artifacts: string): Record<string, string> {
  return {
    PATH: process.env.PATH!, ...getE2eServerEnvDefaults(),
    NODE_ENV: "production", E2E_MODE: "false", COURIER_WORKERS_ENABLED: "false", HOST: "127.0.0.1",
    DATABASE_URL: process.env.DATABASE_URL!, REDIS_URL: process.env.REDIS_URL!,
    REDIS_KEY_PREFIX: `ts-starter:e2e:step13:${crypto.randomUUID()}:`,
    BETTER_AUTH_SECRET: "fictional-step13-only-auth-secret-never-use-in-a-shop",
    BETTER_AUTH_URL: "http://localhost:3013", CORS_ORIGIN: "http://localhost:3014", PORT: "3013",
    VITE_PORT: "3014", VITE_SERVER_URL: "http://localhost:3013", VITE_ENABLE_POLAR: "false", VITE_OWNER_SETUP_CHECK: "false",
    WEB_BUILD_DIR: resolve(artifacts, "web-dist"),
    POLAR_ACCESS_TOKEN: "", POLAR_WEBHOOK_SECRET: "", POLAR_SUCCESS_URL: "", AUTH_COOKIE_DOMAIN: "",
    SMTP_HOST: "", SMTP_PORT: "", EMAIL: "", EMAIL_PASSWORD: "", EMAIL_FROM: "",
    FILE_SERVER_URL: "", FILE_SERVER_API_KEY: "", FILE_SERVER_PUBLIC_URL: "",
    STEAD_FAST_API_KEY: "", STEAD_FAST_SECRET_KEY: "", STEAD_FAST_BASE_URL: "", STEAD_FAST_WEBHOOK_TOKEN: "",
    COURIER_CREDENTIAL_ACTIVE_KEY_VERSION: "", COURIER_CREDENTIAL_ENCRYPTION_KEYS: "",
  };
}
