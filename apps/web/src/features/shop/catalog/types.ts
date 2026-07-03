export type DynamicFilterState = Record<
  string,
  { valueIds?: string[]; min?: string; max?: string; boolean?: boolean }
>;

export type ShopSearchState = {
  search: string;
  categoryId: string;
  categoryIds: string;
  brandId: string;
  brandIds: string;
  minPrice: string;
  maxPrice: string;
  inStock: string;
  availability: string;
  sort: string;
  filters: string;
};

export type FilterDraftState = Pick<
  ShopSearchState,
  "categoryIds" | "brandIds" | "minPrice" | "maxPrice" | "availability" | "filters"
>;
