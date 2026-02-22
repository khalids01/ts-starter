import { Elysia } from "elysia";
import { auth } from "@auth";

export const authGuard = new Elysia().derive(async ({ request }) => {
  // Attempt to authenticate the request via Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  return {
    session,
    userId: session?.user?.id,
  };
});
