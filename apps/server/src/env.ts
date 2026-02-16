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
        EMAIL: z.string().email().optional(),
        EMAIL_PASSWORD: z.string().optional(),
        EMAIL_FROM: z.string().optional(),
        SMTP_HOST: z.string().optional(),
        SMTP_PORT: z.string().optional(),
        SMTP_USER: z.string().optional(),
        SMTP_PASS: z.string().optional(),
        SMTP_SECURE: z.string().optional(),
        SMTP_FROM: z.string().optional(),
        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    },
    runtimeEnv: {
        ...process.env,
        SMTP_USER: process.env.SMTP_USER || process.env.EMAIL,
        SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
        SMTP_FROM: process.env.SMTP_FROM || process.env.EMAIL_FROM,
    },
    emptyStringAsUndefined: true,
});
