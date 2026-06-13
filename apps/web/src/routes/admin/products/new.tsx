import { createFileRoute } from "@tanstack/react-router";
import { AdminProductBuilderPage } from "@/features/admin/ecommerce/product-builder";

export const Route = createFileRoute("/admin/products/new")({
  component: AdminProductBuilderPage,
});
