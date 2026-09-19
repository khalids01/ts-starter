import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { canAccessAdminCustomersRead } from "@/features/admin/lib/admin-access";
import { getRootSession } from "@/features/user/lib/get-root-session";
import { adminMiddleware } from "@/middleware/admin";

export const Route = createFileRoute("/admin/customers")({
  server: { middleware: [adminMiddleware] },
  beforeLoad: async ({ context }) => {
    const session = context.session ?? (await getRootSession());
    if (!canAccessAdminCustomersRead(session)) throw redirect({ to: "/admin/overview" });
  },
  component: Outlet,
});
