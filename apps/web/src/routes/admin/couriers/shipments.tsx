import { createFileRoute } from "@tanstack/react-router";
import { CourierOperationsPage } from "@/features/admin/ecommerce/delivery";

export const Route = createFileRoute("/admin/couriers/shipments")({ component: () => <CourierOperationsPage section="dispatches" /> });
