import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { e2eRuntimeConfig } from "../../packages/config/src/e2e.config";

const appPort =
  process.env.E2E_MODE === "true"
    ? e2eRuntimeConfig.webPort
    : Number.parseInt(process.env.VITE_PORT ?? "3001", 10);

export default defineConfig({
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    exclude: ["@tanstack/router-core"],
  },
  ssr: {
    noExternal: ["@tanstack/history", "@tanstack/router-core"],
  },
  server: {
    port: appPort,
  },
  preview: {
    port: appPort,
  },
});
