import { Elysia } from "elysia";
import { rolesGuard } from "@/guards/roles.guard";
import { usersService } from "./users.service";
import {
  UserQueryDto,
  UpdateUserDto,
  BanUserDto,
  InviteUserDto,
} from "./users.dto";
import { auth } from "@/modules/auth/auth.service";

export const usersController = new Elysia({
  prefix: "/admin/users",
  detail: {
    tags: ["Admin - Users"],
  },
}).guard(
  {
    beforeHandle: rolesGuard(["ADMIN", "OWNER"]),
  },
  (app) =>
    app
      .get("/", ({ query }) => usersService.listUsers(query), {
        query: UserQueryDto,
        detail: {
          summary: "List all users with pagination and filters",
        },
      })
      .get(
        "/:id",
        async ({ params: { id }, set }) => {
          const user = await usersService.getUserById(id);
          if (!user) {
            set.status = 404;
            return "User not found";
          }
          return user;
        },
        {
          detail: {
            summary: "Get detailed information about a user",
          },
        },
      )
      .get(
        "/:id/sessions",
        async ({ params: { id } }) => {
          return await usersService.getUserSessions(id);
        },
        {
          detail: {
            summary: "Get active sessions for a user",
          },
        },
      )
      .patch(
        "/:id",
        async ({ params: { id }, body, request, set }) => {
          try {
            const session = await auth.api.getSession({
              headers: request.headers,
            });
            return await usersService.updateUser(id, body, session?.user.id);
          } catch (e: any) {
            set.status = 400;
            return e.message;
          }
        },
        {
          body: UpdateUserDto,
          detail: {
            summary: "Update user details (name, role)",
          },
        },
      )
      .post(
        "/:id/ban",
        async ({ params: { id }, body, request }) => {
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          return usersService.banUser(id, body.reason, session?.user.id);
        },
        {
          body: BanUserDto,
          detail: {
            summary: "Ban a user from the system",
          },
        },
      )
      .post(
        "/:id/unban",
        async ({ params: { id }, request }) => {
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          return usersService.unbanUser(id, session?.user.id);
        },
        {
          detail: {
            summary: "Unban a user",
          },
        },
      )
      .post(
        "/:id/archive",
        async ({ params: { id }, request }) => {
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          return usersService.archiveUser(id, session?.user.id);
        },
        {
          detail: {
            summary: "Archive a user (soft delete)",
          },
        },
      )
      .post(
        "/:id/restore",
        async ({ params: { id }, request }) => {
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          return usersService.restoreUser(id, session?.user.id);
        },
        {
          detail: {
            summary: "Restore an archived user",
          },
        },
      )
      .delete(
        "/:id",
        ({ params: { id } }) => usersService.deleteUserPermanent(id),
        {
          detail: {
            summary: "Permanently delete a user from the database",
          },
        },
      )
      .post(
        "/invite",
        async ({ body, request, set }) => {
          const session = await auth.api.getSession({
            headers: request.headers,
          });
          if (!session) {
            set.status = 401;
            return "Unauthorized";
          }
          try {
            return await usersService.inviteUser(
              body.email,
              body.role || "USER",
              session.user.id,
            );
          } catch (e: any) {
            set.status = 400;
            return e.message;
          }
        },
        {
          body: InviteUserDto,
          detail: {
            summary: "Invite a new user via email",
          },
        },
      ),
);
