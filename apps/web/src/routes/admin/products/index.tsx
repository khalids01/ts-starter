import { createFileRoute } from "@tanstack/react-router";
import { AdminProductsPage } from "@/features/admin/ecommerce/products";

export const Route = createFileRoute("/admin/products/")({
  component: AdminProductsPage,
});
