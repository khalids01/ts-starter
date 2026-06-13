export const queryKeys = {
  owner: {
    setupStatus: () => ["owner-status"] as const,
  },
  admin: {
    overview: () => ["admin-overview"] as const,
    rateLimit: () => ["admin-rate-limit"] as const,
    feedback: (page: number) => ["admin-feedback", page] as const,
    activity: {
      list: (params: {
        page: number;
        limit: number;
        type: string;
        severity: "all" | "info" | "warning" | "error";
      }) => ["admin-activity", params] as const,
    },
    webhooks: {
      list: (params: {
        page: number;
        limit: number;
        status: "all" | "processing" | "processed" | "failed";
        eventType: string;
      }) => ["admin-webhooks", params] as const,
    },
    visitors: {
      overview: (params: {
        dateFrom: string;
        dateTo: string;
        segment: "humans" | "bots" | "all";
        type: "all" | "new" | "returning";
      }) => ["admin-visitors-overview", params] as const,
      list: (params: {
        dateFrom: string;
        dateTo: string;
        segment: "humans" | "bots" | "all";
        type: "all" | "new" | "returning";
        page: number;
        limit: number;
      }) => ["admin-visitors-list", params] as const,
    },
    roles: {
      all: () => ["admin-roles"] as const,
      list: () => [...queryKeys.admin.roles.all(), "list"] as const,
      detail: (roleId: string) => [...queryKeys.admin.roles.all(), roleId] as const,
      permissions: () => [...queryKeys.admin.roles.all(), "permissions"] as const,
      assignable: () => [...queryKeys.admin.roles.all(), "assignable"] as const,
    },
    users: {
      all: () => ["admin-users"] as const,
      list: (search: string) => [...queryKeys.admin.users.all(), search] as const,
      sessions: (userId: string) => ["user-sessions", userId] as const,
    },
    invitations: {
      all: () => ["admin-invitations"] as const,
      list: (params: {
        search: string;
        status: "all" | "accepted" | "pending";
        dateFrom: string;
        dateTo: string;
        page: number;
      }) => [...queryKeys.admin.invitations.all(), params] as const,
    },
    ecommerce: {
      catalog: {
        all: () => ["admin-ecommerce-catalog"] as const,
        categories: (params?: unknown) =>
          [...queryKeys.admin.ecommerce.catalog.all(), "categories", params] as const,
        category: (id: string) =>
          [...queryKeys.admin.ecommerce.catalog.all(), "category", id] as const,
        template: (id: string) =>
          [...queryKeys.admin.ecommerce.catalog.all(), "template", id] as const,
        attributes: (params?: unknown) =>
          [...queryKeys.admin.ecommerce.catalog.all(), "attributes", params] as const,
        brands: (params?: unknown) =>
          [...queryKeys.admin.ecommerce.catalog.all(), "brands", params] as const,
      },
      products: {
        all: () => ["admin-ecommerce-products"] as const,
        list: (params?: unknown) =>
          [...queryKeys.admin.ecommerce.products.all(), "list", params] as const,
        detail: (id: string) =>
          [...queryKeys.admin.ecommerce.products.all(), "detail", id] as const,
        validate: (id: string) =>
          [...queryKeys.admin.ecommerce.products.all(), "validate", id] as const,
      },
      inventory: {
        all: () => ["admin-ecommerce-inventory"] as const,
        stocks: (params?: unknown) =>
          [...queryKeys.admin.ecommerce.inventory.all(), "stocks", params] as const,
        movements: (params?: unknown) =>
          [...queryKeys.admin.ecommerce.inventory.all(), "movements", params] as const,
        suppliers: (params?: unknown) =>
          [...queryKeys.admin.ecommerce.inventory.all(), "suppliers", params] as const,
        locations: (params?: unknown) =>
          [...queryKeys.admin.ecommerce.inventory.all(), "locations", params] as const,
      },
    },
  },
  invitations: {
    detail: (invitationId: string) => ["invitation", invitationId] as const,
  },
} as const;
