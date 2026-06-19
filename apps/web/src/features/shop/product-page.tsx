import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { shopApi } from "./api";
import type { ShopCart, ShopProduct, ShopVariant } from "./types";
import { formatMoney, productImage } from "./utils";
import { ShopHeader } from "./shop-page";

export function ShopProductPage(props: { slug: string }) {
  const queryClient = useQueryClient();
  const productQuery = useQuery({
    queryKey: queryKeys.shop.product(props.slug),
    queryFn: () => shopApi.product(props.slug) as Promise<ShopProduct>,
  });
  const product = productQuery.data;
  const [variantId, setVariantId] = useState("");
  const selectedVariant = useMemo(() => {
    if (!product) {
      return null;
    }
    return product.variants.find((variant) => variant.id === (variantId || product.variants[0]?.id)) ?? null;
  }, [product, variantId]);

  const addToCart = useMutation({
    mutationFn: (variant: ShopVariant) =>
      shopApi.addCartItem({ variantId: variant.id, quantity: 1 }) as Promise<ShopCart>,
    onSuccess: () => {
      toast.success("Added to cart");
      void queryClient.invalidateQueries({ queryKey: queryKeys.shop.cart() });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to add item"),
  });

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
        <Link to="/shop" className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Products
        </Link>

        {productQuery.isLoading ? (
          <div className="mt-6 rounded-md border p-8 text-center text-sm text-muted-foreground">Loading product...</div>
        ) : !product ? (
          <div className="mt-6 rounded-md border p-8 text-center text-sm text-muted-foreground">Product not found.</div>
        ) : (
          <section className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <ProductMedia product={product} variant={selectedVariant} />
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {product.badgeLabel ? <Badge>{product.badgeLabel}</Badge> : null}
                  {product.brand ? <Badge variant="outline">{product.brand.name}</Badge> : null}
                  {product.category ? <Badge variant="secondary">{product.category.name}</Badge> : null}
                </div>
                <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
                {product.description ? (
                  <p className="text-muted-foreground">{product.description}</p>
                ) : null}
              </div>

              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Variant</p>
                <div className="mt-3 grid gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      className={`rounded-md border p-3 text-left transition ${selectedVariant?.id === variant.id ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                      onClick={() => setVariantId(variant.id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{variant.name}</p>
                          <p className="text-xs text-muted-foreground">{variant.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatMoney(variant.price, variant.currency)}</p>
                          <p className="text-xs text-muted-foreground">
                            {variant.availableQuantity > 0 ? `${variant.availableQuantity} available` : "Out of stock"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-semibold">
                    {formatMoney(selectedVariant?.price, selectedVariant?.currency)}
                  </p>
                </div>
                <Button
                  disabled={!selectedVariant || selectedVariant.availableQuantity <= 0 || addToCart.isPending}
                  onClick={() => selectedVariant && addToCart.mutate(selectedVariant)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {addToCart.isPending ? "Adding..." : "Add to cart"}
                </Button>
              </div>

              {product.highlights && product.highlights.length > 0 ? (
                <section className="grid gap-3 sm:grid-cols-2">
                  {product.highlights.map((highlight) => (
                    <article key={highlight.id} className="rounded-md border p-4">
                      <p className="font-medium">{highlight.title}</p>
                      {highlight.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{highlight.description}</p>
                      ) : null}
                    </article>
                  ))}
                </section>
              ) : null}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function ProductMedia(props: { product: ShopProduct; variant: ShopVariant | null }) {
  const imageUrl = props.variant?.imageUrls?.[0] || productImage(props.product);
  return (
    <div className="overflow-hidden rounded-md border bg-muted">
      <div className="aspect-square">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
        )}
      </div>
    </div>
  );
}
