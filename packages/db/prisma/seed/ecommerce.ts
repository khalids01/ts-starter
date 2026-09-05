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

type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  brandSlug?: string;
  coverImageUrl: string;
  badgeLabel?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  searchKeywords: string[];
  attributes: Record<string, { value?: string; text?: string; number?: string }>;
  highlights: Array<{ title: string; description: string }>;
  variants: Array<{
    sku: string;
    name: string;
    price: string;
    compareAtPrice?: string;
    costPrice?: string;
    weightValue?: string;
    weightUnit?: "g" | "kg" | "lb" | "oz";
    attributes: Record<string, string>;
    quantity: number;
  }>;
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

const products: ProductSeed[] = [
  {
    slug: "samsung-galaxy-a55-5g",
    name: "Samsung Galaxy A55 5G",
    description: "A balanced 5G smartphone with a vivid display, capable camera, and practical storage options.",
    categorySlug: "phones",
    brandSlug: "samsung",
    coverImageUrl: "/ecommerce/images/slider2.jpg",
    badgeLabel: "Popular",
    isFeatured: true,
    isTrending: true,
    searchKeywords: ["phone", "android", "5g", "samsung", "galaxy"],
    attributes: {
      processor: { text: "Exynos 1480" },
      camera: { text: "50 MP main camera" },
      "display-size": { number: "6.6" },
      warranty: { number: "12" },
    },
    highlights: [
      { title: "Everyday performance", description: "Responsive performance for work, entertainment, and daily apps." },
      { title: "Flexible storage", description: "Choose the storage option that suits your needs." },
    ],
    variants: [
      {
        sku: "SAMSUNG-A55-8-128-BLK",
        name: "8 GB / 128 GB / Black",
        price: "49990.00",
        compareAtPrice: "52990.00",
        costPrice: "44500.00",
        attributes: { ram: "8gb", storage: "128gb", color: "black" },
        quantity: 18,
      },
      {
        sku: "SAMSUNG-A55-8-256-BLU",
        name: "8 GB / 256 GB / Blue",
        price: "55990.00",
        costPrice: "50000.00",
        attributes: { ram: "8gb", storage: "256gb", color: "blue" },
        quantity: 12,
      },
    ],
  },
  {
    slug: "dell-inspiron-15",
    name: "Dell Inspiron 15",
    description: "A dependable laptop configuration for study, office work, and everyday productivity.",
    categorySlug: "laptops",
    brandSlug: "dell",
    coverImageUrl: "/ecommerce/images/slider1.jpg",
    badgeLabel: "Work ready",
    isFeatured: true,
    searchKeywords: ["laptop", "dell", "inspiron", "office", "student"],
    attributes: {
      processor: { text: "Intel Core i5" },
      "display-size": { number: "15.6" },
      warranty: { number: "12" },
    },
    highlights: [
      { title: "Productivity focused", description: "A practical configuration for documents, browsing, and meetings." },
      { title: "Room to grow", description: "Generous memory and storage for everyday workloads." },
    ],
    variants: [
      {
        sku: "DELL-INS15-16-512-BLK",
        name: "16 GB / 512 GB / Black",
        price: "78990.00",
        compareAtPrice: "82990.00",
        costPrice: "71000.00",
        attributes: { ram: "16gb", storage: "512gb", color: "black" },
        quantity: 8,
      },
    ],
  },
  {
    slug: "rajshahi-premium-mango",
    name: "Rajshahi Premium Mango",
    description: "Fresh seasonal mangoes presented in convenient family-size packs.",
    categorySlug: "mango",
    coverImageUrl: "/ecommerce/icons/mango.png",
    badgeLabel: "Seasonal",
    isFeatured: true,
    isTrending: true,
    searchKeywords: ["mango", "fruit", "rajshahi", "fresh", "seasonal"],
    attributes: {
      origin: { value: "rajshahi" },
      grade: { value: "premium" },
    },
    highlights: [
      { title: "Selected quality", description: "Premium-grade fruit selected for a consistently enjoyable pack." },
      { title: "Fresh packs", description: "Stocked in practical pack sizes for home and gifting." },
    ],
    variants: [
      {
        sku: "MANGO-RAJ-PREM-1KG",
        name: "1 kg pack",
        price: "350.00",
        costPrice: "250.00",
        weightValue: "1",
        weightUnit: "kg",
        attributes: { "weight-pack": "1kg" },
        quantity: 40,
      },
      {
        sku: "MANGO-RAJ-PREM-5KG",
        name: "5 kg family box",
        price: "1590.00",
        compareAtPrice: "1750.00",
        costPrice: "1200.00",
        weightValue: "5",
        weightUnit: "kg",
        attributes: { "weight-pack": "5kg" },
        quantity: 16,
      },
    ],
  },
  {
    slug: "sundarbans-natural-honey",
    name: "Sundarbans Natural Honey",
    description: "A pantry-ready honey product offered in two useful pack sizes.",
    categorySlug: "honey",
    coverImageUrl: "/ecommerce/icons/groceries.png",
    badgeLabel: "Store pick",
    isFeatured: true,
    searchKeywords: ["honey", "sundarbans", "food", "natural", "pantry"],
    attributes: { origin: { value: "sundarbans" } },
    highlights: [
      { title: "Convenient sizes", description: "Choose a smaller jar or a family-size pack." },
      { title: "Simple pantry staple", description: "Suitable for drinks, breakfast, and everyday recipes." },
    ],
    variants: [
      {
        sku: "HONEY-SUN-500G",
        name: "500 g jar",
        price: "650.00",
        costPrice: "450.00",
        weightValue: "500",
        weightUnit: "g",
        attributes: { "weight-pack": "500g" },
        quantity: 25,
      },
      {
        sku: "HONEY-SUN-1KG",
        name: "1 kg jar",
        price: "1190.00",
        compareAtPrice: "1300.00",
        costPrice: "850.00",
        weightValue: "1",
        weightUnit: "kg",
        attributes: { "weight-pack": "1kg" },
        quantity: 14,
      },
    ],
  },
  {
    slug: "xiaomi-wireless-earbuds",
    name: "Xiaomi Wireless Earbuds",
    description: "Compact wireless earbuds for calls, music, and everyday listening.",
    categorySlug: "generic-gadget",
    brandSlug: "xiaomi",
    coverImageUrl: "/ecommerce/images/slider2.jpg",
    badgeLabel: "Everyday gadget",
    searchKeywords: ["earbuds", "wireless", "audio", "xiaomi", "gadget"],
    attributes: { warranty: { number: "6" } },
    highlights: [
      { title: "Wireless listening", description: "A compact everyday audio option for music and calls." },
    ],
    variants: [
      {
        sku: "XIAOMI-EARBUDS-BLK",
        name: "Black",
        price: "2490.00",
        costPrice: "1800.00",
        attributes: { color: "black" },
        quantity: 24,
      },
      {
        sku: "XIAOMI-EARBUDS-WHT",
        name: "White",
        price: "2490.00",
        costPrice: "1800.00",
        attributes: { color: "white" },
        quantity: 20,
      },
    ],
  },
  {
    slug: "premium-aromatic-rice",
    name: "Premium Aromatic Rice",
    description: "A pantry staple packed for convenient everyday cooking.",
    categorySlug: "packaged-food",
    coverImageUrl: "/ecommerce/icons/groceries.png",
    badgeLabel: "Pantry essential",
    searchKeywords: ["rice", "food", "pantry", "aromatic", "grocery"],
    attributes: {},
    highlights: [
      { title: "Convenient pack", description: "A practical family-size pack for regular meals." },
    ],
    variants: [
      {
        sku: "RICE-AROMATIC-5KG",
        name: "5 kg pack",
        price: "890.00",
        costPrice: "720.00",
        weightValue: "5",
        weightUnit: "kg",
        attributes: { "weight-pack": "5kg" },
        quantity: 30,
      },
    ],
  },
  {
    slug: "everyday-value-pack",
    name: "Everyday Value Pack",
    description: "A simple example product demonstrating the reusable generic catalog template.",
    categorySlug: "generic-product",
    coverImageUrl: "/ecommerce/images/slider1.jpg",
    searchKeywords: ["generic", "value", "example", "product"],
    attributes: {},
    highlights: [
      { title: "Reusable template", description: "A ready-to-edit example for a simple product catalog." },
    ],
    variants: [
      {
        sku: "GENERIC-VALUE-1KG",
        name: "1 kg pack",
        price: "199.00",
        costPrice: "140.00",
        weightValue: "1",
        weightUnit: "kg",
        attributes: { "weight-pack": "1kg" },
        quantity: 20,
      },
    ],
  },
];

function readOption(name: string) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((argument) => argument.startsWith(prefix));
  if (inline) {
    return inline.slice(prefix.length);
  }
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function categoryIsWithin(categorySlug: string, rootSlug: string) {
  let current = categories.find((category) => category.slug === categorySlug);
  while (current) {
    if (current.slug === rootSlug) {
      return true;
    }
    current = current.parentSlug
      ? categories.find((category) => category.slug === current?.parentSlug)
      : undefined;
  }
  return false;
}

function ecommerceSeedSelection(requestedCatalog?: string) {
  const catalog = (requestedCatalog ?? "all").trim().toLowerCase();
  const validCatalogs = new Set(["all", ...categories.map((category) => category.slug)]);
  if (!validCatalogs.has(catalog)) {
    throw new Error(
      `Unknown ecommerce catalog "${catalog}". Choose one of: ${[...validCatalogs].join(", ")}`,
    );
  }

  const selectedCategories =
    catalog === "all"
      ? [...categories]
      : categories.filter((category) => categoryIsWithin(category.slug, catalog));
  const categorySlugs = new Set(selectedCategories.map((category) => category.slug));

  if (catalog !== "all") {
    let current = categories.find((category) => category.slug === catalog);
    while (current?.parentSlug) {
      const parent = categories.find((category) => category.slug === current?.parentSlug);
      if (!parent) break;
      categorySlugs.add(parent.slug);
      current = parent;
    }
  }

  const selectedProducts = products.filter(
    (product) => catalog === "all" || categoryIsWithin(product.categorySlug, catalog),
  );
  const attributeSlugs = new Set<string>();
  for (const categorySlug of categorySlugs) {
    for (const template of categoryTemplates[categorySlug] ?? []) {
      attributeSlugs.add(template.attributeSlug);
    }
  }
  for (const product of selectedProducts) {
    Object.keys(product.attributes).forEach((slug) => attributeSlugs.add(slug));
    product.variants.forEach((variant) =>
      Object.keys(variant.attributes).forEach((slug) => attributeSlugs.add(slug)),
    );
  }

  return {
    catalog,
    categories: categories.filter((category) => categorySlugs.has(category.slug)),
    attributes: attributes.filter((attribute) => attributeSlugs.has(attribute.slug)),
    products: selectedProducts,
    brandSlugs: new Set(selectedProducts.flatMap((product) => product.brandSlug ?? [])),
  };
}

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

type SavedAttribute = {
  id: string;
  values: Map<string, string>;
};

async function seedAttributes(selectedAttributes: AttributeSeed[]) {
  const saved = new Map<string, SavedAttribute>();

  for (const attribute of selectedAttributes) {
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

    const savedAttribute: SavedAttribute = { id: row.id, values: new Map() };
    saved.set(attribute.slug, savedAttribute);

    for (const [index, value] of (attribute.values ?? []).entries()) {
      const savedValue = await prisma.productAttributeValue.upsert({
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
        select: { id: true },
      });
      savedAttribute.values.set(value.value, savedValue.id);
    }
  }

  return saved;
}

async function seedCategories(selectedCategories: CategorySeed[]) {
  const saved = new Map<string, { id: string }>();

  for (const category of selectedCategories) {
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
  attributeBySlug: Map<string, SavedAttribute>,
) {
  for (const [categorySlug, template] of Object.entries(categoryTemplates)) {
    const category = categoryBySlug.get(categorySlug);
    if (!category) {
      continue;
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

async function seedBrands(selectedBrandSlugs: Set<string>) {
  const saved = new Map<string, { id: string }>();
  for (const brand of brands.filter((item) => selectedBrandSlugs.has(item.slug))) {
    const row = await prisma.productBrand.upsert({
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
      select: { id: true },
    });
    saved.set(brand.slug, row);
  }
  return saved;
}

async function seedInventoryLocations() {
  return prisma.inventoryLocation.upsert({
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
    select: { id: true },
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

function requiredSeedEntry<T>(value: T | undefined, message: string): T {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

async function seedProducts(
  selectedProducts: ProductSeed[],
  categoryBySlug: Map<string, { id: string }>,
  attributeBySlug: Map<string, SavedAttribute>,
  brandBySlug: Map<string, { id: string }>,
  location: { id: string },
) {
  for (const item of selectedProducts) {
    const category = requiredSeedEntry(
      categoryBySlug.get(item.categorySlug),
      `Missing seeded category: ${item.categorySlug}`,
    );
    const brand = item.brandSlug
      ? requiredSeedEntry(
          brandBySlug.get(item.brandSlug),
          `Missing seeded brand: ${item.brandSlug}`,
        )
      : undefined;

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        categoryId: category.id,
        brandId: brand?.id,
        status: "active",
        isActive: true,
        isFeatured: item.isFeatured ?? false,
        isTrending: item.isTrending ?? false,
        badgeLabel: item.badgeLabel,
        coverImageUrl: item.coverImageUrl,
        searchKeywords: item.searchKeywords,
        seoTitle: item.name,
        seoDescription: item.description,
      },
      update: {
        name: item.name,
        description: item.description,
        categoryId: category.id,
        brandId: brand?.id ?? null,
        status: "active",
        isActive: true,
        isFeatured: item.isFeatured ?? false,
        isTrending: item.isTrending ?? false,
        badgeLabel: item.badgeLabel ?? null,
        coverImageUrl: item.coverImageUrl,
        searchKeywords: item.searchKeywords,
        seoTitle: item.name,
        seoDescription: item.description,
      },
      select: { id: true },
    });

    for (const [attributeSlug, input] of Object.entries(item.attributes)) {
      const attribute = requiredSeedEntry(
        attributeBySlug.get(attributeSlug),
        `Missing seeded attribute: ${attributeSlug}`,
      );
      const valueId = input.value
        ? requiredSeedEntry(
            attribute.values.get(input.value),
            `Missing seeded attribute value: ${attributeSlug}.${input.value}`,
          )
        : undefined;

      await prisma.productAttributeAssignment.upsert({
        where: {
          productId_attributeId: {
            productId: product.id,
            attributeId: attribute.id,
          },
        },
        create: {
          productId: product.id,
          attributeId: attribute.id,
          attributeValueId: valueId,
          rawText: input.text,
          rawNumber: input.number,
        },
        update: {
          attributeValueId: valueId ?? null,
          rawText: input.text ?? null,
          rawNumber: input.number ?? null,
          rawBoolean: null,
          rawDate: null,
        },
      });
    }

    await prisma.productHighlight.deleteMany({ where: { productId: product.id } });
    await prisma.productHighlight.createMany({
      data: item.highlights.map((highlight, index) => ({
        productId: product.id,
        title: highlight.title,
        description: highlight.description,
        sortOrder: index,
      })),
    });

    for (const [index, variantInput] of item.variants.entries()) {
      const snapshot: Record<string, string> = {};
      const valueIds: string[] = [];
      for (const [attributeSlug, value] of Object.entries(variantInput.attributes)) {
        const attribute = requiredSeedEntry(
          attributeBySlug.get(attributeSlug),
          `Missing seeded attribute: ${attributeSlug}`,
        );
        valueIds.push(
          requiredSeedEntry(
            attribute.values.get(value),
            `Missing seeded attribute value: ${attributeSlug}.${value}`,
          ),
        );
        snapshot[attributeSlug] = value;
      }

      const variant = await prisma.productVariant.upsert({
        where: { sku: variantInput.sku },
        create: {
          productId: product.id,
          sku: variantInput.sku,
          name: variantInput.name,
          attributesSnapshot: snapshot,
          price: variantInput.price,
          compareAtPrice: variantInput.compareAtPrice,
          costPrice: variantInput.costPrice,
          isDefault: index === 0,
          isActive: true,
          imageUrls: [item.coverImageUrl],
          weightValue: variantInput.weightValue,
          weightUnit: variantInput.weightUnit,
        },
        update: {
          productId: product.id,
          name: variantInput.name,
          attributesSnapshot: snapshot,
          price: variantInput.price,
          compareAtPrice: variantInput.compareAtPrice ?? null,
          costPrice: variantInput.costPrice ?? null,
          isDefault: index === 0,
          isActive: true,
          imageUrls: [item.coverImageUrl],
          weightValue: variantInput.weightValue ?? null,
          weightUnit: variantInput.weightUnit ?? null,
        },
        select: { id: true },
      });

      await prisma.productVariantAttributeValue.deleteMany({
        where: { variantId: variant.id },
      });
      await prisma.productVariantAttributeValue.createMany({
        data: valueIds.map((attributeValueId) => ({
          variantId: variant.id,
          attributeValueId,
        })),
      });

      const stockKey = `${variant.id}:${location.id}:no_batch`;
      await prisma.inventoryStock.upsert({
        where: { stockKey },
        create: {
          stockKey,
          variantId: variant.id,
          locationId: location.id,
          quantityOnHand: variantInput.quantity,
          quantityReserved: 0,
          reorderLevel: 5,
        },
        update: {
          reorderLevel: 5,
        },
      });
    }
  }
}

export async function seedEcommerce(requestedCatalog?: string) {
  const selection = ecommerceSeedSelection(
    requestedCatalog ?? readOption("catalog") ?? process.env.ECOMMERCE_SEED_CATALOG,
  );
  const attributeBySlug = await seedAttributes(selection.attributes);
  const categoryBySlug = await seedCategories(selection.categories);
  await seedCategoryTemplates(categoryBySlug, attributeBySlug);
  const brandBySlug = await seedBrands(selection.brandSlugs);
  const location = await seedInventoryLocations();
  await seedShippingRates();
  await seedProducts(
    selection.products,
    categoryBySlug,
    attributeBySlug,
    brandBySlug,
    location,
  );
  console.log(
    `Seeded ecommerce catalog "${selection.catalog}": ${selection.categories.length} categories, ${selection.products.length} products.`,
  );
}

if (import.meta.main) {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log("Usage: bun db:seed:ecommerce [--catalog all|gadgets|phones|laptops|food|fresh-fruit|mango|honey|packaged-food|generic-gadget|generic-product]");
  } else {
    try {
      await seedEcommerce();
      console.log("Ecommerce seed completed");
    } finally {
      await prisma.$disconnect();
    }
  }
}
