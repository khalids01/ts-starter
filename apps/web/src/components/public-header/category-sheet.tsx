import { Link  } from "@tanstack/react-router";
import {
  List,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { usePublicData } from "@/providers/public-data-provider";

export function CategorySheet() {
    const {categories} = usePublicData()
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
          {categories.map((category) => (
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