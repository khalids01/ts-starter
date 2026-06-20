import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import { IdParamDto, ListImagesQueryDto } from "./images.dto";
import {
  adminImagesService,
  AdminImagesServiceError,
} from "./images.service";

function handleImagesError(error: unknown, set: { status?: number | string }) {
  if (error instanceof AdminImagesServiceError) {
    set.status = error.status;
    return { message: error.message, status: error.status };
  }

  const message =
    error instanceof Error ? error.message : "Image operation failed";
  set.status = 400;
  return { message, status: 400 };
}

const readImages = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminImagesRead,
]);
const manageImages = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminImagesManage,
]);

export const adminImagesController = new Elysia({
  prefix: "/admin/images",
  detail: {
    tags: ["Admin - Images"],
  },
})
  .use(authGuard)
  .get(
    "/",
    async ({ query, set }) => {
      try {
        return await adminImagesService.list(query);
      } catch (error) {
        return handleImagesError(error, set);
      }
    },
    {
      beforeHandle: readImages,
      query: ListImagesQueryDto,
      detail: { summary: "List Serve images" },
    },
  )
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        return await adminImagesService.get(id);
      } catch (error) {
        return handleImagesError(error, set);
      }
    },
    {
      beforeHandle: readImages,
      params: IdParamDto,
      detail: { summary: "Get Serve image metadata" },
    },
  )
  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        return await adminImagesService.delete(id);
      } catch (error) {
        return handleImagesError(error, set);
      }
    },
    {
      beforeHandle: manageImages,
      params: IdParamDto,
      detail: { summary: "Delete Serve image" },
    },
  )
  .post(
    "/upload",
    async ({ request, set }) => {
      try {
        const result = await adminImagesService.upload(request);
        set.status = result.status;
        return result.payload;
      } catch (error) {
        return handleImagesError(error, set);
      }
    },
    {
      beforeHandle: manageImages,
      parse: "none",
      detail: { summary: "Upload images to Serve" },
    },
  );
