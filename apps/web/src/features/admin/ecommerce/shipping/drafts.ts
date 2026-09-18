import type { ShippingRate } from "../types";

export type ShippingRateDraft = {
  id?: string;
  code: string;
  label: string;
  amount: string;
  currency: string;
  freeOverAmount: string;
  sortOrder: string;
};

export function shippingRateDraft(rate?: ShippingRate): ShippingRateDraft {
  return {
    id: rate?.id,
    code: rate?.code ?? "",
    label: rate?.label ?? "",
    amount: rate?.amount ?? "0.00",
    currency: rate?.currency ?? "BDT",
    freeOverAmount: rate?.freeOverAmount ?? "",
    sortOrder: String(rate?.sortOrder ?? 0),
  };
}
