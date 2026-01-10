import { t } from "elysia";
import { Role } from "@db";

export const UserRoleSchema = t.Enum(Role);

export const UpdateUserDto = t.Object({
    name: t.Optional(t.String()),
    role: t.Optional(UserRoleSchema),
});

export const BanUserDto = t.Object({
    reason: t.Optional(t.String()),
});

export const InviteUserDto = t.Object({
    email: t.String({ format: "email" }),
    role: t.Optional(UserRoleSchema),
});

export const UserQueryDto = t.Object({
    page: t.Optional(t.Numeric({ default: 1 })),
    limit: t.Optional(t.Numeric({ default: 10 })),
    search: t.Optional(t.String()),
    role: t.Optional(UserRoleSchema),
    banned: t.Optional(t.Boolean()),
    archived: t.Optional(t.Boolean()),
});

export type UserQuery = typeof UserQueryDto.static;
export type UpdateUser = typeof UpdateUserDto.static;
export type BanUser = typeof BanUserDto.static;
export type InviteUser = typeof InviteUserDto.static;
