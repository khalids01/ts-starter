import { createFileRoute } from "@tanstack/react-router";
import { ShopPage } from "@/features/shop";
import {z} from "zod";

export const Route = createFileRoute("/shop")({
  loader: async ({  }) => {

  },
  validateSearch: (search) => {

    return z.object({
      search: z.string().optional().default(""),
      categoryIds: z.string().optional().default(""),
      brandIds: z.string().optional().default(""),
      minPrice: z.string().optional().default(""),
      maxPrice: z.string().optional().default(""),
      inStock: z.enum(["true", "false", "all"]).optional().default("all"),
      availability: z.enum(["in-stock", "out-of-stock", "all"]).optional().default("all"),
      sort: z.enum(["newest", "price-asc", "price-desc"]).optional().default("newest"),
      filters: z.string().optional().default(""),
    }).parse(search);
  },
  component: ShopPage,
});
