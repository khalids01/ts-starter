import {
  createFileRoute,
  Outlet,
  Link,
  useLocation,
  redirect,
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
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  User as UserIcon,
  ChevronRight,
  Component,
} from "lucide-react";
import UserMenu from "@/components/core/user-menu";
import { ThemeToggle } from "@/components/core/theme-toggle";
import { NotificationBell } from "@/components/core/notification-bell";
import Logo from "@/components/core/logo";

import { FeedbackButton } from "@/components/core/feedback-button";
import { getUser } from "@/features/user/lib/get-user";
import { getPayment } from "@/features/payment/lib/get-payment";

export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
  beforeLoad: async () => {
    const session = await getUser();
    const customerState = await getPayment();
    return { session, customerState };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }

    if ((context.session.user as any).onboardingComplete === false) {
      throw redirect({
        to: "/onboarding",
      });
    }
  },
});

const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    title: "Account",
    icon: UserIcon,
    url: "/account",
  },
];

function ProtectedLayout() {
  const location = useLocation();

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
                  {navItems.map((item) => {
                    const isActive = location.pathname.includes(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={isActive}
                          tooltip={item.title}
                          size="lg"
                          render={(buttonProps) => (
                            <Link
                              to={item.url}
                              {...buttonProps}
                              className={
                                buttonProps.className +
                                " group-data-[collapsible=icon]:justify-center"
                              }
                            >
                              <item.icon className="h-4 w-4" />
                              <span className="group-data-[collapsible=icon]:hidden">
                                {item.title}
                              </span>
                            </Link>
                          )}
                        />
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col min-w-0">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-[1px] bg-border mx-2" />
              <nav className="flex items-center space-x-1 text-sm font-medium">
                <span className="text-muted-foreground">App</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">
                  {location.pathname.split("/").pop() || "Dashboard"}
                </span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <FeedbackButton />
              <NotificationBell />
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
