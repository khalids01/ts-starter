import { beforeEach, describe, expect, test, mock } from "bun:test";

let row: any = null;
let fail: unknown;
let conflictOnUpdate = false;
const delegate = {
  findUnique: mock(async (args: any) => {
    if (fail) throw fail;
    if (!row) return null;
    return args.select ? Object.fromEntries(Object.keys(args.select).map((key) => [key, row[key]])) : { ...row };
  }),
  create: mock(async ({ data }: any) => {
    if (row) throw { code: "P2002" };
    row = { revision: 1, publishedTitle: null, publishedDescription: null, publishedImageUrl: null, publishedAt: null, ...data };
    return { ...row };
  }),
  updateMany: mock(async ({ where, data }: any) => {
    if (conflictOnUpdate) row.revision++;
    if (!row || row.revision !== where.revision) return { count: 0 };
    const { revision, ...fields } = data;
    row = { ...row, ...fields, revision: row.revision + revision.increment };
    return { count: 1 };
  }),
};
mock.module("@db/server", () => ({ default: { storePageSeo: delegate } }));
const { pageSeoService, normalizePageSeo, pageSeoError } = await import("../src/modules/ecommerce/page-seo/page-seo.service");
const input = { revision: 0, title: " First title ", description: " A useful description ", imageUrl: "/brands/airshop/products/hoodie.webp" };
beforeEach(() => { row = null; fail = undefined; conflictOnUpdate = false; Object.values(delegate).forEach((fn) => fn.mockClear()); });

describe("website SEO draft and publication", () => {
  test("unpublished drafts never enter the public response", async () => {
    expect(await pageSeoService.public("home")).toBeNull();
    await pageSeoService.save("home", input);
    expect(await pageSeoService.public("home")).toBeNull();
    expect(row.title).toBe("First title");
  });
  test("publishing exposes a snapshot and subsequent edits stay private", async () => {
    await pageSeoService.save("home", input);
    await pageSeoService.publish("home", 1);
    await pageSeoService.save("home", { ...input, revision: 2, title: "Private next draft" });
    expect(await pageSeoService.public("home")).toEqual({ title: "First title", description: "A useful description", imageUrl: input.imageUrl });
    expect(Object.keys((await pageSeoService.public("home"))!)).toEqual(["title", "description", "imageUrl"]);
    await pageSeoService.publish("home", 3);
    expect((await pageSeoService.public("home"))?.title).toBe("Private next draft");
  });
  test("stale editors cannot overwrite or publish a newer draft", async () => {
    await pageSeoService.save("about", input);
    await pageSeoService.save("about", { ...input, revision: 1, title: "Newer" });
    await expect(pageSeoService.save("about", { ...input, revision: 1 })).rejects.toMatchObject({ status: 409 });
    await expect(pageSeoService.publish("about", 1)).rejects.toMatchObject({ status: 409 });
    expect(row.title).toBe("Newer");
    expect(row.publishedAt).toBeNull();
  });
  test("a save racing publication prevents publishing the stale snapshot", async () => {
    await pageSeoService.save("home", input);
    conflictOnUpdate = true;
    await expect(pageSeoService.publish("home", 1)).rejects.toMatchObject({ status: 409 });
    expect(row.publishedTitle).toBeNull();
  });
  test("missing draft cannot be published", async () => {
    await expect(pageSeoService.publish("home", 1)).rejects.toMatchObject({ status: 409 });
  });
  test("blank published fields intentionally restore brand defaults", async () => {
    await pageSeoService.save("home", { ...input, title: " ", description: "", imageUrl: null });
    await pageSeoService.publish("home", 1);
    expect(await pageSeoService.public("home")).toEqual({ title: null, description: null, imageUrl: null });
  });
  test("unsafe URLs and invalid revisions are rejected before writes", () => {
    for (const imageUrl of ["javascript:alert(1)", "//evil.test/x", "http://example.test/x", "/\\evil.test/x", "https://user:pass@example.test/x"])
      expect(() => normalizePageSeo({ ...input, imageUrl })).toThrow();
    expect(() => normalizePageSeo({ ...input, revision: -1 })).toThrow();
    expect(() => normalizePageSeo({ ...input, title: "a".repeat(121) })).toThrow();
    expect(normalizePageSeo({ ...input, imageUrl: "https://images.example.test/a.webp" }).imageUrl).toBe("https://images.example.test/a.webp");
  });
  test("only absent optional storage falls back; outages remain errors", async () => {
    fail = { code: "P2021" };
    expect(await pageSeoService.public("home")).toBeNull();
    expect(pageSeoError(fail)).toMatchObject({ status: 503 });
    fail = new Error("database connection lost");
    await expect(pageSeoService.public("home")).rejects.toThrow("database connection lost");
    expect(pageSeoError({ code: "P2002" })).toMatchObject({ status: 409 });
  });
});
