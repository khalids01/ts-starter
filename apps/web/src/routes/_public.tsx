import { Outlet, createFileRoute } from "@tanstack/react-router";
import { getPublicData } from "@/features/shop/catalog/ssr-fetch";
import { PublicDataProvider } from "@/providers/public-data-provider";

export const Route = createFileRoute("/_public")({
  loader: async () => getPublicData(),
  component: PublicLayout,
});

function PublicLayout() {
  const publicData = Route.useLoaderData();

  return (
    <PublicDataProvider value={publicData}>
      <Outlet />
    </PublicDataProvider>
  );
}
