import { eligibleStockWhere } from "@/modules/ecommerce/inventory/stock-policy";
import type { Prisma } from "@db/server";

export function productInclude() {
  return {
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true, archivedAt: true,
        fulfillmentKind: true,
        warrantyDays: true,
      },
    },
    brand: {
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        isActive: true, archivedAt: true,
      },
    },
    variants: {
      where: { isActive: true },
      include: {
        inventoryStocks: {
          where: eligibleStockWhere(),
          select: {
            quantityOnHand: true,
            quantityReserved: true,
            batchId: true,
            batch: { select: { expiryDate: true, disposition: true } },
          },
        },
        attributeValues: {
          include: {
            attributeValue: {
              include: {
                attribute: {
                  select: { id: true, name: true, slug: true, type: true },
                },
              },
            },
          },
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    },
    highlights: {
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    },
    attributeAssignments: {
      include: {
        attribute: {
          select: { id: true, name: true, slug: true, type: true, sortOrder: true },
        },
        attributeValue: true,
        values: {
          include: { attributeValue: true },
        },
      },
      orderBy: [{ createdAt: "asc" }],
    },
  } satisfies Prisma.ProductInclude;
}

export function orderInclude() {
  return {
    payments: { select: { id: true, entryType: true, amount: true, currency: true, reversesId: true } },
    refunds: { select: { amount: true, currency: true } },
    addresses: {
      orderBy: { type: "desc" },
    },
    foodBooking: { include: { slot: true } },
    lineItems: {
      include: {
        units: true,
        unitAllocations: { include: { unit: true, claims: true } },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            coverImageUrl: true,
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            name: true,
            imageUrls: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    },
    statusEvents: {
      orderBy: { createdAt: "desc" },
    },
  } satisfies Prisma.OrderInclude;
}

export function checkoutVariantInclude() {
  return {
    inventoryStocks: {
      where: eligibleStockWhere(),
      select: {
        quantityOnHand: true,
        quantityReserved: true,
            batchId: true,
            batch: { select: { expiryDate: true, disposition: true } },
      },
    },
    product: {
      select: {
        id: true,
        name: true,
        slug: true,
        coverImageUrl: true,
        isActive: true, archivedAt: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true, archivedAt: true,
            fulfillmentKind: true,
            serialTracking: true,
            warrantyDays: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true, archivedAt: true,
          },
        },
      },
    },
  } satisfies Prisma.ProductVariantInclude;
}
