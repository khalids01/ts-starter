export type PageResult<T> = {
  items: T[];
  total: number;
  pages: number;
  page: number;
  limit: number;
};

export type ProductStatus = "draft" | "active" | "archived";
export type CategoryBrandPolicy = "hidden" | "optional" | "required" | "default_store";
export type AttributeScope = "product" | "variant" | "batch";
export type AttributeInputType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "multiselect"
  | "color"
  | "date";

export type ProductAttributeValue = {
  id: string;
  attributeId: string;
  value: string;
  label: string;
  sortOrder?: number;
};

export type ProductAttribute = {
  id: string;
  name: string;
  slug: string;
  type: "text" | "number" | "boolean" | "color";
  filterable: boolean;
  variantDefining: boolean;
  sortOrder: number;
  values?: ProductAttributeValue[];
};

export type CategoryAttribute = {
  id: string;
  categoryId: string;
  attributeId: string;
  scope: AttributeScope;
  required: boolean;
  filterable: boolean;
  variantDefining: boolean;
  comparable: boolean;
  inputType: AttributeInputType;
  unit?: string | null;
  groupName?: string | null;
  helpText?: string | null;
  placeholder?: string | null;
  sortOrder: number;
  attribute: ProductAttribute;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  children?: Array<{ id: string; name: string; slug: string; isActive: boolean }>;
  brandPolicy: CategoryBrandPolicy;
  showStoreBrand: boolean;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  counts?: { products: number; attributes: number; children: number };
  attributes?: CategoryAttribute[];
};

export type CategoryTemplate = {
  category: Category;
  brand: {
    policy: CategoryBrandPolicy;
    showStoreBrand: boolean;
    storeBrandName: string;
  };
  fields: {
    product: CategoryAttribute[];
    variant: CategoryAttribute[];
    batch: CategoryAttribute[];
  };
  commonFilters?: Array<{ key: string; label: string }>;
};

export type ProductBrand = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  productCount?: number;
};

export type ProductAttributeAssignment = {
  id: string;
  attributeId: string;
  attribute: ProductAttribute;
  attributeValueId?: string | null;
  attributeValue?: ProductAttributeValue | null;
  values?: ProductAttributeValue[];
  rawText?: string | null;
  rawNumber?: string | null;
  rawBoolean?: boolean | null;
  rawDate?: string | null;
  displayValue?: string | null;
};

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  barcode?: string | null;
  name: string;
  price: string;
  compareAtPrice?: string | null;
  costPrice?: string | null;
  currency: string;
  isDefault: boolean;
  isActive: boolean;
  imageUrls?: string[];
  weightValue?: string | null;
  weightUnit?: "g" | "kg" | "lb" | "oz" | null;
  attributeValues?: Array<ProductAttributeValue & { attribute?: ProductAttribute }>;
  attributesSnapshot?: Array<{
    attributeId: string;
    attributeName: string | null;
    attributeSlug: string | null;
    valueId: string;
    value: string;
    label: string;
  }>;
};

export type ProductHighlight = {
  id?: string;
  productId?: string;
  title: string;
  description?: string | null;
  iconUrl?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  descriptionHtml?: string | null;
  categoryId: string;
  category?: Category | null;
  brandId?: string | null;
  brand?: ProductBrand | null;
  status: ProductStatus;
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  badgeLabel?: string | null;
  coverImageUrl?: string | null;
  searchKeywords: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  counts?: { variants: number; attributeAssignments: number };
  attributeAssignments?: ProductAttributeAssignment[];
  highlights?: ProductHighlight[];
  variants?: ProductVariant[];
  updatedAt?: string;
};

export type InventorySupplier = {
  id: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
  batchCount?: number;
};

export type InventoryLocation = {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  isActive: boolean;
  stockCount?: number;
};

export type InventoryStock = {
  id: string;
  variantId: string;
  variant?: ProductVariant & { product?: Product };
  locationId: string;
  location?: InventoryLocation;
  batchId?: string | null;
  batch?: {
    id: string;
    batchNumber?: string | null;
    expiryDate?: string | null;
    supplier?: InventorySupplier | null;
  } | null;
  quantityOnHand: number;
  quantityReserved: number;
  availableQuantity: number;
  reorderLevel?: number | null;
  updatedAt?: string;
};

export type InventoryMovement = {
  id: string;
  variantId: string;
  variant?: ProductVariant & { product?: Product };
  locationId: string;
  location?: InventoryLocation;
  batchId?: string | null;
  type: string;
  delta: number;
  unitCost?: string | null;
  reason?: string | null;
  actorUserId?: string | null;
  createdAt: string;
};
