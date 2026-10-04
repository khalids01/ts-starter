import prisma, { Prisma } from "@db/server";

export type CatalogKind = "category" | "brand" | "attribute" | "product";
export type CatalogAction = "archive" | "restore" | "delete";
export class CatalogLifecycleError extends Error {
  constructor(
    message: string,
    public status = 409,
  ) {
    super(message);
  }
}
const models = {
  category: "category",
  brand: "productBrand",
  attribute: "productAttribute",
  product: "product",
} as const;
const tables = {
  category: "category",
  brand: "product_brand",
  attribute: "product_attribute",
  product: "product",
} as const;
// Counts deliberately preserve even zero-stock inventory and historic product/order references on deletion.
export async function assertLifecycleSafe(
  tx: Prisma.TransactionClient,
  kind: CatalogKind,
  id: string,
  action: CatalogAction,
) {
  const reject = (message: string) => {
    throw new CatalogLifecycleError(message);
  };
  if (action === "restore") {
    if (kind === "category") {
      const row = await tx.category.findUniqueOrThrow({
        where: { id },
        include: { parent: true },
      });
      if (row.parent?.archivedAt) reject("Restore the parent category first.");
    }
    if (kind === "product") {
      const row = await tx.product.findUniqueOrThrow({
        where: { id },
        include: { category: true, brand: true },
      });
      if (row.category.archivedAt || row.brand?.archivedAt)
        reject("Restore the product's category and brand first.");
    }
    return;
  }
  const deleting = action === "delete";
  if (kind === "category") {
    if (
      await tx.category.count({
        where: { parentId: id, ...(deleting ? {} : { archivedAt: null }) },
      })
    )
      reject(
        "This category has dependent categories. Move or archive them first; delete requires removing every child reference.",
      );
    if (
      await tx.product.count({
        where: {
          categoryId: id,
          ...(deleting
            ? {}
            : { archivedAt: null, status: { not: "archived" } }),
        },
      })
    )
      reject(
        "Products depend on this category. Move or archive them first; referenced categories cannot be deleted.",
      );
  } else if (kind === "brand") {
    if (
      await tx.product.count({
        where: {
          brandId: id,
          ...(deleting
            ? {}
            : { archivedAt: null, status: { not: "archived" } }),
        },
      })
    )
      reject(
        "Products use this brand. Move or archive them first; referenced brands cannot be deleted.",
      );
  } else if (kind === "attribute") {
    const counts = await Promise.all([
      tx.categoryAttribute.count({ where: { attributeId: id } }),
      tx.productAttributeAssignment.count({ where: { attributeId: id } }),
      tx.inventoryBatchAttributeAssignment.count({
        where: { attributeId: id },
      }),
      tx.productVariantAttributeValue.count({
        where: { attributeValue: { attributeId: id } },
      }),
      tx.productAttributeAssignmentValue.count({
        where: { attributeValue: { attributeId: id } },
      }),
    ]);
    if (counts.some(Boolean))
      reject(
        "This attribute is used by category templates, products, variants or inventory batches. Remove those assignments first.",
      );
  } else {
    if (
      await tx.orderLineItem.count({
        where: {
          productId: id,
          ...(deleting
            ? {}
            : {
                order: {
                  OR: [
                    {
                      orderStatus: {
                        in: ["pending", "confirmed", "processing"],
                      },
                    },
                    { courierConsignments: { some: { active: true } } },
                  ],
                },
              }),
        },
      })
    )
      reject(
        deleting
          ? "Order history references this product. It cannot be permanently deleted."
          : "Open orders or active courier work depend on this product. Complete that work before archiving.",
      );
    if (
      await tx.stockReservation.count({
        where: {
          variant: { productId: id },
          ...(deleting ? {} : { status: "active" }),
        },
      })
    )
      reject("Inventory reservations reference this product.");
    if (deleting) {
      const counts = await Promise.all([
        tx.inventoryStock.count({ where: { variant: { productId: id } } }),
        tx.inventoryMovement.count({ where: { variant: { productId: id } } }),
        tx.inventoryBatch.count({ where: { variant: { productId: id } } }),
        tx.inventoryUnit.count({ where: { variant: { productId: id } } }),
      ]);
      if (counts.some(Boolean))
        reject(
          "Inventory stock, batch, movement or serial history references this product. Keep it archived.",
        );
    }
  }
}

export async function changeCatalogLifecycle(
  kind: CatalogKind,
  id: string,
  action: CatalogAction,
) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw(
          Prisma.sql`SELECT id FROM ${Prisma.raw(`"${tables[kind]}"`)} WHERE id = ${id} FOR UPDATE`,
        );
        // Explicit allowlist above; the delegates share the lifecycle fields.
        if (kind === "attribute")
          await tx.$queryRaw(
            Prisma.sql`SELECT id FROM product_attribute_value WHERE "attributeId" = ${id} FOR UPDATE`,
          );
        if (kind === "product")
          await tx.$queryRaw(
            Prisma.sql`SELECT id FROM product_variant WHERE "productId" = ${id} FOR UPDATE`,
          );
        const delegate = tx[models[kind]] as typeof tx.product;
        const row = await delegate.findUnique({ where: { id } });
        if (!row) throw new CatalogLifecycleError("Item not found", 404);
        const archived = Boolean(
          row.archivedAt || (kind === "product" && row.status === "archived"),
        );
        if (action !== "archive" && !archived)
          throw new CatalogLifecycleError(
            "Archive the item before restoring or deleting it.",
          );
        if (action === "archive" && archived)
          throw new CatalogLifecycleError("This item is already archived.");
        await assertLifecycleSafe(tx, kind, id, action);
        if (action === "delete") await delegate.delete({ where: { id } });
        else
          await delegate.update({
            where: { id },
            data: {
              archivedAt: action === "archive" ? new Date() : null,
              ...(kind === "product" &&
              action === "restore" &&
              row.status === "archived"
                ? { status: "draft" as const }
                : {}),
            },
          });
        return {
          message: `Item ${action === "delete" ? "deleted" : action === "restore" ? "restored" : "archived"}`,
        };
      },
      { isolationLevel: "Serializable" },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      ["P2003", "P2014", "P2034"].includes(error.code)
    )
      throw new CatalogLifecycleError(
        "Dependencies changed or still reference this item. Refresh and try again.",
      );
    throw error;
  }
}
export async function listArchivedCatalog(
  kind: CatalogKind,
  page = 1,
  limit = 20,
) {
  const delegate = prisma[models[kind]] as typeof prisma.product;
  const where =
    kind === "product"
      ? { OR: [{ archivedAt: { not: null } }, { status: "archived" as const }] }
      : { archivedAt: { not: null } };
  const [items, total] = await prisma.$transaction([
    delegate.findMany({
      where,
      select: { id: true, name: true, slug: true, archivedAt: true },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    delegate.count({ where }),
  ]);
  return {
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    limit,
  };
}

export async function assertCatalogMutable(kind: CatalogKind, id: string) {
  const delegate = prisma[models[kind]] as typeof prisma.product;
  const row = await delegate.findUnique({ where: { id } });
  if (!row) throw new CatalogLifecycleError("Item not found", 404);
  if (row.archivedAt || (kind === "product" && row.status === "archived"))
    throw new CatalogLifecycleError("Restore this item before editing it.");
}
