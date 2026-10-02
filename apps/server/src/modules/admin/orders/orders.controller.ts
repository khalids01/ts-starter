import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import {
  IdParamDto,
  CancelOrderDto,
  ListOrdersQueryDto,
  MarkOrderDeliveredDto,
  MarkOrderShippedDto,
  RecordOrderRefundDto,
  ReceiveOrderRecoveryDto,
  InspectOrderRecoveryDto,
  RestockOrderRecoveryDto,
  UpdateOrderDto,
  UpdateOrderStatusesDto,
  UpdateOrderTrackingDto,
} from "./orders.dto";
import {
  adminOrdersService,
  AdminOrdersServiceError,
} from "./orders.service";
import { orderFulfillmentService } from "./fulfillment.service";
import { orderOperationsService } from "./order-operations.service";
import { orderRecoveryService } from "./order-recovery.service";

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
const fulfillOrders = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminOrdersFulfill,
]);
const cancelOrders = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminOrdersCancel,
]);
const refundOrders = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminOrdersRefund,
]);
const restockOrders = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminOrdersFulfill,
  Permissions.AdminInventoryManage,
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
  .post(
    "/release-expired-reservations",
    async ({ set, userId }) => {
      try {
        return await adminOrdersService.releaseExpiredReservations({ userId });
      } catch (error) {
        return handleOrderError(error, set);
      }
    },
    {
      beforeHandle: manageOrders,
      detail: {
        summary: "Release expired order stock reservations",
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
    "/:id",
    async ({ params: { id }, body, set }) => {
      try {
        return await adminOrdersService.updateOrder(id, body);
      } catch (error) {
        return handleOrderError(error, set);
      }
    },
    {
      beforeHandle: manageOrders,
      params: IdParamDto,
      body: UpdateOrderDto,
      detail: {
        summary: "Update order contact, notes, and addresses",
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
  )
  .post(
    "/:id/cancel",
    async ({ params: { id }, body, set, userId, hasPermission }) => {
      try {
        return await orderOperationsService.cancelOrder(id, body, { userId, canRestock: hasPermission(Permissions.AdminInventoryManage) });
      } catch (error) {
        return handleOrderError(error, set);
      }
    },
    {
      beforeHandle: cancelOrders,
      params: IdParamDto,
      body: CancelOrderDto,
      detail: {
        summary: "Cancel an order and safely release or review its inventory",
      },
    },
  )
  .post(
    "/:id/refunds",
    async ({ params: { id }, body, set, userId, hasPermission }) => {
      try {
        return await orderOperationsService.recordRefund(id, body, { userId, canRestock: hasPermission(Permissions.AdminInventoryManage) && hasPermission(Permissions.AdminOrdersFulfill) });
      } catch (error) {
        return handleOrderError(error, set);
      }
    },
    {
      beforeHandle: refundOrders,
      params: IdParamDto,
      body: RecordOrderRefundDto,
      detail: {
        summary: "Record a manual full or partial refund",
      },
    },
  )
  .post("/:id/recovery", async ({ params: { id }, body, set, userId }) => {
    try { return await orderRecoveryService.receive(id, body, userId!); }
    catch (error) { return handleOrderError(error, set); }
  }, { beforeHandle: fulfillOrders, params: IdParamDto, body: ReceiveOrderRecoveryDto, detail: { summary: "Record full physical receipt without restocking" } })
  .patch("/:id/recovery", async ({ params: { id }, body, set, userId }) => {
    try { return await orderRecoveryService.inspect(id, body, userId!); }
    catch (error) { return handleOrderError(error, set); }
  }, { beforeHandle: fulfillOrders, params: IdParamDto, body: InspectOrderRecoveryDto, detail: { summary: "Inspect physically received inventory" } })
  .post("/:id/recovery/restock", async ({ params: { id }, body, set, userId }) => {
    try { return await orderRecoveryService.restock(id, body.note, userId!); }
    catch (error) { return handleOrderError(error, set); }
  }, { beforeHandle: restockOrders, params: IdParamDto, body: RestockOrderRecoveryDto, detail: { summary: "Restock inspected sellable inventory once" } })
  .post(
    "/:id/ship",
    async ({ params: { id }, body, set, userId }) => {
      try {
        return await orderFulfillmentService.markShipped(id, body, { userId });
      } catch (error) {
        return handleOrderError(error, set);
      }
    },
    {
      beforeHandle: fulfillOrders,
      params: IdParamDto,
      body: MarkOrderShippedDto,
      detail: {
        summary: "Mark order shipped with carrier and tracking number",
      },
    },
  )
  .patch(
    "/:id/tracking",
    async ({ params: { id }, body, set, userId }) => {
      try {
        return await orderFulfillmentService.updateTracking(id, body, { userId });
      } catch (error) {
        return handleOrderError(error, set);
      }
    },
    {
      beforeHandle: fulfillOrders,
      params: IdParamDto,
      body: UpdateOrderTrackingDto,
      detail: {
        summary: "Correct carrier, tracking number, or fulfillment note",
      },
    },
  )
  .post(
    "/:id/delivered",
    async ({ params: { id }, body, set, userId }) => {
      try {
        return await orderFulfillmentService.markDelivered(id, body, { userId });
      } catch (error) {
        return handleOrderError(error, set);
      }
    },
    {
      beforeHandle: fulfillOrders,
      params: IdParamDto,
      body: MarkOrderDeliveredDto,
      detail: {
        summary: "Mark order delivered",
      },
    },
  );
