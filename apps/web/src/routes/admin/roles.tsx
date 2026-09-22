import { createFileRoute, redirect } from "@tanstack/react-router";
import { RolesListPage } from "@/features/admin/roles/roles-list-page";
import { canAccessAdminRolesRead } from "@/features/admin/lib/admin-access";
import { getRootSession } from "@/features/user/lib/get-root-session";
import { adminMiddleware } from "@/middleware/admin";

export const Route = createFileRoute("/admin/roles")({
  server: {
    middleware: [adminMiddleware],
  },
  beforeLoad: async ({ context }) => {
    const session = context.session ?? (await getRootSession());
    if (!canAccessAdminRolesRead(session)) {
      throw redirect({ to: "/admin/overview" });
    }
  },

  component: RolesListPage,
});
