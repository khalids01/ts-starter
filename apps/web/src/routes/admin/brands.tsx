import { createFileRoute, redirect } from "@tanstack/react-router";
import { canAccessAdminCatalogRead } from "@/features/admin/lib/admin-access";
import { AdminBrandsPage } from "@/features/admin/ecommerce/catalog";
import { getRootSession } from "@/features/user/lib/get-root-session";
import { adminMiddleware } from "@/middleware/admin";

export const Route = createFileRoute("/admin/brands")({
  server: {
    middleware: [adminMiddleware],
  },
  beforeLoad: async ({ context }) => {
    const session = context.session ?? (await getRootSession());

    if (!canAccessAdminCatalogRead(session)) {
      throw redirect({ to: "/admin/overview" });
    }
  },
  component: AdminBrandsPage,
});
