import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Heart, Package, UserRound } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { client } from "@/lib/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PageResult, ShopOrder } from "@/features/shop/types";
import { formatMoney } from "@/features/shop/utils";
import { useSavedItemsStore } from "@/features/shop/saved-items-store";
import { OrderDetails } from "@/features/shop/track-order-page";

export const statusLabel = (value: string) => value.replace(/_/g, " ");
function useCustomerOrders(page: number, limit: number) {
  const { session } = useSession();
  return useQuery({
    queryKey: ["customer-orders", session?.user.id, page, limit],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data, error } = await client.shop.orders.get({
        query: { page, limit },
      });
      if (error)
        throw new Error("Unable to load your orders. Please try again.");
      return data as PageResult<ShopOrder>;
    },
  });
}
function OrdersState({
  pending,
  error,
  retry,
}: {
  pending: boolean;
  error: boolean;
  retry: () => void;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className="rounded-2xl border bg-card p-10 text-center"
    >
      <Package className="mx-auto size-10 text-muted-foreground" />
      <p className="mt-4 font-medium">
        {pending
          ? "Loading your orders…"
          : error
            ? "We couldn’t load your orders"
            : "Your next discovery starts here"}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {pending
          ? "Just a moment."
          : error
            ? "Please check your connection and try again."
            : "Orders placed with your account will appear here."}
      </p>
      {error ? (
        <Button variant="outline" className="mt-5" onClick={retry}>
          Try again
        </Button>
      ) : !pending ? (
        <Link
          to="/shop"
          className={buttonVariants({ className: "mt-5 rounded-full" })}
        >
          Browse the shop
        </Link>
      ) : null}
    </div>
  );
}
function OrderCard({ order }: { order: ShopOrder }) {
  return (
    <Link
      to="/orders/$orderNumber"
      params={{ orderNumber: order.orderNumber }}
      className="group block rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="break-all font-semibold">{order.orderNumber}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(order.placedAt || order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <ArrowUpRight className="size-5 text-muted-foreground" />
      </div>
      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
        {order.lineItems
          .map((item) => `${item.productName} × ${item.quantity}`)
          .join(", ")}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">
            {statusLabel(order.orderStatus)}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {statusLabel(order.deliveryStatus)}
          </Badge>
        </div>
        <p className="font-semibold">
          {formatMoney(order.totalAmount, order.currency)}
        </p>
      </div>
    </Link>
  );
}
export function CustomerDashboard() {
  const { session } = useSession();
  const query = useCustomerOrders(1, 4);
  const saved = useSavedItemsStore((state) => state.items.length);
  return (
    <main className="space-y-8">
      <header className="rounded-3xl bg-muted/40 p-6 md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Your account
        </p>
        <h1 className="mt-3 break-words text-3xl font-semibold tracking-tight md:text-4xl">
          Welcome back, {session?.user.name || "there"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your orders, favourite finds and account details. All in one place.
        </p>
      </header>
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            to: "/orders",
            icon: Package,
            title: "Your orders",
            text: "Follow purchases and delivery updates",
          },
          {
            to: "/saved",
            icon: Heart,
            title: "Saved items",
            text: `${saved} saved on this device`,
          },
          {
            to: "/account",
            icon: UserRound,
            title: "Your profile",
            text: "Manage your name and sign-in security",
          },
        ].map(({ to, icon: Icon, title, text }) => (
          <Link
            key={to}
            to={to}
            className="rounded-2xl border p-5 transition-colors hover:bg-muted/40"
          >
            <Icon className="size-5 text-primary" />
            <p className="mt-3 font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </Link>
        ))}
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Recent orders</h2>
          <Link to="/orders" className="text-sm underline underline-offset-4">
            View all
          </Link>
        </div>
        {query.isPending || query.isError || !query.data?.items.length ? (
          <OrdersState
            pending={query.isPending}
            error={query.isError}
            retry={() => void query.refetch()}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {query.data.items.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
export function CustomerOrdersPage() {
  const [page, setPage] = useState(1);
  const query = useCustomerOrders(page, 10);
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Your orders</h1>
        <p className="mt-3 text-muted-foreground">
          Review purchases, payment information and delivery updates.
        </p>
      </header>
      {query.isPending || query.isError || !query.data?.items.length ? (
        <OrdersState
          pending={query.isPending}
          error={query.isError}
          retry={() => void query.refetch()}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {query.data.items.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={page === 1 || query.isPending}
          onClick={() => setPage((value) => value - 1)}
        >
          Previous
        </Button>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          Page {page} of {query.data?.pages ?? page}
        </p>
        <Button
          variant="outline"
          disabled={!query.data || page >= query.data.pages || query.isPending}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </Button>
      </div>
    </main>
  );
}
export function CustomerOrderPage({ orderNumber }: { orderNumber: string }) {
  const { session } = useSession();
  const query = useQuery({
    queryKey: ["customer-order", session?.user.id, orderNumber],
    enabled: Boolean(session),
    queryFn: async () => {
      const { data, error } = await client.shop
        .orders({ orderNumber })
        .get({ query: {} });
      if (error)
        throw new Error(
          "This order is unavailable. Check the number and the account that placed it.",
        );
      return data as ShopOrder;
    },
  });
  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <Link to="/orders" className="text-sm underline underline-offset-4">
        Back to orders
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Order details</h1>
      {query.isPending || query.isError || !query.data ? (
        <OrdersState
          pending={query.isPending}
          error={query.isError}
          retry={() => void query.refetch()}
        />
      ) : (
        <section className="rounded-3xl border bg-card p-5 md:p-8">
          <OrderDetails
            order={query.data}
            onRefresh={() => void query.refetch()}
          />
        </section>
      )}
    </main>
  );
}
