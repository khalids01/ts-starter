import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminStoreSettingsPage } from "@/features/admin/ecommerce/store-settings";
import { canAccessAdminStoreSettingsRead } from "@/features/admin/lib/admin-access";
import { getRootSession } from "@/features/user/lib/get-root-session";
import { adminMiddleware } from "@/middleware/admin";

export const Route = createFileRoute("/admin/store-settings")({
  server: { middleware: [adminMiddleware] },
  beforeLoad: async ({ context }) => {
    const session = context.session ?? (await getRootSession());
    if (!canAccessAdminStoreSettingsRead(session)) throw redirect({ to: "/admin/overview" });
  },
  component: AdminStoreSettingsPage,
});
