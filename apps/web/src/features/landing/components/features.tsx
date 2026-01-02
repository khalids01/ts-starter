import { Zap, Shield, Rocket, Layers, BarChart3, Users } from "lucide-react";

const features = [
  {
    title: "Lightning Fast",
    description:
      "Optimized for performance with Tanstack Start and optimized server-side rendering.",
    icon: <Zap className="h-6 w-6" />,
  },
  {
    title: "Secure by Default",
    description:
      "State-of-the-art authentication with Better Auth and type-safe database access.",
    icon: <Shield className="h-6 w-6" />,
  },
  {
    title: "Rapid Development",
    description:
      "Built-in components and pre-configured workflows to help you ship in days, not months.",
    icon: <Rocket className="h-6 w-6" />,
  },
  {
    title: "Modular Architecture",
    description:
      "Highly scalable folder structure that keeps your codebase clean and maintainable.",
    icon: <Layers className="h-6 w-6" />,
  },
  {
    title: "Analytics Included",
    description:
      "Integrated dashboard and analytics to monitor your SaaS growth from day one.",
    icon: <BarChart3 className="h-6 w-6" />,
  },
  {
    title: "Multi-tenant Ready",
    description: "Built-in support for teams and organizations out of the box.",
    icon: <Users className="h-6 w-6" />,
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Everything you need to launch
          </h2>
          <p className="text-muted-foreground text-lg">
            Stop wasting time on boilerplate. Focus on your unique product
            features while we handle the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
