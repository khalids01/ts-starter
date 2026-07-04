import { create } from "zustand";

type CartSheetState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
};

export const useCartSheetStore = create<CartSheetState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  openCart: () => set({ open: true }),
  closeCart: () => set({ open: false }),
}));
