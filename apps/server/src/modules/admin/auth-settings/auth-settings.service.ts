import { getAuthSettings, updateAuthSettings, type AuthSettingsInput } from "@db/server";

export const authSettingsService = {
  get: getAuthSettings,
  update(input: AuthSettingsInput) {
    return updateAuthSettings(input);
  },
};
