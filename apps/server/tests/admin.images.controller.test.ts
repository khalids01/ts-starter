import { afterEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { Permissions } from "@rbac";

const getAuthSessionMock = mock(async () => ({
  user: {
    id: "admin-1",
    role: "ADMIN",
    banned: false,
    archived: false,
  },
  permissions: [Permissions.AdminAccess],
}));

mock.module("@auth/server", () => ({
  auth: {
    api: {
      getSession: getAuthSessionMock,
    },
  },
  getAuthSession: getAuthSessionMock,
}));

afterEach(() => {
  getAuthSessionMock.mockClear();
});

describe("admin images controller RBAC", () => {
  it("requires image read permission for read routes", async () => {
    const { adminImagesController } = await import(
      "../src/modules/admin/images/images.controller"
    );
    const app = new Elysia().use(adminImagesController);

    const response = await app.handle(
      new Request("http://localhost/admin/images/"),
    );

    expect(response.status).toBe(403);
  });

  it("requires image manage permission for upload routes", async () => {
    getAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: "admin-1",
        role: "ADMIN",
        banned: false,
        archived: false,
      },
      permissions: [
        Permissions.AdminAccess,
        Permissions.AdminImagesRead,
      ],
    });

    const { adminImagesController } = await import(
      "../src/modules/admin/images/images.controller"
    );
    const app = new Elysia().use(adminImagesController);

    const response = await app.handle(
      new Request("http://localhost/admin/images/upload", {
        method: "POST",
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("requires image manage permission for delete routes", async () => {
    getAuthSessionMock.mockResolvedValueOnce({
      user: {
        id: "admin-1",
        role: "ADMIN",
        banned: false,
        archived: false,
      },
      permissions: [
        Permissions.AdminAccess,
        Permissions.AdminImagesRead,
      ],
    });

    const { adminImagesController } = await import(
      "../src/modules/admin/images/images.controller"
    );
    const app = new Elysia().use(adminImagesController);

    const response = await app.handle(
      new Request("http://localhost/admin/images/img-1", {
        method: "DELETE",
      }),
    );

    expect(response.status).toBe(403);
  });
});
