import { brandConfig } from "@config/brand";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowRight,
  Heart,
  Package,
  PackageSearch,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { Img } from "@/components/core/img";
import { PublicShopFooter } from "@/components/public-footer";
import { buttonVariants } from "@/components/ui/button";
import { queryKeys } from "@/constants/query-keys";
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";
import { PublicShopShell } from "@/features/shop/public-shop-shell";
import {
  savedProductFromProduct,
  useSavedItemsStore,
} from "@/features/shop/saved-items-store";
import type {
  PageResult,
  ShopCategory,
  ShopProduct,
} from "@/features/shop/types";
import { formatMoney, productImage } from "@/features/shop/utils";
import { usePublicData } from "@/providers/public-data-provider";

import type { ReactNode } from "react";

const container = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
const landingButton = ({
  className,
  ...options
}: NonNullable<Parameters<typeof buttonVariants>[0]>) =>
  cn(buttonVariants(options), className);
const action =
  "h-12 rounded-full bg-emerald-800 px-6 text-white hover:bg-emerald-900 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300";

export function Home() {
  const { categories } = usePublicData();
  const products = useQuery({
    queryKey: queryKeys.shop.products({ limit: 8 }),
    queryFn: async () => {
      const { data, error } = await client.shop.products.get({
        query: { limit: 8 },
      });
      if (error) throw new Error("Unable to load products");
      return data as PageResult<ShopProduct>;
    },
  });
  const items = products.data?.items ?? [];
  const featured = categories.filter((category) => category.isFeatured);
  const visibleCategories = (featured.length ? featured : categories).slice(
    0,
    6,
  );

  return (
    <PublicShopShell footer={<PublicShopFooter />}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-3"
      >
        Skip to content
      </a>
      <main id="main-content">
        <Hero />
        <ShoppingGuide />
        {visibleCategories.length > 0 && (
          <Categories categories={visibleCategories} />
        )}
        <section
          id="discover"
          className={cn(container, "scroll-mt-36 py-12 sm:py-20")}
        >
          <div className="mb-7 flex items-end justify-between gap-4 sm:mb-10">
            <div>
              <Eyebrow>THE EVERYDAY EDIT</Eyebrow>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {brandConfig.homepage.collectionTitle}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                {brandConfig.homepage.collectionDescription}
              </p>
            </div>
            <Link
              to="/shop"
              className="hidden shrink-0 items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
            >
              Shop all <ArrowRight className="size-4" />
            </Link>
          </div>
          {products.isPending ? (
            <div
              className="grid grid-cols-2 gap-4 lg:grid-cols-4"
              aria-label="Loading products"
              aria-busy="true"
            >
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="space-y-3 motion-safe:animate-pulse">
                  <div className="aspect-[4/5] rounded-2xl bg-muted" />
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-1/3 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : products.isError ? (
            <div
              role="alert"
              className="rounded-2xl border bg-muted/30 px-6 py-12 text-center"
            >
              <h3 className="font-semibold">
                We couldn’t load the collection.
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Please try again in a moment.
              </p>
              <button
                type="button"
                onClick={() => void products.refetch()}
                className={landingButton({
                  variant: "outline",
                  className: "mt-5 rounded-full",
                })}
              >
                Try again
              </button>
            </div>
          ) : items.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border bg-muted/30 px-6 py-12 text-center">
              <ShoppingBag className="mx-auto mb-4 size-8 text-muted-foreground" />
              <h3 className="font-semibold">Something good is on its way.</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Our collection is being prepared. Check back soon.
              </p>
            </div>
          )}
          <Link
            to="/shop"
            className={landingButton({
              variant: "outline",
              className: "mt-8 flex h-12 w-full rounded-full sm:hidden",
            })}
          >
            Explore the shop <ArrowRight className="size-4" />
          </Link>
        </section>
        <EverydayBanner />
        <section
          className={cn(
            container,
            "grid gap-8 py-14 sm:py-20 md:grid-cols-[1fr_1.2fr] md:gap-16",
          )}
        >
          <div>
            <Eyebrow>FROM BROWSING TO YOUR DOOR</Eyebrow>
            <h2 className="mt-3 max-w-sm text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Less effort.
              <br />
              More everyday joy.
            </h2>
          </div>
          <div className="divide-y">
            {[
              {
                number: "01",
                title: "Find something you love",
                text: "Explore the collection, compare your options and save your favourites for later.",
              },
              {
                number: "02",
                title: "Make it yours",
                text: "Choose your options and review your basket. Delivery costs are shown before you place your order.",
              },
              {
                number: "03",
                title: "Stay in the loop",
                text: "Follow your order’s progress, from confirmation through to delivery.",
              },
            ].map((step) => (
              <div key={step.number} className="flex gap-5 py-6 first:pt-0">
                <span className="pt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-lg font-medium">{step.title}</h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </PublicShopShell>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.18em] text-emerald-800 sm:text-xs dark:text-emerald-400">
      {children}
    </p>
  );
}

function Hero() {
  return (
    <section className={cn(container, "pt-4 sm:pt-6")}>
      <div className="relative isolate overflow-hidden rounded-[1.5rem] bg-[#f0f1e9] text-[#183c2e] sm:rounded-[2rem] dark:bg-[#172a23] dark:text-[#e8eee6]">
        <div className="grid lg:min-h-[560px] lg:grid-cols-[1.05fr_1fr]">
          <div className="relative z-10 px-6 pb-8 pt-9 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-current/15 px-3 py-1.5 text-[10px] font-medium tracking-[0.12em] sm:mb-8 sm:text-xs">
              <span className="size-1.5 rounded-full bg-emerald-700 dark:bg-emerald-400" />{" "}
              {brandConfig.homepage.eyebrow}
            </div>
            <h1 className="max-w-xl text-[clamp(2.6rem,6vw,4.8rem)] font-semibold leading-[1.03] tracking-[-0.055em]">
              {brandConfig.homepage.headline}
              <br />
              {brandConfig.homepage.highlightedLine}
              <span className="text-emerald-700 dark:text-emerald-400">.</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 opacity-75 sm:mt-7 sm:text-base">
              {brandConfig.homepage.description}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5 sm:mt-9">
              <Link to="/shop" className={landingButton({ className: action })}>
                Explore the shop <ArrowRight className="ml-2 size-4" />
              </Link>
              <a
                href="#discover"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
              >
                Find inspiration <ArrowDown className="size-4" />
              </a>
            </div>
            <p className="mt-7 flex items-center gap-2 text-xs opacity-70 sm:mt-10">
              <ShoppingBag className="size-4" /> Your next favourite starts
              here.
            </p>
          </div>
          <div className="relative mx-5 mb-5 min-h-[260px] overflow-hidden rounded-2xl bg-[#e2e7da] sm:mx-8 sm:min-h-[340px] lg:mx-0 lg:mb-0 lg:rounded-none dark:bg-[#213a30]">
            <Img
              src={brandConfig.homepage.heroImage}
              alt=""
              loading="eager"
              fetchPriority="high"
              showPlaceholder={false}
              className="absolute inset-0 h-full w-full"
            />
            <span className="absolute bottom-5 left-5 rounded-full bg-background/95 px-4 py-2 text-xs font-medium text-foreground">
              {brandConfig.name}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShoppingGuide() {
  return (
    <div className={cn(container, "py-7 sm:py-9")}>
      <div className="grid gap-4 border-b pb-7 sm:grid-cols-3 sm:gap-8 sm:pb-9">
        {[
          {
            icon: SlidersHorizontal,
            title: "Find your perfect fit",
            text: "Choose the options that suit you.",
          },
          {
            icon: ShoppingBag,
            title: "A clearer checkout",
            text: "Review your total before ordering.",
          },
          {
            icon: PackageSearch,
            title: "Follow your order",
            text: "Keep up with delivery progress.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex items-center gap-3 sm:justify-center"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted/60">
              <Icon className="size-4" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Categories({ categories }: { categories: ShopCategory[] }) {
  return (
    <section className={cn(container, "pb-4 pt-5 sm:pt-8")}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          What are you looking for?
        </h2>
        <Link
          to="/shop"
          aria-label="Browse all categories"
          className="grid size-10 shrink-0 place-items-center rounded-full border transition-colors hover:bg-muted"
        >
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="flex flex-wrap gap-3 ">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            to="/shop"
            search={{ categoryId: category.id }}
            className="max-w-32 w-full group rounded-2xl bg-muted/40 p-3 text-center transition-colors hover:bg-muted"
          >
            <div
              className={cn(
                "mx-auto mb-3 grid size-20 place-items-center overflow-hidden rounded-xl sm:size-26",
                index % 2
                  ? "bg-emerald-100/50 dark:bg-emerald-950/30"
                  : "bg-orange-100/50 dark:bg-orange-950/20",
              )}
            >
              {category.imageUrl || category.iconUrl ? (
                <Img
                  src={(category.imageUrl || category.iconUrl)!}
                  alt=""
                  objectFit="contain"
                  className="h-full w-full motion-safe:transition-transform motion-safe:group-hover:scale-105"
                />
              ) : (
                <Package
                  className="size-9 text-muted-foreground"
                  strokeWidth={1}
                />
              )}
            </div>
            <h3 className="truncate text-sm font-medium">{category.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: ShopProduct }) {
  const image = productImage(product);
  const variants = product.variants.filter((variant) => variant.isActive);
  const variant = variants.find((variant) => variant.isDefault) ?? variants[0];
  const saved = useSavedItemsStore((state) =>
    state.items.some((item) => item.id === product.id),
  );
  const toggle = useSavedItemsStore((state) => state.toggle);
  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden rounded-2xl bg-muted/50">
        <Link
          to="/shop/products/$slug"
          params={{ slug: product.slug }}
          aria-label={`View ${product.name}`}
          className="block aspect-square"
        >
          {image ? (
            <Img
              src={image}
              alt={product.name}
              objectFit="cover"
              className="h-full w-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center">
              <Package
                className="size-10 text-muted-foreground"
                strokeWidth={1}
              />
            </div>
          )}
        </Link>
        {product.badgeLabel && (
          <span className="absolute left-3 top-3 max-w-[calc(100%-4.5rem)] truncate rounded-full bg-background px-2.5 py-1 text-[10px] font-medium sm:text-xs">
            {product.badgeLabel}
          </span>
        )}
        <button
          type="button"
          aria-label={`${saved ? "Unsave" : "Save"} ${product.name}`}
          aria-pressed={saved}
          onClick={() => toggle(savedProductFromProduct(product))}
          className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-background/95 text-foreground shadow-sm transition-colors hover:bg-background"
        >
          <Heart
            className={cn(
              "size-4",
              saved &&
                "fill-emerald-700 text-emerald-700 dark:fill-emerald-400 dark:text-emerald-400",
            )}
          />
        </button>
      </div>
      <p className="mt-4 truncate text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
        {product.category?.name ?? "Explore the collection"}
      </p>
      <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-6 sm:text-base">
        <Link
          to="/shop/products/$slug"
          params={{ slug: product.slug }}
          className="hover:underline"
        >
          {product.name}
        </Link>
      </h3>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold">
          {variant
            ? formatMoney(variant.price, variant.currency)
            : "View options"}
        </p>
        {variant?.compareAtPrice &&
          Number(variant.compareAtPrice) > Number(variant.price) && (
            <span className="text-xs text-muted-foreground line-through">
              {formatMoney(variant.compareAtPrice, variant.currency)}
            </span>
          )}
      </div>
    </article>
  );
}

function EverydayBanner() {
  return (
    <section className={cn(container, "pb-4")}>
      <div className="relative overflow-hidden rounded-3xl bg-emerald-950 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-20 size-80 rounded-full border-[45px] border-white/5 sm:size-[420px]"
        />
        <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-emerald-200">
              A BASKET FULL OF POSSIBILITIES
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {brandConfig.homepage.bannerTitle}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-emerald-100/80">
              {brandConfig.homepage.bannerDescription}
            </p>
          </div>
          <Link
            to="/shop"
            className={landingButton({
              className:
                "h-12 w-fit shrink-0 rounded-full bg-white px-6 text-emerald-950 hover:bg-emerald-50",
            })}
          >
            Discover the collection <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
