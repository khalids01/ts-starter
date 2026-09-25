import { createFileRoute } from "@tanstack/react-router";
import { CourierOverviewPage } from "@/features/admin/ecommerce/delivery";

export const Route = createFileRoute("/admin/couriers/")({ component: CourierOverviewPage });
