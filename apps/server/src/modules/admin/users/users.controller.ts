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
import { AdminUserPolicyError } from "./users.service";

function getActor(session: Awaited<ReturnType<typeof auth.api.getSession>>) {
  return {
    id: session?.user.id,
    role: session?.user.role,
  };
}

function handleUserMutationError(error: unknown, set: { status?: number | string }) {
  if (error instanceof AdminUserPolicyError) {
    set.status = error.status;
    return error.message;
  }

  set.status = 400;
  return error instanceof Error ? error.message : "Failed to update user";
}

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
            return await usersService.updateUser(id, body, getActor(session));
          } catch (error) {
            return handleUserMutationError(error, set);
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
        async ({ params: { id }, body, request, set }) => {
          try {
            const session = await auth.api.getSession({
              headers: request.headers,
            });
            return await usersService.banUser(id, body.reason, getActor(session));
          } catch (error) {
            return handleUserMutationError(error, set);
          }
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
        async ({ params: { id }, request, set }) => {
          try {
            const session = await auth.api.getSession({
              headers: request.headers,
            });
            return await usersService.unbanUser(id, getActor(session));
          } catch (error) {
            return handleUserMutationError(error, set);
          }
        },
        {
          detail: {
            summary: "Unban a user",
          },
        },
      )
      .post(
        "/:id/archive",
        async ({ params: { id }, request, set }) => {
          try {
            const session = await auth.api.getSession({
              headers: request.headers,
            });
            return await usersService.archiveUser(id, getActor(session));
          } catch (error) {
            return handleUserMutationError(error, set);
          }
        },
        {
          detail: {
            summary: "Archive a user (soft delete)",
          },
        },
      )
      .post(
        "/:id/restore",
        async ({ params: { id }, request, set }) => {
          try {
            const session = await auth.api.getSession({
              headers: request.headers,
            });
            return await usersService.restoreUser(id, getActor(session));
          } catch (error) {
            return handleUserMutationError(error, set);
          }
        },
        {
          detail: {
            summary: "Restore an archived user",
          },
        },
      )
      .delete(
        "/:id",
        async ({ params: { id }, request, set }) => {
          try {
            const session = await auth.api.getSession({
              headers: request.headers,
            });
            return await usersService.deleteUserPermanent(id, getActor(session));
          } catch (error) {
            return handleUserMutationError(error, set);
          }
        },
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
