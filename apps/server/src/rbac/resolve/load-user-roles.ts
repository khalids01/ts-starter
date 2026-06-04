import prisma from "@db";
import type { RoleSlug } from "@rbac";

export type UserRoleSummary = {
  slug: RoleSlug;
  name: string;
};

export async function loadUserRoles(
  userId: string,
): Promise<UserRoleSummary[]> {
  const assignments = await prisma.rbacUserRole.findMany({
    where: { userId },
    select: {
      role: {
        select: {
          slug: true,
          name: true,
        },
      },
    },
  });

  return assignments.map((assignment) => ({
    slug: assignment.role.slug as RoleSlug,
    name: assignment.role.name,
  }));
}
