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
};

export type ShopCartItem = {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  variant: ShopVariant;
  product: Pick<ShopProduct, "id" | "name" | "slug" | "coverImageUrl" | "category" | "brand">;
};

export type ShopCart = {
  id: string;
  cartToken?: string | null;
  userId?: string | null;
  items: ShopCartItem[];
  itemCount: number;
  subtotalAmount: string;
  discountAmount: string;
  taxAmount: string;
  shippingAmount: string;
  totalAmount: string;
  currency: string;
  expiresAt: string;
  updatedAt: string;
};

export type ShopShippingRate = {
  id: string;
  code: string;
  label: string;
  amount: string;
  freeOverAmount?: string | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type CheckoutResult = {
  orderId: string;
  orderNumber: string;
  totalAmount: string;
  currency: string;
};
