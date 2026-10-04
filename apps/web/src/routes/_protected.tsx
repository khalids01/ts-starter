import {
  createFileRoute,
  Outlet,
  Link,
  redirect,
} from "@tanstack/react-router";
import { LayoutDashboard, Package, UserRound, Settings } from "lucide-react";
import { getRootSession } from "@/features/user/lib/get-root-session";
import { getPublicData } from "@/features/shop/catalog/ssr-fetch";
import { PublicDataProvider } from "@/providers/public-data-provider";
import { PublicShopShell } from "@/features/shop/public-shop-shell";
import { PublicShopFooter } from "@/components/public-footer";
import { noIndexHead } from "@/features/seo/metadata";

export const Route = createFileRoute("/_protected")({
  head: noIndexHead,
  beforeLoad: async ({ context, cause, location }) => {
    const session =
      cause === "stay"
        ? await getRootSession()
        : (context.session ?? (await getRootSession()));
    if (!session)
      throw redirect({ to: "/login", search: { next: location.href } });
    return { session };
  },
  loader: () => getPublicData(),
  component: CustomerLayout,
});
const navigation = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/account", label: "Profile", icon: UserRound },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;
function CustomerLayout() {
  return (
    <PublicDataProvider value={Route.useLoaderData()}>
      <PublicShopShell footer={<PublicShopFooter />}>
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
          <nav
            aria-label="Your account"
            className="mb-8 grid grid-cols-4 gap-1 rounded-2xl border bg-muted/30 p-1.5 sm:flex sm:gap-2"
          >
            {navigation.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeProps={{
                  className: "bg-background text-foreground shadow-sm",
                  "aria-current": "page",
                }}
                className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-xs font-medium text-muted-foreground sm:flex-row sm:gap-2 sm:px-5 sm:text-sm"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
          <Outlet />
        </div>
      </PublicShopShell>
    </PublicDataProvider>
  );
}
