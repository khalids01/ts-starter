import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ecommerceApi } from "../apiCall";
import type { Order } from "../types";
import { Field, formatDate, readError } from "../ui";
import { formatMoney } from "./orders-table";

type OperationDraft = {
  reason: string;
  note: string;
};

type RefundDraft = OperationDraft & {
  amount: string;
  restockInventory: boolean;
};

const emptyOperation = (): OperationDraft => ({ reason: "", note: "" });
const emptyRefund = (): RefundDraft => ({
  amount: "",
  reason: "",
  note: "",
  restockInventory: false,
});

export function OrderOperationsCard(props: {
  order: Order;
  canCancel: boolean;
  canRefund: boolean;
}) {
  const { order } = props;
  const queryClient = useQueryClient();
  const [cancelDraft, setCancelDraft] = useState<OperationDraft | null>(null);
  const [refundDraft, setRefundDraft] = useState<RefundDraft | null>(null);

  const invalidateOrders = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.admin.ecommerce.orders.all(),
    });

  const cancelOrder = useMutation({
    mutationFn: (draft: OperationDraft) =>
      ecommerceApi.orders.cancel(order.id, {
        reason: draft.reason.trim(),
        note: draft.note.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Order cancelled");
      setCancelDraft(null);
      void invalidateOrders();
    },
    onError: (error) => toast.error(readError(error, "Failed to cancel order")),
  });

  const recordRefund = useMutation({
    mutationFn: (draft: RefundDraft) =>
      ecommerceApi.orders.recordRefund(order.id, {
        amount: draft.amount.trim(),
        reason: draft.reason.trim(),
        note: draft.note.trim() || null,
        restockInventory: draft.restockInventory,
      }),
    onSuccess: () => {
      toast.success("Manual refund recorded");
      setRefundDraft(null);
      void invalidateOrders();
    },
    onError: (error) =>
      toast.error(readError(error, "Failed to record refund")),
  });

  const refundedAmount = (order.refunds ?? []).reduce(
    (sum, refund) => sum + Number(refund.amount),
    0,
  );
  const remainingAmount = Math.max(Number(order.totalAmount) - refundedAmount, 0);
  const canCancelOrder =
    props.canCancel &&
    order.orderStatus !== "cancelled" &&
    order.deliveryStatus !== "delivered" &&
    !order.deliveredAt;
  const canRecordRefund =
    props.canRefund && ["paid", "partially_refunded"].includes(order.paymentStatus);

  return (
    <section className="space-y-4 rounded-lg border p-4 sm:p-5">
      <div>
        <h2 className="font-medium">Cancellation and refunds</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Refunds recorded here are internal manual records. No money is moved
          through a payment provider.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {props.canCancel ? (
          <Button
            size="sm"
            variant="destructive"
            disabled={!canCancelOrder}
            onClick={() => setCancelDraft(emptyOperation())}
          >
            <Ban className="size-4" />
            Cancel order
          </Button>
        ) : null}
        {props.canRefund ? (
          <Button
            size="sm"
            variant="outline"
            disabled={!canRecordRefund}
            onClick={() => setRefundDraft(emptyRefund())}
          >
            <RotateCcw className="size-4" />
            Record refund
          </Button>
        ) : null}
      </div>

      {props.canCancel && !canCancelOrder ? (
        <p className="text-xs text-muted-foreground">
          {order.orderStatus === "cancelled"
            ? "This order is already cancelled."
            : "Delivered orders cannot be cancelled."}
        </p>
      ) : null}
      {props.canRefund && !canRecordRefund ? (
        <p className="text-xs text-muted-foreground">
          Refunds can only be recorded for paid or partially refunded orders.
        </p>
      ) : null}

      <div className="grid gap-1 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Refunded</span>
          <span className="font-medium">
            {formatMoney(refundedAmount.toFixed(2), order.currency)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Remaining refundable</span>
          <span className="font-medium">
            {formatMoney(remainingAmount.toFixed(2), order.currency)}
          </span>
        </div>
      </div>

      {(order.refunds?.length ?? 0) > 0 ? (
        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Refund history
          </p>
          {order.refunds?.map((refund) => (
            <div key={refund.id} className="rounded-md bg-muted/50 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  {formatMoney(refund.amount, refund.currency)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(refund.createdAt)}
                </span>
              </div>
              <p className="mt-1">{refund.reason}</p>
              {refund.note ? (
                <p className="mt-1 text-xs text-muted-foreground">{refund.note}</p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {refund.restockInventory ? "Inventory restocked" : "No inventory change"}
                {refund.actorUser ? ` · ${refund.actorUser.email}` : " · System"}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <Dialog
        open={Boolean(cancelDraft)}
        onOpenChange={(open) => !open && setCancelDraft(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel order?</DialogTitle>
            <DialogDescription>
              This records an audit event and releases reserved stock or restocks
              committed stock. The inventory side effect runs only once.
            </DialogDescription>
          </DialogHeader>
          {cancelDraft ? (
            <OperationFields draft={cancelDraft} onChange={setCancelDraft} />
          ) : null}
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={cancelOrder.isPending || !cancelDraft?.reason.trim()}
              onClick={() => cancelDraft && cancelOrder.mutate(cancelDraft)}
            >
              {cancelOrder.isPending ? "Cancelling..." : "Cancel order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(refundDraft)}
        onOpenChange={(open) => !open && setRefundDraft(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record manual refund</DialogTitle>
            <DialogDescription>
              This only records a refund in the order history. You must move the
              money separately through the original payment channel.
            </DialogDescription>
          </DialogHeader>
          {refundDraft ? (
            <div className="grid gap-3">
              <Field label={`Amount (${order.currency})`}>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={remainingAmount.toFixed(2)}
                  value={refundDraft.amount}
                  onChange={(event) =>
                    setRefundDraft({ ...refundDraft, amount: event.target.value })
                  }
                />
              </Field>
              <OperationFields draft={refundDraft} onChange={setRefundDraft} />
              <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
                <Checkbox
                  checked={refundDraft.restockInventory}
                  disabled={order.inventoryStatus !== "committed"}
                  onCheckedChange={(checked) =>
                    setRefundDraft({
                      ...refundDraft,
                      restockInventory: Boolean(checked),
                    })
                  }
                />
                <span>
                  <span className="font-medium">Restock committed inventory</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Optional and available once. Leave this unchecked when the
                    customer keeps the items or inventory was already reversed.
                  </span>
                </span>
              </label>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              disabled={
                recordRefund.isPending ||
                !refundDraft?.amount.trim() ||
                !refundDraft?.reason.trim()
              }
              onClick={() => refundDraft && recordRefund.mutate(refundDraft)}
            >
              {recordRefund.isPending ? "Recording..." : "Record refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function OperationFields<T extends OperationDraft>(props: {
  draft: T;
  onChange: (draft: T) => void;
}) {
  return (
    <div className="grid gap-3">
      <Field label="Reason">
        <Input
          value={props.draft.reason}
          placeholder="Required reason"
          onChange={(event) =>
            props.onChange({ ...props.draft, reason: event.target.value })
          }
        />
      </Field>
      <Field label="Internal note">
        <Textarea
          value={props.draft.note}
          placeholder="Optional additional context"
          onChange={(event) =>
            props.onChange({ ...props.draft, note: event.target.value })
          }
        />
      </Field>
    </div>
  );
}
