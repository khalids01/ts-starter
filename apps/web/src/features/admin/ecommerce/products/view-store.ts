import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProductViewMode = "grid" | "list";

type ProductViewState = {
  viewMode: ProductViewMode;
  setViewMode: (viewMode: ProductViewMode) => void;
};

export const useProductViewStore = create<ProductViewState>()(
  persist(
    (set) => ({
      viewMode: "grid",
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: "admin-products-view",
    },
  ),
);
