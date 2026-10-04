import { safeReturnPath } from "@/features/auth/safe-return-path";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import SignInForm from "@/features/auth/sign-in-form";
import { getRootSession } from "@/features/user/lib/get-root-session";

export const Route = createFileRoute("/_auth/login")({
  validateSearch: z.object({
    next: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
    verified: z.coerce.boolean().optional(),
  }),
  beforeLoad: async ({ context, search }) => {
    const session = context.session ?? (await getRootSession());
    if (session) {
      throw redirect({ href: safeReturnPath(search.next) });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { error, error_description, verified, next } = Route.useSearch();

  return (
    <>
      <SignInForm returnTo={safeReturnPath(next)} error={error} errorDescription={error_description} verified={verified} />
    </>
  )
}
