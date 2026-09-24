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
    deleteAttribute: (id: string) =>
      unwrap(api.admin.catalog.attributes({ id }).delete(), "Failed to delete attribute"),
    upsertAttributeValue: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.catalog.attributes({ id }).values.post(body), "Failed to save value"),
    updateAttributeValue: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.catalog["attribute-values"]({ id }).patch(body), "Failed to update attribute value"),
    deleteAttributeValue: (id: string) =>
      unwrap(api.admin.catalog["attribute-values"]({ id }).delete(), "Failed to delete attribute value"),
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
  shipping: {
    rates: (query?: Record<string, unknown>) =>
      unwrap(api.admin.shipping.rates.get({ query }), "Failed to load shipping rates"),
    createRate: (body: Record<string, unknown>) =>
      unwrap(api.admin.shipping.rates.post(body), "Failed to create shipping rate"),
    updateRate: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.shipping.rates({ id }).patch(body), "Failed to update shipping rate"),
    disableRate: (id: string) =>
      unwrap(api.admin.shipping.rates({ id }).delete(), "Failed to disable shipping rate"),
  },
  delivery: {
    providers: () =>
      unwrap(api.admin.delivery.providers.get(), "Failed to load courier providers"),
    connections: () =>
      unwrap(api.admin.delivery.connections.get(), "Failed to load courier connections"),
    createConnection: (body: Record<string, unknown>) =>
      unwrap(api.admin.delivery.connections.post(body as any), "Failed to create courier connection"),
    updateConnection: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.delivery.connections({ id }).patch(body as any), "Failed to update courier connection"),
    testConnection: (id: string) =>
      unwrap(api.admin.delivery.connections({ id }).test.post(), "Failed to test courier connection"),
    enableConnection: (id: string) =>
      unwrap(api.admin.delivery.connections({ id }).enable.post(), "Failed to enable courier connection"),
    disableConnection: (id: string) =>
      unwrap(api.admin.delivery.connections({ id }).disable.post(), "Failed to disable courier connection"),
    services: () =>
      unwrap(api.admin.delivery.services.get(), "Failed to load courier services"),
    createService: (body: Record<string, unknown>) =>
      unwrap(api.admin.delivery.services.post(body as any), "Failed to create courier service"),
    updateService: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.delivery.services({ id }).patch(body as any), "Failed to update courier service"),
    rules: () =>
      unwrap(api.admin.delivery["routing-rules"].get(), "Failed to load courier routing rules"),
    createRule: (body: Record<string, unknown>) =>
      unwrap(api.admin.delivery["routing-rules"].post(body as any), "Failed to create courier routing rule"),
    updateRule: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.delivery["routing-rules"]({ id }).patch(body as any), "Failed to update courier routing rule"),
    dispatches: () =>
      unwrap(api.admin.delivery.dispatches.get(), "Failed to load courier dispatches"),
    recommendation: (orderId: string) =>
      unwrap(api.admin.delivery.orders({ orderId }).recommendation.get(), "Failed to calculate courier recommendation"),
    tracking: (orderId: string) =>
      unwrap(api.admin.delivery.orders({ orderId }).tracking.get(), "Failed to load courier tracking"),
    confirmRoute: (orderId: string, body: Record<string, unknown>) =>
      unwrap(api.admin.delivery.orders({ orderId }).confirm.post(body as any), "Failed to confirm courier route"),
    queueDispatch: (id: string) =>
      unwrap(api.admin.delivery.dispatches({ id }).queue.post(), "Failed to queue courier dispatch"),
    markHandoff: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.delivery.consignments({ id }).handoff.post(body as any), "Failed to update courier handoff"),
    returns: () =>
      unwrap(api.admin.delivery.returns.get(), "Failed to load courier returns"),
    createReturn: (body: Record<string, unknown>) =>
      unwrap(api.admin.delivery.returns.post(body as any), "Failed to create courier return"),
    updateReturn: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.delivery.returns({ id }).patch(body as any), "Failed to update courier return"),
    settlements: () =>
      unwrap(api.admin.delivery.settlements.get(), "Failed to load courier settlements"),
    recordSettlement: (body: Record<string, unknown>) =>
      unwrap(api.admin.delivery.settlements.post(body as any), "Failed to record courier settlement"),
  },
  discounts: {
    list: (query?: Record<string, unknown>) =>
      unwrap(api.admin.discounts.get({ query }), "Failed to load discounts"),
    create: (body: Record<string, unknown>) =>
      unwrap(api.admin.discounts.post(body), "Failed to create discount"),
    update: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.discounts({ id }).patch(body), "Failed to update discount"),
    disable: (id: string) =>
      unwrap(api.admin.discounts({ id }).delete(), "Failed to disable discount"),
  },
  storeSettings: {
    get: () => unwrap(api.admin["store-settings"].get(), "Failed to load store settings"),
    update: (body: Record<string, unknown>) =>
      unwrap(api.admin["store-settings"].put(body), "Failed to update store settings"),
  },
  customers: {
    list: (query?: Record<string, unknown>) =>
      unwrap(api.admin.customers.get({ query }), "Failed to load customers"),
    detail: (id: string) =>
      unwrap(api.admin.customers({ id }).get(), "Failed to load customer"),
    update: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.customers({ id }).patch(body), "Failed to update customer"),
  },
  orders: {
    list: (query?: Record<string, unknown>) =>
      unwrap(api.admin.orders.get({ query }), "Failed to load orders"),
    detail: (id: string) =>
      unwrap(api.admin.orders({ id }).get(), "Failed to load order"),
    update: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.orders({ id }).patch(body), "Failed to update order"),
    updateStatuses: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.orders({ id }).status.patch(body), "Failed to update order statuses"),
    markShipped: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.orders({ id }).ship.post(body), "Failed to mark order shipped"),
    updateTracking: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.orders({ id }).tracking.patch(body), "Failed to update tracking"),
    markDelivered: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.orders({ id }).delivered.post(body), "Failed to mark order delivered"),
    cancel: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.orders({ id }).cancel.post(body), "Failed to cancel order"),
    recordRefund: (id: string, body: Record<string, unknown>) =>
      unwrap(api.admin.orders({ id }).refunds.post(body), "Failed to record refund"),
    releaseExpiredReservations: () =>
      unwrap(api.admin.orders["release-expired-reservations"].post(), "Failed to release expired reservations"),
  },
};
