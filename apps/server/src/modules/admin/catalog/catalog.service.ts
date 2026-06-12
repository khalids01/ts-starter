import prisma, { type Prisma } from "@db/server";
import { brandConfig } from "@config/brand";
import type {
  AssignCategoryAttributeInput,
  CreateAttributeInput,
  CreateAttributeValueInput,
  CreateBrandInput,
  CreateCategoryInput,
  ListCatalogQuery,
  UpdateAttributeInput,
  UpdateAttributeValueInput,
  UpdateBrandInput,
  UpdateCategoryAttributeInput,
  UpdateCategoryInput,
} from "./catalog.dto";

export class CatalogServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSlug(input: { slug?: string; name: string }) {
  const slug = slugify(input.slug || input.name);
  if (!slug) {
    throw new CatalogServiceError("Slug cannot be empty");
  }
  return slug;
}

function normalizePagination(page?: number, limit?: number) {
  const normalizedLimit = Math.min(Math.max(limit ?? 20, 1), 100);
  return {
    limit: normalizedLimit,
    requestedPage: Math.max(page ?? 1, 1),
  };
}

function toIso(value: Date | string | null | undefined) {
  if (!value) {
    return value ?? null;
  }
  return value instanceof Date ? value.toISOString() : value;
}

function paginationResult<T>({
  items,
  total,
  requestedPage,
  limit,
}: {
  items: T[];
  total: number;
  requestedPage: number;
  limit: number;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    total,
    pages,
    page: Math.min(requestedPage, pages),
    limit,
  };
}

function mapAttributeValue(row: any) {
  return {
    id: row.id,
    attributeId: row.attributeId,
    value: row.value,
    label: row.label,
    sortOrder: row.sortOrder,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapAttribute(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type,
    filterable: row.filterable,
    variantDefining: row.variantDefining,
    sortOrder: row.sortOrder,
    values: (row.values ?? []).map(mapAttributeValue),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapCategoryAttribute(row: any) {
  return {
    id: row.id,
    categoryId: row.categoryId,
    attributeId: row.attributeId,
    scope: row.scope,
    required: row.required,
    filterable: row.filterable,
    variantDefining: row.variantDefining,
    comparable: row.comparable,
    inputType: row.inputType,
    unit: row.unit,
    groupName: row.groupName,
    helpText: row.helpText,
    placeholder: row.placeholder,
    sortOrder: row.sortOrder,
    attribute: row.attribute ? mapAttribute(row.attribute) : undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapCategory(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    parentId: row.parentId,
    parent: row.parent
      ? {
          id: row.parent.id,
          name: row.parent.name,
          slug: row.parent.slug,
        }
      : null,
    children: (row.children ?? []).map((child: any) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      isActive: child.isActive,
      sortOrder: child.sortOrder,
    })),
    imageUrl: row.imageUrl,
    iconUrl: row.iconUrl,
    brandPolicy: row.brandPolicy,
    showStoreBrand: row.showStoreBrand,
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    sortOrder: row.sortOrder,
    counts: row._count
      ? {
          products: row._count.products ?? 0,
          attributes: row._count.attributes ?? 0,
          children: row._count.children ?? 0,
        }
      : undefined,
    attributes: (row.attributes ?? []).map(mapCategoryAttribute),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapBrand(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    logoUrl: row.logoUrl,
    websiteUrl: row.websiteUrl,
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    productCount: row._count?.products,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

async function assertCategoryExists(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!category) {
    throw new CatalogServiceError("Category not found", 404);
  }
}

async function assertAttributeExists(id: string) {
  const attribute = await prisma.productAttribute.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!attribute) {
    throw new CatalogServiceError("Attribute not found", 404);
  }
}

export class AdminCatalogService {
  async listCategories(query: ListCatalogQuery = {}) {
    const { requestedPage, limit } = normalizePagination(query.page, query.limit);
    const where: Prisma.CategoryWhereInput = {};

    if (query.active !== undefined) {
      where.isActive = query.active;
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.category.count({ where });
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const rows = await prisma.category.findMany({
      where,
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true, attributes: true, children: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginationResult({
      items: rows.map(mapCategory),
      total,
      requestedPage,
      limit,
    });
  }

  async getCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            sortOrder: true,
          },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
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
        _count: { select: { products: true, attributes: true, children: true } },
      },
    });

    if (!category) {
      throw new CatalogServiceError("Category not found", 404);
    }

    return mapCategory(category);
  }

  async getCategoryTemplate(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
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
      throw new CatalogServiceError("Category not found", 404);
    }

    const grouped = {
      product: [] as ReturnType<typeof mapCategoryAttribute>[],
      variant: [] as ReturnType<typeof mapCategoryAttribute>[],
      batch: [] as ReturnType<typeof mapCategoryAttribute>[],
    };

    for (const row of category.attributes) {
      grouped[row.scope].push(mapCategoryAttribute(row));
    }

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        brandPolicy: category.brandPolicy,
        showStoreBrand: category.showStoreBrand,
        isActive: category.isActive,
        isFeatured: category.isFeatured,
      },
      brand: {
        policy: category.brandPolicy,
        showStoreBrand: category.showStoreBrand,
        storeBrandName: brandConfig.name,
      },
      fields: grouped,
      commonFilters: {
        price: true,
        availability: true,
        brand: ["optional", "required"].includes(category.brandPolicy),
      },
    };
  }

  async createCategory(input: CreateCategoryInput) {
    if (input.parentId) {
      await assertCategoryExists(input.parentId);
    }

    const category = await prisma.category.create({
      data: {
        name: input.name.trim(),
        slug: normalizeSlug({ slug: input.slug, name: input.name }),
        description: input.description ?? null,
        parentId: input.parentId ?? null,
        imageUrl: input.imageUrl ?? null,
        iconUrl: input.iconUrl ?? null,
        brandPolicy: input.brandPolicy ?? "optional",
        showStoreBrand: input.showStoreBrand ?? false,
        isActive: input.isActive ?? true,
        isFeatured: input.isFeatured ?? false,
        sortOrder: input.sortOrder ?? 0,
      },
    });

    return mapCategory(category);
  }

  async updateCategory(id: string, input: UpdateCategoryInput) {
    await assertCategoryExists(id);

    if (input.parentId && input.parentId === id) {
      throw new CatalogServiceError("Category cannot be its own parent");
    }

    if (input.parentId) {
      await assertCategoryExists(input.parentId);
    }

    const data: Prisma.CategoryUpdateInput = {};

    if (input.name !== undefined) {
      data.name = input.name.trim();
    }
    if (input.slug !== undefined || input.name !== undefined) {
      data.slug = normalizeSlug({
        slug: input.slug,
        name: input.name ?? (await this.getCategory(id)).name,
      });
    }
    if (input.description !== undefined) {
      data.description = input.description;
    }
    if (input.parentId !== undefined) {
      data.parent = input.parentId
        ? { connect: { id: input.parentId } }
        : { disconnect: true };
    }
    if (input.imageUrl !== undefined) {
      data.imageUrl = input.imageUrl;
    }
    if (input.iconUrl !== undefined) {
      data.iconUrl = input.iconUrl;
    }
    if (input.brandPolicy !== undefined) {
      data.brandPolicy = input.brandPolicy;
    }
    if (input.showStoreBrand !== undefined) {
      data.showStoreBrand = input.showStoreBrand;
    }
    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }
    if (input.isFeatured !== undefined) {
      data.isFeatured = input.isFeatured;
    }
    if (input.sortOrder !== undefined) {
      data.sortOrder = input.sortOrder;
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return mapCategory(category);
  }

  async disableCategory(id: string) {
    const category = await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
    return mapCategory(category);
  }

  async listAttributes(query: ListCatalogQuery = {}) {
    const { requestedPage, limit } = normalizePagination(query.page, query.limit);
    const where: Prisma.ProductAttributeWhereInput = {};

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.productAttribute.count({ where });
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const rows = await prisma.productAttribute.findMany({
      where,
      include: {
        values: { orderBy: [{ sortOrder: "asc" }, { label: "asc" }] },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginationResult({
      items: rows.map(mapAttribute),
      total,
      requestedPage,
      limit,
    });
  }

  async createAttribute(input: CreateAttributeInput) {
    const attribute = await prisma.productAttribute.create({
      data: {
        name: input.name.trim(),
        slug: normalizeSlug({ slug: input.slug, name: input.name }),
        type: input.type ?? "text",
        filterable: input.filterable ?? false,
        variantDefining: input.variantDefining ?? false,
        sortOrder: input.sortOrder ?? 0,
      },
      include: { values: true },
    });

    return mapAttribute(attribute);
  }

  async updateAttribute(id: string, input: UpdateAttributeInput) {
    await assertAttributeExists(id);

    const current =
      input.slug === undefined && input.name === undefined
        ? null
        : await prisma.productAttribute.findUnique({
            where: { id },
            select: { name: true },
          });

    const attribute = await prisma.productAttribute.update({
      where: { id },
      data: {
        name: input.name?.trim(),
        slug:
          input.slug !== undefined || input.name !== undefined
            ? normalizeSlug({
                slug: input.slug,
                name: input.name ?? current!.name,
              })
            : undefined,
        type: input.type,
        filterable: input.filterable,
        variantDefining: input.variantDefining,
        sortOrder: input.sortOrder,
      },
      include: {
        values: { orderBy: [{ sortOrder: "asc" }, { label: "asc" }] },
      },
    });

    return mapAttribute(attribute);
  }

  async upsertAttributeValue(
    attributeId: string,
    input: CreateAttributeValueInput,
  ) {
    await assertAttributeExists(attributeId);

    const value = await prisma.productAttributeValue.upsert({
      where: {
        attributeId_value: {
          attributeId,
          value: input.value.trim(),
        },
      },
      create: {
        attributeId,
        value: input.value.trim(),
        label: input.label.trim(),
        sortOrder: input.sortOrder ?? 0,
      },
      update: {
        label: input.label.trim(),
        sortOrder: input.sortOrder ?? 0,
      },
    });

    return mapAttributeValue(value);
  }

  async updateAttributeValue(id: string, input: UpdateAttributeValueInput) {
    const value = await prisma.productAttributeValue.update({
      where: { id },
      data: {
        value: input.value?.trim(),
        label: input.label?.trim(),
        sortOrder: input.sortOrder,
      },
    });

    return mapAttributeValue(value);
  }

  async assignCategoryAttribute(
    categoryId: string,
    input: AssignCategoryAttributeInput,
  ) {
    await Promise.all([
      assertCategoryExists(categoryId),
      assertAttributeExists(input.attributeId),
    ]);

    const row = await prisma.categoryAttribute.upsert({
      where: {
        categoryId_attributeId_scope: {
          categoryId,
          attributeId: input.attributeId,
          scope: input.scope,
        },
      },
      create: {
        categoryId,
        attributeId: input.attributeId,
        scope: input.scope,
        required: input.required ?? false,
        filterable: input.filterable ?? false,
        variantDefining: input.variantDefining ?? false,
        comparable: input.comparable ?? false,
        inputType: input.inputType ?? "text",
        unit: input.unit ?? null,
        groupName: input.groupName ?? null,
        helpText: input.helpText ?? null,
        placeholder: input.placeholder ?? null,
        sortOrder: input.sortOrder ?? 0,
      },
      update: {
        required: input.required ?? false,
        filterable: input.filterable ?? false,
        variantDefining: input.variantDefining ?? false,
        comparable: input.comparable ?? false,
        inputType: input.inputType ?? "text",
        unit: input.unit ?? null,
        groupName: input.groupName ?? null,
        helpText: input.helpText ?? null,
        placeholder: input.placeholder ?? null,
        sortOrder: input.sortOrder ?? 0,
      },
      include: {
        attribute: {
          include: { values: { orderBy: [{ sortOrder: "asc" }, { label: "asc" }] } },
        },
      },
    });

    return mapCategoryAttribute(row);
  }

  async updateCategoryAttribute(
    id: string,
    input: UpdateCategoryAttributeInput,
  ) {
    const row = await prisma.categoryAttribute.update({
      where: { id },
      data: {
        required: input.required,
        filterable: input.filterable,
        variantDefining: input.variantDefining,
        comparable: input.comparable,
        inputType: input.inputType,
        unit: input.unit,
        groupName: input.groupName,
        helpText: input.helpText,
        placeholder: input.placeholder,
        sortOrder: input.sortOrder,
      },
      include: {
        attribute: {
          include: { values: { orderBy: [{ sortOrder: "asc" }, { label: "asc" }] } },
        },
      },
    });

    return mapCategoryAttribute(row);
  }

  async deleteCategoryAttribute(id: string) {
    await prisma.categoryAttribute.delete({ where: { id } });
    return { message: "Category attribute removed", status: 200 };
  }

  async listBrands(query: ListCatalogQuery = {}) {
    const { requestedPage, limit } = normalizePagination(query.page, query.limit);
    const where: Prisma.ProductBrandWhereInput = {};

    if (query.active !== undefined) {
      where.isActive = query.active;
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.productBrand.count({ where });
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const rows = await prisma.productBrand.findMany({
      where,
      include: { _count: { select: { products: true } } },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginationResult({
      items: rows.map(mapBrand),
      total,
      requestedPage,
      limit,
    });
  }

  async createBrand(input: CreateBrandInput) {
    const brand = await prisma.productBrand.create({
      data: {
        name: input.name.trim(),
        slug: normalizeSlug({ slug: input.slug, name: input.name }),
        description: input.description ?? null,
        logoUrl: input.logoUrl ?? null,
        websiteUrl: input.websiteUrl ?? null,
        isActive: input.isActive ?? true,
        isFeatured: input.isFeatured ?? false,
      },
      include: { _count: { select: { products: true } } },
    });

    return mapBrand(brand);
  }

  async updateBrand(id: string, input: UpdateBrandInput) {
    const current =
      input.slug === undefined && input.name === undefined
        ? null
        : await prisma.productBrand.findUnique({
            where: { id },
            select: { name: true },
          });

    if (!current && (input.slug !== undefined || input.name !== undefined)) {
      throw new CatalogServiceError("Brand not found", 404);
    }

    const brand = await prisma.productBrand.update({
      where: { id },
      data: {
        name: input.name?.trim(),
        slug:
          input.slug !== undefined || input.name !== undefined
            ? normalizeSlug({
                slug: input.slug,
                name: input.name ?? current!.name,
              })
            : undefined,
        description: input.description,
        logoUrl: input.logoUrl,
        websiteUrl: input.websiteUrl,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
      },
      include: { _count: { select: { products: true } } },
    });

    return mapBrand(brand);
  }

  async disableBrand(id: string) {
    const brand = await prisma.productBrand.update({
      where: { id },
      data: { isActive: false },
      include: { _count: { select: { products: true } } },
    });

    return mapBrand(brand);
  }
}

export const adminCatalogService = new AdminCatalogService();
