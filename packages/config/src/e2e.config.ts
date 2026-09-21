/**
 * Public local-only defaults for the disposable E2E environment.
 * Secrets and connection URLs stay in tests/env/.env, which is ignored.
 */
export const e2eRuntimeConfig = {
  serverPort: 3000,
  webPort: 3001,
  serverUrl: "http://localhost:3000",
  webUrl: "http://localhost:3001",
  redisKeyPrefix: "ts-starter:e2e:",
  oauthPlaceholders: {
    githubClientId: "e2e-github-client-id",
    githubClientSecret: "e2e-github-client-secret",
    googleClientId: "e2e-google-client-id",
    googleClientSecret: "e2e-google-client-secret",
    discordClientId: "e2e-discord-client-id",
    discordClientSecret: "e2e-discord-client-secret",
  },
} as const;

export function getE2eServerEnvDefaults() {
  return {
    REDIS_KEY_PREFIX: e2eRuntimeConfig.redisKeyPrefix,
    BETTER_AUTH_URL: e2eRuntimeConfig.serverUrl,
    CORS_ORIGIN: e2eRuntimeConfig.webUrl,
    ENABLE_POLAR: "false",
    OWNER_SETUP_CHECK: "false",
    GITHUB_CLIENT_ID: e2eRuntimeConfig.oauthPlaceholders.githubClientId,
    GITHUB_CLIENT_SECRET: e2eRuntimeConfig.oauthPlaceholders.githubClientSecret,
    GOOGLE_CLIENT_ID: e2eRuntimeConfig.oauthPlaceholders.googleClientId,
    GOOGLE_CLIENT_SECRET: e2eRuntimeConfig.oauthPlaceholders.googleClientSecret,
    DISCORD_CLIENT_ID: e2eRuntimeConfig.oauthPlaceholders.discordClientId,
    DISCORD_CLIENT_SECRET: e2eRuntimeConfig.oauthPlaceholders.discordClientSecret,
  } as const;
}
