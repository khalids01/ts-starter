import { createFileRoute } from "@tanstack/react-router";
import { brandConfig } from "@config/brand";
import { ShippingPage } from "@/features/information/pages";
import { getDeliveryRates } from "@/features/information/api";
import { seoHead } from "@/features/seo/metadata";
export const Route = createFileRoute("/_public/shipping")({
  loader: () => getDeliveryRates(),
  staleTime: 0,
  head: () =>
    seoHead(
      {
        title: `Delivery information | ${brandConfig.name}`,
        description:
          "Review available delivery methods and current fees before placing an order.",
        imageUrl: null,
      },
      "/shipping",
      brandConfig,
    ),
  component: Page,
});
function Page() {
  return <ShippingPage rates={Route.useLoaderData()} />;
}
