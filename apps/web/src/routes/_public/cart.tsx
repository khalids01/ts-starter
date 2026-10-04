import { noIndexHead } from "@/features/seo/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/features/shop";

export const Route = createFileRoute("/_public/cart")({
  head: noIndexHead,
  component: Cart,
});

function Cart()  {
  return (
    < >
      <CartPage />
    </>
  )
}