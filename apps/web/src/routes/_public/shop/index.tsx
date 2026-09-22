import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ShopPage } from "@/features/shop";
import type { ShopInitialData } from "@/features/shop/shop-page";
import type { PageResult, ShopFilters, ShopProduct } from "@/features/shop/types";
import { client } from "@/lib/client";

const getShopInitialData = createServerFn({ method: "GET" }).handler(async (): Promise<ShopInitialData> => {
  const [products, filters] = await Promise.all([
    client.shop.products.get({ query: { limit: 20, sort: "newest" } }),
    client.shop.filters.get({ query: {} }),
  ]);
  return {
    products: products.data as PageResult<ShopProduct>,
    filters: filters.data as ShopFilters,
  };
});

export const Route = createFileRoute("/_public/shop/")({
  loader: async () => await getShopInitialData(),
  component: ShopRoute,
});

function ShopRoute() {
  return <ShopPage initialData={Route.useLoaderData()} />;
}
