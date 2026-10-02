import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryKeys } from "@/constants/query-keys";
import { ecommerceApi } from "../apiCall";
import type { Order, PaymentMethod } from "../types";
import { Field, formatDate, readError } from "../ui";

export function OrderPaymentsCard({ order, canRecord }: { order: Order; canRecord: boolean }) {
  const queryClient = useQueryClient();
  const [action, setAction] = useState<"receive" | "reverse" | null>(null);
  const [receiptId, setReceiptId] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("manual_bank");
  const mutation = useMutation({
    mutationFn: () => action === "reverse"
      ? ecommerceApi.orders.reversePayment(order.id, receiptId, note.trim())
      : ecommerceApi.orders.recordPayment(order.id, { amount: amount.trim(), currency: order.currency, method, reference: reference.trim(), note: note.trim() }),
    onSuccess: () => {
      toast.success("Payment evidence recorded");
      setAction(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.orders.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.ecommerce.delivery.all() });
    },
    onError: (error) => toast.error(readError(error, "Payment action failed")),
  });
  const open = (selected: "receive" | "reverse", id = "") => {
    setAction(selected); setReceiptId(id); setAmount(""); setReference(""); setNote(""); setMethod("manual_bank");
  };
  const editable = canRecord && !order.money?.error && order.orderStatus !== "completed";
  return (
    <section className="space-y-4 rounded-lg border p-4 sm:p-5">
      <h2 className="font-medium">Payment evidence</h2>
      <p className="text-xs text-muted-foreground">Record money actually received. These actions record evidence and do not transfer money. Courier collections use settlement reconciliation.</p>
      {order.money?.error ? <p className="text-sm text-destructive">{order.money.error}. Review the historical collection evidence before further money actions.</p> : (
        <p className="text-sm">Received {order.money?.received ?? "—"} · Refunded {order.money?.refunded ?? "—"} · Outstanding {order.money?.outstanding ?? "—"} {order.currency}</p>
      )}
      {editable && order.orderStatus !== "cancelled" ? <Button variant="outline" size="sm" disabled={Number(order.money?.outstanding ?? 0) <= 0} onClick={() => open("receive")}>Record confirmed payment</Button> : null}
      <div className="space-y-3">
        {(order.payments ?? []).map((entry) => (
          <div key={entry.id} className="rounded border p-3 text-sm">
            <p>{entry.entryType === "reversal" ? "Receipt correction" : "Received"}: {entry.amount} {entry.currency} · {entry.method}</p>
            <p className="break-words text-muted-foreground">{entry.reference} · {formatDate(entry.receivedAt)} · Actor: {entry.actorUserId}</p>
            {entry.note ? <p className="break-words">{entry.note}</p> : null}
            {editable && entry.entryType === "receipt" && !entry.settlementId && !(order.payments ?? []).some((row) => row.reversesId === entry.id) ? (
              <Button variant="outline" size="sm" className="mt-2" onClick={() => open("reverse", entry.id)}>Correct mistaken receipt</Button>
            ) : null}
          </div>
        ))}
      </div>
      <Dialog open={Boolean(action)} onOpenChange={(isOpen) => { if (!isOpen && !mutation.isPending) setAction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action === "reverse" ? "Correct mistaken receipt" : "Record confirmed payment"}</DialogTitle>
            <DialogDescription>{action === "reverse" ? "Only correct evidence that was wrong. Actual money returned to a customer is a refund. This reverses the complete receipt and may invalidate courier review." : "Use the real bank, mobile transaction, or cash receipt reference. Reusing a reference cannot add another credit. Payment changes invalidate courier review or open reconciliation."}</DialogDescription>
          </DialogHeader>
          {action === "receive" ? <>
            <Field label={`Amount (${order.currency})`} htmlFor="payment-amount"><Input id="payment-amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></Field>
            <Field label="Method" htmlFor="payment-method">
              <Select value={method} onValueChange={(value) => { if (["manual_bank", "manual_mobile", "cash_on_delivery", "online_gateway"].includes(value ?? "")) setMethod(value as PaymentMethod); }}>
                <SelectTrigger id="payment-method"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="manual_bank">Bank collection</SelectItem><SelectItem value="manual_mobile">Mobile collection</SelectItem><SelectItem value="cash_on_delivery">Manual cash receipt</SelectItem><SelectItem value="online_gateway">Verified gateway receipt</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Collection reference" htmlFor="payment-reference"><Input id="payment-reference" maxLength={200} value={reference} onChange={(event) => setReference(event.target.value)} /></Field>
          </> : null}
          <Field label="Evidence / correction reason" htmlFor="payment-note"><Textarea id="payment-note" maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} /></Field>
          <DialogFooter><Button disabled={mutation.isPending || !note.trim() || (action === "receive" && (!amount.trim() || !reference.trim()))} onClick={() => mutation.mutate()}>{mutation.isPending ? "Saving..." : "Record evidence"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
