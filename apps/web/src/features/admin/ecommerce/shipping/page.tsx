import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/constants/query-keys";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { ShippingRate } from "../types";
import { EcommerceHeader, ecommercePermissions, readError } from "../ui";
import { shippingRateDraft, type ShippingRateDraft } from "./drafts";
import { ShippingRateDialog } from "./rate-dialog";
import { ShippingRatesList } from "./rates-list";

export function AdminShippingPage() {
  const { session } = useSession();
  const { canManageShipping } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ShippingRateDraft | null>(null);
  const ratesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.shipping.rates(),
    queryFn: () => ecommerceApi.shipping.rates() as Promise<ShippingRate[]>,
  });
  const refresh = () => void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.shipping.all() });
  const save = useMutation({
    mutationFn: (value: ShippingRateDraft) => {
      const body = {
        code: value.code,
        label: value.label,
        amount: value.amount,
        currency: value.currency,
        freeOverAmount: value.freeOverAmount || null,
        sortOrder: Number(value.sortOrder || 0),
      };
      return value.id ? ecommerceApi.shipping.updateRate(value.id, body) : ecommerceApi.shipping.createRate(body);
    },
    onSuccess: () => { toast.success("Shipping rate saved"); setDraft(null); refresh(); },
    onError: (error) => toast.error(readError(error, "Failed to save shipping rate")),
  });
  const toggleActive = useMutation({
    mutationFn: (rate: ShippingRate) => ecommerceApi.shipping.updateRate(rate.id, { isActive: !rate.isActive }),
    onSuccess: (rate: any) => { toast.success(rate.isActive ? "Shipping rate enabled" : "Shipping rate disabled"); refresh(); },
    onError: (error) => toast.error(readError(error, "Failed to update shipping rate")),
  });
  const setDefault = useMutation({
    mutationFn: (rate: ShippingRate) => ecommerceApi.shipping.updateRate(rate.id, { isDefault: true }),
    onSuccess: () => { toast.success("Default shipping rate updated"); refresh(); },
    onError: (error) => toast.error(readError(error, "Failed to update default shipping rate")),
  });

  return <div className="space-y-6">
    <EcommerceHeader title="Shipping" description="Manage checkout delivery methods, pricing, and free-shipping thresholds." action={canManageShipping ? <Button onClick={() => setDraft(shippingRateDraft())}><Plus className="mr-2 size-4" />Shipping rate</Button> : null} />
    <ShippingRatesList rates={ratesQuery.data ?? []} loading={ratesQuery.isLoading} canManage={canManageShipping} changing={toggleActive.isPending || setDefault.isPending} onEdit={(rate) => setDraft(shippingRateDraft(rate))} onToggleActive={(rate) => toggleActive.mutate(rate)} onSetDefault={(rate) => setDefault.mutate(rate)} />
    <ShippingRateDialog draft={draft} loading={save.isPending} onChange={setDraft} onSubmit={(value) => save.mutate(value)} />
  </div>;
}
