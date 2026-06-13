import { createFileRoute } from "@tanstack/react-router";
import { AdminCatalogPage } from "@/features/admin/ecommerce/catalog";

export const Route = createFileRoute("/admin/catalog")({
  component: AdminCatalogPage,
});
