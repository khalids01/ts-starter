import { Elysia } from "elysia";
import { auth } from "@auth";
import { getAccountStatusRejection } from "./account-status";

export const authGuard = new Elysia()
  .derive({ as: "scoped" }, async ({ request }) => {
    // Attempt to authenticate the request via Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    return {
      session,
      user: session?.user,
      userId: session?.user?.id,
    };
  })
  .onBeforeHandle({ as: "scoped" }, ({ session, set }) => {
    const rejection = getAccountStatusRejection(session?.user);
    if (!rejection) {
      return;
    }

    set.status = rejection.status;
    return rejection;
  });
