import { createServerFn } from "@tanstack/react-start";
import { client } from "@/lib/client";
import type { ShopCategory } from "../types";

async function getCategories() {
  const { data, error } = await client.shop.categories.get();
  if (error) {
    throw new Error(String(error.value?.message || error.message || "Failed to load categories"));
  }
  return data as ShopCategory[];
}

export const getPublicData = createServerFn({ method: "GET" }).handler(
  async () => {
    const [categories] = await Promise.all([
      getCategories(),
    ]);

    return { categories };
  },
);
