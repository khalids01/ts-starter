import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { PackageSearch, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Img } from "@/components/core/img";
import { client } from "@/lib/client";
import type { ShopOrder } from "./types";
import { formatMoney } from "./utils";
import { PublicShopFooter, PublicShopShell } from "./public-shop-shell";

export function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const lookup = useMutation({
    mutationFn: async () => {
      const value = contact.trim();
      const query = value.includes("@") ? { email: value } : { phone: value };
      const { data, error } = await client.shop.orders({ orderNumber: orderNumber.trim() }).get({ query });
      if (error) {
        throw new Error(String(error.value?.message || error.message || "Failed to load order"));
      }
      return data as ShopOrder;
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (orderNumber.trim() && contact.trim()) {
      lookup.mutate();
    }
  };

  return (
    <PublicShopShell footer={<PublicShopFooter />}>
      <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 md:px-6">
        <section className="grid gap-2">
          <Badge variant="secondary" className="w-fit">
            Track order
          </Badge>
          <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">
            Check your delivery status
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Enter the order number and the email or phone used during checkout.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={submit} className="h-fit space-y-4 rounded-md border bg-card p-4">
            <div className="space-y-1.5">
              <Label htmlFor="order-number">Order number</Label>
              <Input
                id="order-number"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="ORD-..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order-contact">Email or phone</Label>
              <Input
                id="order-contact"
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="customer@example.com"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!orderNumber.trim() || !contact.trim() || lookup.isPending}
            >
              <Search className="size-4" />
              {lookup.isPending ? "Searching..." : "Find order"}
            </Button>
          </form>

          <div className="rounded-md border bg-card p-4">
            {lookup.isIdle ? (
              <EmptyTrackState />
            ) : lookup.isError ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                Order not found. Check the order number and customer email or phone.
              </div>
            ) : lookup.data ? (
              <OrderDetails order={lookup.data} />
            ) : (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                Loading order...
              </div>
            )}
          </div>
        </section>
      </main>
    </PublicShopShell>
  );
}

function EmptyTrackState() {
  return (
    <div className="rounded-md border border-dashed p-8 text-center">
      <PackageSearch className="mx-auto size-10 text-muted-foreground" />
      <h2 className="mt-4 font-medium">Find an order</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Guest orders can be opened with the order number and matching email or phone.
      </p>
      <Link to="/shop" className={buttonVariants({ variant: "outline", className: "mt-5" })}>
        Continue shopping
      </Link>
    </div>
  );
}

function OrderDetails(props: { order: ShopOrder }) {
  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm text-muted-foreground">Order</p>
          <h2 className="text-xl font-semibold">{props.order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">
            {props.order.customerName} · {props.order.customerEmail}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{props.order.orderStatus}</Badge>
          <Badge variant="secondary">{props.order.paymentStatus}</Badge>
          <Badge variant="outline">{props.order.deliveryStatus}</Badge>
        </div>
      </div>

      <Separator />

      <div className="grid gap-3">
        {props.order.lineItems.map((item) => (
          <article key={item.id} className="grid grid-cols-[64px_1fr_auto] gap-3 rounded-md border p-3">
            <div className="aspect-square overflow-hidden rounded-md bg-muted">
              {item.imageUrl ? (
                <Img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-xs text-muted-foreground">No image</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="line-clamp-1 font-medium">{item.productName}</p>
              <p className="line-clamp-1 text-sm text-muted-foreground">
                {item.variantName ?? item.sku ?? "Product"} x {item.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold">
              {formatMoney(item.totalAmount, props.order.currency)}
            </p>
          </article>
        ))}
      </div>

      <div className="ml-auto grid w-full gap-2 rounded-md border bg-background p-4 text-sm sm:max-w-sm">
        <SummaryRow label="Subtotal" value={props.order.subtotalAmount} currency={props.order.currency} />
        <SummaryRow label="Shipping" value={props.order.shippingAmount} currency={props.order.currency} />
        <SummaryRow label="Tax" value={props.order.taxAmount} currency={props.order.currency} />
        <Separator />
        <SummaryRow label="Total" value={props.order.totalAmount} currency={props.order.currency} strong />
      </div>
    </div>
  );
}

function SummaryRow(props: {
  label: string;
  value: string;
  currency: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{props.label}</span>
      <span className={props.strong ? "text-base font-semibold" : "font-medium"}>
        {formatMoney(props.value, props.currency)}
      </span>
    </div>
  );
}
