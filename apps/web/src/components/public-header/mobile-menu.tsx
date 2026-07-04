import { Link } from "@tanstack/react-router";
import { Grid3X3, Heart, Home, Menu, PackageSearch } from "lucide-react";
import { ThemeToggle } from "@/components/core/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Search } from "./search";
import type { ReactNode } from "react";
import { usePublicData } from "@/providers/public-data-provider";

export function MobileMenu() {
  const {categories} = usePublicData()
  return (
    <Sheet>
      <SheetTrigger
        render={<Button type="button" variant="ghost" size="icon" />}
      >
        <Menu className="size-5" />
        <span className="sr-only">Menu</span>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Open product, category, and customer pages.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4 pb-4">
          <Search />
          <nav className="grid gap-1">
            <MobileDrawerLink to="/" icon={<Home className="size-4" />}>
              Home
            </MobileDrawerLink>
            <MobileDrawerLink to="/shop" icon={<Grid3X3 className="size-4" />}>
              Shop
            </MobileDrawerLink>
            <MobileDrawerLink to="/saved" icon={<Heart className="size-4" />}>
              Saved items
            </MobileDrawerLink>
            <MobileDrawerLink
              to="/track-order"
              icon={<PackageSearch className="size-4" />}
            >
              Track order
            </MobileDrawerLink>
          </nav>
          <div>
            <p className="mb-2 text-sm font-medium">Featured categories</p>
            <div className="grid gap-1">
              {categories
                .filter((category) => category.isFeatured)
                .slice(0, 8)
                .map((category) => (
                  <Link
                    key={category.id}
                    to="/shop"
                    search={{ categoryId: category.id }}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileDrawerLink(props: {
  to: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      to={props.to}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {props.icon}
      <span>{props.children}</span>
    </Link>
  );
}

