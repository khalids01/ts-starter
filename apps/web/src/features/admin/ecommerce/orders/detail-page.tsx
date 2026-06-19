import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { DeliveryStatus, Order, OrderAddress, OrderLineItem, OrderStatus, PaymentStatus } from "../types";
import { EcommerceHeader, Field, SelectField, ecommercePermissions, formatDate, readError } from "../ui";
import { formatMoney } from "./orders-table";
import {
  DeliveryStatusBadge,
  InventoryStatusBadge,
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

type OrderEditForm = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNotes: string;
  adminNotes: string;
  shippingLine1: string;
  shippingLine2: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  billingLine1: string;
  billingLine2: string;
  billingCity: string;
  billingState: string;
  billingPostalCode: string;
  billingCountry: string;
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
  const [editForm, setEditForm] = useState<OrderEditForm | null>(null);

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
    setEditForm(orderEditForm(order));
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
  const updateOrder = useMutation({
    mutationFn: (value: OrderEditForm) =>
      ecommerceApi.orders.update(props.orderId, {
        customerName: value.customerName,
        customerEmail: value.customerEmail,
        customerPhone: value.customerPhone || null,
        customerNotes: value.customerNotes || null,
        adminNotes: value.adminNotes || null,
        addresses: [
          {
            type: "shipping",
            fullName: value.customerName,
            email: value.customerEmail,
            phone: value.customerPhone || null,
            line1: value.shippingLine1,
            line2: value.shippingLine2 || null,
            city: value.shippingCity || null,
            state: value.shippingState || null,
            postalCode: value.shippingPostalCode || null,
            country: value.shippingCountry || null,
          },
          {
            type: "billing",
            fullName: value.customerName,
            email: value.customerEmail,
            phone: value.customerPhone || null,
            line1: value.billingLine1 || value.shippingLine1,
            line2: value.billingLine2 || null,
            city: value.billingCity || null,
            state: value.billingState || null,
            postalCode: value.billingPostalCode || null,
            country: value.billingCountry || null,
          },
        ],
      }),
    onSuccess: () => {
      toast.success("Order updated");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.ecommerce.orders.all(),
      });
    },
    onError: (error) => toast.error(readError(error, "Failed to update order")),
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

      <section className="grid gap-3 md:grid-cols-4">
        <SummaryCard label="Order status">
          <OrderStatusBadge status={order.orderStatus} />
        </SummaryCard>
        <SummaryCard label="Payment">
          <PaymentStatusBadge status={order.paymentStatus} />
        </SummaryCard>
        <SummaryCard label="Delivery">
          <DeliveryStatusBadge status={order.deliveryStatus} />
        </SummaryCard>
        <SummaryCard label="Inventory">
          <InventoryStatusBadge status={order.inventoryStatus} />
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
              order={order}
              form={form}
              loading={updateStatuses.isPending}
              onChange={setForm}
              onSubmit={() => updateStatuses.mutate(form)}
            />
          ) : null}
          {canManageOrders && editForm ? (
            <OrderEditPanel
              form={editForm}
              loading={updateOrder.isPending}
              onChange={setEditForm}
              onSubmit={() => updateOrder.mutate(editForm)}
            />
          ) : null}
          <OperationalCard order={order} />
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
  order: Order;
  form: StatusForm;
  loading: boolean;
  onChange: (form: StatusForm) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="space-y-4 rounded-md border p-4">
      <h2 className="font-medium">Update statuses</h2>
      <p className="text-xs text-muted-foreground">
        Confirming a reserved order commits stock. Cancelling a reserved order releases stock. Returning or cancelling a committed order restocks once.
      </p>
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

function OrderEditPanel(props: {
  form: OrderEditForm;
  loading: boolean;
  onChange: (form: OrderEditForm) => void;
  onSubmit: () => void;
}) {
  const update = (patch: Partial<OrderEditForm>) => props.onChange({ ...props.form, ...patch });
  return (
    <section className="space-y-4 rounded-md border p-4">
      <h2 className="font-medium">Edit order</h2>
      <div className="grid gap-3">
        <TextField label="Customer name" value={props.form.customerName} onChange={(customerName) => update({ customerName })} />
        <TextField label="Customer email" value={props.form.customerEmail} onChange={(customerEmail) => update({ customerEmail })} />
        <TextField label="Customer phone" value={props.form.customerPhone} onChange={(customerPhone) => update({ customerPhone })} />
        <TextField label="Shipping line 1" value={props.form.shippingLine1} onChange={(shippingLine1) => update({ shippingLine1 })} />
        <TextField label="Shipping line 2" value={props.form.shippingLine2} onChange={(shippingLine2) => update({ shippingLine2 })} />
        <TextField label="Shipping city" value={props.form.shippingCity} onChange={(shippingCity) => update({ shippingCity })} />
        <TextField label="Shipping region" value={props.form.shippingState} onChange={(shippingState) => update({ shippingState })} />
        <TextField label="Shipping postal code" value={props.form.shippingPostalCode} onChange={(shippingPostalCode) => update({ shippingPostalCode })} />
        <TextField label="Shipping country" value={props.form.shippingCountry} onChange={(shippingCountry) => update({ shippingCountry })} />
        <Field label="Customer notes">
          <Textarea value={props.form.customerNotes} onChange={(event) => update({ customerNotes: event.target.value })} />
        </Field>
        <Field label="Admin notes">
          <Textarea value={props.form.adminNotes} onChange={(event) => update({ adminNotes: event.target.value })} />
        </Field>
      </div>
      <Button disabled={props.loading} onClick={props.onSubmit}>
        {props.loading ? "Saving..." : "Save order"}
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

function OperationalCard(props: { order: Order }) {
  return (
    <section className="space-y-3 rounded-md border p-4">
      <h2 className="font-medium">Operations</h2>
      <InfoBlock label="Payment method" value={formatPaymentMethod(props.order.paymentMethod)} />
      <InfoBlock label="Shipping method" value={props.order.shippingMethodLabel || props.order.shippingMethodCode || "—"} />
      <InfoBlock label="Reserved until" value={formatDate(props.order.stockReservedUntil)} />
      <InfoBlock label="Committed at" value={formatDate(props.order.stockCommittedAt)} />
      <InfoBlock label="Released/restocked at" value={formatDate(props.order.stockReleasedAt)} />
    </section>
  );
}

function AddressCard(props: { title: string; value?: OrderAddress }) {
  return (
    <section className="space-y-3 rounded-md border p-4">
      <h2 className="font-medium">{props.title}</h2>
      <AddressValue value={props.value} />
    </section>
  );
}

function AddressValue(props: { value?: OrderAddress }) {
  if (!props.value || Object.keys(props.value).length === 0) {
    return <p className="text-sm text-muted-foreground">No address saved.</p>;
  }

  return (
    <dl className="grid gap-2 text-sm">
      {Object.entries(props.value)
        .filter(([key]) => !["id", "orderId", "type", "createdAt", "updatedAt"].includes(key))
        .map(([key, value]) => (
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

function TextField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={props.label}>
      <Input value={props.value} onChange={(event) => props.onChange(event.target.value)} />
    </Field>
  );
}

function formatPaymentMethod(value?: string) {
  return (value ?? "cash_on_delivery")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function orderEditForm(order: Order): OrderEditForm {
  const shipping = order.shippingAddress;
  const billing = order.billingAddress;
  return {
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone ?? "",
    customerNotes: order.customerNotes ?? "",
    adminNotes: order.adminNotes ?? "",
    shippingLine1: shipping?.line1 ?? "",
    shippingLine2: shipping?.line2 ?? "",
    shippingCity: shipping?.city ?? "",
    shippingState: shipping?.state ?? "",
    shippingPostalCode: shipping?.postalCode ?? "",
    shippingCountry: shipping?.country ?? "",
    billingLine1: billing?.line1 ?? "",
    billingLine2: billing?.line2 ?? "",
    billingCity: billing?.city ?? "",
    billingState: billing?.state ?? "",
    billingPostalCode: billing?.postalCode ?? "",
    billingCountry: billing?.country ?? "",
  };
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
