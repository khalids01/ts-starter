import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingCart } from "lucide-react";
import { queryKeys } from "@/constants/query-keys";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shopApi } from "./api";
import type { PageResult, ShopProduct } from "./types";
import { formatMoney, productImage } from "./utils";

export function ShopPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [brandId, setBrandId] = useState("all");
  const filters = { search, categoryId, brandId };
  const query = useQuery({
    queryKey: queryKeys.shop.products(filters),
    queryFn: () =>
      shopApi.products({
        limit: 100,
        search: search || undefined,
        categoryId: categoryId === "all" ? undefined : categoryId,
        brandId: brandId === "all" ? undefined : brandId,
      }) as Promise<PageResult<ShopProduct>>,
  });
  const products = query.data?.items ?? [];
  const categories = useMemo(
    () => uniqueOptions(products.map((product) => product.category).filter(Boolean) as Array<{ id: string; name: string }>),
    [products],
  );
  const brands = useMemo(
    () => uniqueOptions(products.map((product) => product.brand).filter(Boolean) as Array<{ id: string; name: string }>),
    [products],
  );

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6">
        <section className="grid gap-3 rounded-md border p-3 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              placeholder="Search products"
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={brandId}
            onChange={(event) => setBrandId(event.target.value)}
          >
            <option value="all">All brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </section>

        {query.isLoading ? (
          <StateCard>Loading products...</StateCard>
        ) : products.length === 0 ? (
          <StateCard>No products found.</StateCard>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export function ShopHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link to="/shop" className="text-lg font-semibold">Shop</Link>
        <nav className="flex items-center gap-2">
          <Link to="/cart" className={buttonVariants({ variant: "outline" })}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Cart
          </Link>
        </nav>
      </div>
    </header>
  );
}

function ProductCard(props: { product: ShopProduct }) {
  const imageUrl = productImage(props.product);
  const defaultVariant = props.product.variants[0];
  return (
    <article className="overflow-hidden rounded-md border bg-card">
      <Link to="/shop/products/$slug" params={{ slug: props.product.slug }} className="block">
        <div className="aspect-[4/3] bg-muted">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
          )}
        </div>
      </Link>
      <div className="grid gap-3 p-4">
        <div className="min-w-0">
          <Link to="/shop/products/$slug" params={{ slug: props.product.slug }} className="font-medium hover:underline">
            {props.product.name}
          </Link>
          <p className="truncate text-sm text-muted-foreground">{props.product.category?.name ?? "Product"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {props.product.badgeLabel ? <Badge variant="secondary">{props.product.badgeLabel}</Badge> : null}
          {props.product.isTrending ? <Badge variant="outline">Trending</Badge> : null}
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold">{formatMoney(defaultVariant?.price, defaultVariant?.currency)}</p>
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

function StateCard(props: { children: ReactNode }) {
  return (
    <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}

function uniqueOptions<T extends { id: string; name: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}
