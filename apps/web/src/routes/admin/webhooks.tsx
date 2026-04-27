import { createFileRoute } from "@tanstack/react-router";
import { AdminWebhooksPage } from "@/features/admin/webhooks/webhooks-page";

export const Route = createFileRoute("/admin/webhooks")({
  component: AdminWebhooksPage,
});

