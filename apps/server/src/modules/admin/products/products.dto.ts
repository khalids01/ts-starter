import { t } from "elysia";

const HttpUrlDto = t.String({
  maxLength: 2048,
  pattern: "^https?://",
});

export const ProductStatusDto = t.Union([
  t.Literal("draft"),
  t.Literal("active"),
  t.Literal("archived"),
]);

export const WeightUnitDto = t.Union([
  t.Literal("g"),
  t.Literal("kg"),
  t.Literal("lb"),
  t.Literal("oz"),
]);

export const IdParamDto = t.Object({
  id: t.String({ minLength: 1, maxLength: 128 }),
});

export const ListProductsQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String({ maxLength: 200 })),
  status: t.Optional(ProductStatusDto),
  categoryId: t.Optional(t.String({ maxLength: 128 })),
  brandId: t.Optional(t.String({ maxLength: 128 })),
  active: t.Optional(t.Boolean()),
});

export const CreateProductDto = t.Object({
  categoryId: t.String({ minLength: 1, maxLength: 128 }),
  name: t.String({ minLength: 1, maxLength: 200 }),
  slug: t.Optional(t.String({ maxLength: 200 })),
  description: t.Optional(t.Union([t.String({ maxLength: 10_000 }), t.Null()])),
  descriptionHtml: t.Optional(t.Union([t.String({ maxLength: 50_000 }), t.Null()])),
  brandId: t.Optional(t.Union([t.String({ maxLength: 128 }), t.Null()])),
  coverImageUrl: t.Optional(t.Union([HttpUrlDto, t.Null()])),
  searchKeywords: t.Optional(t.Array(t.String({ maxLength: 100 }), { maxItems: 50 })),
  isTrending: t.Optional(t.Boolean()),
  badgeLabel: t.Optional(t.Union([t.String({ maxLength: 80 }), t.Null()])),
  seoTitle: t.Optional(t.Union([t.String({ maxLength: 200 }), t.Null()])),
  seoDescription: t.Optional(t.Union([t.String({ maxLength: 500 }), t.Null()])),
  isFeatured: t.Optional(t.Boolean()),
});

export const UpdateProductDto = t.Partial(
  t.Object({
    categoryId: t.String({ minLength: 1, maxLength: 128 }),
    name: t.String({ minLength: 1, maxLength: 200 }),
    slug: t.String({ maxLength: 200 }),
    description: t.Union([t.String({ maxLength: 10_000 }), t.Null()]),
    descriptionHtml: t.Union([t.String({ maxLength: 50_000 }), t.Null()]),
    brandId: t.Union([t.String({ maxLength: 128 }), t.Null()]),
    status: ProductStatusDto,
    isActive: t.Boolean(),
    isFeatured: t.Boolean(),
    coverImageUrl: t.Union([HttpUrlDto, t.Null()]),
    searchKeywords: t.Array(t.String({ maxLength: 100 }), { maxItems: 50 }),
    isTrending: t.Boolean(),
    badgeLabel: t.Union([t.String({ maxLength: 80 }), t.Null()]),
    seoTitle: t.Union([t.String({ maxLength: 200 }), t.Null()]),
    seoDescription: t.Union([t.String({ maxLength: 500 }), t.Null()]),
  }),
);

export const ProductAttributeAssignmentDto = t.Object({
  attributeId: t.String({ minLength: 1, maxLength: 128 }),
  attributeValueId: t.Optional(t.Union([t.String({ maxLength: 128 }), t.Null()])),
  attributeValueIds: t.Optional(t.Array(t.String({ minLength: 1, maxLength: 128 }), { maxItems: 100 })),
  rawText: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
  rawNumber: t.Optional(t.Union([t.String({ maxLength: 64 }), t.Number(), t.Null()])),
  rawBoolean: t.Optional(t.Union([t.Boolean(), t.Null()])),
  rawDate: t.Optional(t.Union([t.String({ maxLength: 64 }), t.Null()])),
  displayValue: t.Optional(t.Union([t.String({ maxLength: 500 }), t.Null()])),
});

export const ReplaceProductAttributesDto = t.Object({
  assignments: t.Array(ProductAttributeAssignmentDto, { maxItems: 100 }),
});

export const ProductVariantInputDto = t.Object({
  id: t.Optional(t.String({ minLength: 1, maxLength: 128 })),
  sku: t.Optional(t.String({ maxLength: 120 })),
  barcode: t.Optional(t.Union([t.String({ maxLength: 120 }), t.Null()])),
  name: t.Optional(t.String({ maxLength: 200 })),
  price: t.Union([t.String({ maxLength: 32 }), t.Number()]),
  compareAtPrice: t.Optional(t.Union([t.String({ maxLength: 32 }), t.Number(), t.Null()])),
  costPrice: t.Optional(t.Union([t.String({ maxLength: 32 }), t.Number(), t.Null()])),
  currency: t.Optional(t.String({ minLength: 3, maxLength: 3 })),
  isDefault: t.Optional(t.Boolean()),
  isActive: t.Optional(t.Boolean()),
  imageUrls: t.Optional(t.Array(HttpUrlDto, { maxItems: 20 })),
  weightValue: t.Optional(t.Union([t.String({ maxLength: 32 }), t.Number(), t.Null()])),
  weightUnit: t.Optional(t.Union([WeightUnitDto, t.Null()])),
  attributeValueIds: t.Optional(t.Array(t.String({ minLength: 1, maxLength: 128 }), { maxItems: 100 })),
});

export const ReplaceProductVariantsDto = t.Object({
  variants: t.Array(ProductVariantInputDto, { maxItems: 100 }),
});

export const ProductHighlightInputDto = t.Object({
  title: t.String({ minLength: 1, maxLength: 200 }),
  description: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
  iconUrl: t.Optional(t.Union([HttpUrlDto, t.Null()])),
  imageUrl: t.Optional(t.Union([HttpUrlDto, t.Null()])),
  sortOrder: t.Optional(t.Number()),
});

export const ReplaceProductHighlightsDto = t.Object({
  highlights: t.Array(ProductHighlightInputDto, { maxItems: 20 }),
});

export type ListProductsQuery = typeof ListProductsQueryDto.static;
export type CreateProductInput = typeof CreateProductDto.static;
export type UpdateProductInput = typeof UpdateProductDto.static;
export type ProductAttributeAssignmentInput =
  typeof ProductAttributeAssignmentDto.static;
export type ReplaceProductAttributesInput =
  typeof ReplaceProductAttributesDto.static;
export type ProductVariantInput = typeof ProductVariantInputDto.static;
export type ReplaceProductVariantsInput =
  typeof ReplaceProductVariantsDto.static;
export type ProductHighlightInput = typeof ProductHighlightInputDto.static;
export type ReplaceProductHighlightsInput =
  typeof ReplaceProductHighlightsDto.static;
