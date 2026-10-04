import { createFileRoute } from "@tanstack/react-router";
import { CustomerOrdersPage } from "@/features/customer/orders";
export const Route = createFileRoute("/_protected/orders/")({
  component: CustomerOrdersPage,
});
