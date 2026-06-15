import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type { DeliveryStatus, Order, OrderLineItem, OrderStatus, PaymentStatus } from "../types";
import { EcommerceHeader, Field, SelectField, ecommercePermissions, formatDate, readError } from "../ui";
import { formatMoney } from "./orders-table";
import {
  DeliveryStatusBadge,
  OrderStatusBadge,
  PaymentStatusBadge,
  deliveryStatusMeta,
  deliveryStatusOptions,
  orderStatusMeta,
  orderStatusOptions,
  paymentStatusMeta,
  paymentStatusOptions,
} from "./status";

type StatusForm = {
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  note: string;
};

export function AdminOrderDetailPage(props: { orderId: string }) {
  const { session } = useSession();
  const { canManageOrders } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.admin.ecommerce.orders.detail(props.orderId),
    queryFn: () => ecommerceApi.orders.detail(props.orderId) as Promise<Order>,
  });
  const order = query.data;
  const [form, setForm] = useState<StatusForm | null>(null);

  useEffect(() => {
    if (!order) {
      return;
    }
    setForm({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      note: "",
    });
  }, [order]);

  const updateStatuses = useMutation({
    mutationFn: (value: StatusForm) =>
      ecommerceApi.orders.updateStatuses(props.orderId, {
        orderStatus: value.orderStatus,
        paymentStatus: value.paymentStatus,
        deliveryStatus: value.deliveryStatus,
        note: value.note || null,
      }),
    onSuccess: () => {
      toast.success("Order statuses updated");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.ecommerce.orders.all(),
      });
    },
    onError: (error) => toast.error(readError(error, "Failed to update order statuses")),
  });

  if (query.isLoading) {
    return <div className="rounded-md border p-6 text-sm text-muted-foreground">Loading order...</div>;
  }

  if (!order) {
    return <div className="rounded-md border p-6 text-sm text-muted-foreground">Order not found.</div>;
  }

  return (
    <div className="space-y-6">
      <EcommerceHeader
        title={order.orderNumber}
        description={`${order.customerName} · ${formatMoney(order.totalAmount, order.currency)}`}
        action={
          <Link to="/admin/orders" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Orders
          </Link>
        }
      />

      <section className="grid gap-3 md:grid-cols-3">
        <SummaryCard label="Order status">
          <OrderStatusBadge status={order.orderStatus} />
        </SummaryCard>
        <SummaryCard label="Payment">
          <PaymentStatusBadge status={order.paymentStatus} />
        </SummaryCard>
        <SummaryCard label="Delivery">
          <DeliveryStatusBadge status={order.deliveryStatus} />
        </SummaryCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <LineItems order={order} />
          <Timeline order={order} />
        </div>

        <div className="space-y-4">
          {canManageOrders && form ? (
            <StatusControls
              form={form}
              loading={updateStatuses.isPending}
              onChange={setForm}
              onSubmit={() => updateStatuses.mutate(form)}
            />
          ) : null}
          <CustomerCard order={order} />
          <AddressCard title="Shipping address" value={order.shippingAddress} />
          <AddressCard title="Billing address" value={order.billingAddress} />
          <TotalsCard order={order} />
          <NotesCard order={order} />
        </div>
      </section>
    </div>
  );
}

function StatusControls(props: {
  form: StatusForm;
  loading: boolean;
  onChange: (form: StatusForm) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="space-y-4 rounded-md border p-4">
      <h2 className="font-medium">Update statuses</h2>
      <div className="grid gap-3">
        <SelectField
          label="Order"
          value={props.form.orderStatus}
          onChange={(orderStatus) =>
            props.onChange({ ...props.form, orderStatus: orderStatus as OrderStatus })
          }
          options={orderStatusOptions}
        />
        <SelectField
          label="Payment"
          value={props.form.paymentStatus}
          onChange={(paymentStatus) =>
            props.onChange({ ...props.form, paymentStatus: paymentStatus as PaymentStatus })
          }
          options={paymentStatusOptions}
        />
        <SelectField
          label="Delivery"
          value={props.form.deliveryStatus}
          onChange={(deliveryStatus) =>
            props.onChange({ ...props.form, deliveryStatus: deliveryStatus as DeliveryStatus })
          }
          options={deliveryStatusOptions}
        />
        <Field label="Note">
          <Textarea
            value={props.form.note}
            placeholder="Optional status note"
            onChange={(event) => props.onChange({ ...props.form, note: event.target.value })}
          />
        </Field>
      </div>
      <Button disabled={props.loading} onClick={props.onSubmit}>
        {props.loading ? "Updating..." : "Update statuses"}
      </Button>
    </section>
  );
}

function LineItems(props: { order: Order }) {
  const items = props.order.lineItems ?? [];
  return (
    <section className="space-y-3 rounded-md border p-4">
      <h2 className="font-medium">Line items</h2>
      <div className="hidden overflow-hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <LineItemTitle item={item} />
                </TableCell>
                <TableCell>{item.sku || "—"}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatMoney(item.unitPrice, props.order.currency)}</TableCell>
                <TableCell>{formatMoney(item.totalAmount, props.order.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 md:hidden">
        {items.map((item) => (
          <article key={item.id} className="rounded-md border p-3">
            <LineItemTitle item={item} />
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <InfoBlock label="SKU" value={item.sku || "—"} />
              <InfoBlock label="Quantity" value={item.quantity} />
              <InfoBlock label="Unit" value={formatMoney(item.unitPrice, props.order.currency)} />
              <InfoBlock label="Total" value={formatMoney(item.totalAmount, props.order.currency)} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LineItemTitle(props: { item: OrderLineItem }) {
  const imageUrl = props.item.imageUrl || props.item.variant?.imageUrls?.[0] || props.item.product?.coverImageUrl;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium">{props.item.productName}</p>
        <p className="truncate text-xs text-muted-foreground">{props.item.variantName || "Default"}</p>
      </div>
    </div>
  );
}

function CustomerCard(props: { order: Order }) {
  return (
    <section className="space-y-3 rounded-md border p-4">
      <h2 className="font-medium">Customer</h2>
      <InfoBlock label="Name" value={props.order.customerName} />
      <InfoBlock label="Email" value={props.order.customerEmail} />
      <InfoBlock label="Phone" value={props.order.customerPhone || "—"} />
      <InfoBlock label="Linked user" value={props.order.user?.email ?? "Guest / snapshot only"} />
    </section>
  );
}

function AddressCard(props: { title: string; value?: Record<string, unknown> | null }) {
  return (
    <section className="space-y-3 rounded-md border p-4">
      <h2 className="font-medium">{props.title}</h2>
      <AddressValue value={props.value} />
    </section>
  );
}

function AddressValue(props: { value?: Record<string, unknown> | null }) {
  if (!props.value || Object.keys(props.value).length === 0) {
    return <p className="text-sm text-muted-foreground">No address saved.</p>;
  }

  return (
    <dl className="grid gap-2 text-sm">
      {Object.entries(props.value).map(([key, value]) => (
        <div key={key}>
          <dt className="text-xs capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</dt>
          <dd className="break-words font-medium">{formatAddressValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function TotalsCard(props: { order: Order }) {
  return (
    <section className="space-y-2 rounded-md border p-4 text-sm">
      <h2 className="mb-3 font-medium">Totals</h2>
      <TotalRow label="Subtotal" value={props.order.subtotalAmount} currency={props.order.currency} />
      <TotalRow label="Discount" value={props.order.discountAmount} currency={props.order.currency} />
      <TotalRow label="Tax" value={props.order.taxAmount} currency={props.order.currency} />
      <TotalRow label="Shipping" value={props.order.shippingAmount} currency={props.order.currency} />
      <div className="border-t pt-2">
        <TotalRow label="Total" value={props.order.totalAmount} currency={props.order.currency} strong />
      </div>
    </section>
  );
}

function TotalRow(props: { label: string; value: string; currency: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{props.label}</span>
      <span className={props.strong ? "font-semibold" : "font-medium"}>
        {formatMoney(props.value, props.currency)}
      </span>
    </div>
  );
}

function NotesCard(props: { order: Order }) {
  return (
    <section className="space-y-3 rounded-md border p-4">
      <h2 className="font-medium">Notes</h2>
      <InfoBlock label="Customer notes" value={props.order.customerNotes || "—"} />
      <InfoBlock label="Admin notes" value={props.order.adminNotes || "—"} />
      <InfoBlock label="Placed" value={formatDate(props.order.placedAt)} />
      <InfoBlock label="Updated" value={formatDate(props.order.updatedAt)} />
    </section>
  );
}

function Timeline(props: { order: Order }) {
  const events = props.order.statusEvents ?? [];
  return (
    <section className="space-y-3 rounded-md border p-4">
      <h2 className="font-medium">Timeline</h2>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No status events yet.</p>
      ) : (
        <div className="grid gap-3">
          {events.map((event) => (
            <article key={event.id} className="rounded-md border p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusEventBadge type={event.type} value={event.newValue} />
                <span className="text-muted-foreground">
                  {event.previousValue ? `${event.previousValue} → ${event.newValue}` : event.newValue}
                </span>
              </div>
              {event.note ? <p className="mt-2">{event.note}</p> : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDate(event.createdAt)} · {event.actorUser?.email ?? "System"}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusEventBadge(props: { type: string; value: string }) {
  if (props.type === "payment" && props.value in paymentStatusMeta) {
    return <PaymentStatusBadge status={props.value as PaymentStatus} />;
  }
  if (props.type === "delivery" && props.value in deliveryStatusMeta) {
    return <DeliveryStatusBadge status={props.value as DeliveryStatus} />;
  }
  if (props.value in orderStatusMeta) {
    return <OrderStatusBadge status={props.value as OrderStatus} />;
  }
  return null;
}

function SummaryCard(props: { label: string; children: ReactNode }) {
  return (
    <section className="rounded-md border p-4">
      <p className="mb-2 text-xs text-muted-foreground">{props.label}</p>
      {props.children}
    </section>
  );
}

function InfoBlock(props: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{props.label}</p>
      <div className="break-words font-medium">{props.value}</div>
    </div>
  );
}

function formatAddressValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
