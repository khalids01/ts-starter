import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import Logo from "@/components/core/logo";
import SignUpForm from "@/features/auth/sign-up-form";
import { getRootSession } from "@/features/user/lib/get-root-session";

export const Route = createFileRoute("/_auth/signup")({
  validateSearch: z.object({
    oauthError: z.string().optional(),
  }),
  beforeLoad: async ({ context, search }) => {
    const session = context.session ?? (await getRootSession());
    if (session && search.oauthError !== "account_exists") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { oauthError } = Route.useSearch();

  return (
    <>
      <header className="border-b">
        <div className="container mx-auto py-3 max-w-6xl">
          <div className="flex items-center justify-between">
            <Logo />
            <nav className="flex items-center gap-8">
              <a href="#" className="text-sm font-medium">Home</a>
            </nav>
          </div>
        </div>
      </header>
      <SignUpForm oauthError={oauthError} />
    </>
  );
}
