export const queryKeys = {
  owner: {
    setupStatus: () => ["owner-status"] as const,
  },
  admin: {
    overview: () => ["admin-overview"] as const,
    rateLimit: () => ["admin-rate-limit"] as const,
    feedback: () => ["admin-feedback"] as const,
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
  },
  invitations: {
    detail: (invitationId: string) => ["invitation", invitationId] as const,
  },
} as const;
