import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Button, buttonVariants } from "@/components/ui/button";
import { shopApi } from "./api";
import type { ShopCart, ShopCartItem } from "./types";
import { formatMoney } from "./utils";
import { ShopHeader } from "./shop-page";

export function CartPage() {
  const queryClient = useQueryClient();
  const cartQuery = useQuery({
    queryKey: queryKeys.shop.cart(),
    queryFn: () => shopApi.cart() as Promise<ShopCart>,
  });
  const cart = cartQuery.data;

  const invalidateCart = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.shop.cart() });
  };
  const updateItem = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      shopApi.updateCartItem(id, { quantity }) as Promise<ShopCart>,
    onSuccess: invalidateCart,
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update cart"),
  });
  const removeItem = useMutation({
    mutationFn: (id: string) => shopApi.removeCartItem(id) as Promise<ShopCart>,
    onSuccess: invalidateCart,
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to remove item"),
  });

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cart</h1>
          <p className="text-sm text-muted-foreground">Review your items before checkout.</p>
        </div>

        {cartQuery.isLoading ? (
          <StateCard>Loading cart...</StateCard>
        ) : !cart || cart.items.length === 0 ? (
          <StateCard>
            <p>Your cart is empty.</p>
            <Link to="/shop" className={buttonVariants({ className: "mt-4" })}>Continue shopping</Link>
          </StateCard>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="grid gap-3">
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  currency={cart.currency}
                  updating={updateItem.isPending || removeItem.isPending}
                  onQuantity={(quantity) => updateItem.mutate({ id: item.id, quantity })}
                  onRemove={() => removeItem.mutate(item.id)}
                />
              ))}
            </div>
            <CartSummary cart={cart} />
          </section>
        )}
      </main>
    </div>
  );
}

function CartItemRow(props: {
  item: ShopCartItem;
  currency: string;
  updating: boolean;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const imageUrl = props.item.variant.imageUrls?.[0] || props.item.product.coverImageUrl;
  return (
    <article className="grid gap-4 rounded-md border p-4 sm:grid-cols-[96px_1fr_auto]">
      <div className="aspect-square overflow-hidden rounded-md border bg-muted">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
      </div>
      <div className="min-w-0">
        <Link to="/shop/products/$slug" params={{ slug: props.item.product.slug }} className="font-medium hover:underline">
          {props.item.product.name}
        </Link>
        <p className="text-sm text-muted-foreground">{props.item.variant.name} · {props.item.variant.sku}</p>
        <p className="mt-2 font-semibold">{formatMoney(props.item.unitPrice, props.currency)}</p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="outline"
            disabled={props.updating || props.item.quantity <= 1}
            onClick={() => props.onQuantity(props.item.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center text-sm font-medium">{props.item.quantity}</span>
          <Button
            size="icon-sm"
            variant="outline"
            disabled={props.updating}
            onClick={() => props.onQuantity(props.item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <p className="font-semibold">{formatMoney(props.item.lineTotal, props.currency)}</p>
          <Button size="icon-sm" variant="ghost" disabled={props.updating} onClick={props.onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function CartSummary(props: { cart: ShopCart }) {
  return (
    <aside className="h-fit space-y-4 rounded-md border p-4">
      <h2 className="font-medium">Summary</h2>
      <SummaryRow label="Subtotal" value={props.cart.subtotalAmount} currency={props.cart.currency} />
      <SummaryRow label="Tax" value={props.cart.taxAmount} currency={props.cart.currency} />
      <SummaryRow label="Shipping" value={props.cart.shippingAmount} currency={props.cart.currency} />
      <div className="border-t pt-3">
        <SummaryRow label="Total" value={props.cart.totalAmount} currency={props.cart.currency} strong />
      </div>
      <Link to="/checkout" className={buttonVariants({ className: "w-full" })}>
        Checkout
      </Link>
    </aside>
  );
}

function SummaryRow(props: { label: string; value: string; currency: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{props.label}</span>
      <span className={props.strong ? "text-base font-semibold" : "font-medium"}>
        {formatMoney(props.value, props.currency)}
      </span>
    </div>
  );
}

function StateCard(props: { children: ReactNode }) {
  return (
    <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}
