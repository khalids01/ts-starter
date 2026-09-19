import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  DeliveryStatus,
  OrderInventoryStatus,
  OrderStatus,
  PaymentStatus,
} from "../types";

type StatusMeta<T extends string> = Record<
  T,
  { label: string; className: string }
>;

export const orderStatusMeta = {
  pending: {
    label: "Pending",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-200",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200",
  },
  processing: {
    label: "Processing",
    className:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200",
  },
  completed: {
    label: "Completed",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200",
  },
} satisfies StatusMeta<OrderStatus>;

export const paymentStatusMeta = {
  unpaid: {
    label: "Payment due",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  authorized: {
    label: "Authorized",
    className: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
  },
  paid: {
    label: "Paid",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  },
  partially_refunded: {
    label: "Partially refunded",
    className:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200",
  },
  refunded: {
    label: "Refunded",
    className:
      "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-200",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
  },
} satisfies StatusMeta<PaymentStatus>;

export const deliveryStatusMeta = {
  unfulfilled: {
    label: "Unfulfilled",
    className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
  },
  preparing: {
    label: "Preparing",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
  },
  ready_to_ship: {
    label: "Ready to ship",
    className: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-200",
  },
  shipped: {
    label: "Shipped",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200",
  },
  out_for_delivery: {
    label: "Out for delivery",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  },
  delivered: {
    label: "Delivered",
    className:
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200",
  },
  returned: {
    label: "Returned",
    className: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-200",
  },
  failed: {
    label: "Delivery failed",
    className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
  },
} satisfies StatusMeta<DeliveryStatus>;

export const inventoryStatusMeta = {
  reserved: {
    label: "Reserved",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  },
  committed: {
    label: "Committed",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
  },
  released: {
    label: "Released",
    className: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
  },
  restocked: {
    label: "Restocked",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
  },
} satisfies StatusMeta<OrderInventoryStatus>;

export const orderStatusOptions = Object.entries(orderStatusMeta).map(
  ([value, meta]) => ({
    value,
    label: meta.label,
  }),
);
export const paymentStatusOptions = Object.entries(paymentStatusMeta).map(
  ([value, meta]) => ({
    value,
    label: meta.label,
  }),
);
export const deliveryStatusOptions = Object.entries(deliveryStatusMeta).map(
  ([value, meta]) => ({
    value,
    label: meta.label,
  }),
);
export const inventoryStatusOptions = Object.entries(inventoryStatusMeta).map(
  ([value, meta]) => ({
    value,
    label: meta.label,
  }),
);

export function OrderStatusBadge(props: { status: OrderStatus }) {
  const meta = orderStatusMeta[props.status];
  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent", meta.className)}
    >
      {meta.label}
    </Badge>
  );
}

export function PaymentStatusBadge(props: { status: PaymentStatus }) {
  const meta = paymentStatusMeta[props.status];
  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent", meta.className)}
    >
      {meta.label}
    </Badge>
  );
}

export function DeliveryStatusBadge(props: { status: DeliveryStatus }) {
  const meta = deliveryStatusMeta[props.status];
  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent", meta.className)}
    >
      {meta.label}
    </Badge>
  );
}

export function InventoryStatusBadge(props: { status: OrderInventoryStatus }) {
  const meta = inventoryStatusMeta[props.status];
  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent", meta.className)}
    >
      {meta.label}
    </Badge>
  );
}

function StatusSelect(props: {
  value: string;
  label: string;
  className: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      value={props.value}
      disabled={props.disabled}
      onValueChange={(value) => value && props.onChange(value)}
    >
      <SelectTrigger
        size="sm"
        className={cn(
          "h-6 w-auto min-w-0 rounded-md border-transparent px-2 py-0.5 text-xs font-medium shadow-none focus-visible:ring-1",
          props.className,
        )}
      >
        <SelectValue>{props.label}</SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {props.options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function OrderStatusSelect(props: {
  value: OrderStatus;
  currentValue?: OrderStatus;
  disabled?: boolean;
  onChange: (value: OrderStatus) => void;
}) {
  const meta = orderStatusMeta[props.value];
  const options = orderStatusOptions.filter(
    (option) =>
      props.currentValue === "cancelled"
        ? option.value === "cancelled"
        : option.value !== "cancelled",
  );
  return (
    <StatusSelect
      {...props}
      label={meta.label}
      className={meta.className}
      options={options}
      onChange={(value) => props.onChange(value as OrderStatus)}
    />
  );
}

export function PaymentStatusSelect(props: {
  value: PaymentStatus;
  currentValue?: PaymentStatus;
  disabled?: boolean;
  onChange: (value: PaymentStatus) => void;
}) {
  const meta = paymentStatusMeta[props.value];
  const options = paymentStatusOptions.filter(
    (option) =>
      ["partially_refunded", "refunded"].includes(props.currentValue ?? "")
        ? option.value === props.currentValue
        : !["partially_refunded", "refunded"].includes(option.value),
  );
  return (
    <StatusSelect
      {...props}
      label={meta.label}
      className={meta.className}
      options={options}
      onChange={(value) => props.onChange(value as PaymentStatus)}
    />
  );
}

export function DeliveryStatusSelect(props: {
  value: DeliveryStatus;
  currentValue?: DeliveryStatus;
  disabled?: boolean;
  onChange: (value: DeliveryStatus) => void;
}) {
  const meta = deliveryStatusMeta[props.value];
  const options = deliveryStatusOptions.filter(
    (option) =>
      !["shipped", "delivered"].includes(option.value) ||
      option.value === props.currentValue,
  );
  return (
    <StatusSelect
      {...props}
      label={meta.label}
      className={meta.className}
      options={options}
      onChange={(value) => props.onChange(value as DeliveryStatus)}
    />
  );
}
