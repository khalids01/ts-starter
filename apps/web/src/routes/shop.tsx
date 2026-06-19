import { createFileRoute } from "@tanstack/react-router";
import { ShopPage } from "@/features/shop";

export const Route = createFileRoute("/shop")({
  component: ShopPage,
});
