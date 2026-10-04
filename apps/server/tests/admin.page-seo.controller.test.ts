import { beforeEach, describe, expect, test, mock } from "bun:test";
import { Elysia } from "elysia";
import { Permissions } from "@rbac";

let session: any;
const getSession = mock(async () => session);
const read = mock(async () => null);
const audit = mock(async () => null);
mock.module("@/modules/admin/activity/activity.service", () => ({ activityService: { record: audit } }));
const create = mock(async ({ data }: any) => ({ ...data, revision: 1 }));
mock.module("@auth/server", () => ({ getAuthSession: getSession, getSetCookieHeaders: () => [] }));
mock.module("@/rbac/resolve/get-effective", () => ({ getEffectivePermissions: async () => new Set(), createPermissionChecker: () => () => false }));
mock.module("@db/server", () => ({ default: { storePageSeo: { findUnique: read, create, updateMany: async () => ({ count: 1 }) }, storeSettings: { findUnique: async () => null } } }));
const { adminStoreSettingsController } = await import("../src/modules/admin/store-settings/store-settings.controller");
const app = new Elysia().use(adminStoreSettingsController);
const draft = { revision: 0, title: "Draft title", description: "Description", imageUrl: null };
function request(method: string, suffix = "", body?: unknown) {
  return app.handle(new Request(`http://localhost/admin/store-settings/seo/home${suffix}`, { method, ...(body ? { headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {}) }));
}
beforeEach(() => { session = { user: { id: "fictional-admin", banned: false, archived: false }, permissions: [Permissions.AdminAccess] }; read.mockReset(); read.mockResolvedValue(null); create.mockClear(); audit.mockClear(); });
describe("website SEO HTTP permission boundaries", () => {
  test("anonymous and admin without read permission cannot read drafts", async () => {
    session = null;
    expect((await request("GET")).status).toBe(403);
    session = { user: { id: "admin" }, permissions: [Permissions.AdminAccess] };
    expect((await request("GET")).status).toBe(403);
    expect(read).not.toHaveBeenCalled();
  });
  test("read-only admin can inspect but cannot save or publish", async () => {
    session.permissions.push(Permissions.AdminStoreSettingsRead);
    expect((await request("GET")).status).toBe(200);
    expect((await request("PUT", "", draft)).status).toBe(403);
    expect((await request("POST", "/publish", { revision: 1 })).status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });
  test("manage permission still requires admin access", async () => {
    session.permissions = [Permissions.AdminStoreSettingsManage];
    expect((await request("PUT", "", draft)).status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });
  test("manager can save; invalid page and URL cannot write", async () => {
    session.permissions.push(Permissions.AdminStoreSettingsManage);
    expect((await request("PUT", "", draft)).status).toBe(200);
    expect((await request("PUT", "", { ...draft, imageUrl: "javascript:alert(1)" })).status).toBe(400);
    expect((await app.handle(new Request("http://localhost/admin/store-settings/seo/arbitrary"))).status).toBe(422);
    expect(create).toHaveBeenCalledTimes(1);
  });
  test("publication records the actor and published source revision", async () => {
    session.permissions.push(Permissions.AdminStoreSettingsManage);
    read.mockResolvedValue({ revision: 1, title: "Approved", description: null, imageUrl: null });
    expect((await request("POST", "/publish", { revision: 1 })).status).toBe(200);
    expect(audit).toHaveBeenCalledWith(expect.objectContaining({ type: "website.seo.published", actorUserId: "fictional-admin", metadata: { page: "home", sourceRevision: 1 } }));
  });
  test("banned and archived managers cannot modify drafts", async () => {
    session.permissions.push(Permissions.AdminStoreSettingsManage);
    session.user.banned = true;
    expect((await request("PUT", "", draft)).status).toBe(403);
    session.user.banned = false; session.user.archived = true;
    expect((await request("PUT", "", draft)).status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });
  test("missing storage returns an actionable prerequisite; other errors remain private", async () => {
    session.permissions.push(Permissions.AdminStoreSettingsRead);
    read.mockRejectedValueOnce({ code: "P2021" });
    const absent = await request("GET");
    expect(absent.status).toBe(503);
    expect((await absent.json()).message).toContain("not provisioned");
    read.mockRejectedValueOnce(new Error("private database information"));
    const broken = await request("GET");
    expect(broken.status).toBe(500);
    expect((await broken.json()).message).not.toContain("private");
  });
});
