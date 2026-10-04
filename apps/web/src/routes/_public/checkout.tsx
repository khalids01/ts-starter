import { noIndexHead } from "@/features/seo/metadata";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/checkout")({
  head: noIndexHead,
  component: Outlet,
});
