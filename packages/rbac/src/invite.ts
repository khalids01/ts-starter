import { RoleDefinitions, Roles, type RoleSlug } from "./roles";

export const InviteableRoleSlugs = [
  Roles.PlatformUser,
  Roles.PlatformAdmin,
] as const satisfies readonly RoleSlug[];

export type InviteableRoleSlug = (typeof InviteableRoleSlugs)[number];

export function formatRoleLabel(slug: RoleSlug): string {
  return RoleDefinitions[slug]?.name ?? slug;
}

export function isInviteableRoleSlug(slug: string): slug is InviteableRoleSlug {
  return (InviteableRoleSlugs as readonly string[]).includes(slug);
}
