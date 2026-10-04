import { createFileRoute } from "@tanstack/react-router";
import { brandConfig } from "@config/brand";
import { ContactPage } from "@/features/information/pages";
import { getContactSettings } from "@/features/information/api";
import { seoHead } from "@/features/seo/metadata";
export const Route = createFileRoute("/_public/contact")({
  loader: () => getContactSettings(),
  staleTime: 0,
  head: () =>
    seoHead(
      {
        title: `Contact ${brandConfig.name}`,
        description: `Contact ${brandConfig.name} and find help with your order.`,
        imageUrl: null,
      },
      "/contact",
      brandConfig,
    ),
  component: Page,
});
function Page() {
  return <ContactPage settings={Route.useLoaderData()} />;
}
