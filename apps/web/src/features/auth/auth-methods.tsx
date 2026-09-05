import { useEffect, useState } from "react";

import { client } from "@/lib/client";

export type AuthMethod = "password" | "magic-link" | "github" | "google" | "discord";
export type AuthMode = "sign-in" | "sign-up";

export type PublicAuthSettings = {
  passwordSignInEnabled: boolean;
  passwordSignUpEnabled: boolean;
  magicLinkSignInEnabled: boolean;
  magicLinkSignUpEnabled: boolean;
  githubSignInEnabled: boolean;
  githubSignUpEnabled: boolean;
  googleSignInEnabled: boolean;
  googleSignUpEnabled: boolean;
  discordSignInEnabled: boolean;
  discordSignUpEnabled: boolean;
};

const LAST_AUTH_METHOD_KEY = "ts-starter:last-auth-method";

export function rememberAuthMethod(method: AuthMethod) {
  window.localStorage.setItem(LAST_AUTH_METHOD_KEY, method);
}

export function useLastAuthMethod() {
  const [method, setMethod] = useState<AuthMethod | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(LAST_AUTH_METHOD_KEY);
    if (["password", "magic-link", "github", "google", "discord"].includes(stored ?? "")) {
      setMethod(stored as AuthMethod);
    }
  }, []);

  const remember = (nextMethod: AuthMethod) => {
    rememberAuthMethod(nextMethod);
    setMethod(nextMethod);
  };

  return { lastAuthMethod: method, rememberAuthMethod: remember };
}

export function usePublicAuthSettings() {
  const [settings, setSettings] = useState<PublicAuthSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void client.auth.settings.get().then(({ data, error }) => {
      if (!active) return;
      if (error || !data) {
        setError("Authentication methods could not be loaded. Please refresh and try again.");
        return;
      }
      setSettings(data);
    });
    return () => { active = false; };
  }, []);

  return { settings, error };
}

export function isAuthMethodEnabled(
  settings: PublicAuthSettings,
  method: AuthMethod,
  mode: AuthMode,
) {
  const suffix = mode === "sign-in" ? "SignInEnabled" : "SignUpEnabled";
  const prefix = method === "magic-link" ? "magicLink" : method;
  const key = `${prefix}${suffix}` as keyof PublicAuthSettings;
  return settings[key];
}

export function LastUsedBadge({ visible }: { visible: boolean }) {
  return visible ? (
    <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
      Last used
    </span>
  ) : null;
}
