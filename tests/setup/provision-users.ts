/**
 * Guarded E2E-only account and RBAC provisioning. Run only after the real
 * signup UI created every TEST_USERS account in the disposable E2E database.
 */
import { assertTestEnvironment, printValidatedTestEnvironment } from "./assert-test-environment";
import { TEST_USERS, type TestUser } from "../users-config";

const ECOMMERCE_MANAGER_PERMISSIONS = [
  "admin.access", "admin.catalog.read", "admin.catalog.manage", "admin.products.read",
  "admin.products.manage", "admin.inventory.read", "admin.inventory.manage", "admin.orders.read",
  "admin.orders.manage", "admin.orders.fulfill", "admin.orders.cancel", "admin.orders.refund",
  "admin.shipping.read", "admin.shipping.manage", "admin.discounts.read", "admin.discounts.manage",
  "admin.store_settings.read", "admin.store_settings.manage", "admin.customers.read",
  "admin.customers.manage", "admin.images.read", "admin.images.manage",
];

const ECOMMERCE_VIEWER_PERMISSIONS = [
  "admin.access", "admin.catalog.read", "admin.products.read", "admin.inventory.read",
  "admin.orders.read", "admin.shipping.read", "admin.discounts.read", "admin.store_settings.read",
  "admin.customers.read", "admin.images.read",
];

type CustomRoleDefinition = {
  slug: "custom.ecommerce_manager" | "custom.ecommerce_viewer";
  name: string;
  permissions: readonly string[];
};

const CUSTOM_ROLES: readonly CustomRoleDefinition[] = [
  {
    slug: "custom.ecommerce_manager",
    name: "Ecommerce Manager",
    permissions: ECOMMERCE_MANAGER_PERMISSIONS,
  },
  {
    slug: "custom.ecommerce_viewer",
    name: "Ecommerce Viewer",
    permissions: ECOMMERCE_VIEWER_PERMISSIONS,
  },
];

async function loadRbacDependencies() {
  const [database, roles, assignments, cache] = await Promise.all([
    import("../../packages/db/src/client.server"),
    import("../../packages/db/src/rbac/roles.server"),
    import("../../packages/db/src/rbac/assignments.server"),
    import("../../packages/db/src/rbac/cache/invalidate.server"),
  ]);
  return { prisma: database.default, ...roles, ...assignments, ...cache };
}

export async function resetE2eUsers() {
  printValidatedTestEnvironment(assertTestEnvironment());
  const { prisma } = await loadRbacDependencies();
  const expectedEmails = Object.values(TEST_USERS).map(({ email }) => email);
  const result = await prisma.user.deleteMany({
    where: { email: { in: expectedEmails } },
  });
  console.log(`Removed ${result.count} configured E2E users.`);
}

async function ensureCustomRole(
  dependencies: Awaited<ReturnType<typeof loadRbacDependencies>>,
  definition: CustomRoleDefinition,
) {
  const { prisma, createCustomRole, replaceRolePermissions, invalidateRole } = dependencies;
  const existing = await prisma.rbacRole.findUnique({
    where: { slug: definition.slug },
    select: { id: true, name: true, isSystem: true, isProtected: true },
  });

  if (existing?.isSystem || existing?.isProtected) {
    throw new Error(`E2E role ${definition.slug} must be a mutable custom role`);
  }

  const role = existing
    ? existing
    : await createCustomRole({
        slug: definition.slug,
        name: definition.name,
        permissions: definition.permissions as never,
      });

  if (existing && existing.name !== definition.name) {
    await prisma.rbacRole.update({
      where: { id: existing.id },
      data: { name: definition.name },
    });
  }

  await replaceRolePermissions(role.id, definition.permissions as never);
  const userIds = await prisma.rbacUserRole.findMany({
    where: { roleId: role.id },
    select: { userId: true },
  });
  await invalidateRole(role.id, userIds.map(({ userId }) => userId));
}

async function findConfiguredUsers(
  prisma: Awaited<ReturnType<typeof loadRbacDependencies>>["prisma"],
): Promise<Map<string, { id: string; email: string }>> {
  const expectedEmails = Object.values(TEST_USERS).map(({ email }) => email);
  const users = await prisma.user.findMany({
    where: { email: { in: expectedEmails } },
    select: { id: true, email: true },
  });
  const byEmail = new Map(users.map((user) => [user.email, user]));

  for (const email of expectedEmails) {
    if (!byEmail.has(email)) {
      throw new Error(`Configured E2E account was not created through signup: ${email}`);
    }
  }
  return byEmail;
}

async function markVerifiedAndAssign(
  dependencies: Awaited<ReturnType<typeof loadRbacDependencies>>,
  user: TestUser,
  userId: string,
) {
  const { prisma, assignUserRole } = dependencies;
  await prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });
  await assignUserRole(userId, user.roleSlug, {
    allowOwnerAssignment: user.key === "owner",
  });
}

export async function provisionE2eUsers() {
  printValidatedTestEnvironment(assertTestEnvironment());
  const dependencies = await loadRbacDependencies();
  const usersByEmail = await findConfiguredUsers(dependencies.prisma);

  for (const role of CUSTOM_ROLES) {
    await ensureCustomRole(dependencies, role);
  }

  for (const user of Object.values(TEST_USERS)) {
    const account = usersByEmail.get(user.email);
    if (!account) throw new Error(`Missing configured account: ${user.key}`);
    await markVerifiedAndAssign(dependencies, user, account.id);
  }

  console.log(`Provisioned ${Object.keys(TEST_USERS).length} configured E2E users.`);
}

if (import.meta.main) {
  await provisionE2eUsers();
}

export {
  CUSTOM_ROLES,
  ECOMMERCE_MANAGER_PERMISSIONS,
  ECOMMERCE_VIEWER_PERMISSIONS,
};
