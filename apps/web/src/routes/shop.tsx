import { createFileRoute } from "@tanstack/react-router";
import { ShopPage } from "@/features/shop";

export const Route = createFileRoute("/shop")({
  validateSearch: (search) => ({
    search: typeof search.search === "string" ? search.search : "",
    categoryId: typeof search.categoryId === "string" ? search.categoryId : "all",
    brandId: typeof search.brandId === "string" ? search.brandId : "all",
  }),
  component: ShopPage,
});
