import { t } from "elysia";

export const UpdateAuthSettingsDto = t.Object({
  githubSignInEnabled: t.Boolean(),
  githubSignUpEnabled: t.Boolean(),
  googleSignInEnabled: t.Boolean(),
  googleSignUpEnabled: t.Boolean(),
  discordSignInEnabled: t.Boolean(),
  discordSignUpEnabled: t.Boolean(),
  magicLinkSignInEnabled: t.Boolean(),
  magicLinkSignUpEnabled: t.Boolean(),
});

export type UpdateAuthSettings = typeof UpdateAuthSettingsDto.static;
