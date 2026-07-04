import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  PackageCheck,
  Tags,
} from "lucide-react";
import { Img } from "@/components/core/img";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { queryKeys } from "@/constants/query-keys";
import { cn } from "@/lib/utils";
import { client } from "@/lib/client";
import type { PageResult, ShopCategory, ShopProduct } from "@/features/shop/types";
import { formatMoney, productImage } from "@/features/shop/utils";
import { PublicShopFooter, PublicShopShell } from "@/features/shop/public-shop-shell";
import { usePublicData } from "@/providers/public-data-provider";

const asset = (path: string) => `/ecommerce/${path}`;

const promises = [
  {
    title: "Secure packaging",
    description: "Products are prepared and packed with care.",
    icon: asset("icons/handle-with-care.png"),
  },
  {
    title: "Fast delivery",
    description: "Inside-city and outside-city rates ready for checkout.",
    icon: asset("icons/delivery-man.png"),
  },
  {
    title: "Quality checked",
    description: "Inventory, variants, and prices stay clear before checkout.",
    icon: asset("icons/top-rated.png"),
  },
  {
    title: "Helpful support",
    description: "Order, payment, and delivery status are easy to follow.",
    icon: asset("icons/technical-support.png"),
  },
];

const fallbackProducts = [
  {
    name: "Featured Product",
    category: "Featured Products",
    imageUrl: asset("images/slider1.jpg"),
    price: "BDT 1,250",
    badge: "Featured",
  },
  {
    name: "Catalog Item",
    category: "New Arrivals",
    imageUrl: asset("images/slider2.jpg"),
    price: "BDT 650",
    badge: "New",
  },
  {
    name: "Variant Product",
    category: "Popular Picks",
    imageUrl: null,
    price: "BDT 24,500",
    badge: "Variant ready",
  },
];

export const Home = () => {
 const {categories}= usePublicData(); 
  const productsQuery = useQuery({
    queryKey: queryKeys.shop.products({ limit: 8 }),
    queryFn: async () => {
      const { data, error } = await client.shop.products.get({ query: { limit: 8 } });
      if (error) {
        throw new Error(String(error.value?.message || error.message || "Failed to load products"));
      }
      return data as PageResult<ShopProduct>;
    },
  });

  
  const products = productsQuery.data?.items ?? [];

  return (
    <PublicShopShell footer={<PublicShopFooter/>}>
      <main>
        <Hero categories={categories} />
        <ServiceStrip />
        <CategoryBrowse categories={categories} />
        <FeaturedProducts products={products} loading={productsQuery.isLoading} />
        <MixedCatalogPromo />
      </main>
    </PublicShopShell>
  );
};

function Hero(props: { categories: ShopCategory[] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Img
          src={asset("images/slider1.jpg")}
          alt=""
          className="h-full w-full object-cover"
          showPlaceholder={false}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/78 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative mx-auto grid min-h-[660px] w-full max-w-7xl content-center gap-8 px-4 py-12 md:px-6 lg:grid-cols-[1fr_360px]">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-5 border bg-background/80">
            Dynamic product catalog
          </Badge>
          <h1 className="text-4xl font-semibold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
            Products, categories, and variants ready for a complete storefront.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Browse active products with clear prices, category-aware filters,
            stock-aware variants, saved items, cart, and checkout.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/shop" className={buttonVariants({ size: "lg", className: "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800 dark:border-emerald-500 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400" })}>
              Shop products
              <ArrowRight className="size-4" />
            </Link>
            <Link to="/cart" className={buttonVariants({ variant: "outline", size: "lg", className: "bg-background/80" })}>
              View cart
            </Link>
          </div>
        </div>

        <div className="grid gap-3 self-end">
          <PromoTile
            title="Category properties"
            description="Filterable attributes can be attached to categories and products."
            imageUrl={asset("images/slider2.jpg")}
            href="/shop"
          />
          <PromoTile
            title="Variant inventory"
            description="Options, prices, stock, barcodes, and images are variant-aware."
            icon={<Tags className="size-8 text-cyan-700" />}
            href="/shop"
          />
        </div>
      </div>

      <div className="relative mx-auto -mt-16 grid w-full max-w-7xl gap-3 px-4 pb-8 md:px-6 sm:grid-cols-3">
        {props.categories.slice(0, 3).map((category) => (
          <a
            key={category.id}
            href={`/shop?categoryId=${encodeURIComponent(category.id)}`}
            className="rounded-md border bg-background/95 p-4 shadow-sm backdrop-blur transition hover:border-emerald-600"
          >
            <div className="flex items-center gap-3">
              <CategoryIcon category={category} />
              <div className="min-w-0">
                <p className="truncate font-medium">{category.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {category.productCount ? `${category.productCount} products` : category.description ?? "Browse category"}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function PromoTile(props: {
  title: string;
  description: string;
  href: string;
  imageUrl?: string;
  icon?: ReactNode;
}) {
  return (
    <a
      href={props.href}
      className="group overflow-hidden rounded-md border bg-background/90 backdrop-blur transition hover:border-foreground"
    >
      <div className="grid min-h-36 grid-cols-[112px_1fr]">
        <div className="grid place-items-center bg-muted">
          {props.imageUrl ? (
            <Img src={props.imageUrl} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            props.icon
          )}
        </div>
        <div className="p-4">
          <p className="font-medium">{props.title}</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{props.description}</p>
        </div>
      </div>
    </a>
  );
}

function ServiceStrip() {
  return (
    <section className="border-y bg-muted/35">
      <div className="mx-auto grid w-full max-w-7xl gap-3 px-4 py-6 md:grid-cols-2 md:px-6 xl:grid-cols-4">
        {promises.map((item) => (
          <article key={item.title} className="flex items-center gap-3 rounded-md border bg-background p-4">
            <img src={item.icon} alt="" className="size-12 object-contain" />
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm leading-5 text-muted-foreground">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CategoryBrowse(props: { categories: ShopCategory[]; }) {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-12 md:px-6">
      <SectionHeader
        eyebrow="Browse categories"
        title="Products organized by category"
        description="Shop by the categories available in this store, with filters and product data driven by the catalog."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(props.categories)?.filter(c=>c.isFeatured)?.map((category) => (
          <a
            key={category.id}
            href={`/shop?categoryId=${encodeURIComponent(category.id)}`}
            className="group rounded-md border bg-card p-4 transition hover:border-emerald-600"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <CategoryIcon category={category} />
              <span className="text-xs text-muted-foreground">
                {category.productCount ? `${category.productCount} items` : "Explore"}
              </span>
            </div>
            <h3 className="font-medium">{category.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {category.description ?? "Browse products in this category."}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}

function FeaturedProducts(props: { products: ShopProduct[]; loading: boolean }) {
  const hasProducts = props.products.length > 0;

  return (
    <section className="bg-muted/35">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-12 md:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow="Featured products"
            title="Products ready for checkout"
            description="Active products show their storefront prices, images, categories, and available variants."
          />
          <Link to="/shop" className={buttonVariants({ variant: "outline" })}>
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {hasProducts ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {props.products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <FallbackProducts loading={props.loading} />
        )}
      </div>
    </section>
  );
}

function ProductCard(props: { product: ShopProduct }) {
  const imageUrl = productImage(props.product);
  const variant = props.product.variants[0];

  return (
    <article className="overflow-hidden rounded-md border bg-card">
      <Link to="/shop/products/$slug" params={{ slug: props.product.slug }} className="block">
        <div className="aspect-[4/3] bg-muted">
          {imageUrl ? (
            <Img src={imageUrl} alt="" className="h-full w-full object-cover transition hover:scale-[1.02]" />
          ) : (
            <FallbackProductVisual category={props.product.category?.name} />
          )}
        </div>
      </Link>
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
            className="font-medium hover:underline"
          >
            {props.product.name}
          </Link>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {props.product.description ?? "Configured with variants, images, and inventory."}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold">{formatMoney(variant?.price, variant?.currency)}</p>
          <Link
            to="/shop/products/$slug"
            params={{ slug: props.product.slug }}
            className={buttonVariants({ size: "sm" })}
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

function FallbackProducts(props: { loading: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {fallbackProducts.map((product) => (
        <article key={product.name} className="overflow-hidden rounded-md border bg-card">
          <div className="aspect-[4/3] bg-muted">
            {product.imageUrl ? (
              <Img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <FallbackProductVisual category={product.category} />
            )}
          </div>
          <div className="grid gap-2 p-4">
            <Badge variant="secondary">{props.loading ? "Loading" : product.badge}</Badge>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <p className="font-semibold">{product.price}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function MixedCatalogPromo() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-12 md:px-6 lg:grid-cols-2">
      <CatalogBand
        title="Flexible category modeling"
        description="Create categories with filterable properties so each catalog can expose the right buying information."
        icon={<PackageCheck className="size-8 text-emerald-700" />}
        href="/shop"
        tone="emerald"
      />
      <CatalogBand
        title="Variant-ready product pages"
        description="Products can use brands, compare-at prices, weights, images, searchable SKUs, and stock-aware variants."
        icon={<Tags className="size-8 text-cyan-700" />}
        href="/shop"
        tone="cyan"
      />
    </section>
  );
}

function CatalogBand(props: {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  tone: "emerald" | "cyan";
}) {
  return (
    <a
      href={props.href}
      className={cn(
        "rounded-md border p-6 transition",
        props.tone === "emerald"
          ? "bg-emerald-50 text-emerald-950 hover:border-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-50"
          : "bg-cyan-50 text-cyan-950 hover:border-cyan-700 dark:bg-cyan-950/20 dark:text-cyan-50",
      )}
    >
      <div className="mb-5 grid size-14 place-items-center rounded-md bg-background/75">
        {props.icon}
      </div>
      <h2 className="text-2xl font-semibold tracking-normal">{props.title}</h2>
      <p className="mt-3 max-w-xl leading-7 opacity-80">{props.description}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
        Browse catalog <ArrowRight className="size-4" />
      </span>
    </a>
  );
}

function SectionHeader(props: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{props.eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-normal sm:text-3xl">{props.title}</h2>
      <p className="mt-3 leading-7 text-muted-foreground">{props.description}</p>
    </div>
  );
}

function CategoryIcon(props: { category: ShopCategory }) {
  const iconUrl = props.category.iconUrl || categoryFallbackIcon(props.category.slug);

  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-md bg-muted">
      {iconUrl ? (
        <img src={iconUrl} alt="" className="size-8 object-contain" />
      ) : (
        <BadgeCheck className="size-5 text-emerald-700" />
      )}
    </span>
  );
}

function FallbackProductVisual(_props: { category?: string | null }) {
  return (
    <div className="grid h-full w-full place-items-center bg-muted">
      <PackageCheck className="size-12 text-muted-foreground" />
    </div>
  );
}

function categoryFallbackIcon(slug: string) {
  return slug ? asset("icons/top-rated.png") : null;
}
