import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/features/shop";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});
