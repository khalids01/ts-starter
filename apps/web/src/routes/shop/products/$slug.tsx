import { createFileRoute } from "@tanstack/react-router";
import { ShopProductPage } from "@/features/shop";

export const Route = createFileRoute("/shop/products/$slug")({
  component: ProductRoute,
});

function ProductRoute() {
  const { slug } = Route.useParams();

  return <ShopProductPage slug={slug} />;
}
