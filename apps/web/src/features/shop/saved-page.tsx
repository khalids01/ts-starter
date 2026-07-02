import { Link } from "@tanstack/react-router";
import { Heart, Trash2 } from "lucide-react";
import { Img } from "@/components/core/img";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { PublicShopFooter, PublicShopShell } from "./public-shop-shell";
import type { SavedProduct } from "./saved-items-store";
import { useSavedItemsStore } from "./saved-items-store";
import { formatMoney } from "./utils";

export function SavedPage() {
  const items = useSavedItemsStore((state) => state.items);
  const remove = useSavedItemsStore((state) => state.remove);

  return (
    <PublicShopShell footer={<PublicShopFooter />}>
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="mb-3 w-fit">
              Saved items
            </Badge>
            <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">
              Products you saved
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Keep mango boxes, phone SKUs, laptop options, and other favorites ready for later.
            </p>
          </div>
          <Link to="/shop" className={buttonVariants({ variant: "outline" })}>
            Continue shopping
          </Link>
        </section>

        {items.length === 0 ? (
          <div className="rounded-md border border-dashed p-10 text-center">
            <Heart className="mx-auto size-10 text-muted-foreground" />
            <h2 className="mt-4 font-medium">No saved products yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Save products from the shop or product details page and they will stay here on this device.
            </p>
            <Link to="/shop" className={buttonVariants({ className: "mt-5" })}>
              Browse products
            </Link>
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <SavedCard key={item.id} item={item} onRemove={() => remove(item.id)} />
            ))}
          </section>
        )}
      </main>
    </PublicShopShell>
  );
}

function SavedCard(props: { item: SavedProduct; onRemove: () => void }) {
  return (
    <article className="overflow-hidden rounded-md border bg-card">
      <Link to="/shop/products/$slug" params={{ slug: props.item.slug }} className="block">
        <div className="aspect-[4/3] bg-muted">
          {props.item.imageUrl ? (
            <Img src={props.item.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">No image</div>
          )}
        </div>
      </Link>
      <div className="grid gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          {props.item.badgeLabel ? <Badge>{props.item.badgeLabel}</Badge> : null}
          {props.item.categoryName ? <Badge variant="outline">{props.item.categoryName}</Badge> : null}
        </div>
        <div className="min-w-0">
          <Link
            to="/shop/products/$slug"
            params={{ slug: props.item.slug }}
            className="line-clamp-1 font-medium hover:underline"
          >
            {props.item.name}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            {props.item.brandName ?? "Saved product"}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold">{formatMoney(props.item.price, props.item.currency)}</p>
          <Button type="button" size="icon-sm" variant="ghost" onClick={props.onRemove}>
            <Trash2 className="size-4" />
            <span className="sr-only">Remove saved item</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
