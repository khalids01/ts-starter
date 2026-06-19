import { createFileRoute } from "@tanstack/react-router";
import { CheckoutSuccessPage } from "@/features/shop";

export const Route = createFileRoute("/checkout/success/$orderId")({
  component: SuccessRoute,
});

function SuccessRoute() {
  const { orderId } = Route.useParams();

  return <CheckoutSuccessPage orderId={orderId} />;
}
