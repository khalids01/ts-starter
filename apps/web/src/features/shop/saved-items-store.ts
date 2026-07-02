import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShopProduct } from "./types";
import { productImage } from "./utils";

export type SavedProduct = {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
  categoryName?: string | null;
  brandName?: string | null;
  price?: string | null;
  currency?: string | null;
  badgeLabel?: string | null;
  savedAt: string;
};

type SavedItemsState = {
  items: SavedProduct[];
  isSaved: (productId: string) => boolean;
  save: (product: SavedProduct) => void;
  remove: (productId: string) => void;
  toggle: (product: SavedProduct) => void;
};

export function savedProductFromProduct(product: ShopProduct): SavedProduct {
  const variant = product.variants[0];
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: productImage(product),
    categoryName: product.category?.name ?? null,
    brandName: product.brand?.name ?? null,
    price: variant?.price ?? null,
    currency: variant?.currency ?? null,
    badgeLabel: product.badgeLabel ?? null,
    savedAt: new Date().toISOString(),
  };
}

export const useSavedItemsStore = create<SavedItemsState>()(
  persist(
    (set, get) => ({
      items: [],
      isSaved: (productId) => get().items.some((item) => item.id === productId),
      save: (product) =>
        set((state) => ({
          items: [
            { ...product, savedAt: new Date().toISOString() },
            ...state.items.filter((item) => item.id !== product.id),
          ],
        })),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      toggle: (product) => {
        if (get().isSaved(product.id)) {
          get().remove(product.id);
          return;
        }
        get().save(product);
      },
    }),
    { name: "shop-saved-items" },
  ),
);
