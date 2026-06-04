export * from "../prisma/generated/client";
export {
  assignUserRole,
  countActivePlatformOwners,
  getPrimaryRoleSlug,
  getRoleIdBySlug,
  hasPlatformOwner,
} from "./rbac/assignments.ts";
export { default } from "./client.ts";
export { default as prisma } from "./client.ts";
