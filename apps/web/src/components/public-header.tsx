import { Link } from "@tanstack/react-router";

import UserMenu from "@/components/core/user-menu";
import { ThemeToggle } from "@/components/core/theme-toggle";

import {  CartTriggerButton } from "@/features/shop/cart/sheet";

import { usePublicData } from "@/providers/public-data-provider";
import { Search } from "./public-header/search";
import Logo from "./core/logo";
import { MobileMenu } from "./public-header/mobile-menu";
import { CategorySheet } from "./public-header/category-sheet";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto hidden h-16 w-full max-w-7xl items-center gap-4 px-4 md:flex md:px-6">
        <Logo />
        <nav className="flex min-w-0 flex-1 items-center gap-5 text-sm font-medium">
          <Link
            to="/shop"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Shop
          </Link>
          
        </nav>
        <Search className="max-w-xs" />
        <CartTriggerButton />
        <ThemeToggle />
        <UserMenu />
      </div>

      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 md:hidden">
        <MobileMenu />
        <Logo className="min-w-0 flex-1" compact />
        <CategorySheet />
        <CartTriggerButton variant="ghost" />
        <UserMenu />
      </div>
    </header>
  );
}

const CategoriesHeader = ()=>{
  const { categories } = usePublicData();
  const featuredCategories = categories
    .filter((category) => category.isFeatured)
    .slice(0, 5);

    return (
        <>
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
        </>
    )
}