import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminDiscountsPage } from "@/features/admin/ecommerce/discounts";
import { canAccessAdminDiscountsRead } from "@/features/admin/lib/admin-access";
import { getRootSession } from "@/features/user/lib/get-root-session";
import { adminMiddleware } from "@/middleware/admin";

export const Route = createFileRoute("/admin/discounts")({
  server: { middleware: [adminMiddleware] },
  beforeLoad: async ({ context }) => {
    const session = context.session ?? (await getRootSession());
    if (!canAccessAdminDiscountsRead(session)) {
      throw redirect({ to: "/admin/overview" });
    }
  },
  component: AdminDiscountsPage,
});
