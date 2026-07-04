import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PublicShopFooter, PublicShopShell } from "../public-shop-shell";

export function CheckoutSuccessPage(props: { orderId: string }) {
  return (
    <PublicShopShell footer={<PublicShopFooter />}>
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center px-4 py-10">
        <section className="w-full rounded-md border p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Order placed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We received your order. Payment is marked as due for COD/manual payment.
          </p>
          <p className="mt-4 rounded-md bg-muted p-3 text-sm font-medium">{props.orderId}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/shop" className={buttonVariants({ variant: "outline" })}>
              Continue shopping
            </Link>
            <Link to="/track-order" className={buttonVariants()}>
              Track order
            </Link>
          </div>
        </section>
      </main>
    </PublicShopShell>
  );
}
