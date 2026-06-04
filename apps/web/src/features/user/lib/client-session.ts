export type SessionRole = {
  slug: string;
  name: string;
};

export type ClientSessionUser = {
  id: string;
  name: string;
  email: string;
  onboardingComplete: boolean;
  plan: string | null;
  subscriptionStatus: string | null;
};

export type ClientSession = {
  user: ClientSessionUser;
  permissions: string[];
  roles: SessionRole[];
  primaryRoleSlug: string;
} | null;
