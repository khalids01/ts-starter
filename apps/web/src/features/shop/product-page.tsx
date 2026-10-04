import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, PackageCheck, ShoppingCart, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Img } from "@/components/core/img";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";
import type { ShopProduct, ShopVariant } from "./types";
import { formatMoney, productImage } from "./utils";
import { useCartSheetStore } from "./cart/sheet-store";
import { useCartStore } from "./cart/store";
import {
  PublicShopShell,
} from "./public-shop-shell";

import { PublicShopFooter } from "@/components/public-footer";
import {
  savedProductFromProduct,
  useSavedItemsStore,
} from "./saved-items-store";

export function ShopProductPage(props: { slug: string }) {
  const openCart = useCartSheetStore((state) => state.openCart);
  const addItem = useCartStore((state) => state.addItem);
  const productQuery = useQuery({
    queryKey: queryKeys.shop.product(props.slug),
    queryFn: async () => {
      const { data, error } = await client.shop.products({ slug: props.slug }).get();
      if (error) {
        throw new Error(String(error.value?.message || error.message || "Failed to load product"));
      }
      return data as ShopProduct;
    },
  });
  const product = productQuery.data;
  const [variantId, setVariantId] = useState("");
  const selectedVariant = useMemo(() => {
    if (!product) {
      return null;
    }
    return product.variants.find((variant) => variant.isActive && variant.id === variantId)
      ?? product.variants.find((variant) => variant.isActive && variant.isDefault)
      ?? product.variants.find((variant) => variant.isActive)
      ?? null;
  }, [product, variantId]);

  const toggleSaved = useSavedItemsStore((state) => state.toggle);
  const isSaved = useSavedItemsStore((state) => (product ? state.isSaved(product.id) : false));

  const addToCart = (variant: ShopVariant) => {
    if (!product) {
      return;
    }
    addItem({ product, variant });
    toast.success("Added to cart");
    openCart();
  };

  return (
    <PublicShopShell footer={<PublicShopFooter />}>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <Link to="/shop" className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeft className="size-4" />
          Products
        </Link>

        {productQuery.isLoading ? (
          <StateCard>Loading product...</StateCard>
        ) : !product ? (
          <StateCard>
            <h1 className="text-lg font-semibold text-foreground">We couldn’t load this product</h1>
            <p className="mt-2">It may be unavailable, or the connection may have interrupted.</p>
            <Button variant="outline" className="mt-5" onClick={() => void productQuery.refetch()}><RefreshCw className="size-4" />Try again</Button>
          </StateCard>
        ) : (
          <section className="mt-6 grid items-start gap-8 md:gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <ProductMedia product={product} variant={selectedVariant} />
            <div className="min-w-0 space-y-6 lg:sticky lg:top-28">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {product.badgeLabel ? <Badge>{product.badgeLabel}</Badge> : null}
                  {product.brand ? <Badge variant="outline">{product.brand.name}</Badge> : null}
                  {product.category ? <Badge variant="secondary">{product.category.name}</Badge> : null}
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="break-words text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>
                    {product.fulfillmentKind === "fresh_food" ? <p className="mt-3 text-sm">Fresh food requires an available local delivery slot for your postal code at checkout.</p> : null}
                    {product.fulfillmentKind === "gadget" && (product.warrantyDays ?? 0) > 0 ? <p className="mt-3 text-sm">{product.warrantyDays} days of warranty from delivery. Claims are reviewed against your purchased unit.</p> : null}
                    {product.description ? (
                      <p className="mt-3 leading-7 text-muted-foreground">{product.description}</p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-pressed={isSaved}
                    className="shrink-0 rounded-full"
                    onClick={() => toggleSaved(savedProductFromProduct(product))}
                  >
                    <Heart className={cn("size-4", isSaved ? "fill-rose-500 text-rose-500" : "")} />
                    <span className="sr-only">{isSaved ? "Remove from saved" : "Save product"}</span>
                  </Button>
                </div>
              </div>

              <section className="rounded-2xl border bg-card p-5">
                <p className="text-sm font-medium">Select your option</p>
                <div className="mt-3 grid gap-2">
                  {product.variants.filter((variant) => variant.isActive).map((variant) => (
                    <Button
                      key={variant.id}
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-auto min-h-16 justify-between gap-3 rounded-xl p-4 text-left whitespace-normal",
                        selectedVariant?.id === variant.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "",
                      )}
                      aria-pressed={selectedVariant?.id === variant.id}
                      onClick={() => setVariantId(variant.id)}
                    >
                      <span className="min-w-0">
                        <span className="block font-medium">{variant.name}</span>
                        <span className="block text-xs text-muted-foreground">{variant.sku}</span>
                      </span>
                      <span className="text-right">
                        <span className="block font-semibold">{formatMoney(variant.price, variant.currency)}</span>
                        <span className="block text-xs text-muted-foreground">
                          {variant.availableQuantity > 0 ? `${variant.availableQuantity} available` : "Out of stock"}
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-3 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-semibold">
                    {formatMoney(selectedVariant?.price, selectedVariant?.currency)}
                  </p>
                  {selectedVariant?.compareAtPrice && Number(selectedVariant.compareAtPrice) > Number(selectedVariant.price) ? (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatMoney(selectedVariant.compareAtPrice, selectedVariant.currency)}
                    </p>
                  ) : null}
                </div>
                <Button
                  className="min-h-12 rounded-full px-8"
                  disabled={!selectedVariant || selectedVariant.availableQuantity <= 0}
                  onClick={() => selectedVariant && addToCart(selectedVariant)}
                >
                  <ShoppingCart className="size-4" />
                  {selectedVariant && selectedVariant.availableQuantity > 0 ? "Add to cart" : "Currently unavailable"}
                </Button>
              </section>

              <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"><Check className="mt-1 size-4 shrink-0" />Delivery options and the final order total are confirmed at checkout.</p>

              {product.specs?.length ? (
                <section className="rounded-2xl border bg-card p-5">
                  <h2 className="font-semibold">Product details</h2>
                  <dl className="mt-4 divide-y">{product.specs.map((spec) => <div key={spec.attributeId} className="grid grid-cols-2 gap-4 py-3 text-sm"><dt className="text-muted-foreground">{spec.name}</dt><dd className="break-words font-medium">{spec.value}</dd></div>)}</dl>
                </section>
              ) : null}

              {product.highlights && product.highlights.length > 0 ? (
                <section className="grid gap-3 sm:grid-cols-2">
                  {product.highlights.map((highlight) => (
                    <article key={highlight.id} className="rounded-2xl border bg-card p-5">
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
    </PublicShopShell>
  );
}

function ProductMedia(props: { product: ShopProduct; variant: ShopVariant | null }) {
  const images = useMemo(() => {
    const urls = [
      ...(props.variant?.imageUrls ?? []),
      productImage(props.product),
      props.product.coverImageUrl,
    ].filter(Boolean) as string[];
    return [...new Set(urls)];
  }, [props.product, props.variant]);
  const [activeImage, setActiveImage] = useState(images[0] ?? "");

  useEffect(() => {
    setActiveImage(images[0] ?? "");
  }, [images]);

  return (
    <div className="grid gap-3">
      <div className="overflow-hidden rounded-3xl border bg-muted/40">
        <div className="aspect-square">
          {activeImage ? (
            <Img src={activeImage} alt={props.product.name} objectFit="contain" loading="eager" className="h-full w-full" />
          ) : (
            <FallbackProductVisual category={props.product.category?.name} />
          )}
        </div>
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((image, index) => (
            <Button
              key={image}
              type="button"
              variant="outline"
              aria-label={`View product image ${index + 1}`}
              aria-pressed={activeImage === image}
              className={cn(
                "h-auto overflow-hidden rounded-xl p-0",
                activeImage === image ? "border-primary ring-1 ring-primary" : "",
              )}
              onClick={() => setActiveImage(image)}
            >
              <span className="aspect-square w-full">
                <Img src={image} alt="" objectFit="contain" className="h-full w-full" />
              </span>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FallbackProductVisual(_props: { category?: string | null }) {
  return (
    <div className="grid h-full w-full place-items-center bg-muted">
      <PackageCheck className="size-14 text-muted-foreground" />
    </div>
  );
}

function StateCard(props: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}
