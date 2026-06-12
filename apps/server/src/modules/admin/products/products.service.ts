import prisma, { type Prisma } from "@db/server";
import type {
  CreateProductInput,
  ListProductsQuery,
  ReplaceProductAttributesInput,
  ReplaceProductVariantsInput,
  UpdateProductInput,
} from "./products.dto";

export class AdminProductServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

type CategoryTemplateField = {
  attributeId: string;
  scope: "product" | "variant" | "batch";
  required: boolean;
  variantDefining: boolean;
  inputType: string;
  attribute?: {
    id: string;
    name: string;
    slug: string;
  };
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSlug(input: { slug?: string | null; name: string }) {
  const slug = slugify(input.slug || input.name);
  if (!slug) {
    throw new AdminProductServiceError("Slug cannot be empty");
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

function decimalToString(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }
  return String(value);
}

function decimalToNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDecimalString(
  value: string | number | null | undefined,
  field: string,
  options: { required?: boolean; positive?: boolean } = {},
) {
  if (value === null || value === undefined || value === "") {
    if (options.required) {
      throw new AdminProductServiceError(`${field} is required`);
    }
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new AdminProductServiceError(`${field} must be a valid number`);
  }
  if (options.positive && parsed <= 0) {
    throw new AdminProductServiceError(`${field} must be greater than 0`);
  }
  if (!options.positive && parsed < 0) {
    throw new AdminProductServiceError(`${field} cannot be negative`);
  }

  return String(value);
}

function parseDate(value: string | null | undefined, field: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AdminProductServiceError(`${field} must be a valid date`);
  }

  return date;
}

function normalizeCurrency(value?: string) {
  return (value || "BDT").trim().toUpperCase();
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

function productInclude() {
  return {
    category: {
      select: {
        id: true,
        name: true,
        slug: true,
        brandPolicy: true,
        showStoreBrand: true,
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
    attributeAssignments: {
      include: {
        attribute: {
          select: { id: true, name: true, slug: true, type: true },
        },
        attributeValue: {
          select: { id: true, value: true, label: true, attributeId: true },
        },
        values: {
          include: {
            attributeValue: {
              select: { id: true, value: true, label: true, attributeId: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    },
    variants: {
      include: {
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
    _count: {
      select: {
        variants: true,
        attributeAssignments: true,
      },
    },
  } satisfies Prisma.ProductInclude;
}

function mapAttributeAssignment(row: any) {
  return {
    id: row.id,
    productId: row.productId,
    attributeId: row.attributeId,
    attribute: row.attribute,
    attributeValueId: row.attributeValueId,
    attributeValue: row.attributeValue ?? null,
    values: (row.values ?? []).map((entry: any) => entry.attributeValue),
    rawText: row.rawText,
    rawNumber: decimalToString(row.rawNumber),
    rawBoolean: row.rawBoolean,
    rawDate: toIso(row.rawDate),
    displayValue: row.displayValue,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapVariant(row: any) {
  return {
    id: row.id,
    productId: row.productId,
    sku: row.sku,
    barcode: row.barcode,
    name: row.name,
    attributesSnapshot: row.attributesSnapshot ?? null,
    price: decimalToString(row.price),
    compareAtPrice: decimalToString(row.compareAtPrice),
    costPrice: decimalToString(row.costPrice),
    currency: row.currency,
    isDefault: row.isDefault,
    isActive: row.isActive,
    media: row.media ?? null,
    weightValue: decimalToString(row.weightValue),
    weightUnit: row.weightUnit,
    attributeValues: (row.attributeValues ?? []).map((entry: any) => ({
      id: entry.attributeValue.id,
      value: entry.attributeValue.value,
      label: entry.attributeValue.label,
      attributeId: entry.attributeValue.attributeId,
      attribute: entry.attributeValue.attribute,
    })),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapProduct(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    descriptionHtml: row.descriptionHtml,
    categoryId: row.categoryId,
    category: row.category ?? null,
    brandId: row.brandId,
    brand: row.brand ?? null,
    status: row.status,
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    media: row.media ?? null,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    counts: row._count
      ? {
          variants: row._count.variants ?? 0,
          attributeAssignments: row._count.attributeAssignments ?? 0,
        }
      : undefined,
    attributeAssignments: (row.attributeAssignments ?? []).map(
      mapAttributeAssignment,
    ),
    variants: (row.variants ?? []).map(mapVariant),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapProductSummary(row: any) {
  const mapped = mapProduct(row);
  return {
    ...mapped,
    attributeAssignments: undefined,
    variants: undefined,
  };
}

async function getCategoryForProduct(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      name: true,
      slug: true,
      brandPolicy: true,
      isActive: true,
      attributes: {
        include: {
          attribute: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: [{ sortOrder: "asc" }],
      },
    },
  });

  if (!category) {
    throw new AdminProductServiceError("Category not found", 404);
  }
  if (!category.isActive) {
    throw new AdminProductServiceError("Category is inactive");
  }

  return category;
}

async function assertActiveBrand(brandId: string) {
  const brand = await prisma.productBrand.findUnique({
    where: { id: brandId },
    select: { id: true, isActive: true },
  });

  if (!brand) {
    throw new AdminProductServiceError("Product brand not found", 404);
  }
  if (!brand.isActive) {
    throw new AdminProductServiceError("Product brand is inactive");
  }
}

async function resolveBrandId(
  category: { brandPolicy: string },
  brandId: string | null | undefined,
) {
  if (category.brandPolicy === "hidden" || category.brandPolicy === "default_store") {
    return null;
  }

  if (brandId) {
    await assertActiveBrand(brandId);
  }

  return brandId ?? null;
}

function getTemplateFields(
  category: { attributes?: CategoryTemplateField[] },
  scope: "product" | "variant" | "batch",
) {
  return (category.attributes ?? []).filter((field) => field.scope === scope);
}

function getAttributeIdsFromVariant(variant: any) {
  return new Set(
    (variant.attributeValues ?? []).map(
      (entry: any) => entry.attributeValue.attributeId,
    ),
  );
}

function validateSkuList(variants: { sku: string }[]) {
  const seen = new Set<string>();
  for (const variant of variants) {
    const key = variant.sku.trim().toLowerCase();
    if (seen.has(key)) {
      throw new AdminProductServiceError(`Duplicate SKU in request: ${variant.sku}`);
    }
    seen.add(key);
  }
}

function buildVariantSnapshot(values: any[]) {
  return values
    .slice()
    .sort((a, b) => {
      const left = a.attribute?.name ?? "";
      const right = b.attribute?.name ?? "";
      return left.localeCompare(right);
    })
    .map((value) => ({
      attributeId: value.attributeId,
      attributeName: value.attribute?.name ?? null,
      attributeSlug: value.attribute?.slug ?? null,
      valueId: value.id,
      value: value.value,
      label: value.label,
    }));
}

function generateSku({
  productSlug,
  index,
  values,
  used,
}: {
  productSlug: string;
  index: number;
  values: any[];
  used: Set<string>;
}) {
  const prefix = productSlug
    .replace(/[^a-z0-9]+/gi, "")
    .slice(0, 10)
    .toUpperCase() || "SKU";
  const suffix =
    values
      .map((value) => String(value.value || value.label || ""))
      .join("-")
      .replace(/[^a-z0-9]+/gi, "")
      .slice(0, 12)
      .toUpperCase() || String(index + 1).padStart(2, "0");
  let candidate = `${prefix}-${suffix}`;
  let attempt = 2;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${prefix}-${suffix}-${attempt}`;
    attempt += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

export class AdminProductsService {
  async listProducts(query: ListProductsQuery = {}) {
    const { requestedPage, limit } = normalizePagination(query.page, query.limit);
    const where: Prisma.ProductWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.active !== undefined) {
      where.isActive = query.active;
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.brandId) {
      where.brandId = query.brandId;
    }
    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.product.count({ where });
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(requestedPage, pages);
    const rows = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        _count: {
          select: { variants: true, attributeAssignments: true },
        },
      },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginationResult({
      items: rows.map(mapProductSummary),
      total,
      requestedPage,
      limit,
    });
  }

  async getProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: productInclude(),
    });

    if (!product) {
      throw new AdminProductServiceError("Product not found", 404);
    }

    return mapProduct(product);
  }

  async createProduct(input: CreateProductInput) {
    const category = await getCategoryForProduct(input.categoryId);
    const brandId = await resolveBrandId(category, input.brandId);
    const slug = normalizeSlug({ slug: input.slug, name: input.name });

    const product = await prisma.product.create({
      data: {
        categoryId: input.categoryId,
        name: input.name.trim(),
        slug,
        description: input.description ?? null,
        descriptionHtml: input.descriptionHtml ?? null,
        brandId,
        status: "draft",
        isActive: true,
        isFeatured: input.isFeatured ?? false,
        media: input.media ?? undefined,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
      },
      include: productInclude(),
    });

    return mapProduct(product);
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            brandPolicy: true,
            isActive: true,
            attributes: {
              include: {
                attribute: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
        _count: {
          select: { variants: true, attributeAssignments: true },
        },
      },
    });

    if (!existing) {
      throw new AdminProductServiceError("Product not found", 404);
    }

    const nextCategoryId = input.categoryId ?? existing.categoryId;
    if (
      nextCategoryId !== existing.categoryId &&
      (existing._count.variants > 0 || existing._count.attributeAssignments > 0)
    ) {
      throw new AdminProductServiceError(
        "Cannot change category after attributes or variants are added",
      );
    }

    const category =
      nextCategoryId === existing.categoryId
        ? existing.category
        : await getCategoryForProduct(nextCategoryId);
    if (!category.isActive) {
      throw new AdminProductServiceError("Category is inactive");
    }

    const incomingBrandId =
      "brandId" in input ? input.brandId : existing.brandId;
    const brandId = await resolveBrandId(category, incomingBrandId);
    const name = input.name?.trim() ?? existing.name;
    const shouldUpdateSlug = input.slug !== undefined || input.name !== undefined;
    const data: Prisma.ProductUpdateInput = {
      category: { connect: { id: nextCategoryId } },
      brand: brandId ? { connect: { id: brandId } } : { disconnect: true },
    };

    if (input.name !== undefined) {
      data.name = name;
    }
    if (shouldUpdateSlug) {
      data.slug = normalizeSlug({ slug: input.slug, name });
    }
    if (input.description !== undefined) {
      data.description = input.description;
    }
    if (input.descriptionHtml !== undefined) {
      data.descriptionHtml = input.descriptionHtml;
    }
    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }
    if (input.isFeatured !== undefined) {
      data.isFeatured = input.isFeatured;
    }
    if (input.media !== undefined) {
      data.media = (input.media ?? null) as any;
    }
    if (input.seoTitle !== undefined) {
      data.seoTitle = input.seoTitle;
    }
    if (input.seoDescription !== undefined) {
      data.seoDescription = input.seoDescription;
    }
    if (input.status !== undefined) {
      if (input.status === "active") {
        await this.validateProductForActivation(id, {
          categoryId: nextCategoryId,
          brandId,
          name,
        });
      }
      data.status = input.status;
      data.isActive = input.status !== "archived";
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: productInclude(),
    });

    return mapProduct(product);
  }

  async archiveProduct(id: string) {
    await this.assertProductExists(id);
    const product = await prisma.product.update({
      where: { id },
      data: { status: "archived", isActive: false },
      include: productInclude(),
    });
    return mapProduct(product);
  }

  async replaceProductAttributes(
    id: string,
    input: ReplaceProductAttributesInput,
  ) {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        categoryId: true,
        category: {
          select: {
            attributes: {
              where: { scope: "product" },
              include: {
                attribute: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new AdminProductServiceError("Product not found", 404);
    }

    const fieldsByAttribute = new Map(
      product.category.attributes.map((field: any) => [field.attributeId, field]),
    );
    const seen = new Set<string>();
    for (const assignment of input.assignments) {
      if (seen.has(assignment.attributeId)) {
        throw new AdminProductServiceError(
          `Duplicate product attribute: ${assignment.attributeId}`,
        );
      }
      seen.add(assignment.attributeId);

      if (!fieldsByAttribute.has(assignment.attributeId)) {
        throw new AdminProductServiceError(
          "Product attribute is not allowed for this category",
        );
      }
    }

    const valueIds = [
      ...new Set(
        input.assignments.flatMap((assignment) => [
          ...(assignment.attributeValueId ? [assignment.attributeValueId] : []),
          ...(assignment.attributeValueIds ?? []),
        ]),
      ),
    ];
    const valuesById = await this.getValuesById(valueIds);

    await prisma.$transaction(async (tx) => {
      await tx.productAttributeAssignment.deleteMany({
        where: { productId: id },
      });

      for (const assignment of input.assignments) {
        const field = fieldsByAttribute.get(assignment.attributeId) as any;
        const assignmentValueIds = [
          ...new Set([
            ...(assignment.attributeValueId ? [assignment.attributeValueId] : []),
            ...(assignment.attributeValueIds ?? []),
          ]),
        ];

        for (const valueId of assignmentValueIds) {
          const value = valuesById.get(valueId);
          if (!value) {
            throw new AdminProductServiceError("Attribute value not found", 404);
          }
          if (value.attributeId !== assignment.attributeId) {
            throw new AdminProductServiceError(
              "Attribute value does not belong to the provided attribute",
            );
          }
        }

        if (field.inputType !== "multiselect" && assignmentValueIds.length > 1) {
          throw new AdminProductServiceError(
            "Only multiselect attributes can store multiple values",
          );
        }

        await tx.productAttributeAssignment.create({
          data: {
            productId: id,
            attributeId: assignment.attributeId,
            attributeValueId:
              field.inputType === "multiselect"
                ? null
                : assignmentValueIds[0] ?? null,
            rawText: assignment.rawText ?? null,
            rawNumber: toDecimalString(
              assignment.rawNumber,
              `${field.attribute?.name ?? "Attribute"} number`,
            ),
            rawBoolean: assignment.rawBoolean ?? null,
            rawDate: parseDate(
              assignment.rawDate,
              `${field.attribute?.name ?? "Attribute"} date`,
            ),
            displayValue: assignment.displayValue ?? null,
            values:
              field.inputType === "multiselect" && assignmentValueIds.length > 0
                ? {
                    create: assignmentValueIds.map((attributeValueId) => ({
                      attributeValueId,
                    })),
                  }
                : undefined,
          },
        });
      }
    });

    return this.getProduct(id);
  }

  async replaceProductVariants(id: string, input: ReplaceProductVariantsInput) {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        categoryId: true,
        category: {
          select: {
            attributes: {
              where: { scope: "variant" },
              include: {
                attribute: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
        variants: {
          select: { id: true },
        },
      },
    });

    if (!product) {
      throw new AdminProductServiceError("Product not found", 404);
    }

    const existingVariantIds = new Set(product.variants.map((variant) => variant.id));
    const unknownVariant = input.variants.find(
      (variant) => variant.id && !existingVariantIds.has(variant.id),
    );
    if (unknownVariant) {
      throw new AdminProductServiceError("Variant does not belong to product", 404);
    }

    const variantFields = product.category.attributes;
    const allowedAttributeIds = new Set(
      variantFields.map((field: any) => field.attributeId),
    );
    const requiredVariantAttributeIds = new Set(
      variantFields
        .filter((field: any) => field.variantDefining || field.required)
        .map((field: any) => field.attributeId),
    );
    const allValueIds = [
      ...new Set(
        input.variants.flatMap((variant) => variant.attributeValueIds ?? []),
      ),
    ];
    const valuesById = await this.getValuesById(allValueIds);
    const usedSkus = new Set<string>();

    const normalizedVariants = input.variants.map((variant, index) => {
      const values = (variant.attributeValueIds ?? []).map((valueId) => {
        const value = valuesById.get(valueId);
        if (!value) {
          throw new AdminProductServiceError("Attribute value not found", 404);
        }
        if (!allowedAttributeIds.has(value.attributeId)) {
          throw new AdminProductServiceError(
            "Variant attribute value is not allowed for this category",
          );
        }
        return value;
      });

      const attributeIds = new Set<string>();
      for (const value of values) {
        if (attributeIds.has(value.attributeId)) {
          throw new AdminProductServiceError(
            "Each variant can use only one value per attribute",
          );
        }
        attributeIds.add(value.attributeId);
      }

      const missingRequired = [...requiredVariantAttributeIds].filter(
        (attributeId) => !attributeIds.has(attributeId),
      );
      if (missingRequired.length > 0 && variant.isActive !== false) {
        throw new AdminProductServiceError(
          "Active variant is missing required variant attributes",
        );
      }

      const sku = variant.sku?.trim()
        ? variant.sku.trim()
        : generateSku({
            productSlug: product.slug,
            index,
            values,
            used: usedSkus,
          });
      usedSkus.add(sku.toLowerCase());

      return {
        ...variant,
        sku,
        name:
          variant.name?.trim() ||
          [product.name, values.map((value) => value.label).join(" / ")]
            .filter(Boolean)
            .join(" - "),
        currency: normalizeCurrency(variant.currency),
        isActive: variant.isActive ?? true,
        values,
        attributesSnapshot: buildVariantSnapshot(values),
      };
    });

    validateSkuList(normalizedVariants);
    await this.assertSkusAvailable(
      id,
      normalizedVariants.map((variant) => variant.sku),
    );

    const explicitDefaultIndex = normalizedVariants.findIndex(
      (variant) => variant.isDefault === true && variant.isActive !== false,
    );
    const firstActiveIndex = normalizedVariants.findIndex(
      (variant) => variant.isActive !== false,
    );
    const defaultIndex =
      explicitDefaultIndex >= 0 ? explicitDefaultIndex : firstActiveIndex;

    await prisma.$transaction(async (tx) => {
      const keepIds = normalizedVariants
        .map((variant) => variant.id)
        .filter((variantId): variantId is string => Boolean(variantId));

      await tx.productVariant.deleteMany({
        where: {
          productId: id,
          ...(keepIds.length > 0 ? { id: { notIn: keepIds } } : {}),
        },
      });

      for (const [index, variant] of normalizedVariants.entries()) {
        const price = toDecimalString(variant.price, "Price", {
          required: true,
          positive: true,
        });
        if (price === null) {
          throw new AdminProductServiceError("Price is required");
        }

        const data = {
          sku: variant.sku,
          barcode: variant.barcode ?? null,
          name: variant.name,
          price,
          compareAtPrice: toDecimalString(
            variant.compareAtPrice,
            "Compare at price",
          ),
          costPrice: toDecimalString(variant.costPrice, "Cost price"),
          currency: variant.currency,
          isDefault: index === defaultIndex,
          isActive: variant.isActive,
          media: variant.media ?? undefined,
          weightValue: toDecimalString(variant.weightValue, "Weight value"),
          weightUnit: variant.weightUnit ?? null,
          attributesSnapshot: variant.attributesSnapshot,
        } as any;

        const saved = variant.id
          ? await tx.productVariant.update({
              where: { id: variant.id },
              data,
              select: { id: true },
            })
          : await tx.productVariant.create({
              data: {
                productId: id,
                ...data,
              },
              select: { id: true },
            });

        await tx.productVariantAttributeValue.deleteMany({
          where: { variantId: saved.id },
        });
        if (variant.values.length > 0) {
          await tx.productVariantAttributeValue.createMany({
            data: variant.values.map((value) => ({
              variantId: saved.id,
              attributeValueId: value.id,
            })),
            skipDuplicates: true,
          });
        }
      }
    });

    return this.getProduct(id);
  }

  async validateProduct(id: string) {
    const issues = await this.getActivationIssues(id);
    return {
      ok: issues.length === 0,
      issues,
    };
  }

  private async assertProductExists(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!product) {
      throw new AdminProductServiceError("Product not found", 404);
    }
  }

  private async getValuesById(valueIds: string[]) {
    if (valueIds.length === 0) {
      return new Map<string, any>();
    }

    const values = await prisma.productAttributeValue.findMany({
      where: { id: { in: valueIds } },
      include: {
        attribute: {
          select: { id: true, name: true, slug: true, type: true },
        },
      },
    });

    return new Map(values.map((value) => [value.id, value]));
  }

  private async assertSkusAvailable(productId: string, skus: string[]) {
    if (skus.length === 0) {
      return;
    }

    const conflicts = await prisma.productVariant.findMany({
      where: {
        sku: { in: skus },
        productId: { not: productId },
      },
      select: { sku: true },
    });

    if (conflicts.length > 0) {
      throw new AdminProductServiceError(
        `SKU already exists: ${conflicts[0]?.sku}`,
      );
    }
  }

  private async validateProductForActivation(
    productId: string,
    candidate: {
      categoryId?: string;
      brandId?: string | null;
      name?: string;
    } = {},
  ) {
    const issues = await this.getActivationIssues(productId, candidate);
    if (issues.length > 0) {
      throw new AdminProductServiceError(issues[0]?.message ?? "Product is invalid");
    }
  }

  private async getActivationIssues(
    productId: string,
    candidate: {
      categoryId?: string;
      brandId?: string | null;
      name?: string;
    } = {},
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: {
            id: true,
            brandPolicy: true,
            attributes: {
              include: {
                attribute: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
        brand: {
          select: { id: true, isActive: true },
        },
        attributeAssignments: {
          include: {
            values: true,
          },
        },
        variants: {
          include: {
            attributeValues: {
              include: {
                attributeValue: {
                  select: { id: true, attributeId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new AdminProductServiceError("Product not found", 404);
    }

    const category =
      candidate.categoryId && candidate.categoryId !== product.categoryId
        ? await getCategoryForProduct(candidate.categoryId)
        : product.category;
    const brandId =
      candidate.brandId !== undefined ? candidate.brandId : product.brandId;
    const issues: { code: string; message: string; path?: string }[] = [];

    if (!(candidate.name ?? product.name)?.trim()) {
      issues.push({ code: "name_required", message: "Product name is required" });
    }

    if (category.brandPolicy === "required" && !brandId) {
      issues.push({
        code: "brand_required",
        message: "Product brand is required for this category",
        path: "brandId",
      });
    }
    if (
      (category.brandPolicy === "required" || category.brandPolicy === "optional") &&
      brandId
    ) {
      const brand =
        brandId === product.brandId && product.brand
          ? product.brand
          : await prisma.productBrand.findUnique({
              where: { id: brandId },
              select: { id: true, isActive: true },
            });
      if (!brand || !brand.isActive) {
        issues.push({
          code: "brand_inactive",
          message: "Product brand must be active",
          path: "brandId",
        });
      }
    }
    if (
      (category.brandPolicy === "hidden" ||
        category.brandPolicy === "default_store") &&
      brandId
    ) {
      issues.push({
        code: "brand_not_allowed",
        message: "Product brand is not allowed for this category",
        path: "brandId",
      });
    }

    const productFields = getTemplateFields(category, "product");
    const assignmentsByAttribute = new Map(
      product.attributeAssignments.map((assignment) => [
        assignment.attributeId,
        assignment,
      ]),
    );
    for (const field of productFields.filter((entry) => entry.required)) {
      const assignment = assignmentsByAttribute.get(field.attributeId);
      if (
        !assignment ||
        (!assignment.attributeValueId &&
          assignment.values.length === 0 &&
          assignment.rawText == null &&
          assignment.rawNumber == null &&
          assignment.rawBoolean == null &&
          assignment.rawDate == null)
      ) {
        issues.push({
          code: "required_attribute_missing",
          message: `${field.attribute?.name ?? "Required attribute"} is required`,
          path: `attributes.${field.attributeId}`,
        });
      }
    }

    const activeVariants = product.variants.filter((variant) => variant.isActive);
    if (activeVariants.length === 0) {
      issues.push({
        code: "active_variant_required",
        message: "At least one active variant is required",
        path: "variants",
      });
    }

    const skuSet = new Set<string>();
    const variantFields = getTemplateFields(category, "variant");
    const requiredVariantAttributeIds = variantFields
      .filter((field) => field.variantDefining || field.required)
      .map((field) => field.attributeId);

    for (const variant of activeVariants) {
      const price = decimalToNumber(variant.price);
      if (price === null || price <= 0) {
        issues.push({
          code: "variant_price_invalid",
          message: "Active variants must have a price greater than 0",
          path: `variants.${variant.id}.price`,
        });
      }

      if (!variant.sku?.trim()) {
        issues.push({
          code: "variant_sku_required",
          message: "Active variants must have SKUs",
          path: `variants.${variant.id}.sku`,
        });
      } else if (skuSet.has(variant.sku.trim().toLowerCase())) {
        issues.push({
          code: "variant_sku_duplicate",
          message: `Duplicate SKU: ${variant.sku}`,
          path: `variants.${variant.id}.sku`,
        });
      } else {
        skuSet.add(variant.sku.trim().toLowerCase());
      }

      const variantAttributeIds = getAttributeIdsFromVariant(variant);
      for (const attributeId of requiredVariantAttributeIds) {
        if (!variantAttributeIds.has(attributeId)) {
          issues.push({
            code: "variant_attribute_missing",
            message: "Active variant is missing required variant attributes",
            path: `variants.${variant.id}.attributes`,
          });
        }
      }
    }

    return issues;
  }
}

export const adminProductsService = new AdminProductsService();
