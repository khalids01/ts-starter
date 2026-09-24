import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AuthSettingsProvider } from "@/features/auth/auth-methods";
import { getPublicAuthSettings } from "@/features/auth/get-public-auth-settings";

export const Route = createFileRoute("/_auth")({
  loader: () => getPublicAuthSettings(),
  component: AuthLayout,
});

function AuthLayout() {
  const settings = Route.useLoaderData();

  return (
    <AuthSettingsProvider settings={settings}>
      <Outlet />
    </AuthSettingsProvider>
  );
}
