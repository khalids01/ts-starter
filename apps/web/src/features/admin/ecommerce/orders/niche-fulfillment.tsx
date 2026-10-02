import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ecommerceApi } from "../apiCall";
import { queryKeys } from "@/constants/query-keys";
import type { Order, TrackedUnit } from "../types";
import { readError, formatDate } from "../ui";

export function NicheFulfillmentCard({
  order,
  canFulfill,
  canAssign,
}: {
  order: Order;
  canFulfill: boolean;
  canAssign: boolean;
}) {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [lineId, setLineId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [claimReference, setClaimReference] = useState(() =>
    crypto.randomUUID(),
  );
  const [allocationId, setAllocationId] = useState("");
  const lines = order.lineItems ?? [];
  const tracked = lines.filter(
    (line) => line.serialTracking && line.serialTracking !== "none",
  );
  const line = tracked.find((item) => item.id === lineId);
  const available = useQuery({
    queryKey: ["admin", "ecommerce", "units", line?.variantId],
    queryFn: () =>
      ecommerceApi.inventory.units(line!.variantId!) as Promise<TrackedUnit[]>,
    enabled: canAssign && Boolean(line?.variantId),
  });
  const mutation = useMutation({
    mutationFn: (action: {
      kind: "prepare" | "assign" | "unassign" | "claim" | "resolve";
      unitId?: string;
      state?: "preparing" | "ready";
      claimId?: string;
      resolutionState?: "approved" | "rejected";
    }) => {
      if (action.kind === "unassign")
        return ecommerceApi.orders.unassignUnit(order.id, action.unitId!);
      if (action.kind === "prepare")
        return ecommerceApi.orders.preparation(order.id, action.state!, note);
      if (action.kind === "assign")
        return ecommerceApi.orders.assignUnit(order.id, lineId, unitId);
      if (action.kind === "claim")
        return ecommerceApi.orders.openWarranty(
          order.id,
          allocationId,
          claimReference,
          note,
        );
      return ecommerceApi.orders.resolveWarranty(
        order.id,
        action.claimId!,
        action.resolutionState!,
        note,
      );
    },
    onSuccess: () => {
      toast.success("Order evidence recorded");
      setNote("");
      setUnitId("");
      setClaimReference(crypto.randomUUID());
      void qc.invalidateQueries({
        queryKey: queryKeys.admin.ecommerce.orders.all(),
      });
      void qc.invalidateQueries({ queryKey: ["admin", "ecommerce", "units"] });
    },
    onError: (e) => toast.error(readError(e, "Operation failed")),
  });
  if (!order.foodBooking && !tracked.length) return null;
  const allocations = lines.flatMap((item) =>
    (item.unitAllocations ?? []).map((allocation) => ({
      ...allocation,
      warrantyDays: item.warrantyDays ?? 0,
    })),
  );
  return (
    <section className="space-y-3 rounded border p-4">
      <h2 className="font-medium">Preparation and tracked units</h2>
      {order.foodBooking ? (
        <div className="space-y-2">
          <p>
            {order.foodBooking.slot.label} ·{" "}
            {formatDate(order.foodBooking.slot.startsAt)} –{" "}
            {formatDate(order.foodBooking.slot.endsAt)} ·{" "}
            {order.foodBooking.state}
          </p>
          <p className="text-muted-foreground text-sm">
            Use local delivery during the slot. General parcel dispatch is
            blocked. Cancellation after preparation needs recovery review.
          </p>
          {canFulfill ? (
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={
                  !note.trim() ||
                  mutation.isPending ||
                  order.foodBooking.state !== "reserved"
                }
                onClick={() =>
                  mutation.mutate({ kind: "prepare", state: "preparing" })
                }
              >
                Start preparation
              </Button>
              <Button
                disabled={
                  !note.trim() ||
                  mutation.isPending ||
                  order.foodBooking.state !== "preparing"
                }
                onClick={() =>
                  mutation.mutate({ kind: "prepare", state: "ready" })
                }
              >
                Ready for local delivery
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
      {tracked.map((item) => (
        <p key={item.id}>
          {item.productName}: {item.units?.length ?? 0}/{item.quantity} assigned
          · {item.warrantyDays ?? 0} warranty days from delivery
          {canAssign
            ? (item.units ?? [])
                .filter((unit) => unit.state === "assigned")
                .map((unit) => (
                  <Button
                    key={unit.id}
                    size="sm"
                    variant="outline"
                    disabled={mutation.isPending}
                    onClick={() =>
                      mutation.mutate({ kind: "unassign", unitId: unit.id })
                    }
                  >
                    Unassign {unit.serial ?? unit.imei}
                  </Button>
                ))
            : null}
        </p>
      ))}
      {canAssign && tracked.length ? (
        <div className="grid gap-2 sm:grid-cols-3">
          <label>
            Order item
            <select
              className="w-full rounded border p-2"
              value={lineId}
              onChange={(e) => {
                setLineId(e.target.value);
                setUnitId("");
              }}
            >
              <option value="">Choose item</option>
              {tracked.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.productName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Available unit
            <select
              className="w-full rounded border p-2"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
            >
              <option value="">
                {available.isLoading ? "Loading..." : "Choose unit"}
              </option>
              {(available.data ?? []).map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.serial ?? unit.imei}
                </option>
              ))}
            </select>
          </label>
          <Button
            disabled={!unitId || mutation.isPending}
            onClick={() => mutation.mutate({ kind: "assign" })}
          >
            Assign unit
          </Button>
          {available.isError ? (
            <p role="alert">
              {readError(available.error, "Failed to load units")}
            </p>
          ) : null}
        </div>
      ) : null}
      {allocations.map((allocation) => (
        <div key={allocation.id} className="rounded border p-2 text-sm">
          <p>
            {allocation.unit.serial ?? allocation.unit.imei} ·{" "}
            {allocation.state}
          </p>
          {allocation.claims.map((claim) => (
            <div key={claim.id}>
              <p>
                Warranty: {claim.state} · {claim.issue}
                {claim.resolution ? ` · ${claim.resolution}` : ""}
              </p>
              {canFulfill && claim.state === "open" ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={!note.trim() || mutation.isPending}
                    onClick={() =>
                      mutation.mutate({
                        kind: "resolve",
                        claimId: claim.id,
                        resolutionState: "approved",
                      })
                    }
                  >
                    Approve claim
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!note.trim() || mutation.isPending}
                    onClick={() =>
                      mutation.mutate({
                        kind: "resolve",
                        claimId: claim.id,
                        resolutionState: "rejected",
                      })
                    }
                  >
                    Reject claim
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
      {canFulfill ? (
        <>
          <label>
            Preparation, issue or resolution evidence
            <Input
              maxLength={2000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          {order.deliveredAt && allocations.some((a) => a.warrantyDays > 0) ? (
            <div className="flex flex-wrap gap-2">
              <label>
                Purchased unit
                <select
                  className="rounded border p-2"
                  value={allocationId}
                  onChange={(e) => setAllocationId(e.target.value)}
                >
                  <option value="">Choose warranty unit</option>
                  {allocations
                    .filter((a) => a.warrantyDays > 0)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.unit.serial ?? a.unit.imei}
                      </option>
                    ))}
                </select>
              </label>
              <Button
                disabled={!allocationId || !note.trim() || mutation.isPending}
                onClick={() => mutation.mutate({ kind: "claim" })}
              >
                Open warranty claim
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
      {mutation.isError ? (
        <p role="alert" className="text-destructive">
          {readError(mutation.error, "Operation failed")}
        </p>
      ) : null}
    </section>
  );
}
