import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { queryKeys } from "@/constants/query-keys";
import { ecommerceApi } from "../apiCall";
import type { CourierTracking } from "../types";
import { formatDate, readError } from "../ui";

export function CourierTrackingCard({
  orderId,
  canRead,
  canDispatch,
  canReconcile,
}: {
  orderId: string;
  canRead: boolean;
  canDispatch: boolean;
  canReconcile: boolean;
}) {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const retry = useMutation({
    mutationFn: (id: string) => ecommerceApi.delivery.retryHold(id, note),
    onSuccess: () => {
      setNote("");
      void qc.invalidateQueries({
        queryKey: queryKeys.admin.ecommerce.delivery.tracking(orderId),
      });
    },
  });
  const query = useQuery({
    queryKey: queryKeys.admin.ecommerce.delivery.tracking(orderId),
    queryFn: () =>
      ecommerceApi.delivery.tracking(orderId) as Promise<CourierTracking[]>,
    enabled: canRead,
  });
  if (!canRead) return null;
  const consignments = query.data ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Courier tracking</CardTitle>
        <CardDescription>
          Provider updates are deduplicated and polling repairs missed webhooks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isLoading ? (
          <p className="text-muted-foreground text-sm">Loading tracking…</p>
        ) : query.isError ? (
          <p className="text-destructive text-sm">
            {readError(query.error, "Failed to load tracking")}
          </p>
        ) : !consignments.length ? (
          <p className="text-muted-foreground text-sm">
            No courier consignment has been submitted.
          </p>
        ) : (
          consignments.map((consignment) => (
            <div
              key={consignment.id}
              className="space-y-3 rounded-md border p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">
                    {consignment.providerName} · {consignment.serviceName}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {consignment.trackingCode || consignment.invoice}
                  </div>
                </div>
                <Badge>{consignment.state.replaceAll("_", " ")}</Badge>
              </div>
              {consignment.operation ? (
                <p className="text-muted-foreground text-xs">
                  Submission: {consignment.operation.state.replaceAll("_", " ")}{" "}
                  · Attempts {consignment.operation.attemptCount}
                  {consignment.operation.nextAttemptAt
                    ? ` · Next check ${formatDate(consignment.operation.nextAttemptAt)}`
                    : ""}
                </p>
              ) : null}
              {canDispatch && consignment.canRetryHold ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    Review the corrected connection, service and inventory
                    before retrying this never-submitted hold.
                  </p>
                  <label>
                    Review evidence
                    <Input
                      maxLength={2000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </label>
                  <Button
                    disabled={!note.trim() || retry.isPending}
                    onClick={() => retry.mutate(consignment.id)}
                  >
                    Retry reviewed hold
                  </Button>
                </div>
              ) : null}
              {canReconcile && consignment.canReconcileBooking ? (
                <BookingReconciliation
                  consignment={consignment}
                  onSaved={() => {
                    void qc.invalidateQueries({
                      queryKey:
                        queryKeys.admin.ecommerce.delivery.tracking(orderId),
                    });
                  }}
                />
              ) : null}
              {consignment.exceptions.map((exception) => (
                <div
                  key={exception.id}
                  className="text-destructive flex items-center gap-2 text-xs"
                >
                  <AlertTriangle className="size-4" /> Manual review:{" "}
                  {exception.kind.replaceAll("_", " ")}
                </div>
              ))}
              <div className="space-y-2">
                {consignment.events.map((event) => (
                  <div key={event.id} className="border-l pl-3 text-xs">
                    <div className="font-medium">
                      {(event.normalizedState || event.eventType).replaceAll(
                        "_",
                        " ",
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      {event.source} ·{" "}
                      {formatDate(event.occurredAt || event.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        {retry.isError ? (
          <p role="alert" className="text-destructive">
            {readError(retry.error, "Retry rejected")}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function BookingReconciliation({
  consignment,
  onSaved,
}: {
  consignment: CourierTracking;
  onSaved: () => void;
}) {
  const [externalId, setExternalId] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [providerState, setProviderState] = useState("");
  const [evidence, setEvidence] = useState("");
  const mutation = useMutation({
    mutationFn: () =>
      ecommerceApi.delivery.reconcileBooking(consignment.id, {
        invoice: consignment.invoice,
        externalId,
        trackingCode: trackingCode || null,
        providerState,
        note: evidence,
      }),
    onSuccess: onSaved,
  });
  return (
    <div className="space-y-2 rounded border p-3">
      <p className="text-sm">
        Record an existing merchant parcel for invoice {consignment.invoice}.
        This records confirmed identity at the current time; it does not create
        another parcel or confirm delivery or payment.
      </p>
      <label>
        Merchant consignment ID
        <Input
          maxLength={128}
          value={externalId}
          onChange={(e) => setExternalId(e.target.value)}
        />
      </label>
      <label>
        Tracking code (optional)
        <Input
          maxLength={128}
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
        />
      </label>
      <label>
        Merchant status
        <Input
          maxLength={128}
          value={providerState}
          onChange={(e) => setProviderState(e.target.value)}
        />
      </label>
      <label>
        Evidence and source
        <Input
          maxLength={2000}
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
        />
      </label>
      <Button
        disabled={
          mutation.isPending ||
          !externalId.trim() ||
          !providerState.trim() ||
          !evidence.trim()
        }
        onClick={() => mutation.mutate()}
      >
        Record existing booking
      </Button>
      {mutation.isError ? (
        <p role="alert" className="text-destructive">
          {readError(mutation.error, "Reconciliation rejected")}
        </p>
      ) : null}
    </div>
  );
}
