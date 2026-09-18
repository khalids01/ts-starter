import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShippingPage } from "@/features/admin/ecommerce/shipping";
import { canAccessAdminShippingRead } from "@/features/admin/lib/admin-access";
import { getRootSession } from "@/features/user/lib/get-root-session";
import { adminMiddleware } from "@/middleware/admin";

export const Route = createFileRoute("/admin/shipping")({
  server: { middleware: [adminMiddleware] },
  beforeLoad: async ({ context }) => {
    const session = context.session ?? (await getRootSession());
    if (!canAccessAdminShippingRead(session)) throw redirect({ to: "/admin/overview" });
  },
  component: AdminShippingPage,
});
