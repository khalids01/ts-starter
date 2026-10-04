import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { resolveBrandKey } from "../../packages/config/src/brand.config";
import { defineConfig, loadEnv } from "vite";
import { e2eRuntimeConfig } from "../../packages/config/src/e2e.config";

const appPort =
  process.env.E2E_MODE === "true"
    ? e2eRuntimeConfig.webPort
    : Number.parseInt(process.env.VITE_PORT ?? "3001", 10);

export default defineConfig(({ mode }) => {
  const brand = resolveBrandKey(
    process.env.BRAND ?? loadEnv(mode, process.cwd(), "").BRAND,
  );
  return {
    define: { "process.env.BRAND": JSON.stringify(brand) },
    plugins: [
      tailwindcss(),
      tanstackStart(),
      viteReact(),
      {
        name: "store-brand-manifest",
        apply: "build",
        closeBundle() {
          const directory = resolve(import.meta.dirname, "dist");
          mkdirSync(directory, { recursive: true });
          writeFileSync(
            resolve(directory, "brand.json"),
            JSON.stringify({ version: 1, brand }),
          );
        },
      },
    ],
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
  };
});
