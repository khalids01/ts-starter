import { Link, useNavigate } from "@tanstack/react-router";
import type { FormEvent, ReactNode } from "react";
import {
  Grid3X3,
  Heart,
  Home,
  List,
  Menu,
  PackageSearch,
  Search,
  User,
} from "lucide-react";
import { brandConfig } from "@config/brand";
import UserMenu from "@/components/core/user-menu";
import { ThemeToggle } from "@/components/core/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/session-provider";
import { CartSheet, CartTriggerButton } from "./cart/sheet";
import type { ShopCategory } from "./types";
import { usePublicData } from "@/providers/public-data-provider";

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
      <PublicShopHeader />
      <div className="pb-20 md:pb-0">{props.children}</div>
      {props.footer}
      <MobileBottomNav />
      <CartSheet />
    </div>
  );
}

export function PublicShopFooter() {
  const { categories } = usePublicData();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] md:px-6">
        <div>
          <Link to="/" className="text-xl font-semibold">
            {brandConfig.name}
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            {brandConfig.description}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            {brandConfig.location.city ?? "Dhaka"},{" "}
            {brandConfig.location.country ?? "Bangladesh"}
          </p>
        </div>

        <FooterList title="Shop">
          <Link to="/shop">All products</Link>
          <Link to="/saved">Saved items</Link>
          <Link to="/track-order">Track order</Link>
        </FooterList>

        <FooterList title="Categories">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              to="/shop"
              search={{ categoryId: category.id }}
            >
              {category.name}
            </Link>
          ))}
        </FooterList>

        <div>
          <h3 className="font-medium">Contact</h3>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground [&_a:hover]:text-foreground">
            {brandConfig.contact.email ? (
              <a href={`mailto:${brandConfig.contact.email}`}>
                {brandConfig.contact.email}
              </a>
            ) : null}
            {brandConfig.contact.phone ? (
              <a href={`tel:${brandConfig.contact.phone}`}>
                {brandConfig.contact.phone}
              </a>
            ) : null}
            {brandConfig.contact.whatsapp ? (
              <a href={brandConfig.contact.whatsapp}>WhatsApp</a>
            ) : null}
          </div>
        </div>
      </div>
      <div className="border-t py-5">
        <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row md:px-6">
          <p>
            © {new Date().getFullYear()} {brandConfig.name}. All rights
            reserved.
          </p>
          <div className="flex gap-5">
            <Link to="/track-order">Orders</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/checkout">Checkout</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PublicShopHeader() {
  const { categories } = usePublicData();
  const featuredCategories = categories
    .filter((category) => category.isFeatured)
    .slice(0, 5);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto hidden h-16 w-full max-w-7xl items-center gap-4 px-4 md:flex md:px-6">
        <BrandLink />
        <nav className="flex min-w-0 flex-1 items-center gap-5 text-sm font-medium">
          <Link
            to="/shop"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Shop
          </Link>
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              to="/shop"
              search={{ categoryId: category.id }}
              className="truncate text-muted-foreground transition-colors hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <ShopSearch className="max-w-xs" />
        <CartTriggerButton />
        <ThemeToggle />
        <UserMenu />
      </div>

      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 md:hidden">
        <MobileMenu categories={categories} />
        <BrandLink className="min-w-0 flex-1" compact />
        <CategorySheet categories={categories} />
        <CartTriggerButton variant="ghost" />
        <UserMenu />
      </div>
    </header>
  );
}

function BrandLink(props: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2", props.className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-emerald-600 text-sm font-bold text-white">
        {brandConfig.textLogo.slice(0, 1)}
      </span>
      <span
        className={cn(
          "truncate text-lg font-semibold",
          props.compact ? "text-base" : "",
        )}
      >
        {brandConfig.textLogo}
      </span>
    </Link>
  );
}

function ShopSearch(props: { className?: string; onSubmitDone?: () => void }) {
  const navigate = useNavigate();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();
    void navigate({
      to: "/shop",
      search: search ? { search } : {},
    });
    props.onSubmitDone?.();
  };

  return (
    <form
      onSubmit={submit}
      className={cn("flex w-full items-center gap-2", props.className)}
    >
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="search" placeholder="Search products" className="pl-9" />
      </div>
      <Button type="submit" size="icon">
        <Search className="size-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
}

function MobileMenu(props: { categories: ShopCategory[] }) {
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
          <ShopSearch />
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
              {props.categories
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

function CategorySheet(props: { categories: ShopCategory[] }) {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button type="button" variant="ghost" size="icon" />}
      >
        <List className="size-5" />
        <span className="sr-only">Categories</span>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Categories</SheetTitle>
          <SheetDescription>
            Browse by category and product family.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-2 px-4 pb-4">
          <Link
            to="/shop"
            className={buttonVariants({
              variant: "outline",
              className: "justify-start",
            })}
          >
            All products
          </Link>
          {props.categories.map((category) => (
            <Link
              key={category.id}
              to="/shop"
              search={{ categoryId: category.id }}
              className={buttonVariants({
                variant: "ghost",
                className: "justify-start",
              })}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileBottomNav() {
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

function FooterList(props: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-medium">{props.title}</h3>
      <div className="mt-4 grid gap-2 text-sm text-muted-foreground [&_a:hover]:text-foreground">
        {props.children}
      </div>
    </div>
  );
}
