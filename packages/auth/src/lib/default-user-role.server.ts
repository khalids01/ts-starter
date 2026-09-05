import type { BetterAuthPlugin, User } from "better-auth";
import {
  assignUserRole,
  hasRoleAssignment,
} from "../../../db/src/rbac/assignments.server";
import { Roles } from "@rbac";

type AuthUser = Partial<User> & {
  id?: string;
};

type AssignUserRole = typeof assignUserRole;
type HasRoleAssignment = typeof hasRoleAssignment;

type AuthSession = {
  userId?: string;
};

async function assignDefaultUserRole(
  user: AuthUser,
  assignRole: AssignUserRole,
  hasRole: HasRoleAssignment,
) {
  if (!user.id) {
    return;
  }

  if (await hasRole(user.id)) {
    return;
  }

  await assignRole(user.id, Roles.PlatformUser);
}

export function defaultUserRoleOnSignup(
  assignRole: AssignUserRole = assignUserRole,
  hasRole: HasRoleAssignment = hasRoleAssignment,
): BetterAuthPlugin {
  return {
    id: "default-user-role-on-signup",
    init() {
      return {
        options: {
          databaseHooks: {
            session: {
              create: {
                after: (session: AuthSession) =>
                  assignDefaultUserRole(
                    { id: session.userId },
                    assignRole,
                    hasRole,
                  ),
              },
            },
          },
        },
      };
    },
  };
}
