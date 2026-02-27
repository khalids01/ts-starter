import { env } from "@env/server";

export const PLANS = {
  FREE: {
    slug: "free",
    name: "Free",
    productId: "",
  },
  PRO_MONTHLY: {
    slug: "pro_monthly",
    name: "Pro Monthly",
    productId: env.POLAR_PRO_MONTHLY_ID || "",
  },
  PRO_YEARLY: {
    slug: "pro_yearly",
    name: "Pro Yearly",
    productId: env.POLAR_PRO_YEARLY_ID || "",
  },
} as const;

export type Plan = keyof typeof PLANS;
export type PlanSlug = (typeof PLANS)[Plan]["slug"];
