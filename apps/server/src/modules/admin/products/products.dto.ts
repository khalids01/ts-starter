import { t } from "elysia";

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
  id: t.String({ minLength: 1 }),
});

export const ProductMediaItemDto = t.Object({
  url: t.String({ minLength: 1 }),
  alt: t.Optional(t.Union([t.String(), t.Null()])),
  type: t.Optional(t.Union([t.String(), t.Null()])),
  sortOrder: t.Optional(t.Number()),
});

export const ProductMediaDto = t.Array(ProductMediaItemDto);

export const ListProductsQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String()),
  status: t.Optional(ProductStatusDto),
  categoryId: t.Optional(t.String()),
  brandId: t.Optional(t.String()),
  active: t.Optional(t.Boolean()),
});

export const CreateProductDto = t.Object({
  categoryId: t.String({ minLength: 1 }),
  name: t.String({ minLength: 1 }),
  slug: t.Optional(t.String()),
  description: t.Optional(t.Union([t.String(), t.Null()])),
  descriptionHtml: t.Optional(t.Union([t.String(), t.Null()])),
  brandId: t.Optional(t.Union([t.String(), t.Null()])),
  media: t.Optional(t.Union([ProductMediaDto, t.Null()])),
  seoTitle: t.Optional(t.Union([t.String(), t.Null()])),
  seoDescription: t.Optional(t.Union([t.String(), t.Null()])),
  isFeatured: t.Optional(t.Boolean()),
});

export const UpdateProductDto = t.Partial(
  t.Object({
    categoryId: t.String({ minLength: 1 }),
    name: t.String({ minLength: 1 }),
    slug: t.String(),
    description: t.Union([t.String(), t.Null()]),
    descriptionHtml: t.Union([t.String(), t.Null()]),
    brandId: t.Union([t.String(), t.Null()]),
    status: ProductStatusDto,
    isActive: t.Boolean(),
    isFeatured: t.Boolean(),
    media: t.Union([ProductMediaDto, t.Null()]),
    seoTitle: t.Union([t.String(), t.Null()]),
    seoDescription: t.Union([t.String(), t.Null()]),
  }),
);

export const ProductAttributeAssignmentDto = t.Object({
  attributeId: t.String({ minLength: 1 }),
  attributeValueId: t.Optional(t.Union([t.String(), t.Null()])),
  attributeValueIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
  rawText: t.Optional(t.Union([t.String(), t.Null()])),
  rawNumber: t.Optional(t.Union([t.String(), t.Number(), t.Null()])),
  rawBoolean: t.Optional(t.Union([t.Boolean(), t.Null()])),
  rawDate: t.Optional(t.Union([t.String(), t.Null()])),
  displayValue: t.Optional(t.Union([t.String(), t.Null()])),
});

export const ReplaceProductAttributesDto = t.Object({
  assignments: t.Array(ProductAttributeAssignmentDto),
});

export const ProductVariantInputDto = t.Object({
  id: t.Optional(t.String({ minLength: 1 })),
  sku: t.Optional(t.String()),
  barcode: t.Optional(t.Union([t.String(), t.Null()])),
  name: t.Optional(t.String()),
  price: t.Union([t.String(), t.Number()]),
  compareAtPrice: t.Optional(t.Union([t.String(), t.Number(), t.Null()])),
  costPrice: t.Optional(t.Union([t.String(), t.Number(), t.Null()])),
  currency: t.Optional(t.String({ minLength: 3, maxLength: 3 })),
  isDefault: t.Optional(t.Boolean()),
  isActive: t.Optional(t.Boolean()),
  media: t.Optional(t.Union([ProductMediaDto, t.Null()])),
  weightValue: t.Optional(t.Union([t.String(), t.Number(), t.Null()])),
  weightUnit: t.Optional(t.Union([WeightUnitDto, t.Null()])),
  attributeValueIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
});

export const ReplaceProductVariantsDto = t.Object({
  variants: t.Array(ProductVariantInputDto),
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
