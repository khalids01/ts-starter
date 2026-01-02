import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for hobby projects and small side businesses.",
    features: [
      "Up to 5 projects",
      "Basic analytics",
      "Community support",
      "1GB Storage",
    ],
    cta: "Start for free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    description: "Everything you need to grow your business and scale.",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority email support",
      "20GB Storage",
      "Custom domains",
    ],
    cta: "Get Started Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Advanced features for large organizations and teams.",
    features: [
      "SLA guarantees",
      "Dedicated account manager",
      "Custom integrations",
      "Unlimited storage",
      "Advanced security",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose the plan that's right for you. No hidden fees, ever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative flex flex-col p-8 rounded-3xl border transition-all duration-300",
                plan.popular
                  ? "bg-card border-primary shadow-xl scale-105 z-10"
                  : "bg-background border-border hover:border-primary/50"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className="text-muted-foreground font-medium">
                      /month
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.popular ? "default" : "outline"}
                className="w-full rounded-full h-12 text-base font-bold transition-all duration-300"
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
