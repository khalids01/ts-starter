import { createFileRoute } from "@tanstack/react-router";
import { CustomerDashboard } from "@/features/customer/orders";
export const Route = createFileRoute("/_protected/dashboard")({
  component: CustomerDashboard,
});
