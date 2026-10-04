import { createFileRoute, notFound } from "@tanstack/react-router";
import { brandConfig } from "@config/brand";
import { PolicyPage } from "@/features/information/pages";
import { seoHead, noIndexHead } from "@/features/seo/metadata";
export const Route = createFileRoute("/_public/returns")({
  loader: () => {
    const policy = brandConfig.policies?.returns;
    if (!policy?.sections.length) throw notFound();
    return policy;
  },
  head: ({ loaderData }) =>
    loaderData
      ? seoHead(
          {
            title: `${loaderData.title} | ${brandConfig.name}`,
            description: `${loaderData.title} for ${brandConfig.name}.`,
            imageUrl: null,
          },
          "/returns",
          brandConfig,
        )
      : noIndexHead(),
  component: Page,
});
function Page() {
  return <PolicyPage policy={Route.useLoaderData()} />;
}
