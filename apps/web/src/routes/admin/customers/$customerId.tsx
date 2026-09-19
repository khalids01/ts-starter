import { createFileRoute } from "@tanstack/react-router";
import { AdminCustomerDetailPage } from "@/features/admin/ecommerce/customers";
export const Route = createFileRoute("/admin/customers/$customerId")({ component: CustomerRoute });
function CustomerRoute() { const { customerId } = Route.useParams(); return <AdminCustomerDetailPage customerId={customerId} />; }
