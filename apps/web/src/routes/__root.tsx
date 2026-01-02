import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";
import Header from "../components/header";
import appCss from "../index.css?url";
import { TanstackQueryProvider } from "@/providers/tanstack-router";
import { ThemeProvider } from "@/providers/theme-provider";
import { client } from "@/lib/client";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  beforeLoad: async ({ location }) => {
    console.log("[Root] Checking owner status for:", location.pathname);
    // Skip check if we are already on the setup page
    if (location.pathname === "/setup") {
      return;
    }

    const { data, error } = await client.owner["setup-status"].get();
    console.log("[Root] Owner status result:", { data, error });

    if (error) {
      console.error("[Root] Owner check failed:", error);
      return;
    }

    if (data && !data.hasOwner) {
      console.log("[Root] No owner found, redirecting to /setup");
      throw redirect({
        to: "/setup",
      });
    }
  },
  head: () => ({
    // ... meta and links stay the same
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Saas Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TanstackQueryProvider>
            <Header />
            <Outlet />
          </TanstackQueryProvider>
          <Toaster richColors />
          <TanStackRouterDevtools position="bottom-left" />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
