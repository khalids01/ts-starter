import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type AuthMethod =
  | "password"
  | "magic-link"
  | "github"
  | "google"
  | "discord";
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
const AuthSettingsContext = createContext<PublicAuthSettings | null>(null);

export function AuthSettingsProvider({
  settings,
  children,
}: {
  settings: PublicAuthSettings;
  children: ReactNode;
}) {
  return (
    <AuthSettingsContext.Provider value={settings}>
      {children}
    </AuthSettingsContext.Provider>
  );
}

export function rememberAuthMethod(method: AuthMethod) {
  window.localStorage.setItem(LAST_AUTH_METHOD_KEY, method);
}

export function useLastAuthMethod() {
  const [method, setMethod] = useState<AuthMethod | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(LAST_AUTH_METHOD_KEY);
    if (
      ["password", "magic-link", "github", "google", "discord"].includes(
        stored ?? ""
      )
    ) {
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
  const settings = useContext(AuthSettingsContext);

  if (!settings) {
    throw new Error(
      "usePublicAuthSettings must be used within an AuthSettingsProvider"
    );
  }

  return settings;
}

export function isAuthMethodEnabled(
  settings: PublicAuthSettings,
  method: AuthMethod,
  mode: AuthMode
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
