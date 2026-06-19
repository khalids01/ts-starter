import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { shopApi } from "./api";
import type { CheckoutResult, ShopCart, ShopShippingRate } from "./types";
import { formatMoney } from "./utils";
import { ShopHeader } from "./shop-page";

type CheckoutForm = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  shippingRateId: string;
  customerNotes: string;
};

const initialForm: CheckoutForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "Bangladesh",
  shippingRateId: "",
  customerNotes: "",
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const cartQuery = useQuery({
    queryKey: queryKeys.shop.cart(),
    queryFn: () => shopApi.cart() as Promise<ShopCart>,
  });
  const shippingRatesQuery = useQuery({
    queryKey: ["shop", "shipping-rates"],
    queryFn: () => shopApi.shippingRates() as Promise<ShopShippingRate[]>,
  });
  const cart = cartQuery.data;
  const shippingRates = shippingRatesQuery.data ?? [];
  const selectedShippingRate =
    shippingRates.find((rate) => rate.id === form.shippingRateId) ??
    shippingRates.find((rate) => rate.isDefault) ??
    shippingRates[0];

  const checkout = useMutation({
    mutationFn: () =>
      shopApi.checkout({
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone || null,
        shippingAddress: {
          fullName: form.customerName,
          email: form.customerEmail,
          phone: form.customerPhone || null,
          line1: form.addressLine1,
          line2: form.addressLine2 || null,
          city: form.city,
          state: form.region || null,
          postalCode: form.postalCode || null,
          country: form.country,
        },
        billingAddress: null,
        shippingRateId: selectedShippingRate?.id,
        paymentMethod: "cash_on_delivery",
        idempotencyKey,
        customerNotes: form.customerNotes || null,
      }) as Promise<CheckoutResult>,
    onSuccess: (result) => {
      toast.success("Order placed");
      void queryClient.invalidateQueries({ queryKey: queryKeys.shop.cart() });
      void navigate({ to: "/checkout/success/$orderId", params: { orderId: result.orderId } });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to place order"),
  });

  const canSubmit =
    Boolean(form.customerName.trim()) &&
    Boolean(form.customerEmail.trim()) &&
    Boolean(form.addressLine1.trim()) &&
    Boolean(form.city.trim()) &&
    Boolean(form.country.trim()) &&
    Boolean(selectedShippingRate) &&
    Boolean(cart?.items.length);

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
          <p className="text-sm text-muted-foreground">Cash on delivery / manual payment for this version.</p>
        </div>

        {cartQuery.isLoading ? (
          <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">Loading checkout...</div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
            <p>Your cart is empty.</p>
            <Link to="/shop" className={buttonVariants({ className: "mt-4" })}>Continue shopping</Link>
          </div>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <form
              className="space-y-4 rounded-md border p-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (canSubmit) {
                  checkout.mutate();
                }
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Name" value={form.customerName} onChange={(customerName) => setForm({ ...form, customerName })} />
                <TextField label="Email" type="email" value={form.customerEmail} onChange={(customerEmail) => setForm({ ...form, customerEmail })} />
                <TextField label="Phone" value={form.customerPhone} onChange={(customerPhone) => setForm({ ...form, customerPhone })} />
                <TextField label="Country" value={form.country} onChange={(country) => setForm({ ...form, country })} />
                <TextField label="Address line 1" value={form.addressLine1} onChange={(addressLine1) => setForm({ ...form, addressLine1 })} />
                <TextField label="Address line 2" value={form.addressLine2} onChange={(addressLine2) => setForm({ ...form, addressLine2 })} />
                <TextField label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} />
                <TextField label="Region" value={form.region} onChange={(region) => setForm({ ...form, region })} />
                <TextField label="Postal code" value={form.postalCode} onChange={(postalCode) => setForm({ ...form, postalCode })} />
              </div>
              <div className="space-y-2">
                <Label>Shipping method</Label>
                <div className="grid gap-2">
                  {shippingRates.map((rate) => (
                    <label
                      key={rate.id}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 text-sm"
                    >
                      <span>
                        <span className="block font-medium">{rate.label}</span>
                        {rate.freeOverAmount ? (
                          <span className="text-xs text-muted-foreground">
                            Free over {formatMoney(rate.freeOverAmount, cart?.currency ?? "BDT")}
                          </span>
                        ) : null}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="font-medium">
                          {formatMoney(rate.amount, cart?.currency ?? "BDT")}
                        </span>
                        <input
                          type="radio"
                          name="shippingRateId"
                          checked={selectedShippingRate?.id === rate.id}
                          onChange={() => setForm({ ...form, shippingRateId: rate.id })}
                        />
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  value={form.customerNotes}
                  onChange={(event) => setForm({ ...form, customerNotes: event.target.value })}
                  placeholder="Delivery notes"
                />
              </div>
              <Button disabled={!canSubmit || checkout.isPending} type="submit">
                {checkout.isPending ? "Placing order..." : "Place order"}
              </Button>
            </form>
            <CheckoutSummary cart={cart} shippingRate={selectedShippingRate} />
          </section>
        )}
      </main>
    </div>
  );
}

function TextField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{props.label}</Label>
      <Input
        type={props.type}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
    </div>
  );
}

function shippingAmountForRate(rate: ShopShippingRate | undefined, subtotal: string) {
  if (!rate) {
    return 0;
  }
  const subtotalAmount = Number(subtotal);
  const freeOverAmount = Number(rate.freeOverAmount ?? 0);
  if (freeOverAmount > 0 && subtotalAmount >= freeOverAmount) {
    return 0;
  }
  return Number(rate.amount);
}

function CheckoutSummary(props: { cart: ShopCart; shippingRate?: ShopShippingRate }) {
  const shippingAmount = shippingAmountForRate(props.shippingRate, props.cart.subtotalAmount);
  const total = Number(props.cart.subtotalAmount) + shippingAmount;
  return (
    <aside className="h-fit space-y-4 rounded-md border p-4">
      <h2 className="font-medium">Order summary</h2>
      <div className="grid gap-3">
        {props.cart.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-muted-foreground">{item.variant.name} x {item.quantity}</p>
            </div>
            <p className="font-medium">{formatMoney(item.lineTotal, props.cart.currency)}</p>
          </div>
        ))}
      </div>
      <div className="border-t pt-3">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatMoney(props.cart.subtotalAmount, props.cart.currency)}</span>
        </div>
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">{formatMoney(shippingAmount.toFixed(2), props.cart.currency)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Total</span>
          <span className="text-lg font-semibold">{formatMoney(total.toFixed(2), props.cart.currency)}</span>
        </div>
      </div>
    </aside>
  );
}
