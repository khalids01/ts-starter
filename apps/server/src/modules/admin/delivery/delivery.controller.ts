import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import {
  CourierConnectionIdDto,
  CourierOrderIdDto,
  CourierResourceIdDto,
  ConfirmCourierRouteDto,
  CreateCourierRoutingRuleDto,
  CreateCourierServiceDto,
  CreateCourierConnectionDto,
  UpdateCourierRoutingRuleDto,
  UpdateCourierServiceDto,
  UpdateCourierConnectionDto,
} from "./delivery.dto";
import {
  adminDeliveryService,
  AdminDeliveryServiceError,
} from "./delivery.service";
import { courierRoutingDispatchService } from "./routing-dispatch.service";
import { courierTrackingService } from "../../delivery/tracking.service";

const readDelivery = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminDeliveryRead,
]);
const manageDelivery = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminDeliverySettings,
]);
const dispatchDelivery = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminDeliveryDispatch,
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
  )
  .get("/services", () => courierRoutingDispatchService.listServices(), { beforeHandle: readDelivery })
  .post("/services", async ({ body, set, userId }) => {
    try { return await courierRoutingDispatchService.createService(body, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, body: CreateCourierServiceDto })
  .patch("/services/:id", async ({ params: { id }, body, set, userId }) => {
    try { return await courierRoutingDispatchService.updateService(id, body, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, params: CourierResourceIdDto, body: UpdateCourierServiceDto })
  .get("/routing-rules", () => courierRoutingDispatchService.listRules(), { beforeHandle: readDelivery })
  .post("/routing-rules", async ({ body, set, userId }) => {
    try { return await courierRoutingDispatchService.createRule(body, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, body: CreateCourierRoutingRuleDto })
  .patch("/routing-rules/:id", async ({ params: { id }, body, set, userId }) => {
    try { return await courierRoutingDispatchService.updateRule(id, body, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, params: CourierResourceIdDto, body: UpdateCourierRoutingRuleDto })
  .get("/orders/:orderId/recommendation", async ({ params: { orderId }, set }) => {
    try { return await courierRoutingDispatchService.recommend(orderId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: dispatchDelivery, params: CourierOrderIdDto })
  .get("/orders/:orderId/tracking", ({ params: { orderId } }) =>
    courierTrackingService.timelineForOrder(orderId),
  { beforeHandle: readDelivery, params: CourierOrderIdDto })
  .post("/orders/:orderId/confirm", async ({ params: { orderId }, body, set, userId }) => {
    try { return await courierRoutingDispatchService.confirm(orderId, body, userId!); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: dispatchDelivery, params: CourierOrderIdDto, body: ConfirmCourierRouteDto })
  .get("/dispatches", () => courierRoutingDispatchService.listDispatches(), { beforeHandle: readDelivery })
  .post("/dispatches/:id/queue", async ({ params: { id }, set, userId }) => {
    try { return await courierRoutingDispatchService.queue(id, userId!); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: dispatchDelivery, params: CourierResourceIdDto });
