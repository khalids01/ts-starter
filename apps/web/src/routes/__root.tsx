import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { getDeploymentBrand } from "@/features/branding/get-deployment-brand";
import { brandConfig } from "@config/brand";
import { Toaster } from "@/components/ui/sonner";
import { TanstackQueryProvider } from "@/providers/tanstack-query";
import { ThemeProvider } from "@/providers/theme-provider";
import { getRootSession } from "@/features/user/lib/get-root-session";
import { VisitorTracker } from "@/features/visitors/visitor-tracker";
import { SessionProvider } from "@/providers/session-provider";
import type { ClientSessionResult } from "@auth/client";

export interface RouterAppContext {
  session?: ClientSessionResult;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    links: [
      { rel: "icon", href: brandConfig.iconUrl, type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: brandConfig.iconUrl },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: brandConfig.name,
      },
    ],
  }),
  loader: async () => {
    await getDeploymentBrand();
    const session = await getRootSession();
    return { session: session ?? null };
  },
  staleTime: 30_000,
  gcTime: 5 * 60_000,

  component: RootDocument,
});

function RootDocument() {
  const { session } = Route.useLoaderData();
  return (
    <html
      lang={brandConfig.commerce.defaultLocale}
      data-brand={brandConfig.key}
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider initialSession={session}>
            <TanstackQueryProvider>
              <Outlet />
            </TanstackQueryProvider>
          </SessionProvider>
          <VisitorTracker />
          <Toaster richColors position="top-center" />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
