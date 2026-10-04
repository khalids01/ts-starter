import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { brandConfig } from "@config/brand";
import { Mail, Phone, Package, ArrowUpRight } from "lucide-react";
import { PublicShopShell } from "@/features/shop/public-shop-shell";
import { PublicShopFooter } from "@/components/public-footer";
import { buttonVariants } from "@/components/ui/button";
import { formatMoney } from "@/features/shop/utils";
import type {
  PublicStoreSettings,
  ShopShippingRate,
} from "@/features/shop/types";

export function InformationLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <PublicShopShell footer={<PublicShopFooter />}>
      <main className="mx-auto max-w-5xl space-y-10 px-4 py-12 md:px-6 md:py-20">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {brandConfig.name}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        </header>
        {children}
      </main>
    </PublicShopShell>
  );
}
export function ContactPage({ settings }: { settings: PublicStoreSettings }) {
  const email = settings.supportEmail || brandConfig.contact.email;
  const phone = settings.supportPhone || brandConfig.contact.phone;
  return (
    <InformationLayout
      title="Let’s get in touch"
      description="Find your order details or reach the store through its available contact channels."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {email ? (
          <a
            href={`mailto:${email}`}
            className="rounded-2xl border bg-card p-6"
          >
            <Mail className="size-6 text-primary" />
            <h2 className="mt-4 font-semibold">Email the store</h2>
            <p className="mt-2 break-all text-muted-foreground">{email}</p>
          </a>
        ) : null}
        {phone ? (
          <a href={`tel:${phone}`} className="rounded-2xl border bg-card p-6">
            <Phone className="size-6 text-primary" />
            <h2 className="mt-4 font-semibold">Call the store</h2>
            <p className="mt-2 text-muted-foreground">{phone}</p>
          </a>
        ) : null}
      </div>
      <section className="rounded-3xl bg-muted/40 p-6 md:p-10">
        <Package className="size-7 text-primary" />
        <h2 className="mt-4 text-xl font-semibold">Looking for an order?</h2>
        <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
          Sign in with the account used for your purchase to see its status,
          delivery details and payment information. Keep your order number ready
          when contacting the store.
        </p>
        <Link
          to="/orders"
          className={buttonVariants({ className: "mt-6 rounded-full" })}
        >
          View my orders
          <ArrowUpRight className="size-4" />
        </Link>
      </section>
      {brandConfig.location.address ? (
        <section>
          <h2 className="font-semibold">Store address</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {[
              brandConfig.location.address,
              brandConfig.location.city,
              brandConfig.location.country,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </section>
      ) : null}
    </InformationLayout>
  );
}
export function ShippingPage({ rates }: { rates: ShopShippingRate[] }) {
  return (
    <InformationLayout
      title="Delivery information"
      description="Review available delivery methods and fees before placing your order."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {rates.map((rate) => (
          <article key={rate.id} className="rounded-2xl border bg-card p-6">
            <h2 className="font-semibold">{rate.label}</h2>
            <p className="mt-3 text-3xl font-semibold">
              {formatMoney(rate.amount, rate.currency)}
            </p>
            {rate.freeOverAmount ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Free delivery threshold:{" "}
                {formatMoney(rate.freeOverAmount, rate.currency)}
              </p>
            ) : null}
          </article>
        ))}
      </div>
      <section className="rounded-3xl bg-muted/40 p-6 md:p-10">
        <h2 className="text-xl font-semibold">Choose delivery at checkout</h2>
        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          Available methods depend on your order. Checkout confirms the delivery
          fee and order total. Fresh food also requires an available delivery
          window for your postal code.
        </p>
        <Link
          to="/shop"
          className={buttonVariants({
            variant: "outline",
            className: "mt-6 rounded-full",
          })}
        >
          Explore the shop
        </Link>
      </section>
    </InformationLayout>
  );
}
export function PolicyPage({
  policy,
}: {
  policy: NonNullable<NonNullable<typeof brandConfig.policies>["terms"]>;
}) {
  return (
    <InformationLayout
      title={policy.title}
      description={`Effective ${policy.effectiveDate}`}
    >
      <div className="max-w-3xl space-y-8">
        {policy.sections.map((section, index) => (
          <section key={`${index}-${section.heading}`}>
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              {section.paragraphs.map((paragraph, i) => (
                <p key={i} className="whitespace-pre-line leading-8">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </InformationLayout>
  );
}
