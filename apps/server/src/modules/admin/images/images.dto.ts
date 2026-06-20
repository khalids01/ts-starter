import { t } from "elysia";

export const ImageSortByDto = t.Union([
  t.Literal("createdAt"),
  t.Literal("updatedAt"),
  t.Literal("name"),
  t.Literal("size"),
  t.Literal("type"),
]);

export const SortOrderDto = t.Union([t.Literal("asc"), t.Literal("desc")]);

export const ListImagesQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String()),
  contentType: t.Optional(t.String()),
  sortBy: t.Optional(ImageSortByDto),
  sortOrder: t.Optional(SortOrderDto),
});

export const IdParamDto = t.Object({
  id: t.String({ minLength: 1 }),
});

export type ListImagesQuery = typeof ListImagesQueryDto.static;
