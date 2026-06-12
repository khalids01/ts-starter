import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import {
  AdjustStockDto,
  CreateLocationDto,
  CreateSupplierDto,
  IdParamDto,
  ListInventoryQueryDto,
  ListMovementsQueryDto,
  ListStocksQueryDto,
  ReceiveStockDto,
  UpdateLocationDto,
  UpdateSupplierDto,
} from "./inventory.dto";
import {
  adminInventoryService,
  AdminInventoryServiceError,
} from "./inventory.service";

function handleInventoryError(error: unknown, set: { status?: number | string }) {
  if (error instanceof AdminInventoryServiceError) {
    set.status = error.status;
    return { message: error.message, status: error.status };
  }

  const message =
    error instanceof Error ? error.message : "Inventory operation failed";
  set.status = 400;
  return { message, status: 400 };
}

const readInventory = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminInventoryRead,
]);
const manageInventory = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminInventoryManage,
]);

export const adminInventoryController = new Elysia({
  prefix: "/admin/inventory",
  detail: {
    tags: ["Admin - Inventory"],
  },
})
  .use(authGuard)
  .get(
    "/suppliers",
    ({ query }) => adminInventoryService.listSuppliers(query),
    {
      beforeHandle: readInventory,
      query: ListInventoryQueryDto,
      detail: { summary: "List inventory suppliers" },
    },
  )
  .get(
    "/suppliers/:id",
    async ({ params: { id }, set }) => {
      try {
        return await adminInventoryService.getSupplier(id);
      } catch (error) {
        return handleInventoryError(error, set);
      }
    },
    {
      beforeHandle: readInventory,
      params: IdParamDto,
      detail: { summary: "Get inventory supplier" },
    },
  )
  .post(
    "/suppliers",
    async ({ body, set }) => {
      try {
        return await adminInventoryService.createSupplier(body);
      } catch (error) {
        return handleInventoryError(error, set);
      }
    },
    {
      beforeHandle: manageInventory,
      body: CreateSupplierDto,
      detail: { summary: "Create inventory supplier" },
    },
  )
  .patch(
    "/suppliers/:id",
    async ({ params: { id }, body, set }) => {
      try {
        return await adminInventoryService.updateSupplier(id, body);
      } catch (error) {
        return handleInventoryError(error, set);
      }
    },
    {
      beforeHandle: manageInventory,
      params: IdParamDto,
      body: UpdateSupplierDto,
      detail: { summary: "Update inventory supplier" },
    },
  )
  .delete(
    "/suppliers/:id",
    async ({ params: { id }, set }) => {
      try {
        return await adminInventoryService.disableSupplier(id);
      } catch (error) {
        return handleInventoryError(error, set);
      }
    },
    {
      beforeHandle: manageInventory,
      params: IdParamDto,
      detail: { summary: "Disable inventory supplier" },
    },
  )
  .get(
    "/locations",
    ({ query }) => adminInventoryService.listLocations(query),
    {
      beforeHandle: readInventory,
      query: ListInventoryQueryDto,
      detail: { summary: "List inventory locations" },
    },
  )
  .get(
    "/locations/:id",
    async ({ params: { id }, set }) => {
      try {
        return await adminInventoryService.getLocation(id);
      } catch (error) {
        return handleInventoryError(error, set);
      }
    },
    {
      beforeHandle: readInventory,
      params: IdParamDto,
      detail: { summary: "Get inventory location" },
    },
  )
  .post(
    "/locations",
    async ({ body, set }) => {
      try {
        return await adminInventoryService.createLocation(body);
      } catch (error) {
        return handleInventoryError(error, set);
      }
    },
    {
      beforeHandle: manageInventory,
      body: CreateLocationDto,
      detail: { summary: "Create inventory location" },
    },
  )
  .patch(
    "/locations/:id",
    async ({ params: { id }, body, set }) => {
      try {
        return await adminInventoryService.updateLocation(id, body);
      } catch (error) {
        return handleInventoryError(error, set);
      }
    },
    {
      beforeHandle: manageInventory,
      params: IdParamDto,
      body: UpdateLocationDto,
      detail: { summary: "Update inventory location" },
    },
  )
  .delete(
    "/locations/:id",
    async ({ params: { id }, set }) => {
      try {
        return await adminInventoryService.disableLocation(id);
      } catch (error) {
        return handleInventoryError(error, set);
      }
    },
    {
      beforeHandle: manageInventory,
      params: IdParamDto,
      detail: { summary: "Disable inventory location" },
    },
  )
  .get(
    "/stocks",
    ({ query }) => adminInventoryService.listStocks(query),
    {
      beforeHandle: readInventory,
      query: ListStocksQueryDto,
      detail: { summary: "List inventory stock" },
    },
  )
  .get(
    "/movements",
    ({ query }) => adminInventoryService.listMovements(query),
    {
      beforeHandle: readInventory,
      query: ListMovementsQueryDto,
      detail: { summary: "List inventory movements" },
    },
  )
  .post(
    "/receive",
    async ({ body, userId, set }) => {
      try {
        return await adminInventoryService.receiveStock(body, { userId });
      } catch (error) {
        return handleInventoryError(error, set);
      }
    },
    {
      beforeHandle: manageInventory,
      body: ReceiveStockDto,
      detail: { summary: "Receive inventory stock" },
    },
  )
  .post(
    "/adjust",
    async ({ body, userId, set }) => {
      try {
        return await adminInventoryService.adjustStock(body, { userId });
      } catch (error) {
        return handleInventoryError(error, set);
      }
    },
    {
      beforeHandle: manageInventory,
      body: AdjustStockDto,
      detail: { summary: "Adjust inventory stock" },
    },
  );
