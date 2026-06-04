import { assignUserRole as dbAssignUserRole } from "@db/rbac/assignments";
import type { RoleSlug } from "@rbac";

import { invalidateUser } from "./cache/invalidate";

export async function assignUserRoleAndInvalidate(
  userId: string,
  slug: RoleSlug,
) {
  await dbAssignUserRole(userId, slug);
  await invalidateUser(userId);
}
