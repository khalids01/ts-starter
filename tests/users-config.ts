/**
 * PUBLIC TEST DATA ONLY. These passwords are intentionally public, fictional
 * credentials for the disposable E2E environment. Never reuse them elsewhere.
 * Application code under apps/ and packages/ must never import this module.
 */

export type TestUserKey =
  | "owner"
  | "admin"
  | "commerceManager"
  | "commerceViewer"
  | "user";

export type TestUser = {
  key: TestUserKey;
  name: string;
  email: `${string}@${string}.example.test`;
  password: string;
  roleSlug: string;
  storageStatePath: string;
};

const storageStatePath = (key: TestUserKey) => `tests/e2e/.auth/${key}.json`;

export const TEST_USERS: Readonly<Record<TestUserKey, TestUser>> = {
  owner: {
    key: "owner",
    name: "Ayesha Rahman",
    email: "owner@northstar.example.test",
    password: "OwnerFlow!2026#A",
    roleSlug: "platform.owner",
    storageStatePath: storageStatePath("owner"),
  },
  admin: {
    key: "admin",
    name: "Tanvir Hasan",
    email: "admin@northstar.example.test",
    password: "AdminFlow!2026#T",
    roleSlug: "platform.admin",
    storageStatePath: storageStatePath("admin"),
  },
  commerceManager: {
    key: "commerceManager",
    name: "Farhana Islam",
    email: "manager@northstar.example.test",
    password: "ManagerFlow!2026#F",
    roleSlug: "custom.ecommerce_manager",
    storageStatePath: storageStatePath("commerceManager"),
  },
  commerceViewer: {
    key: "commerceViewer",
    name: "Arif Chowdhury",
    email: "viewer@northstar.example.test",
    password: "ViewerFlow!2026#A",
    roleSlug: "custom.ecommerce_viewer",
    storageStatePath: storageStatePath("commerceViewer"),
  },
  user: {
    key: "user",
    name: "Nusrat Jahan",
    email: "user@northstar.example.test",
    password: "CustomerFlow!2026#N",
    roleSlug: "platform.user",
    storageStatePath: storageStatePath("user"),
  },
};

export function getTestUser(key: TestUserKey): TestUser {
  return TEST_USERS[key];
}

export function assertTestUsersAreSafe(): void {
  for (const user of Object.values(TEST_USERS)) {
    if (!user.email.endsWith(".example.test")) {
      throw new Error(`Unsafe E2E email configured for ${user.key}`);
    }
    if (!user.storageStatePath.startsWith("tests/e2e/.auth/")) {
      throw new Error(`Unsafe storage-state path configured for ${user.key}`);
    }
  }
}

export type CheckoutProfile = {
  name: string;
  email: `${string}@${string}.example.test`;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: "BD";
};

export const AUTHENTICATED_SHOPPER: CheckoutProfile = {
  name: "Nusrat Jahan",
  email: TEST_USERS.user.email,
  phone: "+880 1712-345678",
  addressLine1: "42 Lake Circus",
  addressLine2: "Apartment 5B",
  city: "Dhaka",
  postalCode: "1205",
  country: "BD",
};

export const GUEST_SHOPPER: CheckoutProfile = {
  name: "Samiha Ahmed",
  email: "guest@northstar.example.test",
  phone: "+880 1812-345679",
  addressLine1: "18 CDA Avenue",
  addressLine2: "Block C",
  city: "Chattogram",
  postalCode: "4000",
  country: "BD",
};

export const BILLING_ALTERNATIVE: CheckoutProfile = {
  name: "Nusrat Jahan",
  email: TEST_USERS.user.email,
  phone: "+880 1912-345680",
  addressLine1: "7 Road 11",
  addressLine2: "House 14",
  city: "Dhaka",
  postalCode: "1212",
  country: "BD",
};
