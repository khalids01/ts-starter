import { activityService } from "@/modules/admin/activity/activity.service";
import { SeoPageParams, SeoRevisionDto, SavePageSeoDto } from "@/modules/ecommerce/page-seo/page-seo.dto";
import { pageSeoService, pageSeoError, PageSeoError } from "@/modules/ecommerce/page-seo/page-seo.service";
import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import { UpdateStoreSettingsDto } from "@/modules/ecommerce/store-settings/store-settings.dto";
import { storeSettingsService, StoreSettingsServiceError } from "@/modules/ecommerce/store-settings/store-settings.service";

const readSettings = requireAllPermissions([Permissions.AdminAccess, Permissions.AdminStoreSettingsRead]);
const manageSettings = requireAllPermissions([Permissions.AdminAccess, Permissions.AdminStoreSettingsManage]);

function handleError(error: unknown, set: { status?: number | string }) {
  error = pageSeoError(error);
  const status = error instanceof StoreSettingsServiceError || error instanceof PageSeoError ? error.status : 500;
  set.status = status;
  return { message: status < 500 || error instanceof PageSeoError ? (error instanceof Error ? error.message : "Store settings operation failed") : "Store settings operation failed", status };
}

export const adminStoreSettingsController = new Elysia({
  prefix: "/admin/store-settings",
  detail: { tags: ["Admin - Store settings"] },
})
  .use(authGuard)
  .get("/seo/:page", async ({ params, set }) => {
    try { return await pageSeoService.get(params.page); } catch (error) { return handleError(error, set); }
  }, { beforeHandle: readSettings, params: SeoPageParams })
  .put("/seo/:page", async ({ params, body, set }) => {
    try { return await pageSeoService.save(params.page, body); } catch (error) { return handleError(error, set); }
  }, { beforeHandle: manageSettings, params: SeoPageParams, body: SavePageSeoDto })
  .post("/seo/:page/publish", async ({ params, body, set, userId }) => {
    try {
      const published = await pageSeoService.publish(params.page, body.revision);
      await activityService.record({ type: "website.seo.published", actorUserId: userId, message: `Published ${params.page} page SEO`, metadata: { page: params.page, sourceRevision: body.revision } });
      return published;
    } catch (error) { return handleError(error, set); }
  }, { beforeHandle: manageSettings, params: SeoPageParams, body: SeoRevisionDto })
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
