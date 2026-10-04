import { createFileRoute } from "@tanstack/react-router";
import { brandConfig } from "@config/brand";
import { robotsText } from "@/features/seo/metadata";

export const Route = createFileRoute("/robots.txt")({
  server: { handlers: { GET: () => new Response(robotsText(brandConfig.publicOrigin, process.env.NODE_ENV === "production" && process.env.E2E_MODE !== "true"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }) } },
});
