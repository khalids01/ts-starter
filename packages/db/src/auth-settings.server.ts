import prisma from "./client.server";

const AUTH_SETTINGS_ID = "default";

export type AuthMethod = "github" | "magic-link";

export type AuthSettingsInput = {
  githubSignInEnabled: boolean;
  githubSignUpEnabled: boolean;
  magicLinkSignInEnabled: boolean;
  magicLinkSignUpEnabled: boolean;
};

const defaults: AuthSettingsInput = {
  githubSignInEnabled: true,
  githubSignUpEnabled: true,
  magicLinkSignInEnabled: true,
  magicLinkSignUpEnabled: true,
};

export async function getAuthSettings() {
  return prisma.authSettings.upsert({
    where: { id: AUTH_SETTINGS_ID },
    update: {},
    create: { id: AUTH_SETTINGS_ID, ...defaults },
  });
}

export async function updateAuthSettings(input: AuthSettingsInput) {
  return prisma.authSettings.upsert({
    where: { id: AUTH_SETTINGS_ID },
    update: input,
    create: { id: AUTH_SETTINGS_ID, ...input },
  });
}

export async function recordUserAuthMethod(userId: string, method: AuthMethod) {
  return prisma.userAuthMethod.upsert({
    where: { userId_method: { userId, method } },
    update: {},
    create: { userId, method },
  });
}
