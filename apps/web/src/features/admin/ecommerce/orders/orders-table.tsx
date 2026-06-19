import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Order } from "../types";
import { EmptyTableRow, formatDate } from "../ui";
import {
  DeliveryStatusBadge,
  InventoryStatusBadge,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./status";

type OrdersTableProps = {
  orders: Order[];
  loading: boolean;
};

export function OrdersTable(props: OrdersTableProps) {
  return (
    <>
      <div className="hidden rounded-md border lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Order status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.loading ? (
              <EmptyTableRow colSpan={10}>Loading orders...</EmptyTableRow>
            ) : props.orders.length === 0 ? (
              <EmptyTableRow colSpan={10}>No orders found.</EmptyTableRow>
            ) : (
              props.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <OrderTitle order={order} />
                  </TableCell>
                  <TableCell>
                    <CustomerSummary order={order} />
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.orderStatus} />
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </TableCell>
                  <TableCell>
                    <DeliveryStatusBadge status={order.deliveryStatus} />
                  </TableCell>
                  <TableCell>
                    <InventoryStatusBadge status={order.inventoryStatus} />
                  </TableCell>
                  <TableCell>{order.lineItemCount ?? 0}</TableCell>
                  <TableCell>{formatMoney(order.totalAmount, order.currency)}</TableCell>
                  <TableCell>{formatDate(order.placedAt)}</TableCell>
                  <TableCell className="text-right">
                    <OrderActions order={order} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {props.loading ? (
          <OrdersStateCard>Loading orders...</OrdersStateCard>
        ) : props.orders.length === 0 ? (
          <OrdersStateCard>No orders found.</OrdersStateCard>
        ) : (
          props.orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </>
  );
}

function OrderCard(props: { order: Order }) {
  return (
    <article className="rounded-md border bg-card p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <OrderTitle order={props.order} />
        <OrderActions order={props.order} />
      </div>
      <div className="mt-3">
        <CustomerSummary order={props.order} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <OrderStatusBadge status={props.order.orderStatus} />
        <PaymentStatusBadge status={props.order.paymentStatus} />
        <DeliveryStatusBadge status={props.order.deliveryStatus} />
        <InventoryStatusBadge status={props.order.inventoryStatus} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <InfoBlock label="Items" value={props.order.lineItemCount ?? 0} />
        <InfoBlock label="Payment" value={formatPaymentMethod(props.order.paymentMethod)} />
        <InfoBlock label="Total" value={formatMoney(props.order.totalAmount, props.order.currency)} />
        <InfoBlock label="Placed" value={formatDate(props.order.placedAt)} />
        <InfoBlock label="Updated" value={formatDate(props.order.updatedAt)} />
      </div>
    </article>
  );
}

function OrderActions(props: { order: Order }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={(triggerProps) => (
          <Button variant="ghost" className="h-8 w-8 p-0" {...triggerProps}>
            <span className="sr-only">Open order actions</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      />
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            render={(itemProps) => (
              <Link to="/admin/orders/$orderId" params={{ orderId: props.order.id }} {...itemProps}>
                <Eye className="h-4 w-4" />
                View details
              </Link>
            )}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function OrderTitle(props: { order: Order }) {
  return (
    <div className="min-w-0">
      <Link
        to="/admin/orders/$orderId"
        params={{ orderId: props.order.id }}
        className="font-medium hover:underline"
      >
        {props.order.orderNumber}
      </Link>
      <p className="truncate text-xs text-muted-foreground">{props.order.id}</p>
    </div>
  );
}

function CustomerSummary(props: { order: Order }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium">{props.order.customerName}</p>
      <p className="truncate text-xs text-muted-foreground">{props.order.customerEmail}</p>
    </div>
  );
}

function InfoBlock(props: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{props.label}</p>
      <div className="truncate font-medium">{props.value}</div>
    </div>
  );
}

function OrdersStateCard(props: { children: ReactNode }) {
  return (
    <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}

export function formatMoney(value?: string | null, currency = "BDT") {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) {
    return `${currency} ${value ?? "0"}`;
  }
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPaymentMethod(value?: string) {
  return (value ?? "cash_on_delivery")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
