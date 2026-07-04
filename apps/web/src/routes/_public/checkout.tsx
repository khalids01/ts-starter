import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "@/features/shop";

export const Route = createFileRoute("/_public/checkout")({
  component: CheckoutPage,
});
