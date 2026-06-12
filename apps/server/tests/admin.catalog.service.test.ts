import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

const categoryCountMock = mock(async () => 0);
const categoryFindManyMock = mock(async () => []);
const categoryFindUniqueMock = mock(async () => null as any);
const categoryCreateMock = mock(async (args: any) => ({
  id: "cat-new",
  ...args.data,
  parentId: args.data.parentId ?? null,
  parent: null,
  children: [],
  attributes: [],
  createdAt: new Date("2026-06-12T10:00:00.000Z"),
  updatedAt: new Date("2026-06-12T10:00:00.000Z"),
}));
const categoryUpdateMock = mock(async (args: any) => ({
  id: args.where.id,
  name: "Updated",
  slug: "updated",
  description: null,
  parentId: null,
  parent: null,
  children: [],
  imageUrl: null,
  iconUrl: null,
  brandPolicy: "optional",
  showStoreBrand: false,
  isActive: args.data.isActive ?? true,
  isFeatured: false,
  sortOrder: 0,
  attributes: [],
  createdAt: new Date("2026-06-12T10:00:00.000Z"),
  updatedAt: new Date("2026-06-12T10:00:00.000Z"),
}));

const productAttributeFindUniqueMock = mock(async () => ({ id: "attr-1" }));
const productAttributeCountMock = mock(async () => 0);
const productAttributeFindManyMock = mock(async () => []);
const productAttributeCreateMock = mock(async () => null as any);
const productAttributeUpdateMock = mock(async () => null as any);

const productAttributeValueUpsertMock = mock(async () => null as any);
const productAttributeValueUpdateMock = mock(async () => null as any);

const categoryAttributeUpsertMock = mock(async (args: any) => ({
  id: "cat-attr-1",
  categoryId: args.create.categoryId,
  attributeId: args.create.attributeId,
  scope: args.create.scope,
  required: args.create.required,
  filterable: args.create.filterable,
  variantDefining: args.create.variantDefining,
  comparable: args.create.comparable,
  inputType: args.create.inputType,
  unit: args.create.unit,
  groupName: args.create.groupName,
  helpText: args.create.helpText,
  placeholder: args.create.placeholder,
  sortOrder: args.create.sortOrder,
  attribute: {
    id: args.create.attributeId,
    name: "Color",
    slug: "color",
    type: "color",
    filterable: true,
    variantDefining: true,
    sortOrder: 0,
    values: [],
    createdAt: new Date("2026-06-12T10:00:00.000Z"),
    updatedAt: new Date("2026-06-12T10:00:00.000Z"),
  },
  createdAt: new Date("2026-06-12T10:00:00.000Z"),
  updatedAt: new Date("2026-06-12T10:00:00.000Z"),
}));
const categoryAttributeUpdateMock = mock(async () => null as any);
const categoryAttributeDeleteMock = mock(async () => null as any);

const productBrandCountMock = mock(async () => 0);
const productBrandFindManyMock = mock(async () => []);
const productBrandFindUniqueMock = mock(async () => null as any);
const productBrandCreateMock = mock(async () => null as any);
const productBrandUpdateMock = mock(async (args: any) => ({
  id: args.where.id,
  name: "Apple",
  slug: "apple",
  description: null,
  logoUrl: null,
  websiteUrl: null,
  isActive: args.data.isActive ?? true,
  isFeatured: false,
  _count: { products: 2 },
  createdAt: new Date("2026-06-12T10:00:00.000Z"),
  updatedAt: new Date("2026-06-12T10:00:00.000Z"),
}));

mock.module("@db/server", () => ({
  default: {
    category: {
      count: categoryCountMock,
      findMany: categoryFindManyMock,
      findUnique: categoryFindUniqueMock,
      create: categoryCreateMock,
      update: categoryUpdateMock,
    },
    productAttribute: {
      count: productAttributeCountMock,
      findMany: productAttributeFindManyMock,
      findUnique: productAttributeFindUniqueMock,
      create: productAttributeCreateMock,
      update: productAttributeUpdateMock,
    },
    productAttributeValue: {
      upsert: productAttributeValueUpsertMock,
      update: productAttributeValueUpdateMock,
    },
    categoryAttribute: {
      upsert: categoryAttributeUpsertMock,
      update: categoryAttributeUpdateMock,
      delete: categoryAttributeDeleteMock,
    },
    productBrand: {
      count: productBrandCountMock,
      findMany: productBrandFindManyMock,
      findUnique: productBrandFindUniqueMock,
      create: productBrandCreateMock,
      update: productBrandUpdateMock,
    },
  },
}));

beforeEach(() => {
  categoryCountMock.mockResolvedValue(0);
  categoryFindManyMock.mockResolvedValue([]);
  categoryFindUniqueMock.mockResolvedValue({ id: "cat-1" });
  productAttributeFindUniqueMock.mockResolvedValue({ id: "attr-1" });
});

afterEach(() => {
  for (const fn of [
    categoryCountMock,
    categoryFindManyMock,
    categoryFindUniqueMock,
    categoryCreateMock,
    categoryUpdateMock,
    productAttributeFindUniqueMock,
    productAttributeCountMock,
    productAttributeFindManyMock,
    productAttributeCreateMock,
    productAttributeUpdateMock,
    productAttributeValueUpsertMock,
    productAttributeValueUpdateMock,
    categoryAttributeUpsertMock,
    categoryAttributeUpdateMock,
    categoryAttributeDeleteMock,
    productBrandCountMock,
    productBrandFindManyMock,
    productBrandFindUniqueMock,
    productBrandCreateMock,
    productBrandUpdateMock,
  ]) {
    fn.mockClear();
  }
});

describe("AdminCatalogService", () => {
  it("lists categories with parent and template counts", async () => {
    categoryCountMock.mockResolvedValueOnce(1);
    categoryFindManyMock.mockResolvedValueOnce([
      {
        id: "cat-phones",
        name: "Phones",
        slug: "phones",
        description: null,
        parentId: "cat-gadgets",
        parent: { id: "cat-gadgets", name: "Gadgets", slug: "gadgets" },
        imageUrl: null,
        iconUrl: null,
        brandPolicy: "required",
        showStoreBrand: false,
        isActive: true,
        isFeatured: true,
        sortOrder: 10,
        _count: { products: 3, attributes: 7, children: 0 },
        createdAt: new Date("2026-06-12T10:00:00.000Z"),
        updatedAt: new Date("2026-06-12T10:00:00.000Z"),
      },
    ]);

    const { adminCatalogService } = await import(
      "../src/modules/admin/catalog/catalog.service"
    );

    const result = await adminCatalogService.listCategories({
      page: 1,
      limit: 20,
    });

    expect(categoryFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    );
    expect(result.items[0]).toMatchObject({
      slug: "phones",
      parent: { slug: "gadgets" },
      counts: { products: 3, attributes: 7, children: 0 },
    });
  });

  it("groups category template fields by scope and includes store brand preview", async () => {
    categoryFindUniqueMock.mockResolvedValueOnce({
      id: "cat-mango",
      name: "Mango",
      slug: "mango",
      brandPolicy: "default_store",
      showStoreBrand: true,
      isActive: true,
      isFeatured: true,
      attributes: [
        {
          id: "field-origin",
          categoryId: "cat-mango",
          attributeId: "attr-origin",
          scope: "product",
          required: true,
          filterable: true,
          variantDefining: false,
          comparable: false,
          inputType: "select",
          unit: null,
          groupName: "Food details",
          helpText: null,
          placeholder: null,
          sortOrder: 1,
          attribute: {
            id: "attr-origin",
            name: "Origin",
            slug: "origin",
            type: "text",
            filterable: true,
            variantDefining: false,
            sortOrder: 0,
            values: [],
            createdAt: new Date("2026-06-12T10:00:00.000Z"),
            updatedAt: new Date("2026-06-12T10:00:00.000Z"),
          },
          createdAt: new Date("2026-06-12T10:00:00.000Z"),
          updatedAt: new Date("2026-06-12T10:00:00.000Z"),
        },
        {
          id: "field-pack",
          categoryId: "cat-mango",
          attributeId: "attr-pack",
          scope: "variant",
          required: true,
          filterable: true,
          variantDefining: true,
          comparable: false,
          inputType: "select",
          unit: "kg",
          groupName: "Variant options",
          helpText: null,
          placeholder: null,
          sortOrder: 2,
          attribute: {
            id: "attr-pack",
            name: "Weight Pack",
            slug: "weight-pack",
            type: "text",
            filterable: true,
            variantDefining: true,
            sortOrder: 0,
            values: [],
            createdAt: new Date("2026-06-12T10:00:00.000Z"),
            updatedAt: new Date("2026-06-12T10:00:00.000Z"),
          },
          createdAt: new Date("2026-06-12T10:00:00.000Z"),
          updatedAt: new Date("2026-06-12T10:00:00.000Z"),
        },
        {
          id: "field-expiry",
          categoryId: "cat-mango",
          attributeId: "attr-expiry",
          scope: "batch",
          required: true,
          filterable: false,
          variantDefining: false,
          comparable: false,
          inputType: "date",
          unit: null,
          groupName: "Batch details",
          helpText: null,
          placeholder: null,
          sortOrder: 3,
          attribute: {
            id: "attr-expiry",
            name: "Expiry Date",
            slug: "expiry-date",
            type: "text",
            filterable: false,
            variantDefining: false,
            sortOrder: 0,
            values: [],
            createdAt: new Date("2026-06-12T10:00:00.000Z"),
            updatedAt: new Date("2026-06-12T10:00:00.000Z"),
          },
          createdAt: new Date("2026-06-12T10:00:00.000Z"),
          updatedAt: new Date("2026-06-12T10:00:00.000Z"),
        },
      ],
    });

    const { adminCatalogService } = await import(
      "../src/modules/admin/catalog/catalog.service"
    );

    const result = await adminCatalogService.getCategoryTemplate("cat-mango");

    expect(result.brand).toMatchObject({
      policy: "default_store",
      showStoreBrand: true,
    });
    expect(result.brand.storeBrandName).toBeTruthy();
    expect(result.fields.product).toHaveLength(1);
    expect(result.fields.variant).toHaveLength(1);
    expect(result.fields.batch).toHaveLength(1);
  });

  it("normalizes category slugs on create", async () => {
    const { adminCatalogService } = await import(
      "../src/modules/admin/catalog/catalog.service"
    );

    await adminCatalogService.createCategory({
      name: "Smart Phones",
      brandPolicy: "required",
    });

    expect(categoryCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Smart Phones",
          slug: "smart-phones",
          brandPolicy: "required",
        }),
      }),
    );
  });

  it("soft disables categories and brands", async () => {
    const { adminCatalogService } = await import(
      "../src/modules/admin/catalog/catalog.service"
    );

    await adminCatalogService.disableCategory("cat-1");
    await adminCatalogService.disableBrand("brand-1");

    expect(categoryUpdateMock).toHaveBeenCalledWith({
      where: { id: "cat-1" },
      data: { isActive: false },
    });
    expect(productBrandUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "brand-1" },
        data: { isActive: false },
      }),
    );
  });

  it("assigns category attributes through the compound unique key", async () => {
    const { adminCatalogService } = await import(
      "../src/modules/admin/catalog/catalog.service"
    );

    await adminCatalogService.assignCategoryAttribute("cat-1", {
      attributeId: "attr-1",
      scope: "variant",
      inputType: "color",
      variantDefining: true,
    });

    expect(categoryAttributeUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          categoryId_attributeId_scope: {
            categoryId: "cat-1",
            attributeId: "attr-1",
            scope: "variant",
          },
        },
      }),
    );
  });
});
