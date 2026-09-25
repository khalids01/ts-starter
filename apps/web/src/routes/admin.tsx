import {
  createFileRoute,
  Outlet,
  Link,
  useLocation,
} from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  ChevronRight,
  MessageSquare,
  ShieldAlert,
  Activity,
  History,
  Webhook,
  Shield,
  Boxes,
  PackageSearch,
  Warehouse,
  ReceiptText,
  Images,
  Truck,
  BadgePercent,
  Store,
  ShoppingBag,
  ChartNoAxesColumn,
  Settings,
  PackageOpen,
  Cable,
  Route as RouteIcon,
  PackageCheck,
  RotateCcw,
  Banknote,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import UserMenu from "@/components/core/user-menu";
import { ThemeToggle } from "@/components/core/theme-toggle";
import { NotificationBell } from "@/components/core/notification-bell";
import Logo from "@/components/core/logo";
import {
  canShowActivityNav,
  canShowFeedbackNav,
  canShowRateLimitsNav,
  canShowRolesNav,
  canShowUsersNav,
  canShowVisitorsNav,
  canShowWebhooksNav,
  canShowCatalogNav,
  canShowProductsNav,
  canShowInventoryNav,
  canShowOrdersNav,
  canShowImagesNav,
  canShowShippingNav,
  canShowDiscountsNav,
  canShowStoreSettingsNav,
  canShowCustomersNav,
  canShowDeliveryNav,
} from "@/features/admin/lib/admin-access";
import { adminMiddleware } from "@/middleware/admin";
import { useSession } from "@/providers/session-provider";
import type { ClientSession } from "@auth/client";

export const Route = createFileRoute("/admin")({
  server: {
    middleware: [adminMiddleware],
  },
  beforeLoad: async ({ context, cause }) => {
    if (cause === "stay") {
      return;
    }

    return {
      session: context.session,
    };
  },
  component: AdminLayout,
});

type AdminNavItem = {
  title: string;
  icon: LucideIcon;
  url: string;
  show: boolean;
};

type AdminNavGroup = {
  title: string;
  icon: LucideIcon;
  items: AdminNavItem[];
};

const NAV_STATE_KEY = "admin-sidebar-groups";

function getAdminNavigation(session: ClientSession | null | undefined) {
  const overview: AdminNavItem = { title: "Overview", icon: LayoutDashboard, url: "/admin/overview", show: true };
  const groups: AdminNavGroup[] = [
    {
      title: "Shop Management",
      icon: ShoppingBag,
      items: [
        { title: "Products", icon: PackageSearch, url: "/admin/products", show: canShowProductsNav(session) },
        { title: "Catalog", icon: Boxes, url: "/admin/catalog", show: canShowCatalogNav(session) },
        { title: "Inventory", icon: Warehouse, url: "/admin/inventory", show: canShowInventoryNav(session) },
        { title: "Discounts", icon: BadgePercent, url: "/admin/discounts", show: canShowDiscountsNav(session) },
        { title: "Images", icon: Images, url: "/admin/images", show: canShowImagesNav(session) },
      ],
    },
    {
      title: "Sales",
      icon: ReceiptText,
      items: [
        { title: "Orders", icon: ReceiptText, url: "/admin/orders", show: canShowOrdersNav(session) },
        { title: "Customers", icon: Users, url: "/admin/customers", show: canShowCustomersNav(session) },
      ],
    },
    {
      title: "Delivery",
      icon: Truck,
      items: [
        { title: "Shipping methods", icon: PackageOpen, url: "/admin/shipping", show: canShowShippingNav(session) },
      ],
    },
    {
      title: "Couriers",
      icon: Truck,
      items: [
        { title: "Overview", icon: LayoutDashboard, url: "/admin/couriers", show: canShowDeliveryNav(session) },
        { title: "Connections", icon: Cable, url: "/admin/couriers/connections", show: canShowDeliveryNav(session) },
        { title: "Delivery options", icon: PackageCheck, url: "/admin/couriers/delivery-options", show: canShowDeliveryNav(session) },
        { title: "Assignment rules", icon: RouteIcon, url: "/admin/couriers/assignment-rules", show: canShowDeliveryNav(session) },
        { title: "Shipments", icon: Truck, url: "/admin/couriers/shipments", show: canShowDeliveryNav(session) },
        { title: "Returns", icon: RotateCcw, url: "/admin/couriers/returns", show: canShowDeliveryNav(session) },
        { title: "COD payouts", icon: Banknote, url: "/admin/couriers/cod-payouts", show: canShowDeliveryNav(session) },
      ],
    },
    {
      title: "Storefront",
      icon: Store,
      items: [
        { title: "Store settings", icon: Settings, url: "/admin/store-settings", show: canShowStoreSettingsNav(session) },
        { title: "Feedback", icon: MessageSquare, url: "/admin/feedback", show: canShowFeedbackNav(session) },
      ],
    },
    {
      title: "Analytics",
      icon: ChartNoAxesColumn,
      items: [
        { title: "Visitors", icon: Activity, url: "/admin/visitors", show: canShowVisitorsNav(session) },
      ],
    },
    {
      title: "Administration",
      icon: Shield,
      items: [
        { title: "Users", icon: Users, url: "/admin/users", show: canShowUsersNav(session) },
        { title: "Roles", icon: Shield, url: "/admin/roles", show: canShowRolesNav(session) },
        { title: "Activity", icon: History, url: "/admin/activity", show: canShowActivityNav(session) },
        { title: "Rate limits", icon: ShieldAlert, url: "/admin/rate-limits", show: canShowRateLimitsNav(session) },
        { title: "Webhooks", icon: Webhook, url: "/admin/webhooks", show: canShowWebhooksNav(session) },
      ],
    },
  ];
  return {
    overview,
    groups: groups.map((group) => ({ ...group, items: group.items.filter((item) => item.show) })).filter((group) => group.items.length > 0),
  };
}

function AdminLayout() {
  const location = useLocation();
  const { session } = useSession();
  const navigation = useMemo(() => getAdminNavigation(session), [session]);
  const visibleNavItems = [navigation.overview, ...navigation.groups.flatMap((group) => group.items)];
  const currentNavItem = [...visibleNavItems].sort((a, b) => b.url.length - a.url.length).find((item) => routeIsActive(location.pathname, item.url));
  const activeGroup = navigation.groups.find((group) => group.items.some((item) => routeIsActive(location.pathname, item.url)))?.title;
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(activeGroup ? [activeGroup] : []));

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(NAV_STATE_KEY) ?? "[]") as string[];
      setOpenGroups(new Set([...stored, ...(activeGroup ? [activeGroup] : [])]));
    } catch {
      setOpenGroups(new Set(activeGroup ? [activeGroup] : []));
    }
  }, [activeGroup]);

  const setGroupOpen = (title: string, open: boolean) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (open) next.add(title);
      else next.delete(title);
      localStorage.setItem(NAV_STATE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="floating" collapsible="icon">
          <SidebarHeader className="h-16 border-b px-2 justify-center flex flex-col">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  tooltip="Logo"
                  render={(buttonProps) => <Logo {...buttonProps} />}
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <AdminNavLink item={navigation.overview} pathname={location.pathname} />
                  {navigation.groups.map((group) => (
                    <AdminNavCategory
                      key={group.title}
                      group={group}
                      pathname={location.pathname}
                      open={openGroups.has(group.title)}
                      onOpenChange={(open) => setGroupOpen(group.title, open)}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex min-w-0 flex-col">
          <header className="flex h-16 min-w-0 shrink-0 items-center justify-between gap-2 border-b px-3 sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
              <SidebarTrigger className="-ml-1" />
              <div className="mx-1 h-4 w-px shrink-0 bg-border sm:mx-2" />
              <nav className="flex min-w-0 items-center gap-1 overflow-hidden text-sm font-medium">
                <span className="hidden text-muted-foreground sm:inline">Admin</span>
                <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
                {activeGroup ? (
                  <>
                    <span className="hidden text-muted-foreground md:inline">{activeGroup}</span>
                    <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground md:block" />
                  </>
                ) : null}
                <span className="truncate capitalize">
                  {currentNavItem?.title ?? location.pathname.split("/").pop()}
                </span>
              </nav>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
              <NotificationBell />
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>
          <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function routeIsActive(pathname: string, url: string) {
  if (url === "/admin/couriers") return pathname === url || pathname === `${url}/`;
  return pathname === url || pathname.startsWith(`${url}/`);
}

function AdminNavLink({ item, pathname }: { item: AdminNavItem; pathname: string }) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={routeIsActive(pathname, item.url)}
        tooltip={item.title}
        size="lg"
        render={(buttonProps) => (
          <Link
            to={item.url}
            {...buttonProps}
            onClick={() => isMobile && setOpenMobile(false)}
            className={`${buttonProps.className} group-data-[collapsible=icon]:justify-center`}
          >
            <item.icon className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
          </Link>
        )}
      />
    </SidebarMenuItem>
  );
}

function AdminNavCategory({ group, pathname, open, onOpenChange }: { group: AdminNavGroup; pathname: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const active = group.items.some((item) => routeIsActive(pathname, item.url));

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton isActive={active} tooltip={group.title} size="lg" className="justify-center" />}
          >
            <group.icon className="size-4" />
            <span className="sr-only">{group.title}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="min-w-56">
            <div className="text-muted-foreground px-2 py-2 text-sm font-medium">{group.title}</div>
            {group.items.map((item) => (
              <DropdownMenuItem key={item.url} render={<Link to={item.url} />}>
                <item.icon className="size-4" />
                {item.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} render={<SidebarMenuItem />}>
      <CollapsibleTrigger render={<SidebarMenuButton isActive={active} tooltip={group.title} size="lg" />}>
        <group.icon className="size-4" />
        <span>{group.title}</span>
        <ChevronRight className={`ml-auto size-4 transition-transform ${open ? "rotate-90" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {group.items.map((item) => (
            <SidebarMenuSubItem key={item.url}>
              <SidebarMenuSubButton
                isActive={routeIsActive(pathname, item.url)}
                render={(buttonProps) => (
                  <Link to={item.url} {...buttonProps} onClick={() => isMobile && setOpenMobile(false)}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                )}
              />
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
