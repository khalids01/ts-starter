import { Elysia } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import {
  AssignCategoryAttributeDto,
  CreateAttributeDto,
  CreateAttributeValueDto,
  CreateBrandDto,
  CreateCategoryDto,
  IdParamDto,
  ListCatalogQueryDto,
  UpdateAttributeDto,
  UpdateAttributeValueDto,
  UpdateBrandDto,
  UpdateCategoryAttributeDto,
  UpdateCategoryDto,
} from "./catalog.dto";
import {
  adminCatalogService,
  CatalogServiceError,
} from "./catalog.service";

function handleCatalogError(error: unknown, set: { status?: number | string }) {
  if (error instanceof CatalogServiceError) {
    set.status = error.status;
    return { message: error.message, status: error.status };
  }

  const message =
    error instanceof Error ? error.message : "Catalog operation failed";
  set.status = 400;
  return { message, status: 400 };
}

const readCatalog = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminCatalogRead,
]);
const manageCatalog = requireAllPermissions([
  Permissions.AdminAccess,
  Permissions.AdminCatalogManage,
]);

export const adminCatalogController = new Elysia({
  prefix: "/admin/catalog",
  detail: {
    tags: ["Admin - Catalog"],
  },
})
  .use(authGuard)
  .get(
    "/categories",
    ({ query }) => adminCatalogService.listCategories(query),
    {
      beforeHandle: readCatalog,
      query: ListCatalogQueryDto,
      detail: {
        summary: "List catalog categories",
      },
    },
  )
  .get(
    "/categories/:id",
    async ({ params: { id }, set }) => {
      try {
        return await adminCatalogService.getCategory(id);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: readCatalog,
      params: IdParamDto,
      detail: {
        summary: "Get category details",
      },
    },
  )
  .get(
    "/categories/:id/template",
    async ({ params: { id }, set }) => {
      try {
        return await adminCatalogService.getCategoryTemplate(id);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: readCatalog,
      params: IdParamDto,
      detail: {
        summary: "Get category dynamic form template",
      },
    },
  )
  .post(
    "/categories",
    async ({ body, set }) => {
      try {
        return await adminCatalogService.createCategory(body);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: manageCatalog,
      body: CreateCategoryDto,
      detail: {
        summary: "Create catalog category",
      },
    },
  )
  .patch(
    "/categories/:id",
    async ({ params: { id }, body, set }) => {
      try {
        return await adminCatalogService.updateCategory(id, body);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: manageCatalog,
      params: IdParamDto,
      body: UpdateCategoryDto,
      detail: {
        summary: "Update catalog category",
      },
    },
  )
  .delete(
    "/categories/:id",
    async ({ params: { id }, set }) => {
      try {
        return await adminCatalogService.disableCategory(id);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: manageCatalog,
      params: IdParamDto,
      detail: {
        summary: "Disable catalog category",
      },
    },
  )
  .get(
    "/attributes",
    ({ query }) => adminCatalogService.listAttributes(query),
    {
      beforeHandle: readCatalog,
      query: ListCatalogQueryDto,
      detail: {
        summary: "List product attributes",
      },
    },
  )
  .post(
    "/attributes",
    async ({ body, set }) => {
      try {
        return await adminCatalogService.createAttribute(body);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: manageCatalog,
      body: CreateAttributeDto,
      detail: {
        summary: "Create product attribute",
      },
    },
  )
  .patch(
    "/attributes/:id",
    async ({ params: { id }, body, set }) => {
      try {
        return await adminCatalogService.updateAttribute(id, body);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: manageCatalog,
      params: IdParamDto,
      body: UpdateAttributeDto,
      detail: {
        summary: "Update product attribute",
      },
    },
  )
  .post(
    "/attributes/:id/values",
    async ({ params: { id }, body, set }) => {
      try {
        return await adminCatalogService.upsertAttributeValue(id, body);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: manageCatalog,
      params: IdParamDto,
      body: CreateAttributeValueDto,
      detail: {
        summary: "Create or update attribute value",
      },
    },
  )
  .patch(
    "/attribute-values/:id",
    async ({ params: { id }, body, set }) => {
      try {
        return await adminCatalogService.updateAttributeValue(id, body);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: manageCatalog,
      params: IdParamDto,
      body: UpdateAttributeValueDto,
      detail: {
        summary: "Update attribute value",
      },
    },
  )
  .post(
    "/categories/:id/attributes",
    async ({ params: { id }, body, set }) => {
      try {
        return await adminCatalogService.assignCategoryAttribute(id, body);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: manageCatalog,
      params: IdParamDto,
      body: AssignCategoryAttributeDto,
      detail: {
        summary: "Assign attribute to category template",
      },
    },
  )
  .patch(
    "/category-attributes/:id",
    async ({ params: { id }, body, set }) => {
      try {
        return await adminCatalogService.updateCategoryAttribute(id, body);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: manageCatalog,
      params: IdParamDto,
      body: UpdateCategoryAttributeDto,
      detail: {
        summary: "Update category template attribute",
      },
    },
  )
  .delete(
    "/category-attributes/:id",
    async ({ params: { id }, set }) => {
      try {
        return await adminCatalogService.deleteCategoryAttribute(id);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: manageCatalog,
      params: IdParamDto,
      detail: {
        summary: "Remove category template attribute",
      },
    },
  )
  .get(
    "/brands",
    ({ query }) => adminCatalogService.listBrands(query),
    {
      beforeHandle: readCatalog,
      query: ListCatalogQueryDto,
      detail: {
        summary: "List product brands",
      },
    },
  )
  .post(
    "/brands",
    async ({ body, set }) => {
      try {
        return await adminCatalogService.createBrand(body);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: manageCatalog,
      body: CreateBrandDto,
      detail: {
        summary: "Create product brand",
      },
    },
  )
  .patch(
    "/brands/:id",
    async ({ params: { id }, body, set }) => {
      try {
        return await adminCatalogService.updateBrand(id, body);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: manageCatalog,
      params: IdParamDto,
      body: UpdateBrandDto,
      detail: {
        summary: "Update product brand",
      },
    },
  )
  .delete(
    "/brands/:id",
    async ({ params: { id }, set }) => {
      try {
        return await adminCatalogService.disableBrand(id);
      } catch (error) {
        return handleCatalogError(error, set);
      }
    },
    {
      beforeHandle: manageCatalog,
      params: IdParamDto,
      detail: {
        summary: "Disable product brand",
      },
    },
  );
