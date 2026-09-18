import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import {
  CreateShippingRateDto,
  ListShippingRatesQueryDto,
  ShippingRateIdParamDto,
  UpdateShippingRateDto,
} from "@/modules/ecommerce/shipping/shipping.dto";
import {
  shippingService,
  ShippingServiceError,
} from "@/modules/ecommerce/shipping/shipping.service";

const readShipping = requireAllPermissions([Permissions.AdminAccess, Permissions.AdminShippingRead]);
const manageShipping = requireAllPermissions([Permissions.AdminAccess, Permissions.AdminShippingManage]);

function handleShippingError(error: unknown, set: { status?: number | string }) {
  const status = error instanceof ShippingServiceError ? error.status : 400;
  const message = error instanceof Error ? error.message : "Shipping operation failed";
  set.status = status;
  return { message, status };
}

export const adminShippingController = new Elysia({
  prefix: "/admin/shipping",
  detail: { tags: ["Admin - Shipping"] },
})
  .use(authGuard)
  .get("/rates", ({ query }) => shippingService.listRates(query), {
    beforeHandle: readShipping,
    query: ListShippingRatesQueryDto,
    detail: { summary: "List shipping rates" },
  })
  .post("/rates", async ({ body, set }) => {
    try { return await shippingService.createRate(body); }
    catch (error) { return handleShippingError(error, set); }
  }, {
    beforeHandle: manageShipping,
    body: CreateShippingRateDto,
    detail: { summary: "Create shipping rate" },
  })
  .patch("/rates/:id", async ({ params: { id }, body, set }) => {
    try { return await shippingService.updateRate(id, body); }
    catch (error) { return handleShippingError(error, set); }
  }, {
    beforeHandle: manageShipping,
    params: ShippingRateIdParamDto,
    body: UpdateShippingRateDto,
    detail: { summary: "Update shipping rate" },
  })
  .delete("/rates/:id", async ({ params: { id }, set }) => {
    try { return await shippingService.disableRate(id); }
    catch (error) { return handleShippingError(error, set); }
  }, {
    beforeHandle: manageShipping,
    params: ShippingRateIdParamDto,
    detail: { summary: "Disable shipping rate" },
  });
