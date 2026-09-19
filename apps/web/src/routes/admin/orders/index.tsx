import { createFileRoute } from "@tanstack/react-router";
import { AdminOrdersPage } from "@/features/admin/ecommerce/orders";

export const Route = createFileRoute("/admin/orders/")({
  component: AdminOrdersPage,
});
