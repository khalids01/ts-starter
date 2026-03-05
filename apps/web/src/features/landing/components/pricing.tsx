import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const plans = [
  {
    name: "Pro",
    slug: "pro_monthly",
    price: "$4.99",
    description:
      "Everything you need to grow your business and scale. Includes a 1-month free trial.",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority email support",
      "20GB Storage",
      "Custom domains",
    ],
    cta: "Start 1-month free trial",
    popular: true,
  },
];

export const Pricing = () => {
  const handleCheckout = async (slug: string) => {
    try {
      const result = await authClient.checkout({
        slug,
      });

      if (result.error) {
        toast.error(result.error.message || "Something went wrong");
        return;
      }

      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      toast.error("Failed to initiate checkout");
    }
  };

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Start your journey today with our simple, effective plan.
          </p>
        </div>

        <div className="max-w-md mx-auto mt-4 px-2 md:px-0">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative flex flex-col p-8 rounded-3xl border transition-all duration-300 bg-card border-primary shadow-xl z-10",
              )}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-1.5 rounded-full text-sm font-bold shadow-md">
                1 Month Free Trial
              </div>

              <div className="mb-8 mt-2 text-center">
                <h3 className="text-2xl font-bold mb-2 text-foreground">
                  {plan.name}
                </h3>
                <div className="flex items-center justify-center gap-1 mb-4">
                  <span className="text-5xl font-black tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground font-medium text-lg mt-2">
                    /month
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-grow bg-muted/30 p-6 rounded-2xl">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="default"
                size="lg"
                className="w-full rounded-full h-14 text-base font-bold transition-all duration-300 cursor-pointer shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
                onClick={() => handleCheckout(plan.slug)}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
