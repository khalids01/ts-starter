import { createMiddleware } from "@tanstack/react-start";

// Keep middleware in place but avoid any automatic redirect behavior.
// The /setup route is intentionally guarded server-side; the frontend
// may query the setup-status endpoint and optionally show links to
// /setup when appropriate. This middleware simply forwards the
// request so we do not perform redirects automatically.
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  return next();
});

