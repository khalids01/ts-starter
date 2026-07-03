import type { Prisma } from "@db/server";

export function productInclude() {
  return {
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
      },
    },
    brand: {
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        isActive: true,
      },
    },
    variants: {
      where: { isActive: true },
      include: {
        inventoryStocks: {
          where: { location: { isActive: true } },
          select: {
            quantityOnHand: true,
            quantityReserved: true,
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
    addresses: {
      orderBy: { type: "desc" },
    },
    lineItems: {
      include: {
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
      where: { location: { isActive: true } },
      select: {
        quantityOnHand: true,
        quantityReserved: true,
      },
    },
    product: {
      select: {
        id: true,
        name: true,
        slug: true,
        coverImageUrl: true,
        isActive: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
    },
  } satisfies Prisma.ProductVariantInclude;
}
