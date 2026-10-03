import { createFileRoute } from "@tanstack/react-router";
import { SavedPage } from "@/features/shop/saved-page";

export const Route = createFileRoute("/_public/saved")({
  component: SavedPage,
});
