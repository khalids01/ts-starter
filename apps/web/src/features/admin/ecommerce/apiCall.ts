import { client } from "@/lib/client";

const api = client ;

async function unwrap<T>(request: Promise<{ data?: T; error?: any }>, fallback: string) {
  const { data, error } = await request;
  if (error) {
    throw new Error(String(error.value?.message || error.message || fallback));
  }
  return data as T;
}

export const ecommerceApi = {
  catalog: {
    categories: (query?: Record<string, unknown>) =>
      unwrap(api.admin.catalog.categories.get({ query }), "Failed to load categories"),
    category: (id: string) =>
      unwrap(api.admin.catalog.categories({ id }).get(), "Failed to load category"),
    template: (id: string) =>
      unwrap(api.admin.catalog.categories({ id }).template.get(), "Failed to load template"),
    createCategory: (body: Record<string, unknown>) =>
      unwrap(api.admin.catalog.categories.post(body), "Failed to create category"),
    updateCategory: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.catalog.categories({ id }).patch(body), "Failed to update category"),
    disableCategory: (id: string) =>
      unwrap(api.admin.catalog.categories({ id }).delete(), "Failed to disable category"),
    attributes: (query?: Record<string, unknown>) =>
      unwrap(api.admin.catalog.attributes.get({ query }), "Failed to load attributes"),
    createAttribute: (body: Record<string, unknown>) =>
      unwrap(api.admin.catalog.attributes.post(body), "Failed to create attribute"),
    updateAttribute: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.catalog.attributes({ id }).patch(body), "Failed to update attribute"),
    upsertAttributeValue: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.catalog.attributes({ id }).values.post(body), "Failed to save value"),
    assignCategoryAttribute: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.catalog.categories({ id }).attributes.post(body), "Failed to assign attribute"),
    updateCategoryAttribute: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.catalog["category-attributes"]({ id }).patch(body), "Failed to update template field"),
    deleteCategoryAttribute: (id: string) =>
      unwrap(api.admin.catalog["category-attributes"]({ id }).delete(), "Failed to remove template field"),
    brands: (query?: Record<string, unknown>) =>
      unwrap(api.admin.catalog.brands.get({ query }), "Failed to load brands"),
    createBrand: (body: Record<string, unknown>) =>
      unwrap(api.admin.catalog.brands.post(body), "Failed to create brand"),
    updateBrand: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.catalog.brands({ id }).patch(body), "Failed to update brand"),
    disableBrand: (id: string) =>
      unwrap(api.admin.catalog.brands({ id }).delete(), "Failed to disable brand"),
  },
  products: {
    list: (query?: Record<string, unknown>) =>
      unwrap(api.admin.products.get({ query }), "Failed to load products"),
    detail: (id: string) =>
      unwrap(api.admin.products({ id }).get(), "Failed to load product"),
    create: (body: Record<string, unknown>) =>
      unwrap(api.admin.products.post(body), "Failed to create product"),
    update: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.products({ id }).patch(body), "Failed to update product"),
    archive: (id: string) =>
      unwrap(api.admin.products({ id }).delete(), "Failed to archive product"),
    saveAttributes: (id: string, assignments: unknown[]) =>
      unwrap(api.admin.products({ id }).attributes.put({ assignments }), "Failed to save specs"),
    saveVariants: (id: string, variants: unknown[]) =>
      unwrap(api.admin.products({ id }).variants.put({ variants }), "Failed to save variants"),
    saveHighlights: (id: string, highlights: unknown[]) =>
      unwrap(api.admin.products({ id }).highlights.put({ highlights }), "Failed to save highlights"),
    validate: (id: string) =>
      unwrap(api.admin.products({ id }).validate.post(), "Failed to validate product"),
  },
  inventory: {
    suppliers: (query?: Record<string, unknown>) =>
      unwrap(api.admin.inventory.suppliers.get({ query }), "Failed to load suppliers"),
    createSupplier: (body: Record<string, unknown>) =>
      unwrap(api.admin.inventory.suppliers.post(body), "Failed to create supplier"),
    updateSupplier: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.inventory.suppliers({ id }).patch(body), "Failed to update supplier"),
    disableSupplier: (id: string) =>
      unwrap(api.admin.inventory.suppliers({ id }).delete(), "Failed to disable supplier"),
    locations: (query?: Record<string, unknown>) =>
      unwrap(api.admin.inventory.locations.get({ query }), "Failed to load locations"),
    createLocation: (body: Record<string, unknown>) =>
      unwrap(api.admin.inventory.locations.post(body), "Failed to create location"),
    updateLocation: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.inventory.locations({ id }).patch(body), "Failed to update location"),
    disableLocation: (id: string) =>
      unwrap(api.admin.inventory.locations({ id }).delete(), "Failed to disable location"),
    stocks: (query?: Record<string, unknown>) =>
      unwrap(api.admin.inventory.stocks.get({ query }), "Failed to load stock"),
    movements: (query?: Record<string, unknown>) =>
      unwrap(api.admin.inventory.movements.get({ query }), "Failed to load movements"),
    receive: (body: Record<string, unknown>) =>
      unwrap(api.admin.inventory.receive.post(body), "Failed to receive stock"),
    adjust: (body: Record<string, unknown>) =>
      unwrap(api.admin.inventory.adjust.post(body), "Failed to adjust stock"),
  },
};
