import { afterEach, describe, expect, it, mock } from "bun:test";
import { getRootSessionForHeaders } from "./get-root-session";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("getRootSessionForHeaders", () => {
  it("forwards refreshed session cookies", async () => {
    const responseHeaders = new Headers();
    responseHeaders.append(
      "set-cookie",
      "better-auth.session_token=renewed; Path=/; HttpOnly",
    );
    responseHeaders.append(
      "set-cookie",
      "better-auth.session_data=cached; Path=/; HttpOnly",
    );

    globalThis.fetch = mock(async () => {
      return new Response(
        JSON.stringify({
          user: null,
          permissions: [],
          roles: [],
          primaryRoleSlug: null,
          primaryRoleId: null,
        }),
        { status: 200, headers: responseHeaders },
      );
    }) as unknown as typeof fetch;

    const headers = new Headers({ cookie: "session=token" });
    let forwardedCookies: string[] = [];
    const session = await getRootSessionForHeaders(headers, (cookies) => {
      forwardedCookies = cookies;
    });

    expect(session).toBeNull();
    expect(forwardedCookies).toEqual([
      "better-auth.session_token=renewed; Path=/; HttpOnly",
      "better-auth.session_data=cached; Path=/; HttpOnly",
    ]);
  });

  it("does not turn an auth service failure into an anonymous session", async () => {
    globalThis.fetch = mock(async () => {
      return new Response("Unavailable", { status: 503 });
    }) as unknown as typeof fetch;

    await expect(
      getRootSessionForHeaders(new Headers({ cookie: "session=token" })),
    ).rejects.toThrow("Authentication service is unavailable");
  });
});
