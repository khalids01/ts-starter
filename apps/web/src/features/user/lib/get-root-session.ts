import { createServerFn } from "@tanstack/react-start";
import {
  getRequestHeaders,
  setResponseHeader,
} from "@tanstack/react-start/server";

import type { ClientSession, ClientSessionResult } from "@auth/client";
import { env } from "@env/client";

type BackendSessionContext =
  | ClientSession
  | {
      user: null;
      permissions: [];
      roles: [];
      primaryRoleSlug: null;
      primaryRoleId: null;
    };

function normalizeSessionContext(
  session: BackendSessionContext,
): ClientSessionResult {
  return session.user ? session : null;
}

export const getRootSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<ClientSessionResult> => {
    return getRootSessionForHeaders(getRequestHeaders(), (cookies) => {
      setResponseHeader("set-cookie", cookies);
    });
  },
);

export async function getRootSessionForHeaders(
  headers: Headers,
  onSetCookie?: (cookies: string[]) => void,
): Promise<ClientSessionResult> {
  const requestHeaders = new Headers();

  const cookie = headers.get("cookie");
  const authorization = headers.get("authorization");
  if (cookie) {
    requestHeaders.set("cookie", cookie);
  }

  if (authorization) {
    requestHeaders.set("authorization", authorization);
  }

  return fetchRootSession(requestHeaders, onSetCookie);
}

async function fetchRootSession(
  requestHeaders: Headers,
  onSetCookie?: (cookies: string[]) => void,
): Promise<ClientSessionResult> {
  try {
    const response = await fetch(`${env.VITE_SERVER_URL}/session/context`, {
      headers: requestHeaders,
    });

    if (!response.ok) {
      throw new Error(`Session service returned ${response.status}`);
    }

    const responseHeaders = response.headers as Headers & {
      getSetCookie?: () => string[];
    };
    const cookies =
      responseHeaders.getSetCookie?.() ??
      (response.headers.get("set-cookie")
        ? [response.headers.get("set-cookie")!]
        : []);

    if (cookies.length > 0) {
      onSetCookie?.(cookies);
    }

    const session = (await response.json()) as BackendSessionContext;
    return normalizeSessionContext(session);
  } catch (error) {
    console.error("[getRootSession] session context request failed", error);
    throw new Error("Authentication service is unavailable", { cause: error });
  }
}
