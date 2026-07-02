import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Heart, PackageCheck, Search, SlidersHorizontal, Smartphone } from "lucide-react";
import { queryKeys } from "@/constants/query-keys";
import { Img } from "@/components/core/img";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { shopApi } from "./api";
import type { PageResult, ShopProduct } from "./types";
import { formatMoney, productImage } from "./utils";
import {
  PublicShopFooter,
  PublicShopShell,
  useShopCategories,
} from "./public-shop-shell";
import {
  savedProductFromProduct,
  useSavedItemsStore,
} from "./saved-items-store";

export function ShopPage() {
  const routeSearch = useSearch({ from: "/shop" });
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(routeSearch.search);
  const categoryId = routeSearch.categoryId || "all";
  const brandId = routeSearch.brandId || "all";

  useEffect(() => {
    setSearchInput(routeSearch.search);
  }, [routeSearch.search]);

  const categoriesQuery = useShopCategories();
  const productsQuery = useQuery({
    queryKey: queryKeys.shop.products(routeSearch),
    queryFn: () =>
      shopApi.products({
        limit: 100,
        search: routeSearch.search || undefined,
        categoryId: categoryId === "all" ? undefined : categoryId,
        brandId: brandId === "all" ? undefined : brandId,
      }) as Promise<PageResult<ShopProduct>>,
  });

  const products = productsQuery.data?.items ?? [];
  const categories = categoriesQuery.data ?? [];
  const brands = useMemo(
    () =>
      uniqueOptions(
        products
          .map((product) => product.brand)
          .filter(Boolean) as Array<{ id: string; name: string }>,
      ),
    [products],
  );

  const updateFilters = (next: Partial<typeof routeSearch>) => {
    void navigate({
      to: "/shop",
      search: {
        search: next.search ?? routeSearch.search,
        categoryId: next.categoryId ?? categoryId,
        brandId: next.brandId ?? brandId,
      },
    });
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

  const selectedCategory = categories.find((category) => category.id === categoryId);

  return (
    <PublicShopShell footer={<PublicShopFooter categories={categories} />}>
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6">
        <section className="grid gap-2">
          <Badge variant="secondary" className="w-fit">
            Food + gadgets
          </Badge>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">
                {selectedCategory ? selectedCategory.name : "Shop products"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Browse fresh food, phones, laptops, accessories, and mixed catalog products with live inventory-backed pricing.
              </p>
            </div>
            <Link to="/track-order" className={buttonVariants({ variant: "outline" })}>
              Track an order
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="grid gap-3 rounded-md border bg-card p-3 md:grid-cols-[1fr_220px_220px]">
          <form onSubmit={submitSearch} className="flex min-w-0 gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={searchInput}
                placeholder="Search mango, honey, phone..."
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <Button type="submit" size="icon">
              <Search className="size-4" />
              <span className="sr-only">Search</span>
            </Button>
          </form>

          <Select value={categoryId} onValueChange={(value) => updateFilters({ categoryId: value ?? "all" })}>
            <SelectTrigger className="w-full">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={brandId} onValueChange={(value) => updateFilters({ brandId: value ?? "all" })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        {productsQuery.isLoading ? (
          <StateCard>Loading products...</StateCard>
        ) : products.length === 0 ? (
          <StateCard>
            <p>No products found.</p>
            <Button
              type="button"
              className="mt-4"
              onClick={() => updateFilters({ search: "", categoryId: "all", brandId: "all" })}
            >
              Reset filters
            </Button>
          </StateCard>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <StoreProductCard key={product.id} product={product} />
            ))}
          </section>
        )}
      </main>
    </PublicShopShell>
  );
}

export function StoreProductCard(props: { product: ShopProduct; className?: string }) {
  const imageUrl = productImage(props.product);
  const defaultVariant = props.product.variants[0];
  const toggleSaved = useSavedItemsStore((state) => state.toggle);
  const isSaved = useSavedItemsStore((state) => state.isSaved(props.product.id));

  return (
    <article className={cn("overflow-hidden rounded-md border bg-card", props.className)}>
      <div className="relative">
        <Link to="/shop/products/$slug" params={{ slug: props.product.slug }} className="block">
          <div className="aspect-[4/3] bg-muted">
            {imageUrl ? (
              <Img src={imageUrl} alt="" className="h-full w-full object-cover transition hover:scale-[1.02]" />
            ) : (
              <FallbackProductVisual category={props.product.category?.name} />
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
      <div className="grid gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          {props.product.badgeLabel ? <Badge>{props.product.badgeLabel}</Badge> : null}
          {props.product.isTrending ? <Badge variant="secondary">Trending</Badge> : null}
          {props.product.category ? <Badge variant="outline">{props.product.category.name}</Badge> : null}
        </div>
        <div className="min-w-0">
          <Link
            to="/shop/products/$slug"
            params={{ slug: props.product.slug }}
            className="line-clamp-1 font-medium hover:underline"
          >
            {props.product.name}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {props.product.description ?? productFallbackCopy(props.product.category?.name)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{formatMoney(defaultVariant?.price, defaultVariant?.currency)}</p>
            {defaultVariant?.compareAtPrice ? (
              <p className="text-xs text-muted-foreground line-through">
                {formatMoney(defaultVariant.compareAtPrice, defaultVariant.currency)}
              </p>
            ) : null}
          </div>
          <Link
            to="/shop/products/$slug"
            params={{ slug: props.product.slug }}
            className={buttonVariants({ size: "sm" })}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

function FallbackProductVisual(props: { category?: string | null }) {
  const isGadget = /phone|laptop|gadget|pc|computer/i.test(props.category ?? "");
  return (
    <div
      className={cn(
        "grid h-full w-full place-items-center",
        isGadget ? "bg-cyan-100 dark:bg-cyan-950/40" : "bg-emerald-100 dark:bg-emerald-950/40",
      )}
    >
      {isGadget ? (
        <Smartphone className="size-12 text-cyan-700" />
      ) : (
        <PackageCheck className="size-12 text-emerald-700" />
      )}
    </div>
  );
}

function productFallbackCopy(category?: string | null) {
  if (/phone|laptop|gadget|pc|computer/i.test(category ?? "")) {
    return "Variant-ready gadget product with SKU and stock options.";
  }
  return "Fresh catalog product with clear pricing and checkout-ready inventory.";
}

function StateCard(props: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}

function uniqueOptions<T extends { id: string; name: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}
