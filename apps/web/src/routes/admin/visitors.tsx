import { createFileRoute } from "@tanstack/react-router";
import { AdminVisitorsPage } from "@/features/admin/visitors/visitors-page";

export const Route = createFileRoute("/admin/visitors")({
  component: AdminVisitorsPage,
});
