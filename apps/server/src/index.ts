import { cors } from "@elysiajs/cors";
import { auth } from "@auth";
import { env } from "@env/server";
import { connectRedis } from "@redis";
import { Elysia } from "elysia";
import { app } from "./modules/app";
import { openapi } from "@elysiajs/openapi";
import { enforceRateLimit } from "./modules/rate-limit/rate-limit.service";

const server = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .use(
    openapi({
      path: "/docs",
    }),
  )
  .onRequest(({ request }) => {
    console.log(`[Server] ${request.method} ${request.url}`);
  })
  .onBeforeHandle((context) => {
    return enforceRateLimit(context as any);
  })
  .all("/api/auth/*", async (context) => {
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  }, {
    parse: "none",
  })
  .use(app)
  .get("/", () => "OK")
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");

    void connectRedis()
      .then((redis) => {
        if (!redis) {
          console.log("Redis is disabled");
          return;
        }

        console.log("Redis is ready");
      })
      .catch((error) => {
        console.error("Redis connection failed", error);
      });
  });

export type App = typeof server;
