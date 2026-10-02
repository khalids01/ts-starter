import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/constants/query-keys";
import { ecommerceApi } from "../apiCall";
import type { Order } from "../types";
import { Field, formatDate, readError } from "../ui";

type Action = "receive" | "inspect" | "restock";
const titles = { receive: "Record full physical receipt", inspect: "Inspect received inventory", restock: "Restock all inspected inventory" };

export function OrderRecoveryCard({ order, canReceive, canRestock }: { order: Order; canReceive: boolean; canRestock: boolean }) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<Action | null>(null);
  const [note, setNote] = useState("");
  const [allReceived, setAllReceived] = useState(false);
  const [disposition, setDisposition] = useState<"sellable" | "unsafe">("unsafe");
  const recovery = order.recovery;
  const mutation = useMutation({
    mutationFn: async (selected: Action) => {
      const body = { note: note.trim() };
      if (selected === "receive") return ecommerceApi.orders.receiveRecovery(order.id, { ...body, allItemsReceived: true });
      if (selected === "inspect") return ecommerceApi.orders.inspectRecovery(order.id, { ...body, disposition });
      return ecommerceApi.orders.restockRecovery(order.id, body);
    },
    onSuccess: () => {
      toast.success(action === "restock" ? "Inspected inventory restocked" : action === "inspect" ? "Inspection recorded; stock unchanged" : "Physical receipt recorded; stock unchanged");
      setAction(null);
      for (const queryKey of [queryKeys.admin.ecommerce.orders.all(), queryKeys.admin.ecommerce.inventory.all(), queryKeys.admin.ecommerce.delivery.all()]) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
    onError: (error) => toast.error(readError(error, "Failed to update inventory recovery")),
  });
  const open = (selected: Action) => { setNote(""); setAllReceived(false); setDisposition("unsafe"); setAction(selected); };
  const eligible = order.inventoryStatus === "committed";
  const canRecordReceipt = eligible && (order.orderStatus === "cancelled" || ["shipped", "out_for_delivery", "delivered", "returned", "failed"].includes(order.deliveryStatus));

  return (
    <section className="space-y-4 rounded-lg border p-4 sm:p-5">
      <div>
        <h2 className="font-medium">Physical inventory recovery</h2>
        <p className="mt-1 text-xs text-muted-foreground">Courier return completion and refunds do not return goods to saleable stock. Record receipt, inspect condition, then restock explicitly.</p>
      </div>
      {recovery ? (
        <div className="space-y-2 text-sm">
          <p>Received {formatDate(recovery.receivedAt)}</p>
          <p className="break-words text-muted-foreground">{recovery.receiptNote}</p>
          <p>Condition: {recovery.disposition === "awaiting_inspection" ? "Awaiting inspection" : recovery.disposition === "sellable" ? "Sellable" : "Unsafe / not sellable"}</p>
          {recovery.inspectionNote ? <p className="break-words text-muted-foreground">{recovery.inspectionNote}</p> : null}
          {recovery.restockedAt ? <p>Restocked {formatDate(recovery.restockedAt)}</p> : <p className="text-muted-foreground">Inventory has not been restocked.</p>}
        </div>
      ) : <p className="text-sm text-muted-foreground">No full physical receipt recorded.</p>}
      <div className="flex flex-wrap gap-2">
        {canReceive && !recovery ? <Button size="sm" variant="outline" disabled={!canRecordReceipt} onClick={() => open("receive")}>Record receipt</Button> : null}
        {canReceive && recovery && !recovery.restockedAt ? <Button size="sm" variant="outline" onClick={() => open("inspect")}>Inspect inventory</Button> : null}
        {canRestock ? <Button size="sm" variant="outline" disabled={!eligible || recovery?.disposition !== "sellable" || !recovery.inspectedAt || Boolean(recovery.restockedAt)} onClick={() => open("restock")}>Restock all items</Button> : null}
      </div>
      <p className="text-xs text-muted-foreground">Only complete, uniformly sellable returns can be restocked here. For missing, damaged, expired, or unsafe items, keep stock unavailable for reconciliation.</p>
      <Dialog open={Boolean(action)} onOpenChange={(isOpen) => { if (!isOpen && !mutation.isPending) setAction(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{action ? titles[action] : "Inventory recovery"}</DialogTitle>
            <DialogDescription>{action === "restock" ? "This returns every inspected item to saleable inventory once. It records no refund." : action === "inspect" ? "Inspect every received item. Unsafe goods remain unavailable for sale." : "Confirm every item and quantity is physically back at its stock location. Provider tracking alone is insufficient. This does not restock or refund."}</DialogDescription>
          </DialogHeader>
          {action === "receive" ? <label className="flex items-start gap-3 text-sm"><Checkbox aria-label="Every order item physically received" checked={allReceived} onCheckedChange={(checked) => setAllReceived(checked === true)} /><span>Every item and quantity is physically received at its stock location.</span></label> : null}
          {action === "inspect" ? <Field label="Condition" htmlFor="recovery-condition"><Select value={disposition} onValueChange={(value) => { if (value === "sellable" || value === "unsafe") setDisposition(value); }}><SelectTrigger id="recovery-condition"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unsafe">Unsafe / not sellable</SelectItem><SelectItem value="sellable">Every item sellable</SelectItem></SelectContent></Select></Field> : null}
          <Field label="Evidence / reason" htmlFor="recovery-note"><Textarea id="recovery-note" value={note} maxLength={2000} onChange={(event) => setNote(event.target.value)} placeholder="Receipt location and reference, inspection findings, or restock reason" /></Field>
          <DialogFooter><Button disabled={mutation.isPending || !note.trim() || (action === "receive" && !allReceived)} onClick={() => action && mutation.mutate(action)}>{mutation.isPending ? "Saving..." : action ? titles[action] : "Save"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
