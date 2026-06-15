import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DeliveryStatus, OrderStatus, PaymentStatus } from "../types";

type StatusMeta<T extends string> = Record<T, { label: string; className: string }>;

export const orderStatusMeta = {
  pending: {
    label: "Pending",
    className: "border-slate-300 bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-200",
  },
  confirmed: {
    label: "Confirmed",
    className: "border-sky-300 bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200",
  },
  processing: {
    label: "Processing",
    className: "border-indigo-300 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200",
  },
  completed: {
    label: "Completed",
    className: "border-emerald-300 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-rose-300 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200",
  },
} satisfies StatusMeta<OrderStatus>;

export const paymentStatusMeta = {
  unpaid: {
    label: "Payment due",
    className: "border-amber-300 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  authorized: {
    label: "Authorized",
    className: "border-cyan-300 bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
  },
  paid: {
    label: "Paid",
    className: "border-emerald-300 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  },
  partially_refunded: {
    label: "Partially refunded",
    className: "border-violet-300 bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200",
  },
  refunded: {
    label: "Refunded",
    className: "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-200",
  },
  failed: {
    label: "Failed",
    className: "border-red-300 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
  },
} satisfies StatusMeta<PaymentStatus>;

export const deliveryStatusMeta = {
  unfulfilled: {
    label: "Unfulfilled",
    className: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
  },
  preparing: {
    label: "Preparing",
    className: "border-blue-300 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
  },
  ready_to_ship: {
    label: "Ready to ship",
    className: "border-teal-300 bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-200",
  },
  shipped: {
    label: "Shipped",
    className: "border-purple-300 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200",
  },
  out_for_delivery: {
    label: "Out for delivery",
    className: "border-orange-300 bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  },
  delivered: {
    label: "Delivered",
    className: "border-green-300 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200",
  },
  returned: {
    label: "Returned",
    className: "border-pink-300 bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-200",
  },
  failed: {
    label: "Delivery failed",
    className: "border-red-300 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
  },
} satisfies StatusMeta<DeliveryStatus>;

export const orderStatusOptions = Object.entries(orderStatusMeta).map(([value, meta]) => ({
  value,
  label: meta.label,
}));
export const paymentStatusOptions = Object.entries(paymentStatusMeta).map(([value, meta]) => ({
  value,
  label: meta.label,
}));
export const deliveryStatusOptions = Object.entries(deliveryStatusMeta).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

export function OrderStatusBadge(props: { status: OrderStatus }) {
  const meta = orderStatusMeta[props.status];
  return <Badge variant="outline" className={cn("border", meta.className)}>{meta.label}</Badge>;
}

export function PaymentStatusBadge(props: { status: PaymentStatus }) {
  const meta = paymentStatusMeta[props.status];
  return <Badge variant="outline" className={cn("border", meta.className)}>{meta.label}</Badge>;
}

export function DeliveryStatusBadge(props: { status: DeliveryStatus }) {
  const meta = deliveryStatusMeta[props.status];
  return <Badge variant="outline" className={cn("border", meta.className)}>{meta.label}</Badge>;
}
