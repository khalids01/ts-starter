import { createFileRoute, redirect } from "@tanstack/react-router";
import { canAccessAdminImagesRead } from "@/features/admin/lib/admin-access";
import { AdminImagesPage } from "@/features/admin/images";
import { getRootSession } from "@/features/user/lib/get-root-session";
import { adminMiddleware } from "@/middleware/admin";

export const Route = createFileRoute("/admin/images")({
  server: {
    middleware: [adminMiddleware],
  },
  beforeLoad: async ({ context }) => {
    const session = context.session ?? (await getRootSession());

    if (!canAccessAdminImagesRead(session)) {
      throw redirect({ to: "/admin/overview" });
    }
  },
  component: AdminImagesPage,
});
