import { cors } from "@elysiajs/cors";
import { auth } from "@ts-starter/auth";
import { env } from "@ts-starter/env/server";
import { Elysia } from "elysia";
import { app } from "./modules/app";

const server = new Elysia()
  .onRequest(({ request }) => {
    console.log(`[Server] ${request.method} ${request.url}`);
  })
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .all("/api/auth/*", async (context) => {
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .use(app)
  .get("/", () => "OK")
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  })

export type App = typeof server;
