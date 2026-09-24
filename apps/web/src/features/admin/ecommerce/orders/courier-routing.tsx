import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/constants/query-keys";
import { ecommerceApi } from "../apiCall";
import type { CourierRouteRecommendation, CourierService } from "../types";
import { readError } from "../ui";

export function CourierRoutingCard({ orderId, canDispatch }: { orderId: string; canDispatch: boolean }) {
  const queryClient = useQueryClient();
  const recommendationQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.recommendation(orderId),
    queryFn: () => ecommerceApi.delivery.recommendation(orderId) as Promise<CourierRouteRecommendation>,
    enabled: canDispatch,
    retry: false,
  });
  const servicesQuery = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.services(),
    queryFn: () => ecommerceApi.delivery.services() as Promise<CourierService[]>,
    enabled: canDispatch,
  });
  const recommendation = recommendationQuery.data;
  const [selection, setSelection] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  useEffect(() => {
    const first = recommendation?.candidates[0];
    if (first) setSelection(`${first.connectionId}:${first.serviceId}`);
  }, [recommendation]);
  const confirm = useMutation({
    mutationFn: () => {
      const [connectionId, serviceId] = selection.split(":");
      return ecommerceApi.delivery.confirmRoute(orderId, { connectionId, serviceId, ...(overrideReason.trim() ? { overrideReason } : {}) });
    },
    onSuccess: () => {
      toast.success("Courier route confirmed; dispatch remains manual");
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.delivery.all() });
    },
    onError: (error) => toast.error(readError(error, "Failed to confirm courier route")),
  });
  if (!canDispatch) return null;
  const services = servicesQuery.data ?? [];
  const selectedIndex = recommendation?.candidates.findIndex((item) => `${item.connectionId}:${item.serviceId}` === selection) ?? -1;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Courier routing</CardTitle>
        <CardDescription>Review the deterministic recommendation before creating a dispatch.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendationQuery.isLoading ? <p className="text-muted-foreground text-sm">Calculating recommendation…</p> : recommendationQuery.isError ? <p className="text-destructive text-sm">{readError(recommendationQuery.error, "No recommendation is available")}</p> : !recommendation?.candidates.length ? <div className="space-y-1"><Badge variant="destructive">No eligible route</Badge>{recommendation?.warnings.map((warning) => <p key={warning} className="text-muted-foreground text-xs">{warning}</p>)}</div> : <>
          <label className="grid gap-1 text-sm"><span className="font-medium">Connection and service</span><select className="border-input bg-background h-10 rounded-md border px-3" value={selection} onChange={(event) => setSelection(event.target.value)}>{recommendation.candidates.map((candidate, index) => { const service = services.find((item) => item.id === candidate.serviceId); return <option key={`${candidate.ruleId}:${candidate.connectionId}:${candidate.serviceId}`} value={`${candidate.connectionId}:${candidate.serviceId}`}>{index === 0 ? "Recommended · " : ""}{service?.connectionName ?? candidate.connectionId} / {service?.displayName ?? candidate.serviceId}</option>; })}</select></label>
          <p className="text-muted-foreground text-xs">{recommendation.candidates[selectedIndex]?.reason}</p>
          {selectedIndex > 0 ? <label className="grid gap-1 text-sm"><span className="font-medium">Override reason</span><Textarea value={overrideReason} onChange={(event) => setOverrideReason(event.target.value)} placeholder="Explain why the recommended route was not selected" /></label> : null}
          <div className="rounded-md border p-3 text-xs"><div className="mb-1 font-medium">Final payload preview</div><div>Invoice: {recommendation.payloadPreview.invoice}</div><div>Recipient: {recommendation.payloadPreview.recipientName} · {recommendation.payloadPreview.recipientPhone || "Missing phone"}</div><div>Address: {recommendation.payloadPreview.recipientAddress || "Missing address"}</div><div>Payment: {recommendation.request.paymentKind}</div><div>Courier COD: {recommendation.payloadPreview.codAmount} {recommendation.payloadPreview.currency}</div><div>Rules evaluated: {recommendation.evaluatedRules.length}</div></div>
          <Button disabled={!selection || (selectedIndex > 0 && overrideReason.trim().length < 5) || confirm.isPending} onClick={() => confirm.mutate()}>Confirm route</Button>
        </>}
      </CardContent>
    </Card>
  );
}
