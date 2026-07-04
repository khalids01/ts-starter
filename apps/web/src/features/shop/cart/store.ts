import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShopCart, ShopCartItem, ShopProduct, ShopVariant } from "../types";

type AddCartItemInput = {
  product: ShopProduct;
  variant: ShopVariant;
  quantity?: number;
};

type CartState = {
  items: ShopCartItem[];
  addItem: (input: AddCartItemInput) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "shop-cart";

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: ({ product, variant, quantity = 1 }) =>
        set((state) => {
          const nextQuantity = Math.max(1, quantity);
          const existingItem = state.items.find((item) => item.variantId === variant.id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === existingItem.id
                  ? cartItemWithQuantity(item, item.quantity + nextQuantity)
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              createCartItem({
                product,
                variant,
                quantity: nextQuantity,
              }),
            ],
          };
        }),
      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? cartItemWithQuantity(item, quantity) : item,
          ),
        })),
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function useCart() {
  const items = useCartStore((state) => state.items);
  return buildCart(items);
}

export function cartItemsForCheckout(items: ShopCartItem[]) {
  return items.map((item) => ({
    variantId: item.variantId,
    quantity: item.quantity,
  }));
}

function createCartItem(input: AddCartItemInput & { quantity: number }): ShopCartItem {
  return cartItemWithQuantity(
    {
      id: input.variant.id,
      variantId: input.variant.id,
      quantity: input.quantity,
      unitPrice: input.variant.price,
      lineTotal: input.variant.price,
      variant: input.variant,
      product: {
        id: input.product.id,
        name: input.product.name,
        slug: input.product.slug,
        coverImageUrl: input.product.coverImageUrl,
        category: input.product.category,
        brand: input.product.brand,
      },
    },
    input.quantity,
  );
}

function cartItemWithQuantity(item: ShopCartItem, quantity: number): ShopCartItem {
  const nextQuantity = Math.max(1, quantity);
  const lineTotal = Number(item.unitPrice) * nextQuantity;

  return {
    ...item,
    quantity: nextQuantity,
    lineTotal: lineTotal.toFixed(2),
  };
}

function buildCart(items: ShopCartItem[]): ShopCart {
  const subtotal = items.reduce((total, item) => total + Number(item.lineTotal), 0);
  const currency = items[0]?.variant.currency ?? "BDT";

  return {
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotalAmount: subtotal.toFixed(2),
    discountAmount: "0.00",
    taxAmount: "0.00",
    shippingAmount: "0.00",
    totalAmount: subtotal.toFixed(2),
    currency,
  };
}
