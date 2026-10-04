import { Elysia, t } from "elysia";
import { Permissions } from "@rbac";
import { authGuard } from "@/guards/auth.guard";
import { requireAllPermissions } from "@/rbac/guards/permissions.guard";
import {
  CatalogLifecycleError,
  changeCatalogLifecycle,
  listArchivedCatalog,
} from "./service";
const kind = t.Union([
  t.Literal("category"),
  t.Literal("brand"),
  t.Literal("attribute"),
  t.Literal("product"),
]);
export const catalogLifecycleController = new Elysia({ prefix: "/lifecycle" })
  .use(authGuard)
  .get(
    "/:kind",
    ({ params, query }) =>
      listArchivedCatalog(params.kind, query.page, query.limit),
    {
      params: t.Object({ kind }),
      query: t.Object({
        page: t.Optional(t.Numeric({ minimum: 1, maximum: 100000 })),
        limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
      }),
      beforeHandle: (ctx) =>
        requireAllPermissions([
          Permissions.AdminAccess,
          ctx.params.kind === "product"
            ? Permissions.AdminProductsRead
            : Permissions.AdminCatalogRead,
        ])(ctx),
    },
  )
  .post(
    "/:kind/:id/:action",
    async ({ params, set }) => {
      try {
        return await changeCatalogLifecycle(
          params.kind,
          params.id,
          params.action,
        );
      } catch (error) {
        set.status =
          error instanceof CatalogLifecycleError ? error.status : 400;
        return {
          message:
            error instanceof CatalogLifecycleError
              ? error.message
              : "Catalog operation failed",
          status: Number(set.status),
        };
      }
    },
    {
      params: t.Object({
        kind,
        id: t.String({ minLength: 1, maxLength: 128 }),
        action: t.Union([
          t.Literal("archive"),
          t.Literal("restore"),
          t.Literal("delete"),
        ]),
      }),
      beforeHandle: (ctx) =>
        requireAllPermissions([
          Permissions.AdminAccess,
          ctx.params.kind === "product"
            ? Permissions.AdminProductsManage
            : Permissions.AdminCatalogManage,
        ])(ctx),
    },
  );
