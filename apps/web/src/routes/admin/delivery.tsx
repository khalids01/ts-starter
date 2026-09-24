import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminDeliveryPage } from "@/features/admin/ecommerce/delivery";
import { canAccessAdminDeliveryRead } from "@/features/admin/lib/admin-access";
import { getRootSession } from "@/features/user/lib/get-root-session";
import { adminMiddleware } from "@/middleware/admin";

export const Route = createFileRoute("/admin/delivery")({
  server: { middleware: [adminMiddleware] },
  beforeLoad: async ({ context }) => {
    const session = context.session ?? (await getRootSession());
    if (!canAccessAdminDeliveryRead(session)) {
      throw redirect({ to: "/admin/overview" });
    }
  },
  component: AdminDeliveryPage,
});
