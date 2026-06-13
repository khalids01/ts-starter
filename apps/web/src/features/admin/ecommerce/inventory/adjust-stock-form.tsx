import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { ecommerceApi } from "../apiCall";
import type { InventoryStock } from "../types";
import { Field, SaveButton, SelectField, TextField, readError } from "../ui";

export function AdjustStockForm(props: {
  stocks: InventoryStock[];
  canManage: boolean;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ stockId: "none", delta: "", reason: "", unitCost: "" });
  const selected = useMemo(
    () => props.stocks.find((stock) => stock.id === form.stockId),
    [form.stockId, props.stocks],
  );
  const adjust = useMutation({
    mutationFn: () =>
      ecommerceApi.inventory.adjust({
        variantId: selected?.variantId,
        locationId: selected?.locationId,
        batchId: selected?.batchId ?? null,
        delta: Number(form.delta),
        reason: form.reason,
        unitCost: form.unitCost || null,
      }),
    onSuccess: () => {
      toast.success("Stock adjusted");
      props.onSaved();
    },
    onError: (error) => toast.error(readError(error, "Failed to adjust stock")),
  });

  return (
    <section className="grid gap-4 rounded-md border p-4 md:grid-cols-2">
      <SelectField
        label="Stock row"
        value={form.stockId}
        onChange={(stockId) => setForm((current) => ({ ...current, stockId }))}
        options={[
          { value: "none", label: "Select stock" },
          ...props.stocks.map((stock) => ({
            value: stock.id,
            label: `${stock.variant?.sku ?? "SKU"} · ${stock.location?.name ?? "Location"} · available ${stock.availableQuantity}`,
          })),
        ]}
      />
      <TextField label="Delta" type="number" value={form.delta} onChange={(delta) => setForm((current) => ({ ...current, delta }))} />
      <TextField label="Unit cost" type="number" value={form.unitCost} onChange={(unitCost) => setForm((current) => ({ ...current, unitCost }))} />
      <Field label="Reason">
        <Textarea value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} />
      </Field>
      <div className="md:col-span-2">
        <SaveButton
          loading={adjust.isPending}
          disabled={!props.canManage || !selected || !form.delta || !form.reason}
          onClick={() => adjust.mutate()}
        >
          Adjust stock
        </SaveButton>
      </div>
    </section>
  );
}
