import { createFileRoute } from "@tanstack/react-router";
import { AdminRateLimitsPage } from "@/features/admin/rate-limits/rate-limits-page";

export const Route = createFileRoute("/admin/rate-limits")({
  component: AdminRateLimitsPage,
});
