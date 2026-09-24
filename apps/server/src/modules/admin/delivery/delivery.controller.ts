import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import {
  CourierConnectionIdDto,
  CreateCourierConnectionDto,
  UpdateCourierConnectionDto,
} from "./delivery.dto";
import {
  adminDeliveryService,
  AdminDeliveryServiceError,
} from "./delivery.service";

const readDelivery = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminDeliveryRead,
]);
const manageDelivery = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminDeliverySettings,
]);

function handleDeliveryError(error: unknown, set: { status?: number | string }) {
  const status =
    error instanceof AdminDeliveryServiceError ? error.status : 400;
  const message =
    error instanceof Error ? error.message : "Courier connection operation failed";
  set.status = status;
  return { message, status };
}

export const adminDeliveryController = new Elysia({
  prefix: "/admin/delivery",
  detail: { tags: ["Admin - Delivery"] },
})
  .use(authGuard)
  .get("/providers", () => adminDeliveryService.listProviders(), {
    beforeHandle: readDelivery,
  })
  .get("/connections", () => adminDeliveryService.listConnections(), {
    beforeHandle: readDelivery,
  })
  .post(
    "/connections",
    async ({ body, set, userId }) => {
      try {
        return await adminDeliveryService.createConnection(body, userId);
      } catch (error) {
        return handleDeliveryError(error, set);
      }
    },
    { beforeHandle: manageDelivery, body: CreateCourierConnectionDto },
  )
  .patch(
    "/connections/:id",
    async ({ params: { id }, body, set, userId }) => {
      try {
        return await adminDeliveryService.updateConnection(id, body, userId);
      } catch (error) {
        return handleDeliveryError(error, set);
      }
    },
    {
      beforeHandle: manageDelivery,
      params: CourierConnectionIdDto,
      body: UpdateCourierConnectionDto,
    },
  )
  .post(
    "/connections/:id/test",
    async ({ params: { id }, set, userId }) => {
      try {
        return await adminDeliveryService.testConnection(id, userId);
      } catch (error) {
        return handleDeliveryError(error, set);
      }
    },
    { beforeHandle: manageDelivery, params: CourierConnectionIdDto },
  )
  .post(
    "/connections/:id/enable",
    async ({ params: { id }, set, userId }) => {
      try {
        return await adminDeliveryService.setEnabled(id, true, userId);
      } catch (error) {
        return handleDeliveryError(error, set);
      }
    },
    { beforeHandle: manageDelivery, params: CourierConnectionIdDto },
  )
  .post(
    "/connections/:id/disable",
    async ({ params: { id }, set, userId }) => {
      try {
        return await adminDeliveryService.setEnabled(id, false, userId);
      } catch (error) {
        return handleDeliveryError(error, set);
      }
    },
    { beforeHandle: manageDelivery, params: CourierConnectionIdDto },
  );
