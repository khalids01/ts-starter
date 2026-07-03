import { createFileRoute } from "@tanstack/react-router";
import { ShopPage } from "@/features/shop";
import { createServerFn } from "@tanstack/react-start";
import { client } from "@/lib/client";
import type { ShopInitialData } from "@/features/shop/shop-page";
import type { PageResult, ShopFilters, ShopProduct } from "@/features/shop/types";

const getShopInitialData = createServerFn({ method: "GET" }).handler(async (): Promise<ShopInitialData> => {
  const [products, filters] = await Promise.all([
    client.shop.products.get({ query: { limit: 20, sort: "newest",  } }),
    client.shop.filters.get({ query: {} }),
  ]);
  client.shop.y

  return {
    products: products.data as PageResult<ShopProduct>,
    filters: filters.data as ShopFilters,
  };
});

export const Route = createFileRoute("/shop")({
  loader: async () => await getShopInitialData(),
  component: ShopRoute,
});

function ShopRoute() {
  const initialData = Route.useLoaderData();
  return <ShopPage initialData={initialData} />;
}
