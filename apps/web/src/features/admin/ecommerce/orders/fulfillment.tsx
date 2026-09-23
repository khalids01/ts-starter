import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PackageCheck, PencilLine, Truck } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { InfoTooltip } from "@/components/core/info-tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ecommerceApi } from "../apiCall";
import type { Order } from "../types";
import { Field, TextField, formatDate, readError } from "../ui";
import { DeliveryStatusBadge } from "./status";

type TrackingDraft = {
  carrier: string;
  trackingNumber: string;
  note: string;
};

const PRE_SHIP_STATUSES = ["unfulfilled", "preparing", "ready_to_ship"];

export function FulfillmentCard(props: { order: Order; canFulfill: boolean }) {
  const { order } = props;
  const queryClient = useQueryClient();
  const [shipDraft, setShipDraft] = useState<TrackingDraft | null>(null);
  const [trackingDraft, setTrackingDraft] = useState<TrackingDraft | null>(
    null,
  );
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [deliverNote, setDeliverNote] = useState("");

  const invalidateOrders = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.ecommerce.orders.all(),
    });

  const markShipped = useMutation({
    mutationFn: (draft: TrackingDraft) =>
      ecommerceApi.orders.markShipped(order.id, {
        carrier: draft.carrier.trim(),
        trackingNumber: draft.trackingNumber.trim(),
        note: draft.note.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Order marked as shipped");
      setShipDraft(null);
      void invalidateOrders();
    },
    onError: (error) =>
      toast.error(readError(error, "Failed to mark order shipped")),
  });
  const updateTracking = useMutation({
    mutationFn: (draft: TrackingDraft) => {
      const body: Record<string, unknown> = {};
      if (draft.carrier.trim() !== (order.carrier ?? "")) {
        body.carrier = draft.carrier.trim();
      }
      if (draft.trackingNumber.trim() !== (order.trackingNumber ?? "")) {
        body.trackingNumber = draft.trackingNumber.trim();
      }
      if (draft.note.trim() !== (order.fulfillmentNote ?? "")) {
        body.note = draft.note.trim() || null;
      }
      return ecommerceApi.orders.updateTracking(order.id, body);
    },
    onSuccess: () => {
      toast.success("Tracking updated");
      setTrackingDraft(null);
      void invalidateOrders();
    },
    onError: (error) =>
      toast.error(readError(error, "Failed to update tracking")),
  });
  const markDelivered = useMutation({
    mutationFn: () =>
      ecommerceApi.orders.markDelivered(order.id, {
        note: deliverNote.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Order marked as delivered");
      setDeliverOpen(false);
      setDeliverNote("");
      void invalidateOrders();
    },
    onError: (error) =>
      toast.error(readError(error, "Failed to mark order delivered")),
  });

  const canShip =
    props.canFulfill &&
    order.orderStatus !== "cancelled" &&
    order.inventoryStatus === "committed" &&
    PRE_SHIP_STATUSES.includes(order.deliveryStatus);
  const canMarkDelivered =
    props.canFulfill &&
    ["shipped", "out_for_delivery"].includes(order.deliveryStatus);
  const canEditTracking = props.canFulfill && Boolean(order.shippedAt);

  return (
    <section className="space-y-3 rounded-lg border p-4 sm:p-5">
      <h2 className="font-medium">Fulfillment</h2>
      <div className="flex flex-wrap items-center gap-2">
        <DeliveryStatusBadge status={order.deliveryStatus} />
        {canShip ? (
          <Button
            size="sm"
            onClick={() =>
              setShipDraft({ carrier: "", trackingNumber: "", note: "" })
            }
          >
            <Truck className="h-4 w-4" />
            Mark shipped
          </Button>
        ) : null}
        {canMarkDelivered ? (
          <Button size="sm" onClick={() => setDeliverOpen(true)}>
            <PackageCheck className="h-4 w-4" />
            Mark delivered
          </Button>
        ) : null}
        {canEditTracking ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setTrackingDraft({
                carrier: order.carrier ?? "",
                trackingNumber: order.trackingNumber ?? "",
                note: order.fulfillmentNote ?? "",
              })
            }
          >
            <PencilLine className="h-4 w-4" />
            Edit tracking
          </Button>
        ) : null}
      </div>
      {props.canFulfill &&
      !canShip &&
      !order.shippedAt &&
      order.deliveryStatus !== "delivered" ? (
        <p className="text-xs text-muted-foreground">
          {order.orderStatus === "cancelled"
            ? "Cancelled orders cannot be shipped."
            : order.inventoryStatus !== "committed"
              ? "Confirm the order to commit inventory before marking it shipped."
              : "This order is not eligible to be shipped."}
        </p>
      ) : null}
      <InfoRow
        label="Carrier"
        value={order.carrier || "—"}
        explanation="Added when the order is marked shipped, and changed through Edit tracking."
      />
      <InfoRow
        label="Tracking number"
        value={order.trackingNumber || "—"}
        explanation="Added when the order is marked shipped, and changed through Edit tracking."
      />
      <InfoRow
        label="Shipped"
        value={formatDate(order.shippedAt)}
        explanation="Set automatically by the Mark shipped action."
      />
      <InfoRow
        label="Delivered"
        value={formatDate(order.deliveredAt)}
        explanation="Set automatically by the Mark delivered action."
      />
      <InfoRow
        label="Fulfillment note"
        value={order.fulfillmentNote || "—"}
        explanation="Added or changed through the shipment and tracking actions above."
      />

      <Dialog
        open={Boolean(shipDraft)}
        onOpenChange={(open) => !open && setShipDraft(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark order shipped</DialogTitle>
            <DialogDescription>
              Recording a shipment sets delivery status to shipped and adds a
              timeline event.
            </DialogDescription>
          </DialogHeader>
          {shipDraft ? (
            <div className="grid gap-3">
              <TextField
                label="Carrier"
                value={shipDraft.carrier}
                onChange={(carrier) => setShipDraft({ ...shipDraft, carrier })}
                placeholder="Pathao, Sundarban, DHL"
              />
              <TextField
                label="Tracking number"
                value={shipDraft.trackingNumber}
                onChange={(trackingNumber) =>
                  setShipDraft({ ...shipDraft, trackingNumber })
                }
              />
              <Field label="Note" htmlFor="ship-note">
                <Textarea
                  id="ship-note"
                  value={shipDraft.note}
                  placeholder="Optional note stored on the timeline event"
                  onChange={(event) =>
                    setShipDraft({ ...shipDraft, note: event.target.value })
                  }
                />
              </Field>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              disabled={
                markShipped.isPending ||
                !shipDraft?.carrier.trim() ||
                !shipDraft?.trackingNumber.trim()
              }
              onClick={() => shipDraft && markShipped.mutate(shipDraft)}
            >
              {markShipped.isPending ? "Saving..." : "Mark shipped"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(trackingDraft)}
        onOpenChange={(open) => !open && setTrackingDraft(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit tracking</DialogTitle>
            <DialogDescription>
              Corrections are audited on the order timeline with the previous
              values.
            </DialogDescription>
          </DialogHeader>
          {trackingDraft ? (
            <div className="grid gap-3">
              <TextField
                label="Carrier"
                value={trackingDraft.carrier}
                onChange={(carrier) =>
                  setTrackingDraft({ ...trackingDraft, carrier })
                }
              />
              <TextField
                label="Tracking number"
                value={trackingDraft.trackingNumber}
                onChange={(trackingNumber) =>
                  setTrackingDraft({ ...trackingDraft, trackingNumber })
                }
              />
              <Field label="Note" htmlFor="tracking-note">
                <Textarea
                  id="tracking-note"
                  value={trackingDraft.note}
                  placeholder="Optional note stored on the timeline event"
                  onChange={(event) =>
                    setTrackingDraft({
                      ...trackingDraft,
                      note: event.target.value,
                    })
                  }
                />
              </Field>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              disabled={
                updateTracking.isPending ||
                (trackingDraft?.carrier.trim() === (order.carrier ?? "") &&
                  trackingDraft?.trackingNumber.trim() ===
                    (order.trackingNumber ?? "") &&
                  trackingDraft?.note.trim() === (order.fulfillmentNote ?? ""))
              }
              onClick={() =>
                trackingDraft && updateTracking.mutate(trackingDraft)
              }
            >
              {updateTracking.isPending ? "Saving..." : "Save tracking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deliverOpen} onOpenChange={setDeliverOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark order delivered</DialogTitle>
            <DialogDescription>
              This sets delivery status to delivered and records the timestamp
              on the timeline.
            </DialogDescription>
          </DialogHeader>
          <Field label="Note" htmlFor="delivery-note">
            <Textarea
              id="delivery-note"
              value={deliverNote}
              placeholder="Optional note, e.g. received by customer"
              onChange={(event) => setDeliverNote(event.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button
              disabled={markDelivered.isPending}
              onClick={() => markDelivered.mutate()}
            >
              {markDelivered.isPending ? "Saving..." : "Mark delivered"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function InfoRow(props: {
  label: string;
  value: string;
  explanation?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1">
        <p className="text-xs text-muted-foreground">{props.label}</p>
        {props.explanation ? (
          <InfoTooltip>{props.explanation}</InfoTooltip>
        ) : null}
      </div>
      <div className="break-words font-medium">{props.value}</div>
    </div>
  );
}
