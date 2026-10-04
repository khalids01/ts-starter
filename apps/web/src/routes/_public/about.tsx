import { createFileRoute, Link } from "@tanstack/react-router";
import { brandConfig } from "@config/brand";
import { getPageSeo } from "@/features/seo/api";
import { seoHead, pageSeoDefaults } from "@/features/seo/metadata";
import { PublicShopShell } from "@/features/shop/public-shop-shell";
import { PublicShopFooter } from "@/components/public-footer";
import { Img } from "@/components/core/img";
import { buttonVariants } from "@/components/ui/button";

export const Route = createFileRoute("/_public/about")({
  loader: () => getPageSeo({ data: "about" }),
  staleTime: 0,
  head: ({ loaderData }) => seoHead(loaderData ?? pageSeoDefaults(brandConfig, "about"), "/about", brandConfig),
  component: AboutPage,
});

function AboutPage() {
  return <PublicShopShell footer={<PublicShopFooter />}>
    <main className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:px-6 md:py-20 lg:grid-cols-2">
      <div className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">About {brandConfig.name}</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{brandConfig.homepage.bannerTitle}</h1>
        <p className="max-w-xl text-lg leading-8 text-muted-foreground">{brandConfig.description}</p>
        <p className="max-w-xl leading-7 text-muted-foreground">{brandConfig.homepage.bannerDescription}</p>
        <Link to="/shop" className={buttonVariants({ className: "rounded-full px-8" })}>Explore the collection</Link>
      </div>
      <div className="aspect-square overflow-hidden rounded-3xl bg-muted"><Img src={brandConfig.homepage.heroImage} alt="" className="h-full w-full" /></div>
    </main>
  </PublicShopShell>;
}
