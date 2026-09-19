import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import { UpdateStoreSettingsDto } from "@/modules/ecommerce/store-settings/store-settings.dto";
import { storeSettingsService, StoreSettingsServiceError } from "@/modules/ecommerce/store-settings/store-settings.service";

const readSettings = requireAllPermissions([Permissions.AdminAccess, Permissions.AdminStoreSettingsRead]);
const manageSettings = requireAllPermissions([Permissions.AdminAccess, Permissions.AdminStoreSettingsManage]);

function handleError(error: unknown, set: { status?: number | string }) {
  const status = error instanceof StoreSettingsServiceError ? error.status : 400;
  set.status = status;
  return { message: error instanceof Error ? error.message : "Store settings operation failed", status };
}

export const adminStoreSettingsController = new Elysia({
  prefix: "/admin/store-settings",
  detail: { tags: ["Admin - Store settings"] },
})
  .use(authGuard)
  .get("/", () => storeSettingsService.get(), {
    beforeHandle: readSettings,
    detail: { summary: "Get store settings" },
  })
  .put("/", async ({ body, set }) => {
    try { return await storeSettingsService.update(body); }
    catch (error) { return handleError(error, set); }
  }, {
    beforeHandle: manageSettings,
    body: UpdateStoreSettingsDto,
    detail: { summary: "Update store settings" },
  });
