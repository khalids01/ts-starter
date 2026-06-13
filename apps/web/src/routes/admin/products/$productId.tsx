import { createFileRoute } from "@tanstack/react-router";
import { AdminProductBuilderPage } from "@/features/admin/ecommerce/product-builder";

export const Route = createFileRoute("/admin/products/$productId")({
  component: ProductBuilderRoute,
});

function ProductBuilderRoute() {
  const { productId } = Route.useParams();

  return <AdminProductBuilderPage productId={productId} />;
}
