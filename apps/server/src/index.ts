import { cors } from "@elysiajs/cors";
import { auth } from "@auth";
import { env } from "@env/server";
import { Elysia } from "elysia";
import { app } from "./modules/app";
import { openapi } from '@elysiajs/openapi'


const server = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .use(openapi({
    path: "/docs",
  }))
  .onRequest(({ request }) => {
    console.log(`[Server] ${request.method} ${request.url}`);
  })
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
