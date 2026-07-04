import type { ReactNode } from "react";

import { CartSheet } from "./cart/sheet";
import { PublicHeader } from "@/components/public-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { cn } from "@/lib/utils";

export function PublicShopShell(props: {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground",
        props.className,
      )}
    >
      <PublicHeader />
      <div className="pb-20 md:pb-0">{props.children}</div>
      {props.footer}
      <MobileBottomNav />
      <CartSheet />
    </div>
  );
}
