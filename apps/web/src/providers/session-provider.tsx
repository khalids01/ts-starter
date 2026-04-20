import { createContext, useContext } from "react";
import type { authClient } from "@/lib/auth-client";

type AppSession = (typeof authClient)["$Infer"]["Session"] | null;

type SessionContextValue = {
  session: AppSession;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: AppSession;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider.");
  }
  return context;
}
