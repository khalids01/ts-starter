export type PageResult<T> = {
  items: T[];
  total: number;
  pages: number;
  page: number;
  limit: number;
};

export type ShopCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  iconUrl?: string | null;
  parentId?: string | null;
  isFeatured?: boolean;
  sortOrder?: number;
  productCount?: number;
};

export type ShopBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
};

export type ShopVariant = {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: string;
  compareAtPrice?: string | null;
  currency: string;
  isDefault: boolean;
  isActive: boolean;
  imageUrls: string[];
  availableQuantity: number;
  attributeValues?: Array<{
    id: string;
    attributeId: string;
    value: string;
    label: string;
    attribute?: { id: string; name: string; slug: string } | null;
  }>;
};

export type ShopProduct = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  fulfillmentKind?: "standard" | "packaged_food" | "fresh_food" | "gadget" | "clothing";
  warrantyDays?: number;
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  descriptionHtml?: string | null;
  categoryId: string;
  category?: ShopCategory | null;
  brandId?: string | null;
  brand?: ShopBrand | null;
  isFeatured: boolean;
  isTrending: boolean;
  badgeLabel?: string | null;
  coverImageUrl?: string | null;
  variants: ShopVariant[];
  highlights?: Array<{
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    iconUrl?: string | null;
    sortOrder: number;
  }>;
  specs?: Array<{
    attributeId: string;
    name: string;
    slug: string;
    value: string;
  }>;
};

export type ShopFilterAttribute = {
  id: string;
  attributeId: string;
  name: string;
  slug: string;
  type: "text" | "number" | "boolean" | "color";
  scope: "product" | "variant" | "batch";
  inputType: "text" | "textarea" | "number" | "boolean" | "select" | "multiselect" | "color" | "date";
  unit?: string | null;
  sortOrder: number;
  values: Array<{
    id: string;
    attributeId: string;
    value: string;
    label: string;
    sortOrder: number;
    productCount: number;
  }>;
  range?: { min: number; max: number } | null;
  booleanCounts?: { true: number; false: number } | null;
};

export type ShopFilters = {
  categories: ShopCategory[];
  brands: Array<ShopBrand & { productCount: number }>;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  availability: {
    inStock: number;
    outOfStock: number;
  };
  attributes: ShopFilterAttribute[];
};

export type ShopCartItem = {
  id: string;
  variantId: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  variant: ShopVariant;
  product: Pick<ShopProduct, "id" | "name" | "slug" | "coverImageUrl" | "category" | "brand" | "fulfillmentKind">;
};

export type ShopCart = {
  items: ShopCartItem[];
  itemCount: number;
  subtotalAmount: string;
  discountAmount: string;
  taxAmount: string;
  shippingAmount: string;
  totalAmount: string;
  currency: string;
};

export type ShopShippingRate = {
  id: string;
  code: string;
  label: string;
  amount: string;
  currency: string;
  freeOverAmount?: string | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type PublicStoreSettings = {
  storeName: string;
  supportEmail?: string | null;
  supportPhone?: string | null;
  defaultCurrency: string;
  checkoutEnabled: boolean;
  checkoutNotice?: string | null;
};

export type CheckoutResult = {
  orderId: string;
  orderNumber: string;
  totalAmount: string;
  currency: string;
};

export type ShopOrder = {
  money?: { received: string | null; refunded: string | null; outstanding: string | null; netReceived: string | null; error: string | null };
  shippingAddress?: { fullName?: string; line1: string; line2?: string | null; city?: string | null; state?: string | null; postalCode?: string | null; country?: string | null } | null;
  statusEvents?: { id: string; type: string; newValue: string; createdAt: string }[];
  foodBooking?: { state: string; slot: { label: string; startsAt: string; endsAt: string } } | null;
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  subtotalAmount: string;
  discountAmount: string;
  discountCodeSnapshot?: string | null;
  discountDescriptionSnapshot?: string | null;
  taxAmount: string;
  shippingAmount: string;
  totalAmount: string;
  currency: string;
  paymentMethod?: string | null;
  orderStatus: string;
  paymentStatus: string;
  deliveryStatus: string;
  inventoryStatus: string;
  shippingMethodLabel?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  placedAt?: string | null;
  createdAt: string;
  lineItems: Array<{
    id: string;
    productId: string;
    variantId: string;
    productName: string;
    variantName?: string | null;
    sku?: string | null;
    imageUrl?: string | null;
    warrantyDays?: number;
    unitAllocations?: { id: string; serial: string | null; imei: string | null; state: string; claims: { id: string; state: string; issue: string; resolution: string | null }[] }[];
    quantity: number;
    unitPrice: string;
    totalAmount: string;
  }>;
};
