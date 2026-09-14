import prisma from "@db/server";

export type TemplateScope = "product" | "variant" | "batch";

/**
 * Resolves a category's template from the category up to its root.  A direct
 * category definition always wins over the same attribute inherited from a
 * parent; descendants are intentionally never considered.
 */
export async function getEffectiveCategoryAttributes(categoryId: string, firstCategory?: any) {
  const resolved = new Map<string, any>();
  const seenCategoryIds = new Set<string>();
  let currentId: string | null = categoryId;

  while (currentId) {
    if (seenCategoryIds.has(currentId)) {
      throw new Error("Category hierarchy contains a cycle");
    }
    seenCategoryIds.add(currentId);

    const category: any = firstCategory && currentId === categoryId ? firstCategory : await prisma.category.findUnique({
      where: { id: currentId },
      select: {
        id: true,
        parentId: true,
        attributes: {
          include: {
            attribute: {
              include: {
                values: { orderBy: [{ sortOrder: "asc" }, { label: "asc" }] },
              },
            },
          },
          orderBy: [{ scope: "asc" }, { sortOrder: "asc" }],
        },
      },
    });

    if (!category) {
      if (currentId === categoryId) {
        return null;
      }
      throw new Error("Category parent not found");
    }

    for (const field of category.attributes ?? []) {
      if (!resolved.has(field.attributeId)) {
        resolved.set(field.attributeId, field);
      }
    }
    currentId = category.parentId;
  }

  return [...resolved.values()].sort(
    (left: any, right: any) =>
      left.scope.localeCompare(right.scope) || left.sortOrder - right.sortOrder,
  );
}

export function fieldsForScope<T extends { scope: TemplateScope }>(
  fields: T[],
  scope: TemplateScope,
) {
  return fields.filter((field) => field.scope === scope);
}
