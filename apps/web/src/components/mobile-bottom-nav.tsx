import { Link  } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Heart,
  Home,
  PackageSearch,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSession } from "@/providers/session-provider";
import { CartTriggerButton } from "@/features/shop/cart/sheet";




export function MobileBottomNav() {
  const { session } = useSession();
  const profileTo = session ? "/account" : "/login";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
        <BottomNavLink
          to="/saved"
          label="Saved"
          icon={<Heart className="size-5" />}
        />
        <CartBottomButton />
        <BottomNavLink
          to="/"
          label="Home"
          icon={<Home className="size-5" />}
          className="-mt-5 rounded-full bg-emerald-600 py-3 text-white shadow-lg hover:bg-emerald-700"
        />
        <BottomNavLink
          to={profileTo}
          label="Profile"
          icon={<User className="size-5" />}
        />
        <BottomNavLink
          to="/track-order"
          label="Track"
          icon={<PackageSearch className="size-5" />}
        />
      </div>
    </nav>
  );
}

function CartBottomButton() {
  return (
    <div className="flex justify-center">
      <CartTriggerButton
        variant="ghost"
        showLabel
        className="h-auto flex-col gap-1 px-2 py-1 text-xs text-muted-foreground"
      />
    </div>
  );
}

function BottomNavLink(props: {
  to: string;
  label: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={props.to}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
        props.className,
      )}
    >
      {props.icon}
      <span>{props.label}</span>
    </Link>
  );
}
