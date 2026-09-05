import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import {
  toClientSession,
  type AuthClientSession,
  type ClientSessionResult,
} from "@auth/client";
import { authClient } from "@/lib/auth-client";

type SessionContextValue = {
  session: ClientSessionResult;
  isPending: boolean;
  isRefetching: boolean;
  refresh: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: ClientSessionResult;
}) {
  const liveSession = authClient.useSession();
  const lastResolvedSession = useRef(initialSession);
  const normalizedSession = toClientSession(
    liveSession.data as AuthClientSession | null | undefined,
  );

  if (!liveSession.isPending && !liveSession.error) {
    lastResolvedSession.current = normalizedSession;
  }

  const session =
    liveSession.isPending || liveSession.error
      ? lastResolvedSession.current
      : normalizedSession;

  return (
    <SessionContext.Provider
      value={{
        session,
        isPending: liveSession.isPending,
        isRefetching: liveSession.isRefetching,
        refresh: liveSession.refetch,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}
