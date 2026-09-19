import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ImageIcon, Pencil, X } from "lucide-react";
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
  Field,
  SelectField,
  ecommercePermissions,
  formatDate,
  readError,
} from "../ui";
import { formatMoney } from "./orders-table";
import { FulfillmentCard } from "./fulfillment";
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
  const { canManageOrders, canFulfillOrders } = ecommercePermissions(session);
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
    onError: (error) =>
      toast.error(readError(error, "Failed to update order statuses")),
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
  const changedFields = editForm
    ? (Object.keys(editForm) as Array<keyof OrderEditForm>).filter(
        (field) => editForm[field] !== originalEditForm[field],
      )
    : [];
  const reviewItems: ReviewBarItem[] = changedFields.map((field) => ({
    id: field,
    title: `${orderFieldLabels[field]} changed`,
    description: `${displayDraftValue(originalEditForm[field])} → ${displayDraftValue(editForm?.[field] ?? "")}`,
  }));

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

      <section className="grid gap-3 md:grid-cols-4">
        <SummaryCard
          label="Order status"
          explanation="The order's overall workflow state. Change it from the Update statuses card below."
        >
          <OrderStatusBadge status={order.orderStatus} />
        </SummaryCard>
        <SummaryCard
          label="Payment"
          explanation="Whether payment is due, authorized, paid, failed, or refunded. Change it from the Update statuses card."
        >
          <PaymentStatusBadge status={order.paymentStatus} />
        </SummaryCard>
        <SummaryCard
          label="Delivery"
          explanation="The fulfillment progress. General transitions use Update statuses; shipped and delivered are changed through Fulfillment."
        >
          <DeliveryStatusBadge status={order.deliveryStatus} />
        </SummaryCard>
        <SummaryCard
          label="Inventory"
          explanation="This is managed automatically when stock is reserved, committed, released, or restocked by order actions."
        >
          <InventoryStatusBadge status={order.inventoryStatus} />
        </SummaryCard>
      </section>

      <section className="space-y-4">
        <LineItems order={order} />
        <Timeline order={order} />
      </section>

      <section className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        {canManageOrders && form ? (
          <StatusControls
            order={order}
            form={form}
            loading={updateStatuses.isPending}
            onChange={setForm}
            onSubmit={() => updateStatuses.mutate(form)}
          />
        ) : null}
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
          <AddressDetailsCard
            title="Shipping address"
            prefix="shipping"
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
          <AddressDetailsCard
            title="Billing address"
            prefix="billing"
            form={editForm}
            editable={canManageOrders}
            editingField={editingField}
            onEdit={setEditingField}
            onChange={(field, value) =>
              setEditForm({ ...editForm, [field]: value })
            }
          />
        ) : null}
        <OperationalCard order={order} />
        <FulfillmentCard order={order} canFulfill={canFulfillOrders} />
        <TotalsCard order={order} />
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
      </section>

      <ReviewBar
        items={reviewItems}
        updating={updateOrder.isPending}
        updateLabel="Update order"
        onRemove={(id) => {
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
          setEditingField(null);
        }}
        onUpdate={() => editForm && updateOrder.mutate(editForm)}
      />
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
  const generalDeliveryOptions = deliveryStatusOptions.filter(
    (option) =>
      !["shipped", "delivered"].includes(option.value) ||
      option.value === props.order.deliveryStatus,
  );

  return (
    <section className="space-y-4 rounded-md border p-4">
      <h2 className="font-medium">Update statuses</h2>
      <p className="text-xs text-muted-foreground">
        Confirming a reserved order commits stock. Cancelling a reserved order
        releases stock. Returning or cancelling a committed order restocks once.
      </p>
      <div className="grid gap-3">
        <SelectField
          label="Order"
          value={props.form.orderStatus}
          onChange={(orderStatus) =>
            props.onChange({
              ...props.form,
              orderStatus: orderStatus as OrderStatus,
            })
          }
          options={orderStatusOptions}
        />
        <SelectField
          label="Payment"
          value={props.form.paymentStatus}
          onChange={(paymentStatus) =>
            props.onChange({
              ...props.form,
              paymentStatus: paymentStatus as PaymentStatus,
            })
          }
          options={paymentStatusOptions}
        />
        <SelectField
          label="Delivery"
          value={props.form.deliveryStatus}
          onChange={(deliveryStatus) =>
            props.onChange({
              ...props.form,
              deliveryStatus: deliveryStatus as DeliveryStatus,
            })
          }
          options={generalDeliveryOptions}
        />
        <Field label="Note">
          <Textarea
            value={props.form.note}
            placeholder="Optional status note"
            onChange={(event) =>
              props.onChange({ ...props.form, note: event.target.value })
            }
          />
        </Field>
      </div>
      <Button disabled={props.loading} onClick={props.onSubmit}>
        {props.loading ? "Updating..." : "Update statuses"}
      </Button>
    </section>
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
    <section className="space-y-4 rounded-md border p-4">
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

function AddressDetailsCard(
  props: EditableDetailsProps & {
    title: string;
    prefix: "shipping" | "billing";
  },
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
    <section className="space-y-4 rounded-md border p-4">
      <h2 className="font-medium">{props.title}</h2>
      <div className="grid gap-3">
        {fields.map(([suffix, label]) => (
          <InlineEditableField
            key={suffix}
            field={`${props.prefix}${suffix}` as keyof OrderEditForm}
            label={label}
            {...props}
          />
        ))}
      </div>
    </section>
  );
}

function NotesDetailsCard(props: EditableDetailsProps & { order: Order }) {
  return (
    <section className="space-y-4 rounded-md border p-4">
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
    <section className="space-y-3 rounded-md border p-4">
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
    <section className="space-y-3 rounded-md border p-4">
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
    <section className="space-y-2 rounded-md border p-4 text-sm">
      <CardHeading explanation="These amounts are checkout snapshots calculated from line items, discounts, tax, and shipping.">
        Totals
      </CardHeading>
      <TotalRow
        label="Subtotal"
        value={props.order.subtotalAmount}
        currency={props.order.currency}
      />
      <TotalRow
        label="Discount"
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
  const events = props.order.statusEvents ?? [];
  return (
    <section className="space-y-3 rounded-md border p-4">
      <CardHeading explanation="A read-only audit history created by order, payment, delivery, tracking, and fulfillment actions.">
        Timeline
      </CardHeading>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No status events yet.</p>
      ) : (
        <div className="grid gap-3">
          {events.map((event) => (
            <article key={event.id} className="rounded-md border p-3 text-sm">
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

function SummaryCard(props: {
  label: string;
  explanation?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border p-4">
      <div className="mb-2 flex items-center gap-1">
        <p className="text-xs text-muted-foreground">{props.label}</p>
        {props.explanation ? (
          <InfoTooltip>{props.explanation}</InfoTooltip>
        ) : null}
      </div>
      {props.children}
    </section>
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
