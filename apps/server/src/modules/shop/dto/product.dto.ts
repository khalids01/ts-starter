import { t } from "elysia";

export const SlugParamDto = t.Object({
  slug: t.String({ minLength: 1 }),
});

export const ListShopProductsQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String()),
  categoryId: t.Optional(t.String()),
  categoryIds: t.Optional(t.String()),
  brandId: t.Optional(t.String()),
  brandIds: t.Optional(t.String()),
  minPrice: t.Optional(t.Numeric({ minimum: 0 })),
  maxPrice: t.Optional(t.Numeric({ minimum: 0 })),
  inStock: t.Optional(t.Boolean()),
  availability: t.Optional(t.String()),
  sort: t.Optional(t.String()),
  filters: t.Optional(t.String()),
});

export const ListShopFiltersQueryDto = t.Object({
  categoryId: t.Optional(t.String()),
  categoryIds: t.Optional(t.String()),
});

export type ListShopProductsQuery = typeof ListShopProductsQueryDto.static;
export type ListShopFiltersQuery = typeof ListShopFiltersQueryDto.static;
