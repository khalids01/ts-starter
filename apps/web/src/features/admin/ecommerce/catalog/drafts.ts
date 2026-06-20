import type {
  Category,
  CategoryBrandPolicy,
  ProductAttribute,
  ProductBrand,
} from "../types";

export type CategoryDraft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: string;
  brandPolicy: CategoryBrandPolicy;
  showStoreBrand: boolean;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: string;
};

export type AttributeDraft = {
  id?: string;
  name: string;
  slug: string;
  type: "text" | "number" | "boolean" | "color";
  filterable: boolean;
  variantDefining: boolean;
  sortOrder: string;
};

export type BrandDraft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  isActive: boolean;
  isFeatured: boolean;
};

export function categoryDraft(category?: Category): CategoryDraft {
  return {
    id: category?.id,
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    imageUrl: category?.imageUrl ?? "",
    parentId: category?.parentId ?? "none",
    brandPolicy: category?.brandPolicy ?? "optional",
    showStoreBrand: category?.showStoreBrand ?? false,
    isActive: category?.isActive ?? true,
    isFeatured: category?.isFeatured ?? false,
    sortOrder: String(category?.sortOrder ?? 0),
  };
}

export function attributeDraft(attribute?: ProductAttribute): AttributeDraft {
  return {
    id: attribute?.id,
    name: attribute?.name ?? "",
    slug: attribute?.slug ?? "",
    type: attribute?.type ?? "text",
    filterable: attribute?.filterable ?? false,
    variantDefining: attribute?.variantDefining ?? false,
    sortOrder: String(attribute?.sortOrder ?? 0),
  };
}

export function brandDraft(brand?: ProductBrand): BrandDraft {
  return {
    id: brand?.id,
    name: brand?.name ?? "",
    slug: brand?.slug ?? "",
    description: brand?.description ?? "",
    logoUrl: brand?.logoUrl ?? "",
    websiteUrl: brand?.websiteUrl ?? "",
    isActive: brand?.isActive ?? true,
    isFeatured: brand?.isFeatured ?? false,
  };
}
