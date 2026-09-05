import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

import { rememberAuthMethod } from "@/features/auth/auth-methods";

export const Route = createFileRoute("/_auth/auth-complete")({
  validateSearch: z.object({
    method: z.enum(["password", "magic-link", "github", "google", "discord"]),
    next: z.string().optional(),
  }),
  component: AuthCompletePage,
});

function AuthCompletePage() {
  const { method, next } = Route.useSearch();

  useEffect(() => {
    rememberAuthMethod(method);
    window.location.replace(next?.startsWith("/") ? next : "/dashboard");
  }, [method, next]);

  return <div className="p-10 text-center text-sm text-muted-foreground">Completing sign-in...</div>;
}
