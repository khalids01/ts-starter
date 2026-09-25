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
import { ArchiveViewTabs, ResourceActionDialog, type ArchiveView, type ResourceAction } from "../archive-controls";

export function AdminShippingPage() {
  const { session } = useSession();
  const { canManageShipping } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ShippingRateDraft | null>(null);
  const [archiveView, setArchiveView] = useState<ArchiveView>("current");
  const [resourceAction, setResourceAction] = useState<{ action: ResourceAction; rate: ShippingRate } | null>(null);
  const ratesQuery = useQuery({
    queryKey: [...queryKeys.admin.ecommerce.shipping.rates(), archiveView],
    queryFn: () => ecommerceApi.shipping.rates({ archived: archiveView === "archived" }) as Promise<ShippingRate[]>,
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
  const lifecycle = useMutation({
    mutationFn: ({ action, rate }: NonNullable<typeof resourceAction>) => action === "archive" ? ecommerceApi.shipping.archiveRate(rate.id) : action === "restore" ? ecommerceApi.shipping.restoreRate(rate.id) : ecommerceApi.shipping.deleteRate(rate.id),
    onSuccess: (_, variables) => { toast.success(variables.action === "archive" ? "Shipping method archived" : variables.action === "restore" ? "Shipping method recovered" : "Shipping method permanently deleted"); setResourceAction(null); refresh(); },
    onError: (error) => toast.error(readError(error, "Shipping method operation failed")),
  });

  return <div className="space-y-6">
    <EcommerceHeader title="Shipping" description="Manage checkout delivery methods, pricing, and free-shipping thresholds." action={canManageShipping && archiveView === "current" ? <Button onClick={() => setDraft(shippingRateDraft())}><Plus className="mr-2 size-4" />Shipping rate</Button> : null} />
    <ArchiveViewTabs value={archiveView} onChange={(value) => { setArchiveView(value); setResourceAction(null); }} />
    <ShippingRatesList rates={ratesQuery.data ?? []} loading={ratesQuery.isLoading} canManage={canManageShipping} changing={toggleActive.isPending || setDefault.isPending || lifecycle.isPending} onEdit={(rate) => setDraft(shippingRateDraft(rate))} onToggleActive={(rate) => toggleActive.mutate(rate)} onSetDefault={(rate) => setDefault.mutate(rate)} onArchive={(rate) => setResourceAction({ action: "archive", rate })} onRestore={(rate) => setResourceAction({ action: "restore", rate })} onDelete={(rate) => setResourceAction({ action: "delete", rate })} />
    <ShippingRateDialog draft={draft} loading={save.isPending} onChange={setDraft} onSubmit={(value) => save.mutate(value)} />
    <ResourceActionDialog action={resourceAction?.action ?? null} resourceName={resourceAction?.rate.label} resourceKind="shipping method" pending={lifecycle.isPending} error={lifecycle.error} onClose={() => { lifecycle.reset(); setResourceAction(null); }} onConfirm={() => resourceAction && lifecycle.mutate(resourceAction)} />
  </div>;
}
