import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Img } from "@/components/core/img";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { client } from "@/lib/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ShopCart, ShopCartItem } from "./types";
import { formatMoney } from "./utils";
import { PublicShopFooter, PublicShopShell, useShopCategories } from "./public-shop-shell";

export function CartPage() {
  const queryClient = useQueryClient();
  const categoriesQuery = useShopCategories();
  const cartQuery = useQuery({
    queryKey: queryKeys.shop.cart(),
    queryFn: async () => {
      const { data, error } = await client.shop.cart.get();
      if (error) {
        throw new Error(String(error.value?.message || error.message || "Failed to load cart"));
      }
      return data as ShopCart;
    },
  });
  const cart = cartQuery.data;

  const invalidateCart = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.shop.cart() });
  };
  const updateItem = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await client.shop.cart.items({ id }).patch({ quantity });
      if (error) {
        throw new Error(String(error.value?.message || error.message || "Failed to update cart"));
      }
      return data as ShopCart;
    },
    onSuccess: invalidateCart,
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update cart"),
  });
  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await client.shop.cart.items({ id }).delete();
      if (error) {
        throw new Error(String(error.value?.message || error.message || "Failed to remove item"));
      }
      return data as ShopCart;
    },
    onSuccess: invalidateCart,
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to remove item"),
  });
  const updating = updateItem.isPending || removeItem.isPending;

  return (
    <PublicShopShell footer={<PublicShopFooter categories={categoriesQuery.data ?? []} />}>
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Cart</h1>
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
            <div className="grid gap-4">
              <div className="hidden rounded-md border bg-card md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.items.map((item) => (
                      <CartItemTableRow
                        key={item.id}
                        item={item}
                        currency={cart.currency}
                        updating={updating}
                        onQuantity={(quantity) => updateItem.mutate({ id: item.id, quantity })}
                        onRemove={() => removeItem.mutate(item.id)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 md:hidden">
                {cart.items.map((item) => (
                  <CartItemMobileCard
                    key={item.id}
                    item={item}
                    currency={cart.currency}
                    updating={updating}
                    onQuantity={(quantity) => updateItem.mutate({ id: item.id, quantity })}
                    onRemove={() => removeItem.mutate(item.id)}
                  />
                ))}
              </div>
            </div>
            <CartSummary cart={cart} />
          </section>
        )}
      </main>
    </PublicShopShell>
  );
}

function CartItemTableRow(props: {
  item: ShopCartItem;
  currency: string;
  updating: boolean;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const imageUrl = props.item.variant.imageUrls?.[0] || props.item.product.coverImageUrl;
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="size-16 overflow-hidden rounded-md bg-muted">
            {imageUrl ? (
              <Img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-xs text-muted-foreground">No image</div>
            )}
          </div>
          <div className="min-w-0">
            <Link to="/shop/products/$slug" params={{ slug: props.item.product.slug }} className="font-medium hover:underline">
              {props.item.product.name}
            </Link>
            <p className="text-sm text-muted-foreground">{formatMoney(props.item.unitPrice, props.currency)}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="font-medium">{props.item.variant.name}</p>
        <p className="text-xs text-muted-foreground">{props.item.variant.sku}</p>
      </TableCell>
      <TableCell>
        <QuantityControl
          quantity={props.item.quantity}
          disabled={props.updating}
          onQuantity={props.onQuantity}
        />
      </TableCell>
      <TableCell className="text-right font-semibold">
        {formatMoney(props.item.lineTotal, props.currency)}
      </TableCell>
      <TableCell>
        <Button type="button" size="icon-sm" variant="ghost" disabled={props.updating} onClick={props.onRemove}>
          <Trash2 className="size-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </TableCell>
    </TableRow>
  );
}

function CartItemMobileCard(props: {
  item: ShopCartItem;
  currency: string;
  updating: boolean;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const imageUrl = props.item.variant.imageUrls?.[0] || props.item.product.coverImageUrl;
  return (
    <article className="overflow-hidden rounded-md border bg-card">
      <div className="aspect-[4/3] bg-muted">
        {imageUrl ? (
          <Img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">No image</div>
        )}
      </div>
      <div className="grid gap-4 p-4">
        <div>
          <Link to="/shop/products/$slug" params={{ slug: props.item.product.slug }} className="font-medium hover:underline">
            {props.item.product.name}
          </Link>
          <p className="text-sm text-muted-foreground">{props.item.variant.name} · {props.item.variant.sku}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <QuantityControl
            quantity={props.item.quantity}
            disabled={props.updating}
            onQuantity={props.onQuantity}
          />
          <p className="font-semibold">{formatMoney(props.item.lineTotal, props.currency)}</p>
        </div>
        <Button type="button" variant="destructive" disabled={props.updating} onClick={props.onRemove}>
          <Trash2 className="size-4" />
          Remove
        </Button>
      </div>
    </article>
  );
}

function QuantityControl(props: {
  quantity: number;
  disabled: boolean;
  onQuantity: (quantity: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        disabled={props.disabled || props.quantity <= 1}
        onClick={() => props.onQuantity(props.quantity - 1)}
      >
        <Minus className="size-4" />
      </Button>
      <Badge variant="secondary" className="min-w-10 justify-center">
        {props.quantity}
      </Badge>
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        disabled={props.disabled}
        onClick={() => props.onQuantity(props.quantity + 1)}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}

function CartSummary(props: { cart: ShopCart }) {
  return (
    <aside className="h-fit space-y-4 rounded-md border bg-card p-4 lg:sticky lg:top-24">
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
    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}
