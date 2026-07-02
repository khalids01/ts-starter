import { createFileRoute } from "@tanstack/react-router";
import { SavedPage } from "@/features/shop/saved-page";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
});
