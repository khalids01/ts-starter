import prisma from "@db/server";
import type { SavePageSeo, SeoPage } from "./page-seo.dto";

export class PageSeoError extends Error {
  constructor(message: string, public readonly status = 400) { super(message); }
}
const conflict = () => new PageSeoError("SEO changed in another session. Reload before saving or publishing.", 409);
const text = (value: string | null) => value?.trim() || null;

export function normalizePageSeo(input: SavePageSeo) {
  const title = text(input.title);
  const description = text(input.description);
  const imageUrl = text(input.imageUrl);
  if (!Number.isSafeInteger(input.revision) || input.revision < 0 || input.revision > 2147483646 || (title?.length ?? 0) > 120 || (description?.length ?? 0) > 320 || (imageUrl?.length ?? 0) > 2048)
    throw new PageSeoError("Invalid SEO field length or revision");
  if (imageUrl) {
    const local = /^\/(?!\/)/.test(imageUrl) && !/[\s\\]/.test(imageUrl);
    let remote = false;
    try { const url = new URL(imageUrl); remote = url.protocol === "https:" && !url.username && !url.password; } catch {}
    if (!local && !remote) throw new PageSeoError("Share image must be a local /path or a public HTTPS URL");
  }
  return { title, description, imageUrl };
}

export function pageSeoError(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === "P2002") return conflict();
  if (code === "P2021") return new PageSeoError("Website SEO storage is not provisioned. Apply the reviewed StorePageSeo schema migration to the intended database before editing SEO.", 503);
  return error;
}

export const pageSeoService = {
  async get(page: SeoPage) {
    const row = await prisma.storePageSeo.findUnique({ where: { page } });
    return row ?? { page, revision: 0, title: null, description: null, imageUrl: null, publishedTitle: null, publishedDescription: null, publishedImageUrl: null, publishedAt: null };
  },
  async save(page: SeoPage, input: SavePageSeo) {
    const fields = normalizePageSeo(input);
    if (input.revision === 0) return prisma.storePageSeo.create({ data: { page, ...fields } });
    const result = await prisma.storePageSeo.updateMany({ where: { page, revision: input.revision }, data: { ...fields, revision: { increment: 1 } } });
    if (result.count !== 1) throw conflict();
    return this.get(page);
  },
  async publish(page: SeoPage, revision: number) {
    const draft = await prisma.storePageSeo.findUnique({ where: { page } });
    if (!draft || draft.revision !== revision) throw conflict();
    const result = await prisma.storePageSeo.updateMany({
      where: { page, revision },
      data: { publishedTitle: draft.title, publishedDescription: draft.description, publishedImageUrl: draft.imageUrl, publishedAt: new Date(), revision: { increment: 1 } },
    });
    if (result.count !== 1) throw conflict();
    return this.get(page);
  },
  async public(page: SeoPage) {
    try {
      const row = await prisma.storePageSeo.findUnique({ where: { page }, select: { publishedTitle: true, publishedDescription: true, publishedImageUrl: true, publishedAt: true } });
      return row?.publishedAt ? { title: row.publishedTitle, description: row.publishedDescription, imageUrl: row.publishedImageUrl } : null;
    } catch (error) {
      // Keep brand defaults available before this optional table is provisioned.
      // Do not mask connectivity failures or other database errors.
      if ((error as { code?: string })?.code === "P2021") return null;
      throw error;
    }
  },
};
