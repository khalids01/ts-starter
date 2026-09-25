import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import {
  CourierConnectionIdDto,
  ListCourierResourcesQueryDto,
  CourierHandoffDto,
  CourierPickupRequestDto,
  CourierOrderIdDto,
  CourierResourceIdDto,
  ConfirmCourierRouteDto,
  CreateCourierReturnDto,
  CreateCourierRoutingRuleDto,
  CreateCourierServiceDto,
  RecordCourierSettlementDto,
  CreateCourierConnectionDto,
  UpdateCourierRoutingRuleDto,
  UpdateCourierReturnDto,
  UpdateCourierServiceDto,
  UpdateCourierConnectionDto,
} from "./delivery.dto";
import {
  adminDeliveryService,
  AdminDeliveryServiceError,
} from "./delivery.service";
import { courierRoutingDispatchService } from "./routing-dispatch.service";
import { courierTrackingService } from "../../delivery/tracking.service";
import { courierReturnsSettlementsService } from "./returns-settlements.service";

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
const manageReturns = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminDeliveryReturns,
]);
const reconcileDelivery = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminDeliveryReconcile,
]);

function handleDeliveryError(error: unknown, set: { status?: number | string }) {
  const status =
    error instanceof AdminDeliveryServiceError ? error.status : 400;
  const message =
    error instanceof Error ? error.message : "Courier connection operation failed";
  set.status = status;
  return {
    message,
    status,
    ...(error instanceof AdminDeliveryServiceError && error.code ? { code: error.code } : {}),
    ...(error instanceof AdminDeliveryServiceError && error.dependencies ? { dependencies: error.dependencies } : {}),
  };
}

export const adminDeliveryController = new Elysia({
  prefix: "/admin/delivery",
  detail: { tags: ["Admin - Delivery"] },
})
  .use(authGuard)
  .get("/providers", () => adminDeliveryService.listProviders(), {
    beforeHandle: readDelivery,
  })
  .get("/connections", ({ query }) => adminDeliveryService.listConnections(query.archived), {
    beforeHandle: readDelivery,
    query: ListCourierResourcesQueryDto,
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
  .post("/connections/:id/archive", async ({ params: { id }, set, userId }) => {
    try { return await adminDeliveryService.archiveConnection(id, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, params: CourierConnectionIdDto })
  .post("/connections/:id/restore", async ({ params: { id }, set, userId }) => {
    try { return await adminDeliveryService.restoreConnection(id, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, params: CourierConnectionIdDto })
  .delete("/connections/:id", async ({ params: { id }, set, userId }) => {
    try { return await adminDeliveryService.deleteConnection(id, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, params: CourierConnectionIdDto })
  .get("/services", ({ query }) => courierRoutingDispatchService.listServices(query.archived), { beforeHandle: readDelivery, query: ListCourierResourcesQueryDto })
  .post("/services", async ({ body, set, userId }) => {
    try { return await courierRoutingDispatchService.createService(body, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, body: CreateCourierServiceDto })
  .patch("/services/:id", async ({ params: { id }, body, set, userId }) => {
    try { return await courierRoutingDispatchService.updateService(id, body, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, params: CourierResourceIdDto, body: UpdateCourierServiceDto })
  .post("/services/:id/archive", async ({ params: { id }, set, userId }) => {
    try { return await courierRoutingDispatchService.archiveService(id, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, params: CourierResourceIdDto })
  .post("/services/:id/restore", async ({ params: { id }, set, userId }) => {
    try { return await courierRoutingDispatchService.restoreService(id, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, params: CourierResourceIdDto })
  .delete("/services/:id", async ({ params: { id }, set, userId }) => {
    try { return await courierRoutingDispatchService.deleteService(id, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, params: CourierResourceIdDto })
  .get("/routing-rules", ({ query }) => courierRoutingDispatchService.listRules(query.archived), { beforeHandle: readDelivery, query: ListCourierResourcesQueryDto })
  .post("/routing-rules", async ({ body, set, userId }) => {
    try { return await courierRoutingDispatchService.createRule(body, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, body: CreateCourierRoutingRuleDto })
  .patch("/routing-rules/:id", async ({ params: { id }, body, set, userId }) => {
    try { return await courierRoutingDispatchService.updateRule(id, body, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, params: CourierResourceIdDto, body: UpdateCourierRoutingRuleDto })
  .post("/routing-rules/:id/archive", async ({ params: { id }, set, userId }) => {
    try { return await courierRoutingDispatchService.archiveRule(id, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, params: CourierResourceIdDto })
  .post("/routing-rules/:id/restore", async ({ params: { id }, set, userId }) => {
    try { return await courierRoutingDispatchService.restoreRule(id, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, params: CourierResourceIdDto })
  .delete("/routing-rules/:id", async ({ params: { id }, set, userId }) => {
    try { return await courierRoutingDispatchService.deleteRule(id, userId); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageDelivery, params: CourierResourceIdDto })
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
  }, { beforeHandle: dispatchDelivery, params: CourierResourceIdDto })
  .post("/consignments/:id/handoff", async ({ params: { id }, body, set, userId }) => {
    try { return await courierReturnsSettlementsService.markHandoff(id, body, userId!); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: dispatchDelivery, params: CourierResourceIdDto, body: CourierHandoffDto })
  .post("/consignments/:id/pickup", async ({ params: { id }, body, set, userId }) => {
    try { return await courierReturnsSettlementsService.requestPickup(id, body, userId!); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: dispatchDelivery, params: CourierResourceIdDto, body: CourierPickupRequestDto })
  .get("/returns", () => courierReturnsSettlementsService.listReturns(), { beforeHandle: readDelivery })
  .post("/returns", async ({ body, set, userId }) => {
    try { return await courierReturnsSettlementsService.createReturn(body, userId!); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageReturns, body: CreateCourierReturnDto })
  .patch("/returns/:id", async ({ params: { id }, body, set, userId }) => {
    try { return await courierReturnsSettlementsService.updateReturn(id, body, userId!); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageReturns, params: CourierResourceIdDto, body: UpdateCourierReturnDto })
  .post("/returns/:id/submit", async ({ params: { id }, set, userId }) => {
    try { return await courierReturnsSettlementsService.submitReturn(id, userId!); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: manageReturns, params: CourierResourceIdDto })
  .get("/settlements", () => courierReturnsSettlementsService.listSettlements(), { beforeHandle: readDelivery })
  .post("/settlements", async ({ body, set, userId }) => {
    try { return await courierReturnsSettlementsService.recordSettlement(body, userId!); }
    catch (error) { return handleDeliveryError(error, set); }
  }, { beforeHandle: reconcileDelivery, body: RecordCourierSettlementDto });
