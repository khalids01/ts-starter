import prisma from "@db/server";

export async function listSeoProducts(cursor?: string) {
  const rows = await prisma.product.findMany({
    where: { status: "active", archivedAt: null, isActive: true, category: { isActive: true, archivedAt: null }, OR: [{ brandId: null }, { brand: { isActive: true, archivedAt: null } }], variants: { some: { isActive: true } }, ...(cursor ? { id: { gt: cursor } } : {}) },
    select: { id: true, slug: true }, orderBy: { id: "asc" }, take: 1001,
  });
  const items = rows.slice(0, 1000);
  return { items: items.map(({ slug }) => ({ slug })), nextCursor: rows.length > 1000 ? items[items.length - 1]!.id : null };
}
