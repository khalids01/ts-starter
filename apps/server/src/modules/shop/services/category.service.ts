import prisma from "@db/server";
import { mapCategory } from "../lib/product-mappers";

export async function listPublicCategories() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      iconUrl: true,
      parentId: true,
      isFeatured: true,
      sortOrder: true,
      _count: {
        select: {
          products: {
            where: {
              status: "active",
              isActive: true,
              variants: { some: { isActive: true } },
            },
          },
        },
      },
    },
    orderBy: [
      { isFeatured: "desc" },
      { sortOrder: "asc" },
      { name: "asc" },
    ],
  });

  return categories.map(mapCategory);
}

export const categoryService = {
  async listCategories() {
    return listPublicCategories();
  },
};
