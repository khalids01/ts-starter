import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import {
  IdParamDto,
  ListOrdersQueryDto,
  UpdateOrderStatusesDto,
} from "./orders.dto";
import {
  adminOrdersService,
  AdminOrdersServiceError,
} from "./orders.service";

function handleOrderError(error: unknown, set: { status?: number | string }) {
  if (error instanceof AdminOrdersServiceError) {
    set.status = error.status;
    return { message: error.message, status: error.status };
  }

  const message =
    error instanceof Error ? error.message : "Order operation failed";
  set.status = 400;
  return { message, status: 400 };
}

const readOrders = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminOrdersRead,
]);
const manageOrders = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminOrdersManage,
]);

export const adminOrdersController = new Elysia({
  prefix: "/admin/orders",
  detail: {
    tags: ["Admin - Orders"],
  },
})
  .use(authGuard)
  .get(
    "/",
    ({ query }) => adminOrdersService.listOrders(query),
    {
      beforeHandle: readOrders,
      query: ListOrdersQueryDto,
      detail: {
        summary: "List orders",
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        return await adminOrdersService.getOrder(id);
      } catch (error) {
        return handleOrderError(error, set);
      }
    },
    {
      beforeHandle: readOrders,
      params: IdParamDto,
      detail: {
        summary: "Get order details",
      },
    },
  )
  .patch(
    "/:id/status",
    async ({ params: { id }, body, set, userId }) => {
      try {
        return await adminOrdersService.updateOrderStatuses(id, body, { userId });
      } catch (error) {
        return handleOrderError(error, set);
      }
    },
    {
      beforeHandle: manageOrders,
      params: IdParamDto,
      body: UpdateOrderStatusesDto,
      detail: {
        summary: "Update order statuses",
      },
    },
  );
