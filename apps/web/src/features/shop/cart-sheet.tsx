import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Img } from "@/components/core/img";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { shopApi } from "./api";
import type { ShopCart, ShopCartItem } from "./types";
import { formatMoney } from "./utils";
import { useCartSheetStore } from "./cart-sheet-store";

export function CartTriggerButton(props: {
  className?: string;
  showLabel?: boolean;
  variant?: "outline" | "ghost";
}) {
  const openCart = useCartSheetStore((state) => state.openCart);
  const cartQuery = useQuery({
    queryKey: queryKeys.shop.cart(),
    queryFn: () => shopApi.cart() as Promise<ShopCart>,
    staleTime: 30_000,
  });
  const itemCount = cartQuery.data?.itemCount ?? 0;

  return (
    <Button
      type="button"
      variant={props.variant ?? "outline"}
      size={props.showLabel ? "default" : "icon"}
      className={cn("relative", props.className)}
      onClick={openCart}
    >
      <ShoppingCart className="size-4" />
      {props.showLabel ? <span>Cart</span> : <span className="sr-only">Cart</span>}
      {itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-emerald-600 px-1 text-[11px] font-semibold leading-5 text-white">
          {itemCount}
        </span>
      ) : null}
    </Button>
  );
}

export function CartSheet() {
  const queryClient = useQueryClient();
  const open = useCartSheetStore((state) => state.open);
  const setOpen = useCartSheetStore((state) => state.setOpen);
  const closeCart = useCartSheetStore((state) => state.closeCart);
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
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Failed to update cart"),
  });

  const removeItem = useMutation({
    mutationFn: (id: string) => shopApi.removeCartItem(id) as Promise<ShopCart>,
    onSuccess: invalidateCart,
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Failed to remove item"),
  });

  const isUpdating = updateItem.isPending || removeItem.isPending;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base">Cart</SheetTitle>
          <SheetDescription>
            Review items, update quantities, or continue to checkout.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {cartQuery.isLoading ? (
            <CartState>Loading cart...</CartState>
          ) : !cart || cart.items.length === 0 ? (
            <CartState>
              <p>Your cart is empty.</p>
              <Link
                to="/shop"
                className={buttonVariants({ className: "mt-4" })}
                onClick={closeCart}
              >
                Continue shopping
              </Link>
            </CartState>
          ) : (
            <div className="grid gap-3">
              {cart.items.map((item) => (
                <CartSheetItem
                  key={item.id}
                  item={item}
                  currency={cart.currency}
                  updating={isUpdating}
                  onQuantity={(quantity) => updateItem.mutate({ id: item.id, quantity })}
                  onRemove={() => removeItem.mutate(item.id)}
                  onNavigate={closeCart}
                />
              ))}
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 ? (
          <SheetFooter className="border-t">
            <div className="grid gap-2 text-sm">
              <SummaryRow label="Subtotal" value={cart.subtotalAmount} currency={cart.currency} />
              <SummaryRow label="Shipping" value={cart.shippingAmount} currency={cart.currency} />
              <Separator />
              <SummaryRow label="Total" value={cart.totalAmount} currency={cart.currency} strong />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/cart"
                className={buttonVariants({ variant: "outline" })}
                onClick={closeCart}
              >
                Full cart
              </Link>
              <Link to="/checkout" className={buttonVariants()} onClick={closeCart}>
                Checkout
              </Link>
            </div>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function CartSheetItem(props: {
  item: ShopCartItem;
  currency: string;
  updating: boolean;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
  onNavigate: () => void;
}) {
  const imageUrl = props.item.variant.imageUrls?.[0] || props.item.product.coverImageUrl;

  return (
    <article className="grid grid-cols-[72px_1fr] gap-3 rounded-md border bg-card p-3">
      <Link
        to="/shop/products/$slug"
        params={{ slug: props.item.product.slug }}
        className="aspect-square overflow-hidden rounded-md bg-muted"
        onClick={props.onNavigate}
      >
        {imageUrl ? (
          <Img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </Link>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to="/shop/products/$slug"
              params={{ slug: props.item.product.slug }}
              className="line-clamp-1 font-medium hover:underline"
              onClick={props.onNavigate}
            >
              {props.item.product.name}
            </Link>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {props.item.variant.name} · {props.item.variant.sku}
            </p>
          </div>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            disabled={props.updating}
            onClick={props.onRemove}
          >
            <Trash2 className="size-3.5" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon-xs"
              variant="outline"
              disabled={props.updating || props.item.quantity <= 1}
              onClick={() => props.onQuantity(props.item.quantity - 1)}
            >
              <Minus className="size-3" />
            </Button>
            <Badge variant="secondary" className="min-w-8 justify-center">
              {props.item.quantity}
            </Badge>
            <Button
              type="button"
              size="icon-xs"
              variant="outline"
              disabled={props.updating}
              onClick={() => props.onQuantity(props.item.quantity + 1)}
            >
              <Plus className="size-3" />
            </Button>
          </div>
          <p className="text-sm font-semibold">
            {formatMoney(props.item.lineTotal, props.currency)}
          </p>
        </div>
      </div>
    </article>
  );
}

function CartState(props: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}

function SummaryRow(props: {
  label: string;
  value: string;
  currency: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{props.label}</span>
      <span className={props.strong ? "text-base font-semibold" : "font-medium"}>
        {formatMoney(props.value, props.currency)}
      </span>
    </div>
  );
}
