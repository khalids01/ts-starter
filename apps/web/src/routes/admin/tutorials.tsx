import { createFileRoute } from "@tanstack/react-router";
import { AdminTutorialsPage } from "@/features/admin/tutorials/page";

export const Route = createFileRoute("/admin/tutorials")({
  component: AdminTutorialsPage,
});
