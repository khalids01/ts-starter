import type { ProductVariant } from "../types";

export const steps = [
  "Category",
  "Basics",
  "Specs",
  "Variants",
  "Inventory",
  "Validate",
] as const;

export type Step = typeof steps[number];
export type AttributeDraft = Record<string, any>;
export type VariantDraft = {
  id?: string;
  sku: string;
  barcode: string;
  name: string;
  price: string;
  compareAtPrice: string;
  costPrice: string;
  currency: string;
  isDefault: boolean;
  isActive: boolean;
  weightValue: string;
  weightUnit: "none" | "g" | "kg" | "lb" | "oz";
  attributeValueIds: string[];
};

export function variantDraft(variant?: ProductVariant): VariantDraft {
  return {
    id: variant?.id,
    sku: variant?.sku ?? "",
    barcode: variant?.barcode ?? "",
    name: variant?.name ?? "",
    price: variant?.price ?? "",
    compareAtPrice: variant?.compareAtPrice ?? "",
    costPrice: variant?.costPrice ?? "",
    currency: variant?.currency ?? "BDT",
    isDefault: variant?.isDefault ?? false,
    isActive: variant?.isActive ?? true,
    weightValue: variant?.weightValue ?? "",
    weightUnit: variant?.weightUnit ?? "none",
    attributeValueIds: variant?.attributeValues?.map((value) => value.id) ?? [],
  };
}
