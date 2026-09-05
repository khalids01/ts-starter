import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import SignInForm from "@/features/auth/sign-in-form";
import Logo from "@/components/core/logo";
import { getRootSession } from "@/features/user/lib/get-root-session";

export const Route = createFileRoute("/_auth/login")({
  validateSearch: z.object({
    error: z.string().optional(),
    error_description: z.string().optional(),
    verified: z.coerce.boolean().optional(),
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
  const { error, error_description, verified } = Route.useSearch();

  return (
    <>
      <header className="border-b">
        <div className="container mx-auto py-3 max-w-6xl">
          <div className="flex items-center justify-between">
         <Logo/> 
            <nav className="flex items-center gap-8">
              <a href="#" className="text-sm font-medium">Home</a>
            </nav>
          </div>
        </div>
      </header>
      <SignInForm error={error} errorDescription={error_description} verified={verified} />
    </>
  )
}
