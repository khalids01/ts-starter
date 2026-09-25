import { createFileRoute } from "@tanstack/react-router";
import { CourierConnectionsPage } from "@/features/admin/ecommerce/delivery";

export const Route = createFileRoute("/admin/couriers/connections")({ component: CourierConnectionsPage });
