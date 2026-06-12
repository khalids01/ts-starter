import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const productCountMock = mock(async () => 0);
const productFindManyMock = mock(async () => []);
const productFindUniqueMock = mock(async () => null as any);
const productCreateMock = mock(async (args: any) => productRow(args.data));
const productUpdateMock = mock(async (args: any) =>
  productRow({
    id: args.where.id,
    status: args.data.status ?? "draft",
    isActive: args.data.isActive ?? true,
  }),
);

const categoryFindUniqueMock = mock(async () => categoryRow());
const productBrandFindUniqueMock = mock(async () => ({
  id: "brand-1",
  isActive: true,
}));
const productAttributeValueFindManyMock = mock(async () => []);
const productVariantFindManyMock = mock(async () => []);
const productAttributeAssignmentDeleteManyMock = mock(async () => ({ count: 0 }));
const productAttributeAssignmentCreateMock = mock(async () => ({ id: "paa-1" }));
const productVariantDeleteManyMock = mock(async () => ({ count: 0 }));
const productVariantCreateMock = mock(async () => ({ id: "variant-new" }));
const productVariantUpdateMock = mock(async (args: any) => ({ id: args.where.id }));
const productVariantAttributeValueDeleteManyMock = mock(async () => ({
  count: 0,
}));
const productVariantAttributeValueCreateManyMock = mock(async () => ({
  count: 1,
}));
const transactionMock = mock(async (callback: any) => callback(prismaMock));

const prismaMock = {
  $transaction: transactionMock,
  product: {
    count: productCountMock,
    findMany: productFindManyMock,
    findUnique: productFindUniqueMock,
    create: productCreateMock,
    update: productUpdateMock,
  },
  category: {
    findUnique: categoryFindUniqueMock,
  },
  productBrand: {
    findUnique: productBrandFindUniqueMock,
  },
  productAttributeValue: {
    findMany: productAttributeValueFindManyMock,
  },
  productAttributeAssignment: {
    deleteMany: productAttributeAssignmentDeleteManyMock,
    create: productAttributeAssignmentCreateMock,
  },
  productVariant: {
    findMany: productVariantFindManyMock,
    deleteMany: productVariantDeleteManyMock,
    create: productVariantCreateMock,
    update: productVariantUpdateMock,
  },
  productVariantAttributeValue: {
    deleteMany: productVariantAttributeValueDeleteManyMock,
    createMany: productVariantAttributeValueCreateManyMock,
  },
};

mock.module("@db/server", () => ({
  default: prismaMock,
}));

function categoryRow(overrides: Record<string, any> = {}) {
  return {
    id: "cat-phones",
    name: "Phones",
    slug: "phones",
    brandPolicy: "required",
    isActive: true,
    attributes: [
      {
        id: "field-warranty",
        attributeId: "attr-warranty",
        scope: "product",
        required: true,
        variantDefining: false,
        inputType: "text",
        attribute: {
          id: "attr-warranty",
          name: "Warranty",
          slug: "warranty",
        },
      },
      {
        id: "field-color",
        attributeId: "attr-color",
        scope: "variant",
        required: true,
        variantDefining: true,
        inputType: "select",
        attribute: {
          id: "attr-color",
          name: "Color",
          slug: "color",
        },
      },
    ],
    ...overrides,
  };
}

function productRow(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? "product-1",
    name: overrides.name ?? "iPhone 15",
    slug: overrides.slug ?? "iphone-15",
    description: overrides.description ?? null,
    descriptionHtml: overrides.descriptionHtml ?? null,
    categoryId: overrides.categoryId ?? "cat-phones",
    category: overrides.category ?? {
      id: "cat-phones",
      name: "Phones",
      slug: "phones",
      brandPolicy: "required",
      showStoreBrand: false,
    },
    brandId: overrides.brandId ?? null,
    brand: overrides.brand ?? null,
    status: overrides.status ?? "draft",
    isActive: overrides.isActive ?? true,
    isFeatured: overrides.isFeatured ?? false,
    media: overrides.media ?? null,
    seoTitle: overrides.seoTitle ?? null,
    seoDescription: overrides.seoDescription ?? null,
    attributeAssignments: overrides.attributeAssignments ?? [],
    variants: overrides.variants ?? [],
    _count: overrides._count ?? {
      variants: overrides.variants?.length ?? 0,
      attributeAssignments: overrides.attributeAssignments?.length ?? 0,
    },
    createdAt: new Date("2026-06-13T10:00:00.000Z"),
    updatedAt: new Date("2026-06-13T10:00:00.000Z"),
  };
}

function existingProduct(overrides: Record<string, any> = {}) {
  return {
    id: "product-1",
    name: "iPhone 15",
    slug: "iphone-15",
    categoryId: "cat-phones",
    brandId: "brand-1",
    category: categoryRow(),
    _count: { variants: 0, attributeAssignments: 0 },
    ...overrides,
  };
}

beforeEach(() => {
  productFindUniqueMock.mockResolvedValue(productRow());
  categoryFindUniqueMock.mockResolvedValue(categoryRow());
  productBrandFindUniqueMock.mockResolvedValue({
    id: "brand-1",
    isActive: true,
  });
  productAttributeValueFindManyMock.mockResolvedValue([]);
  productVariantFindManyMock.mockResolvedValue([]);
});

afterEach(() => {
  for (const fn of [
    productCountMock,
    productFindManyMock,
    productFindUniqueMock,
    productCreateMock,
    productUpdateMock,
    categoryFindUniqueMock,
    productBrandFindUniqueMock,
    productAttributeValueFindManyMock,
    productVariantFindManyMock,
    productAttributeAssignmentDeleteManyMock,
    productAttributeAssignmentCreateMock,
    productVariantDeleteManyMock,
    productVariantCreateMock,
    productVariantUpdateMock,
    productVariantAttributeValueDeleteManyMock,
    productVariantAttributeValueCreateManyMock,
    transactionMock,
  ]) {
    fn.mockClear();
  }
});

describe("AdminProductsService", () => {
  it("creates draft products with normalized slugs", async () => {
    const { adminProductsService } = await import(
      "../src/modules/admin/products/products.service"
    );

    await adminProductsService.createProduct({
      categoryId: "cat-phones",
      name: "iPhone 15 Pro",
      brandId: "brand-1",
    });

    expect(productCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "iPhone 15 Pro",
          slug: "iphone-15-pro",
          status: "draft",
          brandId: "brand-1",
        }),
      }),
    );
  });

  it("enforces hidden category brand policy", async () => {
    categoryFindUniqueMock.mockResolvedValueOnce(
      categoryRow({ brandPolicy: "hidden" }),
    );
    const { adminProductsService } = await import(
      "../src/modules/admin/products/products.service"
    );

    await adminProductsService.createProduct({
      categoryId: "cat-food",
      name: "Mango",
      brandId: "brand-1",
    });

    expect(productCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ brandId: null }),
      }),
    );
    expect(productBrandFindUniqueMock).not.toHaveBeenCalled();
  });

  it("allows incomplete drafts but rejects invalid activation", async () => {
    productFindUniqueMock
      .mockResolvedValueOnce(existingProduct({ brandId: null }))
      .mockResolvedValueOnce(
        productRow({
          brandId: null,
          category: categoryRow(),
          attributeAssignments: [],
          variants: [],
        }),
      );

    const { adminProductsService } = await import(
      "../src/modules/admin/products/products.service"
    );

    await expect(
      adminProductsService.updateProduct("product-1", { status: "active" }),
    ).rejects.toThrow("Product brand is required");
    expect(productUpdateMock).not.toHaveBeenCalled();
  });

  it("saves product-scope attributes from the category template", async () => {
    productFindUniqueMock.mockResolvedValueOnce({
      id: "product-1",
      categoryId: "cat-phones",
      category: {
        attributes: [categoryRow().attributes[0]],
      },
    });

    const { adminProductsService } = await import(
      "../src/modules/admin/products/products.service"
    );

    await adminProductsService.replaceProductAttributes("product-1", {
      assignments: [
        {
          attributeId: "attr-warranty",
          rawText: "1 year",
          displayValue: "1 year warranty",
        },
      ],
    });

    expect(productAttributeAssignmentDeleteManyMock).toHaveBeenCalledWith({
      where: { productId: "product-1" },
    });
    expect(productAttributeAssignmentCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          productId: "product-1",
          attributeId: "attr-warranty",
          rawText: "1 year",
        }),
      }),
    );
  });

  it("rejects product attributes from unrelated categories", async () => {
    productFindUniqueMock.mockResolvedValueOnce({
      id: "product-1",
      categoryId: "cat-phones",
      category: {
        attributes: [categoryRow().attributes[0]],
      },
    });

    const { adminProductsService } = await import(
      "../src/modules/admin/products/products.service"
    );

    await expect(
      adminProductsService.replaceProductAttributes("product-1", {
        assignments: [{ attributeId: "attr-origin", rawText: "Rajshahi" }],
      }),
    ).rejects.toThrow("not allowed");
  });

  it("replaces variants, auto-generates SKU, and generates snapshots", async () => {
    productFindUniqueMock
      .mockResolvedValueOnce({
        id: "product-1",
        name: "iPhone 15",
        slug: "iphone-15",
        categoryId: "cat-phones",
        category: {
          attributes: [categoryRow().attributes[1]],
        },
        variants: [],
      })
      .mockResolvedValueOnce(
        productRow({
          variants: [
            {
              id: "variant-new",
              productId: "product-1",
              sku: "IPHONE15-BLACK",
              barcode: null,
              name: "iPhone 15 - Black",
              attributesSnapshot: [
                {
                  attributeId: "attr-color",
                  attributeName: "Color",
                  attributeSlug: "color",
                  valueId: "value-black",
                  value: "black",
                  label: "Black",
                },
              ],
              price: "999",
              compareAtPrice: null,
              costPrice: null,
              currency: "BDT",
              isDefault: true,
              isActive: true,
              media: null,
              weightValue: null,
              weightUnit: null,
              attributeValues: [],
              createdAt: new Date("2026-06-13T10:00:00.000Z"),
              updatedAt: new Date("2026-06-13T10:00:00.000Z"),
            },
          ],
        }),
      );
    productAttributeValueFindManyMock.mockResolvedValueOnce([
      {
        id: "value-black",
        value: "black",
        label: "Black",
        attributeId: "attr-color",
        attribute: {
          id: "attr-color",
          name: "Color",
          slug: "color",
          type: "color",
        },
      },
    ]);

    const { adminProductsService } = await import(
      "../src/modules/admin/products/products.service"
    );

    await adminProductsService.replaceProductVariants("product-1", {
      variants: [
        {
          price: "999",
          attributeValueIds: ["value-black"],
        },
      ],
    });

    expect(productVariantDeleteManyMock).toHaveBeenCalledWith({
      where: { productId: "product-1" },
    });
    expect(productVariantCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sku: expect.stringContaining("IPHONE15"),
          isDefault: true,
          attributesSnapshot: [
            expect.objectContaining({
              attributeSlug: "color",
              label: "Black",
            }),
          ],
        }),
      }),
    );
    expect(productVariantAttributeValueCreateManyMock).toHaveBeenCalledWith({
      data: [{ variantId: "variant-new", attributeValueId: "value-black" }],
      skipDuplicates: true,
    });
  });

  it("preserves editable SKU when provided", async () => {
    productFindUniqueMock.mockResolvedValueOnce({
      id: "product-1",
      name: "iPhone 15",
      slug: "iphone-15",
      categoryId: "cat-phones",
      category: {
        attributes: [categoryRow().attributes[1]],
      },
      variants: [],
    });
    productAttributeValueFindManyMock.mockResolvedValueOnce([
      {
        id: "value-black",
        value: "black",
        label: "Black",
        attributeId: "attr-color",
        attribute: {
          id: "attr-color",
          name: "Color",
          slug: "color",
          type: "color",
        },
      },
    ]);

    const { adminProductsService } = await import(
      "../src/modules/admin/products/products.service"
    );

    await adminProductsService.replaceProductVariants("product-1", {
      variants: [
        {
          sku: "CUSTOM-SKU-1",
          price: "999",
          attributeValueIds: ["value-black"],
        },
      ],
    });

    expect(productVariantCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sku: "CUSTOM-SKU-1" }),
      }),
    );
  });

  it("soft archives product on delete", async () => {
    productFindUniqueMock.mockResolvedValueOnce({ id: "product-1" });
    const { adminProductsService } = await import(
      "../src/modules/admin/products/products.service"
    );

    await adminProductsService.archiveProduct("product-1");

    expect(productUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "product-1" },
        data: { status: "archived", isActive: false },
      }),
    );
  });
});
