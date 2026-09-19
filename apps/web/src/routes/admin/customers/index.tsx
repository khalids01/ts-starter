import { createFileRoute } from "@tanstack/react-router";
import { AdminCustomersPage } from "@/features/admin/ecommerce/customers";
export const Route = createFileRoute("/admin/customers/")({ component: AdminCustomersPage });
