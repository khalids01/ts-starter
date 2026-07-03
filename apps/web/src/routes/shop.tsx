import { createFileRoute } from "@tanstack/react-router";
import { ShopPage } from "@/features/shop";

export const Route = createFileRoute("/shop")({
  validateSearch: (search) => {
    const legacyCategoryId = typeof search.categoryId === "string" && search.categoryId !== "all"
      ? search.categoryId
      : "";
    const legacyBrandId = typeof search.brandId === "string" && search.brandId !== "all"
      ? search.brandId
      : "";

    return {
      search: typeof search.search === "string" ? search.search : "",
      categoryId: legacyCategoryId || "all",
      categoryIds: typeof search.categoryIds === "string" ? search.categoryIds : legacyCategoryId,
      brandId: legacyBrandId || "all",
      brandIds: typeof search.brandIds === "string" ? search.brandIds : legacyBrandId,
      minPrice: typeof search.minPrice === "string" ? search.minPrice : "",
      maxPrice: typeof search.maxPrice === "string" ? search.maxPrice : "",
      inStock: search.inStock === "true" ? "true" : "all",
      availability:
        search.availability === "in-stock" || search.availability === "out-of-stock"
          ? search.availability
          : "all",
      sort: typeof search.sort === "string" ? search.sort : "newest",
      filters: typeof search.filters === "string" ? search.filters : "",
    };
  },
  component: ShopPage,
});
