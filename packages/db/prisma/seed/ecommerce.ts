import prisma from "../../src/client.server";

type AttributeSeed = {
  slug: string;
  name: string;
  type: "text" | "number" | "boolean" | "color";
  filterable?: boolean;
  variantDefining?: boolean;
  values?: Array<{ value: string; label: string; sortOrder?: number }>;
};

type CategorySeed = {
  slug: string;
  name: string;
  description?: string;
  parentSlug?: string;
  brandPolicy: "hidden" | "optional" | "required" | "default_store";
  showStoreBrand?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
};

type TemplateAttributeSeed = {
  attributeSlug: string;
  scope: "product" | "variant" | "batch";
  required?: boolean;
  filterable?: boolean;
  variantDefining?: boolean;
  comparable?: boolean;
  inputType:
    | "text"
    | "textarea"
    | "number"
    | "boolean"
    | "select"
    | "multiselect"
    | "color"
    | "date";
  unit?: string;
  groupName?: string;
  helpText?: string;
  placeholder?: string;
  sortOrder?: number;
};

type ShippingRateSeed = {
  code: string;
  label: string;
  amount: string;
  freeOverAmount?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

const attributes: AttributeSeed[] = [
  {
    slug: "color",
    name: "Color",
    type: "color",
    filterable: true,
    variantDefining: true,
    values: [
      { value: "black", label: "Black" },
      { value: "white", label: "White" },
      { value: "blue", label: "Blue" },
      { value: "red", label: "Red" },
      { value: "green", label: "Green" },
    ],
  },
  {
    slug: "storage",
    name: "Storage",
    type: "text",
    filterable: true,
    variantDefining: true,
    values: [
      { value: "64gb", label: "64 GB" },
      { value: "128gb", label: "128 GB" },
      { value: "256gb", label: "256 GB" },
      { value: "512gb", label: "512 GB" },
      { value: "1tb", label: "1 TB" },
    ],
  },
  {
    slug: "ram",
    name: "RAM",
    type: "text",
    filterable: true,
    variantDefining: true,
    values: [
      { value: "4gb", label: "4 GB" },
      { value: "6gb", label: "6 GB" },
      { value: "8gb", label: "8 GB" },
      { value: "12gb", label: "12 GB" },
      { value: "16gb", label: "16 GB" },
      { value: "32gb", label: "32 GB" },
    ],
  },
  { slug: "processor", name: "Processor", type: "text", filterable: true },
  { slug: "camera", name: "Camera", type: "text", filterable: true },
  {
    slug: "display-size",
    name: "Display Size",
    type: "number",
    filterable: true,
  },
  { slug: "warranty", name: "Warranty", type: "number", filterable: true },
  {
    slug: "origin",
    name: "Origin",
    type: "text",
    filterable: true,
    values: [
      { value: "bangladesh", label: "Bangladesh" },
      { value: "rajshahi", label: "Rajshahi" },
      { value: "chapainawabganj", label: "Chapainawabganj" },
      { value: "sundarbans", label: "Sundarbans" },
    ],
  },
  {
    slug: "grade",
    name: "Grade",
    type: "text",
    filterable: true,
    values: [
      { value: "premium", label: "Premium" },
      { value: "standard", label: "Standard" },
      { value: "export", label: "Export" },
    ],
  },
  {
    slug: "weight-pack",
    name: "Weight Pack",
    type: "text",
    filterable: true,
    variantDefining: true,
    values: [
      { value: "250g", label: "250 g" },
      { value: "500g", label: "500 g" },
      { value: "1kg", label: "1 kg" },
      { value: "5kg", label: "5 kg" },
    ],
  },
  {
    slug: "harvest-season",
    name: "Harvest Season",
    type: "text",
    filterable: true,
  },
  {
    slug: "expiry-date",
    name: "Expiry Date",
    type: "text",
    filterable: false,
  },
  {
    slug: "storage-temperature",
    name: "Storage Temperature",
    type: "text",
    filterable: true,
  },
];

const categories: CategorySeed[] = [
  {
    slug: "generic-product",
    name: "Generic Product",
    description: "Reusable fallback template for simple catalog items.",
    brandPolicy: "optional",
    sortOrder: 10,
  },
  {
    slug: "gadgets",
    name: "Gadgets",
    description: "Parent category for electronics and gadget products.",
    brandPolicy: "optional",
    isFeatured: true,
    sortOrder: 20,
  },
  {
    slug: "phones",
    name: "Phones",
    description: "Phones require a manufacturer brand and variant choices.",
    parentSlug: "gadgets",
    brandPolicy: "required",
    isFeatured: true,
    sortOrder: 21,
  },
  {
    slug: "laptops",
    name: "Laptops",
    description: "Laptop products with specs and configurable variants.",
    parentSlug: "gadgets",
    brandPolicy: "required",
    sortOrder: 22,
  },
  {
    slug: "generic-gadget",
    name: "Generic Gadget",
    description: "Fallback template for gadget products.",
    parentSlug: "gadgets",
    brandPolicy: "optional",
    sortOrder: 23,
  },
  {
    slug: "food",
    name: "Food",
    description: "Parent category for food products.",
    brandPolicy: "default_store",
    showStoreBrand: true,
    isFeatured: true,
    sortOrder: 30,
  },
  {
    slug: "fresh-fruit",
    name: "Fresh Fruit",
    description: "Fresh fruit with origin, grade, and batch-sensitive stock.",
    parentSlug: "food",
    brandPolicy: "default_store",
    showStoreBrand: true,
    sortOrder: 31,
  },
  {
    slug: "mango",
    name: "Mango",
    description: "Mango template with origin, pack size, and harvest data.",
    parentSlug: "fresh-fruit",
    brandPolicy: "default_store",
    showStoreBrand: true,
    isFeatured: true,
    sortOrder: 32,
  },
  {
    slug: "honey",
    name: "Honey",
    description: "Honey template for private-label or store-branded products.",
    parentSlug: "food",
    brandPolicy: "default_store",
    showStoreBrand: true,
    isFeatured: true,
    sortOrder: 33,
  },
  {
    slug: "packaged-food",
    name: "Packaged Food",
    description: "Packaged food with optional brand and expiry metadata.",
    parentSlug: "food",
    brandPolicy: "optional",
    sortOrder: 34,
  },
];

const shippingRates: ShippingRateSeed[] = [
  {
    code: "inside_city",
    label: "Inside city",
    amount: "60.00",
    freeOverAmount: "2000.00",
    isDefault: true,
    sortOrder: 10,
  },
  {
    code: "outside_city",
    label: "Outside city",
    amount: "120.00",
    freeOverAmount: "3000.00",
    sortOrder: 20,
  },
];

const categoryTemplates: Record<string, TemplateAttributeSeed[]> = {
  phones: [
    {
      attributeSlug: "processor",
      scope: "product",
      required: true,
      filterable: true,
      comparable: true,
      inputType: "text",
      groupName: "Core specs",
      helpText: "Chipset or processor family, for example Snapdragon 8 Gen 3.",
      sortOrder: 10,
    },
    {
      attributeSlug: "camera",
      scope: "product",
      filterable: true,
      comparable: true,
      inputType: "text",
      groupName: "Core specs",
      helpText: "Main camera summary, for example 50 MP + 12 MP.",
      sortOrder: 20,
    },
    {
      attributeSlug: "display-size",
      scope: "product",
      filterable: true,
      comparable: true,
      inputType: "number",
      unit: "inch",
      groupName: "Display",
      helpText: "Display size measured diagonally in inches.",
      sortOrder: 30,
    },
    {
      attributeSlug: "warranty",
      scope: "product",
      inputType: "number",
      unit: "month",
      groupName: "After sales",
      helpText: "Warranty duration in months.",
      sortOrder: 40,
    },
    {
      attributeSlug: "color",
      scope: "variant",
      required: true,
      filterable: true,
      variantDefining: true,
      inputType: "color",
      groupName: "Variant options",
      helpText: "Customer-selectable color.",
      sortOrder: 50,
    },
    {
      attributeSlug: "ram",
      scope: "variant",
      required: true,
      filterable: true,
      variantDefining: true,
      comparable: true,
      inputType: "select",
      unit: "GB",
      groupName: "Variant options",
      helpText: "Memory option that helps generate SKU rows.",
      sortOrder: 60,
    },
    {
      attributeSlug: "storage",
      scope: "variant",
      required: true,
      filterable: true,
      variantDefining: true,
      comparable: true,
      inputType: "select",
      unit: "GB",
      groupName: "Variant options",
      helpText: "Storage option that helps generate SKU rows.",
      sortOrder: 70,
    },
  ],
  laptops: [
    {
      attributeSlug: "processor",
      scope: "product",
      required: true,
      filterable: true,
      comparable: true,
      inputType: "text",
      groupName: "Core specs",
      sortOrder: 10,
    },
    {
      attributeSlug: "display-size",
      scope: "product",
      filterable: true,
      comparable: true,
      inputType: "number",
      unit: "inch",
      groupName: "Display",
      sortOrder: 20,
    },
    {
      attributeSlug: "warranty",
      scope: "product",
      inputType: "number",
      unit: "month",
      groupName: "After sales",
      sortOrder: 30,
    },
    {
      attributeSlug: "ram",
      scope: "variant",
      required: true,
      filterable: true,
      variantDefining: true,
      comparable: true,
      inputType: "select",
      unit: "GB",
      groupName: "Variant options",
      sortOrder: 40,
    },
    {
      attributeSlug: "storage",
      scope: "variant",
      required: true,
      filterable: true,
      variantDefining: true,
      comparable: true,
      inputType: "select",
      unit: "GB",
      groupName: "Variant options",
      sortOrder: 50,
    },
    {
      attributeSlug: "color",
      scope: "variant",
      filterable: true,
      variantDefining: true,
      inputType: "color",
      groupName: "Variant options",
      sortOrder: 60,
    },
  ],
  "generic-gadget": [
    {
      attributeSlug: "color",
      scope: "variant",
      filterable: true,
      variantDefining: true,
      inputType: "color",
      groupName: "Variant options",
      sortOrder: 10,
    },
    {
      attributeSlug: "warranty",
      scope: "product",
      inputType: "number",
      unit: "month",
      groupName: "After sales",
      sortOrder: 20,
    },
  ],
  "fresh-fruit": [
    {
      attributeSlug: "origin",
      scope: "product",
      required: true,
      filterable: true,
      inputType: "select",
      groupName: "Food details",
      sortOrder: 10,
    },
    {
      attributeSlug: "grade",
      scope: "product",
      filterable: true,
      inputType: "select",
      groupName: "Food details",
      sortOrder: 20,
    },
    {
      attributeSlug: "weight-pack",
      scope: "variant",
      required: true,
      filterable: true,
      variantDefining: true,
      inputType: "select",
      groupName: "Variant options",
      sortOrder: 30,
    },
    {
      attributeSlug: "harvest-season",
      scope: "batch",
      inputType: "text",
      groupName: "Batch details",
      helpText: "Season or harvest window for the received batch.",
      sortOrder: 40,
    },
  ],
  mango: [
    {
      attributeSlug: "origin",
      scope: "product",
      required: true,
      filterable: true,
      inputType: "select",
      groupName: "Food details",
      sortOrder: 10,
    },
    {
      attributeSlug: "grade",
      scope: "product",
      required: true,
      filterable: true,
      inputType: "select",
      groupName: "Food details",
      sortOrder: 20,
    },
    {
      attributeSlug: "weight-pack",
      scope: "variant",
      required: true,
      filterable: true,
      variantDefining: true,
      inputType: "select",
      unit: "kg",
      groupName: "Variant options",
      sortOrder: 30,
    },
    {
      attributeSlug: "harvest-season",
      scope: "batch",
      required: true,
      inputType: "text",
      groupName: "Batch details",
      helpText: "Harvest season for this mango stock batch.",
      sortOrder: 40,
    },
    {
      attributeSlug: "expiry-date",
      scope: "batch",
      required: true,
      inputType: "date",
      groupName: "Batch details",
      helpText: "Best-before or expiry date for this received stock.",
      sortOrder: 50,
    },
  ],
  honey: [
    {
      attributeSlug: "origin",
      scope: "product",
      filterable: true,
      inputType: "select",
      groupName: "Food details",
      sortOrder: 10,
    },
    {
      attributeSlug: "weight-pack",
      scope: "variant",
      required: true,
      filterable: true,
      variantDefining: true,
      inputType: "select",
      groupName: "Variant options",
      sortOrder: 20,
    },
    {
      attributeSlug: "expiry-date",
      scope: "batch",
      required: true,
      inputType: "date",
      groupName: "Batch details",
      sortOrder: 30,
    },
  ],
  "packaged-food": [
    {
      attributeSlug: "weight-pack",
      scope: "variant",
      filterable: true,
      variantDefining: true,
      inputType: "select",
      groupName: "Variant options",
      sortOrder: 10,
    },
    {
      attributeSlug: "storage-temperature",
      scope: "batch",
      filterable: true,
      inputType: "text",
      groupName: "Batch details",
      helpText: "Storage guidance such as room temperature, chilled, or frozen.",
      sortOrder: 20,
    },
    {
      attributeSlug: "expiry-date",
      scope: "batch",
      required: true,
      inputType: "date",
      groupName: "Batch details",
      sortOrder: 30,
    },
  ],
  "generic-product": [
    {
      attributeSlug: "weight-pack",
      scope: "variant",
      filterable: true,
      variantDefining: true,
      inputType: "select",
      groupName: "Variant options",
      sortOrder: 10,
    },
  ],
};

const brands = [
  { slug: "apple", name: "Apple", isFeatured: true },
  { slug: "samsung", name: "Samsung", isFeatured: true },
  { slug: "xiaomi", name: "Xiaomi" },
  { slug: "dell", name: "Dell" },
  { slug: "hp", name: "HP" },
];

async function seedAttributes() {
  const saved = new Map<string, { id: string }>();

  for (const attribute of attributes) {
    const row = await prisma.productAttribute.upsert({
      where: { slug: attribute.slug },
      create: {
        name: attribute.name,
        slug: attribute.slug,
        type: attribute.type,
        filterable: attribute.filterable ?? false,
        variantDefining: attribute.variantDefining ?? false,
      },
      update: {
        name: attribute.name,
        type: attribute.type,
        filterable: attribute.filterable ?? false,
        variantDefining: attribute.variantDefining ?? false,
      },
      select: { id: true },
    });

    saved.set(attribute.slug, row);

    for (const [index, value] of (attribute.values ?? []).entries()) {
      await prisma.productAttributeValue.upsert({
        where: {
          attributeId_value: {
            attributeId: row.id,
            value: value.value,
          },
        },
        create: {
          attributeId: row.id,
          value: value.value,
          label: value.label,
          sortOrder: value.sortOrder ?? index,
        },
        update: {
          label: value.label,
          sortOrder: value.sortOrder ?? index,
        },
      });
    }
  }

  return saved;
}

async function seedCategories() {
  const saved = new Map<string, { id: string }>();

  for (const category of categories) {
    const parent = category.parentSlug ? saved.get(category.parentSlug) : undefined;

    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        parentId: parent?.id,
        brandPolicy: category.brandPolicy,
        showStoreBrand: category.showStoreBrand ?? false,
        isFeatured: category.isFeatured ?? false,
        sortOrder: category.sortOrder ?? 0,
      },
      update: {
        name: category.name,
        description: category.description,
        parentId: parent?.id,
        brandPolicy: category.brandPolicy,
        showStoreBrand: category.showStoreBrand ?? false,
        isFeatured: category.isFeatured ?? false,
        sortOrder: category.sortOrder ?? 0,
      },
      select: { id: true },
    });

    saved.set(category.slug, row);
  }

  return saved;
}

async function seedCategoryTemplates(
  categoryBySlug: Map<string, { id: string }>,
  attributeBySlug: Map<string, { id: string }>,
) {
  for (const [categorySlug, template] of Object.entries(categoryTemplates)) {
    const category = categoryBySlug.get(categorySlug);
    if (!category) {
      throw new Error(`Missing seeded category: ${categorySlug}`);
    }

    for (const item of template) {
      const attribute = attributeBySlug.get(item.attributeSlug);
      if (!attribute) {
        throw new Error(`Missing seeded attribute: ${item.attributeSlug}`);
      }

      await prisma.categoryAttribute.upsert({
        where: {
          categoryId_attributeId_scope: {
            categoryId: category.id,
            attributeId: attribute.id,
            scope: item.scope,
          },
        },
        create: {
          categoryId: category.id,
          attributeId: attribute.id,
          scope: item.scope,
          required: item.required ?? false,
          filterable: item.filterable ?? false,
          variantDefining: item.variantDefining ?? false,
          comparable: item.comparable ?? false,
          inputType: item.inputType,
          unit: item.unit,
          groupName: item.groupName,
          helpText: item.helpText,
          placeholder: item.placeholder,
          sortOrder: item.sortOrder ?? 0,
        },
        update: {
          required: item.required ?? false,
          filterable: item.filterable ?? false,
          variantDefining: item.variantDefining ?? false,
          comparable: item.comparable ?? false,
          inputType: item.inputType,
          unit: item.unit,
          groupName: item.groupName,
          helpText: item.helpText,
          placeholder: item.placeholder,
          sortOrder: item.sortOrder ?? 0,
        },
      });
    }
  }
}

async function seedBrands() {
  for (const brand of brands) {
    await prisma.productBrand.upsert({
      where: { slug: brand.slug },
      create: {
        name: brand.name,
        slug: brand.slug,
        isFeatured: brand.isFeatured ?? false,
      },
      update: {
        name: brand.name,
        isFeatured: brand.isFeatured ?? false,
      },
    });
  }
}

async function seedInventoryLocations() {
  await prisma.inventoryLocation.upsert({
    where: { code: "main" },
    create: {
      name: "Main Warehouse",
      code: "main",
      isActive: true,
    },
    update: {
      name: "Main Warehouse",
      isActive: true,
    },
  });
}

async function seedShippingRates() {
  for (const rate of shippingRates) {
    await prisma.shippingRate.upsert({
      where: { code: rate.code },
      create: {
        code: rate.code,
        label: rate.label,
        amount: rate.amount,
        freeOverAmount: rate.freeOverAmount ?? null,
        isDefault: rate.isDefault ?? false,
        isActive: rate.isActive ?? true,
        sortOrder: rate.sortOrder ?? 0,
      },
      update: {
        label: rate.label,
        amount: rate.amount,
        freeOverAmount: rate.freeOverAmount ?? null,
        isDefault: rate.isDefault ?? false,
        isActive: rate.isActive ?? true,
        sortOrder: rate.sortOrder ?? 0,
      },
    });
  }
}

export async function seedEcommerce() {
  const attributeBySlug = await seedAttributes();
  const categoryBySlug = await seedCategories();
  await seedCategoryTemplates(categoryBySlug, attributeBySlug);
  await seedBrands();
  await seedInventoryLocations();
  await seedShippingRates();
}

if (import.meta.main) {
  await seedEcommerce();
  console.log("Ecommerce seed completed");
  await prisma.$disconnect();
}
