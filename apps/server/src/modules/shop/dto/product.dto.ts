import { t } from "elysia";

export const SlugParamDto = t.Object({
  slug: t.String({ minLength: 1, maxLength: 160 }),
});

export const ListShopProductsQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String({ maxLength: 200 })),
  categoryId: t.Optional(t.String({ maxLength: 128 })),
  categoryIds: t.Optional(t.String({ maxLength: 2000 })),
  brandId: t.Optional(t.String({ maxLength: 128 })),
  brandIds: t.Optional(t.String({ maxLength: 2000 })),
  minPrice: t.Optional(t.Numeric({ minimum: 0 })),
  maxPrice: t.Optional(t.Numeric({ minimum: 0 })),
  inStock: t.Optional(t.Boolean()),
  availability: t.Optional(t.String({ maxLength: 40 })),
  sort: t.Optional(t.String({ maxLength: 40 })),
  filters: t.Optional(t.String({ maxLength: 8000 })),
});

export const ListShopFiltersQueryDto = t.Object({
  categoryId: t.Optional(t.String({ maxLength: 128 })),
  categoryIds: t.Optional(t.String({ maxLength: 2000 })),
});

export type ListShopProductsQuery = typeof ListShopProductsQueryDto.static;
export type ListShopFiltersQuery = typeof ListShopFiltersQueryDto.static;
