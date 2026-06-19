import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ShopHeader } from "./shop-page";

export function CheckoutSuccessPage(props: { orderId: string }) {
  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />
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
            <Link to="/admin/orders/$orderId" params={{ orderId: props.orderId }} className={buttonVariants()}>
              View in admin
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
