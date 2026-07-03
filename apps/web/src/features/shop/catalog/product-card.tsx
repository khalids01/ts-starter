import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, PackageCheck, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Img } from "@/components/core/img";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";
import { useCartSheetStore } from "../cart-sheet-store";
import {
  savedProductFromProduct,
  useSavedItemsStore,
} from "../saved-items-store";
import type { ShopCart, ShopProduct, ShopVariant } from "../types";
import { formatMoney, productImage } from "../utils";

export function StoreProductCard(props: { product: ShopProduct; className?: string }) {
  const imageUrl = productImage(props.product);
  const defaultVariant = props.product.variants[0];
  const toggleSaved = useSavedItemsStore((state) => state.toggle);
  const isSaved = useSavedItemsStore((state) => state.isSaved(props.product.id));
  const specs = productCardSpecs(props.product);

  return (
    <article className={cn("overflow-hidden rounded-md border bg-card", props.className)}>
      <div className="relative">
        <Link to="/shop/products/$slug" params={{ slug: props.product.slug }} className="block">
          <div className="aspect-[4/3] bg-muted">
            {imageUrl ? (
              <Img src={imageUrl} alt="" className="h-full w-full object-contain p-3 transition group-hover:scale-[1.02]" />
            ) : (
              <FallbackProductVisual />
            )}
          </div>
        </Link>
        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          className="absolute right-3 top-3 bg-background/90"
          onClick={() => toggleSaved(savedProductFromProduct(props.product))}
        >
          <Heart className={cn("size-4", isSaved ? "fill-rose-500 text-rose-500" : "")} />
          <span className="sr-only">{isSaved ? "Remove from saved" : "Save product"}</span>
        </Button>
      </div>
      <div className="grid gap-2.5 p-3">
        <div className="flex flex-wrap gap-1.5">
          {props.product.badgeLabel ? <Badge>{props.product.badgeLabel}</Badge> : null}
          {props.product.isTrending ? <Badge variant="secondary">Trending</Badge> : null}
          {props.product.category ? <Badge variant="outline">{props.product.category.name}</Badge> : null}
        </div>
        <div className="min-w-0">
          <Link
            to="/shop/products/$slug"
            params={{ slug: props.product.slug }}
            className="line-clamp-2 font-medium leading-5 hover:underline"
          >
            {props.product.name}
          </Link>
          {specs.length > 0 ? (
            <ul className="mt-2 grid gap-0.5 text-sm text-muted-foreground">
              {specs.slice(0, 3).map((spec) => (
                <li key={`${spec.name}-${spec.value}`} className="line-clamp-1">
                  <span className="font-medium text-foreground/80">{spec.name}:</span> {spec.value}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {props.product.description ?? "Product details and available variants are ready to review."}
            </p>
          )}
        </div>
        <Separator />
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-base font-semibold">{formatMoney(defaultVariant?.price, defaultVariant?.currency)}</p>
            {defaultVariant?.compareAtPrice ? (
              <p className="text-xs text-muted-foreground line-through">
                {formatMoney(defaultVariant.compareAtPrice, defaultVariant.currency)}
              </p>
            ) : null}
          </div>
          <Badge variant={defaultVariant?.availableQuantity ? "secondary" : "outline"}>
            {defaultVariant?.availableQuantity ? "In stock" : "Unavailable"}
          </Badge>
        </div>
        <ProductCardActions product={props.product} variant={defaultVariant} />
      </div>
    </article>
  );
}

function ProductCardActions(props: { product: ShopProduct; variant?: ShopVariant }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const openCart = useCartSheetStore((state) => state.openCart);
  const disabled = !props.variant || props.variant.availableQuantity <= 0;
  const addToCart = useMutation({
    mutationFn: async () => {
      const { data, error } = await client.shop.cart.items.post({
        variantId: props.variant!.id,
        quantity: 1,
      });
      if (error) {
        throw new Error(String(error.value?.message || error.message || "Failed to add item"));
      }
      return data as ShopCart;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.shop.cart() });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Failed to add item"),
  });

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={disabled || addToCart.isPending}
        onClick={() =>
          addToCart.mutate(undefined, {
            onSuccess: () => {
              toast.success("Added to cart");
              openCart();
            },
          })
        }
      >
        <ShoppingCart className="size-4" />
        Cart
      </Button>
      <Button
        type="button"
        disabled={disabled || addToCart.isPending}
        onClick={() =>
          addToCart.mutate(undefined, {
            onSuccess: () => {
              void navigate({ to: "/checkout" });
            },
          })
        }
      >
        <Zap className="size-4" />
        Buy
      </Button>
    </div>
  );
}

function productCardSpecs(product: ShopProduct) {
  if (product.specs?.length) {
    return product.specs;
  }
  return (
    product.variants[0]?.attributeValues?.map((value) => ({
      name: value.attribute?.name ?? "Option",
      value: value.label,
    })) ?? []
  );
}

function FallbackProductVisual() {
  return (
    <div className="grid h-full w-full place-items-center bg-muted">
      <PackageCheck className="size-12 text-muted-foreground" />
    </div>
  );
}
