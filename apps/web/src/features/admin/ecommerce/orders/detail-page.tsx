import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Img } from "@/components/core/img";
import { InfoTooltip } from "@/components/core/info-tooltip";
import { ReviewBar, type ReviewBarItem } from "@/components/core/review-bar";
import { UserAvatar } from "@/components/core/user-avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/providers/session-provider";
import { ecommerceApi } from "../apiCall";
import type {
  DeliveryStatus,
  Order,
  OrderLineItem,
  OrderStatus,
  PaymentStatus,
} from "../types";
import {
  EcommerceHeader,
  ecommercePermissions,
  formatDate,
  readError,
} from "../ui";
import { formatMoney } from "./orders-table";
import { FulfillmentCard } from "./fulfillment";
import { OrderOperationsCard } from "./order-operations";
import {
  DeliveryStatusBadge,
  DeliveryStatusSelect,
  InventoryStatusBadge,
  OrderStatusBadge,
  OrderStatusSelect,
  PaymentStatusBadge,
  PaymentStatusSelect,
  deliveryStatusMeta,
  orderStatusMeta,
  paymentStatusMeta,
} from "./status";

type StatusForm = {
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
};

type EditableStatusField = keyof StatusForm;

const statusFieldLabels: Record<EditableStatusField, string> = {
  orderStatus: "Order status",
  paymentStatus: "Payment status",
  deliveryStatus: "Delivery status",
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

const orderFieldLabels: Record<keyof OrderEditForm, string> = {
  customerName: "Customer name",
  customerEmail: "Customer email",
  customerPhone: "Customer phone",
  customerNotes: "Customer notes",
  adminNotes: "Admin notes",
  shippingLine1: "Shipping address line 1",
  shippingLine2: "Shipping address line 2",
  shippingCity: "Shipping city",
  shippingState: "Shipping region",
  shippingPostalCode: "Shipping postal code",
  shippingCountry: "Shipping country",
  billingLine1: "Billing address line 1",
  billingLine2: "Billing address line 2",
  billingCity: "Billing city",
  billingState: "Billing region",
  billingPostalCode: "Billing postal code",
  billingCountry: "Billing country",
};

export function AdminOrderDetailPage(props: { orderId: string }) {
  const { session } = useSession();
  const {
    canManageOrders,
    canFulfillOrders,
    canCancelOrders,
    canRefundOrders,
  } = ecommercePermissions(session);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.admin.ecommerce.orders.detail(props.orderId),
    queryFn: () => ecommerceApi.orders.detail(props.orderId) as Promise<Order>,
  });
  const order = query.data;
  const [form, setForm] = useState<StatusForm | null>(null);
  const [editForm, setEditForm] = useState<OrderEditForm | null>(null);
  const [editingField, setEditingField] = useState<keyof OrderEditForm | null>(
    null,
  );

  useEffect(() => {
    if (!order) {
      return;
    }
    setForm({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
    });
    setEditForm(orderEditForm(order));
  }, [order]);

  const updateOrder = useMutation({
    mutationFn: async (input: {
      details: OrderEditForm;
      updateDetails: boolean;
      statuses: StatusForm;
      updateStatuses: boolean;
    }) => {
      const updates: Promise<unknown>[] = [];
      if (input.updateDetails) {
        updates.push(
          ecommerceApi.orders.update(props.orderId, {
            customerName: input.details.customerName,
            customerEmail: input.details.customerEmail,
            customerPhone: input.details.customerPhone || null,
            customerNotes: input.details.customerNotes || null,
            adminNotes: input.details.adminNotes || null,
            addresses: [
              {
                type: "shipping",
                fullName: input.details.customerName,
                email: input.details.customerEmail,
                phone: input.details.customerPhone || null,
                line1: input.details.shippingLine1,
                line2: input.details.shippingLine2 || null,
                city: input.details.shippingCity || null,
                state: input.details.shippingState || null,
                postalCode: input.details.shippingPostalCode || null,
                country: input.details.shippingCountry || null,
              },
              {
                type: "billing",
                fullName: input.details.customerName,
                email: input.details.customerEmail,
                phone: input.details.customerPhone || null,
                line1:
                  input.details.billingLine1 || input.details.shippingLine1,
                line2: input.details.billingLine2 || null,
                city: input.details.billingCity || null,
                state: input.details.billingState || null,
                postalCode: input.details.billingPostalCode || null,
                country: input.details.billingCountry || null,
              },
            ],
          }),
        );
      }
      if (input.updateStatuses) {
        updates.push(
          ecommerceApi.orders.updateStatuses(props.orderId, {
            ...input.statuses,
            note: "Updated from the admin order details page.",
          }),
        );
      }
      return Promise.all(updates);
    },
    onSuccess: () => {
      toast.success("Order updated");
      setEditingField(null);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.ecommerce.orders.all(),
      });
    },
    onError: (error) => toast.error(readError(error, "Failed to update order")),
  });

  if (query.isLoading) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        Order not found.
      </div>
    );
  }

  const originalEditForm = orderEditForm(order);
  const originalStatuses: StatusForm = {
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    deliveryStatus: order.deliveryStatus,
  };
  const changedFields = editForm
    ? (Object.keys(editForm) as Array<keyof OrderEditForm>).filter(
        (field) => editForm[field] !== originalEditForm[field],
      )
    : [];
  const changedStatuses = form
    ? (Object.keys(originalStatuses) as EditableStatusField[]).filter(
        (field) => form[field] !== originalStatuses[field],
      )
    : [];
  const detailReviewItems: ReviewBarItem[] = changedFields.map((field) => ({
    id: field,
    title: `${orderFieldLabels[field]} changed`,
    description: `${displayDraftValue(originalEditForm[field])} → ${displayDraftValue(editForm?.[field] ?? "")}`,
  }));
  const statusReviewItems: ReviewBarItem[] = changedStatuses.map((field) => {
    const meta =
      field === "orderStatus"
        ? orderStatusMeta
        : field === "paymentStatus"
          ? paymentStatusMeta
          : deliveryStatusMeta;
    return {
      id: `status:${field}`,
      title: `${statusFieldLabels[field]} changed`,
      description: `${meta[originalStatuses[field] as keyof typeof meta]?.label ?? originalStatuses[field]} → ${meta[form?.[field] as keyof typeof meta]?.label ?? form?.[field]}`,
    };
  });
  const reviewItems = [...statusReviewItems, ...detailReviewItems];

  return (
    <div className="space-y-6">
      <EcommerceHeader
        title={order.orderNumber}
        description={`${order.customerName} · ${formatMoney(order.totalAmount, order.currency)}`}
        action={
          <Link
            to="/admin/orders"
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Orders
          </Link>
        }
      />

      <section className="rounded-lg border bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatusSummary
            label="Order status"
            explanation="The order's overall workflow state."
          >
            {canManageOrders && form ? (
              <OrderStatusSelect
                value={form.orderStatus}
                currentValue={order.orderStatus}
                onChange={(orderStatus) => setForm({ ...form, orderStatus })}
              />
            ) : (
              <OrderStatusBadge status={order.orderStatus} />
            )}
          </StatusSummary>
          <StatusSummary
            label="Payment"
            explanation="Whether payment is due, authorized, paid, failed, or refunded."
          >
            {canManageOrders && form ? (
              <PaymentStatusSelect
                value={form.paymentStatus}
                currentValue={order.paymentStatus}
                onChange={(paymentStatus) =>
                  setForm({ ...form, paymentStatus })
                }
              />
            ) : (
              <PaymentStatusBadge status={order.paymentStatus} />
            )}
          </StatusSummary>
          <StatusSummary
            label="Delivery"
            explanation="General progress is editable here. Shipped and delivered use the guarded fulfillment actions below."
          >
            {canManageOrders && form ? (
              <DeliveryStatusSelect
                value={form.deliveryStatus}
                currentValue={order.deliveryStatus}
                onChange={(deliveryStatus) =>
                  setForm({ ...form, deliveryStatus })
                }
              />
            ) : (
              <DeliveryStatusBadge status={order.deliveryStatus} />
            )}
          </StatusSummary>
          <StatusSummary
            label="Inventory"
            explanation="Managed automatically when stock is reserved, committed, released, or restocked."
          >
            <InventoryStatusBadge status={order.inventoryStatus} />
          </StatusSummary>
        </div>
      </section>

      <section className="space-y-4">
        <LineItems order={order} />
        <Timeline order={order} />
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
        <div className="grid gap-4">
          {editForm ? (
            <CustomerDetailsCard
              order={order}
              form={editForm}
              editable={canManageOrders}
              editingField={editingField}
              onEdit={setEditingField}
              onChange={(field, value) =>
                setEditForm({ ...editForm, [field]: value })
              }
            />
          ) : null}
          {editForm ? (
            <AddressesCard
              form={editForm}
              editable={canManageOrders}
              editingField={editingField}
              onEdit={setEditingField}
              onChange={(field, value) =>
                setEditForm({ ...editForm, [field]: value })
              }
            />
          ) : null}
          {editForm ? (
            <NotesDetailsCard
              order={order}
              form={editForm}
              editable={canManageOrders}
              editingField={editingField}
              onEdit={setEditingField}
              onChange={(field, value) =>
                setEditForm({ ...editForm, [field]: value })
              }
            />
          ) : null}
        </div>
        <div className="grid gap-4">
          <TotalsCard order={order} />
          <OrderOperationsCard
            order={order}
            canCancel={canCancelOrders}
            canRefund={canRefundOrders}
          />
          <FulfillmentCard order={order} canFulfill={canFulfillOrders} />
          <OperationalCard order={order} />
        </div>
      </section>

      <ReviewBar
        items={reviewItems}
        updating={updateOrder.isPending}
        updateLabel="Update order"
        onRemove={(id) => {
          if (id.startsWith("status:")) {
            const field = id.slice(7) as EditableStatusField;
            setForm((current) =>
              current
                ? { ...current, [field]: originalStatuses[field] }
                : current,
            );
            return;
          }
          const field = id as keyof OrderEditForm;
          setEditForm((current) =>
            current
              ? { ...current, [field]: originalEditForm[field] }
              : current,
          );
          setEditingField((current) => (current === field ? null : current));
        }}
        onCancel={() => {
          setEditForm(originalEditForm);
          setForm(originalStatuses);
          setEditingField(null);
        }}
        onUpdate={() =>
          editForm &&
          form &&
          updateOrder.mutate({
            details: editForm,
            updateDetails: changedFields.length > 0,
            statuses: form,
            updateStatuses: changedStatuses.length > 0,
          })
        }
      />
    </div>
  );
}

type EditableDetailsProps = {
  form: OrderEditForm;
  editable: boolean;
  editingField: keyof OrderEditForm | null;
  onEdit: (field: keyof OrderEditForm | null) => void;
  onChange: (field: keyof OrderEditForm, value: string) => void;
};

function CustomerDetailsCard(props: EditableDetailsProps & { order: Order }) {
  return (
    <section className="space-y-4 rounded-lg border p-4 sm:p-5">
      <h2 className="font-medium">Customer</h2>
      <div className="grid gap-3">
        <InlineEditableField field="customerName" label="Name" {...props} />
        <InlineEditableField
          field="customerEmail"
          label="Email"
          type="email"
          {...props}
        />
        <InlineEditableField field="customerPhone" label="Phone" {...props} />
        <InfoBlock
          label="Linked user"
          value={props.order.user?.email ?? "Guest / snapshot only"}
          explanation="This is linked automatically when checkout uses a signed-in account. Guest orders keep only the customer snapshot."
        />
      </div>
    </section>
  );
}

function AddressesCard(props: EditableDetailsProps) {
  const billingMatchesShipping = [
    "Line1",
    "Line2",
    "City",
    "State",
    "PostalCode",
    "Country",
  ].every(
    (suffix) =>
      props.form[`billing${suffix}` as keyof OrderEditForm] ===
      props.form[`shipping${suffix}` as keyof OrderEditForm],
  );
  return (
    <section className="space-y-4 rounded-lg border p-4 sm:p-5">
      <div>
        <h2 className="font-medium">Addresses</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Shipping is used for delivery. Billing is retained with the order
          record.
        </p>
      </div>
      <Tabs defaultValue="shipping">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="billing">
            Billing{billingMatchesShipping ? " · Same" : ""}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="shipping" className="pt-2">
          <AddressFields prefix="shipping" {...props} />
        </TabsContent>
        <TabsContent value="billing" className="pt-2">
          {billingMatchesShipping ? (
            <p className="mb-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Billing currently matches the shipping address.
            </p>
          ) : null}
          <AddressFields prefix="billing" {...props} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function AddressFields(
  props: EditableDetailsProps & { prefix: "shipping" | "billing" },
) {
  const fields = [
    ["Line1", "Address line 1"],
    ["Line2", "Address line 2"],
    ["City", "City"],
    ["State", "Region"],
    ["PostalCode", "Postal code"],
    ["Country", "Country"],
  ] as const;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([suffix, label]) => (
        <InlineEditableField
          key={suffix}
          field={`${props.prefix}${suffix}` as keyof OrderEditForm}
          label={label}
          {...props}
        />
      ))}
    </div>
  );
}

function NotesDetailsCard(props: EditableDetailsProps & { order: Order }) {
  return (
    <section className="space-y-4 rounded-lg border p-4 sm:p-5">
      <h2 className="font-medium">Notes</h2>
      <div className="grid gap-3">
        <InlineEditableField
          field="customerNotes"
          label="Customer notes"
          multiline
          {...props}
        />
        <InlineEditableField
          field="adminNotes"
          label="Admin notes"
          multiline
          {...props}
        />
        <InfoBlock
          label="Placed"
          value={formatDate(props.order.placedAt)}
          explanation="Set automatically when the order is placed and cannot be edited."
        />
        <InfoBlock
          label="Updated"
          value={formatDate(props.order.updatedAt)}
          explanation="Updated automatically whenever the order record changes."
        />
      </div>
    </section>
  );
}

function InlineEditableField(
  props: EditableDetailsProps & {
    field: keyof OrderEditForm;
    label: string;
    type?: string;
    multiline?: boolean;
  },
) {
  const editing = props.editingField === props.field;
  const value = props.form[props.field];
  return (
    <div className="group min-w-0">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{props.label}</p>
        {props.editable && !editing ? (
          <Button
            variant="ghost"
            size="icon-xs"
            className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            onClick={() => props.onEdit(props.field)}
          >
            <Pencil />
            <span className="sr-only">Edit {props.label}</span>
          </Button>
        ) : null}
      </div>
      {editing ? (
        <div className="relative">
          {props.multiline ? (
            <Textarea
              autoFocus
              className="pr-9"
              value={value}
              onChange={(event) =>
                props.onChange(props.field, event.target.value)
              }
            />
          ) : (
            <Input
              autoFocus
              className="pr-9"
              type={props.type}
              value={value}
              onChange={(event) =>
                props.onChange(props.field, event.target.value)
              }
            />
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            className="absolute right-1.5 top-1.5"
            onClick={() => props.onEdit(null)}
          >
            <X />
            <span className="sr-only">Close {props.label} editor</span>
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!props.editable}
          className="block w-full truncate text-left text-sm font-medium disabled:cursor-default"
          onClick={() => props.editable && props.onEdit(props.field)}
        >
          {displayDraftValue(value)}
        </button>
      )}
    </div>
  );
}

function LineItems(props: { order: Order }) {
  const items = props.order.lineItems ?? [];
  return (
    <section className="space-y-3 rounded-lg border p-4 sm:p-5">
      <CardHeading explanation="These are purchase-time product snapshots. Product catalog edits do not rewrite an existing order.">
        Line items
      </CardHeading>
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
                <TableCell>
                  {formatMoney(item.unitPrice, props.order.currency)}
                </TableCell>
                <TableCell>
                  {formatMoney(item.totalAmount, props.order.currency)}
                </TableCell>
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
              <InfoBlock
                label="Unit"
                value={formatMoney(item.unitPrice, props.order.currency)}
              />
              <InfoBlock
                label="Total"
                value={formatMoney(item.totalAmount, props.order.currency)}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LineItemTitle(props: { item: OrderLineItem }) {
  const imageUrl =
    props.item.imageUrl ||
    props.item.variant?.imageUrls?.[0] ||
    props.item.product?.coverImageUrl;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {imageUrl ? (
          <Img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0">
        {props.item.productId ? (
          <Link
            to="/admin/products/$productId"
            params={{ productId: props.item.productId }}
            target="_blank"
            rel="noreferrer"
            className="block truncate font-medium hover:underline"
          >
            {props.item.productName}
          </Link>
        ) : (
          <p className="truncate font-medium">{props.item.productName}</p>
        )}
        <p className="truncate text-xs text-muted-foreground">
          {props.item.variantName || "Default"}
        </p>
      </div>
    </div>
  );
}

function OperationalCard(props: { order: Order }) {
  return (
    <section className="space-y-3 rounded-lg border p-4 sm:p-5">
      <CardHeading explanation="Operational values are captured at checkout or changed automatically by inventory actions.">
        Operations
      </CardHeading>
      <InfoBlock
        label="Payment method"
        value={formatPaymentMethod(props.order.paymentMethod)}
        explanation="Chosen during checkout. This is the payment channel, not the payment status."
      />
      <InfoBlock
        label="Shipping method"
        value={
          props.order.shippingMethodLabel ||
          props.order.shippingMethodCode ||
          "—"
        }
        explanation="The shipping rate selected during checkout. Manage available methods from Admin Shipping."
      />
      <InfoBlock
        label="Reserved until"
        value={formatDate(props.order.stockReservedUntil)}
        explanation="The reservation expiry is set automatically when checkout temporarily holds stock. Release expired stock from the order list."
      />
      <InfoBlock
        label="Committed at"
        value={formatDate(props.order.stockCommittedAt)}
        explanation="Set automatically when a reserved order is confirmed and its inventory becomes committed."
      />
      <InfoBlock
        label="Released/restocked at"
        value={formatDate(props.order.stockReleasedAt)}
        explanation="Set automatically when reserved stock is released or committed stock is returned to inventory."
      />
    </section>
  );
}

function TotalsCard(props: { order: Order }) {
  return (
    <section className="space-y-2 rounded-lg border p-4 text-sm sm:p-5">
      <CardHeading explanation="These amounts are checkout snapshots calculated from line items, discounts, tax, and shipping.">
        Totals
      </CardHeading>
      <TotalRow
        label="Subtotal"
        value={props.order.subtotalAmount}
        currency={props.order.currency}
      />
      <TotalRow
        label={props.order.discountCodeSnapshot ? `Discount (${props.order.discountCodeSnapshot})` : "Discount"}
        value={props.order.discountAmount}
        currency={props.order.currency}
      />
      <TotalRow
        label="Tax"
        value={props.order.taxAmount}
        currency={props.order.currency}
      />
      <TotalRow
        label="Shipping"
        value={props.order.shippingAmount}
        currency={props.order.currency}
      />
      <div className="border-t pt-2">
        <TotalRow
          label="Total"
          value={props.order.totalAmount}
          currency={props.order.currency}
          strong
        />
      </div>
    </section>
  );
}

function TotalRow(props: {
  label: string;
  value: string;
  currency: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{props.label}</span>
      <span className={props.strong ? "font-semibold" : "font-medium"}>
        {formatMoney(props.value, props.currency)}
      </span>
    </div>
  );
}

function Timeline(props: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const events = [...(props.order.statusEvents ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const visibleEvents = expanded ? events : events.slice(0, 3);
  return (
    <section className="space-y-4 rounded-lg border p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <CardHeading explanation="A read-only audit history created by order, payment, delivery, tracking, and fulfillment actions.">
          Timeline
        </CardHeading>
        <span className="text-xs text-muted-foreground">
          {events.length} {events.length === 1 ? "event" : "events"}
        </span>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No status events yet.</p>
      ) : (
        <div className="relative ml-2 border-l pl-5">
          {visibleEvents.map((event, index) => (
            <article
              key={event.id}
              className={
                index === visibleEvents.length - 1
                  ? "relative pb-0 text-sm"
                  : "relative pb-5 text-sm"
              }
            >
              <span className="absolute -left-[1.55rem] top-1 size-2 rounded-full bg-primary ring-4 ring-background" />
              <div className="flex flex-wrap items-center gap-2">
                <StatusEventBadge type={event.type} value={event.newValue} />
                <span className="text-muted-foreground">
                  {event.previousValue
                    ? `${event.previousValue} → ${event.newValue}`
                    : event.newValue}
                </span>
              </div>
              {event.note ? <p className="mt-2">{event.note}</p> : null}
              {event.actorUser ? (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <UserAvatar
                    className="size-5"
                    image={event.actorUser.image}
                    name={event.actorUser.name}
                  />
                  <span>
                    {formatDate(event.createdAt)} · {event.actorUser.email}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(event.createdAt)} · System
                </p>
              )}
            </article>
          ))}
        </div>
      )}
      {events.length > 3 ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? <ChevronUp /> : <ChevronDown />}
          {expanded ? "Show less" : `Show all ${events.length} events`}
        </Button>
      ) : null}
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

function StatusSummary(props: {
  label: string;
  explanation?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 xl:not-last:border-r xl:not-last:pr-4">
      <div className="mb-2 flex items-center gap-1">
        <p className="text-xs text-muted-foreground">{props.label}</p>
        {props.explanation ? (
          <InfoTooltip>{props.explanation}</InfoTooltip>
        ) : null}
      </div>
      {props.children}
    </div>
  );
}

function InfoBlock(props: {
  label: string;
  value: ReactNode;
  explanation?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1">
        <p className="text-xs text-muted-foreground">{props.label}</p>
        {props.explanation ? (
          <InfoTooltip>{props.explanation}</InfoTooltip>
        ) : null}
      </div>
      <div className="break-words font-medium">{props.value}</div>
    </div>
  );
}

function CardHeading(props: { children: ReactNode; explanation: string }) {
  return (
    <div className="flex items-center gap-1">
      <h2 className="font-medium">{props.children}</h2>
      <InfoTooltip>{props.explanation}</InfoTooltip>
    </div>
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

function displayDraftValue(value: string) {
  return value.trim() || "—";
}
