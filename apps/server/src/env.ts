import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().min(1),
        BETTER_AUTH_SECRET: z.string().min(1),
        BETTER_AUTH_URL: z.string().url(),
        POLAR_ACCESS_TOKEN: z.string().optional(),
        POLAR_SUCCESS_URL: z.string().optional(),
        CORS_ORIGIN: z.string().url(),
        ENABLE_POLAR: z
            .string()
            .default("false")
            .transform((val) => val === "true"),

        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    },
    runtimeEnv: {
        ...process.env,
    },
    emptyStringAsUndefined: true,
});
