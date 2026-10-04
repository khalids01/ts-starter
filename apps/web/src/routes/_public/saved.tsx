import { noIndexHead } from "@/features/seo/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { SavedPage } from "@/features/shop/saved-page";

export const Route = createFileRoute("/_public/saved")({
  head: noIndexHead,
  component: SavedPage,
});
