import { afterEach, describe, expect, it, mock } from "bun:test";
import { Prisma } from "../../../packages/db/prisma/generated/client";

const findUniqueMock = mock(async () => null);
const authApi =
  ((globalThis as typeof globalThis & {
    __serverTestAuthApi?: {
      getSession: ReturnType<typeof mock>;
      signInMagicLink: ReturnType<typeof mock>;
    };
  }).__serverTestAuthApi ??= {
    getSession: mock(async () => null),
    signInMagicLink: mock(async () => ({ success: true })),
  });

mock.module("@db/server", () => ({
  default: {
    user: {
      findUnique: findUniqueMock,
    },
  },
  Prisma,
  getAuthSettings: mock(async () => ({
    passwordSignInEnabled: true,
    passwordSignUpEnabled: true,
    githubSignInEnabled: true,
    githubSignUpEnabled: true,
    googleSignInEnabled: true,
    googleSignUpEnabled: true,
    discordSignInEnabled: true,
    discordSignUpEnabled: true,
    magicLinkSignInEnabled: true,
    magicLinkSignUpEnabled: true,
  })),
}));

mock.module("@auth/server", () => ({
  auth: {
    api: authApi,
  },
  getAuthSession: mock(async () => null),
}));

mock.module("@env/server", () => ({
  env: {
    CORS_ORIGIN: "http://localhost:3000",
  },
}));

afterEach(() => {
  findUniqueMock.mockReset();
  authApi.signInMagicLink.mockReset();
});

describe("authController", () => {
  it("returns normalized account authentication methods for password guidance", async () => {
    findUniqueMock.mockResolvedValue({
      accounts: [{ providerId: "github" }, { providerId: "github" }],
      authMethods: [{ method: "magic-link" }],
    });

    const { authController } = await import("../src/modules/auth/auth.controller");
    const response = await authController.handle(
      new Request("http://localhost/auth/check-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "  USER@Example.COM " }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      exists: true,
      authenticationMethods: ["github", "magic-link"],
    });
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
      select: {
        accounts: { select: { providerId: true } },
        authMethods: { select: { method: true } },
      },
    });
  });

  it("returns 400 when magic-link login is requested for an unknown user", async () => {
    findUniqueMock.mockResolvedValue(null);

    const { authController } = await import("../src/modules/auth/auth.controller");

    const response = await authController.handle(
      new Request("http://localhost/auth/magic-link/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "missing@example.com",
        }),
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ message: "User not found" });
    expect(authApi.signInMagicLink).not.toHaveBeenCalled();
  });
});
