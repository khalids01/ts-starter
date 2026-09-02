import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { adminModuleGuard } from "../admin-rbac.plugin";
import { UpdateAuthSettingsDto } from "./auth-settings.dto";
import { authSettingsService } from "./auth-settings.service";

export const authSettingsController = new Elysia({
  prefix: "/admin/auth-settings",
  detail: { tags: ["Admin - Authentication Settings"] },
})
  .use(adminModuleGuard(Permissions.AdminUsersUpdate))
  .get("/", () => authSettingsService.get())
  .patch("/", ({ body }) => authSettingsService.update(body), {
    body: UpdateAuthSettingsDto,
  });
