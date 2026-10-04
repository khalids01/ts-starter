import type { BrandConfig } from "../../../../../packages/config/src/brand.config";
import type { ShopProduct } from "../shop/types";

export type PageSeo = { title: string | null; description: string | null; imageUrl: string | null };
export type SeoPage = "home" | "about";

export function pageSeoDefaults(brand: BrandConfig, page: SeoPage): PageSeo {
  return page === "home"
    ? { title: brand.seo.title, description: brand.seo.description, imageUrl: brand.seo.ogImage }
    : { title: `About ${brand.name}`, description: brand.description, imageUrl: brand.seo.ogImage };
}

export function absoluteSeoUrl(value: string | null | undefined, origin?: string) {
  if (!value || /[\s\\]/.test(value)) return undefined;
  try {
    const local = value.startsWith("/") && !value.startsWith("//");
    if (!local && !/^https:\/\//i.test(value)) return undefined;
    const url = local ? new URL(value, origin) : new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

export function seoHead(seo: PageSeo, pathname: string, brand: BrandConfig, type: "website" | "product" = "website") {
  const canonical = absoluteSeoUrl(pathname, brand.publicOrigin);
  const image = absoluteSeoUrl(seo.imageUrl, brand.publicOrigin);
  return {
    meta: [
      { title: seo.title || brand.name },
      { name: "description", content: seo.description || brand.description },
      { property: "og:title", content: seo.title || brand.name },
      { property: "og:description", content: seo.description || brand.description },
      { property: "og:type", content: type },
      { property: "og:site_name", content: brand.name },
      { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: seo.title || brand.name },
      { name: "twitter:description", content: seo.description || brand.description },
      ...(canonical ? [{ property: "og:url", content: canonical }] : []),
      ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
    ],
    links: canonical ? [{ rel: "canonical", href: canonical }] : [],
  };
}

export function productSeo(product: ShopProduct, brand: BrandConfig): PageSeo {
  const description = product.seoDescription?.trim() || product.description?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || `${product.name} at ${brand.name}. Explore product details and available options.`;
  const variant = product.variants.find((item) => item.isActive && item.isDefault) ?? product.variants.find((item) => item.isActive);
  return {
    title: product.seoTitle?.trim() || `${product.name} | ${brand.name}`,
    description: description.slice(0, 320),
    imageUrl: product.coverImageUrl || variant?.imageUrls[0] || null,
  };
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

export function productStructuredData(product: ShopProduct, brand: BrandConfig) {
  const url = absoluteSeoUrl(`/shop/products/${encodeURIComponent(product.slug)}`, brand.publicOrigin);
  const image = absoluteSeoUrl(productSeo(product, brand).imageUrl, brand.publicOrigin);
  const offers = product.variants.filter((variant) => variant.isActive && /^\d+(?:\.\d+)?$/.test(variant.price) && /^[A-Z]{3}$/.test(variant.currency)).map((variant) => ({
    "@type": "Offer", sku: variant.sku, price: variant.price, priceCurrency: variant.currency,
    availability: variant.availableQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    ...(url ? { url } : {}),
  }));
  const item = { "@context": "https://schema.org", "@type": "Product", name: product.name, description: productSeo(product, brand).description, ...(image ? { image: [image] } : {}), ...(url ? { url } : {}), ...(product.brand?.name ? { brand: { "@type": "Brand", name: product.brand.name } } : {}), ...(offers.length ? { offers } : {}) };
  const breadcrumb = url && brand.publicOrigin ? { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: brand.name, item: absoluteSeoUrl("/", brand.publicOrigin) },
    { "@type": "ListItem", position: 2, name: "Shop", item: absoluteSeoUrl("/shop", brand.publicOrigin) },
    { "@type": "ListItem", position: 3, name: product.name, item: url },
  ] } : undefined;
  return [item, ...(breadcrumb ? [breadcrumb] : [])].map((data) => ({ type: "application/ld+json", children: safeJsonLd(data) }));
}

export const noIndexHead = () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] });

export function sitemapXml(urls: string[]) {
  const escapeXml = (value: string) => value.replace(/[<>&"']/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character]!);
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${escapeXml(url)}</loc></url>`).join("")}</urlset>`;
}

export function robotsText(origin: string | undefined, indexable: boolean) {
  if (!indexable || !absoluteSeoUrl("/", origin)) return "User-agent: *\nDisallow: /\n";
  const paths = ["/admin", "/dashboard", "/account", "/settings", "/billing", "/login", "/signup", "/forgot-password", "/reset-password", "/two-factor", "/auth-complete", "/cart", "/checkout", "/saved", "/track-order", "/payment", "/setup", "/onboarding", "/accept-invitation"];
  return `User-agent: *\n${paths.map((path) => `Disallow: ${path}`).join("\n")}\nSitemap: ${absoluteSeoUrl("/sitemap.xml", origin)}\n`;
}
