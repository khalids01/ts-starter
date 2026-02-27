import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().min(1),
    POLAR_ACCESS_TOKEN: z.string().min(1),
    POLAR_SUCCESS_URL: z.string().min(1),
    CORS_ORIGIN: z.string().min(1),
    ENABLE_POLAR: z
      .string()
      .default("false")
      .transform((val) => val === "true"),

    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  runtimeEnv: {
    ...process.env,
  },
  emptyStringAsUndefined: true,
});
