import { createServerFn } from "@tanstack/react-start";

export type OnboardingPlanOption = {
  slug: string;
  name: string;
  selectable: boolean;
};

export const getOnboardingPlans = createServerFn({ method: "GET" }).handler(
  async () => {
    const { PLANS } = await import("@auth/plans");

    return Object.values(PLANS).map((plan) => ({
      slug: plan.slug,
      name: plan.name,
      selectable: plan.slug === "free",
    })) satisfies OnboardingPlanOption[];
  },
);
