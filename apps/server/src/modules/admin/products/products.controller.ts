import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import {
  CreateProductDto,
  IdParamDto,
  ListProductsQueryDto,
  ReplaceProductAttributesDto,
  ReplaceProductVariantsDto,
  UpdateProductDto,
} from "./products.dto";
import {
  adminProductsService,
  AdminProductServiceError,
} from "./products.service";

function handleProductError(error: unknown, set: { status?: number | string }) {
  if (error instanceof AdminProductServiceError) {
    set.status = error.status;
    return { message: error.message, status: error.status };
  }

  const message =
    error instanceof Error ? error.message : "Product operation failed";
  set.status = 400;
  return { message, status: 400 };
}

const readProducts = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminProductsRead,
]);
const manageProducts = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminProductsManage,
]);

export const adminProductsController = new Elysia({
  prefix: "/admin/products",
  detail: {
    tags: ["Admin - Products"],
  },
})
  .use(authGuard)
  .get(
    "/",
    ({ query }) => adminProductsService.listProducts(query),
    {
      beforeHandle: readProducts,
      query: ListProductsQueryDto,
      detail: {
        summary: "List products",
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        return await adminProductsService.getProduct(id);
      } catch (error) {
        return handleProductError(error, set);
      }
    },
    {
      beforeHandle: readProducts,
      params: IdParamDto,
      detail: {
        summary: "Get product details",
      },
    },
  )
  .post(
    "/",
    async ({ body, set }) => {
      try {
        return await adminProductsService.createProduct(body);
      } catch (error) {
        return handleProductError(error, set);
      }
    },
    {
      beforeHandle: manageProducts,
      body: CreateProductDto,
      detail: {
        summary: "Create draft product",
      },
    },
  )
  .patch(
    "/:id",
    async ({ params: { id }, body, set }) => {
      try {
        return await adminProductsService.updateProduct(id, body);
      } catch (error) {
        return handleProductError(error, set);
      }
    },
    {
      beforeHandle: manageProducts,
      params: IdParamDto,
      body: UpdateProductDto,
      detail: {
        summary: "Update product",
      },
    },
  )
  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        return await adminProductsService.archiveProduct(id);
      } catch (error) {
        return handleProductError(error, set);
      }
    },
    {
      beforeHandle: manageProducts,
      params: IdParamDto,
      detail: {
        summary: "Archive product",
      },
    },
  )
  .put(
    "/:id/attributes",
    async ({ params: { id }, body, set }) => {
      try {
        return await adminProductsService.replaceProductAttributes(id, body);
      } catch (error) {
        return handleProductError(error, set);
      }
    },
    {
      beforeHandle: manageProducts,
      params: IdParamDto,
      body: ReplaceProductAttributesDto,
      detail: {
        summary: "Replace product attribute assignments",
      },
    },
  )
  .put(
    "/:id/variants",
    async ({ params: { id }, body, set }) => {
      try {
        return await adminProductsService.replaceProductVariants(id, body);
      } catch (error) {
        return handleProductError(error, set);
      }
    },
    {
      beforeHandle: manageProducts,
      params: IdParamDto,
      body: ReplaceProductVariantsDto,
      detail: {
        summary: "Replace product variants",
      },
    },
  )
  .post(
    "/:id/validate",
    async ({ params: { id }, set }) => {
      try {
        return await adminProductsService.validateProduct(id);
      } catch (error) {
        return handleProductError(error, set);
      }
    },
    {
      beforeHandle: manageProducts,
      params: IdParamDto,
      detail: {
        summary: "Validate product for activation",
      },
    },
  );
