import { createFileRoute, redirect } from "@tanstack/react-router";
import { canAccessAdminOrdersRead } from "@/features/admin/lib/admin-access";
import { AdminOrdersPage } from "@/features/admin/ecommerce/orders";
import { getRootSession } from "@/features/user/lib/get-root-session";
import { adminMiddleware } from "@/middleware/admin";

export const Route = createFileRoute("/admin/orders")({
  server: {
    middleware: [adminMiddleware],
  },
  beforeLoad: async ({ context }) => {
    const session = context.session ?? (await getRootSession());

    if (!canAccessAdminOrdersRead(session)) {
      throw redirect({ to: "/admin/overview" });
    }
  },
  component: AdminOrdersPage,
});
