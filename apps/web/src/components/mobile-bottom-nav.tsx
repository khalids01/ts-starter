import { Link } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, UserRound } from "lucide-react";
import { useSession } from "@/providers/session-provider";
import { CartTriggerButton } from "@/features/shop/cart/sheet";

const linkClass =
  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 [&[aria-current=page]]:bg-emerald-50 [&[aria-current=page]]:text-emerald-800 dark:[&[aria-current=page]]:bg-emerald-950/50 dark:[&[aria-current=page]]:text-emerald-300";
const activeProps = {
  className:
    "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  "aria-current": "page" as const,
};

export function MobileBottomNav() {
  const { session } = useSession();
  return (
    <nav
      aria-label="Mobile shopping navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        <Link
          to="/"
          activeOptions={{ exact: true }}
          activeProps={activeProps}
          className={linkClass}
        >
          <Home className="size-5" strokeWidth={1.7} />
          <span>Home</span>
        </Link>
        <Link to="/shop" activeProps={activeProps} className={linkClass}>
          <LayoutGrid className="size-5" strokeWidth={1.7} />
          <span>Shop</span>
        </Link>
        <Link to="/saved" activeProps={activeProps} className={linkClass}>
          <Heart className="size-5" strokeWidth={1.7} />
          <span>Saved</span>
        </Link>
        <CartTriggerButton
          variant="ghost"
          showLabel
          className="h-14 w-full flex-col gap-1 rounded-xl px-1 text-[10px] font-medium text-muted-foreground [&_svg]:size-5"
        />
        <Link
          to={session ? "/dashboard" : "/login"}
          activeProps={activeProps}
          className={linkClass}
        >
          <UserRound className="size-5" strokeWidth={1.7} />
          <span>Account</span>
        </Link>
      </div>
    </nav>
  );
}
