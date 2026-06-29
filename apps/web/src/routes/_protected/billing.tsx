import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/providers/session-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_protected/billing")({
  component: BillingPage,
});

function BillingPage() {
  const { session } = useSession();

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your subscription plans and billing information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billing & Subscription</CardTitle>
          <CardDescription>
            Manage your subscription plans and billing information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Current Plan
              </p>
              <h3 className="mt-1 text-xl font-bold">
                {session?.user.plan === "pro" ? "Pro Plan" : "Free Starter"}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              <p
                className={cn(
                  "mt-1 font-semibold",
                  session?.user.subscriptionStatus === "active"
                    ? "text-green-600"
                    : "text-amber-600",
                )}
              >
                {session?.user.subscriptionStatus?.toUpperCase() ||
                  "NO ACTIVE SUBSCRIPTION"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your billing is handled securely through Polar. Click the button
              below to manage your subscription, download invoices, or update
              payment methods.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="default"
            onClick={async () => {
              try {
                const result = await authClient.customer.portal();
                if (result.data?.url) {
                  window.location.href = result.data.url;
                } else {
                  toast.error("Could not open billing portal");
                }
              } catch (error) {
                toast.error("Failed to open billing portal");
              }
            }}
          >
            Open Billing Portal
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
