import { describe, expect, test } from "bun:test";
import { brands } from "../../../../../packages/config/src/brand.config";
import type { ShopProduct } from "../shop/types";
import { absoluteSeoUrl, pageSeoDefaults, productSeo, seoHead } from "./metadata";

const product = { name: 'Everyday "Sneakers"', slug: "everyday-sneakers", description: "Comfortable <b>everyday</b> footwear.", coverImageUrl: "/brands/airshop/products/sneakers.webp", variants: [] } as unknown as ShopProduct;
describe("public SEO metadata", () => {
  test("home/about defaults use the selected deployment identity", () => {
    for (const brand of Object.values(brands)) {
      expect(pageSeoDefaults(brand, "home").title).toBe(brand.seo.title);
      expect(pageSeoDefaults(brand, "about").title).toBe(`About ${brand.name}`);
    }
  });
  test("product fields generate a title, plain description and share image", () => {
    expect(productSeo(product, brands.airshop)).toEqual({ title: 'Everyday "Sneakers" | AirShop BD', description: "Comfortable everyday footwear.", imageUrl: product.coverImageUrl ?? null });
  });
  test("admin product overrides take precedence, blank overrides fall back", () => {
    expect(productSeo({ ...product, seoTitle: " Custom title ", seoDescription: " Custom description " }, brands.airshop)).toMatchObject({ title: "Custom title", description: "Custom description" });
    expect(productSeo({ ...product, seoTitle: " " }, brands.airshop).title).toContain("Sneakers");
    expect(productSeo({ ...product, description: null }, brands.airshop).description).toContain("Explore product details");
  });
  test("canonical and share URLs use the configured origin", () => {
    const head = seoHead(productSeo(product, brands.airshop), "/shop/products/everyday-sneakers", brands.airshop, "product");
    expect(head.links).toEqual([{ rel: "canonical", href: "https://airshopbd.com/shop/products/everyday-sneakers" }]);
    expect(head.meta).toContainEqual({ property: "og:image", content: "https://airshopbd.com/brands/airshop/products/sneakers.webp" });
    expect(head.meta).toContainEqual({ name: "twitter:card", content: "summary_large_image" });
  });
  test("unknown FoodShop domain cannot invent canonical or relative social URLs", () => {
    const head = seoHead(pageSeoDefaults(brands.foodshop, "home"), "/", brands.foodshop);
    expect(head.links).toEqual([]);
    expect(head.meta.some((tag) => "property" in tag && tag.property === "og:image")).toBe(false);
  });
  test("unsafe image URLs are omitted and no-image social card stays valid", () => {
    for (const value of ["//evil.test/x", "javascript:x", "/\\evil.test", "https://user:pass@evil.test/x", "http://evil.test/x"])
      expect(absoluteSeoUrl(value, "https://airshopbd.com")).toBeUndefined();
    const head = seoHead({ title: "Title", description: "Description", imageUrl: null }, "/about", brands.airshop);
    expect(head.meta).toContainEqual({ name: "twitter:card", content: "summary" });
  });
});

describe("crawler outputs", () => {
  test("JSON-LD cannot close its script element and includes only valid active offers", async () => {
    const { productStructuredData, safeJsonLd } = await import("./metadata");
    const malicious = '</script><script>alert("x")</script>';
    const scripts = productStructuredData({ ...product, name: malicious, variants: [
      { isActive: true, price: "120.00", currency: "BDT", sku: "SKU1", availableQuantity: 2 },
      { isActive: false, price: "1.00", currency: "BDT", sku: "PRIVATE", availableQuantity: 10 },
      { isActive: true, price: "NaN", currency: "BDT", sku: "INVALID", availableQuantity: 0 },
    ] as ShopProduct["variants"] }, brands.airshop);
    expect(scripts[0]!.children).not.toContain("</script>");
    const data = JSON.parse(scripts[0]!.children);
    expect(data.name).toBe(malicious);
    expect(data.offers).toHaveLength(1);
    expect(data.offers[0].availability).toBe("https://schema.org/InStock");
    expect(data.aggregateRating).toBeUndefined();
    expect(JSON.parse(safeJsonLd({ text: "<>&\u2028\u2029" })).text).toBe("<>&\u2028\u2029");
  });
  test("robots blocks local/unconfigured deployments and private flows", async () => {
    const { robotsText } = await import("./metadata");
    expect(robotsText(undefined, true)).toBe("User-agent: *\nDisallow: /\n");
    expect(robotsText(brands.airshop.publicOrigin, false)).toBe("User-agent: *\nDisallow: /\n");
    const robots = robotsText(brands.airshop.publicOrigin, true);
    expect(robots).toContain("Disallow: /checkout");
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Sitemap: https://airshopbd.com/sitemap.xml");
  });
  test("sitemap XML escapes values and does not fabricate extra URLs", async () => {
    const { sitemapXml } = await import("./metadata");
    const xml = sitemapXml(["https://airshopbd.com/", "https://airshopbd.com/shop/products/a?x=1&y=2"]);
    expect(xml).toContain("x=1&amp;y=2");
    expect(xml.match(/<url>/g)).toHaveLength(2);
    expect(xml).not.toContain("checkout");
  });
});
