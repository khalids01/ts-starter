import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_protected/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, customerState } = Route.useRouteContext();

  const hasProSubscription =
    (customerState?.activeSubscriptions?.length ?? 0) > 0;
  // For debugging: console.log("Active subscriptions:", customerState?.activeSubscriptions);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session?.user.name}</p>
      <p>Plan: {hasProSubscription ? "Pro" : "Free"}</p>
      {hasProSubscription ? (
        <Button
          onClick={async function handlePortal() {
            await authClient.customer.portal();
          }}
        >
          Manage Subscription
        </Button>
      ) : (
        <Button
          onClick={async function handleUpgrade() {
            await authClient.checkout({ slug: "pro" });
          }}
        >
          Upgrade to Pro
        </Button>
      )}
    </div>
  );
}
