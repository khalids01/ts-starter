import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/features/shop";

export const Route = createFileRoute("/_public/cart")({
  component: Cart,
});

function Cart()  {
  return (
    < >
      <CartPage />
    </>
  )
}