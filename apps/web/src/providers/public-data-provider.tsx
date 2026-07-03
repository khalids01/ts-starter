import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { ShopCategory } from "@/features/shop/types";

export type PublicData = {
  categories: ShopCategory[];
};

const PublicDataContext = createContext<PublicData | null>(null);

export function PublicDataProvider(props: {
  value: PublicData;
  children: ReactNode;
}) {
  return (
    <PublicDataContext.Provider value={props.value}>
      {props.children}
    </PublicDataContext.Provider>
  );
}

export function usePublicData() {
  const context = useContext(PublicDataContext);
  if (!context) {
    throw new Error("usePublicData must be used inside PublicDataProvider");
  }
  return context;
}
