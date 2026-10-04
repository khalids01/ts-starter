import { noIndexHead } from "@/features/seo/metadata";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AuthSettingsProvider } from "@/features/auth/auth-methods";
import { getPublicAuthSettings } from "@/features/auth/get-public-auth-settings";
import { getPublicData } from "@/features/shop/catalog/ssr-fetch";
import { PublicDataProvider } from "@/providers/public-data-provider";
import { PublicShopShell } from "@/features/shop/public-shop-shell";
import { PublicShopFooter } from "@/components/public-footer";
export const Route = createFileRoute("/_auth")({
  head: noIndexHead,
  loader: async () => {
    const [settings, publicData] = await Promise.all([
      getPublicAuthSettings(),
      getPublicData(),
    ]);
    return { settings, publicData };
  },
  component: AuthLayout,
});
function AuthLayout() {
  const { settings, publicData } = Route.useLoaderData();
  return (
    <AuthSettingsProvider settings={settings}>
      <PublicDataProvider value={publicData}>
        <PublicShopShell footer={<PublicShopFooter />}>
          <Outlet />
        </PublicShopShell>
      </PublicDataProvider>
    </AuthSettingsProvider>
  );
}
