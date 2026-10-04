import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { brandConfig } from "@config/brand";
import { client } from "@/lib/client";
import type { ShopProduct } from "../shop/types";
import { pageSeoDefaults, type PageSeo } from "./metadata";

export const getPageSeo = createServerFn({ method: "GET" })
  .inputValidator((page: unknown) => {
    if (page !== "home" && page !== "about") throw new Error("Invalid SEO page");
    return page;
  })
  .handler(async ({ data: page }): Promise<PageSeo> => {
    const { data, error } = await client.shop["page-seo"]({ page }).get();
    if (error) throw new Error("Unable to load website metadata");
    const defaults = pageSeoDefaults(brandConfig, page);
    return {
      title: data?.seo?.title || defaults.title,
      description: data?.seo?.description || defaults.description,
      imageUrl: data?.seo?.imageUrl || defaults.imageUrl,
    };
  });

export const getProductForPage = createServerFn({ method: "GET" })
  .inputValidator((slug: unknown) => {
    if (typeof slug !== "string" || !slug || slug.length > 160) throw new Error("Invalid product slug");
    return slug;
  })
  .handler(async ({ data: slug }): Promise<ShopProduct> => {
    const { data, error } = await client.shop.products({ slug }).get();
    if (error?.status === 404) throw notFound();
    if (error || !data || !("id" in data)) throw new Error("Unable to load product");
    return data as ShopProduct;
  });
