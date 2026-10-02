import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ecommerceApi } from "../apiCall";
import type { InventoryStock } from "../types";
import { readError } from "../ui";

export function UnitRegistration({
  stocks,
  onSaved,
}: {
  stocks: InventoryStock[];
  onSaved: () => void;
}) {
  const [stockId, setStockId] = useState("");
  const [serial, setSerial] = useState("");
  const [imei, setImei] = useState("");
  const stock = stocks.find((s) => s.id === stockId);
  const mutation = useMutation({
    mutationFn: () =>
      ecommerceApi.inventory.registerUnit({
        variantId: stock!.variantId,
        locationId: stock!.locationId,
        batchId: stock!.batchId,
        serial: serial.trim() || null,
        imei: imei.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Unit registered; stock quantity unchanged");
      setSerial("");
      setImei("");
      onSaved();
    },
    onError: (e) => toast.error(readError(e, "Registration failed")),
  });
  return (
    <section className="space-y-3 rounded border p-4">
      <h2 className="font-medium">Register gadget unit</h2>
      <p className="text-muted-foreground text-sm">
        Receive stock first. Register each serial or IMEI before order
        commitment; registration identifies existing inventory and does not add
        quantity.
      </p>
      <label htmlFor="unit-stock">Received stock</label>
      <select
        id="unit-stock"
        className="w-full rounded border p-2"
        value={stockId}
        onChange={(e) => setStockId(e.target.value)}
      >
        <option value="">Choose stock</option>
        {stocks.map((s) => (
          <option key={s.id} value={s.id}>
            {s.variant?.sku} · {s.location?.name} ·{" "}
            {s.batch?.batchNumber ?? "No batch"}
          </option>
        ))}
      </select>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          Serial
          <Input
            maxLength={128}
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
          />
        </label>
        <label>
          IMEI
          <Input
            inputMode="numeric"
            maxLength={15}
            value={imei}
            onChange={(e) => setImei(e.target.value)}
          />
        </label>
      </div>
      <Button
        disabled={
          !stock || (!serial.trim() && !imei.trim()) || mutation.isPending
        }
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? "Saving..." : "Register unit"}
      </Button>
    </section>
  );
}
