import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { queryKeys } from "@/constants/query-keys";
import { ecommerceApi } from "../apiCall";
import type { CourierTracking } from "../types";
import { formatDate, readError } from "../ui";

export function CourierTrackingCard({ orderId, canRead }: { orderId: string; canRead: boolean }) {
  const query = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.tracking(orderId),
    queryFn: () => ecommerceApi.delivery.tracking(orderId) as Promise<CourierTracking[]>,
    enabled: canRead,
  });
  if (!canRead) return null;
  const consignments = query.data ?? [];
  return (
    <Card>
      <CardHeader><CardTitle>Courier tracking</CardTitle><CardDescription>Provider updates are deduplicated and polling repairs missed webhooks.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        {query.isLoading ? <p className="text-muted-foreground text-sm">Loading tracking…</p> : query.isError ? <p className="text-destructive text-sm">{readError(query.error, "Failed to load tracking")}</p> : !consignments.length ? <p className="text-muted-foreground text-sm">No courier consignment has been submitted.</p> : consignments.map((consignment) => <div key={consignment.id} className="space-y-3 rounded-md border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="font-medium">{consignment.providerName} · {consignment.serviceName}</div><div className="text-muted-foreground text-xs">{consignment.trackingCode || consignment.invoice}</div></div><Badge>{consignment.state.replaceAll("_", " ")}</Badge></div>{consignment.exceptions.map((exception) => <div key={exception.id} className="text-destructive flex items-center gap-2 text-xs"><AlertTriangle className="size-4" /> Manual review: {exception.kind.replaceAll("_", " ")}</div>)}<div className="space-y-2">{consignment.events.map((event) => <div key={event.id} className="border-l pl-3 text-xs"><div className="font-medium">{(event.normalizedState || event.eventType).replaceAll("_", " ")}</div><div className="text-muted-foreground">{event.source} · {formatDate(event.occurredAt || event.createdAt)}</div></div>)}</div></div>)}
      </CardContent>
    </Card>
  );
}
