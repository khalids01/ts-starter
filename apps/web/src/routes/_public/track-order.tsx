import { noIndexHead } from "@/features/seo/metadata";
import { createFileRoute } from "@tanstack/react-router";
import { TrackOrderPage } from "@/features/shop/track-order-page";

export const Route = createFileRoute("/_public/track-order")({
  head: noIndexHead,
  component: TrackOrderPage,
});
