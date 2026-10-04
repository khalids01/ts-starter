import { t } from "elysia";

export const SeoPageParams = t.Object({ page: t.Union([t.Literal("home"), t.Literal("about")]) });
export const SeoRevisionDto = t.Object({ revision: t.Integer({ minimum: 1, maximum: 2147483646 }) });
export const SavePageSeoDto = t.Object({
  revision: t.Integer({ minimum: 0, maximum: 2147483646 }),
  title: t.Union([t.String({ maxLength: 120 }), t.Null()]),
  description: t.Union([t.String({ maxLength: 320 }), t.Null()]),
  imageUrl: t.Union([t.String({ maxLength: 2048 }), t.Null()]),
});
export type SeoPage = typeof SeoPageParams.static.page;
export type SavePageSeo = typeof SavePageSeoDto.static;
