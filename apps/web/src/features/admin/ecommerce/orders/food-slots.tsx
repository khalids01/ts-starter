import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ecommerceApi } from "../apiCall";
import type { FoodSlot } from "../types";
import { formatDate, readError } from "../ui";

export function FoodSlots({ canManage }: { canManage: boolean }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    label: "",
    postalCodes: "",
    startsAt: "",
    endsAt: "",
    cutoffAt: "",
    capacityUnits: "",
  });
  const query = useQuery({
    queryKey: ["admin", "food-slots"],
    queryFn: () => ecommerceApi.orders.foodSlots() as Promise<FoodSlot[]>,
  });
  const mutation = useMutation({
    mutationFn: (id?: string) =>
      id
        ? ecommerceApi.orders.disableFoodSlot(id)
        : ecommerceApi.orders.createFoodSlot({
            label: form.label,
            postalCodes: form.postalCodes.split(","),
            startsAt: new Date(form.startsAt).toISOString(),
            endsAt: new Date(form.endsAt).toISOString(),
            cutoffAt: new Date(form.cutoffAt).toISOString(),
            capacityUnits: Number(form.capacityUnits),
          }),
    onSuccess: () => {
      toast.success("Delivery slot saved");
      void qc.invalidateQueries({ queryKey: ["admin", "food-slots"] });
    },
    onError: (e) => toast.error(readError(e, "Slot update failed")),
  });
  return (
    <details className="rounded border p-4">
      <summary className="cursor-pointer font-medium">
        Fresh-food delivery areas and slots
      </summary>
      <div className="mt-3 space-y-3">
        <p className="text-muted-foreground text-sm">
          Capacity counts fresh-food item units, including all prepared orders.
          Set dated slots for your local delivery team. Closing a slot blocks
          further checkout and shipment; resolve existing bookings first.
        </p>
        {query.isLoading ? (
          <p>Loading slots...</p>
        ) : query.isError ? (
          <p role="alert">{readError(query.error, "Failed to load slots")}</p>
        ) : !(query.data ?? []).length ? (
          <p>No slots configured.</p>
        ) : (
          (query.data ?? []).map((slot) => (
            <div
              key={slot.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b py-2"
            >
              <p>
                {slot.label} · {slot.postalCodes.join(", ")} ·{" "}
                {formatDate(slot.startsAt)} · {slot.reservedUnits}/
                {slot.capacityUnits} units · {slot.isActive ? "Open" : "Closed"}
              </p>
              {canManage && slot.isActive ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate(slot.id)}
                >
                  Close slot
                </Button>
              ) : null}
            </div>
          ))
        )}
        {canManage ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                "label",
                "postalCodes",
                "startsAt",
                "endsAt",
                "cutoffAt",
                "capacityUnits",
              ] as const
            ).map((key) => (
              <label key={key}>
                {
                  {
                    label: "Slot label",
                    postalCodes: "Postal codes (comma separated)",
                    startsAt: "Delivery starts (local time)",
                    endsAt: "Delivery ends (local time)",
                    cutoffAt: "Checkout cutoff (local time)",
                    capacityUnits: "Preparation capacity in units",
                  }[key]
                }
                <Input
                  type={
                    key.endsWith("At")
                      ? "datetime-local"
                      : key === "capacityUnits"
                        ? "number"
                        : "text"
                  }
                  min={key === "capacityUnits" ? 1 : undefined}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            <Button
              disabled={
                Object.values(form).some((v) => !v.trim()) || mutation.isPending
              }
              onClick={() => mutation.mutate(undefined)}
            >
              Create slot
            </Button>
          </div>
        ) : null}
      </div>
    </details>
  );
}
