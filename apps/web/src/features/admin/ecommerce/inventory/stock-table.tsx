import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ecommerceApi } from "../apiCall";
import { readError } from "../ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InventoryStock } from "../types";
import { EmptyTableRow, formatDate } from "../ui";

export function StockTable(props: {
  stocks: InventoryStock[];
  loading: boolean;
  canManage: boolean;
  onSaved: () => void;
}) {
  const [batchId, setBatchId] = useState<string | null>(null);
  const [disposition, setDisposition] = useState<
    "sellable" | "quarantined" | "unsafe"
  >("quarantined");
  const [reason, setReason] = useState("");
  const mutation = useMutation({
    mutationFn: () =>
      ecommerceApi.inventory.batchDisposition(batchId!, {
        disposition,
        reason: reason.trim(),
      }),
    onSuccess: () => {
      setBatchId(null);
      props.onSaved();
      toast.success("Batch inspection recorded");
    },
    onError: (error) =>
      toast.error(readError(error, "Failed to record inspection")),
  });
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>On hand</TableHead>
            <TableHead>Reserved</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Reorder</TableHead>
            <TableHead>Expiry / safety</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.loading ? (
            <EmptyTableRow colSpan={9}>Loading stock...</EmptyTableRow>
          ) : props.stocks.length === 0 ? (
            <EmptyTableRow colSpan={9}>No stock rows found.</EmptyTableRow>
          ) : (
            props.stocks.map((stock) => (
              <TableRow key={stock.id}>
                <TableCell>{stock.variant?.product?.name ?? "—"}</TableCell>
                <TableCell>{stock.variant?.sku ?? "—"}</TableCell>
                <TableCell>{stock.location?.name ?? "—"}</TableCell>
                <TableCell>{stock.batch?.batchNumber ?? "—"}</TableCell>
                <TableCell>{stock.quantityOnHand}</TableCell>
                <TableCell>{stock.quantityReserved}</TableCell>
                <TableCell>{stock.availableQuantity}</TableCell>
                <TableCell>{stock.reorderLevel ?? "—"}</TableCell>
                <TableCell>
                  {formatDate(stock.batch?.expiryDate)}
                  <div>
                    {stock.batch?.disposition ?? "sellable"}
                    {stock.batch?.expiryDate &&
                    new Date(stock.batch.expiryDate) <= new Date()
                      ? " · Expired"
                      : ""}
                  </div>
                  {props.canManage && stock.batchId ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setBatchId(stock.batchId!);
                        setReason("");
                        setDisposition(
                          stock.batch?.disposition ?? "quarantined",
                        );
                      }}
                    >
                      Inspect batch
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Dialog
        open={Boolean(batchId)}
        onOpenChange={(open) => {
          if (!open) setBatchId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch safety inspection</DialogTitle>
            <DialogDescription>
              This affects every stock row in the batch. Quarantined and unsafe
              stock cannot be sold or dispatched. No quantities are changed.
            </DialogDescription>
          </DialogHeader>
          <label htmlFor="batch-disposition">Disposition</label>
          <select
            id="batch-disposition"
            className="rounded border p-2"
            value={disposition}
            onChange={(e) =>
              setDisposition(e.target.value as typeof disposition)
            }
          >
            <option value="sellable">Sellable</option>
            <option value="quarantined">Awaiting inspection</option>
            <option value="unsafe">Unsafe</option>
          </select>
          <label htmlFor="batch-reason">Inspection evidence</label>
          <Input
            id="batch-reason"
            value={reason}
            maxLength={500}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button
            disabled={!reason.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Saving..." : "Record inspection"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
