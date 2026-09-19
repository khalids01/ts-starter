import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import {
  CreateDiscountDto,
  DiscountIdParamDto,
  ListDiscountsQueryDto,
  UpdateDiscountDto,
} from "@/modules/ecommerce/discounts/discounts.dto";
import {
  discountService,
  DiscountServiceError,
} from "@/modules/ecommerce/discounts/discounts.service";

const readDiscounts = requireAllPermissions([Permissions.AdminAccess, Permissions.AdminDiscountsRead]);
const manageDiscounts = requireAllPermissions([Permissions.AdminAccess, Permissions.AdminDiscountsManage]);

function handleError(error: unknown, set: { status?: number | string }) {
  const status = error instanceof DiscountServiceError ? error.status : 400;
  set.status = status;
  return { message: error instanceof Error ? error.message : "Discount operation failed", status };
}

export const adminDiscountsController = new Elysia({
  prefix: "/admin/discounts",
  detail: { tags: ["Admin - Discounts"] },
})
  .use(authGuard)
  .get("/", ({ query }) => discountService.list(query), {
    beforeHandle: readDiscounts,
    query: ListDiscountsQueryDto,
    detail: { summary: "List discount codes" },
  })
  .post("/", async ({ body, set }) => {
    try { return await discountService.create(body); }
    catch (error) { return handleError(error, set); }
  }, {
    beforeHandle: manageDiscounts,
    body: CreateDiscountDto,
    detail: { summary: "Create discount code" },
  })
  .patch("/:id", async ({ params: { id }, body, set }) => {
    try { return await discountService.update(id, body); }
    catch (error) { return handleError(error, set); }
  }, {
    beforeHandle: manageDiscounts,
    params: DiscountIdParamDto,
    body: UpdateDiscountDto,
    detail: { summary: "Update discount code" },
  })
  .delete("/:id", async ({ params: { id }, set }) => {
    try { return await discountService.disable(id); }
    catch (error) { return handleError(error, set); }
  }, {
    beforeHandle: manageDiscounts,
    params: DiscountIdParamDto,
    detail: { summary: "Disable discount code" },
  });
