import { createFileRoute } from "@tanstack/react-router";
import { AdminInventoryPage } from "@/features/admin/ecommerce/inventory";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventoryPage,
});
