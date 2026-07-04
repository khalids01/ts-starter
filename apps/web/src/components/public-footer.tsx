import { Link } from "@tanstack/react-router";

import { brandConfig } from "@config/brand";

import { usePublicData } from "@/providers/public-data-provider";

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

function FooterList(props: { title: string; children: any }) {
  return (
    <div>
      <h3 className="font-medium">{props.title}</h3>
      <div className="mt-4 grid gap-2 text-sm text-muted-foreground [&_a:hover]:text-foreground">
        {props.children}
      </div>
    </div>
  );
}
