import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import SignUpForm from "@/features/auth/sign-up-form";
import { getRootSession } from "@/features/user/lib/get-root-session";

export const Route = createFileRoute("/_auth/signup")({
  validateSearch: z.object({
    error: z.string().optional(),
    error_description: z.string().optional(),
  }),
  beforeLoad: async ({ context }) => {
    const session = context.session ?? (await getRootSession());
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { error, error_description } = Route.useSearch();

  return (
    <>
      <SignUpForm error={error} errorDescription={error_description} />
    </>
  );
}
