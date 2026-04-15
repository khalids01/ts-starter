# ts-starter

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Start, Elysia, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Elysia** - Type-safe, high-performance framework
- **Bun** - Runtime environment
- **Prisma** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses PostgreSQL with Prisma.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Generate the Prisma client and push the schema:

```bash
bun run db:push
```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## Redis Setup

Redis is optional in this starter. The shared client lives in `packages/redis`, so any future app in this monorepo can reuse the same connection and cache helpers.

1. Start Redis locally:

```bash
docker run --name ts-starter-redis -p 6379:6379 -d redis:7-alpine
```

2. Add these variables to `apps/server/.env`:

```bash
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=ts-starter:
```

3. Install dependencies after pulling the latest changes:

```bash
bun install
```

4. Import the shared client where you need caching:

```ts
import { getCache, setCache } from "@redis";

const cachedUser = await getCache<{ id: string; email: string }>("user:123");

if (!cachedUser) {
  const user = await loadUserFromDatabase();
  await setCache("user:123", user, 60);
}
```

Use Redis for short-lived, regeneratable data such as API responses, rate-limit counters, sessions, or expensive query results. Do not treat it as your source of truth; PostgreSQL remains the real database.

## Project Structure

```
ts-starter/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Start)
│   └── server/      # Backend API (Elysia)
├── packages/
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start only the server
- `bun run check-types`: Check TypeScript types across all apps
- `bun run db:push`: Push schema changes to database
- `bun run db:studio`: Open database studio UI
