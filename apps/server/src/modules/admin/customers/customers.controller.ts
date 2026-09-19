import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import { CustomerIdParamDto, ListCustomersQueryDto, UpdateCustomerDto } from "./customers.dto";
import { adminCustomersService, AdminCustomersServiceError } from "./customers.service";

const readCustomers = requireAllPermissions([Permissions.AdminAccess, Permissions.AdminCustomersRead]);
const manageCustomers = requireAllPermissions([Permissions.AdminAccess, Permissions.AdminCustomersManage]);

function handleError(error: unknown, set: { status?: number | string }) {
  const status = error instanceof AdminCustomersServiceError ? error.status : 400;
  set.status = status;
  return { message: error instanceof Error ? error.message : "Customer operation failed", status };
}

export const adminCustomersController = new Elysia({ prefix: "/admin/customers", detail: { tags: ["Admin - Customers"] } })
  .use(authGuard)
  .get("/", ({ query }) => adminCustomersService.list(query), { beforeHandle: readCustomers, query: ListCustomersQueryDto, detail: { summary: "List ecommerce customers" } })
  .get("/:id", async ({ params: { id }, set }) => {
    try { return await adminCustomersService.detail(id); }
    catch (error) { return handleError(error, set); }
  }, { beforeHandle: readCustomers, params: CustomerIdParamDto, detail: { summary: "Get ecommerce customer" } })
  .patch("/:id", async ({ params: { id }, body, set }) => {
    try { return await adminCustomersService.update(id, body); }
    catch (error) { return handleError(error, set); }
  }, { beforeHandle: manageCustomers, params: CustomerIdParamDto, body: UpdateCustomerDto, detail: { summary: "Update ecommerce customer" } });
