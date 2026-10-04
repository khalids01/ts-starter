import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, PackageCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PublicShopShell } from "../public-shop-shell";
import { PublicShopFooter } from "@/components/public-footer";
import type { CheckoutResult } from "../types";
import { formatMoney } from "../utils";

export function CheckoutSuccessPage({ orderId }: { orderId: string }) {
  const [receipt, setReceipt] = useState<CheckoutResult | null>(null);
  useEffect(() => {
    try {
      const value = JSON.parse(
        sessionStorage.getItem(`checkout-receipt:${orderId}`) ?? "null",
      );
      if (
        value?.orderId === orderId &&
        typeof value.orderNumber === "string" &&
        typeof value.totalAmount === "string" &&
        typeof value.currency === "string"
      )
        setReceipt(value);
    } catch {}
  }, [orderId]);
  return (
    <PublicShopShell footer={<PublicShopFooter />}>
      <main className="mx-auto w-full max-w-2xl px-4 py-12 md:py-20">
        <section className="rounded-3xl border bg-card p-6 text-center md:p-12">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary/10">
            {receipt ? (
              <CheckCircle2 className="size-10 text-primary" />
            ) : (
              <PackageCheck className="size-10 text-primary" />
            )}
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            {receipt ? "Thank you for your order" : "Order confirmation"}
          </h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            {receipt
              ? "Your order was accepted. Keep your order number for reference. Delivery progress and payment updates are shown in your account where available."
              : "The receipt isn’t available in this browser session. Sign in to view orders placed with your account, or contact the store with your saved order reference."}
          </p>
          {receipt ? (
            <div className="mt-8 rounded-2xl bg-muted/40 p-5">
              <p className="text-sm text-muted-foreground">Order number</p>
              <p className="mt-1 break-all text-xl font-semibold">
                {receipt.orderNumber}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Confirmed order total
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatMoney(receipt.totalAmount, receipt.currency)}
              </p>
            </div>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/shop"
              className={buttonVariants({
                variant: "outline",
                className: "min-h-12 rounded-full",
              })}
            >
              Continue shopping
            </Link>
            <Link
              to="/orders"
              className={buttonVariants({ className: "min-h-12 rounded-full" })}
            >
              View my orders
            </Link>
          </div>
        </section>
      </main>
    </PublicShopShell>
  );
}
