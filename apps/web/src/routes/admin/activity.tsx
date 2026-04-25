import { createFileRoute } from "@tanstack/react-router";
import { AdminActivityPage } from "@/features/admin/activity/activity-page";

export const Route = createFileRoute("/admin/activity")({
  component: AdminActivityPage,
});
