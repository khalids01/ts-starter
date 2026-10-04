import { createFileRoute, Link } from "@tanstack/react-router";
import { brandConfig } from "@config/brand";
import { ShopProductPage } from "@/features/shop";
import { getProductForPage } from "@/features/seo/api";
import { productSeo, seoHead, productStructuredData } from "@/features/seo/metadata";
import { PublicShopShell } from "@/features/shop/public-shop-shell";
import { PublicShopFooter } from "@/components/public-footer";

export const Route = createFileRoute("/_public/shop/products/$slug")({
  loader: ({ params }) => getProductForPage({ data: params.slug }),
  staleTime: 0,
  head: ({ loaderData }) => loaderData
    ? { ...seoHead(productSeo(loaderData, brandConfig), `/shop/products/${encodeURIComponent(loaderData.slug)}`, brandConfig, "product"), scripts: productStructuredData(loaderData, brandConfig) }
    : { meta: [{ title: `Product unavailable | ${brandConfig.name}` }, { name: "robots", content: "noindex, nofollow" }] },
  notFoundComponent: () => <PublicShopShell footer={<PublicShopFooter />}><main className="mx-auto max-w-3xl px-4 py-20 text-center"><h1 className="text-3xl font-semibold">Product unavailable</h1><p className="mt-4 text-muted-foreground">This product may no longer be in the collection.</p><Link to="/shop" className="mt-6 inline-block underline underline-offset-4">Browse the shop</Link></main></PublicShopShell>,
  component: ProductRoute,
});

function ProductRoute() {
  const { slug } = Route.useParams();
  return <ShopProductPage key={slug} slug={slug} initialData={Route.useLoaderData()} />;
}
