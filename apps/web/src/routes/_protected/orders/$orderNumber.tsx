import { createFileRoute } from "@tanstack/react-router";
import { CustomerOrderPage } from "@/features/customer/orders";
export const Route = createFileRoute("/_protected/orders/$orderNumber")({
  component: OrderPage,
});
function OrderPage() {
  return <CustomerOrderPage orderNumber={Route.useParams().orderNumber} />;
}
