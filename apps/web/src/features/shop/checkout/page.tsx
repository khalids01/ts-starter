import { Img } from "@/components/core/img";
import { useId, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";
import type { CheckoutResult, PublicStoreSettings, ShopCart, ShopShippingRate } from "../types";
import { formatMoney } from "../utils";
import { PublicShopShell } from "../public-shop-shell";

import { PublicShopFooter } from "@/components/public-footer";
import { cartItemsForCheckout, useCart, useCartStore } from "../cart/store";

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
  foodSlotId: string;
  shippingRateId: string;
  customerNotes: string;
  discountCode: string;
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
  foodSlotId: "",
  shippingRateId: "",
  customerNotes: "",
  discountCode: "",
};

type AppliedDiscount = {
  code: string;
  description?: string | null;
  amount: string;
  sourceSubtotal: string;
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const cart = useCart();
  const legacyItems = cart.items.filter((item) => !item.product.fulfillmentKind);
  const policyQuery = useQuery({
    queryKey: ["checkout-product-policies", legacyItems.map((item) => item.product.slug)],
    enabled: legacyItems.length > 0,
    queryFn: () => Promise.all(legacyItems.map(async (item) => {
      const { data, error } = await client.shop.products({ slug: item.product.slug }).get();
      if (error || !data) throw new Error("An item could not be checked. Review your cart before ordering.");
      return data.fulfillmentKind;
    })),
  });
  const needsFreshSlot = cart.items.some((item) => item.product.fulfillmentKind === "fresh_food") || policyQuery.data?.includes("fresh_food") === true;
  const clearCart = useCartStore((state) => state.clearCart);
  const settingsQuery = useQuery({
    queryKey: ["shop", "settings"],
    queryFn: async () => {
      const { data, error } = await client.shop.settings.get();
      if (error) throw new Error(String(error.value?.message || error.message || "Failed to load store settings"));
      return data as PublicStoreSettings;
    },
  });
  const slotsQuery = useQuery({ queryKey: ["shop", "food-slots", form.postalCode], enabled: needsFreshSlot && Boolean(form.postalCode.trim()), queryFn: async () => { const { data, error } = await client.shop["food-slots"].get({ query: { postalCode: form.postalCode } }); if (error) throw new Error("Could not load fresh-food delivery slots"); return data as { id: string; label: string; startsAt: string; endsAt: string; availableUnits: number }[]; } });
  const shippingRatesQuery = useQuery({
    queryKey: ["shop", "shipping-rates", cart.currency],
    queryFn: async () => {
      const { data, error } = await client.shop["shipping-rates"].get({
        query: { currency: cart.currency },
      });
      if (error) {
        throw new Error(String(error.value?.message || error.message || "Failed to load shipping rates"));
      }
      return data as ShopShippingRate[];
    },
  });
  const shippingRates = shippingRatesQuery.data ?? [];
  const selectedShippingRate =
    shippingRates.find((rate) => rate.id === form.shippingRateId) ??
    shippingRates.find((rate) => rate.isDefault) ??
    shippingRates[0];
  const activeDiscount = appliedDiscount?.sourceSubtotal === cart.subtotalAmount
    ? appliedDiscount
    : null;

  const validateDiscount = useMutation({
    mutationFn: async () => {
      const { data, error } = await client.shop.discounts.validate.post({
        code: form.discountCode,
        subtotalAmount: cart.subtotalAmount,
        currency: cart.currency,
        customerEmail: form.customerEmail,
      });
      if (error) throw new Error(String(error.value?.message || error.message || "Discount code is invalid"));
      return data as Omit<AppliedDiscount, "sourceSubtotal">;
    },
    onSuccess: (result) => {
      setAppliedDiscount({ ...result, sourceSubtotal: cart.subtotalAmount });
      setForm((current) => ({ ...current, discountCode: result.code }));
      toast.success("Discount applied");
    },
    onError: (error) => { setAppliedDiscount(null); toast.error(error instanceof Error ? error.message : "Discount code is invalid"); },
  });

  const checkout = useMutation({
    mutationFn: async () => {
      const { data, error } = await client.shop.checkout.post({
        items: cartItemsForCheckout(cart.items),
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
        foodSlotId: form.foodSlotId || undefined,
        shippingRateId: selectedShippingRate?.id,
        paymentMethod: "cash_on_delivery",
        idempotencyKey,
        customerNotes: form.customerNotes || null,
        discountCode: activeDiscount?.code ?? null,
      });
      if (error) {
        throw new Error(String(error.value?.message || error.message || "Failed to place order"));
      }
      return data as CheckoutResult;
    },
    onSuccess: (result) => {
      toast.success("Order placed");
      try { sessionStorage.setItem(`checkout-receipt:${result.orderId}`, JSON.stringify(result)); } catch {}
      clearCart();
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
    Boolean(cart.items.length) &&
    (!legacyItems.length || policyQuery.isSuccess) &&
    (!needsFreshSlot || Boolean(form.foodSlotId)) &&
    settingsQuery.data?.checkoutEnabled === true &&
    !shippingRatesQuery.isPending && !shippingRatesQuery.isError;

  return (
    <PublicShopShell footer={<PublicShopFooter />}>
      <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 md:px-6 md:py-12">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
          <p className="text-sm text-muted-foreground">Confirm your contact details and delivery address. Pay with cash on delivery.</p>
        </div>

        {settingsQuery.data?.checkoutNotice ? (
          <div className={cn("rounded-2xl border p-4 text-sm", settingsQuery.data.checkoutEnabled ? "bg-muted/40" : "border-amber-500/50 bg-amber-50 text-amber-950 dark:bg-amber-950/20 dark:text-amber-100")}>
            {settingsQuery.data.checkoutNotice}
          </div>
        ) : null}
        {settingsQuery.data?.checkoutEnabled === false && !settingsQuery.data.checkoutNotice ? (
          <div className="rounded-2xl border border-amber-500/50 bg-amber-50 p-4 text-sm text-amber-950 dark:bg-amber-950/20 dark:text-amber-100">Checkout is temporarily unavailable.</div>
        ) : null}

        {cart.items.length === 0 ? (
          <div className="rounded-2xl border p-8 text-center text-sm text-muted-foreground">
            <p>Your cart is empty.</p>
            <Link to="/shop" className={buttonVariants({ className: "mt-4" })}>Continue shopping</Link>
          </div>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <form
              className="space-y-6 rounded-2xl border bg-card p-5 md:p-8"
              onSubmit={(event) => {
                event.preventDefault();
                if (canSubmit) {
                  checkout.mutate();
                }
              }}
            >
              <h2 className="text-lg font-semibold">Contact & delivery address</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Name" autoComplete="name" required value={form.customerName} onChange={(customerName) => setForm({ ...form, customerName })} />
                <TextField label="Email" type="email" autoComplete="email" required value={form.customerEmail} onChange={(customerEmail) => setForm({ ...form, customerEmail })} />
                <TextField label="Phone" type="tel" autoComplete="tel" value={form.customerPhone} onChange={(customerPhone) => setForm({ ...form, customerPhone })} />
                <TextField label="Country" autoComplete="country-name" required value={form.country} onChange={(country) => setForm({ ...form, country })} />
                <TextField label="Address line 1" autoComplete="address-line1" required value={form.addressLine1} onChange={(addressLine1) => setForm({ ...form, addressLine1 })} />
                <TextField label="Address line 2" autoComplete="address-line2" value={form.addressLine2} onChange={(addressLine2) => setForm({ ...form, addressLine2 })} />
                <TextField label="City" autoComplete="address-level2" required value={form.city} onChange={(city) => setForm({ ...form, city })} />
                <TextField label="Region" autoComplete="address-level1" value={form.region} onChange={(region) => setForm({ ...form, region })} />
                <TextField label="Postal code" autoComplete="postal-code" value={form.postalCode} onChange={(postalCode) => setForm({ ...form, postalCode, foodSlotId: "" })} />
              </div>
              <div className="space-y-2">
                {needsFreshSlot ? <div className="space-y-2"><Label htmlFor="food-slot">Fresh-food delivery slot</Label>
                <p className="text-muted-foreground text-sm">Enter your postal code and choose an available delivery window for your fresh-food items.</p>
                <select id="food-slot" className="w-full rounded border p-2" value={form.foodSlotId} onChange={e => setForm({ ...form, foodSlotId: e.target.value })}><option value="">Choose a delivery window</option>{(slotsQuery.data ?? []).map(slot => <option key={slot.id} value={slot.id} disabled={slot.availableUnits === 0}>{slot.label} · {new Date(slot.startsAt).toLocaleString()} – {new Date(slot.endsAt).toLocaleTimeString()} · {slot.availableUnits} units available</option>)}</select>
                {slotsQuery.isFetching ? <p>Loading slots...</p> : slotsQuery.isError ? <div role="alert"><p>Could not load delivery slots.</p><Button type="button" variant="outline" onClick={() => void slotsQuery.refetch()}>Try again</Button></div> : form.postalCode && !(slotsQuery.data ?? []).length ? <p>No fresh-food slot is available for this area.</p> : null}
                </div> : null}
                <Label>Shipping method</Label>
                <RadioGroup
                  value={selectedShippingRate?.id ?? ""}
                  onValueChange={(value) => setForm({ ...form, shippingRateId: value ?? "" })}
                  className="grid gap-2"
                >
                  {shippingRates.map((rate) => (
                    <label
                      key={rate.id}
                      onClick={() => setForm({ ...form, shippingRateId: rate.id })}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3 text-sm transition hover:bg-muted",
                        selectedShippingRate?.id === rate.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "",
                      )}
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
                        <RadioGroupItem value={rate.id} aria-label={rate.label} />
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkout-discount-code">Discount code</Label>
                <div className="flex gap-2">
                  <Input
                    id="checkout-discount-code"
                    value={form.discountCode}
                    onChange={(event) => {
                      setForm({ ...form, discountCode: event.target.value.toUpperCase() });
                      setAppliedDiscount(null);
                    }}
                    placeholder="Enter your code"
                  />
                  <Button type="button" variant="outline" disabled={!form.discountCode.trim() || validateDiscount.isPending} onClick={() => validateDiscount.mutate()}>
                    {validateDiscount.isPending ? "Checking..." : "Apply"}
                  </Button>
                </div>
                {activeDiscount ? <p className="text-xs text-emerald-700 dark:text-emerald-300">{activeDiscount.code} applied{activeDiscount.description ? ` · ${activeDiscount.description}` : ""}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="checkout-notes">Notes</Label>
                <Textarea
                  id="checkout-notes"
                  value={form.customerNotes}
                  onChange={(event) => setForm({ ...form, customerNotes: event.target.value })}
                  placeholder="Delivery notes"
                />
              </div>
              <div className="rounded-xl bg-muted/40 p-4"><p className="font-medium">Cash on delivery</p><p className="mt-1 text-sm text-muted-foreground">Your final total and order number are confirmed after the order is accepted.</p></div>
              {policyQuery.isError ? <div role="alert" className="text-sm text-destructive"><p>An item could not be checked. Review your cart before ordering.</p><Button type="button" variant="outline" onClick={() => void policyQuery.refetch()}>Try again</Button></div> : null}
              {settingsQuery.isError || shippingRatesQuery.isError ? <div role="alert" className="text-sm text-destructive"><p>Delivery or checkout settings couldn’t be loaded.</p><Button type="button" variant="outline" className="mt-2" onClick={() => { void settingsQuery.refetch(); void shippingRatesQuery.refetch(); }}>Try again</Button></div> : null}
              {checkout.isError ? <p role="alert" className="text-sm text-destructive">{checkout.error.message}</p> : null}
              <Button className="min-h-12 w-full rounded-full sm:w-auto sm:px-10" disabled={!canSubmit || checkout.isPending} type="submit">
                {checkout.isPending ? "Placing order..." : "Place order"}
              </Button>
            </form>
            <CheckoutSummary cart={cart} shippingRate={selectedShippingRate} discount={activeDiscount} />
          </section>
        )}
      </main>
    </PublicShopShell>
  );
}

function TextField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{props.label}</Label>
      <Input
        id={id}
        autoComplete={props.autoComplete}
        required={props.required}
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

function CheckoutSummary(props: { cart: ShopCart; shippingRate?: ShopShippingRate; discount?: AppliedDiscount | null }) {
  const shippingAmount = shippingAmountForRate(props.shippingRate, props.cart.subtotalAmount);
  const discountAmount = Number(props.discount?.amount ?? 0);
  const total = Number(props.cart.subtotalAmount) - discountAmount + shippingAmount;
  return (
    <aside className="h-fit space-y-5 rounded-2xl border bg-card p-5 md:p-6 lg:sticky lg:top-28">
      <h2 className="font-medium">Order summary</h2>
      <div className="grid gap-3">
        {props.cart.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
            <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-muted">{item.variant.imageUrls[0] || item.product.coverImageUrl ? <Img src={item.variant.imageUrls[0] || item.product.coverImageUrl!} alt="" objectFit="contain" className="h-full w-full" /> : null}</div>
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
          <span className="text-muted-foreground">Discount{props.discount ? ` (${props.discount.code})` : ""}</span>
          <span className="font-medium">-{formatMoney(discountAmount.toFixed(2), props.cart.currency)}</span>
        </div>
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatMoney(props.cart.subtotalAmount, props.cart.currency)}</span>
        </div>
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">{props.shippingRate ? formatMoney(shippingAmount.toFixed(2), props.cart.currency) : "Choose delivery"}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Estimated total</span>
          <span className="text-lg font-semibold">{formatMoney(total.toFixed(2), props.cart.currency)}</span>
        </div>
      </div>
    </aside>
  );
}
