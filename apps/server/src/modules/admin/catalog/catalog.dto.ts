import { t } from "elysia";

const HttpUrlDto = t.String({
  maxLength: 2048,
  pattern: "^https?://",
});

export const CategoryBrandPolicyDto = t.Union([
  t.Literal("hidden"),
  t.Literal("optional"),
  t.Literal("required"),
  t.Literal("default_store"),
]);

export const ProductAttributeTypeDto = t.Union([
  t.Literal("text"),
  t.Literal("number"),
  t.Literal("boolean"),
  t.Literal("color"),
]);

export const CategoryAttributeScopeDto = t.Union([
  t.Literal("product"),
  t.Literal("variant"),
  t.Literal("batch"),
]);

export const AttributeInputTypeDto = t.Union([
  t.Literal("text"),
  t.Literal("textarea"),
  t.Literal("number"),
  t.Literal("boolean"),
  t.Literal("select"),
  t.Literal("multiselect"),
  t.Literal("color"),
  t.Literal("date"),
]);

export const IdParamDto = t.Object({
  id: t.String({ minLength: 1, maxLength: 128 }),
});

export const ListCatalogQueryDto = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
  search: t.Optional(t.String({ maxLength: 200 })),
  active: t.Optional(t.Boolean()),
});

export const CreateCategoryDto = t.Object({
  name: t.String({ minLength: 1, maxLength: 120 }),
  slug: t.Optional(t.String({ maxLength: 160 })),
  description: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
  parentId: t.Optional(t.Union([t.String({ maxLength: 128 }), t.Null()])),
  imageUrl: t.Optional(t.Union([HttpUrlDto, t.Null()])),
  iconUrl: t.Optional(t.Union([HttpUrlDto, t.Null()])),
  brandPolicy: t.Optional(CategoryBrandPolicyDto),
  showStoreBrand: t.Optional(t.Boolean()),
  isActive: t.Optional(t.Boolean()),
  isFeatured: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
});

export const UpdateCategoryDto = t.Partial(CreateCategoryDto);

export const CreateAttributeDto = t.Object({
  name: t.String({ minLength: 1, maxLength: 120 }),
  slug: t.Optional(t.String({ maxLength: 160 })),
  type: t.Optional(ProductAttributeTypeDto),
  filterable: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
  categoryIds: t.Optional(t.Array(t.String({ minLength: 1, maxLength: 128 }), { maxItems: 100 })),
});

export const UpdateAttributeDto = t.Partial(CreateAttributeDto);

export const CreateAttributeValueDto = t.Object({
  value: t.String({ minLength: 1, maxLength: 200 }),
  label: t.String({ minLength: 1, maxLength: 200 }),
  sortOrder: t.Optional(t.Number()),
});

export const UpdateAttributeValueDto = t.Partial(
  t.Object({
    value: t.String({ minLength: 1, maxLength: 200 }),
    label: t.String({ minLength: 1, maxLength: 200 }),
    sortOrder: t.Number(),
  }),
);

export const AssignCategoryAttributeDto = t.Object({
  attributeId: t.String({ minLength: 1, maxLength: 128 }),
  scope: CategoryAttributeScopeDto,
  required: t.Optional(t.Boolean()),
  filterable: t.Optional(t.Boolean()),
  variantDefining: t.Optional(t.Boolean()),
  comparable: t.Optional(t.Boolean()),
  inputType: t.Optional(AttributeInputTypeDto),
  unit: t.Optional(t.Union([t.String({ maxLength: 40 }), t.Null()])),
  groupName: t.Optional(t.Union([t.String({ maxLength: 120 }), t.Null()])),
  helpText: t.Optional(t.Union([t.String({ maxLength: 500 }), t.Null()])),
  placeholder: t.Optional(t.Union([t.String({ maxLength: 200 }), t.Null()])),
  sortOrder: t.Optional(t.Number()),
});

export const UpdateCategoryAttributeDto = t.Partial(
  t.Omit(AssignCategoryAttributeDto, ["attributeId", "scope"]),
);

export const CreateBrandDto = t.Object({
  name: t.String({ minLength: 1, maxLength: 120 }),
  slug: t.Optional(t.String({ maxLength: 160 })),
  description: t.Optional(t.Union([t.String({ maxLength: 2000 }), t.Null()])),
  logoUrl: t.Optional(t.Union([HttpUrlDto, t.Null()])),
  websiteUrl: t.Optional(t.Union([HttpUrlDto, t.Null()])),
  isActive: t.Optional(t.Boolean()),
  isFeatured: t.Optional(t.Boolean()),
});

export const UpdateBrandDto = t.Partial(CreateBrandDto);

export type ListCatalogQuery = typeof ListCatalogQueryDto.static;
export type CreateCategoryInput = typeof CreateCategoryDto.static;
export type UpdateCategoryInput = typeof UpdateCategoryDto.static;
export type CreateAttributeInput = typeof CreateAttributeDto.static;
export type UpdateAttributeInput = typeof UpdateAttributeDto.static;
export type CreateAttributeValueInput = typeof CreateAttributeValueDto.static;
export type UpdateAttributeValueInput = typeof UpdateAttributeValueDto.static;
export type AssignCategoryAttributeInput =
  typeof AssignCategoryAttributeDto.static;
export type UpdateCategoryAttributeInput =
  typeof UpdateCategoryAttributeDto.static;
export type CreateBrandInput = typeof CreateBrandDto.static;
export type UpdateBrandInput = typeof UpdateBrandDto.static;
