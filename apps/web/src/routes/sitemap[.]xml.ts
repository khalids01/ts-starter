import { createFileRoute } from "@tanstack/react-router";
import { brandConfig } from "@config/brand";
import { client } from "@/lib/client";
import { absoluteSeoUrl, sitemapXml } from "@/features/seo/metadata";

export const Route = createFileRoute("/sitemap.xml")({
  server: { handlers: { GET: async () => {
    if (!absoluteSeoUrl("/", brandConfig.publicOrigin)) return new Response("Configure this brand’s public origin before generating a sitemap.", { status: 503 });
    const urls = ["/", "/about", "/shop"].map((path) => absoluteSeoUrl(path, brandConfig.publicOrigin)!);
    let cursor: string | undefined;
    do {
      const { data, error } = await client.shop["seo-products"].get({ query: { cursor } });
      if (error || !data) return new Response("Unable to load sitemap catalog.", { status: 503 });
      for (const product of data.items) urls.push(absoluteSeoUrl(`/shop/products/${encodeURIComponent(product.slug)}`, brandConfig.publicOrigin)!);
      cursor = data.nextCursor ?? undefined;
      // The sitemap protocol permits at most 50,000 URLs in one file.
      if (urls.length > 50_000) return new Response("Catalog requires a sharded sitemap.", { status: 503 });
    } while (cursor);
    return new Response(sitemapXml(urls), { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "no-store" } });
  } } },
});
