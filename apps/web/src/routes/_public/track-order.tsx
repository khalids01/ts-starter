import { createFileRoute } from "@tanstack/react-router";
import { TrackOrderPage } from "@/features/shop/track-order-page";

export const Route = createFileRoute("/_public/track-order")({
  component: TrackOrderPage,
});
