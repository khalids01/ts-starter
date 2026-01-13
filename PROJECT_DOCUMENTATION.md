# Project Documentation: ts-starter

**Generated from:** `/home/khalid/Desktop/projects/saas/ts-starter`

---

## 📁 Folder Structure

```
ts-starter/
├── .turbo/
│   ├── cache/
│   │   ├── 16c8bfad8ed06f33-meta.json
│   │   ├── 16c8bfad8ed06f33.tar.zst
│   │   ├── 1c91946b3bedf830-meta.json
│   │   ├── 1c91946b3bedf830.tar.zst
│   │   ├── 6a268be120ab6ee0-meta.json
│   │   ├── 6a268be120ab6ee0.tar.zst
│   │   ├── 9996e724de769fa1-meta.json
│   │   ├── 9996e724de769fa1.tar.zst
│   │   ├── a2a0bc4ca6610b6a-meta.json
│   │   ├── a2a0bc4ca6610b6a.tar.zst
│   │   ├── fa2d7f4857c2396d-meta.json
│   │   └── fa2d7f4857c2396d.tar.zst
│   ├── cookies/ (empty)
│   ├── daemon/
│   │   ├── 6c4cbf2aefed1ed6-turbo.log.2026-01-02 (empty)
│   │   ├── 6c4cbf2aefed1ed6-turbo.log.2026-01-03 (empty)
│   │   ├── 6c4cbf2aefed1ed6-turbo.log.2026-01-10 (empty)
│   │   ├── 6c4cbf2aefed1ed6-turbo.log.2026-01-11 (empty)
│   │   └── 6c4cbf2aefed1ed6-turbo.log.2026-01-13 (empty)
│   └── preferences/
│       └── tui.json
├── apps/
│   ├── server/
│   │   ├── .turbo/
│   │   │   └── turbo-build.log
│   │   ├── src/
│   │   │   ├── email/
│   │   │   │   ├── templates/
│   │   │   │   │   └── invitation.ts
│   │   │   │   └── nodemailer.ts
│   │   │   ├── guards/
│   │   │   │   ├── owner-info.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── modules/
│   │   │   │   ├── admin/
│   │   │   │   │   ├── owner/
│   │   │   │   │   │   ├── owner.controller.ts
│   │   │   │   │   │   ├── owner.dto.ts
│   │   │   │   │   │   └── owner.service.ts
│   │   │   │   │   └── users/
│   │   │   │   │       ├── users.controller.ts
│   │   │   │   │       ├── users.dto.ts
│   │   │   │   │       └── users.service.ts
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   └── auth.service.ts
│   │   │   │   └── app.ts
│   │   │   └── index.ts
│   │   ├── .env.example
│   │   ├── .gitignore
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsdown.config.ts
│   └── web/
│       ├── .tanstack/
│       │   └── tmp/ (empty)
│       ├── .turbo/
│       │   └── turbo-build.log
│       ├── public/
│       │   └── robots.txt
│       ├── src/
│       │   ├── components/
│       │   │   ├── core/
│       │   │   │   └── user-menu.tsx
│       │   │   ├── ui/
│       │   │   │   ├── accordion.tsx
│       │   │   │   ├── alert-dialog.tsx
│       │   │   │   ├── alert.tsx
│       │   │   │   ├── aspect-ratio.tsx
│       │   │   │   ├── avatar.tsx
│       │   │   │   ├── badge.tsx
│       │   │   │   ├── breadcrumb.tsx
│       │   │   │   ├── button-group.tsx
│       │   │   │   ├── button.tsx
│       │   │   │   ├── calendar.tsx
│       │   │   │   ├── card.tsx
│       │   │   │   ├── carousel.tsx
│       │   │   │   ├── chart.tsx
│       │   │   │   ├── checkbox.tsx
│       │   │   │   ├── collapsible.tsx
│       │   │   │   ├── command.tsx
│       │   │   │   ├── context-menu.tsx
│       │   │   │   ├── dialog.tsx
│       │   │   │   ├── drawer.tsx
│       │   │   │   ├── dropdown-menu.tsx
│       │   │   │   ├── empty.tsx
│       │   │   │   ├── field.tsx
│       │   │   │   ├── hover-card.tsx
│       │   │   │   ├── input-group.tsx
│       │   │   │   ├── input-otp.tsx
│       │   │   │   ├── input.tsx
│       │   │   │   ├── item.tsx
│       │   │   │   ├── kbd.tsx
│       │   │   │   ├── label.tsx
│       │   │   │   ├── menubar.tsx
│       │   │   │   ├── navigation-menu.tsx
│       │   │   │   ├── pagination.tsx
│       │   │   │   ├── popover.tsx
│       │   │   │   ├── progress.tsx
│       │   │   │   ├── radio-group.tsx
│       │   │   │   ├── resizable.tsx
│       │   │   │   ├── scroll-area.tsx
│       │   │   │   ├── select.tsx
│       │   │   │   ├── separator.tsx
│       │   │   │   ├── sheet.tsx
│       │   │   │   ├── sidebar.tsx
│       │   │   │   ├── skeleton.tsx
│       │   │   │   ├── slider.tsx
│       │   │   │   ├── sonner.tsx
│       │   │   │   ├── spinner.tsx
│       │   │   │   ├── switch.tsx
│       │   │   │   ├── table.tsx
│       │   │   │   ├── tabs.tsx
│       │   │   │   ├── textarea.tsx
│       │   │   │   ├── toggle-group.tsx
│       │   │   │   ├── toggle.tsx
│       │   │   │   └── tooltip.tsx
│       │   │   ├── header.tsx
│       │   │   └── loader.tsx
│       │   ├── features/
│       │   │   ├── admin/
│       │   │   │   └── owner/
│       │   │   │       ├── owner-setup.tsx
│       │   │   │       └── use-owner-info.ts
│       │   │   ├── auth/
│       │   │   │   ├── sign-in-form.tsx
│       │   │   │   └── sign-up-form.tsx
│       │   │   ├── landing/
│       │   │   │   ├── components/
│       │   │   │   │   ├── cta.tsx
│       │   │   │   │   ├── faq.tsx
│       │   │   │   │   ├── features.tsx
│       │   │   │   │   ├── footer.tsx
│       │   │   │   │   ├── hero.tsx
│       │   │   │   │   ├── landing-nav.tsx
│       │   │   │   │   ├── pricing.tsx
│       │   │   │   │   └── testimonials.tsx
│       │   │   │   └── home.tsx
│       │   │   ├── payment/
│       │   │   │   └── lib/
│       │   │   │       └── get-payment.ts
│       │   │   └── user/
│       │   │       └── lib/
│       │   │           └── get-user.ts
│       │   ├── layouts/
│       │   │   └── root.tsx
│       │   ├── lib/
│       │   │   ├── auth-client.ts
│       │   │   ├── client.ts
│       │   │   └── utils.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   └── setup-owner.ts
│       │   ├── providers/
│       │   │   ├── tanstack-router.tsx
│       │   │   └── theme-provider.tsx
│       │   ├── routes/
│       │   │   ├── _auth/
│       │   │   │   └── login.tsx
│       │   │   ├── _protected/
│       │   │   │   └── dashboard.tsx
│       │   │   ├── _public/
│       │   │   │   └── index.tsx
│       │   │   ├── admin/ (empty)
│       │   │   ├── payment/
│       │   │   │   └── success.tsx
│       │   │   ├── __root.tsx
│       │   │   └── setup.tsx
│       │   ├── index.css
│       │   ├── router.tsx
│       │   └── routeTree.gen.ts
│       ├── .env.example
│       ├── .gitignore
│       ├── components.json
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── packages/
│   ├── auth/
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   └── payments.ts
│   │   │   └── index.ts
│   │   ├── .gitignore
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── config/
│   │   ├── src/
│   │   │   └── config.ts
│   │   ├── package.json
│   │   └── tsconfig.base.json
│   └── db/
│       ├── prisma/
│       │   ├── generated/
│       │   │   ├── internal/
│       │   │   │   ├── class.ts
│       │   │   │   ├── prismaNamespace.ts
│       │   │   │   └── prismaNamespaceBrowser.ts
│       │   │   ├── models/
│       │   │   │   ├── Account.ts
│       │   │   │   ├── Invitation.ts
│       │   │   │   ├── Session.ts
│       │   │   │   ├── User.ts
│       │   │   │   └── Verification.ts
│       │   │   ├── browser.ts
│       │   │   ├── client.ts
│       │   │   ├── commonInputTypes.ts
│       │   │   ├── enums.ts
│       │   │   └── models.ts
│       │   ├── migrations/
│       │   │   ├── 20260102181519_init/
│       │   │   │   └── migration.sql
│       │   │   ├── 20260103173633_user_invitation/
│       │   │   │   └── migration.sql
│       │   │   └── migration_lock.toml
│       │   └── schema/
│       │       ├── auth.prisma
│       │       └── schema.prisma
│       ├── src/
│       │   └── index.ts
│       ├── .gitignore
│       ├── package.json
│       ├── prisma.config.ts
│       └── tsconfig.json
├── .gitignore
├── bts.jsonc
├── bun.lock
├── bunfig.toml
├── LICENSE
├── package.json
├── README.md
├── tsconfig.json
└── turbo.json
```

---

## 📄 File Contents

### `.gitignore`

```
# Dependencies
node_modules
.pnp
.pnp.js

# Build outputs
dist
build
*.tsbuildinfo

# Environment variables
.env
.env*.local

# IDEs and editors
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea
*.swp
*.swo
*~
.DS_Store

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Turbo
.turbo

# Better-T-Stack
.alchemy

# Testing
coverage
.nyc_output

# Misc
*.tgz
.cache
tmp
temp
```

---

### `.turbo/cache/16c8bfad8ed06f33-meta.json`

```json
{"hash":"16c8bfad8ed06f33","duration":18439}
```

---

### `.turbo/cache/1c91946b3bedf830-meta.json`

```json
{"hash":"1c91946b3bedf830","duration":19892}
```

---

### `.turbo/cache/6a268be120ab6ee0-meta.json`

```json
{"hash":"6a268be120ab6ee0","duration":385}
```

---

### `.turbo/cache/9996e724de769fa1-meta.json`

```json
{"hash":"9996e724de769fa1","duration":364}
```

---

### `.turbo/cache/a2a0bc4ca6610b6a-meta.json`

```json
{"hash":"a2a0bc4ca6610b6a","duration":812}
```

---

### `.turbo/cache/fa2d7f4857c2396d-meta.json`

```json
{"hash":"fa2d7f4857c2396d","duration":24344}
```

---

### `.turbo/daemon/6c4cbf2aefed1ed6-turbo.log.2026-01-02`

```
(empty file)
```

---

### `.turbo/daemon/6c4cbf2aefed1ed6-turbo.log.2026-01-03`

```
(empty file)
```

---

### `.turbo/daemon/6c4cbf2aefed1ed6-turbo.log.2026-01-10`

```
(empty file)
```

---

### `.turbo/daemon/6c4cbf2aefed1ed6-turbo.log.2026-01-11`

```
(empty file)
```

---

### `.turbo/daemon/6c4cbf2aefed1ed6-turbo.log.2026-01-13`

```
(empty file)
```

---

### `.turbo/preferences/tui.json`

```json
{
  "is_task_list_visible": true,
  "active_task": "web#build"
}
```

---

### `LICENSE`

```
MIT License

Copyright (c) 2026 Khalid Khan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

### `README.md`

```markdown
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
```

---

### `apps/server/.env.example`

```
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
POLAR_ACCESS_TOKEN=
POLAR_SUCCESS_URL=
ENABLE_POLAR=false
CORS_ORIGIN=
DATABASE_URL=

EMAIL=
EMAIL_PASSWORD=

EMAIL_FROM=
# uj34Fj7C32

SMTP_HOST='smtp.gmail.com'
SMTP_PORT=465
```

---

### `apps/server/.gitignore`

```
# prod
dist/
/build
/out/

# dev
.yarn/
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions
.vscode/*
!.vscode/launch.json
!.vscode/*.code-snippets
.idea/workspace.xml
.idea/usage.statistics.xml
.idea/shelf
.wrangler
.alchemy
/.next/
.vercel
prisma/generated/


# deps
node_modules/
/node_modules
/.pnp
.pnp.*

# env
.env*
.env.production
!.env.example
.dev.vars

# logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# misc
.DS_Store
*.pem

# local db
*.db*

# typescript
*.tsbuildinfo
next-env.d.ts
```

---

### `apps/server/.turbo/turbo-build.log`

```

[0m[2m[35m$[0m [2m[1mtsdown[0m
[34mℹ[39m tsdown [2mv0.16.8[22m powered by rolldown [2mv1.0.0-beta.52[22m
[34mℹ[39m Using tsdown config: [4m/home/khalid/Desktop/projects/saas/ts-starter/apps/server/tsdown.config.ts[24m
[34mℹ[39m entry: [34msrc/index.ts[39m
[34mℹ[39m tsconfig: [34mtsconfig.json[39m
[34mℹ[39m Build start
[34mℹ[39m Cleaning 1 files
[34mℹ[39m [2mdist/[22m[1mindex.mjs[22m  [2m14.03 kB[22m [2m│ gzip: 4.47 kB[22m
[34mℹ[39m 1 files, total: 14.03 kB
[32m✔[39m Build complete in [32m114ms[39m
```

---

### `apps/server/package.json`

```json
{
  "name": "server",
  "type": "module",
  "main": "src/index.ts",
  "scripts": {
    "build": "tsdown",
    "check-types": "tsc -b",
    "compile": "bun build --compile --minify --sourcemap --bytecode ./src/index.ts --outfile server",
    "dev": "bun run --hot src/index.ts",
    "start": "bun run dist/index.js"
  },
  "dependencies": {
    "@elysiajs/cors": "^1.3.3",
    "@elysiajs/openapi": "^1.4.13",
    "@auth": "workspace:*",
    "@config": "workspace:*",
    "@db": "workspace:*",
    "@env": "workspace:*",
    "better-auth": "catalog:",
    "dotenv": "catalog:",
    "elysia": "^1.3.21",
    "nodemailer": "^7.0.12",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@types/bun": "catalog:",
    "@types/nodemailer": "^7.0.4",
    "tsdown": "^0.16.5",
    "typescript": "catalog:"
  }
}
```

---

### `apps/server/src/email/nodemailer.ts`

```typescript
import nodemailer from "nodemailer";
import { env } from "@env/server";

export const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || "localhost",
    port: Number(env.SMTP_PORT) || 587,
    secure: env.SMTP_SECURE === "true",
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const info = await transporter.sendMail({
            from: env.SMTP_FROM || '"Antigravity" <hello@example.com>',
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
```

---

### `apps/server/src/email/templates/invitation.ts`

```typescript
import { siteConfig } from "@config";

export const invitationTemplate = (inviteUrl: string, inviterName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${siteConfig.name}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      padding: 40px;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #000;
      margin-bottom: 32px;
      text-align: center;
    }
    .content {
      margin-bottom: 32px;
    }
    h1 {
      font-size: 22px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #111827;
    }
    p {
      margin-bottom: 16px;
      color: #4b5563;
    }
    .button-container {
      text-align: center;
      margin-top: 32px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #000;
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    .button:hover {
      background-color: #333;
    }
    .footer {
      text-align: center;
      font-size: 14px;
      color: #9ca3af;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">${siteConfig.name}</div>
    <div class="content">
      <h1>Join our team</h1>
      <p>Hello,</p>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${siteConfig.name}</strong>.</p>
      <p>Click the button below to accept the invitation and set up your account.</p>
      <div class="button-container">
        <a href="${inviteUrl}" class="button">Accept Invitation</a>
      </div>
      <p style="margin-top: 32px; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
```

---

### `apps/server/src/guards/owner-info.guard.ts`

```typescript
import { Elysia } from "elysia";
import prisma from "@db";

export const ownerInfoGuard = new Elysia({ name: "ownerInfoGuard" })
    .onBeforeHandle(async ({ set }) => {
        const owner = await prisma.user.findFirst({
            where: {
                role: "OWNER",
            },
        });

        if (owner) {
            set.status = 404;
            return "Not Found";
        }
    });
```

---

### `apps/server/src/guards/roles.guard.ts`

```typescript
import { auth } from "@/modules/auth/auth.service";
import type { Role } from "@db";

/**
 * Elysia beforeHandle guard to allow access only for specified roles.
 * - Retrieves session via Better Auth using request headers.
 * - Returns 401 if unauthenticated.
 * - Returns 403 if role is not allowed. Admin always passes.
 */
export const rolesGuard = (allowed: Role[]) =>
    async (ctx: any) => {
        // Prefer derived values from sessionCache middleware if available
        const derivedUser = ctx.user as { role?: Role } | undefined;
        if (derivedUser?.role) {
            const role = derivedUser.role as Role;
            if (role === "ADMIN") return; // admin bypass
            if (!allowed.includes(role)) {
                ctx.set.status = 403;
                return { message: "Forbidden", status: 403 };
            }
            return;
        }

        const session = await auth.api.getSession({ headers: ctx.request.headers });
        if (!session) {
            ctx.set.status = 401;
            return { message: "Unauthorized", status: 401 };
        }

        const role = session.user.role as Role | undefined;
        if (!role) {
            ctx.set.status = 401;
            return { message: "Unauthorized", status: 401 };
        }

        if (role === "ADMIN") return; // admin bypass
        if (!allowed.includes(role)) {
            ctx.set.status = 403;
            return { message: "Forbidden", status: 403 };
        }

        // proceed
        return;
    };
```

---

### `apps/server/src/index.ts`

```typescript
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
```

---

### `apps/server/src/modules/admin/owner/owner.controller.ts`

```typescript
import { Elysia, t } from "elysia";
import { OwnerService } from "./owner.service";
import { CreateOwnerDto } from "./owner.dto";
import { env } from "@env/server";
import { ownerInfoGuard } from "../../../guards/owner-info.guard";

const ownerService = new OwnerService();

export const ownerController = new Elysia({ prefix: "/owner" })
    .use(ownerInfoGuard)
    .get("/setup-status", async ({ redirect }) => {
        const hasOwner = await ownerService.hasOwner();
        if (!hasOwner) {
            redirect(env.CORS_ORIGIN + "/setup");
        }

        return { hasOwner };
    }, {
        detail: {
            tags: ['Owner'],
            summary: 'Check setup status',
            description: 'Checks if the initial owner has been created. Redirects to /setup if not.',
            responses: {
                200: {
                    description: 'Setup status retrieved',
                    content: {
                        'application/json': {
                            schema: t.Object({
                                hasOwner: t.Boolean()
                            })
                        }
                    }
                }
            }
        }
    })
    .post("/setup", async ({ body, set }) => {
        try {
            const owner = await ownerService.createOwner(body);
            return {
                message: "Owner created successfully",
                user: {
                    id: owner.id,
                    name: owner.name,
                    email: owner.email,
                },
            };
        } catch (error: any) {
            set.status = 400;
            return { error: error.message || "Failed to create owner" };
        }
    }, {
        body: CreateOwnerDto,
        detail: {
            tags: ['Owner'],
            summary: 'Create initial owner',
            description: 'Creates the first owner account for the platform. Only accessible if no owner exists.',
            responses: {
                200: {
                    description: 'Owner created successfully',
                    content: {
                        'application/json': {
                            schema: t.Object({
                                message: t.String(),
                                user: t.Object({
                                    id: t.String(),
                                    name: t.String(),
                                    email: t.String(),
                                })
                            })
                        }
                    }
                },
                400: {
                    description: 'Failed to create owner',
                    content: {
                        'application/json': {
                            schema: t.Object({
                                error: t.String()
                            })
                        }
                    }
                },
                404: {
                    description: 'Route hidden because owner already exists'
                }
            }
        }
    });
```

---

### `apps/server/src/modules/admin/owner/owner.dto.ts`

```typescript
import { t } from "elysia";

export const CreateOwnerDto = t.Object({
    name: t.String({ minLength: 2 }),
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 8 }),
});

export type CreateOwner = typeof CreateOwnerDto.static;
```

---

### `apps/server/src/modules/admin/owner/owner.service.ts`

```typescript
import prisma from "@db";
import { auth } from "@auth";
import type { CreateOwner } from "./owner.dto";

export class OwnerService {
    async hasOwner() {
        const owner = await prisma.user.findFirst({
            where: {
                role: "OWNER",
            },
        });
        return !!owner;
    }

    async createOwner(data: CreateOwner) {
        const hasOwner = await this.hasOwner();
        if (hasOwner) {
            throw new Error("Owner already exists");
        }

        // Use better-auth to create the user with password hashing
        // We create the user first, then update the role to OWNER
        const user = await auth.api.signUpEmail({
            body: {
                email: data.email,
                password: data.password,
                name: data.name,
            },
        });

        if (!user) {
            throw new Error("Failed to create owner user");
        }

        // Update the role to OWNER
        const updatedUser = await prisma.user.update({
            where: {
                id: user.user.id,
            },
            data: {
                role: "OWNER",
                emailVerified: true
            },
        });

        return updatedUser;
    }
}
```

---

### `apps/server/src/modules/admin/users/users.controller.ts`

```typescript
import { Elysia } from "elysia";
import { rolesGuard } from "../../../guards/roles.guard";
import { usersService } from "./users.service";
import {
    UserQueryDto,
    UpdateUserDto,
    BanUserDto,
    InviteUserDto
} from "./users.dto";
import { auth } from "@/modules/auth/auth.service";

export const usersController = new Elysia({
    prefix: "/admin/users",
    detail: {
        tags: ["Admin - Users"]
    }
})
    .guard({
        beforeHandle: rolesGuard(["ADMIN", "OWNER"])
    }, (app) =>
        app
            .get("/", ({ query }) => usersService.listUsers(query), {
                query: UserQueryDto,
                detail: {
                    summary: "List all users with pagination and filters",
                }
            })
            .get("/:id", async ({ params: { id }, set }) => {
                const user = await usersService.getUserById(id);
                if (!user) {
                    set.status = 404;
                    return "User not found";
                }
                return user;
            }, {
                detail: {
                    summary: "Get detailed information about a user",
                }
            })
            .patch("/:id", async ({ params: { id }, body, set }) => {
                try {
                    return await usersService.updateUser(id, body);
                } catch (e: any) {
                    set.status = 400;
                    return e.message;
                }
            }, {
                body: UpdateUserDto,
                detail: {
                    summary: "Update user details (name, role)",
                }
            })
            .post("/:id/ban", ({ params: { id }, body }) => usersService.banUser(id, body.reason), {
                body: BanUserDto,
                detail: {
                    summary: "Ban a user from the system",
                }
            })
            .post("/:id/unban", ({ params: { id } }) => usersService.unbanUser(id), {
                detail: {
                    summary: "Unban a user",
                }
            })
            .post("/:id/archive", ({ params: { id } }) => usersService.archiveUser(id), {
                detail: {
                    summary: "Archive a user (soft delete)",
                }
            })
            .post("/:id/restore", ({ params: { id } }) => usersService.restoreUser(id), {
                detail: {
                    summary: "Restore an archived user",
                }
            })
            .delete("/:id", ({ params: { id } }) => usersService.deleteUserPermanent(id), {
                detail: {
                    summary: "Permanently delete a user from the database",
                }
            })
            .post("/invite", async ({ body, request, set }) => {
                const session = await auth.api.getSession({ headers: request.headers });
                if (!session) {
                    set.status = 401;
                    return "Unauthorized";
                }
                try {
                    return await usersService.inviteUser(body.email, body.role || "USER", session.user.id);
                } catch (e: any) {
                    set.status = 400;
                    return e.message;
                }
            }, {
                body: InviteUserDto,
                detail: {
                    summary: "Invite a new user via email",
                }
            })
    );
```

---

### `apps/server/src/modules/admin/users/users.dto.ts`

```typescript
import { t } from "elysia";
import { Role } from "@db";

export const UserRoleSchema = t.Enum(Role);

export const UpdateUserDto = t.Object({
    name: t.Optional(t.String()),
    role: t.Optional(UserRoleSchema),
});

export const BanUserDto = t.Object({
    reason: t.Optional(t.String()),
});

export const InviteUserDto = t.Object({
    email: t.String({ format: "email" }),
    role: t.Optional(UserRoleSchema),
});

export const UserQueryDto = t.Object({
    page: t.Optional(t.Numeric({ default: 1 })),
    limit: t.Optional(t.Numeric({ default: 10 })),
    search: t.Optional(t.String()),
    role: t.Optional(UserRoleSchema),
    banned: t.Optional(t.Boolean()),
    archived: t.Optional(t.Boolean()),
});

export type UserQuery = typeof UserQueryDto.static;
export type UpdateUser = typeof UpdateUserDto.static;
export type BanUser = typeof BanUserDto.static;
export type InviteUser = typeof InviteUserDto.static;
```

---

### `apps/server/src/modules/admin/users/users.service.ts`

```typescript
import prisma from "@db";
import type { Role } from "@db";
import { sendEmail } from "../../../email/nodemailer";
import { invitationTemplate } from "../../../email/templates/invitation";
import { env } from "@env/server";

export class UsersService {
    async listUsers(query: {
        page?: number;
        limit?: number;
        search?: string;
        role?: Role;
        banned?: boolean;
        archived?: boolean;
    }) {
        const { page = 1, limit = 10, search, role, banned, archived } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }
        if (role) where.role = role;
        if (banned !== undefined) where.banned = banned;
        if (archived !== undefined) where.archived = archived;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            users,
            total,
            pages: Math.ceil(total / limit),
        };
    }

    async getUserById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            include: {
                invitations: true,
            }
        });
    }

    async updateUser(id: string, data: { name?: string; role?: Role }) {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    async banUser(id: string, reason?: string) {
        return prisma.user.update({
            where: { id },
            data: { banned: true, banReason: reason },
        });
    }

    async unbanUser(id: string) {
        return prisma.user.update({
            where: { id },
            data: { banned: false, banReason: null },
        });
    }

    async archiveUser(id: string) {
        return prisma.user.update({
            where: { id },
            data: { archived: true },
        });
    }

    async restoreUser(id: string) {
        return prisma.user.update({
            where: { id },
            data: { archived: false },
        });
    }

    async deleteUserPermanent(id: string) {
        // Delete related records first if necessary, or let Cascade handle it
        return prisma.user.delete({
            where: { id },
        });
    }

    async inviteUser(email: string, role: Role = "USER", inviterId: string) {
        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) throw new Error("User already exists");

        // Get inviter info for the email
        const inviter = await prisma.user.findUnique({ where: { id: inviterId } });
        const inviterName = inviter?.name || "A team member";

        // Create invitation (expiration 7 days)
        const invitation = await prisma.invitation.create({
            data: {
                id: crypto.randomUUID(),
                email,
                role,
                inviterId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        // Send email
        const inviteUrl = `${env.BETTER_AUTH_URL}/accept-invitation?id=${invitation.id}`;
        await sendEmail(
            email,
            `You're invited to join the team`,
            invitationTemplate(inviteUrl, inviterName)
        );

        return invitation;
    }
}

export const usersService = new UsersService();
```

---

### `apps/server/src/modules/app.ts`

```typescript
import Elysia from "elysia";
import { ownerController } from "./admin/owner/owner.controller";
import { usersController } from "./admin/users/users.controller";
import { authController } from "./auth/auth.controller";

export const app = new Elysia()
    .use(authController)
    .use(ownerController)
    .use(usersController);
```

---

### `apps/server/src/modules/auth/auth.controller.ts`

```typescript
import { Elysia, t } from "elysia";
import { auth } from "@auth";
import prisma from "@db";
import { env } from "@env/server";

export const authController = new Elysia({ prefix: "/auth" })
    .post("/check-email", async ({ body }) => {
        const user = await prisma.user.findUnique({ where: { email: body.email } });
        return { exists: !!user };
    }, {
        body: t.Object({ email: t.String() })
    })
    .post("/magic-link/login", async ({ body, request, set }) => {
        const user = await prisma.user.findUnique({ where: { email: body.email } });
        if (!user) {
            set.status = 400;
            return { message: "User not found" };
        }
        await auth.api.signInMagicLink({
            body: {
                email: body.email,
                callbackURL: env.CORS_ORIGIN
            },
            headers: request.headers
        });
        return { success: true };
    }, {
        body: t.Object({ email: t.String() })
    })
    .post("/magic-link/signup", async ({ body, request, set }) => {
        const user = await prisma.user.findUnique({ where: { email: body.email } });
        if (user) {
            set.status = 400;
            return { message: "User already exists" };
        }
        await auth.api.signInMagicLink({
            body: {
                email: body.email,
                name: body.name,
                callbackURL: env.CORS_ORIGIN
            },
            headers: request.headers
        });
        return { success: true };
    }, {
        body: t.Object({ email: t.String(), name: t.String() })
    });
```

---

### `apps/server/src/modules/auth/auth.service.ts`

```typescript
import { auth } from "@auth";

export { auth };
```

---

### `apps/server/tsconfig.json`

```json
{
  "extends": "../../packages/config/tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@auth": ["../../packages/auth/src"],
      "@db": ["../../packages/db/src"],
      "@env/*": ["../../packages/env/src/*"],
      "@config": ["../../packages/config/src/config.ts"]
    },
    "jsx": "react-jsx"
  }
}
```

---

### `apps/server/tsdown.config.ts`

```typescript
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  format: "esm",
  outDir: "./dist",
  clean: true,
  noExternal: [/@ts-starter\/.*/],
});
```

---

### `apps/web/.env.example`

```
VITE_SERVER_URL=
```

---

### `apps/web/.gitignore`

```
# Dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# Testing
/coverage

# Build outputs
/.next/
/out/
/build/
/dist/
.vinxi
.output
.react-router/
.tanstack/
.nitro/

# Deployment
.vercel
.netlify
.wrangler
.alchemy

# Environment & local files
.env*
!.env.example
.DS_Store
*.pem
*.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
*.log*

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/*
!.vscode/extensions.json
.idea

# Other
dev-dist

.wrangler
.dev.vars*

.open-next
```

---

### `apps/web/components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-lyra",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```

---

### `apps/web/package.json`

```json
{
  "name": "web",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build",
    "serve": "vite preview",
    "dev": "vite dev"
  },
  "dependencies": {
    "@base-ui/react": "^1.0.0",
    "@elysiajs/eden": "^1.4.6",
    "@polar-sh/better-auth": "catalog:",
    "@prisma/client": "catalog:",
    "@tailwindcss/vite": "^4.1.8",
    "@tanstack/react-form": "^1.23.5",
    "@tanstack/react-query": "^5.90.16",
    "@tanstack/react-router": "^1.141.1",
    "@tanstack/react-router-with-query": "^1.130.17",
    "@tanstack/react-start": "^1.141.1",
    "@tanstack/router-plugin": "^1.141.1",
    "@auth": "workspace:*",
    "@db": "workspace:*",
    "@env": "workspace:*",
    "better-auth": "catalog:",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "dotenv": "catalog:",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.525.0",
    "next-themes": "^0.4.6",
    "react": "19.2.3",
    "react-day-picker": "^9.13.0",
    "react-dom": "19.2.3",
    "react-resizable-panels": "^4.2.0",
    "recharts": "2.15.4",
    "shadcn": "^3.6.2",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.3.1",
    "tailwindcss": "^4.1.3",
    "tw-animate-css": "^1.2.5",
    "vaul": "^1.1.2",
    "vite-tsconfig-paths": "^5.1.4",
    "zod": "catalog:",
    "zustand": "^5.0.9"
  },
  "devDependencies": {
    "@tanstack/react-router-devtools": "^1.141.1",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/react": "^16.2.0",
    "@types/react": "19.2.7",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "^5.0.4",
    "jsdom": "^26.0.0",
    "vite": "^7.0.2",
    "web-vitals": "^5.0.3",
    "@tanstack/react-query-devtools": "^5.91.1",
    "typescript": "catalog:",
    "@config": "workspace:*"
  }
}
```

---

### `apps/web/public/robots.txt`

```
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:
```

---

### `apps/web/src/components/core/user-menu.tsx`

```tsx
import { Link, useNavigate } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <>
        <Link to="/login">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Log in
          </Button>
        </Link>
        <Link to="/login">
          <Button size="sm">Get Started</Button>
        </Link>
      </>
    );
  }

  const items = [
    {
      label: "My Account",
      href: "/account",
      type: "url",
    },
    {
      label: "Admin Dashboard",
      href: "/admin/overview",
      type: "url",
      show:
        (session.user as any)?.role === "ADMIN" ||
        (session.user as any)?.role === "OWNER",
    },
    {
      label: "Sign out",
      type: "btn",
      onClick: () => {
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              navigate({
                to: "/",
              });
            },
          },
        });
      },
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" className={"rounded-full size-9"} />}
      >
        <User className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span className="text-sm font-medium">{session.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {session.user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {items.map((item) => {
            if (item.show === false) return null;

            if (item.type === "url" && item.href) {
              return (
                <DropdownMenuItem
                  className={"text-base"}
                  onClick={() => navigate({ to: item.href })}
                  key={item.label}
                >
                  {item.label}
                </DropdownMenuItem>
              );
            }

            return (
              <DropdownMenuItem
                key={item.label}
                onClick={item.onClick}
                className={cn(
                  item.label === "Sign out" ? "text-destructive" : "",
                  "text-base"
                )}
              >
                {item.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

### `apps/web/src/components/header.tsx`

```tsx
import { Link } from "@tanstack/react-router";

import UserMenu from "./core/user-menu";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} to={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
```

---

### `apps/web/src/components/loader.tsx`

```tsx
import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-8">
      <Loader2 className="animate-spin" />
    </div>
  );
}
```

---

### `apps/web/src/components/ui/accordion.tsx`

```tsx
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:after:border-ring **:data-[slot=accordion-trigger-icon]:text-muted-foreground rounded-none py-2.5 text-left text-xs font-medium hover:underline focus-visible:ring-1 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon data-slot="accordion-trigger-icon" className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden" />
        <ChevronUpIcon data-slot="accordion-trigger-icon" className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="data-open:animate-accordion-down data-closed:animate-accordion-up text-xs overflow-hidden"
      {...props}
    >
      <div
        className={cn(
          "pt-0 pb-2.5 [&_a]:hover:text-foreground h-(--accordion-panel-height) data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
```

---

### `apps/web/src/components/ui/alert-dialog.tsx`

```tsx
import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function AlertDialog({ ...props }: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({ ...props }: AlertDialogPrimitive.Trigger.Props) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({ ...props }: AlertDialogPrimitive.Portal.Props) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: AlertDialogPrimitive.Backdrop.Props) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  size = "default",
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  size?: "default" | "sm"
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 bg-background ring-foreground/10 gap-4 rounded-none p-4 ring-1 duration-100 data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn("bg-muted mb-2 inline-flex size-10 items-center justify-center rounded-none sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-sm font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground *:[a]:hover:text-foreground text-xs/relaxed text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="alert-dialog-action"
      className={cn(className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: AlertDialogPrimitive.Close.Props &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      className={cn(className)}
      render={<Button variant={variant} size={size} />}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
```

---

### `apps/web/src/components/ui/alert.tsx`

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva("grid gap-0.5 rounded-none border px-2.5 py-2 text-left text-xs has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 w-full relative group/alert", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      destructive: "text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground text-xs/relaxed text-balance md:text-pretty [&_p:not(:last-child)]:mb-2 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-[calc(--spacing(1.25))] right-[calc(--spacing(1.25))]", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
```

---

### `apps/web/src/components/ui/aspect-ratio.tsx`

```tsx
import { cn } from "@/lib/utils"

function AspectRatio({
  ratio,
  className,
  ...props
}: React.ComponentProps<"div"> & { ratio: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={
        {
          "--ratio": ratio,
        } as React.CSSProperties
      }
      className={cn("relative aspect-(--ratio)", className)}
      {...props}
    />
  )
}

export { AspectRatio }
```

---

### `apps/web/src/components/ui/avatar.tsx`

```tsx
"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  size = "default",
  ...props
}: AvatarPrimitive.Root.Props & {
  size?: "default" | "sm" | "lg"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "size-8 rounded-full after:rounded-full data-[size=lg]:size-10 data-[size=sm]:size-6 after:border-border group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:mix-blend-darken dark:after:mix-blend-lighten",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "rounded-full aspect-square size-full object-cover",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted text-muted-foreground rounded-full flex size-full items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs",
        className
      )}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "*:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn("bg-muted text-muted-foreground size-8 rounded-full text-xs group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3 ring-background relative flex shrink-0 items-center justify-center ring-2", className)}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}
```

---

### `apps/web/src/components/ui/badge.tsx`

```tsx
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "h-5 gap-1 rounded-none border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ className, variant })),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
```

---

### `apps/web/src/components/ui/breadcrumb.tsx`

```tsx
import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    />
  )
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground gap-1.5 text-xs flex flex-wrap items-center break-words",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("gap-1 inline-flex items-center", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  className,
  render,
  ...props
}: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn("hover:text-foreground transition-colors", className),
      },
      props
    ),
    render,
    state: {
      slot: "breadcrumb-link",
    },
  })
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? (
        <ChevronRightIcon
        />
      )}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "size-5 [&>svg]:size-4 flex items-center justify-center",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
```

---

### `apps/web/src/components/ui/button-group.tsx`

```tsx
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const buttonGroupVariants = cva(
  "rounded-none has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-none flex w-fit items-stretch [&>*]:focus-visible:z-10 [&>*]:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0 [&>[data-slot]]:rounded-r-none",
        vertical:
          "flex-col [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0 [&>[data-slot]]:rounded-b-none",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "bg-muted gap-2 rounded-none border px-2.5 text-xs font-medium [&_svg:not([class*='size-'])]:size-4 flex items-center [&_svg]:pointer-events-none",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "button-group-text",
    },
  })
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "bg-input relative self-stretch data-[orientation=horizontal]:mx-px data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-px data-[orientation=vertical]:h-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
```

---

### `apps/web/src/components/ui/button.tsx`

```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-none border border-transparent bg-clip-padding text-xs font-medium focus-visible:ring-1 aria-invalid:ring-1 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive: "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-none px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-none px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 rounded-none [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-none",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
```

---

### `apps/web/src/components/ui/calendar.tsx`

```tsx
"use client"

import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-2 [--cell-size:--spacing(7)] bg-background group/calendar [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative cn-calendar-dropdown-root rounded-(--cell-radius)",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "cn-calendar-caption-label rounded-(--cell-radius) flex items-center gap-1 text-sm  [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-(--cell-radius) flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full rounded-(--cell-radius) h-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius) group/day aspect-square select-none",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
            : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-(--cell-radius) bg-muted elative after:bg-muted after:absolute after:inset-y-0 after:w-4 after:right-0 -z-0 isolate",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "rounded-r-(--cell-radius) bg-muted relative after:bg-muted after:absolute after:inset-y-0 after:w-4 after:left-0 -z-0 isolate",
          defaultClassNames.range_end
        ),
        today: cn(
          "bg-muted text-foreground rounded-(--cell-radius) data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn("size-4", className)} {...props} />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-foreground relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
```

---

### `apps/web/src/components/ui/card.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn("ring-foreground/10 bg-card text-card-foreground gap-4 overflow-hidden rounded-none py-4 text-xs/relaxed ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-2 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-none *:[img:last-child]:rounded-none group/card flex flex-col", className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "gap-1 rounded-none px-4 group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-sm font-medium group-data-[size=sm]/card:text-sm", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-xs/relaxed", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("rounded-none border-t p-4 group-data-[size=sm]/card:p-3 flex items-center", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
```

---

### `apps/web/src/components/ui/carousel.tsx`

```tsx
import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon
      />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon
      />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
}
```

---

### `apps/web/src/components/ui/chart.tsx`

```tsx
"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "border-border/50 bg-background gap-1.5 rounded-none border px-2.5 py-1.5 text-xs shadow-xl grid min-w-[8rem] items-start",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean
    nameKey?: string
  }) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item.value}
              className={cn(
                "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
    </div>
  )
}

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
```

---

### `apps/web/src/components/ui/checkbox.tsx`

```tsx
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex size-4 items-center justify-center rounded-none border transition-colors group-has-disabled/field:opacity-50 focus-visible:ring-1 aria-invalid:ring-1 peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="[&>svg]:size-3.5 grid place-content-center text-current transition-none"
      >
        <CheckIcon
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
```

---

### `apps/web/src/components/ui/collapsible.tsx`

```tsx
"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
```

---

### `apps/web/src/components/ui/command.tsx`

```tsx
"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { SearchIcon, CheckIcon } from "lucide-react"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground rounded-none flex size-full flex-col overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  children: React.ReactNode
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("rounded-none overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="border-b pb-0">
      <InputGroup className="bg-input/30 border-input/30 h-8 border-none shadow-none! *:data-[slot=input-group-addon]:pl-2!">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            "w-full text-xs outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "no-scrollbar max-h-72 scroll-py-0 outline-none overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-xs", className)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn("text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs", className)}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-selected:bg-muted data-selected:text-foreground data-selected:*:[svg]:text-foreground relative flex cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden select-none [&_svg:not([class*='size-'])]:size-4 [[data-slot=dialog-content]_&]:rounded-none! group/command-item data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-[[data-slot=command-shortcut]]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("text-muted-foreground group-data-selected/command-item:text-foreground ml-auto text-xs tracking-widest", className)}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
```

---

### `apps/web/src/components/ui/context-menu.tsx`

```tsx
import * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu"

import { cn } from "@/lib/utils"
import { ChevronRightIcon, CheckIcon } from "lucide-react"

function ContextMenu({ ...props }: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuPortal({ ...props }: ContextMenuPrimitive.Portal.Props) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  )
}

function ContextMenuTrigger({
  className,
  ...props
}: ContextMenuPrimitive.Trigger.Props) {
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn("select-none", className)}
      {...props}
    />
  )
}

function ContextMenuContent({
  className,
  align = "start",
  alignOffset = 4,
  side = "right",
  sideOffset = 0,
  ...props
}: ContextMenuPrimitive.Popup.Props &
  Pick<
    ContextMenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
          className={cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-36 rounded-none shadow-md ring-1 duration-100 z-50 max-h-(--available-height) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none", className )}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuGroup({ ...props }: ContextMenuPrimitive.Group.Props) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  )
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn("text-muted-foreground px-2 py-2 text-xs data-[inset]:pl-8", className)}
      {...props}
    />
  )
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: ContextMenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive focus:*:[svg]:text-accent-foreground gap-2 rounded-none px-2 py-2 text-xs [&_svg:not([class*='size-'])]:size-4 group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuSub({ ...props }: ContextMenuPrimitive.SubmenuRoot.Props) {
  return (
    <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />
  )
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ContextMenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground gap-2 rounded-none px-2 py-2 text-xs [&_svg:not([class*='size-'])]:size-4 flex cursor-default items-center outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubmenuTrigger>
  )
}

function ContextMenuSubContent({
  ...props
}: React.ComponentProps<typeof ContextMenuContent>) {
  return (
    <ContextMenuContent
      data-slot="context-menu-sub-content"
      className="shadow-lg"
      side="right"
      {...props}
    />
  )
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: ContextMenuPrimitive.CheckboxItem.Props) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground gap-2 rounded-none py-2 pr-8 pl-2 text-xs [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute right-2 pointer-events-none">
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <CheckIcon
          />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioGroup({
  ...props
}: ContextMenuPrimitive.RadioGroup.Props) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  )
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: ContextMenuPrimitive.RadioItem.Props) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground gap-2 rounded-none py-2 pr-8 pl-2 text-xs [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 pointer-events-none">
        <ContextMenuPrimitive.RadioItemIndicator>
          <CheckIcon
          />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuPrimitive.Separator.Props) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn("text-muted-foreground group-focus/context-menu-item:text-accent-foreground ml-auto text-xs tracking-widest", className)}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
```

---

### `apps/web/src/components/ui/dialog.tsx`

```tsx
"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50", className)}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "bg-background data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 grid max-w-[calc(100%-2rem)] gap-4 rounded-none p-4 text-xs/relaxed ring-1 duration-100 sm:max-w-sm fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("gap-1 text-left flex flex-col", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground *:[a]:hover:text-foreground text-xs/relaxed *:[a]:underline *:[a]:underline-offset-3", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
```

---

### `apps/web/src/components/ui/drawer.tsx`

```tsx
"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-50", className)}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "bg-background flex h-auto flex-col text-xs/relaxed data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-none data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-none data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-none data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-none data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm group/drawer-content fixed z-50",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-1 w-[100px] shrink-0 rounded-none group-data-[vaul-drawer-direction=bottom]/drawer-content:block bg-muted mx-auto hidden shrink-0 group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-0.5 md:text-left flex flex-col", className)}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("gap-2 p-4 mt-auto flex flex-col", className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground text-sm font-medium", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-xs/relaxed", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
```

---

### `apps/web/src/components/ui/dropdown-menu.tsx`

```tsx
import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"
import { ChevronRightIcon, CheckIcon } from "lucide-react"

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-32 rounded-none shadow-md ring-1 duration-100 z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden", className )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("text-muted-foreground px-2 py-2 text-xs data-[inset]:pl-8", className)}
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive not-data-[variant=destructive]:focus:**:text-accent-foreground gap-2 rounded-none px-2 py-2 text-xs [&_svg:not([class*='size-'])]:size-4 group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground gap-2 rounded-none px-2 py-2 text-xs [&_svg:not([class*='size-'])]:size-4 flex cursor-default items-center outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -3,
  side = "right",
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-[96px] rounded-none shadow-lg ring-1 duration-100 w-auto", className)}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: MenuPrimitive.CheckboxItem.Props) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-2 rounded-none py-2 pr-8 pl-2 text-xs [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center pointer-events-none"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon
          />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: MenuPrimitive.RadioItem.Props) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-2 rounded-none py-2 pr-8 pl-2 text-xs [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center pointer-events-none"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon
          />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground ml-auto text-xs tracking-widest", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
```

---

### `apps/web/src/components/ui/empty.tsx`

```tsx
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "gap-4 rounded-none border-dashed p-6 flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "gap-2 flex max-w-sm flex-col items-center",
        className
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-none [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-xs/relaxed text-muted-foreground [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "gap-2.5 text-xs flex w-full max-w-sm min-w-0 flex-col items-center text-balance",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
```

---

### `apps/web/src/components/ui/field.tsx`

```tsx
"use client"

import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3 flex flex-col", className)}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn("mb-2.5 font-medium data-[variant=label]:text-xs data-[variant=legend]:text-sm", className)}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "gap-5 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4 group/field-group @container/field-group flex w-full flex-col",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva("data-[invalid=true]:text-destructive gap-2 group/field flex w-full", {
  variants: {
    orientation: {
      vertical:
        "flex-col [&>*]:w-full [&>.sr-only]:w-auto",
      horizontal:
        "flex-row items-center [&>[data-slot=field-label]]:flex-auto has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      responsive:
        "flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto @md/field-group:[&>[data-slot=field-label]]:flex-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "gap-0.5 group/field-content flex flex-1 flex-col leading-snug",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "has-data-checked:bg-primary/5 has-data-checked:border-primary dark:has-data-checked:bg-primary/10 gap-2 group-data-[disabled=true]/field:opacity-50 has-[>[data-slot=field]]:rounded-none has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-2 group/field-label peer/field-label flex w-fit leading-snug",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "gap-2 text-xs/relaxed group-data-[disabled=true]/field:opacity-50 flex w-fit items-center leading-snug",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-muted-foreground text-left text-xs/relaxed [[data-variant=legend]+&]:-mt-1.5 leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn("-my-2 h-5 text-xs group-data-[variant=outline]/field-group:-mb-2 relative", className)}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="text-muted-foreground px-2 bg-background relative mx-auto block w-fit"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-destructive text-xs font-normal", className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
```

---

### `apps/web/src/components/ui/hover-card.tsx`

```tsx
"use client"

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card"

import { cn } from "@/lib/utils"

function HoverCard({ ...props }: PreviewCardPrimitive.Root.Props) {
  return <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({ ...props }: PreviewCardPrimitive.Trigger.Props) {
  return (
    <PreviewCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

function HoverCardContent({
  className,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 4,
  ...props
}: PreviewCardPrimitive.Popup.Props &
  Pick<
    PreviewCardPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <PreviewCardPrimitive.Portal data-slot="hover-card-portal">
      <PreviewCardPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PreviewCardPrimitive.Popup
          data-slot="hover-card-content"
          className={cn(
            "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground w-64 rounded-none p-2.5 text-xs/relaxed shadow-md ring-1 duration-100 z-50 origin-(--transform-origin) outline-hidden",
            className
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
```

---

### `apps/web/src/components/ui/input-group.tsx`

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "border-input dark:bg-input/30 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-disabled:bg-input/50 dark:has-disabled:bg-input/80 h-8 rounded-none border transition-colors has-disabled:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:ring-1 has-[[data-slot][aria-invalid=true]]:ring-1 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5 [[data-slot=combobox-content]_&]:focus-within:border-inherit [[data-slot=combobox-content]_&]:focus-within:ring-0 group/input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto",
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "text-muted-foreground h-auto gap-2 py-1.5 text-xs font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-none [&>svg:not([class*='size-'])]:size-4 flex cursor-text items-center justify-center select-none",
  {
    variants: {
      align: {
        "inline-start": "pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem] order-first",
        "inline-end": "pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem] order-last",
        "block-start":
          "px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2 order-first w-full justify-start",
        "block-end":
          "px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2 order-last w-full justify-start",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "gap-2 text-xs shadow-none flex items-center",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-none px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "",
        "icon-xs": "size-6 rounded-none p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset"
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-muted-foreground gap-2 text-xs [&_svg:not([class*='size-'])]:size-4 flex items-center [&_svg]:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn("rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent flex-1", className)}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn("rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent flex-1 resize-none", className)}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
```

---

### `apps/web/src/components/ui/input-otp.tsx`

```tsx
import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"

import { cn } from "@/lib/utils"
import { MinusIcon } from "lucide-react"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp flex items-center has-disabled:opacity-50",
        containerClassName
      )}
      spellCheck={false}
      className={cn(
        "disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive rounded-none has-aria-invalid:ring-1 flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "dark:bg-input/30 border-input data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive size-8 border-y border-r text-xs transition-all outline-none first:rounded-none first:border-l last:rounded-none data-[active=true]:ring-1 relative flex items-center justify-center data-[active=true]:z-10",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000 bg-foreground h-4 w-px" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="[&_svg:not([class*='size-'])]:size-4 flex items-center"
      role="separator"
      {...props}
    >
      <MinusIcon
      />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
```

---

### `apps/web/src/components/ui/input.tsx`

```tsx
import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-8 rounded-none border bg-transparent px-2.5 py-1 text-xs transition-colors file:h-6 file:text-xs file:font-medium focus-visible:ring-1 aria-invalid:ring-1 md:text-xs file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
```

---

### `apps/web/src/components/ui/item.tsx`

```tsx
import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn(
        "gap-4 has-[[data-size=sm]]:gap-2.5 has-[[data-size=xs]]:gap-2 group/item-group flex w-full flex-col",
        className
      )}
      {...props}
    />
  )
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-2", className)}
      {...props}
    />
  )
}

const itemVariants = cva(
  "[a]:hover:bg-muted rounded-none border text-xs w-full group/item focus-visible:border-ring focus-visible:ring-ring/50 flex items-center flex-wrap outline-none transition-colors duration-100 focus-visible:ring-[3px] [a]:transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "border-border",
        muted: "bg-muted/50 border-transparent",
      },
      size: {
        default: "gap-2.5 px-3 py-2.5",
        sm: "gap-2.5 px-3 py-2.5",
        xs: "gap-2 px-2.5 py-2 [[data-slot=dropdown-menu-content]_&]:p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Item({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & VariantProps<typeof itemVariants>) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(itemVariants({ variant, size, className })),
      },
      props
    ),
    render,
    state: {
      slot: "item",
      variant,
      size,
    },
  })
}

const itemMediaVariants = cva(
  "gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "[&_svg:not([class*='size-'])]:size-4",
        image: "size-10 overflow-hidden rounded-none group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "gap-1 group-data-[size=xs]/item:gap-0 flex flex-1 flex-col [&+[data-slot=item-content]]:flex-none",
        className
      )}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "gap-2 text-xs font-medium underline-offset-4 line-clamp-1 flex w-fit items-center",
        className
      )}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "text-muted-foreground text-left text-xs/relaxed group-data-[size=xs]/item:text-xs/relaxed [&>a:hover]:text-primary line-clamp-2 font-normal [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("gap-2 flex items-center", className)}
      {...props}
    />
  )
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "gap-2 flex basis-full items-center justify-between",
        className
      )}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "gap-2 flex basis-full items-center justify-between",
        className
      )}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}
```

---

### `apps/web/src/components/ui/kbd.tsx`

```tsx
import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-muted text-muted-foreground [[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10 h-5 w-fit min-w-5 gap-1 rounded-none px-1 font-sans text-xs font-medium [&_svg:not([class*='size-'])]:size-3 pointer-events-none inline-flex items-center justify-center select-none",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("gap-1 inline-flex items-center", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
```

---

### `apps/web/src/components/ui/label.tsx`

```tsx
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "gap-2 text-xs leading-none group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50 flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

export { Label }
```

---

### `apps/web/src/components/ui/menubar.tsx`

```tsx
import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { Menubar as MenubarPrimitive } from "@base-ui/react/menubar"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckIcon } from "lucide-react"

function Menubar({ className, ...props }: MenubarPrimitive.Props) {
  return (
    <MenubarPrimitive
      data-slot="menubar"
      className={cn("bg-background h-8 gap-0.5 rounded-none border p-1 flex items-center", className)}
      {...props}
    />
  )
}

function MenubarMenu({ ...props }: React.ComponentProps<typeof DropdownMenu>) {
  return <DropdownMenu data-slot="menubar-menu" {...props} />
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuGroup>) {
  return <DropdownMenuGroup data-slot="menubar-group" {...props} />
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPortal>) {
  return <DropdownMenuPortal data-slot="menubar-portal" {...props} />
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return (
    <DropdownMenuTrigger
      data-slot="menubar-trigger"
      className={cn(
        "hover:bg-muted aria-expanded:bg-muted rounded-none px-1.5 py-[calc(--spacing(0.8))] text-xs font-medium flex items-center outline-hidden select-none",
        className
      )}
      {...props}
    />
  )
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="menubar-content"
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn("bg-popover text-popover-foreground data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 min-w-36 rounded-none shadow-md ring-1 duration-100", className)}
      {...props}
    />
  )
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn("focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive not-data-[variant=destructive]:focus:**:text-accent-foreground gap-2 rounded-none px-2 py-2 text-xs data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg:not([class*='size-'])]:size-4 group/menubar-item", className)}
      {...props}
    />
  )
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: MenuPrimitive.CheckboxItem.Props) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-2 rounded-none py-2 pr-2 pl-7 text-xs data-disabled:opacity-50 relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="left-1.5 size-4 [&_svg:not([class*='size-'])]:size-4 pointer-events-none absolute flex items-center justify-center">
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon
          />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuRadioGroup>) {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: MenuPrimitive.RadioItem.Props) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground gap-2 rounded-none py-2 pr-2 pl-7 text-xs data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <span className="left-1.5 size-4 [&_svg:not([class*='size-'])]:size-4 pointer-events-none absolute flex items-center justify-center">
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon
          />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuLabel>) {
  return (
    <DropdownMenuLabel
      data-slot="menubar-label"
      data-inset={inset}
      className={cn("px-2 py-2 text-xs data-[inset]:pl-8", className)}
      {...props}
    />
  )
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return (
    <DropdownMenuSeparator
      data-slot="menubar-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuShortcut>) {
  return (
    <DropdownMenuShortcut
      data-slot="menubar-shortcut"
      className={cn("text-muted-foreground group-focus/menubar-item:text-accent-foreground text-xs tracking-widest ml-auto", className)}
      {...props}
    />
  )
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuSub>) {
  return <DropdownMenuSub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuSubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn("focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground gap-2 rounded-none px-2 py-2 text-xs data-[inset]:pl-8 [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    />
  )
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubContent>) {
  return (
    <DropdownMenuSubContent
      data-slot="menubar-sub-content"
      className={cn("bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 min-w-32 rounded-none shadow-lg ring-1 duration-100", className)}
      {...props}
    />
  )
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
```

---

### `apps/web/src/components/ui/navigation-menu.tsx`

```tsx
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"

function NavigationMenu({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Root.Props) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn(
        "max-w-max group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      <NavigationMenuPositioner />
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: NavigationMenuPrimitive.List.Props) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "gap-0 group flex flex-1 list-none items-center justify-center",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: NavigationMenuPrimitive.Item.Props) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "bg-background hover:bg-muted focus:bg-muted data-open:hover:bg-muted data-open:focus:bg-muted data-open:bg-muted/50 focus-visible:ring-ring/50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted rounded-none px-2.5 py-1.5 text-xs font-medium transition-all focus-visible:ring-1 focus-visible:outline-1 disabled:opacity-50 group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center disabled:pointer-events-none outline-none"
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-open/navigation-menu-trigger:rotate-180 group-data-popup-open/navigation-menu-trigger:rotate-180" aria-hidden="true" />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-open:animate-in group-data-[viewport=false]/navigation-menu:data-closed:animate-out group-data-[viewport=false]/navigation-menu:data-closed:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-open:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-open:fade-in-0 group-data-[viewport=false]/navigation-menu:data-closed:fade-out-0 group-data-[viewport=false]/navigation-menu:ring-foreground/10 p-1 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[viewport=false]/navigation-menu:rounded-none group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:ring-1 group-data-[viewport=false]/navigation-menu:duration-300 h-full w-auto **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuPositioner({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  ...props
}: NavigationMenuPrimitive.Positioner.Props) {
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          "transition-[top,left,right,bottom] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0 isolate z-50 h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)] data-[instant]:transition-none",
          className
        )}
        {...props}
      >
        <NavigationMenuPrimitive.Popup className="bg-popover text-popover-foreground ring-foreground/10 rounded-none shadow ring-1 transition-all ease-[cubic-bezier(0.22,1,0.36,1)] outline-none data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[ending-style]:duration-150 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 xs:w-(--popup-width) relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin)">
          <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  )
}

function NavigationMenuLink({
  className,
  ...props
}: NavigationMenuPrimitive.Link.Props) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn("data-active:focus:bg-muted data-active:hover:bg-muted data-active:bg-muted/50 focus-visible:ring-ring/50 hover:bg-muted focus:bg-muted flex items-center gap-2 rounded-none p-2 text-xs transition-all outline-none focus-visible:ring-1 focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4 [[data-slot=navigation-menu-content]_&]:rounded-none", className)}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: NavigationMenuPrimitive.Icon.Props) {
  return (
    <NavigationMenuPrimitive.Icon
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="bg-border rounded-none shadow-md relative top-[60%] h-2 w-2 rotate-45" />
    </NavigationMenuPrimitive.Icon>
  )
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuPositioner,
}
```

---

### `apps/web/src/components/ui/pagination.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn(
        "mx-auto flex w-full justify-center",
        className
      )}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("gap-0.5 flex items-center", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
      nativeButton={false}
      render={
        <a
          aria-current={isActive ? "page" : undefined}
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        />
      }
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">
        Previous
      </span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4 flex items-center justify-center",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
```

---

### `apps/web/src/components/ui/popover.tsx`

```tsx
import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 flex flex-col gap-2.5 rounded-none p-2.5 text-xs shadow-md ring-1 duration-100 z-50 w-72 origin-(--transform-origin) outline-hidden",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-xs", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-muted-foreground text-xs/relaxed", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
```

---

### `apps/web/src/components/ui/progress.tsx`

```tsx
"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  children,
  value,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "bg-muted h-1 rounded-none relative flex w-full items-center overflow-x-hidden",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("bg-primary h-full transition-all", className)}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-xs", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn("text-muted-foreground ml-auto text-xs tabular-nums", className)}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
```

---

### `apps/web/src/components/ui/radio-group.tsx`

```tsx
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn } from "@/lib/utils"
import { CircleIcon } from "lucide-react"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid gap-2 w-full", className)}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 data-checked:bg-primary data-checked:border-primary flex size-4 rounded-full focus-visible:ring-1 aria-invalid:ring-1 group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="group-aria-invalid/radio-group-item:text-destructive flex size-4 items-center justify-center text-white"
      >
        <CircleIcon className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
```

---

### `apps/web/src/components/ui/resizable.tsx`

```tsx
"use client"

import * as React from "react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border h-6 w-1 rounded-none z-10 flex shrink-0" />
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
```

---

### `apps/web/src/components/ui/scroll-area.tsx`

```tsx
import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}: ScrollAreaPrimitive.Root.Props) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent flex touch-none p-px transition-colors select-none",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="rounded-none bg-border relative flex-1"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }
```

---

### `apps/web/src/components/ui/select.tsx`

```tsx
"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 gap-1.5 rounded-none border bg-transparent py-2 pr-2 pl-2.5 text-xs transition-colors select-none focus-visible:ring-1 aria-invalid:ring-1 data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-none *:data-[slot=select-value]:flex *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*='size-'])]:size-4 flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="text-muted-foreground size-4 pointer-events-none" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn("bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 min-w-36 rounded-none shadow-md ring-1 duration-100 relative isolate z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto", className )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-2 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground gap-2 rounded-none py-2 pr-8 pl-2 text-xs [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 gap-2 shrink-0 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={<span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />}
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border -mx-1 h-px pointer-events-none", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn("bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4 top-0 w-full", className)}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn("bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4 bottom-0 w-full", className)}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
```

---

### `apps/web/src/components/ui/separator.tsx`

```tsx
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
```

---

### `apps/web/src/components/ui/sheet.tsx`

```tsx
import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 text-xs/relaxed duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-50", className)}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn("bg-background data-open:animate-in data-closed:animate-out data-[side=right]:data-closed:slide-out-to-right-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=top]:data-closed:slide-out-to-top-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:fade-out-0 data-open:fade-in-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=bottom]:data-open:slide-in-from-bottom-10 fixed z-50 flex flex-col bg-clip-padding text-xs/relaxed shadow-lg transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm", className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("gap-0.5 p-4 flex flex-col", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("gap-2 p-4 mt-auto flex flex-col", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground text-sm font-medium", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-xs/relaxed", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```

---

### `apps/web/src/components/ui/sidebar.tsx`

```tsx
import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { PanelLeftIcon } from "lucide-react"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offExamples",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offExamples" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "transition-[width] duration-200 ease-linear relative w-(--sidebar-width) bg-transparent",
          "group-data-[collapsible=offExamples]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offExamples]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offExamples]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:ring-sidebar-border group-data-[variant=floating]:rounded-none group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 flex size-full flex-col"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon
      />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offExamples]:bg-sidebar group-data-[collapsible=offExamples]:translate-x-0 group-data-[collapsible=offExamples]:after:left-full",
        "[[data-side=left][data-collapsible=offExamples]_&]:-right-2",
        "[[data-side=right][data-collapsible=offExamples]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 relative flex w-full flex-1 flex-col",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("gap-2 p-2 flex flex-col", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("gap-2 p-2 flex flex-col", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "no-scrollbar gap-0 flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn(
        "p-2 relative flex w-full min-w-0 flex-col",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div"> & React.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "text-sidebar-foreground/70 ring-sidebar-ring h-8 rounded-none px-2 text-xs transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 flex shrink-0 items-center outline-hidden [&>svg]:shrink-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-group-label",
      sidebar: "group-label",
    },
  })
}

function SidebarGroupAction({
  className,
  render,
  ...props
}: useRender.ComponentProps<"button"> & React.ComponentProps<"button">) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 w-5 rounded-none p-0 focus-visible:ring-2 [&>svg]:size-4 flex aspect-square items-center justify-center outline-hidden transition-transform [&>svg]:shrink-0 after:absolute after:-inset-2 md:after:hidden group-data-[collapsible=icon]:hidden",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-group-action",
      sidebar: "group-action",
    },
  })
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("text-xs w-full", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("gap-0 flex w-full min-w-0 flex-col", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground gap-2 rounded-none p-2 text-left text-xs transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 data-active:font-medium peer/menu-button flex w-full items-center overflow-hidden outline-hidden group/menu-button disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-xs",
        sm: "h-7 text-xs",
        lg: "h-12 text-xs group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: useRender.ComponentProps<"button"> &
  React.ComponentProps<"button"> & {
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>) {
  const { isMobile, state } = useSidebar()
  const comp = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      },
      props
    ),
    render: !tooltip ? render : TooltipTrigger,
    state: {
      slot: "sidebar-menu-button",
      sidebar: "menu-button",
      size,
      active: isActive,
    },
  })

  if (!tooltip) {
    return comp
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      {comp}
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  render,
  showOnHover = false,
  ...props
}: useRender.ComponentProps<"button"> &
  React.ComponentProps<"button"> & {
    showOnHover?: boolean
  }) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 aspect-square w-5 rounded-none p-0 peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 focus-visible:ring-2 [&>svg]:size-4 flex items-center justify-center outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 md:after:hidden [&>svg]:shrink-0",
          showOnHover &&
            "peer-data-active/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-open:opacity-100 md:opacity-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-menu-action",
      sidebar: "menu-action",
    },
  })
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground peer-hover/menu-button:text-sidebar-accent-foreground peer-data-active/menu-button:text-sidebar-accent-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 rounded-none px-1 text-xs font-medium peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 flex items-center justify-center tabular-nums select-none group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const [width] = React.useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  })

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("h-8 gap-2 rounded-none px-2 flex items-center", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-none"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn("border-sidebar-border mx-3.5 translate-x-px gap-1 border-l px-2.5 py-0.5 group-data-[collapsible=icon]:hidden flex min-w-0 flex-col", className)}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  render,
  size = "md",
  isActive = false,
  className,
  ...props
}: useRender.ComponentProps<"a"> &
  React.ComponentProps<"a"> & {
    size?: "sm" | "md"
    isActive?: boolean
  }) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(
          "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground h-7 gap-2 rounded-none px-2 focus-visible:ring-2 data-[size=md]:text-xs data-[size=sm]:text-xs [&>svg]:size-4 flex min-w-0 -translate-x-px items-center overflow-hidden outline-hidden group-data-[collapsible=icon]:hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:shrink-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-menu-sub-button",
      sidebar: "menu-sub-button",
      size,
      active: isActive,
    },
  })
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
```

---

### `apps/web/src/components/ui/skeleton.tsx`

```tsx
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted rounded-none animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

---

### `apps/web/src/components/ui/slider.tsx`

```tsx
"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      className="data-horizontal:w-full data-vertical:h-full"
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control
        className={cn(
          "data-vertical:min-h-40 relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col",
          className
        )}
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="bg-muted rounded-none data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1 relative overflow-hidden select-none"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="border-ring ring-ring/50 relative size-3 rounded-none border bg-white transition-[color,box-shadow] after:absolute after:-inset-2 hover:ring-1 focus-visible:ring-1 focus-visible:outline-hidden active:ring-1 block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
```

---

### `apps/web/src/components/ui/sonner.tsx`

```tsx
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
```

---

### `apps/web/src/components/ui/spinner.tsx`

```tsx
import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
```

---

### `apps/web/src/components/ui/switch.tsx`

```tsx
"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "data-checked:bg-primary data-unchecked:bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:data-unchecked:bg-input/80 shrink-0 rounded-full border border-transparent focus-visible:ring-1 aria-invalid:ring-1 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground rounded-full group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 pointer-events-none block ring-0 transition-transform"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
```

---

### `apps/web/src/components/ui/table.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-xs", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", className)}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn("text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-xs", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
```

---

### `apps/web/src/components/ui/tabs.tsx`

```tsx
"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "gap-2 group/tabs flex data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "rounded-none p-[3px] group-data-horizontal/tabs:h-8 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "gap-1.5 rounded-none border border-transparent px-1.5 py-0.5 text-xs font-medium group-data-vertical/tabs:py-[calc(--spacing(1.25))] [&_svg:not([class*='size-'])]:size-4 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background dark:data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 data-active:text-foreground",
        "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("text-xs/relaxed flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
```

---

### `apps/web/src/components/ui/textarea.tsx`

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 rounded-none border bg-transparent px-2.5 py-2 text-xs transition-colors focus-visible:ring-1 aria-invalid:ring-1 md:text-xs placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
```

---

### `apps/web/src/components/ui/toggle-group.tsx`

```tsx
"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
  orientation: "horizontal",
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "rounded-none data-[size=sm]:rounded-none group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-none group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-none group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-none group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-none shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  )
}

export { ToggleGroup, ToggleGroupItem }
```

---

### `apps/web/src/components/ui/toggle.tsx`

```tsx
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "hover:text-foreground aria-pressed:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[state=on]:bg-muted gap-1 rounded-none text-xs font-medium transition-all [&_svg:not([class*='size-'])]:size-4 group/toggle hover:bg-muted inline-flex items-center justify-center whitespace-nowrap outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-input hover:bg-muted border bg-transparent",
      },
      size: {
        default: "h-8 min-w-8 px-2",
        sm: "h-7 min-w-7 rounded-none px-1.5",
        lg: "h-9 min-w-9 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
```

---

### `apps/web/src/components/ui/tooltip.tsx`

```tsx
"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delay = 0,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-none px-3 py-1.5 text-xs bg-foreground text-background z-50 w-fit max-w-xs origin-(--transform-origin)",
            className
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-none bg-foreground fill-foreground z-50 data-[side=bottom]:top-1 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

---

### `apps/web/src/features/admin/owner/owner-setup.tsx`

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useCreateOwner } from "./use-owner-info";

export const OwnerSetup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const createOwner = useCreateOwner();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createOwner.mutateAsync({
        name,
        email,
        password,
      });

      toast.success("Owner created successfully! You can now log in.");
      navigate({ to: "/login" });
    } catch (err: any) {
      toast.error(err.message || "Failed to create owner");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Initial Setup</CardTitle>
          <CardDescription>
            No owner found. Create the first administrator account to get
            started.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              type="submit"
              disabled={createOwner.isPending}
            >
              {createOwner.isPending ? "Creating..." : "Create Owner Account"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
```

---

### `apps/web/src/features/admin/owner/use-owner-info.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";

export const useOwnerInfo = () => {
    return useQuery({
        queryKey: ["owner-status"],
        queryFn: async () => {
            const { data, error } = await client.owner["setup-status"].get();
            if (error) {
                throw new Error((error.value as any)?.error || "Failed to check owner status");
            }
            return data;
        },
        refetchOnWindowFocus: false,
    });
};

export const useCreateOwner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (variables: any) => {
            const { data, error } = await client.owner.setup.post(variables);
            if (error) {
                throw new Error((error.value as any)?.error || "Failed to create owner");
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-status"] });
        },
    });
};
```

---

### `apps/web/src/features/auth/sign-in-form.tsx`

```tsx
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/client";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  const passwordForm = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("Sign in successful");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || ctx.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  const magicLinkForm = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      const { data, error } = await client.auth["magic-link"].login.post({
        email: value.email,
      });

      if (error) {
        // @ts-ignore
        const message = error.value?.message || "Failed to send magic link";
        toast.error(message);
        return;
      }

      toast.success("Magic link sent! Check your email.");
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Welcome Back</h1>

      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              passwordForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <passwordForm.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500 text-sm">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </passwordForm.Field>
            </div>

            <div>
              <passwordForm.Field name="password">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500 text-sm">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </passwordForm.Field>
            </div>

            <passwordForm.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting ? "Submitting..." : "Sign In"}
                </Button>
              )}
            </passwordForm.Subscribe>
          </form>
        </TabsContent>

        <TabsContent value="magic-link">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              magicLinkForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <magicLinkForm.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <Input
                      id="magic-email"
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500 text-sm">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </magicLinkForm.Field>
            </div>

            <magicLinkForm.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting ? "Sending..." : "Send Magic Link"}
                </Button>
              )}
            </magicLinkForm.Subscribe>
          </form>
        </TabsContent>
        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={onSwitchToSignUp}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Need an account? Sign Up
          </Button>
        </div>
      </Tabs>
    </div>
  );
}
```

---

### `apps/web/src/features/auth/sign-up-form.tsx`

```tsx
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/client";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();

  const passwordForm = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("Sign up successful");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        }
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  const magicLinkForm = useForm({
    defaultValues: {
      email: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      const { data, error } = await client.auth["magic-link"].signup.post({
        email: value.email,
        name: value.name,
      });

      if (error) {
        // @ts-ignore
        const message = error.value?.message || "Failed to send magic link";
        toast.error(message);
        return;
      }

      toast.success("Magic link sent! Check your email to confirm.");
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>

      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              passwordForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <passwordForm.Field name="name">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input
                      id="signup-name"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500 text-sm">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </passwordForm.Field>
            </div>

            <div>
              <passwordForm.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500 text-sm">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </passwordForm.Field>
            </div>

            <div>
              <passwordForm.Field name="password">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500 text-sm">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </passwordForm.Field>
            </div>

            <passwordForm.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting ? "Submitting..." : "Sign Up"}
                </Button>
              )}
            </passwordForm.Subscribe>
          </form>
        </TabsContent>

        <TabsContent value="magic-link">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              magicLinkForm.handleSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <magicLinkForm.Field name="name">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="magic-signup-name">Name</Label>
                    <Input
                      id="magic-signup-name"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500 text-sm">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </magicLinkForm.Field>
            </div>

            <div>
              <magicLinkForm.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="magic-signup-email">Email</Label>
                    <Input
                      id="magic-signup-email"
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p key={error?.message} className="text-red-500 text-sm">
                        {error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </magicLinkForm.Field>
            </div>

            <magicLinkForm.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!state.canSubmit || state.isSubmitting}
                >
                  {state.isSubmitting ? "Sending..." : "Send Magic Link"}
                </Button>
              )}
            </magicLinkForm.Subscribe>
          </form>
        </TabsContent>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={onSwitchToSignIn}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Already have an account? Sign In
          </Button>
        </div>
      </Tabs>
    </div>
  );
}
```

---

### `apps/web/src/features/landing/components/cta.tsx`

```tsx
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 container mx-auto px-4">
      <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center text-primary-foreground relative overflow-hidden shadow-2xl">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            Ready to ship your next big idea?
          </h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-12">
            Join 5,000+ developers building with TS Starter. Get started in
            seconds and focus on what matters most.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-10 h-14 text-lg font-bold w-full sm:w-auto transition-transform hover:scale-105"
            >
              Get Started for Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-10 h-14 text-lg font-bold border-primary-foreground/20 hover:bg-white/10 w-full sm:w-auto"
            >
              Sign up today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="mt-8 text-sm text-primary-foreground/60 italic">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
};
```

---

### `apps/web/src/features/landing/components/faq.tsx`

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What's included in the TS Starter?",
    answer:
      "It includes everything you need to launch a SaaS: Authentication (Better Auth), Database (Prisma), UI Components (Shadcn/UI), Styling (Tailwind 4), and much more.",
  },
  {
    question: "Is it easy to customize the design?",
    answer:
      "Yes! We use Tailwind CSS 4 and Shadcn/UI, making it extremely easy to customize every aspect of the design to match your brand.",
  },
  {
    question: "Can I use this for commercial projects?",
    answer:
      "Absolutely. The starter is designed precisely for that. You can use it to build any SaaS, landing page, or web application you want.",
  },
  {
    question: "Do you provide regular updates?",
    answer:
      "We keep all dependencies up to date and regularly add new features and components based on community feedback.",
  },
  {
    question: "What is the tech stack?",
    answer:
      "The stack includes Tanstack Start, React 19, Prisma, Better Auth, Tailwind 4, and Vite.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions about the TS Starter template.
          </p>
        </div>

        <Accordion className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="px-6 border border-border rounded-xl"
            >
              <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
```

---

### `apps/web/src/features/landing/components/features.tsx`

```tsx
import { Zap, Shield, Rocket, Layers, BarChart3, Users } from "lucide-react";

const features = [
  {
    title: "Lightning Fast",
    description:
      "Optimized for performance with Tanstack Start and optimized server-side rendering.",
    icon: <Zap className="h-6 w-6" />,
  },
  {
    title: "Secure by Default",
    description:
      "State-of-the-art authentication with Better Auth and type-safe database access.",
    icon: <Shield className="h-6 w-6" />,
  },
  {
    title: "Rapid Development",
    description:
      "Built-in components and pre-configured workflows to help you ship in days, not months.",
    icon: <Rocket className="h-6 w-6" />,
  },
  {
    title: "Modular Architecture",
    description:
      "Highly scalable folder structure that keeps your codebase clean and maintainable.",
    icon: <Layers className="h-6 w-6" />,
  },
  {
    title: "Analytics Included",
    description:
      "Integrated dashboard and analytics to monitor your SaaS growth from day one.",
    icon: <BarChart3 className="h-6 w-6" />,
  },
  {
    title: "Multi-tenant Ready",
    description: "Built-in support for teams and organizations out of the box.",
    icon: <Users className="h-6 w-6" />,
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Everything you need to launch
          </h2>
          <p className="text-muted-foreground text-lg">
            Stop wasting time on boilerplate. Focus on your unique product
            features while we handle the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

### `apps/web/src/features/landing/components/footer.tsx`

```tsx
import { Link } from "@tanstack/react-router";
import { Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link
              to="/"
              className="text-2xl font-bold tracking-tight mb-6 inline-block"
            >
              TS<span className="text-primary text-blue-600">Starter</span>
            </Link>
            <p className="text-muted-foreground mt-4 max-w-xs">
              The ultimate SaaS boilerplate for TypeScript developers. Build
              faster, scale better, and ship with confidence.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <a
                href="#"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-muted-foreground text-sm">
              <li>
                <a
                  href="#features"
                  className="hover:text-primary transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-primary transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  API Reference
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-muted-foreground text-sm">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Subscribe to our newsletter</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Get the latest updates and resources delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="bg-muted border border-border rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TS Starter. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
```

---

### `apps/web/src/features/landing/components/hero.tsx`

```tsx
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Next Generation SaaS Starter
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 leading-tight">
          Build and Scale Your <br />
          SaaS Faster Than Ever
        </h1>

        <p className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
          The ultimate TypeScript-first boilerplate with Authentication,
          Database, Payments, and UI components ready to go. Skip the setup and
          ship today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
          <Button
            size="lg"
            className="rounded-full px-8 h-12 text-base font-semibold"
          >
            Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8 h-12 text-base font-semibold"
          >
            Live Demo
          </Button>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Tanstack Start + Router</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Better Auth & Prisma</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Shadcn UI & Tailwind 4</span>
          </div>
        </div>

        <div className="mt-20 relative max-w-5xl mx-auto border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-1000 delay-300">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 opacity-20" />
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3"
            alt="Dashboard Preview"
            className="w-full h-auto grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </div>
    </section>
  );
};
```

---

### `apps/web/src/features/landing/components/landing-nav.tsx`

```tsx
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import UserMenu from "@/components/core/user-menu";

export const LandingNav = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="h-13">
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b h-13 pt-2 bg-background/80 backdrop-blur"
        )}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold tracking-tight">
              TS<span className="text-primary text-blue-600">Starter</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a
                href="#features"
                className="hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="hover:text-primary transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="hover:text-primary transition-colors"
              >
                Testimonials
              </a>
              <a href="#faq" className="hover:text-primary transition-colors">
                FAQ
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="size-6" />
              ) : (
                <Moon className="size-6" />
              )}
            </Button>
            <UserMenu />
          </div>
        </div>
      </header>
    </div>
  );
};
```

---

### `apps/web/src/features/landing/components/pricing.tsx`

```tsx
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for hobby projects and small side businesses.",
    features: [
      "Up to 5 projects",
      "Basic analytics",
      "Community support",
      "1GB Storage",
    ],
    cta: "Start for free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    description: "Everything you need to grow your business and scale.",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority email support",
      "20GB Storage",
      "Custom domains",
    ],
    cta: "Get Started Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Advanced features for large organizations and teams.",
    features: [
      "SLA guarantees",
      "Dedicated account manager",
      "Custom integrations",
      "Unlimited storage",
      "Advanced security",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose the plan that's right for you. No hidden fees, ever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative flex flex-col p-8 rounded-3xl border transition-all duration-300",
                plan.popular
                  ? "bg-card border-primary shadow-xl scale-105 z-10"
                  : "bg-background border-border hover:border-primary/50"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className="text-muted-foreground font-medium">
                      /month
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={plan.popular ? "default" : "outline"}
                className="w-full rounded-full h-12 text-base font-bold transition-all duration-300"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

### `apps/web/src/features/landing/components/testimonials.tsx`

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    content:
      "This starter kit saved me weeks of work. The integration between Better Auth and Prisma is seamless.",
    author: "Alex Rivera",
    role: "Founder at TechFlow",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    content:
      "The best TypeScript boilerplate I've ever used. Clean, scalable, and extremely well-documented.",
    author: "Sarah Chen",
    role: "Senior Engineering Manager",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    content:
      "Building on top of Tanstack Start is a game changer. The dev experience is top-notch.",
    author: "James Wilson",
    role: "Independent Indie Hacker",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100",
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Loved by developers
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of developers who are building their SaaS faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-card border border-border relative"
            >
              <div className="text-4xl text-primary/20 absolute top-4 left-6 italic font-serif">
                "
              </div>
              <p className="text-lg mb-8 relative z-10 italic text-foreground/80 leading-relaxed">
                {testimonial.content}
              </p>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage
                    src={testimonial.avatar}
                    alt={testimonial.author}
                  />
                  <AvatarFallback>{testimonial.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold">{testimonial.author}</h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

### `apps/web/src/features/landing/home.tsx`

```tsx
import { Hero } from "./components/hero";
import { Features } from "./components/features";
import { Pricing } from "./components/pricing";
import { Testimonials } from "./components/testimonials";
import { FAQ } from "./components/faq";
import { CTA } from "./components/cta";
import { Footer } from "./components/footer";
import { LandingNav } from "./components/landing-nav";

export const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <LandingNav />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};
```

---

### `apps/web/src/features/payment/lib/get-payment.ts`

```typescript
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { authClient } from "@/lib/auth-client";
import { authMiddleware } from "@/middleware/auth";

export const getPayment = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const { data: customerState } = await authClient.customer.state({
      fetchOptions: {
        headers: getRequestHeaders(),
      },
    });
    return customerState;
  });
```

---

### `apps/web/src/features/user/lib/get-user.ts`

```typescript
import { createServerFn } from "@tanstack/react-start";

import { authMiddleware } from "@/middleware/auth";

export const getUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.session;
  });
```

---

### `apps/web/src/index.css`

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.58 0.22 27);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.809 0.105 251.813);
  --chart-2: oklch(0.623 0.214 259.815);
  --chart-3: oklch(0.546 0.245 262.881);
  --chart-4: oklch(0.488 0.243 264.376);
  --chart-5: oklch(0.424 0.199 265.638);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.87 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.371 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.809 0.105 251.813);
  --chart-2: oklch(0.623 0.214 259.815);
  --chart-3: oklch(0.546 0.245 262.881);
  --chart-4: oklch(0.488 0.243 264.376);
  --chart-5: oklch(0.424 0.199 265.638);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@theme inline {
  --font-sans: "Inter Variable", sans-serif;
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-foreground: var(--foreground);
  --color-background: var(--background);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply font-sans bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}
```

---

### `apps/web/src/layouts/root.tsx`

```tsx
import { Outlet } from "@tanstack/react-router";

export const RootLayout = () => {
  return (
    <>
      <Outlet />
    </>
  );
};
```

---

### `apps/web/src/lib/auth-client.ts`

```typescript
import { polarClient } from "@polar-sh/better-auth";
import { magicLinkClient } from "better-auth/client/plugins";
import { env } from "@env/web";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [
    magicLinkClient(),
    ...(env.VITE_ENABLE_POLAR ? [polarClient()] : [])
  ],
});
```

---

### `apps/web/src/lib/client.ts`

```typescript
import { treaty } from '@elysiajs/eden'
import type { App } from '../../../server'
import { env } from '@env/web'

export const client = treaty<App>(env.VITE_SERVER_URL, {
  fetch: {
    credentials: 'include'
  }
})
```

---

### `apps/web/src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

### `apps/web/src/middleware/auth.ts`

```typescript
import { createMiddleware } from "@tanstack/react-start";

import { authClient } from "@/lib/auth-client";

export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: request.headers,
      throw: true,
    },
  });
  return next({
    context: { session },
  });
});
```

---

### `apps/web/src/middleware/setup-owner.ts`

```typescript
import { createMiddleware } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";

import { client } from "@/lib/client";

export const authMiddleware = createMiddleware().server(async ({ next, request }) => {
    const { data } = await client.owner["setup-status"].get();
    if (!data) {
        return redirect({
            to: "/",
        });
    }

    console.log("[Server] Checking setup-status. hasOwner:", data?.hasOwner);
    if (request.url.includes("/setup") && data && !data.hasOwner) {
        return next();
    }
    return redirect({
        to: "/setup",
    });
});

```

---

### `apps/web/src/providers/tanstack-router.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function TanstackQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

---

### `apps/web/src/providers/theme-provider.tsx`

```tsx
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

---

### `apps/web/src/routeTree.gen.ts`

```typescript
/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as SetupRouteImport } from './routes/setup'
import { Route as PublicIndexRouteImport } from './routes/_public/index'
import { Route as PaymentSuccessRouteImport } from './routes/payment/success'
import { Route as ProtectedDashboardRouteImport } from './routes/_protected/dashboard'
import { Route as AuthLoginRouteImport } from './routes/_auth/login'

const SetupRoute = SetupRouteImport.update({
  id: '/setup',
  path: '/setup',
  getParentRoute: () => rootRouteImport,
} as any)
const PublicIndexRoute = PublicIndexRouteImport.update({
  id: '/_public/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const PaymentSuccessRoute = PaymentSuccessRouteImport.update({
  id: '/payment/success',
  path: '/payment/success',
  getParentRoute: () => rootRouteImport,
} as any)
const ProtectedDashboardRoute = ProtectedDashboardRouteImport.update({
  id: '/_protected/dashboard',
  path: '/dashboard',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthLoginRoute = AuthLoginRouteImport.update({
  id: '/_auth/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/setup': typeof SetupRoute
  '/login': typeof AuthLoginRoute
  '/dashboard': typeof ProtectedDashboardRoute
  '/payment/success': typeof PaymentSuccessRoute
  '/': typeof PublicIndexRoute
}
export interface FileRoutesByTo {
  '/setup': typeof SetupRoute
  '/login': typeof AuthLoginRoute
  '/dashboard': typeof ProtectedDashboardRoute
  '/payment/success': typeof PaymentSuccessRoute
  '/': typeof PublicIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/setup': typeof SetupRoute
  '/_auth/login': typeof AuthLoginRoute
  '/_protected/dashboard': typeof ProtectedDashboardRoute
  '/payment/success': typeof PaymentSuccessRoute
  '/_public/': typeof PublicIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/setup' | '/login' | '/dashboard' | '/payment/success' | '/'
  fileRoutesByTo: FileRoutesByTo
  to: '/setup' | '/login' | '/dashboard' | '/payment/success' | '/'
  id:
    | '__root__'
    | '/setup'
    | '/_auth/login'
    | '/_protected/dashboard'
    | '/payment/success'
    | '/_public/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  SetupRoute: typeof SetupRoute
  AuthLoginRoute: typeof AuthLoginRoute
  ProtectedDashboardRoute: typeof ProtectedDashboardRoute
  PaymentSuccessRoute: typeof PaymentSuccessRoute
  PublicIndexRoute: typeof PublicIndexRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/setup': {
      id: '/setup'
      path: '/setup'
      fullPath: '/setup'
      preLoaderRoute: typeof SetupRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_public/': {
      id: '/_public/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof PublicIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/payment/success': {
      id: '/payment/success'
      path: '/payment/success'
      fullPath: '/payment/success'
      preLoaderRoute: typeof PaymentSuccessRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_protected/dashboard': {
      id: '/_protected/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof ProtectedDashboardRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_auth/login': {
      id: '/_auth/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof AuthLoginRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  SetupRoute: SetupRoute,
  AuthLoginRoute: AuthLoginRoute,
  ProtectedDashboardRoute: ProtectedDashboardRoute,
  PaymentSuccessRoute: PaymentSuccessRoute,
  PublicIndexRoute: PublicIndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { createStart } from '@tanstack/react-start'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
  }
}
```

---

### `apps/web/src/router.tsx`

```tsx
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import Loader from "./components/loader";
import "./index.css";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: {},
    defaultPendingComponent: () => <Loader />,
    defaultNotFoundComponent: () => <div>Not Found</div>,
    Wrap: ({ children }) => <>{children}</>,
  });
  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
```

---

### `apps/web/src/routes/__root.tsx`

```tsx
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";
import Header from "../components/header";
import appCss from "../index.css?url";
import { TanstackQueryProvider } from "@/providers/tanstack-router";
import { ThemeProvider } from "@/providers/theme-provider";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Saas Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TanstackQueryProvider>
            <Outlet />
          </TanstackQueryProvider>
          <Toaster richColors />
          <TanStackRouterDevtools position="bottom-left" />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
```

---

### `apps/web/src/routes/_auth/login.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import SignInForm from "@/features/auth/sign-in-form";
import SignUpForm from "@/features/auth/sign-up-form";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false);

  return showSignIn ? (
    <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
  ) : (
    <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
  );
}
```

---

### `apps/web/src/routes/_protected/dashboard.tsx`

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { getPayment } from "@/features/payment/lib/get-payment";
import { getUser } from "@/features/user/lib/get-user";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_protected/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    const customerState = await getPayment();
    return { session, customerState };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function RouteComponent() {
  const { session, customerState } = Route.useRouteContext();

  const hasProSubscription =
    (customerState?.activeSubscriptions?.length ?? 0) > 0;
  // For debugging: console.log("Active subscriptions:", customerState?.activeSubscriptions);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session?.user.name}</p>
      <p>Plan: {hasProSubscription ? "Pro" : "Free"}</p>
      {hasProSubscription ? (
        <Button
          onClick={async function handlePortal() {
            await authClient.customer.portal();
          }}
        >
          Manage Subscription
        </Button>
      ) : (
        <Button
          onClick={async function handleUpgrade() {
            await authClient.checkout({ slug: "pro" });
          }}
        >
          Upgrade to Pro
        </Button>
      )}
    </div>
  );
}
```

---

### `apps/web/src/routes/_public/index.tsx`

```tsx
import { Home } from "@/features/landing/home";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <>
      <Home />
    </>
  );
}
```

---

### `apps/web/src/routes/payment/success.tsx`

```tsx
import { createFileRoute, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/payment/success")({
  component: SuccessPage,
  validateSearch: (search) => ({
    checkout_id: search.checkout_id as string,
  }),
});

function SuccessPage() {
  const { checkout_id } = useSearch({ from: "/success" });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Payment Successful!</h1>
      {checkout_id && <p>Checkout ID: {checkout_id}</p>}
    </div>
  );
}
```

---

### `apps/web/src/routes/setup.tsx`

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { OwnerSetup } from "@/features/admin/owner/owner-setup";
import { client } from "@/lib/client";

export const Route = createFileRoute("/setup")({
  beforeLoad: async () => {
    const { data } = await client.owner["setup-status"].get();
    // If owner already exists, don't allow access to setup page
    if (!data || data?.hasOwner) {
      throw redirect({ to: "/" });
    }
  },
  component: SetupPage,
});

function SetupPage() {
  return (
    <div className="min-h-screen bg-background">
      <OwnerSetup />
    </div>
  );
}
```

---

### `apps/web/tsconfig.json`

```json
{
  "extends": "../../packages/config/tsconfig.base.json",
  "include": ["**/*.ts", "**/*.tsx"],
  "compilerOptions": {
    "target": "ES2022",
    "jsx": "react-jsx",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,

    /* Linting */
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@db": ["../../packages/db/src"],
      "@auth": ["../../packages/auth/src"],
      "@env/*": ["../../packages/env/src/*"]
    }
  }
}
```

---

### `apps/web/vite.config.ts`

```typescript
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), tailwindcss(), tanstackStart(), viteReact()],
  server: {
    port: 3001,
  },
});
```

---

### `bts.jsonc`

```
// Better-T-Stack configuration file
// safe to delete

{
  "$schema": "https://r2.better-t-stack.dev/schema.json",
  "version": "3.13.2",
  "createdAt": "2026-01-02T17:33:50.671Z",
  "database": "postgres",
  "orm": "prisma",
  "backend": "elysia",
  "runtime": "bun",
  "frontend": [
    "tanstack-start"
  ],
  "addons": [
    "turborepo"
  ],
  "examples": [],
  "auth": "better-auth",
  "payments": "polar",
  "packageManager": "bun",
  "dbSetup": "none",
  "api": "none",
  "webDeploy": "none",
  "serverDeploy": "none"
}
```

---


### `bunfig.toml`

```
[install]
linker = "isolated"
```

---

### `package.json`

```json
{
  "name": "ts-starter",
  "author": {
    "name": "Khalid",
    "email": "khalidcode03@gmail.com",
    "url": "https://github.com/khalids01"
  },
  "private": true,
  "workspaces": {
    "packages": [
      "apps/*",
      "packages/*"
    ],
    "catalog": {
      "dotenv": "^17.2.2",
      "zod": "^4.1.13",
      "typescript": "^5",
      "@types/bun": "^1.3.4",
      "better-auth": "^1.4.9",
      "@prisma/client": "^7.1.0",
      "@polar-sh/better-auth": "^1.1.3"
    }
  },
  "type": "module",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "check-types": "turbo check-types",
    "dev:native": "turbo -F native dev",
    "dev:web": "turbo -F web dev",
    "dev:server": "turbo -F server dev",
    "db:push": "turbo -F @db db:push",
    "db:studio": "turbo -F @db db:studio",
    "db:generate": "turbo -F @db db:generate",
    "db:migrate": "turbo -F @db db:migrate"
  },
  "dependencies": {
    "@t3-oss/env-core": "^0.13.10",
    "@env": "workspace:*",
    "axios": "^1.13.2",
    "dotenv": "catalog:",
    "zod": "catalog:"
  },
  "devDependencies": {
    "turbo": "^2.6.3",
    "typescript": "catalog:",
    "@types/bun": "catalog:",
    "@config": "workspace:*"
  },
  "packageManager": "bun@1.3.3"
}
```

---

### `packages/auth/.gitignore`

```
# dependencies (bun install)
node_modules

# output
out
dist
*.tgz

# code coverage
coverage
*.lcov

# logs
logs
_.log
report.[0-9]_.[0-9]_.[0-9]_.[0-9]_.json

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# caches
.eslintcache
.cache
*.tsbuildinfo

# IntelliJ based IDEs
.idea

# Finder (MacOS) folder config
.DS_Store
```

---

### `packages/auth/package.json`

```json
{
  "name": "@auth",
  "type": "module",
  "exports": {
    ".": {
      "default": "./src/index.ts"
    },
    "./*": {
      "default": "./src/*.ts"
    }
  },
  "scripts": {},
  "devDependencies": {
    "typescript": "catalog:",
    "@config": "workspace:*"
  },
  "dependencies": {
    "better-auth": "catalog:",
    "@polar-sh/better-auth": "catalog:",
    "@polar-sh/sdk": "^0.34.16",
    "dotenv": "catalog:",
    "zod": "catalog:",
    "@env": "workspace:*",
    "@db": "workspace:*"
  }
}
```

---

### `packages/auth/src/index.ts`

```typescript
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { magicLink } from "better-auth/plugins";
import prisma from "@db";
import { env } from "@env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { polarClient } from "./lib/payments";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        output: true,
      },
      banned: {
        type: "boolean",
        input: false,
        output: true,
      },
      banReason: {
        type: "string",
        input: false,
        output: true,
      },
      archived: {
        type: "boolean",
        input: false,
        output: true,
      },
    }
  },
  plugins: [
    ...(env.ENABLE_POLAR
      ? [
        polar({
          client: polarClient,
          createCustomerOnSignUp: true,
          enableCustomerPortal: true,
          use: [
            checkout({
              products: [
                {
                  productId: "your-product-id",
                  slug: "pro",
                },
              ],
              successUrl: env.POLAR_SUCCESS_URL!,
              authenticatedUsersOnly: true,
            }),
            portal(),
          ],
        }),
      ]
      : []),
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        // TODO: Implement email sending integration (e.g. Resend, SendGrid)
        console.log(`\n\n[Magic Link] Send to ${email}\nLink: ${url}\n\n`);
      },
    }),
  ],
});
```

---

### `packages/auth/src/lib/payments.ts`

```typescript
import { Polar } from "@polar-sh/sdk";
import { env } from "@env/server";

export const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN || "",
  server: "sandbox",
});
```

---

### `packages/auth/tsconfig.json`

```json
{
  "extends": "../config/tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@db": ["../db/src"],
      "@env/*": ["../env/src/*"],
      "@config": ["../config/src/config.ts"]
    }
  }
}
```

---

### `packages/config/package.json`

```json
{
  "name": "@config",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/config.ts",
    "./tsconfig.base.json": "./tsconfig.base.json"
  }
}
```

---

### `packages/config/src/config.ts`

```typescript
export const siteConfig = {
    name: "Antigravity SaaS",
    description: "Modern SaaS Starter with Elysia, Tanstack start and Better Auth",
    url: "https://example.com",
};
```

---

### `packages/config/tsconfig.base.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "verbatimModuleSyntax": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["bun"]
  }
}
```

---

### `packages/db/.gitignore`

```
# dependencies (bun install)
node_modules

# output
out
dist
*.tgz
/prisma/generated

# code coverage
coverage
*.lcov

# logs
logs
_.log
report.[0-9]_.[0-9]_.[0-9]_.[0-9]_.json

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# caches
.eslintcache
.cache
*.tsbuildinfo

# IntelliJ based IDEs
.idea

# Finder (MacOS) folder config
.DS_Store
```

---

### `packages/db/package.json`

```json
{
  "name": "@db",
  "type": "module",
  "exports": {
    ".": {
      "default": "./src/index.ts"
    },
    "./*": {
      "default": "./src/*.ts"
    }
  },
  "scripts": {
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "devDependencies": {
    "prisma": "^7.1.0",
    "@types/pg": "^8.15.6",
    "typescript": "catalog:",
    "@config": "workspace:*"
  },
  "dependencies": {
    "@prisma/client": "catalog:",
    "@prisma/adapter-pg": "^7.1.0",
    "pg": "^8.16.3",
    "dotenv": "catalog:",
    "zod": "catalog:",
    "@env": "workspace:*"
  }
}
```

---

### `packages/db/prisma/generated/browser.ts`

```typescript

/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * This file should be your main import to use Prisma-related types and utilities in a browser. 
 * Use it to get access to models, enums, and input types.
 * 
 * This file does not contain a `PrismaClient` class, nor several other helpers that are intended as server-side only.
 * See `client.ts` for the standard, server-side entry point.
 *
 * 🟢 You can import this file directly.
 */

import * as Prisma from './internal/prismaNamespaceBrowser'
export { Prisma }
export * as $Enums from './enums'
export * from './enums';
/**
 * Model User
 * 
 */
export type User = Prisma.UserModel
/**
 * Model Invitation
 * 
 */
export type Invitation = Prisma.InvitationModel
/**
 * Model Session
 * 
 */
export type Session = Prisma.SessionModel
/**
 * Model Account
 * 
 */
export type Account = Prisma.AccountModel
/**
 * Model Verification
 * 
 */
export type Verification = Prisma.VerificationModel
```

---

### `packages/db/prisma/generated/client.ts`

```typescript

/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * This file should be your main import to use Prisma. Through it you get access to all the models, enums, and input types.
 * If you're looking for something you can import in the client-side of your application, please refer to the `browser.ts` file instead.
 *
 * 🟢 You can import this file directly.
 */

import * as process from 'node:process'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
globalThis['__dirname'] = path.dirname(fileURLToPath(import.meta.url))

import * as runtime from "@prisma/client/runtime/client"
import * as $Enums from "./enums"
import * as $Class from "./internal/class"
import * as Prisma from "./internal/prismaNamespace"

export * as $Enums from './enums'
export * from "./enums"
/**
 * ## Prisma Client
 * 
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 * 
 * Read more in our [docs](https://pris.ly/d/client).
 */
export const PrismaClient = $Class.getPrismaClientClass()
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>
export { Prisma }

/**
 * Model User
 * 
 */
export type User = Prisma.UserModel
/**
 * Model Invitation
 * 
 */
export type Invitation = Prisma.InvitationModel
/**
 * Model Session
 * 
 */
export type Session = Prisma.SessionModel
/**
 * Model Account
 * 
 */
export type Account = Prisma.AccountModel
/**
 * Model Verification
 * 
 */
export type Verification = Prisma.VerificationModel
```

---

### `packages/db/prisma/generated/commonInputTypes.ts`

```typescript

/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * This file exports various common sort, input & filter types that are not directly linked to a particular model.
 *
 * 🟢 You can import this file directly.
 */

import type * as runtime from "@prisma/client/runtime/client"
import * as $Enums from "./enums"
import type * as Prisma from "./internal/prismaNamespace"


export type StringFilter<$PrismaModel = never> = {
  equals?: string | Prisma.StringFieldRefInput<$PrismaModel>
  in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>
  notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>
  lt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  lte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  contains?: string | Prisma.StringFieldRefInput<$PrismaModel>
  startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  mode?: Prisma.QueryMode
  not?: Prisma.NestedStringFilter<$PrismaModel> | string
}

export type BoolFilter<$PrismaModel = never> = {
  equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>
  not?: Prisma.NestedBoolFilter<$PrismaModel> | boolean
}

export type StringNullableFilter<$PrismaModel = never> = {
  equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null
  in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null
  notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null
  lt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  lte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  contains?: string | Prisma.StringFieldRefInput<$PrismaModel>
  startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  mode?: Prisma.QueryMode
  not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null
}

export type DateTimeFilter<$PrismaModel = never> = {
  equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>
  notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>
  lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string
}

export type EnumRoleFilter<$PrismaModel = never> = {
  equals?: $Enums.Role | Prisma.EnumRoleFieldRefInput<$PrismaModel>
  in?: $Enums.Role[] | Prisma.ListEnumRoleFieldRefInput<$PrismaModel>
  notIn?: $Enums.Role[] | Prisma.ListEnumRoleFieldRefInput<$PrismaModel>
  not?: Prisma.NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
}

export type SortOrderInput = {
  sort: Prisma.SortOrder
  nulls?: Prisma.NullsOrder
}

export type StringWithAggregatesFilter<$PrismaModel = never> = {
  equals?: string | Prisma.StringFieldRefInput<$PrismaModel>
  in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>
  notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>
  lt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  lte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  contains?: string | Prisma.StringFieldRefInput<$PrismaModel>
  startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  mode?: Prisma.QueryMode
  not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string
  _count?: Prisma.NestedIntFilter<$PrismaModel>
  _min?: Prisma.NestedStringFilter<$PrismaModel>
  _max?: Prisma.NestedStringFilter<$PrismaModel>
}

export type BoolWithAggregatesFilter<$PrismaModel = never> = {
  equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>
  not?: Prisma.NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
  _count?: Prisma.NestedIntFilter<$PrismaModel>
  _min?: Prisma.NestedBoolFilter<$PrismaModel>
  _max?: Prisma.NestedBoolFilter<$PrismaModel>
}

export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
  equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null
  in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null
  notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null
  lt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  lte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  contains?: string | Prisma.StringFieldRefInput<$PrismaModel>
  startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  mode?: Prisma.QueryMode
  not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
  _count?: Prisma.NestedIntNullableFilter<$PrismaModel>
  _min?: Prisma.NestedStringNullableFilter<$PrismaModel>
  _max?: Prisma.NestedStringNullableFilter<$PrismaModel>
}

export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
  equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>
  notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>
  lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
  _count?: Prisma.NestedIntFilter<$PrismaModel>
  _min?: Prisma.NestedDateTimeFilter<$PrismaModel>
  _max?: Prisma.NestedDateTimeFilter<$PrismaModel>
}

export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
  equals?: $Enums.Role | Prisma.EnumRoleFieldRefInput<$PrismaModel>
  in?: $Enums.Role[] | Prisma.ListEnumRoleFieldRefInput<$PrismaModel>
  notIn?: $Enums.Role[] | Prisma.ListEnumRoleFieldRefInput<$PrismaModel>
  not?: Prisma.NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
  _count?: Prisma.NestedIntFilter<$PrismaModel>
  _min?: Prisma.NestedEnumRoleFilter<$PrismaModel>
  _max?: Prisma.NestedEnumRoleFilter<$PrismaModel>
}

export type DateTimeNullableFilter<$PrismaModel = never> = {
  equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null
  in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null
  notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null
  lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  not?: Prisma.NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
}

export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
  equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null
  in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null
  notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null
  lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  not?: Prisma.NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
  _count?: Prisma.NestedIntNullableFilter<$PrismaModel>
  _min?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>
  _max?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>
}

export type NestedStringFilter<$PrismaModel = never> = {
  equals?: string | Prisma.StringFieldRefInput<$PrismaModel>
  in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>
  notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>
  lt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  lte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  contains?: string | Prisma.StringFieldRefInput<$PrismaModel>
  startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  not?: Prisma.NestedStringFilter<$PrismaModel> | string
}

export type NestedBoolFilter<$PrismaModel = never> = {
  equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>
  not?: Prisma.NestedBoolFilter<$PrismaModel> | boolean
}

export type NestedStringNullableFilter<$PrismaModel = never> = {
  equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null
  in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null
  notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null
  lt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  lte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  contains?: string | Prisma.StringFieldRefInput<$PrismaModel>
  startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  not?: Prisma.NestedStringNullableFilter<$PrismaModel> | string | null
}

export type NestedDateTimeFilter<$PrismaModel = never> = {
  equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>
  notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>
  lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  not?: Prisma.NestedDateTimeFilter<$PrismaModel> | Date | string
}

export type NestedEnumRoleFilter<$PrismaModel = never> = {
  equals?: $Enums.Role | Prisma.EnumRoleFieldRefInput<$PrismaModel>
  in?: $Enums.Role[] | Prisma.ListEnumRoleFieldRefInput<$PrismaModel>
  notIn?: $Enums.Role[] | Prisma.ListEnumRoleFieldRefInput<$PrismaModel>
  not?: Prisma.NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
}

export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
  equals?: string | Prisma.StringFieldRefInput<$PrismaModel>
  in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>
  notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>
  lt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  lte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  contains?: string | Prisma.StringFieldRefInput<$PrismaModel>
  startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  not?: Prisma.NestedStringWithAggregatesFilter<$PrismaModel> | string
  _count?: Prisma.NestedIntFilter<$PrismaModel>
  _min?: Prisma.NestedStringFilter<$PrismaModel>
  _max?: Prisma.NestedStringFilter<$PrismaModel>
}

export type NestedIntFilter<$PrismaModel = never> = {
  equals?: number | Prisma.IntFieldRefInput<$PrismaModel>
  in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>
  notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel>
  lt?: number | Prisma.IntFieldRefInput<$PrismaModel>
  lte?: number | Prisma.IntFieldRefInput<$PrismaModel>
  gt?: number | Prisma.IntFieldRefInput<$PrismaModel>
  gte?: number | Prisma.IntFieldRefInput<$PrismaModel>
  not?: Prisma.NestedIntFilter<$PrismaModel> | number
}

export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
  equals?: boolean | Prisma.BooleanFieldRefInput<$PrismaModel>
  not?: Prisma.NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
  _count?: Prisma.NestedIntFilter<$PrismaModel>
  _min?: Prisma.NestedBoolFilter<$PrismaModel>
  _max?: Prisma.NestedBoolFilter<$PrismaModel>
}

export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
  equals?: string | Prisma.StringFieldRefInput<$PrismaModel> | null
  in?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null
  notIn?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null
  lt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  lte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gt?: string | Prisma.StringFieldRefInput<$PrismaModel>
  gte?: string | Prisma.StringFieldRefInput<$PrismaModel>
  contains?: string | Prisma.StringFieldRefInput<$PrismaModel>
  startsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  endsWith?: string | Prisma.StringFieldRefInput<$PrismaModel>
  not?: Prisma.NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
  _count?: Prisma.NestedIntNullableFilter<$PrismaModel>
  _min?: Prisma.NestedStringNullableFilter<$PrismaModel>
  _max?: Prisma.NestedStringNullableFilter<$PrismaModel>
}

export type NestedIntNullableFilter<$PrismaModel = never> = {
  equals?: number | Prisma.IntFieldRefInput<$PrismaModel> | null
  in?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null
  notIn?: number[] | Prisma.ListIntFieldRefInput<$PrismaModel> | null
  lt?: number | Prisma.IntFieldRefInput<$PrismaModel>
  lte?: number | Prisma.IntFieldRefInput<$PrismaModel>
  gt?: number | Prisma.IntFieldRefInput<$PrismaModel>
  gte?: number | Prisma.IntFieldRefInput<$PrismaModel>
  not?: Prisma.NestedIntNullableFilter<$PrismaModel> | number | null
}

export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
  equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>
  notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel>
  lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  not?: Prisma.NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
  _count?: Prisma.NestedIntFilter<$PrismaModel>
  _min?: Prisma.NestedDateTimeFilter<$PrismaModel>
  _max?: Prisma.NestedDateTimeFilter<$PrismaModel>
}

export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
  equals?: $Enums.Role | Prisma.EnumRoleFieldRefInput<$PrismaModel>
  in?: $Enums.Role[] | Prisma.ListEnumRoleFieldRefInput<$PrismaModel>
  notIn?: $Enums.Role[] | Prisma.ListEnumRoleFieldRefInput<$PrismaModel>
  not?: Prisma.NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
  _count?: Prisma.NestedIntFilter<$PrismaModel>
  _min?: Prisma.NestedEnumRoleFilter<$PrismaModel>
  _max?: Prisma.NestedEnumRoleFilter<$PrismaModel>
}

export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
  equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null
  in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null
  notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null
  lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  not?: Prisma.NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
}

export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
  equals?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel> | null
  in?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null
  notIn?: Date[] | string[] | Prisma.ListDateTimeFieldRefInput<$PrismaModel> | null
  lt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  lte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gt?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  gte?: Date | string | Prisma.DateTimeFieldRefInput<$PrismaModel>
  not?: Prisma.NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
  _count?: Prisma.NestedIntNullableFilter<$PrismaModel>
  _min?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>
  _max?: Prisma.NestedDateTimeNullableFilter<$PrismaModel>
}


```

---

### `packages/db/prisma/generated/enums.ts`

```typescript

/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// biome-ignore-all lint: generated file
// @ts-nocheck 
/*
* This file exports all enum related types from the schema.
*
* 🟢 You can import this file directly.
*/

export const Role = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  USER: 'USER'
} as const

export type Role = (typeof Role)[keyof typeof Role]
```

---

### `packages/db/prisma/generated/internal/class.ts`

```typescript

/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * WARNING: This is an internal file that is subject to change!
 *
 * 🛑 Under no circumstances should you import this file directly! 🛑
 *
 * Please import the `PrismaClient` class from the `client.ts` file instead.
 */

import * as runtime from "@prisma/client/runtime/client"
import type * as Prisma from "./prismaNamespace"


const config: runtime.GetPrismaClientConfig = {
  "previewFeatures": [],
  "clientVersion": "7.2.0",
  "engineVersion": "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3",
  "activeProvider": "postgresql",
  "inlineSchema": "enum Role {\n  OWNER\n  ADMIN\n  USER\n}\n\nmodel User {\n  id            String    @id\n  name          String\n  email         String\n  emailVerified Boolean   @default(false)\n  image         String?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n  role          Role      @default(USER)\n  banned        Boolean   @default(false)\n  banReason     String?\n  archived      Boolean   @default(false)\n\n  invitations Invitation[]\n\n  @@unique([email])\n  @@map(\"user\")\n}\n\nmodel Invitation {\n  id        String   @id @default(cuid())\n  email     String\n  role      Role     @default(USER)\n  expiresAt DateTime\n  inviterId String\n  user      User     @relation(fields: [inviterId], references: [id], onDelete: Cascade)\n  status    String   @default(\"pending\") // pending, accepted, rejected\n  createdAt DateTime @default(now())\n\n  @@map(\"invitation\")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map(\"session\")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map(\"account\")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map(\"verification\")\n}\n\ngenerator client {\n  provider     = \"prisma-client\"\n  output       = \"../generated\"\n  moduleFormat = \"esm\"\n  runtime      = \"bun\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n",
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"emailVerified\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"image\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"sessions\",\"kind\":\"object\",\"type\":\"Session\",\"relationName\":\"SessionToUser\"},{\"name\":\"accounts\",\"kind\":\"object\",\"type\":\"Account\",\"relationName\":\"AccountToUser\"},{\"name\":\"role\",\"kind\":\"enum\",\"type\":\"Role\"},{\"name\":\"banned\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"banReason\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"archived\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"invitations\",\"kind\":\"object\",\"type\":\"Invitation\",\"relationName\":\"InvitationToUser\"}],\"dbName\":\"user\"},\"Invitation\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"enum\",\"type\":\"Role\"},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"inviterId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"InvitationToUser\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":\"invitation\"},\"Session\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"ipAddress\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userAgent\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"SessionToUser\"}],\"dbName\":\"session\"},\"Account\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"accountId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"providerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"AccountToUser\"},{\"name\":\"accessToken\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"refreshToken\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"idToken\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"accessTokenExpiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"refreshTokenExpiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"scope\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":\"account\"},\"Verification\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"identifier\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"value\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":\"verification\"}},\"enums\":{},\"types\":{}}")

async function decodeBase64AsWasm(wasmBase64: string): Promise<WebAssembly.Module> {
  const { Buffer } = await import('node:buffer')
  const wasmArray = Buffer.from(wasmBase64, 'base64')
  return new WebAssembly.Module(wasmArray)
}

config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_bg.postgresql.mjs"),

  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_bg.postgresql.wasm-base64.mjs")
    return await decodeBase64AsWasm(wasm)
  }
}



export type LogOptions<ClientOptions extends Prisma.PrismaClientOptions> =
  'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never

export interface PrismaClientConstructor {
    /**
   * ## Prisma Client
   * 
   * Type-safe database client for TypeScript
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   * 
   * Read more in our [docs](https://pris.ly/d/client).
   */

  new <
    Options extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
    LogOpts extends LogOptions<Options> = LogOptions<Options>,
    OmitOpts extends Prisma.PrismaClientOptions['omit'] = Options extends { omit: infer U } ? U : Prisma.PrismaClientOptions['omit'],
    ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs
  >(options: Prisma.Subset<Options, Prisma.PrismaClientOptions> ): PrismaClient<LogOpts, OmitOpts, ExtArgs>
}

/**
 * ## Prisma Client
 * 
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 * 
 * Read more in our [docs](https://pris.ly/d/client).
 */

export interface PrismaClient<
  in LogOpts extends Prisma.LogLevel = never,
  in out OmitOpts extends Prisma.PrismaClientOptions['omit'] = undefined,
  in out ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

  $on<V extends LogOpts>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): runtime.Types.Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): runtime.Types.Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => runtime.Types.Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): runtime.Types.Utils.JsPromise<R>

  $extends: runtime.Types.Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<OmitOpts>, ExtArgs, runtime.Types.Utils.Call<Prisma.TypeMapCb<OmitOpts>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, { omit: OmitOpts }>;

  /**
   * `prisma.invitation`: Exposes CRUD operations for the **Invitation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Invitations
    * const invitations = await prisma.invitation.findMany()
    * ```
    */
  get invitation(): Prisma.InvitationDelegate<ExtArgs, { omit: OmitOpts }>;

  /**
   * `prisma.session`: Exposes CRUD operations for the **Session** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.session.findMany()
    * ```
    */
  get session(): Prisma.SessionDelegate<ExtArgs, { omit: OmitOpts }>;

  /**
   * `prisma.account`: Exposes CRUD operations for the **Account** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Accounts
    * const accounts = await prisma.account.findMany()
    * ```
    */
  get account(): Prisma.AccountDelegate<ExtArgs, { omit: OmitOpts }>;

  /**
   * `prisma.verification`: Exposes CRUD operations for the **Verification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Verifications
    * const verifications = await prisma.verification.findMany()
    * ```
    */
  get verification(): Prisma.VerificationDelegate<ExtArgs, { omit: OmitOpts }>;
}

export function getPrismaClientClass(): PrismaClientConstructor {
  return runtime.getPrismaClient(config) as unknown as PrismaClientConstructor
}
```

---

### `packages/db/prisma/generated/internal/prismaNamespace.ts`

```typescript

/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * WARNING: This is an internal file that is subject to change!
 *
 * 🛑 Under no circumstances should you import this file directly! 🛑
 *
 * All exports from this file are wrapped under a `Prisma` namespace object in the client.ts file.
 * While this enables partial backward compatibility, it is not part of the stable public API.
 *
 * If you are looking for your Models, Enums, and Input Types, please import them from the respective
 * model files in the `model` directory!
 */

import * as runtime from "@prisma/client/runtime/client"
import type * as Prisma from "../models"
import { type PrismaClient } from "./class"

export type * from '../models'

export type DMMF = typeof runtime.DMMF

export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>

/**
 * Prisma Errors
 */

export const PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError

export const PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError

export const PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError

export const PrismaClientInitializationError = runtime.PrismaClientInitializationError
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError

export const PrismaClientValidationError = runtime.PrismaClientValidationError
export type PrismaClientValidationError = runtime.PrismaClientValidationError

/**
 * Re-export of sql-template-tag
 */
export const sql = runtime.sqltag
export const empty = runtime.empty
export const join = runtime.join
export const raw = runtime.raw
export const Sql = runtime.Sql
export type Sql = runtime.Sql



/**
 * Decimal.js
 */
export const Decimal = runtime.Decimal
export type Decimal = runtime.Decimal

export type DecimalJsLike = runtime.DecimalJsLike

/**
* Extensions
*/
export type Extension = runtime.Types.Extensions.UserArgs
export const getExtensionContext = runtime.Extensions.getExtensionContext
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>

export type PrismaVersion = {
  client: string
  engine: string
}

/**
 * Prisma Client JS version: 7.2.0
 * Query Engine version: 0c8ef2ce45c83248ab3df073180d5eda9e8be7a3
 */
export const prismaVersion: PrismaVersion = {
  client: "7.2.0",
  engine: "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3"
}

/**
 * Utility Types
 */

export type Bytes = runtime.Bytes
export type JsonObject = runtime.JsonObject
export type JsonArray = runtime.JsonArray
export type JsonValue = runtime.JsonValue
export type InputJsonObject = runtime.InputJsonObject
export type InputJsonArray = runtime.InputJsonArray
export type InputJsonValue = runtime.InputJsonValue


export const NullTypes = {
  DbNull: runtime.NullTypes.DbNull as (new (secret: never) => typeof runtime.DbNull),
  JsonNull: runtime.NullTypes.JsonNull as (new (secret: never) => typeof runtime.JsonNull),
  AnyNull: runtime.NullTypes.AnyNull as (new (secret: never) => typeof runtime.AnyNull),
}
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export const DbNull = runtime.DbNull

/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export const JsonNull = runtime.JsonNull

/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export const AnyNull = runtime.AnyNull


type SelectAndInclude = {
  select: any
  include: any
}

type SelectAndOmit = {
  select: any
  omit: any
}

/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

export type Enumerable<T> = T | Array<T>;

/**
 * Subset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
 */
export type Subset<T, U> = {
  [key in keyof T]: key extends keyof U ? T[key] : never;
};

/**
 * SelectSubset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
 * Additionally, it validates, if both select and include are present. If the case, it errors.
 */
export type SelectSubset<T, U> = {
  [key in keyof T]: key extends keyof U ? T[key] : never
} &
  (T extends SelectAndInclude
    ? 'Please either choose `select` or `include`.'
    : T extends SelectAndOmit
      ? 'Please either choose `select` or `omit`.'
      : {})

/**
 * Subset + Intersection
 * @desc From `T` pick properties that exist in `U` and intersect `K`
 */
export type SubsetIntersection<T, U, K> = {
  [key in keyof T]: key extends keyof U ? T[key] : never
} &
  K

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

/**
 * XOR is needed to have a real mutually exclusive union type
 * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
 */
export type XOR<T, U> =
  T extends object ?
  U extends object ?
    (Without<T, U> & U) | (Without<U, T> & T)
  : U : T


/**
 * Is T a Record?
 */
type IsObject<T extends any> = T extends Array<any>
? False
: T extends Date
? False
: T extends Uint8Array
? False
: T extends BigInt
? False
: T extends object
? True
: False


/**
 * If it's T[], return T
 */
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

/**
 * From ts-toolbelt
 */

type __Either<O extends object, K extends Key> = Omit<O, K> &
  {
    // Merge all but K
    [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
  }[K]

type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

type _Either<
  O extends object,
  K extends Key,
  strict extends Boolean
> = {
  1: EitherStrict<O, K>
  0: EitherLoose<O, K>
}[strict]

export type Either<
  O extends object,
  K extends Key,
  strict extends Boolean = 1
> = O extends unknown ? _Either<O, K, strict> : never

export type Union = any

export type PatchUndefined<O extends object, O1 extends object> = {
  [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
} & {}

/** Helper Types for "Merge" **/
export type IntersectOf<U extends Union> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};

type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;

type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];

export type ComputeRaw<A extends any> = A extends Function ? A : {
  [K in keyof A]: A[K];
} & {};

export type OptionalFlat<O> = {
  [K in keyof O]?: O[K];
} & {};

type _Record<K extends keyof any, T> = {
  [P in K]: T;
};

// cause typescript not to expand types and preserve names
type NoExpand<T> = T extends unknown ? T : never;

// this type assumes the passed object is entirely optional
export type AtLeast<O extends object, K extends string> = NoExpand<
  O extends unknown
  ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
    | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
  : never>;

type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
/** End Helper Types for "Merge" **/

export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

export type Boolean = True | False

export type True = 1

export type False = 0

export type Not<B extends Boolean> = {
  0: 1
  1: 0
}[B]

export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
  ? 0 // anything `never` is false
  : A1 extends A2
  ? 1
  : 0

export type Has<U extends Union, U1 extends Union> = Not<
  Extends<Exclude<U1, U>, U1>
>

export type Or<B1 extends Boolean, B2 extends Boolean> = {
  0: {
    0: 0
    1: 1
  }
  1: {
    0: 1
    1: 1
  }
}[B1][B2]

export type Keys<U extends Union> = U extends unknown ? keyof U : never

export type GetScalarType<T, O> = O extends object ? {
  [P in keyof T]: P extends keyof O
    ? O[P]
    : never
} : never

type FieldPaths<
  T,
  U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
> = IsObject<T> extends True ? U : T

export type GetHavingFields<T> = {
  [K in keyof T]: Or<
    Or<Extends<'OR', K>, Extends<'AND', K>>,
    Extends<'NOT', K>
  > extends True
    ? // infer is only needed to not hit TS limit
      // based on the brilliant idea of Pierre-Antoine Mills
      // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
      T[K] extends infer TK
      ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
      : never
    : {} extends FieldPaths<T[K]>
    ? never
    : K
}[keyof T]

/**
 * Convert tuple to union
 */
type _TupleToUnion<T> = T extends (infer E)[] ? E : never
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

/**
 * Like `Pick`, but additionally can also accept an array of keys
 */
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

/**
 * Exclude all keys with underscores
 */
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


export const ModelName = {
  User: 'User',
  Invitation: 'Invitation',
  Session: 'Session',
  Account: 'Account',
  Verification: 'Verification'
} as const

export type ModelName = (typeof ModelName)[keyof typeof ModelName]



export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{extArgs: runtime.Types.Extensions.InternalArgs }, runtime.Types.Utils.Record<string, any>> {
  returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>
}

export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
  globalOmitOptions: {
    omit: GlobalOmitOptions
  }
  meta: {
    modelProps: "user" | "invitation" | "session" | "account" | "verification"
    txIsolationLevel: TransactionIsolationLevel
  }
  model: {
    User: {
      payload: Prisma.$UserPayload<ExtArgs>
      fields: Prisma.UserFieldRefs
      operations: {
        findUnique: {
          args: Prisma.UserFindUniqueArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null
        }
        findUniqueOrThrow: {
          args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>
        }
        findFirst: {
          args: Prisma.UserFindFirstArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null
        }
        findFirstOrThrow: {
          args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>
        }
        findMany: {
          args: Prisma.UserFindManyArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[]
        }
        create: {
          args: Prisma.UserCreateArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>
        }
        createMany: {
          args: Prisma.UserCreateManyArgs<ExtArgs>
          result: BatchPayload
        }
        createManyAndReturn: {
          args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[]
        }
        delete: {
          args: Prisma.UserDeleteArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>
        }
        update: {
          args: Prisma.UserUpdateArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>
        }
        deleteMany: {
          args: Prisma.UserDeleteManyArgs<ExtArgs>
          result: BatchPayload
        }
        updateMany: {
          args: Prisma.UserUpdateManyArgs<ExtArgs>
          result: BatchPayload
        }
        updateManyAndReturn: {
          args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[]
        }
        upsert: {
          args: Prisma.UserUpsertArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>
        }
        aggregate: {
          args: Prisma.UserAggregateArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.AggregateUser>
        }
        groupBy: {
          args: Prisma.UserGroupByArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.UserGroupByOutputType>[]
        }
        count: {
          args: Prisma.UserCountArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.UserCountAggregateOutputType> | number
        }
      }
    }
    Invitation: {
      payload: Prisma.$InvitationPayload<ExtArgs>
      fields: Prisma.InvitationFieldRefs
      operations: {
        findUnique: {
          args: Prisma.InvitationFindUniqueArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$InvitationPayload> | null
        }
        findUniqueOrThrow: {
          args: Prisma.InvitationFindUniqueOrThrowArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$InvitationPayload>
        }
        findFirst: {
          args: Prisma.InvitationFindFirstArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$InvitationPayload> | null
        }
        findFirstOrThrow: {
          args: Prisma.InvitationFindFirstOrThrowArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$InvitationPayload>
        }
        findMany: {
          args: Prisma.InvitationFindManyArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$InvitationPayload>[]
        }
        create: {
          args: Prisma.InvitationCreateArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$InvitationPayload>
        }
        createMany: {
          args: Prisma.InvitationCreateManyArgs<ExtArgs>
          result: BatchPayload
        }
        createManyAndReturn: {
          args: Prisma.InvitationCreateManyAndReturnArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$InvitationPayload>[]
        }
        delete: {
          args: Prisma.InvitationDeleteArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$InvitationPayload>
        }
        update: {
          args: Prisma.InvitationUpdateArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$InvitationPayload>
        }
        deleteMany: {
          args: Prisma.InvitationDeleteManyArgs<ExtArgs>
          result: BatchPayload
        }
        updateMany: {
          args: Prisma.InvitationUpdateManyArgs<ExtArgs>
          result: BatchPayload
        }
        updateManyAndReturn: {
          args: Prisma.InvitationUpdateManyAndReturnArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$InvitationPayload>[]
        }
        upsert: {
          args: Prisma.InvitationUpsertArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$InvitationPayload>
        }
        aggregate: {
          args: Prisma.InvitationAggregateArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.AggregateInvitation>
        }
        groupBy: {
          args: Prisma.InvitationGroupByArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.InvitationGroupByOutputType>[]
        }
        count: {
          args: Prisma.InvitationCountArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.InvitationCountAggregateOutputType> | number
        }
      }
    }
    Session: {
      payload: Prisma.$SessionPayload<ExtArgs>
      fields: Prisma.SessionFieldRefs
      operations: {
        findUnique: {
          args: Prisma.SessionFindUniqueArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload> | null
        }
        findUniqueOrThrow: {
          args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>
        }
        findFirst: {
          args: Prisma.SessionFindFirstArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload> | null
        }
        findFirstOrThrow: {
          args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>
        }
        findMany: {
          args: Prisma.SessionFindManyArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>[]
        }
        create: {
          args: Prisma.SessionCreateArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>
        }
        createMany: {
          args: Prisma.SessionCreateManyArgs<ExtArgs>
          result: BatchPayload
        }
        createManyAndReturn: {
          args: Prisma.SessionCreateManyAndReturnArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>[]
        }
        delete: {
          args: Prisma.SessionDeleteArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>
        }
        update: {
          args: Prisma.SessionUpdateArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>
        }
        deleteMany: {
          args: Prisma.SessionDeleteManyArgs<ExtArgs>
          result: BatchPayload
        }
        updateMany: {
          args: Prisma.SessionUpdateManyArgs<ExtArgs>
          result: BatchPayload
        }
        updateManyAndReturn: {
          args: Prisma.SessionUpdateManyAndReturnArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>[]
        }
        upsert: {
          args: Prisma.SessionUpsertArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$SessionPayload>
        }
        aggregate: {
          args: Prisma.SessionAggregateArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.AggregateSession>
        }
        groupBy: {
          args: Prisma.SessionGroupByArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.SessionGroupByOutputType>[]
        }
        count: {
          args: Prisma.SessionCountArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.SessionCountAggregateOutputType> | number
        }
      }
    }
    Account: {
      payload: Prisma.$AccountPayload<ExtArgs>
      fields: Prisma.AccountFieldRefs
      operations: {
        findUnique: {
          args: Prisma.AccountFindUniqueArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$AccountPayload> | null
        }
        findUniqueOrThrow: {
          args: Prisma.AccountFindUniqueOrThrowArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$AccountPayload>
        }
        findFirst: {
          args: Prisma.AccountFindFirstArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$AccountPayload> | null
        }
        findFirstOrThrow: {
          args: Prisma.AccountFindFirstOrThrowArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$AccountPayload>
        }
        findMany: {
          args: Prisma.AccountFindManyArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$AccountPayload>[]
        }
        create: {
          args: Prisma.AccountCreateArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$AccountPayload>
        }
        createMany: {
          args: Prisma.AccountCreateManyArgs<ExtArgs>
          result: BatchPayload
        }
        createManyAndReturn: {
          args: Prisma.AccountCreateManyAndReturnArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$AccountPayload>[]
        }
        delete: {
          args: Prisma.AccountDeleteArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$AccountPayload>
        }
        update: {
          args: Prisma.AccountUpdateArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$AccountPayload>
        }
        deleteMany: {
          args: Prisma.AccountDeleteManyArgs<ExtArgs>
          result: BatchPayload
        }
        updateMany: {
          args: Prisma.AccountUpdateManyArgs<ExtArgs>
          result: BatchPayload
        }
        updateManyAndReturn: {
          args: Prisma.AccountUpdateManyAndReturnArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$AccountPayload>[]
        }
        upsert: {
          args: Prisma.AccountUpsertArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$AccountPayload>
        }
        aggregate: {
          args: Prisma.AccountAggregateArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.AggregateAccount>
        }
        groupBy: {
          args: Prisma.AccountGroupByArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.AccountGroupByOutputType>[]
        }
        count: {
          args: Prisma.AccountCountArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.AccountCountAggregateOutputType> | number
        }
      }
    }
    Verification: {
      payload: Prisma.$VerificationPayload<ExtArgs>
      fields: Prisma.VerificationFieldRefs
      operations: {
        findUnique: {
          args: Prisma.VerificationFindUniqueArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPayload> | null
        }
        findUniqueOrThrow: {
          args: Prisma.VerificationFindUniqueOrThrowArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPayload>
        }
        findFirst: {
          args: Prisma.VerificationFindFirstArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPayload> | null
        }
        findFirstOrThrow: {
          args: Prisma.VerificationFindFirstOrThrowArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPayload>
        }
        findMany: {
          args: Prisma.VerificationFindManyArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPayload>[]
        }
        create: {
          args: Prisma.VerificationCreateArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPayload>
        }
        createMany: {
          args: Prisma.VerificationCreateManyArgs<ExtArgs>
          result: BatchPayload
        }
        createManyAndReturn: {
          args: Prisma.VerificationCreateManyAndReturnArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPayload>[]
        }
        delete: {
          args: Prisma.VerificationDeleteArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPayload>
        }
        update: {
          args: Prisma.VerificationUpdateArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPayload>
        }
        deleteMany: {
          args: Prisma.VerificationDeleteManyArgs<ExtArgs>
          result: BatchPayload
        }
        updateMany: {
          args: Prisma.VerificationUpdateManyArgs<ExtArgs>
          result: BatchPayload
        }
        updateManyAndReturn: {
          args: Prisma.VerificationUpdateManyAndReturnArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPayload>[]
        }
        upsert: {
          args: Prisma.VerificationUpsertArgs<ExtArgs>
          result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPayload>
        }
        aggregate: {
          args: Prisma.VerificationAggregateArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.AggregateVerification>
        }
        groupBy: {
          args: Prisma.VerificationGroupByArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.VerificationGroupByOutputType>[]
        }
        count: {
          args: Prisma.VerificationCountArgs<ExtArgs>
          result: runtime.Types.Utils.Optional<Prisma.VerificationCountAggregateOutputType> | number
        }
      }
    }
  }
} & {
  other: {
    payload: any
    operations: {
      $executeRaw: {
        args: [query: TemplateStringsArray | Sql, ...values: any[]],
        result: any
      }
      $executeRawUnsafe: {
        args: [query: string, ...values: any[]],
        result: any
      }
      $queryRaw: {
        args: [query: TemplateStringsArray | Sql, ...values: any[]],
        result: any
      }
      $queryRawUnsafe: {
        args: [query: string, ...values: any[]],
        result: any
      }
    }
  }
}

/**
 * Enums
 */

export const TransactionIsolationLevel = runtime.makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
} as const)

export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


export const UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  role: 'role',
  banned: 'banned',
  banReason: 'banReason',
  archived: 'archived'
} as const

export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


export const InvitationScalarFieldEnum = {
  id: 'id',
  email: 'email',
  role: 'role',
  expiresAt: 'expiresAt',
  inviterId: 'inviterId',
  status: 'status',
  createdAt: 'createdAt'
} as const

export type InvitationScalarFieldEnum = (typeof InvitationScalarFieldEnum)[keyof typeof InvitationScalarFieldEnum]


export const SessionScalarFieldEnum = {
  id: 'id',
  expiresAt: 'expiresAt',
  token: 'token',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  userId: 'userId'
} as const

export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum]


export const AccountScalarFieldEnum = {
  id: 'id',
  accountId: 'accountId',
  providerId: 'providerId',
  userId: 'userId',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  idToken: 'idToken',
  accessTokenExpiresAt: 'accessTokenExpiresAt',
  refreshTokenExpiresAt: 'refreshTokenExpiresAt',
  scope: 'scope',
  password: 'password',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
} as const

export type AccountScalarFieldEnum = (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum]


export const VerificationScalarFieldEnum = {
  id: 'id',
  identifier: 'identifier',
  value: 'value',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
} as const

export type VerificationScalarFieldEnum = (typeof VerificationScalarFieldEnum)[keyof typeof VerificationScalarFieldEnum]


export const SortOrder = {
  asc: 'asc',
  desc: 'desc'
} as const

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


export const QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
} as const

export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


export const NullsOrder = {
  first: 'first',
  last: 'last'
} as const

export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]



/**
 * Field references
 */


/**
 * Reference to a field of type 'String'
 */
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


/**
 * Reference to a field of type 'String[]'
 */
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


/**
 * Reference to a field of type 'Boolean'
 */
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


/**
 * Reference to a field of type 'DateTime'
 */
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


/**
 * Reference to a field of type 'DateTime[]'
 */
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


/**
 * Reference to a field of type 'Role'
 */
export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


/**
 * Reference to a field of type 'Role[]'
 */
export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


/**
 * Reference to a field of type 'Int'
 */
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


/**
 * Reference to a field of type 'Int[]'
 */
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    

/**
 * Batch Payload for updateMany & deleteMany & createMany
 */
export type BatchPayload = {
  count: number
}

export const defineExtension = runtime.Extensions.defineExtension as unknown as runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>
export type DefaultPrismaClient = PrismaClient
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
export type PrismaClientOptions = ({
  /**
   * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-pg`.
   */
  adapter: runtime.SqlDriverAdapterFactory
  accelerateUrl?: never
} | {
  /**
   * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
   */
  accelerateUrl: string
  adapter?: never
}) & {
  /**
   * @default "colorless"
   */
  errorFormat?: ErrorFormat
  /**
   * @example
   * ```
   * // Shorthand for `emit: 'stdout'`
   * log: ['query', 'info', 'warn', 'error']
   * 
   * // Emit as events only
   * log: [
   *   { emit: 'event', level: 'query' },
   *   { emit: 'event', level: 'info' },
   *   { emit: 'event', level: 'warn' }
   *   { emit: 'event', level: 'error' }
   * ]
   * 
   * / Emit as events and log to stdout
   * og: [
   *  { emit: 'stdout', level: 'query' },
   *  { emit: 'stdout', level: 'info' },
   *  { emit: 'stdout', level: 'warn' }
   *  { emit: 'stdout', level: 'error' }
   * 
   * ```
   * Read more in our [docs](https://pris.ly/d/logging).
   */
  log?: (LogLevel | LogDefinition)[]
  /**
   * The default values for transactionOptions
   * maxWait ?= 2000
   * timeout ?= 5000
   */
  transactionOptions?: {
    maxWait?: number
    timeout?: number
    isolationLevel?: TransactionIsolationLevel
  }
  /**
   * Global configuration for omitting model fields by default.
   * 
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   omit: {
   *     user: {
   *       password: true
   *     }
   *   }
   * })
   * ```
   */
  omit?: GlobalOmitConfig
  /**
   * SQL commenter plugins that add metadata to SQL queries as comments.
   * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
   * 
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter,
   *   comments: [
   *     traceContext(),
   *     queryInsights(),
   *   ],
   * })
   * ```
   */
  comments?: runtime.SqlCommenterPlugin[]
}
export type GlobalOmitConfig = {
  user?: Prisma.UserOmit
  invitation?: Prisma.InvitationOmit
  session?: Prisma.SessionOmit
  account?: Prisma.AccountOmit
  verification?: Prisma.VerificationOmit
}

/* Types for Logging */
export type LogLevel = 'info' | 'query' | 'warn' | 'error'
export type LogDefinition = {
  level: LogLevel
  emit: 'stdout' | 'event'
}

export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

export type GetLogType<T> = CheckIsLogLevel<
  T extends LogDefinition ? T['level'] : T
>;

export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
  ? GetLogType<T[number]>
  : never;

export type QueryEvent = {
  timestamp: Date
  query: string
  params: string
  duration: number
  target: string
}

export type LogEvent = {
  timestamp: Date
  message: string
  target: string
}
/* End Types for Logging */


export type PrismaAction =
  | 'findUnique'
  | 'findUniqueOrThrow'
  | 'findMany'
  | 'findFirst'
  | 'findFirstOrThrow'
  | 'create'
  | 'createMany'
  | 'createManyAndReturn'
  | 'update'
  | 'updateMany'
  | 'updateManyAndReturn'
  | 'upsert'
  | 'delete'
  | 'deleteMany'
  | 'executeRaw'
  | 'queryRaw'
  | 'aggregate'
  | 'count'
  | 'runCommandRaw'
  | 'findRaw'
  | 'groupBy'

/**
 * `PrismaClient` proxy available in interactive transactions.
 */
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>

```

---

### `packages/db/prisma/generated/internal/prismaNamespaceBrowser.ts`

```typescript

/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * WARNING: This is an internal file that is subject to change!
 *
 * 🛑 Under no circumstances should you import this file directly! 🛑
 *
 * All exports from this file are wrapped under a `Prisma` namespace object in the browser.ts file.
 * While this enables partial backward compatibility, it is not part of the stable public API.
 *
 * If you are looking for your Models, Enums, and Input Types, please import them from the respective
 * model files in the `model` directory!
 */

import * as runtime from "@prisma/client/runtime/index-browser"

export type * from '../models'
export type * from './prismaNamespace'

export const Decimal = runtime.Decimal


export const NullTypes = {
  DbNull: runtime.NullTypes.DbNull as (new (secret: never) => typeof runtime.DbNull),
  JsonNull: runtime.NullTypes.JsonNull as (new (secret: never) => typeof runtime.JsonNull),
  AnyNull: runtime.NullTypes.AnyNull as (new (secret: never) => typeof runtime.AnyNull),
}
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export const DbNull = runtime.DbNull

/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export const JsonNull = runtime.JsonNull

/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export const AnyNull = runtime.AnyNull


export const ModelName = {
  User: 'User',
  Invitation: 'Invitation',
  Session: 'Session',
  Account: 'Account',
  Verification: 'Verification'
} as const

export type ModelName = (typeof ModelName)[keyof typeof ModelName]

/*
 * Enums
 */

export const TransactionIsolationLevel = {
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
} as const

export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


export const UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  role: 'role',
  banned: 'banned',
  banReason: 'banReason',
  archived: 'archived'
} as const

export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


export const InvitationScalarFieldEnum = {
  id: 'id',
  email: 'email',
  role: 'role',
  expiresAt: 'expiresAt',
  inviterId: 'inviterId',
  status: 'status',
  createdAt: 'createdAt'
} as const

export type InvitationScalarFieldEnum = (typeof InvitationScalarFieldEnum)[keyof typeof InvitationScalarFieldEnum]


export const SessionScalarFieldEnum = {
  id: 'id',
  expiresAt: 'expiresAt',
  token: 'token',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  userId: 'userId'
} as const

export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum]


export const AccountScalarFieldEnum = {
  id: 'id',
  accountId: 'accountId',
  providerId: 'providerId',
  userId: 'userId',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  idToken: 'idToken',
  accessTokenExpiresAt: 'accessTokenExpiresAt',
  refreshTokenExpiresAt: 'refreshTokenExpiresAt',
  scope: 'scope',
  password: 'password',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
} as const

export type AccountScalarFieldEnum = (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum]


export const VerificationScalarFieldEnum = {
  id: 'id',
  identifier: 'identifier',
  value: 'value',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
} as const

export type VerificationScalarFieldEnum = (typeof VerificationScalarFieldEnum)[keyof typeof VerificationScalarFieldEnum]


export const SortOrder = {
  asc: 'asc',
  desc: 'desc'
} as const

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


export const QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
} as const

export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


export const NullsOrder = {
  first: 'first',
  last: 'last'
} as const

export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]

```

---

### `packages/db/prisma/generated/models/Account.ts`

```typescript

/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * This file exports the `Account` model and its related types.
 *
 * 🟢 You can import this file directly.
 */
import type * as runtime from "@prisma/client/runtime/client"
import type * as $Enums from "../enums"
import type * as Prisma from "../internal/prismaNamespace"

/**
 * Model Account
 * 
 */
export type AccountModel = runtime.Types.Result.DefaultSelection<Prisma.$AccountPayload>

export type AggregateAccount = {
  _count: AccountCountAggregateOutputType | null
  _min: AccountMinAggregateOutputType | null
  _max: AccountMaxAggregateOutputType | null
}

export type AccountMinAggregateOutputType = {
  id: string | null
  accountId: string | null
  providerId: string | null
  userId: string | null
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  accessTokenExpiresAt: Date | null
  refreshTokenExpiresAt: Date | null
  scope: string | null
  password: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

export type AccountMaxAggregateOutputType = {
  id: string | null
  accountId: string | null
  providerId: string | null
  userId: string | null
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  accessTokenExpiresAt: Date | null
  refreshTokenExpiresAt: Date | null
  scope: string | null
  password: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

export type AccountCountAggregateOutputType = {
  id: number
  accountId: number
  providerId: number
  userId: number
  accessToken: number
  refreshToken: number
  idToken: number
  accessTokenExpiresAt: number
  refreshTokenExpiresAt: number
  scope: number
  password: number
  createdAt: number
  updatedAt: number
  _all: number
}


export type AccountMinAggregateInputType = {
  id?: true
  accountId?: true
  providerId?: true
  userId?: true
  accessToken?: true
  refreshToken?: true
  idToken?: true
  accessTokenExpiresAt?: true
  refreshTokenExpiresAt?: true
  scope?: true
  password?: true
  createdAt?: true
  updatedAt?: true
}

export type AccountMaxAggregateInputType = {
  id?: true
  accountId?: true
  providerId?: true
  userId?: true
  accessToken?: true
  refreshToken?: true
  idToken?: true
  accessTokenExpiresAt?: true
  refreshTokenExpiresAt?: true
  scope?: true
  password?: true
  createdAt?: true
  updatedAt?: true
}

export type AccountCountAggregateInputType = {
  id?: true
  accountId?: true
  providerId?: true
  userId?: true
  accessToken?: true
  refreshToken?: true
  idToken?: true
  accessTokenExpiresAt?: true
  refreshTokenExpiresAt?: true
  scope?: true
  password?: true
  createdAt?: true
  updatedAt?: true
  _all?: true
}

export type AccountAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Account to aggregate.
   */
  where?: Prisma.AccountWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Accounts to fetch.
   */
  orderBy?: Prisma.AccountOrderByWithRelationInput | Prisma.AccountOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the start position
   */
  cursor?: Prisma.AccountWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Accounts from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Accounts.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Count returned Accounts
  **/
  _count?: true | AccountCountAggregateInputType
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Select which fields to find the minimum value
  **/
  _min?: AccountMinAggregateInputType
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Select which fields to find the maximum value
  **/
  _max?: AccountMaxAggregateInputType
}

export type GetAccountAggregateType<T extends AccountAggregateArgs> = {
      [P in keyof T & keyof AggregateAccount]: P extends '_count' | 'count'
    ? T[P] extends true
      ? number
      : Prisma.GetScalarType<T[P], AggregateAccount[P]>
    : Prisma.GetScalarType<T[P], AggregateAccount[P]>
}




export type AccountGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: Prisma.AccountWhereInput
  orderBy?: Prisma.AccountOrderByWithAggregationInput | Prisma.AccountOrderByWithAggregationInput[]
  by: Prisma.AccountScalarFieldEnum[] | Prisma.AccountScalarFieldEnum
  having?: Prisma.AccountScalarWhereWithAggregatesInput
  take?: number
  skip?: number
  _count?: AccountCountAggregateInputType | true
  _min?: AccountMinAggregateInputType
  _max?: AccountMaxAggregateInputType
}

export type AccountGroupByOutputType = {
  id: string
  accountId: string
  providerId: string
  userId: string
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  accessTokenExpiresAt: Date | null
  refreshTokenExpiresAt: Date | null
  scope: string | null
  password: string | null
  createdAt: Date
  updatedAt: Date
  _count: AccountCountAggregateOutputType | null
  _min: AccountMinAggregateOutputType | null
  _max: AccountMaxAggregateOutputType | null
}

type GetAccountGroupByPayload<T extends AccountGroupByArgs> = Prisma.PrismaPromise<
  Array<
    Prisma.PickEnumerable<AccountGroupByOutputType, T['by']> &
      {
        [P in ((keyof T) & (keyof AccountGroupByOutputType))]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : Prisma.GetScalarType<T[P], AccountGroupByOutputType[P]>
          : Prisma.GetScalarType<T[P], AccountGroupByOutputType[P]>
      }
    >
  >



export type AccountWhereInput = {
  AND?: Prisma.AccountWhereInput | Prisma.AccountWhereInput[]
  OR?: Prisma.AccountWhereInput[]
  NOT?: Prisma.AccountWhereInput | Prisma.AccountWhereInput[]
  id?: Prisma.StringFilter<"Account"> | string
  accountId?: Prisma.StringFilter<"Account"> | string
  providerId?: Prisma.StringFilter<"Account"> | string
  userId?: Prisma.StringFilter<"Account"> | string
  accessToken?: Prisma.StringNullableFilter<"Account"> | string | null
  refreshToken?: Prisma.StringNullableFilter<"Account"> | string | null
  idToken?: Prisma.StringNullableFilter<"Account"> | string | null
  accessTokenExpiresAt?: Prisma.DateTimeNullableFilter<"Account"> | Date | string | null
  refreshTokenExpiresAt?: Prisma.DateTimeNullableFilter<"Account"> | Date | string | null
  scope?: Prisma.StringNullableFilter<"Account"> | string | null
  password?: Prisma.StringNullableFilter<"Account"> | string | null
  createdAt?: Prisma.DateTimeFilter<"Account"> | Date | string
  updatedAt?: Prisma.DateTimeFilter<"Account"> | Date | string
  user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>
}

export type AccountOrderByWithRelationInput = {
  id?: Prisma.SortOrder
  accountId?: Prisma.SortOrder
  providerId?: Prisma.SortOrder
  userId?: Prisma.SortOrder
  accessToken?: Prisma.SortOrderInput | Prisma.SortOrder
  refreshToken?: Prisma.SortOrderInput | Prisma.SortOrder
  idToken?: Prisma.SortOrderInput | Prisma.SortOrder
  accessTokenExpiresAt?: Prisma.SortOrderInput | Prisma.SortOrder
  refreshTokenExpiresAt?: Prisma.SortOrderInput | Prisma.SortOrder
  scope?: Prisma.SortOrderInput | Prisma.SortOrder
  password?: Prisma.SortOrderInput | Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
  user?: Prisma.UserOrderByWithRelationInput
}

export type AccountWhereUniqueInput = Prisma.AtLeast<{
  id?: string
  AND?: Prisma.AccountWhereInput | Prisma.AccountWhereInput[]
  OR?: Prisma.AccountWhereInput[]
  NOT?: Prisma.AccountWhereInput | Prisma.AccountWhereInput[]
  accountId?: Prisma.StringFilter<"Account"> | string
  providerId?: Prisma.StringFilter<"Account"> | string
  userId?: Prisma.StringFilter<"Account"> | string
  accessToken?: Prisma.StringNullableFilter<"Account"> | string | null
  refreshToken?: Prisma.StringNullableFilter<"Account"> | string | null
  idToken?: Prisma.StringNullableFilter<"Account"> | string | null
  accessTokenExpiresAt?: Prisma.DateTimeNullableFilter<"Account"> | Date | string | null
  refreshTokenExpiresAt?: Prisma.DateTimeNullableFilter<"Account"> | Date | string | null
  scope?: Prisma.StringNullableFilter<"Account"> | string | null
  password?: Prisma.StringNullableFilter<"Account"> | string | null
  createdAt?: Prisma.DateTimeFilter<"Account"> | Date | string
  updatedAt?: Prisma.DateTimeFilter<"Account"> | Date | string
  user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>
}, "id">

export type AccountOrderByWithAggregationInput = {
  id?: Prisma.SortOrder
  accountId?: Prisma.SortOrder
  providerId?: Prisma.SortOrder
  userId?: Prisma.SortOrder
  accessToken?: Prisma.SortOrderInput | Prisma.SortOrder
  refreshToken?: Prisma.SortOrderInput | Prisma.SortOrder
  idToken?: Prisma.SortOrderInput | Prisma.SortOrder
  accessTokenExpiresAt?: Prisma.SortOrderInput | Prisma.SortOrder
  refreshTokenExpiresAt?: Prisma.SortOrderInput | Prisma.SortOrder
  scope?: Prisma.SortOrderInput | Prisma.SortOrder
  password?: Prisma.SortOrderInput | Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
  _count?: Prisma.AccountCountOrderByAggregateInput
  _max?: Prisma.AccountMaxOrderByAggregateInput
  _min?: Prisma.AccountMinOrderByAggregateInput
}

export type AccountScalarWhereWithAggregatesInput = {
  AND?: Prisma.AccountScalarWhereWithAggregatesInput | Prisma.AccountScalarWhereWithAggregatesInput[]
  OR?: Prisma.AccountScalarWhereWithAggregatesInput[]
  NOT?: Prisma.AccountScalarWhereWithAggregatesInput | Prisma.AccountScalarWhereWithAggregatesInput[]
  id?: Prisma.StringWithAggregatesFilter<"Account"> | string
  accountId?: Prisma.StringWithAggregatesFilter<"Account"> | string
  providerId?: Prisma.StringWithAggregatesFilter<"Account"> | string
  userId?: Prisma.StringWithAggregatesFilter<"Account"> | string
  accessToken?: Prisma.StringNullableWithAggregatesFilter<"Account"> | string | null
  refreshToken?: Prisma.StringNullableWithAggregatesFilter<"Account"> | string | null
  idToken?: Prisma.StringNullableWithAggregatesFilter<"Account"> | string | null
  accessTokenExpiresAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Account"> | Date | string | null
  refreshTokenExpiresAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Account"> | Date | string | null
  scope?: Prisma.StringNullableWithAggregatesFilter<"Account"> | string | null
  password?: Prisma.StringNullableWithAggregatesFilter<"Account"> | string | null
  createdAt?: Prisma.DateTimeWithAggregatesFilter<"Account"> | Date | string
  updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Account"> | Date | string
}

export type AccountCreateInput = {
  id: string
  accountId: string
  providerId: string
  accessToken?: string | null
  refreshToken?: string | null
  idToken?: string | null
  accessTokenExpiresAt?: Date | string | null
  refreshTokenExpiresAt?: Date | string | null
  scope?: string | null
  password?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  user: Prisma.UserCreateNestedOneWithoutAccountsInput
}

export type AccountUncheckedCreateInput = {
  id: string
  accountId: string
  providerId: string
  userId: string
  accessToken?: string | null
  refreshToken?: string | null
  idToken?: string | null
  accessTokenExpiresAt?: Date | string | null
  refreshTokenExpiresAt?: Date | string | null
  scope?: string | null
  password?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type AccountUpdateInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  accountId?: Prisma.StringFieldUpdateOperationsInput | string
  providerId?: Prisma.StringFieldUpdateOperationsInput | string
  accessToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  idToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  accessTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  scope?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  password?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  user?: Prisma.UserUpdateOneRequiredWithoutAccountsNestedInput
}

export type AccountUncheckedUpdateInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  accountId?: Prisma.StringFieldUpdateOperationsInput | string
  providerId?: Prisma.StringFieldUpdateOperationsInput | string
  userId?: Prisma.StringFieldUpdateOperationsInput | string
  accessToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  idToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  accessTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  scope?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  password?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type AccountCreateManyInput = {
  id: string
  accountId: string
  providerId: string
  userId: string
  accessToken?: string | null
  refreshToken?: string | null
  idToken?: string | null
  accessTokenExpiresAt?: Date | string | null
  refreshTokenExpiresAt?: Date | string | null
  scope?: string | null
  password?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type AccountUpdateManyMutationInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  accountId?: Prisma.StringFieldUpdateOperationsInput | string
  providerId?: Prisma.StringFieldUpdateOperationsInput | string
  accessToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  idToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  accessTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  scope?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  password?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type AccountUncheckedUpdateManyInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  accountId?: Prisma.StringFieldUpdateOperationsInput | string
  providerId?: Prisma.StringFieldUpdateOperationsInput | string
  userId?: Prisma.StringFieldUpdateOperationsInput | string
  accessToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  idToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  accessTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  scope?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  password?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type AccountListRelationFilter = {
  every?: Prisma.AccountWhereInput
  some?: Prisma.AccountWhereInput
  none?: Prisma.AccountWhereInput
}

export type AccountOrderByRelationAggregateInput = {
  _count?: Prisma.SortOrder
}

export type AccountCountOrderByAggregateInput = {
  id?: Prisma.SortOrder
  accountId?: Prisma.SortOrder
  providerId?: Prisma.SortOrder
  userId?: Prisma.SortOrder
  accessToken?: Prisma.SortOrder
  refreshToken?: Prisma.SortOrder
  idToken?: Prisma.SortOrder
  accessTokenExpiresAt?: Prisma.SortOrder
  refreshTokenExpiresAt?: Prisma.SortOrder
  scope?: Prisma.SortOrder
  password?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
}

export type AccountMaxOrderByAggregateInput = {
  id?: Prisma.SortOrder
  accountId?: Prisma.SortOrder
  providerId?: Prisma.SortOrder
  userId?: Prisma.SortOrder
  accessToken?: Prisma.SortOrder
  refreshToken?: Prisma.SortOrder
  idToken?: Prisma.SortOrder
  accessTokenExpiresAt?: Prisma.SortOrder
  refreshTokenExpiresAt?: Prisma.SortOrder
  scope?: Prisma.SortOrder
  password?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
}

export type AccountMinOrderByAggregateInput = {
  id?: Prisma.SortOrder
  accountId?: Prisma.SortOrder
  providerId?: Prisma.SortOrder
  userId?: Prisma.SortOrder
  accessToken?: Prisma.SortOrder
  refreshToken?: Prisma.SortOrder
  idToken?: Prisma.SortOrder
  accessTokenExpiresAt?: Prisma.SortOrder
  refreshTokenExpiresAt?: Prisma.SortOrder
  scope?: Prisma.SortOrder
  password?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
}

export type AccountCreateNestedManyWithoutUserInput = {
  create?: Prisma.XOR<Prisma.AccountCreateWithoutUserInput, Prisma.AccountUncheckedCreateWithoutUserInput> | Prisma.AccountCreateWithoutUserInput[] | Prisma.AccountUncheckedCreateWithoutUserInput[]
  connectOrCreate?: Prisma.AccountCreateOrConnectWithoutUserInput | Prisma.AccountCreateOrConnectWithoutUserInput[]
  createMany?: Prisma.AccountCreateManyUserInputEnvelope
  connect?: Prisma.AccountWhereUniqueInput | Prisma.AccountWhereUniqueInput[]
}

export type AccountUncheckedCreateNestedManyWithoutUserInput = {
  create?: Prisma.XOR<Prisma.AccountCreateWithoutUserInput, Prisma.AccountUncheckedCreateWithoutUserInput> | Prisma.AccountCreateWithoutUserInput[] | Prisma.AccountUncheckedCreateWithoutUserInput[]
  connectOrCreate?: Prisma.AccountCreateOrConnectWithoutUserInput | Prisma.AccountCreateOrConnectWithoutUserInput[]
  createMany?: Prisma.AccountCreateManyUserInputEnvelope
  connect?: Prisma.AccountWhereUniqueInput | Prisma.AccountWhereUniqueInput[]
}

export type AccountUpdateManyWithoutUserNestedInput = {
  create?: Prisma.XOR<Prisma.AccountCreateWithoutUserInput, Prisma.AccountUncheckedCreateWithoutUserInput> | Prisma.AccountCreateWithoutUserInput[] | Prisma.AccountUncheckedCreateWithoutUserInput[]
  connectOrCreate?: Prisma.AccountCreateOrConnectWithoutUserInput | Prisma.AccountCreateOrConnectWithoutUserInput[]
  upsert?: Prisma.AccountUpsertWithWhereUniqueWithoutUserInput | Prisma.AccountUpsertWithWhereUniqueWithoutUserInput[]
  createMany?: Prisma.AccountCreateManyUserInputEnvelope
  set?: Prisma.AccountWhereUniqueInput | Prisma.AccountWhereUniqueInput[]
  disconnect?: Prisma.AccountWhereUniqueInput | Prisma.AccountWhereUniqueInput[]
  delete?: Prisma.AccountWhereUniqueInput | Prisma.AccountWhereUniqueInput[]
  connect?: Prisma.AccountWhereUniqueInput | Prisma.AccountWhereUniqueInput[]
  update?: Prisma.AccountUpdateWithWhereUniqueWithoutUserInput | Prisma.AccountUpdateWithWhereUniqueWithoutUserInput[]
  updateMany?: Prisma.AccountUpdateManyWithWhereWithoutUserInput | Prisma.AccountUpdateManyWithWhereWithoutUserInput[]
  deleteMany?: Prisma.AccountScalarWhereInput | Prisma.AccountScalarWhereInput[]
}

export type AccountUncheckedUpdateManyWithoutUserNestedInput = {
  create?: Prisma.XOR<Prisma.AccountCreateWithoutUserInput, Prisma.AccountUncheckedCreateWithoutUserInput> | Prisma.AccountCreateWithoutUserInput[] | Prisma.AccountUncheckedCreateWithoutUserInput[]
  connectOrCreate?: Prisma.AccountCreateOrConnectWithoutUserInput | Prisma.AccountCreateOrConnectWithoutUserInput[]
  upsert?: Prisma.AccountUpsertWithWhereUniqueWithoutUserInput | Prisma.AccountUpsertWithWhereUniqueWithoutUserInput[]
  createMany?: Prisma.AccountCreateManyUserInputEnvelope
  set?: Prisma.AccountWhereUniqueInput | Prisma.AccountWhereUniqueInput[]
  disconnect?: Prisma.AccountWhereUniqueInput | Prisma.AccountWhereUniqueInput[]
  delete?: Prisma.AccountWhereUniqueInput | Prisma.AccountWhereUniqueInput[]
  connect?: Prisma.AccountWhereUniqueInput | Prisma.AccountWhereUniqueInput[]
  update?: Prisma.AccountUpdateWithWhereUniqueWithoutUserInput | Prisma.AccountUpdateWithWhereUniqueWithoutUserInput[]
  updateMany?: Prisma.AccountUpdateManyWithWhereWithoutUserInput | Prisma.AccountUpdateManyWithWhereWithoutUserInput[]
  deleteMany?: Prisma.AccountScalarWhereInput | Prisma.AccountScalarWhereInput[]
}

export type NullableDateTimeFieldUpdateOperationsInput = {
  set?: Date | string | null
}

export type AccountCreateWithoutUserInput = {
  id: string
  accountId: string
  providerId: string
  accessToken?: string | null
  refreshToken?: string | null
  idToken?: string | null
  accessTokenExpiresAt?: Date | string | null
  refreshTokenExpiresAt?: Date | string | null
  scope?: string | null
  password?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type AccountUncheckedCreateWithoutUserInput = {
  id: string
  accountId: string
  providerId: string
  accessToken?: string | null
  refreshToken?: string | null
  idToken?: string | null
  accessTokenExpiresAt?: Date | string | null
  refreshTokenExpiresAt?: Date | string | null
  scope?: string | null
  password?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type AccountCreateOrConnectWithoutUserInput = {
  where: Prisma.AccountWhereUniqueInput
  create: Prisma.XOR<Prisma.AccountCreateWithoutUserInput, Prisma.AccountUncheckedCreateWithoutUserInput>
}

export type AccountCreateManyUserInputEnvelope = {
  data: Prisma.AccountCreateManyUserInput | Prisma.AccountCreateManyUserInput[]
  skipDuplicates?: boolean
}

export type AccountUpsertWithWhereUniqueWithoutUserInput = {
  where: Prisma.AccountWhereUniqueInput
  update: Prisma.XOR<Prisma.AccountUpdateWithoutUserInput, Prisma.AccountUncheckedUpdateWithoutUserInput>
  create: Prisma.XOR<Prisma.AccountCreateWithoutUserInput, Prisma.AccountUncheckedCreateWithoutUserInput>
}

export type AccountUpdateWithWhereUniqueWithoutUserInput = {
  where: Prisma.AccountWhereUniqueInput
  data: Prisma.XOR<Prisma.AccountUpdateWithoutUserInput, Prisma.AccountUncheckedUpdateWithoutUserInput>
}

export type AccountUpdateManyWithWhereWithoutUserInput = {
  where: Prisma.AccountScalarWhereInput
  data: Prisma.XOR<Prisma.AccountUpdateManyMutationInput, Prisma.AccountUncheckedUpdateManyWithoutUserInput>
}

export type AccountScalarWhereInput = {
  AND?: Prisma.AccountScalarWhereInput | Prisma.AccountScalarWhereInput[]
  OR?: Prisma.AccountScalarWhereInput[]
  NOT?: Prisma.AccountScalarWhereInput | Prisma.AccountScalarWhereInput[]
  id?: Prisma.StringFilter<"Account"> | string
  accountId?: Prisma.StringFilter<"Account"> | string
  providerId?: Prisma.StringFilter<"Account"> | string
  userId?: Prisma.StringFilter<"Account"> | string
  accessToken?: Prisma.StringNullableFilter<"Account"> | string | null
  refreshToken?: Prisma.StringNullableFilter<"Account"> | string | null
  idToken?: Prisma.StringNullableFilter<"Account"> | string | null
  accessTokenExpiresAt?: Prisma.DateTimeNullableFilter<"Account"> | Date | string | null
  refreshTokenExpiresAt?: Prisma.DateTimeNullableFilter<"Account"> | Date | string | null
  scope?: Prisma.StringNullableFilter<"Account"> | string | null
  password?: Prisma.StringNullableFilter<"Account"> | string | null
  createdAt?: Prisma.DateTimeFilter<"Account"> | Date | string
  updatedAt?: Prisma.DateTimeFilter<"Account"> | Date | string
}

export type AccountCreateManyUserInput = {
  id: string
  accountId: string
  providerId: string
  accessToken?: string | null
  refreshToken?: string | null
  idToken?: string | null
  accessTokenExpiresAt?: Date | string | null
  refreshTokenExpiresAt?: Date | string | null
  scope?: string | null
  password?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type AccountUpdateWithoutUserInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  accountId?: Prisma.StringFieldUpdateOperationsInput | string
  providerId?: Prisma.StringFieldUpdateOperationsInput | string
  accessToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  idToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  accessTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  scope?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  password?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type AccountUncheckedUpdateWithoutUserInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  accountId?: Prisma.StringFieldUpdateOperationsInput | string
  providerId?: Prisma.StringFieldUpdateOperationsInput | string
  accessToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  idToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  accessTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  scope?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  password?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type AccountUncheckedUpdateManyWithoutUserInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  accountId?: Prisma.StringFieldUpdateOperationsInput | string
  providerId?: Prisma.StringFieldUpdateOperationsInput | string
  accessToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  idToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  accessTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  scope?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  password?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}



export type AccountSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  accountId?: boolean
  providerId?: boolean
  userId?: boolean
  accessToken?: boolean
  refreshToken?: boolean
  idToken?: boolean
  accessTokenExpiresAt?: boolean
  refreshTokenExpiresAt?: boolean
  scope?: boolean
  password?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}, ExtArgs["result"]["account"]>

export type AccountSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  accountId?: boolean
  providerId?: boolean
  userId?: boolean
  accessToken?: boolean
  refreshToken?: boolean
  idToken?: boolean
  accessTokenExpiresAt?: boolean
  refreshTokenExpiresAt?: boolean
  scope?: boolean
  password?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}, ExtArgs["result"]["account"]>

export type AccountSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  accountId?: boolean
  providerId?: boolean
  userId?: boolean
  accessToken?: boolean
  refreshToken?: boolean
  idToken?: boolean
  accessTokenExpiresAt?: boolean
  refreshTokenExpiresAt?: boolean
  scope?: boolean
  password?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}, ExtArgs["result"]["account"]>

export type AccountSelectScalar = {
  id?: boolean
  accountId?: boolean
  providerId?: boolean
  userId?: boolean
  accessToken?: boolean
  refreshToken?: boolean
  idToken?: boolean
  accessTokenExpiresAt?: boolean
  refreshTokenExpiresAt?: boolean
  scope?: boolean
  password?: boolean
  createdAt?: boolean
  updatedAt?: boolean
}

export type AccountOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "accountId" | "providerId" | "userId" | "accessToken" | "refreshToken" | "idToken" | "accessTokenExpiresAt" | "refreshTokenExpiresAt" | "scope" | "password" | "createdAt" | "updatedAt", ExtArgs["result"]["account"]>
export type AccountInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}
export type AccountIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}
export type AccountIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}

export type $AccountPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  name: "Account"
  objects: {
    user: Prisma.$UserPayload<ExtArgs>
  }
  scalars: runtime.Types.Extensions.GetPayloadResult<{
    id: string
    accountId: string
    providerId: string
    userId: string
    accessToken: string | null
    refreshToken: string | null
    idToken: string | null
    accessTokenExpiresAt: Date | null
    refreshTokenExpiresAt: Date | null
    scope: string | null
    password: string | null
    createdAt: Date
    updatedAt: Date
  }, ExtArgs["result"]["account"]>
  composites: {}
}

export type AccountGetPayload<S extends boolean | null | undefined | AccountDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AccountPayload, S>

export type AccountCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> =
  Omit<AccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AccountCountAggregateInputType | true
  }

export interface AccountDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Account'], meta: { name: 'Account' } }
  /**
   * Find zero or one Account that matches the filter.
   * @param {AccountFindUniqueArgs} args - Arguments to find a Account
   * @example
   * // Get one Account
   * const account = await prisma.account.findUnique({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUnique<T extends AccountFindUniqueArgs>(args: Prisma.SelectSubset<T, AccountFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AccountClient<runtime.Types.Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

  /**
   * Find one Account that matches the filter or throw an error with `error.code='P2025'`
   * if no matches were found.
   * @param {AccountFindUniqueOrThrowArgs} args - Arguments to find a Account
   * @example
   * // Get one Account
   * const account = await prisma.account.findUniqueOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUniqueOrThrow<T extends AccountFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AccountClient<runtime.Types.Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Find the first Account that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountFindFirstArgs} args - Arguments to find a Account
   * @example
   * // Get one Account
   * const account = await prisma.account.findFirst({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirst<T extends AccountFindFirstArgs>(args?: Prisma.SelectSubset<T, AccountFindFirstArgs<ExtArgs>>): Prisma.Prisma__AccountClient<runtime.Types.Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

  /**
   * Find the first Account that matches the filter or
   * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountFindFirstOrThrowArgs} args - Arguments to find a Account
   * @example
   * // Get one Account
   * const account = await prisma.account.findFirstOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirstOrThrow<T extends AccountFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AccountFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AccountClient<runtime.Types.Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Find zero or more Accounts that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountFindManyArgs} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Accounts
   * const accounts = await prisma.account.findMany()
   * 
   * // Get first 10 Accounts
   * const accounts = await prisma.account.findMany({ take: 10 })
   * 
   * // Only select the `id`
   * const accountWithIdOnly = await prisma.account.findMany({ select: { id: true } })
   * 
   */
  findMany<T extends AccountFindManyArgs>(args?: Prisma.SelectSubset<T, AccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

  /**
   * Create a Account.
   * @param {AccountCreateArgs} args - Arguments to create a Account.
   * @example
   * // Create one Account
   * const Account = await prisma.account.create({
   *   data: {
   *     // ... data to create a Account
   *   }
   * })
   * 
   */
  create<T extends AccountCreateArgs>(args: Prisma.SelectSubset<T, AccountCreateArgs<ExtArgs>>): Prisma.Prisma__AccountClient<runtime.Types.Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Create many Accounts.
   * @param {AccountCreateManyArgs} args - Arguments to create many Accounts.
   * @example
   * // Create many Accounts
   * const account = await prisma.account.createMany({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *     
   */
  createMany<T extends AccountCreateManyArgs>(args?: Prisma.SelectSubset<T, AccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Create many Accounts and returns the data saved in the database.
   * @param {AccountCreateManyAndReturnArgs} args - Arguments to create many Accounts.
   * @example
   * // Create many Accounts
   * const account = await prisma.account.createManyAndReturn({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * 
   * // Create many Accounts and only return the `id`
   * const accountWithIdOnly = await prisma.account.createManyAndReturn({
   *   select: { id: true },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * 
   */
  createManyAndReturn<T extends AccountCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

  /**
   * Delete a Account.
   * @param {AccountDeleteArgs} args - Arguments to delete one Account.
   * @example
   * // Delete one Account
   * const Account = await prisma.account.delete({
   *   where: {
   *     // ... filter to delete one Account
   *   }
   * })
   * 
   */
  delete<T extends AccountDeleteArgs>(args: Prisma.SelectSubset<T, AccountDeleteArgs<ExtArgs>>): Prisma.Prisma__AccountClient<runtime.Types.Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Update one Account.
   * @param {AccountUpdateArgs} args - Arguments to update one Account.
   * @example
   * // Update one Account
   * const account = await prisma.account.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
   */
  update<T extends AccountUpdateArgs>(args: Prisma.SelectSubset<T, AccountUpdateArgs<ExtArgs>>): Prisma.Prisma__AccountClient<runtime.Types.Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Delete zero or more Accounts.
   * @param {AccountDeleteManyArgs} args - Arguments to filter Accounts to delete.
   * @example
   * // Delete a few Accounts
   * const { count } = await prisma.account.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
   */
  deleteMany<T extends AccountDeleteManyArgs>(args?: Prisma.SelectSubset<T, AccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Update zero or more Accounts.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Accounts
   * const account = await prisma.account.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
   */
  updateMany<T extends AccountUpdateManyArgs>(args: Prisma.SelectSubset<T, AccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Update zero or more Accounts and returns the data updated in the database.
   * @param {AccountUpdateManyAndReturnArgs} args - Arguments to update many Accounts.
   * @example
   * // Update many Accounts
   * const account = await prisma.account.updateManyAndReturn({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * 
   * // Update zero or more Accounts and only return the `id`
   * const accountWithIdOnly = await prisma.account.updateManyAndReturn({
   *   select: { id: true },
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * 
   */
  updateManyAndReturn<T extends AccountUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

  /**
   * Create or update one Account.
   * @param {AccountUpsertArgs} args - Arguments to update or create a Account.
   * @example
   * // Update or create a Account
   * const account = await prisma.account.upsert({
   *   create: {
   *     // ... data to create a Account
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Account we want to update
   *   }
   * })
   */
  upsert<T extends AccountUpsertArgs>(args: Prisma.SelectSubset<T, AccountUpsertArgs<ExtArgs>>): Prisma.Prisma__AccountClient<runtime.Types.Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


  /**
   * Count the number of Accounts.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountCountArgs} args - Arguments to filter Accounts to count.
   * @example
   * // Count the number of Accounts
   * const count = await prisma.account.count({
   *   where: {
   *     // ... the filter for the Accounts we want to count
   *   }
   * })
  **/
  count<T extends AccountCountArgs>(
    args?: Prisma.Subset<T, AccountCountArgs>,
  ): Prisma.PrismaPromise<
    T extends runtime.Types.Utils.Record<'select', any>
      ? T['select'] extends true
        ? number
        : Prisma.GetScalarType<T['select'], AccountCountAggregateOutputType>
      : number
  >

  /**
   * Allows you to perform aggregations operations on a Account.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
   * @example
   * // Ordered by age ascending
   * // Where email contains prisma.io
   * // Limited to the 10 users
   * const aggregations = await prisma.user.aggregate({
   *   _avg: {
   *     age: true,
   *   },
   *   where: {
   *     email: {
   *       contains: "prisma.io",
   *     },
   *   },
   *   orderBy: {
   *     age: "asc",
   *   },
   *   take: 10,
   * })
  **/
  aggregate<T extends AccountAggregateArgs>(args: Prisma.Subset<T, AccountAggregateArgs>): Prisma.PrismaPromise<GetAccountAggregateType<T>>

  /**
   * Group by Account.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {AccountGroupByArgs} args - Group by arguments.
   * @example
   * // Group by city, order by createdAt, get count
   * const result = await prisma.user.groupBy({
   *   by: ['city', 'createdAt'],
   *   orderBy: {
   *     createdAt: true
   *   },
   *   _count: {
   *     _all: true
   *   },
   * })
   * 
  **/
  groupBy<
    T extends AccountGroupByArgs,
    HasSelectOrTake extends Prisma.Or<
      Prisma.Extends<'skip', Prisma.Keys<T>>,
      Prisma.Extends<'take', Prisma.Keys<T>>
    >,
    OrderByArg extends Prisma.True extends HasSelectOrTake
      ? { orderBy: AccountGroupByArgs['orderBy'] }
      : { orderBy?: AccountGroupByArgs['orderBy'] },
    OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>,
    ByFields extends Prisma.MaybeTupleToUnion<T['by']>,
    ByValid extends Prisma.Has<ByFields, OrderFields>,
    HavingFields extends Prisma.GetHavingFields<T['having']>,
    HavingValid extends Prisma.Has<ByFields, HavingFields>,
    ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False,
    InputErrors extends ByEmpty extends Prisma.True
    ? `Error: "by" must not be empty.`
    : HavingValid extends Prisma.False
    ? {
        [P in HavingFields]: P extends ByFields
          ? never
          : P extends string
          ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
          : [
              Error,
              'Field ',
              P,
              ` in "having" needs to be provided in "by"`,
            ]
      }[HavingFields]
    : 'take' extends Prisma.Keys<T>
    ? 'orderBy' extends Prisma.Keys<T>
      ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
              ? never
              : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
          }[OrderFields]
      : 'Error: If you provide "take", you also need to provide "orderBy"'
    : 'skip' extends Prisma.Keys<T>
    ? 'orderBy' extends Prisma.Keys<T>
      ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
              ? never
              : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
          }[OrderFields]
      : 'Error: If you provide "skip", you also need to provide "orderBy"'
    : ByValid extends Prisma.True
    ? {}
    : {
        [P in OrderFields]: P extends ByFields
          ? never
          : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
      }[OrderFields]
  >(args: Prisma.SubsetIntersection<T, AccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
/**
 * Fields of the Account model
 */
readonly fields: AccountFieldRefs;
}

/**
 * The delegate class that acts as a "Promise-like" for Account.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__AccountClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
  readonly [Symbol.toStringTag]: "PrismaPromise"
  user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>
}




/**
 * Fields of the Account model
 */
export interface AccountFieldRefs {
  readonly id: Prisma.FieldRef<"Account", 'String'>
  readonly accountId: Prisma.FieldRef<"Account", 'String'>
  readonly providerId: Prisma.FieldRef<"Account", 'String'>
  readonly userId: Prisma.FieldRef<"Account", 'String'>
  readonly accessToken: Prisma.FieldRef<"Account", 'String'>
  readonly refreshToken: Prisma.FieldRef<"Account", 'String'>
  readonly idToken: Prisma.FieldRef<"Account", 'String'>
  readonly accessTokenExpiresAt: Prisma.FieldRef<"Account", 'DateTime'>
  readonly refreshTokenExpiresAt: Prisma.FieldRef<"Account", 'DateTime'>
  readonly scope: Prisma.FieldRef<"Account", 'String'>
  readonly password: Prisma.FieldRef<"Account", 'String'>
  readonly createdAt: Prisma.FieldRef<"Account", 'DateTime'>
  readonly updatedAt: Prisma.FieldRef<"Account", 'DateTime'>
}
    

// Custom InputTypes
/**
 * Account findUnique
 */
export type AccountFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: Prisma.AccountSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Account
   */
  omit?: Prisma.AccountOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.AccountInclude<ExtArgs> | null
  /**
   * Filter, which Account to fetch.
   */
  where: Prisma.AccountWhereUniqueInput
}

/**
 * Account findUniqueOrThrow
 */
export type AccountFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: Prisma.AccountSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Account
   */
  omit?: Prisma.AccountOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.AccountInclude<ExtArgs> | null
  /**
   * Filter, which Account to fetch.
   */
  where: Prisma.AccountWhereUniqueInput
}

/**
 * Account findFirst
 */
export type AccountFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: Prisma.AccountSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Account
   */
  omit?: Prisma.AccountOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.AccountInclude<ExtArgs> | null
  /**
   * Filter, which Account to fetch.
   */
  where?: Prisma.AccountWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Accounts to fetch.
   */
  orderBy?: Prisma.AccountOrderByWithRelationInput | Prisma.AccountOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for searching for Accounts.
   */
  cursor?: Prisma.AccountWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Accounts from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Accounts.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   * 
   * Filter by unique combinations of Accounts.
   */
  distinct?: Prisma.AccountScalarFieldEnum | Prisma.AccountScalarFieldEnum[]
}

/**
 * Account findFirstOrThrow
 */
export type AccountFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: Prisma.AccountSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Account
   */
  omit?: Prisma.AccountOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.AccountInclude<ExtArgs> | null
  /**
   * Filter, which Account to fetch.
   */
  where?: Prisma.AccountWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Accounts to fetch.
   */
  orderBy?: Prisma.AccountOrderByWithRelationInput | Prisma.AccountOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for searching for Accounts.
   */
  cursor?: Prisma.AccountWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Accounts from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Accounts.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   * 
   * Filter by unique combinations of Accounts.
   */
  distinct?: Prisma.AccountScalarFieldEnum | Prisma.AccountScalarFieldEnum[]
}

/**
 * Account findMany
 */
export type AccountFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: Prisma.AccountSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Account
   */
  omit?: Prisma.AccountOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.AccountInclude<ExtArgs> | null
  /**
   * Filter, which Accounts to fetch.
   */
  where?: Prisma.AccountWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Accounts to fetch.
   */
  orderBy?: Prisma.AccountOrderByWithRelationInput | Prisma.AccountOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for listing Accounts.
   */
  cursor?: Prisma.AccountWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Accounts from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Accounts.
   */
  skip?: number
  distinct?: Prisma.AccountScalarFieldEnum | Prisma.AccountScalarFieldEnum[]
}

/**
 * Account create
 */
export type AccountCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: Prisma.AccountSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Account
   */
  omit?: Prisma.AccountOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.AccountInclude<ExtArgs> | null
  /**
   * The data needed to create a Account.
   */
  data: Prisma.XOR<Prisma.AccountCreateInput, Prisma.AccountUncheckedCreateInput>
}

/**
 * Account createMany
 */
export type AccountCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to create many Accounts.
   */
  data: Prisma.AccountCreateManyInput | Prisma.AccountCreateManyInput[]
  skipDuplicates?: boolean
}

/**
 * Account createManyAndReturn
 */
export type AccountCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: Prisma.AccountSelectCreateManyAndReturn<ExtArgs> | null
  /**
   * Omit specific fields from the Account
   */
  omit?: Prisma.AccountOmit<ExtArgs> | null
  /**
   * The data used to create many Accounts.
   */
  data: Prisma.AccountCreateManyInput | Prisma.AccountCreateManyInput[]
  skipDuplicates?: boolean
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.AccountIncludeCreateManyAndReturn<ExtArgs> | null
}

/**
 * Account update
 */
export type AccountUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: Prisma.AccountSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Account
   */
  omit?: Prisma.AccountOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.AccountInclude<ExtArgs> | null
  /**
   * The data needed to update a Account.
   */
  data: Prisma.XOR<Prisma.AccountUpdateInput, Prisma.AccountUncheckedUpdateInput>
  /**
   * Choose, which Account to update.
   */
  where: Prisma.AccountWhereUniqueInput
}

/**
 * Account updateMany
 */
export type AccountUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to update Accounts.
   */
  data: Prisma.XOR<Prisma.AccountUpdateManyMutationInput, Prisma.AccountUncheckedUpdateManyInput>
  /**
   * Filter which Accounts to update
   */
  where?: Prisma.AccountWhereInput
  /**
   * Limit how many Accounts to update.
   */
  limit?: number
}

/**
 * Account updateManyAndReturn
 */
export type AccountUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: Prisma.AccountSelectUpdateManyAndReturn<ExtArgs> | null
  /**
   * Omit specific fields from the Account
   */
  omit?: Prisma.AccountOmit<ExtArgs> | null
  /**
   * The data used to update Accounts.
   */
  data: Prisma.XOR<Prisma.AccountUpdateManyMutationInput, Prisma.AccountUncheckedUpdateManyInput>
  /**
   * Filter which Accounts to update
   */
  where?: Prisma.AccountWhereInput
  /**
   * Limit how many Accounts to update.
   */
  limit?: number
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.AccountIncludeUpdateManyAndReturn<ExtArgs> | null
}

/**
 * Account upsert
 */
export type AccountUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: Prisma.AccountSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Account
   */
  omit?: Prisma.AccountOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.AccountInclude<ExtArgs> | null
  /**
   * The filter to search for the Account to update in case it exists.
   */
  where: Prisma.AccountWhereUniqueInput
  /**
   * In case the Account found by the `where` argument doesn't exist, create a new Account with this data.
   */
  create: Prisma.XOR<Prisma.AccountCreateInput, Prisma.AccountUncheckedCreateInput>
  /**
   * In case the Account was found with the provided `where` argument, update it with this data.
   */
  update: Prisma.XOR<Prisma.AccountUpdateInput, Prisma.AccountUncheckedUpdateInput>
}

/**
 * Account delete
 */
export type AccountDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: Prisma.AccountSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Account
   */
  omit?: Prisma.AccountOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.AccountInclude<ExtArgs> | null
  /**
   * Filter which Account to delete.
   */
  where: Prisma.AccountWhereUniqueInput
}

/**
 * Account deleteMany
 */
export type AccountDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Accounts to delete
   */
  where?: Prisma.AccountWhereInput
  /**
   * Limit how many Accounts to delete.
   */
  limit?: number
}

/**
 * Account without action
 */
export type AccountDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: Prisma.AccountSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Account
   */
  omit?: Prisma.AccountOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.AccountInclude<ExtArgs> | null
}
```

---

### `packages/db/prisma/generated/models/Invitation.ts`

```typescript

/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * This file exports the `Invitation` model and its related types.
 *
 * 🟢 You can import this file directly.
 */
import type * as runtime from "@prisma/client/runtime/client"
import type * as $Enums from "../enums"
import type * as Prisma from "../internal/prismaNamespace"

/**
 * Model Invitation
 * 
 */
export type InvitationModel = runtime.Types.Result.DefaultSelection<Prisma.$InvitationPayload>

export type AggregateInvitation = {
  _count: InvitationCountAggregateOutputType | null
  _min: InvitationMinAggregateOutputType | null
  _max: InvitationMaxAggregateOutputType | null
}

export type InvitationMinAggregateOutputType = {
  id: string | null
  email: string | null
  role: $Enums.Role | null
  expiresAt: Date | null
  inviterId: string | null
  status: string | null
  createdAt: Date | null
}

export type InvitationMaxAggregateOutputType = {
  id: string | null
  email: string | null
  role: $Enums.Role | null
  expiresAt: Date | null
  inviterId: string | null
  status: string | null
  createdAt: Date | null
}

export type InvitationCountAggregateOutputType = {
  id: number
  email: number
  role: number
  expiresAt: number
  inviterId: number
  status: number
  createdAt: number
  _all: number
}


export type InvitationMinAggregateInputType = {
  id?: true
  email?: true
  role?: true
  expiresAt?: true
  inviterId?: true
  status?: true
  createdAt?: true
}

export type InvitationMaxAggregateInputType = {
  id?: true
  email?: true
  role?: true
  expiresAt?: true
  inviterId?: true
  status?: true
  createdAt?: true
}

export type InvitationCountAggregateInputType = {
  id?: true
  email?: true
  role?: true
  expiresAt?: true
  inviterId?: true
  status?: true
  createdAt?: true
  _all?: true
}

export type InvitationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Invitation to aggregate.
   */
  where?: Prisma.InvitationWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Invitations to fetch.
   */
  orderBy?: Prisma.InvitationOrderByWithRelationInput | Prisma.InvitationOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the start position
   */
  cursor?: Prisma.InvitationWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Invitations from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Invitations.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Count returned Invitations
  **/
  _count?: true | InvitationCountAggregateInputType
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Select which fields to find the minimum value
  **/
  _min?: InvitationMinAggregateInputType
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Select which fields to find the maximum value
  **/
  _max?: InvitationMaxAggregateInputType
}

export type GetInvitationAggregateType<T extends InvitationAggregateArgs> = {
      [P in keyof T & keyof AggregateInvitation]: P extends '_count' | 'count'
    ? T[P] extends true
      ? number
      : Prisma.GetScalarType<T[P], AggregateInvitation[P]>
    : Prisma.GetScalarType<T[P], AggregateInvitation[P]>
}




export type InvitationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: Prisma.InvitationWhereInput
  orderBy?: Prisma.InvitationOrderByWithAggregationInput | Prisma.InvitationOrderByWithAggregationInput[]
  by: Prisma.InvitationScalarFieldEnum[] | Prisma.InvitationScalarFieldEnum
  having?: Prisma.InvitationScalarWhereWithAggregatesInput
  take?: number
  skip?: number
  _count?: InvitationCountAggregateInputType | true
  _min?: InvitationMinAggregateInputType
  _max?: InvitationMaxAggregateInputType
}

export type InvitationGroupByOutputType = {
  id: string
  email: string
  role: $Enums.Role
  expiresAt: Date
  inviterId: string
  status: string
  createdAt: Date
  _count: InvitationCountAggregateOutputType | null
  _min: InvitationMinAggregateOutputType | null
  _max: InvitationMaxAggregateOutputType | null
}

type GetInvitationGroupByPayload<T extends InvitationGroupByArgs> = Prisma.PrismaPromise<
  Array<
    Prisma.PickEnumerable<InvitationGroupByOutputType, T['by']> &
      {
        [P in ((keyof T) & (keyof InvitationGroupByOutputType))]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : Prisma.GetScalarType<T[P], InvitationGroupByOutputType[P]>
          : Prisma.GetScalarType<T[P], InvitationGroupByOutputType[P]>
      }
    >
  >



export type InvitationWhereInput = {
  AND?: Prisma.InvitationWhereInput | Prisma.InvitationWhereInput[]
  OR?: Prisma.InvitationWhereInput[]
  NOT?: Prisma.InvitationWhereInput | Prisma.InvitationWhereInput[]
  id?: Prisma.StringFilter<"Invitation"> | string
  email?: Prisma.StringFilter<"Invitation"> | string
  role?: Prisma.EnumRoleFilter<"Invitation"> | $Enums.Role
  expiresAt?: Prisma.DateTimeFilter<"Invitation"> | Date | string
  inviterId?: Prisma.StringFilter<"Invitation"> | string
  status?: Prisma.StringFilter<"Invitation"> | string
  createdAt?: Prisma.DateTimeFilter<"Invitation"> | Date | string
  user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>
}

export type InvitationOrderByWithRelationInput = {
  id?: Prisma.SortOrder
  email?: Prisma.SortOrder
  role?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  inviterId?: Prisma.SortOrder
  status?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  user?: Prisma.UserOrderByWithRelationInput
}

export type InvitationWhereUniqueInput = Prisma.AtLeast<{
  id?: string
  AND?: Prisma.InvitationWhereInput | Prisma.InvitationWhereInput[]
  OR?: Prisma.InvitationWhereInput[]
  NOT?: Prisma.InvitationWhereInput | Prisma.InvitationWhereInput[]
  email?: Prisma.StringFilter<"Invitation"> | string
  role?: Prisma.EnumRoleFilter<"Invitation"> | $Enums.Role
  expiresAt?: Prisma.DateTimeFilter<"Invitation"> | Date | string
  inviterId?: Prisma.StringFilter<"Invitation"> | string
  status?: Prisma.StringFilter<"Invitation"> | string
  createdAt?: Prisma.DateTimeFilter<"Invitation"> | Date | string
  user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>
}, "id">

export type InvitationOrderByWithAggregationInput = {
  id?: Prisma.SortOrder
  email?: Prisma.SortOrder
  role?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  inviterId?: Prisma.SortOrder
  status?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  _count?: Prisma.InvitationCountOrderByAggregateInput
  _max?: Prisma.InvitationMaxOrderByAggregateInput
  _min?: Prisma.InvitationMinOrderByAggregateInput
}

export type InvitationScalarWhereWithAggregatesInput = {
  AND?: Prisma.InvitationScalarWhereWithAggregatesInput | Prisma.InvitationScalarWhereWithAggregatesInput[]
  OR?: Prisma.InvitationScalarWhereWithAggregatesInput[]
  NOT?: Prisma.InvitationScalarWhereWithAggregatesInput | Prisma.InvitationScalarWhereWithAggregatesInput[]
  id?: Prisma.StringWithAggregatesFilter<"Invitation"> | string
  email?: Prisma.StringWithAggregatesFilter<"Invitation"> | string
  role?: Prisma.EnumRoleWithAggregatesFilter<"Invitation"> | $Enums.Role
  expiresAt?: Prisma.DateTimeWithAggregatesFilter<"Invitation"> | Date | string
  inviterId?: Prisma.StringWithAggregatesFilter<"Invitation"> | string
  status?: Prisma.StringWithAggregatesFilter<"Invitation"> | string
  createdAt?: Prisma.DateTimeWithAggregatesFilter<"Invitation"> | Date | string
}

export type InvitationCreateInput = {
  id?: string
  email: string
  role?: $Enums.Role
  expiresAt: Date | string
  status?: string
  createdAt?: Date | string
  user: Prisma.UserCreateNestedOneWithoutInvitationsInput
}

export type InvitationUncheckedCreateInput = {
  id?: string
  email: string
  role?: $Enums.Role
  expiresAt: Date | string
  inviterId: string
  status?: string
  createdAt?: Date | string
}

export type InvitationUpdateInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  status?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  user?: Prisma.UserUpdateOneRequiredWithoutInvitationsNestedInput
}

export type InvitationUncheckedUpdateInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  inviterId?: Prisma.StringFieldUpdateOperationsInput | string
  status?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type InvitationCreateManyInput = {
  id?: string
  email: string
  role?: $Enums.Role
  expiresAt: Date | string
  inviterId: string
  status?: string
  createdAt?: Date | string
}

export type InvitationUpdateManyMutationInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  status?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type InvitationUncheckedUpdateManyInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  inviterId?: Prisma.StringFieldUpdateOperationsInput | string
  status?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type InvitationListRelationFilter = {
  every?: Prisma.InvitationWhereInput
  some?: Prisma.InvitationWhereInput
  none?: Prisma.InvitationWhereInput
}

export type InvitationOrderByRelationAggregateInput = {
  _count?: Prisma.SortOrder
}

export type InvitationCountOrderByAggregateInput = {
  id?: Prisma.SortOrder
  email?: Prisma.SortOrder
  role?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  inviterId?: Prisma.SortOrder
  status?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
}

export type InvitationMaxOrderByAggregateInput = {
  id?: Prisma.SortOrder
  email?: Prisma.SortOrder
  role?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  inviterId?: Prisma.SortOrder
  status?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
}

export type InvitationMinOrderByAggregateInput = {
  id?: Prisma.SortOrder
  email?: Prisma.SortOrder
  role?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  inviterId?: Prisma.SortOrder
  status?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
}

export type InvitationCreateNestedManyWithoutUserInput = {
  create?: Prisma.XOR<Prisma.InvitationCreateWithoutUserInput, Prisma.InvitationUncheckedCreateWithoutUserInput> | Prisma.InvitationCreateWithoutUserInput[] | Prisma.InvitationUncheckedCreateWithoutUserInput[]
  connectOrCreate?: Prisma.InvitationCreateOrConnectWithoutUserInput | Prisma.InvitationCreateOrConnectWithoutUserInput[]
  createMany?: Prisma.InvitationCreateManyUserInputEnvelope
  connect?: Prisma.InvitationWhereUniqueInput | Prisma.InvitationWhereUniqueInput[]
}

export type InvitationUncheckedCreateNestedManyWithoutUserInput = {
  create?: Prisma.XOR<Prisma.InvitationCreateWithoutUserInput, Prisma.InvitationUncheckedCreateWithoutUserInput> | Prisma.InvitationCreateWithoutUserInput[] | Prisma.InvitationUncheckedCreateWithoutUserInput[]
  connectOrCreate?: Prisma.InvitationCreateOrConnectWithoutUserInput | Prisma.InvitationCreateOrConnectWithoutUserInput[]
  createMany?: Prisma.InvitationCreateManyUserInputEnvelope
  connect?: Prisma.InvitationWhereUniqueInput | Prisma.InvitationWhereUniqueInput[]
}

export type InvitationUpdateManyWithoutUserNestedInput = {
  create?: Prisma.XOR<Prisma.InvitationCreateWithoutUserInput, Prisma.InvitationUncheckedCreateWithoutUserInput> | Prisma.InvitationCreateWithoutUserInput[] | Prisma.InvitationUncheckedCreateWithoutUserInput[]
  connectOrCreate?: Prisma.InvitationCreateOrConnectWithoutUserInput | Prisma.InvitationCreateOrConnectWithoutUserInput[]
  upsert?: Prisma.InvitationUpsertWithWhereUniqueWithoutUserInput | Prisma.InvitationUpsertWithWhereUniqueWithoutUserInput[]
  createMany?: Prisma.InvitationCreateManyUserInputEnvelope
  set?: Prisma.InvitationWhereUniqueInput | Prisma.InvitationWhereUniqueInput[]
  disconnect?: Prisma.InvitationWhereUniqueInput | Prisma.InvitationWhereUniqueInput[]
  delete?: Prisma.InvitationWhereUniqueInput | Prisma.InvitationWhereUniqueInput[]
  connect?: Prisma.InvitationWhereUniqueInput | Prisma.InvitationWhereUniqueInput[]
  update?: Prisma.InvitationUpdateWithWhereUniqueWithoutUserInput | Prisma.InvitationUpdateWithWhereUniqueWithoutUserInput[]
  updateMany?: Prisma.InvitationUpdateManyWithWhereWithoutUserInput | Prisma.InvitationUpdateManyWithWhereWithoutUserInput[]
  deleteMany?: Prisma.InvitationScalarWhereInput | Prisma.InvitationScalarWhereInput[]
}

export type InvitationUncheckedUpdateManyWithoutUserNestedInput = {
  create?: Prisma.XOR<Prisma.InvitationCreateWithoutUserInput, Prisma.InvitationUncheckedCreateWithoutUserInput> | Prisma.InvitationCreateWithoutUserInput[] | Prisma.InvitationUncheckedCreateWithoutUserInput[]
  connectOrCreate?: Prisma.InvitationCreateOrConnectWithoutUserInput | Prisma.InvitationCreateOrConnectWithoutUserInput[]
  upsert?: Prisma.InvitationUpsertWithWhereUniqueWithoutUserInput | Prisma.InvitationUpsertWithWhereUniqueWithoutUserInput[]
  createMany?: Prisma.InvitationCreateManyUserInputEnvelope
  set?: Prisma.InvitationWhereUniqueInput | Prisma.InvitationWhereUniqueInput[]
  disconnect?: Prisma.InvitationWhereUniqueInput | Prisma.InvitationWhereUniqueInput[]
  delete?: Prisma.InvitationWhereUniqueInput | Prisma.InvitationWhereUniqueInput[]
  connect?: Prisma.InvitationWhereUniqueInput | Prisma.InvitationWhereUniqueInput[]
  update?: Prisma.InvitationUpdateWithWhereUniqueWithoutUserInput | Prisma.InvitationUpdateWithWhereUniqueWithoutUserInput[]
  updateMany?: Prisma.InvitationUpdateManyWithWhereWithoutUserInput | Prisma.InvitationUpdateManyWithWhereWithoutUserInput[]
  deleteMany?: Prisma.InvitationScalarWhereInput | Prisma.InvitationScalarWhereInput[]
}

export type InvitationCreateWithoutUserInput = {
  id?: string
  email: string
  role?: $Enums.Role
  expiresAt: Date | string
  status?: string
  createdAt?: Date | string
}

export type InvitationUncheckedCreateWithoutUserInput = {
  id?: string
  email: string
  role?: $Enums.Role
  expiresAt: Date | string
  status?: string
  createdAt?: Date | string
}

export type InvitationCreateOrConnectWithoutUserInput = {
  where: Prisma.InvitationWhereUniqueInput
  create: Prisma.XOR<Prisma.InvitationCreateWithoutUserInput, Prisma.InvitationUncheckedCreateWithoutUserInput>
}

export type InvitationCreateManyUserInputEnvelope = {
  data: Prisma.InvitationCreateManyUserInput | Prisma.InvitationCreateManyUserInput[]
  skipDuplicates?: boolean
}

export type InvitationUpsertWithWhereUniqueWithoutUserInput = {
  where: Prisma.InvitationWhereUniqueInput
  update: Prisma.XOR<Prisma.InvitationUpdateWithoutUserInput, Prisma.InvitationUncheckedUpdateWithoutUserInput>
  create: Prisma.XOR<Prisma.InvitationCreateWithoutUserInput, Prisma.InvitationUncheckedCreateWithoutUserInput>
}

export type InvitationUpdateWithWhereUniqueWithoutUserInput = {
  where: Prisma.InvitationWhereUniqueInput
  data: Prisma.XOR<Prisma.InvitationUpdateWithoutUserInput, Prisma.InvitationUncheckedUpdateWithoutUserInput>
}

export type InvitationUpdateManyWithWhereWithoutUserInput = {
  where: Prisma.InvitationScalarWhereInput
  data: Prisma.XOR<Prisma.InvitationUpdateManyMutationInput, Prisma.InvitationUncheckedUpdateManyWithoutUserInput>
}

export type InvitationScalarWhereInput = {
  AND?: Prisma.InvitationScalarWhereInput | Prisma.InvitationScalarWhereInput[]
  OR?: Prisma.InvitationScalarWhereInput[]
  NOT?: Prisma.InvitationScalarWhereInput | Prisma.InvitationScalarWhereInput[]
  id?: Prisma.StringFilter<"Invitation"> | string
  email?: Prisma.StringFilter<"Invitation"> | string
  role?: Prisma.EnumRoleFilter<"Invitation"> | $Enums.Role
  expiresAt?: Prisma.DateTimeFilter<"Invitation"> | Date | string
  inviterId?: Prisma.StringFilter<"Invitation"> | string
  status?: Prisma.StringFilter<"Invitation"> | string
  createdAt?: Prisma.DateTimeFilter<"Invitation"> | Date | string
}

export type InvitationCreateManyUserInput = {
  id?: string
  email: string
  role?: $Enums.Role
  expiresAt: Date | string
  status?: string
  createdAt?: Date | string
}

export type InvitationUpdateWithoutUserInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  status?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type InvitationUncheckedUpdateWithoutUserInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  status?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type InvitationUncheckedUpdateManyWithoutUserInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  status?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}



export type InvitationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  email?: boolean
  role?: boolean
  expiresAt?: boolean
  inviterId?: boolean
  status?: boolean
  createdAt?: boolean
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}, ExtArgs["result"]["invitation"]>

export type InvitationSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  email?: boolean
  role?: boolean
  expiresAt?: boolean
  inviterId?: boolean
  status?: boolean
  createdAt?: boolean
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}, ExtArgs["result"]["invitation"]>

export type InvitationSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  email?: boolean
  role?: boolean
  expiresAt?: boolean
  inviterId?: boolean
  status?: boolean
  createdAt?: boolean
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}, ExtArgs["result"]["invitation"]>

export type InvitationSelectScalar = {
  id?: boolean
  email?: boolean
  role?: boolean
  expiresAt?: boolean
  inviterId?: boolean
  status?: boolean
  createdAt?: boolean
}

export type InvitationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "email" | "role" | "expiresAt" | "inviterId" | "status" | "createdAt", ExtArgs["result"]["invitation"]>
export type InvitationInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}
export type InvitationIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}
export type InvitationIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}

export type $InvitationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  name: "Invitation"
  objects: {
    user: Prisma.$UserPayload<ExtArgs>
  }
  scalars: runtime.Types.Extensions.GetPayloadResult<{
    id: string
    email: string
    role: $Enums.Role
    expiresAt: Date
    inviterId: string
    status: string
    createdAt: Date
  }, ExtArgs["result"]["invitation"]>
  composites: {}
}

export type InvitationGetPayload<S extends boolean | null | undefined | InvitationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$InvitationPayload, S>

export type InvitationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> =
  Omit<InvitationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: InvitationCountAggregateInputType | true
  }

export interface InvitationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Invitation'], meta: { name: 'Invitation' } }
  /**
   * Find zero or one Invitation that matches the filter.
   * @param {InvitationFindUniqueArgs} args - Arguments to find a Invitation
   * @example
   * // Get one Invitation
   * const invitation = await prisma.invitation.findUnique({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUnique<T extends InvitationFindUniqueArgs>(args: Prisma.SelectSubset<T, InvitationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__InvitationClient<runtime.Types.Result.GetResult<Prisma.$InvitationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

  /**
   * Find one Invitation that matches the filter or throw an error with `error.code='P2025'`
   * if no matches were found.
   * @param {InvitationFindUniqueOrThrowArgs} args - Arguments to find a Invitation
   * @example
   * // Get one Invitation
   * const invitation = await prisma.invitation.findUniqueOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUniqueOrThrow<T extends InvitationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, InvitationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__InvitationClient<runtime.Types.Result.GetResult<Prisma.$InvitationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Find the first Invitation that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {InvitationFindFirstArgs} args - Arguments to find a Invitation
   * @example
   * // Get one Invitation
   * const invitation = await prisma.invitation.findFirst({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirst<T extends InvitationFindFirstArgs>(args?: Prisma.SelectSubset<T, InvitationFindFirstArgs<ExtArgs>>): Prisma.Prisma__InvitationClient<runtime.Types.Result.GetResult<Prisma.$InvitationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

  /**
   * Find the first Invitation that matches the filter or
   * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {InvitationFindFirstOrThrowArgs} args - Arguments to find a Invitation
   * @example
   * // Get one Invitation
   * const invitation = await prisma.invitation.findFirstOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirstOrThrow<T extends InvitationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, InvitationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__InvitationClient<runtime.Types.Result.GetResult<Prisma.$InvitationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Find zero or more Invitations that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {InvitationFindManyArgs} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Invitations
   * const invitations = await prisma.invitation.findMany()
   * 
   * // Get first 10 Invitations
   * const invitations = await prisma.invitation.findMany({ take: 10 })
   * 
   * // Only select the `id`
   * const invitationWithIdOnly = await prisma.invitation.findMany({ select: { id: true } })
   * 
   */
  findMany<T extends InvitationFindManyArgs>(args?: Prisma.SelectSubset<T, InvitationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvitationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

  /**
   * Create a Invitation.
   * @param {InvitationCreateArgs} args - Arguments to create a Invitation.
   * @example
   * // Create one Invitation
   * const Invitation = await prisma.invitation.create({
   *   data: {
   *     // ... data to create a Invitation
   *   }
   * })
   * 
   */
  create<T extends InvitationCreateArgs>(args: Prisma.SelectSubset<T, InvitationCreateArgs<ExtArgs>>): Prisma.Prisma__InvitationClient<runtime.Types.Result.GetResult<Prisma.$InvitationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Create many Invitations.
   * @param {InvitationCreateManyArgs} args - Arguments to create many Invitations.
   * @example
   * // Create many Invitations
   * const invitation = await prisma.invitation.createMany({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *     
   */
  createMany<T extends InvitationCreateManyArgs>(args?: Prisma.SelectSubset<T, InvitationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Create many Invitations and returns the data saved in the database.
   * @param {InvitationCreateManyAndReturnArgs} args - Arguments to create many Invitations.
   * @example
   * // Create many Invitations
   * const invitation = await prisma.invitation.createManyAndReturn({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * 
   * // Create many Invitations and only return the `id`
   * const invitationWithIdOnly = await prisma.invitation.createManyAndReturn({
   *   select: { id: true },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * 
   */
  createManyAndReturn<T extends InvitationCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, InvitationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvitationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

  /**
   * Delete a Invitation.
   * @param {InvitationDeleteArgs} args - Arguments to delete one Invitation.
   * @example
   * // Delete one Invitation
   * const Invitation = await prisma.invitation.delete({
   *   where: {
   *     // ... filter to delete one Invitation
   *   }
   * })
   * 
   */
  delete<T extends InvitationDeleteArgs>(args: Prisma.SelectSubset<T, InvitationDeleteArgs<ExtArgs>>): Prisma.Prisma__InvitationClient<runtime.Types.Result.GetResult<Prisma.$InvitationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Update one Invitation.
   * @param {InvitationUpdateArgs} args - Arguments to update one Invitation.
   * @example
   * // Update one Invitation
   * const invitation = await prisma.invitation.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
   */
  update<T extends InvitationUpdateArgs>(args: Prisma.SelectSubset<T, InvitationUpdateArgs<ExtArgs>>): Prisma.Prisma__InvitationClient<runtime.Types.Result.GetResult<Prisma.$InvitationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Delete zero or more Invitations.
   * @param {InvitationDeleteManyArgs} args - Arguments to filter Invitations to delete.
   * @example
   * // Delete a few Invitations
   * const { count } = await prisma.invitation.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
   */
  deleteMany<T extends InvitationDeleteManyArgs>(args?: Prisma.SelectSubset<T, InvitationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Update zero or more Invitations.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {InvitationUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Invitations
   * const invitation = await prisma.invitation.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
   */
  updateMany<T extends InvitationUpdateManyArgs>(args: Prisma.SelectSubset<T, InvitationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Update zero or more Invitations and returns the data updated in the database.
   * @param {InvitationUpdateManyAndReturnArgs} args - Arguments to update many Invitations.
   * @example
   * // Update many Invitations
   * const invitation = await prisma.invitation.updateManyAndReturn({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * 
   * // Update zero or more Invitations and only return the `id`
   * const invitationWithIdOnly = await prisma.invitation.updateManyAndReturn({
   *   select: { id: true },
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * 
   */
  updateManyAndReturn<T extends InvitationUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, InvitationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvitationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

  /**
   * Create or update one Invitation.
   * @param {InvitationUpsertArgs} args - Arguments to update or create a Invitation.
   * @example
   * // Update or create a Invitation
   * const invitation = await prisma.invitation.upsert({
   *   create: {
   *     // ... data to create a Invitation
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Invitation we want to update
   *   }
   * })
   */
  upsert<T extends InvitationUpsertArgs>(args: Prisma.SelectSubset<T, InvitationUpsertArgs<ExtArgs>>): Prisma.Prisma__InvitationClient<runtime.Types.Result.GetResult<Prisma.$InvitationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


  /**
   * Count the number of Invitations.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {InvitationCountArgs} args - Arguments to filter Invitations to count.
   * @example
   * // Count the number of Invitations
   * const count = await prisma.invitation.count({
   *   where: {
   *     // ... the filter for the Invitations we want to count
   *   }
   * })
  **/
  count<T extends InvitationCountArgs>(
    args?: Prisma.Subset<T, InvitationCountArgs>,
  ): Prisma.PrismaPromise<
    T extends runtime.Types.Utils.Record<'select', any>
      ? T['select'] extends true
        ? number
        : Prisma.GetScalarType<T['select'], InvitationCountAggregateOutputType>
      : number
  >

  /**
   * Allows you to perform aggregations operations on a Invitation.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {InvitationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
   * @example
   * // Ordered by age ascending
   * // Where email contains prisma.io
   * // Limited to the 10 users
   * const aggregations = await prisma.user.aggregate({
   *   _avg: {
   *     age: true,
   *   },
   *   where: {
   *     email: {
   *       contains: "prisma.io",
   *     },
   *   },
   *   orderBy: {
   *     age: "asc",
   *   },
   *   take: 10,
   * })
  **/
  aggregate<T extends InvitationAggregateArgs>(args: Prisma.Subset<T, InvitationAggregateArgs>): Prisma.PrismaPromise<GetInvitationAggregateType<T>>

  /**
   * Group by Invitation.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {InvitationGroupByArgs} args - Group by arguments.
   * @example
   * // Group by city, order by createdAt, get count
   * const result = await prisma.user.groupBy({
   *   by: ['city', 'createdAt'],
   *   orderBy: {
   *     createdAt: true
   *   },
   *   _count: {
   *     _all: true
   *   },
   * })
   * 
  **/
  groupBy<
    T extends InvitationGroupByArgs,
    HasSelectOrTake extends Prisma.Or<
      Prisma.Extends<'skip', Prisma.Keys<T>>,
      Prisma.Extends<'take', Prisma.Keys<T>>
    >,
    OrderByArg extends Prisma.True extends HasSelectOrTake
      ? { orderBy: InvitationGroupByArgs['orderBy'] }
      : { orderBy?: InvitationGroupByArgs['orderBy'] },
    OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>,
    ByFields extends Prisma.MaybeTupleToUnion<T['by']>,
    ByValid extends Prisma.Has<ByFields, OrderFields>,
    HavingFields extends Prisma.GetHavingFields<T['having']>,
    HavingValid extends Prisma.Has<ByFields, HavingFields>,
    ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False,
    InputErrors extends ByEmpty extends Prisma.True
    ? `Error: "by" must not be empty.`
    : HavingValid extends Prisma.False
    ? {
        [P in HavingFields]: P extends ByFields
          ? never
          : P extends string
          ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
          : [
              Error,
              'Field ',
              P,
              ` in "having" needs to be provided in "by"`,
            ]
      }[HavingFields]
    : 'take' extends Prisma.Keys<T>
    ? 'orderBy' extends Prisma.Keys<T>
      ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
              ? never
              : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
          }[OrderFields]
      : 'Error: If you provide "take", you also need to provide "orderBy"'
    : 'skip' extends Prisma.Keys<T>
    ? 'orderBy' extends Prisma.Keys<T>
      ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
              ? never
              : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
          }[OrderFields]
      : 'Error: If you provide "skip", you also need to provide "orderBy"'
    : ByValid extends Prisma.True
    ? {}
    : {
        [P in OrderFields]: P extends ByFields
          ? never
          : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
      }[OrderFields]
  >(args: Prisma.SubsetIntersection<T, InvitationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInvitationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
/**
 * Fields of the Invitation model
 */
readonly fields: InvitationFieldRefs;
}

/**
 * The delegate class that acts as a "Promise-like" for Invitation.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__InvitationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
  readonly [Symbol.toStringTag]: "PrismaPromise"
  user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>
}




/**
 * Fields of the Invitation model
 */
export interface InvitationFieldRefs {
  readonly id: Prisma.FieldRef<"Invitation", 'String'>
  readonly email: Prisma.FieldRef<"Invitation", 'String'>
  readonly role: Prisma.FieldRef<"Invitation", 'Role'>
  readonly expiresAt: Prisma.FieldRef<"Invitation", 'DateTime'>
  readonly inviterId: Prisma.FieldRef<"Invitation", 'String'>
  readonly status: Prisma.FieldRef<"Invitation", 'String'>
  readonly createdAt: Prisma.FieldRef<"Invitation", 'DateTime'>
}
    

// Custom InputTypes
/**
 * Invitation findUnique
 */
export type InvitationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Invitation
   */
  select?: Prisma.InvitationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Invitation
   */
  omit?: Prisma.InvitationOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.InvitationInclude<ExtArgs> | null
  /**
   * Filter, which Invitation to fetch.
   */
  where: Prisma.InvitationWhereUniqueInput
}

/**
 * Invitation findUniqueOrThrow
 */
export type InvitationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Invitation
   */
  select?: Prisma.InvitationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Invitation
   */
  omit?: Prisma.InvitationOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.InvitationInclude<ExtArgs> | null
  /**
   * Filter, which Invitation to fetch.
   */
  where: Prisma.InvitationWhereUniqueInput
}

/**
 * Invitation findFirst
 */
export type InvitationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Invitation
   */
  select?: Prisma.InvitationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Invitation
   */
  omit?: Prisma.InvitationOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.InvitationInclude<ExtArgs> | null
  /**
   * Filter, which Invitation to fetch.
   */
  where?: Prisma.InvitationWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Invitations to fetch.
   */
  orderBy?: Prisma.InvitationOrderByWithRelationInput | Prisma.InvitationOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for searching for Invitations.
   */
  cursor?: Prisma.InvitationWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Invitations from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Invitations.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   * 
   * Filter by unique combinations of Invitations.
   */
  distinct?: Prisma.InvitationScalarFieldEnum | Prisma.InvitationScalarFieldEnum[]
}

/**
 * Invitation findFirstOrThrow
 */
export type InvitationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Invitation
   */
  select?: Prisma.InvitationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Invitation
   */
  omit?: Prisma.InvitationOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.InvitationInclude<ExtArgs> | null
  /**
   * Filter, which Invitation to fetch.
   */
  where?: Prisma.InvitationWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Invitations to fetch.
   */
  orderBy?: Prisma.InvitationOrderByWithRelationInput | Prisma.InvitationOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for searching for Invitations.
   */
  cursor?: Prisma.InvitationWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Invitations from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Invitations.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   * 
   * Filter by unique combinations of Invitations.
   */
  distinct?: Prisma.InvitationScalarFieldEnum | Prisma.InvitationScalarFieldEnum[]
}

/**
 * Invitation findMany
 */
export type InvitationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Invitation
   */
  select?: Prisma.InvitationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Invitation
   */
  omit?: Prisma.InvitationOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.InvitationInclude<ExtArgs> | null
  /**
   * Filter, which Invitations to fetch.
   */
  where?: Prisma.InvitationWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Invitations to fetch.
   */
  orderBy?: Prisma.InvitationOrderByWithRelationInput | Prisma.InvitationOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for listing Invitations.
   */
  cursor?: Prisma.InvitationWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Invitations from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Invitations.
   */
  skip?: number
  distinct?: Prisma.InvitationScalarFieldEnum | Prisma.InvitationScalarFieldEnum[]
}

/**
 * Invitation create
 */
export type InvitationCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Invitation
   */
  select?: Prisma.InvitationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Invitation
   */
  omit?: Prisma.InvitationOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.InvitationInclude<ExtArgs> | null
  /**
   * The data needed to create a Invitation.
   */
  data: Prisma.XOR<Prisma.InvitationCreateInput, Prisma.InvitationUncheckedCreateInput>
}

/**
 * Invitation createMany
 */
export type InvitationCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to create many Invitations.
   */
  data: Prisma.InvitationCreateManyInput | Prisma.InvitationCreateManyInput[]
  skipDuplicates?: boolean
}

/**
 * Invitation createManyAndReturn
 */
export type InvitationCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Invitation
   */
  select?: Prisma.InvitationSelectCreateManyAndReturn<ExtArgs> | null
  /**
   * Omit specific fields from the Invitation
   */
  omit?: Prisma.InvitationOmit<ExtArgs> | null
  /**
   * The data used to create many Invitations.
   */
  data: Prisma.InvitationCreateManyInput | Prisma.InvitationCreateManyInput[]
  skipDuplicates?: boolean
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.InvitationIncludeCreateManyAndReturn<ExtArgs> | null
}

/**
 * Invitation update
 */
export type InvitationUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Invitation
   */
  select?: Prisma.InvitationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Invitation
   */
  omit?: Prisma.InvitationOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.InvitationInclude<ExtArgs> | null
  /**
   * The data needed to update a Invitation.
   */
  data: Prisma.XOR<Prisma.InvitationUpdateInput, Prisma.InvitationUncheckedUpdateInput>
  /**
   * Choose, which Invitation to update.
   */
  where: Prisma.InvitationWhereUniqueInput
}

/**
 * Invitation updateMany
 */
export type InvitationUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to update Invitations.
   */
  data: Prisma.XOR<Prisma.InvitationUpdateManyMutationInput, Prisma.InvitationUncheckedUpdateManyInput>
  /**
   * Filter which Invitations to update
   */
  where?: Prisma.InvitationWhereInput
  /**
   * Limit how many Invitations to update.
   */
  limit?: number
}

/**
 * Invitation updateManyAndReturn
 */
export type InvitationUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Invitation
   */
  select?: Prisma.InvitationSelectUpdateManyAndReturn<ExtArgs> | null
  /**
   * Omit specific fields from the Invitation
   */
  omit?: Prisma.InvitationOmit<ExtArgs> | null
  /**
   * The data used to update Invitations.
   */
  data: Prisma.XOR<Prisma.InvitationUpdateManyMutationInput, Prisma.InvitationUncheckedUpdateManyInput>
  /**
   * Filter which Invitations to update
   */
  where?: Prisma.InvitationWhereInput
  /**
   * Limit how many Invitations to update.
   */
  limit?: number
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.InvitationIncludeUpdateManyAndReturn<ExtArgs> | null
}

/**
 * Invitation upsert
 */
export type InvitationUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Invitation
   */
  select?: Prisma.InvitationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Invitation
   */
  omit?: Prisma.InvitationOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.InvitationInclude<ExtArgs> | null
  /**
   * The filter to search for the Invitation to update in case it exists.
   */
  where: Prisma.InvitationWhereUniqueInput
  /**
   * In case the Invitation found by the `where` argument doesn't exist, create a new Invitation with this data.
   */
  create: Prisma.XOR<Prisma.InvitationCreateInput, Prisma.InvitationUncheckedCreateInput>
  /**
   * In case the Invitation was found with the provided `where` argument, update it with this data.
   */
  update: Prisma.XOR<Prisma.InvitationUpdateInput, Prisma.InvitationUncheckedUpdateInput>
}

/**
 * Invitation delete
 */
export type InvitationDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Invitation
   */
  select?: Prisma.InvitationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Invitation
   */
  omit?: Prisma.InvitationOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.InvitationInclude<ExtArgs> | null
  /**
   * Filter which Invitation to delete.
   */
  where: Prisma.InvitationWhereUniqueInput
}

/**
 * Invitation deleteMany
 */
export type InvitationDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Invitations to delete
   */
  where?: Prisma.InvitationWhereInput
  /**
   * Limit how many Invitations to delete.
   */
  limit?: number
}

/**
 * Invitation without action
 */
export type InvitationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Invitation
   */
  select?: Prisma.InvitationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Invitation
   */
  omit?: Prisma.InvitationOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.InvitationInclude<ExtArgs> | null
}
```

---

### `packages/db/prisma/generated/models/Session.ts`

```typescript

/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * This file exports the `Session` model and its related types.
 *
 * 🟢 You can import this file directly.
 */
import type * as runtime from "@prisma/client/runtime/client"
import type * as $Enums from "../enums"
import type * as Prisma from "../internal/prismaNamespace"

/**
 * Model Session
 * 
 */
export type SessionModel = runtime.Types.Result.DefaultSelection<Prisma.$SessionPayload>

export type AggregateSession = {
  _count: SessionCountAggregateOutputType | null
  _min: SessionMinAggregateOutputType | null
  _max: SessionMaxAggregateOutputType | null
}

export type SessionMinAggregateOutputType = {
  id: string | null
  expiresAt: Date | null
  token: string | null
  createdAt: Date | null
  updatedAt: Date | null
  ipAddress: string | null
  userAgent: string | null
  userId: string | null
}

export type SessionMaxAggregateOutputType = {
  id: string | null
  expiresAt: Date | null
  token: string | null
  createdAt: Date | null
  updatedAt: Date | null
  ipAddress: string | null
  userAgent: string | null
  userId: string | null
}

export type SessionCountAggregateOutputType = {
  id: number
  expiresAt: number
  token: number
  createdAt: number
  updatedAt: number
  ipAddress: number
  userAgent: number
  userId: number
  _all: number
}


export type SessionMinAggregateInputType = {
  id?: true
  expiresAt?: true
  token?: true
  createdAt?: true
  updatedAt?: true
  ipAddress?: true
  userAgent?: true
  userId?: true
}

export type SessionMaxAggregateInputType = {
  id?: true
  expiresAt?: true
  token?: true
  createdAt?: true
  updatedAt?: true
  ipAddress?: true
  userAgent?: true
  userId?: true
}

export type SessionCountAggregateInputType = {
  id?: true
  expiresAt?: true
  token?: true
  createdAt?: true
  updatedAt?: true
  ipAddress?: true
  userAgent?: true
  userId?: true
  _all?: true
}

export type SessionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Session to aggregate.
   */
  where?: Prisma.SessionWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Sessions to fetch.
   */
  orderBy?: Prisma.SessionOrderByWithRelationInput | Prisma.SessionOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the start position
   */
  cursor?: Prisma.SessionWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Sessions from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Sessions.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Count returned Sessions
  **/
  _count?: true | SessionCountAggregateInputType
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Select which fields to find the minimum value
  **/
  _min?: SessionMinAggregateInputType
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Select which fields to find the maximum value
  **/
  _max?: SessionMaxAggregateInputType
}

export type GetSessionAggregateType<T extends SessionAggregateArgs> = {
      [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count'
    ? T[P] extends true
      ? number
      : Prisma.GetScalarType<T[P], AggregateSession[P]>
    : Prisma.GetScalarType<T[P], AggregateSession[P]>
}




export type SessionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: Prisma.SessionWhereInput
  orderBy?: Prisma.SessionOrderByWithAggregationInput | Prisma.SessionOrderByWithAggregationInput[]
  by: Prisma.SessionScalarFieldEnum[] | Prisma.SessionScalarFieldEnum
  having?: Prisma.SessionScalarWhereWithAggregatesInput
  take?: number
  skip?: number
  _count?: SessionCountAggregateInputType | true
  _min?: SessionMinAggregateInputType
  _max?: SessionMaxAggregateInputType
}

export type SessionGroupByOutputType = {
  id: string
  expiresAt: Date
  token: string
  createdAt: Date
  updatedAt: Date
  ipAddress: string | null
  userAgent: string | null
  userId: string
  _count: SessionCountAggregateOutputType | null
  _min: SessionMinAggregateOutputType | null
  _max: SessionMaxAggregateOutputType | null
}

type GetSessionGroupByPayload<T extends SessionGroupByArgs> = Prisma.PrismaPromise<
  Array<
    Prisma.PickEnumerable<SessionGroupByOutputType, T['by']> &
      {
        [P in ((keyof T) & (keyof SessionGroupByOutputType))]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : Prisma.GetScalarType<T[P], SessionGroupByOutputType[P]>
          : Prisma.GetScalarType<T[P], SessionGroupByOutputType[P]>
      }
    >
  >



export type SessionWhereInput = {
  AND?: Prisma.SessionWhereInput | Prisma.SessionWhereInput[]
  OR?: Prisma.SessionWhereInput[]
  NOT?: Prisma.SessionWhereInput | Prisma.SessionWhereInput[]
  id?: Prisma.StringFilter<"Session"> | string
  expiresAt?: Prisma.DateTimeFilter<"Session"> | Date | string
  token?: Prisma.StringFilter<"Session"> | string
  createdAt?: Prisma.DateTimeFilter<"Session"> | Date | string
  updatedAt?: Prisma.DateTimeFilter<"Session"> | Date | string
  ipAddress?: Prisma.StringNullableFilter<"Session"> | string | null
  userAgent?: Prisma.StringNullableFilter<"Session"> | string | null
  userId?: Prisma.StringFilter<"Session"> | string
  user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>
}

export type SessionOrderByWithRelationInput = {
  id?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  token?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
  ipAddress?: Prisma.SortOrderInput | Prisma.SortOrder
  userAgent?: Prisma.SortOrderInput | Prisma.SortOrder
  userId?: Prisma.SortOrder
  user?: Prisma.UserOrderByWithRelationInput
}

export type SessionWhereUniqueInput = Prisma.AtLeast<{
  id?: string
  token?: string
  AND?: Prisma.SessionWhereInput | Prisma.SessionWhereInput[]
  OR?: Prisma.SessionWhereInput[]
  NOT?: Prisma.SessionWhereInput | Prisma.SessionWhereInput[]
  expiresAt?: Prisma.DateTimeFilter<"Session"> | Date | string
  createdAt?: Prisma.DateTimeFilter<"Session"> | Date | string
  updatedAt?: Prisma.DateTimeFilter<"Session"> | Date | string
  ipAddress?: Prisma.StringNullableFilter<"Session"> | string | null
  userAgent?: Prisma.StringNullableFilter<"Session"> | string | null
  userId?: Prisma.StringFilter<"Session"> | string
  user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>
}, "id" | "token">

export type SessionOrderByWithAggregationInput = {
  id?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  token?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
  ipAddress?: Prisma.SortOrderInput | Prisma.SortOrder
  userAgent?: Prisma.SortOrderInput | Prisma.SortOrder
  userId?: Prisma.SortOrder
  _count?: Prisma.SessionCountOrderByAggregateInput
  _max?: Prisma.SessionMaxOrderByAggregateInput
  _min?: Prisma.SessionMinOrderByAggregateInput
}

export type SessionScalarWhereWithAggregatesInput = {
  AND?: Prisma.SessionScalarWhereWithAggregatesInput | Prisma.SessionScalarWhereWithAggregatesInput[]
  OR?: Prisma.SessionScalarWhereWithAggregatesInput[]
  NOT?: Prisma.SessionScalarWhereWithAggregatesInput | Prisma.SessionScalarWhereWithAggregatesInput[]
  id?: Prisma.StringWithAggregatesFilter<"Session"> | string
  expiresAt?: Prisma.DateTimeWithAggregatesFilter<"Session"> | Date | string
  token?: Prisma.StringWithAggregatesFilter<"Session"> | string
  createdAt?: Prisma.DateTimeWithAggregatesFilter<"Session"> | Date | string
  updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Session"> | Date | string
  ipAddress?: Prisma.StringNullableWithAggregatesFilter<"Session"> | string | null
  userAgent?: Prisma.StringNullableWithAggregatesFilter<"Session"> | string | null
  userId?: Prisma.StringWithAggregatesFilter<"Session"> | string
}

export type SessionCreateInput = {
  id: string
  expiresAt: Date | string
  token: string
  createdAt?: Date | string
  updatedAt?: Date | string
  ipAddress?: string | null
  userAgent?: string | null
  user: Prisma.UserCreateNestedOneWithoutSessionsInput
}

export type SessionUncheckedCreateInput = {
  id: string
  expiresAt: Date | string
  token: string
  createdAt?: Date | string
  updatedAt?: Date | string
  ipAddress?: string | null
  userAgent?: string | null
  userId: string
}

export type SessionUpdateInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  token?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  user?: Prisma.UserUpdateOneRequiredWithoutSessionsNestedInput
}

export type SessionUncheckedUpdateInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  token?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  userId?: Prisma.StringFieldUpdateOperationsInput | string
}

export type SessionCreateManyInput = {
  id: string
  expiresAt: Date | string
  token: string
  createdAt?: Date | string
  updatedAt?: Date | string
  ipAddress?: string | null
  userAgent?: string | null
  userId: string
}

export type SessionUpdateManyMutationInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  token?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
}

export type SessionUncheckedUpdateManyInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  token?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  userId?: Prisma.StringFieldUpdateOperationsInput | string
}

export type SessionListRelationFilter = {
  every?: Prisma.SessionWhereInput
  some?: Prisma.SessionWhereInput
  none?: Prisma.SessionWhereInput
}

export type SessionOrderByRelationAggregateInput = {
  _count?: Prisma.SortOrder
}

export type SessionCountOrderByAggregateInput = {
  id?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  token?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
  ipAddress?: Prisma.SortOrder
  userAgent?: Prisma.SortOrder
  userId?: Prisma.SortOrder
}

export type SessionMaxOrderByAggregateInput = {
  id?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  token?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
  ipAddress?: Prisma.SortOrder
  userAgent?: Prisma.SortOrder
  userId?: Prisma.SortOrder
}

export type SessionMinOrderByAggregateInput = {
  id?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  token?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
  ipAddress?: Prisma.SortOrder
  userAgent?: Prisma.SortOrder
  userId?: Prisma.SortOrder
}

export type SessionCreateNestedManyWithoutUserInput = {
  create?: Prisma.XOR<Prisma.SessionCreateWithoutUserInput, Prisma.SessionUncheckedCreateWithoutUserInput> | Prisma.SessionCreateWithoutUserInput[] | Prisma.SessionUncheckedCreateWithoutUserInput[]
  connectOrCreate?: Prisma.SessionCreateOrConnectWithoutUserInput | Prisma.SessionCreateOrConnectWithoutUserInput[]
  createMany?: Prisma.SessionCreateManyUserInputEnvelope
  connect?: Prisma.SessionWhereUniqueInput | Prisma.SessionWhereUniqueInput[]
}

export type SessionUncheckedCreateNestedManyWithoutUserInput = {
  create?: Prisma.XOR<Prisma.SessionCreateWithoutUserInput, Prisma.SessionUncheckedCreateWithoutUserInput> | Prisma.SessionCreateWithoutUserInput[] | Prisma.SessionUncheckedCreateWithoutUserInput[]
  connectOrCreate?: Prisma.SessionCreateOrConnectWithoutUserInput | Prisma.SessionCreateOrConnectWithoutUserInput[]
  createMany?: Prisma.SessionCreateManyUserInputEnvelope
  connect?: Prisma.SessionWhereUniqueInput | Prisma.SessionWhereUniqueInput[]
}

export type SessionUpdateManyWithoutUserNestedInput = {
  create?: Prisma.XOR<Prisma.SessionCreateWithoutUserInput, Prisma.SessionUncheckedCreateWithoutUserInput> | Prisma.SessionCreateWithoutUserInput[] | Prisma.SessionUncheckedCreateWithoutUserInput[]
  connectOrCreate?: Prisma.SessionCreateOrConnectWithoutUserInput | Prisma.SessionCreateOrConnectWithoutUserInput[]
  upsert?: Prisma.SessionUpsertWithWhereUniqueWithoutUserInput | Prisma.SessionUpsertWithWhereUniqueWithoutUserInput[]
  createMany?: Prisma.SessionCreateManyUserInputEnvelope
  set?: Prisma.SessionWhereUniqueInput | Prisma.SessionWhereUniqueInput[]
  disconnect?: Prisma.SessionWhereUniqueInput | Prisma.SessionWhereUniqueInput[]
  delete?: Prisma.SessionWhereUniqueInput | Prisma.SessionWhereUniqueInput[]
  connect?: Prisma.SessionWhereUniqueInput | Prisma.SessionWhereUniqueInput[]
  update?: Prisma.SessionUpdateWithWhereUniqueWithoutUserInput | Prisma.SessionUpdateWithWhereUniqueWithoutUserInput[]
  updateMany?: Prisma.SessionUpdateManyWithWhereWithoutUserInput | Prisma.SessionUpdateManyWithWhereWithoutUserInput[]
  deleteMany?: Prisma.SessionScalarWhereInput | Prisma.SessionScalarWhereInput[]
}

export type SessionUncheckedUpdateManyWithoutUserNestedInput = {
  create?: Prisma.XOR<Prisma.SessionCreateWithoutUserInput, Prisma.SessionUncheckedCreateWithoutUserInput> | Prisma.SessionCreateWithoutUserInput[] | Prisma.SessionUncheckedCreateWithoutUserInput[]
  connectOrCreate?: Prisma.SessionCreateOrConnectWithoutUserInput | Prisma.SessionCreateOrConnectWithoutUserInput[]
  upsert?: Prisma.SessionUpsertWithWhereUniqueWithoutUserInput | Prisma.SessionUpsertWithWhereUniqueWithoutUserInput[]
  createMany?: Prisma.SessionCreateManyUserInputEnvelope
  set?: Prisma.SessionWhereUniqueInput | Prisma.SessionWhereUniqueInput[]
  disconnect?: Prisma.SessionWhereUniqueInput | Prisma.SessionWhereUniqueInput[]
  delete?: Prisma.SessionWhereUniqueInput | Prisma.SessionWhereUniqueInput[]
  connect?: Prisma.SessionWhereUniqueInput | Prisma.SessionWhereUniqueInput[]
  update?: Prisma.SessionUpdateWithWhereUniqueWithoutUserInput | Prisma.SessionUpdateWithWhereUniqueWithoutUserInput[]
  updateMany?: Prisma.SessionUpdateManyWithWhereWithoutUserInput | Prisma.SessionUpdateManyWithWhereWithoutUserInput[]
  deleteMany?: Prisma.SessionScalarWhereInput | Prisma.SessionScalarWhereInput[]
}

export type SessionCreateWithoutUserInput = {
  id: string
  expiresAt: Date | string
  token: string
  createdAt?: Date | string
  updatedAt?: Date | string
  ipAddress?: string | null
  userAgent?: string | null
}

export type SessionUncheckedCreateWithoutUserInput = {
  id: string
  expiresAt: Date | string
  token: string
  createdAt?: Date | string
  updatedAt?: Date | string
  ipAddress?: string | null
  userAgent?: string | null
}

export type SessionCreateOrConnectWithoutUserInput = {
  where: Prisma.SessionWhereUniqueInput
  create: Prisma.XOR<Prisma.SessionCreateWithoutUserInput, Prisma.SessionUncheckedCreateWithoutUserInput>
}

export type SessionCreateManyUserInputEnvelope = {
  data: Prisma.SessionCreateManyUserInput | Prisma.SessionCreateManyUserInput[]
  skipDuplicates?: boolean
}

export type SessionUpsertWithWhereUniqueWithoutUserInput = {
  where: Prisma.SessionWhereUniqueInput
  update: Prisma.XOR<Prisma.SessionUpdateWithoutUserInput, Prisma.SessionUncheckedUpdateWithoutUserInput>
  create: Prisma.XOR<Prisma.SessionCreateWithoutUserInput, Prisma.SessionUncheckedCreateWithoutUserInput>
}

export type SessionUpdateWithWhereUniqueWithoutUserInput = {
  where: Prisma.SessionWhereUniqueInput
  data: Prisma.XOR<Prisma.SessionUpdateWithoutUserInput, Prisma.SessionUncheckedUpdateWithoutUserInput>
}

export type SessionUpdateManyWithWhereWithoutUserInput = {
  where: Prisma.SessionScalarWhereInput
  data: Prisma.XOR<Prisma.SessionUpdateManyMutationInput, Prisma.SessionUncheckedUpdateManyWithoutUserInput>
}

export type SessionScalarWhereInput = {
  AND?: Prisma.SessionScalarWhereInput | Prisma.SessionScalarWhereInput[]
  OR?: Prisma.SessionScalarWhereInput[]
  NOT?: Prisma.SessionScalarWhereInput | Prisma.SessionScalarWhereInput[]
  id?: Prisma.StringFilter<"Session"> | string
  expiresAt?: Prisma.DateTimeFilter<"Session"> | Date | string
  token?: Prisma.StringFilter<"Session"> | string
  createdAt?: Prisma.DateTimeFilter<"Session"> | Date | string
  updatedAt?: Prisma.DateTimeFilter<"Session"> | Date | string
  ipAddress?: Prisma.StringNullableFilter<"Session"> | string | null
  userAgent?: Prisma.StringNullableFilter<"Session"> | string | null
  userId?: Prisma.StringFilter<"Session"> | string
}

export type SessionCreateManyUserInput = {
  id: string
  expiresAt: Date | string
  token: string
  createdAt?: Date | string
  updatedAt?: Date | string
  ipAddress?: string | null
  userAgent?: string | null
}

export type SessionUpdateWithoutUserInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  token?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
}

export type SessionUncheckedUpdateWithoutUserInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  token?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
}

export type SessionUncheckedUpdateManyWithoutUserInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  token?: Prisma.StringFieldUpdateOperationsInput | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  ipAddress?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  userAgent?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
}



export type SessionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  expiresAt?: boolean
  token?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  ipAddress?: boolean
  userAgent?: boolean
  userId?: boolean
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}, ExtArgs["result"]["session"]>

export type SessionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  expiresAt?: boolean
  token?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  ipAddress?: boolean
  userAgent?: boolean
  userId?: boolean
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}, ExtArgs["result"]["session"]>

export type SessionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  expiresAt?: boolean
  token?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  ipAddress?: boolean
  userAgent?: boolean
  userId?: boolean
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}, ExtArgs["result"]["session"]>

export type SessionSelectScalar = {
  id?: boolean
  expiresAt?: boolean
  token?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  ipAddress?: boolean
  userAgent?: boolean
  userId?: boolean
}

export type SessionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "expiresAt" | "token" | "createdAt" | "updatedAt" | "ipAddress" | "userAgent" | "userId", ExtArgs["result"]["session"]>
export type SessionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}
export type SessionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}
export type SessionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  user?: boolean | Prisma.UserDefaultArgs<ExtArgs>
}

export type $SessionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  name: "Session"
  objects: {
    user: Prisma.$UserPayload<ExtArgs>
  }
  scalars: runtime.Types.Extensions.GetPayloadResult<{
    id: string
    expiresAt: Date
    token: string
    createdAt: Date
    updatedAt: Date
    ipAddress: string | null
    userAgent: string | null
    userId: string
  }, ExtArgs["result"]["session"]>
  composites: {}
}

export type SessionGetPayload<S extends boolean | null | undefined | SessionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SessionPayload, S>

export type SessionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> =
  Omit<SessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SessionCountAggregateInputType | true
  }

export interface SessionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Session'], meta: { name: 'Session' } }
  /**
   * Find zero or one Session that matches the filter.
   * @param {SessionFindUniqueArgs} args - Arguments to find a Session
   * @example
   * // Get one Session
   * const session = await prisma.session.findUnique({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUnique<T extends SessionFindUniqueArgs>(args: Prisma.SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SessionClient<runtime.Types.Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

  /**
   * Find one Session that matches the filter or throw an error with `error.code='P2025'`
   * if no matches were found.
   * @param {SessionFindUniqueOrThrowArgs} args - Arguments to find a Session
   * @example
   * // Get one Session
   * const session = await prisma.session.findUniqueOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SessionClient<runtime.Types.Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Find the first Session that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionFindFirstArgs} args - Arguments to find a Session
   * @example
   * // Get one Session
   * const session = await prisma.session.findFirst({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirst<T extends SessionFindFirstArgs>(args?: Prisma.SelectSubset<T, SessionFindFirstArgs<ExtArgs>>): Prisma.Prisma__SessionClient<runtime.Types.Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

  /**
   * Find the first Session that matches the filter or
   * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionFindFirstOrThrowArgs} args - Arguments to find a Session
   * @example
   * // Get one Session
   * const session = await prisma.session.findFirstOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirstOrThrow<T extends SessionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SessionClient<runtime.Types.Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Find zero or more Sessions that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionFindManyArgs} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Sessions
   * const sessions = await prisma.session.findMany()
   * 
   * // Get first 10 Sessions
   * const sessions = await prisma.session.findMany({ take: 10 })
   * 
   * // Only select the `id`
   * const sessionWithIdOnly = await prisma.session.findMany({ select: { id: true } })
   * 
   */
  findMany<T extends SessionFindManyArgs>(args?: Prisma.SelectSubset<T, SessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

  /**
   * Create a Session.
   * @param {SessionCreateArgs} args - Arguments to create a Session.
   * @example
   * // Create one Session
   * const Session = await prisma.session.create({
   *   data: {
   *     // ... data to create a Session
   *   }
   * })
   * 
   */
  create<T extends SessionCreateArgs>(args: Prisma.SelectSubset<T, SessionCreateArgs<ExtArgs>>): Prisma.Prisma__SessionClient<runtime.Types.Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Create many Sessions.
   * @param {SessionCreateManyArgs} args - Arguments to create many Sessions.
   * @example
   * // Create many Sessions
   * const session = await prisma.session.createMany({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *     
   */
  createMany<T extends SessionCreateManyArgs>(args?: Prisma.SelectSubset<T, SessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Create many Sessions and returns the data saved in the database.
   * @param {SessionCreateManyAndReturnArgs} args - Arguments to create many Sessions.
   * @example
   * // Create many Sessions
   * const session = await prisma.session.createManyAndReturn({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * 
   * // Create many Sessions and only return the `id`
   * const sessionWithIdOnly = await prisma.session.createManyAndReturn({
   *   select: { id: true },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * 
   */
  createManyAndReturn<T extends SessionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

  /**
   * Delete a Session.
   * @param {SessionDeleteArgs} args - Arguments to delete one Session.
   * @example
   * // Delete one Session
   * const Session = await prisma.session.delete({
   *   where: {
   *     // ... filter to delete one Session
   *   }
   * })
   * 
   */
  delete<T extends SessionDeleteArgs>(args: Prisma.SelectSubset<T, SessionDeleteArgs<ExtArgs>>): Prisma.Prisma__SessionClient<runtime.Types.Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Update one Session.
   * @param {SessionUpdateArgs} args - Arguments to update one Session.
   * @example
   * // Update one Session
   * const session = await prisma.session.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
   */
  update<T extends SessionUpdateArgs>(args: Prisma.SelectSubset<T, SessionUpdateArgs<ExtArgs>>): Prisma.Prisma__SessionClient<runtime.Types.Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Delete zero or more Sessions.
   * @param {SessionDeleteManyArgs} args - Arguments to filter Sessions to delete.
   * @example
   * // Delete a few Sessions
   * const { count } = await prisma.session.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
   */
  deleteMany<T extends SessionDeleteManyArgs>(args?: Prisma.SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Update zero or more Sessions.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Sessions
   * const session = await prisma.session.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
   */
  updateMany<T extends SessionUpdateManyArgs>(args: Prisma.SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Update zero or more Sessions and returns the data updated in the database.
   * @param {SessionUpdateManyAndReturnArgs} args - Arguments to update many Sessions.
   * @example
   * // Update many Sessions
   * const session = await prisma.session.updateManyAndReturn({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * 
   * // Update zero or more Sessions and only return the `id`
   * const sessionWithIdOnly = await prisma.session.updateManyAndReturn({
   *   select: { id: true },
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * 
   */
  updateManyAndReturn<T extends SessionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

  /**
   * Create or update one Session.
   * @param {SessionUpsertArgs} args - Arguments to update or create a Session.
   * @example
   * // Update or create a Session
   * const session = await prisma.session.upsert({
   *   create: {
   *     // ... data to create a Session
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Session we want to update
   *   }
   * })
   */
  upsert<T extends SessionUpsertArgs>(args: Prisma.SelectSubset<T, SessionUpsertArgs<ExtArgs>>): Prisma.Prisma__SessionClient<runtime.Types.Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


  /**
   * Count the number of Sessions.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionCountArgs} args - Arguments to filter Sessions to count.
   * @example
   * // Count the number of Sessions
   * const count = await prisma.session.count({
   *   where: {
   *     // ... the filter for the Sessions we want to count
   *   }
   * })
  **/
  count<T extends SessionCountArgs>(
    args?: Prisma.Subset<T, SessionCountArgs>,
  ): Prisma.PrismaPromise<
    T extends runtime.Types.Utils.Record<'select', any>
      ? T['select'] extends true
        ? number
        : Prisma.GetScalarType<T['select'], SessionCountAggregateOutputType>
      : number
  >

  /**
   * Allows you to perform aggregations operations on a Session.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
   * @example
   * // Ordered by age ascending
   * // Where email contains prisma.io
   * // Limited to the 10 users
   * const aggregations = await prisma.user.aggregate({
   *   _avg: {
   *     age: true,
   *   },
   *   where: {
   *     email: {
   *       contains: "prisma.io",
   *     },
   *   },
   *   orderBy: {
   *     age: "asc",
   *   },
   *   take: 10,
   * })
  **/
  aggregate<T extends SessionAggregateArgs>(args: Prisma.Subset<T, SessionAggregateArgs>): Prisma.PrismaPromise<GetSessionAggregateType<T>>

  /**
   * Group by Session.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {SessionGroupByArgs} args - Group by arguments.
   * @example
   * // Group by city, order by createdAt, get count
   * const result = await prisma.user.groupBy({
   *   by: ['city', 'createdAt'],
   *   orderBy: {
   *     createdAt: true
   *   },
   *   _count: {
   *     _all: true
   *   },
   * })
   * 
  **/
  groupBy<
    T extends SessionGroupByArgs,
    HasSelectOrTake extends Prisma.Or<
      Prisma.Extends<'skip', Prisma.Keys<T>>,
      Prisma.Extends<'take', Prisma.Keys<T>>
    >,
    OrderByArg extends Prisma.True extends HasSelectOrTake
      ? { orderBy: SessionGroupByArgs['orderBy'] }
      : { orderBy?: SessionGroupByArgs['orderBy'] },
    OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>,
    ByFields extends Prisma.MaybeTupleToUnion<T['by']>,
    ByValid extends Prisma.Has<ByFields, OrderFields>,
    HavingFields extends Prisma.GetHavingFields<T['having']>,
    HavingValid extends Prisma.Has<ByFields, HavingFields>,
    ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False,
    InputErrors extends ByEmpty extends Prisma.True
    ? `Error: "by" must not be empty.`
    : HavingValid extends Prisma.False
    ? {
        [P in HavingFields]: P extends ByFields
          ? never
          : P extends string
          ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
          : [
              Error,
              'Field ',
              P,
              ` in "having" needs to be provided in "by"`,
            ]
      }[HavingFields]
    : 'take' extends Prisma.Keys<T>
    ? 'orderBy' extends Prisma.Keys<T>
      ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
              ? never
              : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
          }[OrderFields]
      : 'Error: If you provide "take", you also need to provide "orderBy"'
    : 'skip' extends Prisma.Keys<T>
    ? 'orderBy' extends Prisma.Keys<T>
      ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
              ? never
              : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
          }[OrderFields]
      : 'Error: If you provide "skip", you also need to provide "orderBy"'
    : ByValid extends Prisma.True
    ? {}
    : {
        [P in OrderFields]: P extends ByFields
          ? never
          : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
      }[OrderFields]
  >(args: Prisma.SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
/**
 * Fields of the Session model
 */
readonly fields: SessionFieldRefs;
}

/**
 * The delegate class that acts as a "Promise-like" for Session.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__SessionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
  readonly [Symbol.toStringTag]: "PrismaPromise"
  user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>
}




/**
 * Fields of the Session model
 */
export interface SessionFieldRefs {
  readonly id: Prisma.FieldRef<"Session", 'String'>
  readonly expiresAt: Prisma.FieldRef<"Session", 'DateTime'>
  readonly token: Prisma.FieldRef<"Session", 'String'>
  readonly createdAt: Prisma.FieldRef<"Session", 'DateTime'>
  readonly updatedAt: Prisma.FieldRef<"Session", 'DateTime'>
  readonly ipAddress: Prisma.FieldRef<"Session", 'String'>
  readonly userAgent: Prisma.FieldRef<"Session", 'String'>
  readonly userId: Prisma.FieldRef<"Session", 'String'>
}
    

// Custom InputTypes
/**
 * Session findUnique
 */
export type SessionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: Prisma.SessionSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Session
   */
  omit?: Prisma.SessionOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.SessionInclude<ExtArgs> | null
  /**
   * Filter, which Session to fetch.
   */
  where: Prisma.SessionWhereUniqueInput
}

/**
 * Session findUniqueOrThrow
 */
export type SessionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: Prisma.SessionSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Session
   */
  omit?: Prisma.SessionOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.SessionInclude<ExtArgs> | null
  /**
   * Filter, which Session to fetch.
   */
  where: Prisma.SessionWhereUniqueInput
}

/**
 * Session findFirst
 */
export type SessionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: Prisma.SessionSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Session
   */
  omit?: Prisma.SessionOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.SessionInclude<ExtArgs> | null
  /**
   * Filter, which Session to fetch.
   */
  where?: Prisma.SessionWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Sessions to fetch.
   */
  orderBy?: Prisma.SessionOrderByWithRelationInput | Prisma.SessionOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for searching for Sessions.
   */
  cursor?: Prisma.SessionWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Sessions from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Sessions.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   * 
   * Filter by unique combinations of Sessions.
   */
  distinct?: Prisma.SessionScalarFieldEnum | Prisma.SessionScalarFieldEnum[]
}

/**
 * Session findFirstOrThrow
 */
export type SessionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: Prisma.SessionSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Session
   */
  omit?: Prisma.SessionOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.SessionInclude<ExtArgs> | null
  /**
   * Filter, which Session to fetch.
   */
  where?: Prisma.SessionWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Sessions to fetch.
   */
  orderBy?: Prisma.SessionOrderByWithRelationInput | Prisma.SessionOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for searching for Sessions.
   */
  cursor?: Prisma.SessionWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Sessions from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Sessions.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   * 
   * Filter by unique combinations of Sessions.
   */
  distinct?: Prisma.SessionScalarFieldEnum | Prisma.SessionScalarFieldEnum[]
}

/**
 * Session findMany
 */
export type SessionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: Prisma.SessionSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Session
   */
  omit?: Prisma.SessionOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.SessionInclude<ExtArgs> | null
  /**
   * Filter, which Sessions to fetch.
   */
  where?: Prisma.SessionWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Sessions to fetch.
   */
  orderBy?: Prisma.SessionOrderByWithRelationInput | Prisma.SessionOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for listing Sessions.
   */
  cursor?: Prisma.SessionWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Sessions from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Sessions.
   */
  skip?: number
  distinct?: Prisma.SessionScalarFieldEnum | Prisma.SessionScalarFieldEnum[]
}

/**
 * Session create
 */
export type SessionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: Prisma.SessionSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Session
   */
  omit?: Prisma.SessionOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.SessionInclude<ExtArgs> | null
  /**
   * The data needed to create a Session.
   */
  data: Prisma.XOR<Prisma.SessionCreateInput, Prisma.SessionUncheckedCreateInput>
}

/**
 * Session createMany
 */
export type SessionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to create many Sessions.
   */
  data: Prisma.SessionCreateManyInput | Prisma.SessionCreateManyInput[]
  skipDuplicates?: boolean
}

/**
 * Session createManyAndReturn
 */
export type SessionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: Prisma.SessionSelectCreateManyAndReturn<ExtArgs> | null
  /**
   * Omit specific fields from the Session
   */
  omit?: Prisma.SessionOmit<ExtArgs> | null
  /**
   * The data used to create many Sessions.
   */
  data: Prisma.SessionCreateManyInput | Prisma.SessionCreateManyInput[]
  skipDuplicates?: boolean
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.SessionIncludeCreateManyAndReturn<ExtArgs> | null
}

/**
 * Session update
 */
export type SessionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: Prisma.SessionSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Session
   */
  omit?: Prisma.SessionOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.SessionInclude<ExtArgs> | null
  /**
   * The data needed to update a Session.
   */
  data: Prisma.XOR<Prisma.SessionUpdateInput, Prisma.SessionUncheckedUpdateInput>
  /**
   * Choose, which Session to update.
   */
  where: Prisma.SessionWhereUniqueInput
}

/**
 * Session updateMany
 */
export type SessionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to update Sessions.
   */
  data: Prisma.XOR<Prisma.SessionUpdateManyMutationInput, Prisma.SessionUncheckedUpdateManyInput>
  /**
   * Filter which Sessions to update
   */
  where?: Prisma.SessionWhereInput
  /**
   * Limit how many Sessions to update.
   */
  limit?: number
}

/**
 * Session updateManyAndReturn
 */
export type SessionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: Prisma.SessionSelectUpdateManyAndReturn<ExtArgs> | null
  /**
   * Omit specific fields from the Session
   */
  omit?: Prisma.SessionOmit<ExtArgs> | null
  /**
   * The data used to update Sessions.
   */
  data: Prisma.XOR<Prisma.SessionUpdateManyMutationInput, Prisma.SessionUncheckedUpdateManyInput>
  /**
   * Filter which Sessions to update
   */
  where?: Prisma.SessionWhereInput
  /**
   * Limit how many Sessions to update.
   */
  limit?: number
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.SessionIncludeUpdateManyAndReturn<ExtArgs> | null
}

/**
 * Session upsert
 */
export type SessionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: Prisma.SessionSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Session
   */
  omit?: Prisma.SessionOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.SessionInclude<ExtArgs> | null
  /**
   * The filter to search for the Session to update in case it exists.
   */
  where: Prisma.SessionWhereUniqueInput
  /**
   * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
   */
  create: Prisma.XOR<Prisma.SessionCreateInput, Prisma.SessionUncheckedCreateInput>
  /**
   * In case the Session was found with the provided `where` argument, update it with this data.
   */
  update: Prisma.XOR<Prisma.SessionUpdateInput, Prisma.SessionUncheckedUpdateInput>
}

/**
 * Session delete
 */
export type SessionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: Prisma.SessionSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Session
   */
  omit?: Prisma.SessionOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.SessionInclude<ExtArgs> | null
  /**
   * Filter which Session to delete.
   */
  where: Prisma.SessionWhereUniqueInput
}

/**
 * Session deleteMany
 */
export type SessionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Sessions to delete
   */
  where?: Prisma.SessionWhereInput
  /**
   * Limit how many Sessions to delete.
   */
  limit?: number
}

/**
 * Session without action
 */
export type SessionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: Prisma.SessionSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Session
   */
  omit?: Prisma.SessionOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.SessionInclude<ExtArgs> | null
}
```

---

### `packages/db/prisma/generated/models/User.ts`

```typescript

/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * This file exports the `User` model and its related types.
 *
 * 🟢 You can import this file directly.
 */
import type * as runtime from "@prisma/client/runtime/client"
import type * as $Enums from "../enums"
import type * as Prisma from "../internal/prismaNamespace"

/**
 * Model User
 * 
 */
export type UserModel = runtime.Types.Result.DefaultSelection<Prisma.$UserPayload>

export type AggregateUser = {
  _count: UserCountAggregateOutputType | null
  _min: UserMinAggregateOutputType | null
  _max: UserMaxAggregateOutputType | null
}

export type UserMinAggregateOutputType = {
  id: string | null
  name: string | null
  email: string | null
  emailVerified: boolean | null
  image: string | null
  createdAt: Date | null
  updatedAt: Date | null
  role: $Enums.Role | null
  banned: boolean | null
  banReason: string | null
  archived: boolean | null
}

export type UserMaxAggregateOutputType = {
  id: string | null
  name: string | null
  email: string | null
  emailVerified: boolean | null
  image: string | null
  createdAt: Date | null
  updatedAt: Date | null
  role: $Enums.Role | null
  banned: boolean | null
  banReason: string | null
  archived: boolean | null
}

export type UserCountAggregateOutputType = {
  id: number
  name: number
  email: number
  emailVerified: number
  image: number
  createdAt: number
  updatedAt: number
  role: number
  banned: number
  banReason: number
  archived: number
  _all: number
}


export type UserMinAggregateInputType = {
  id?: true
  name?: true
  email?: true
  emailVerified?: true
  image?: true
  createdAt?: true
  updatedAt?: true
  role?: true
  banned?: true
  banReason?: true
  archived?: true
}

export type UserMaxAggregateInputType = {
  id?: true
  name?: true
  email?: true
  emailVerified?: true
  image?: true
  createdAt?: true
  updatedAt?: true
  role?: true
  banned?: true
  banReason?: true
  archived?: true
}

export type UserCountAggregateInputType = {
  id?: true
  name?: true
  email?: true
  emailVerified?: true
  image?: true
  createdAt?: true
  updatedAt?: true
  role?: true
  banned?: true
  banReason?: true
  archived?: true
  _all?: true
}

export type UserAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which User to aggregate.
   */
  where?: Prisma.UserWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Users to fetch.
   */
  orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the start position
   */
  cursor?: Prisma.UserWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Users from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Users.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Count returned Users
  **/
  _count?: true | UserCountAggregateInputType
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Select which fields to find the minimum value
  **/
  _min?: UserMinAggregateInputType
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Select which fields to find the maximum value
  **/
  _max?: UserMaxAggregateInputType
}

export type GetUserAggregateType<T extends UserAggregateArgs> = {
      [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
    ? T[P] extends true
      ? number
      : Prisma.GetScalarType<T[P], AggregateUser[P]>
    : Prisma.GetScalarType<T[P], AggregateUser[P]>
}




export type UserGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: Prisma.UserWhereInput
  orderBy?: Prisma.UserOrderByWithAggregationInput | Prisma.UserOrderByWithAggregationInput[]
  by: Prisma.UserScalarFieldEnum[] | Prisma.UserScalarFieldEnum
  having?: Prisma.UserScalarWhereWithAggregatesInput
  take?: number
  skip?: number
  _count?: UserCountAggregateInputType | true
  _min?: UserMinAggregateInputType
  _max?: UserMaxAggregateInputType
}

export type UserGroupByOutputType = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: Date
  updatedAt: Date
  role: $Enums.Role
  banned: boolean
  banReason: string | null
  archived: boolean
  _count: UserCountAggregateOutputType | null
  _min: UserMinAggregateOutputType | null
  _max: UserMaxAggregateOutputType | null
}

type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
  Array<
    Prisma.PickEnumerable<UserGroupByOutputType, T['by']> &
      {
        [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : Prisma.GetScalarType<T[P], UserGroupByOutputType[P]>
          : Prisma.GetScalarType<T[P], UserGroupByOutputType[P]>
      }
    >
  >



export type UserWhereInput = {
  AND?: Prisma.UserWhereInput | Prisma.UserWhereInput[]
  OR?: Prisma.UserWhereInput[]
  NOT?: Prisma.UserWhereInput | Prisma.UserWhereInput[]
  id?: Prisma.StringFilter<"User"> | string
  name?: Prisma.StringFilter<"User"> | string
  email?: Prisma.StringFilter<"User"> | string
  emailVerified?: Prisma.BoolFilter<"User"> | boolean
  image?: Prisma.StringNullableFilter<"User"> | string | null
  createdAt?: Prisma.DateTimeFilter<"User"> | Date | string
  updatedAt?: Prisma.DateTimeFilter<"User"> | Date | string
  role?: Prisma.EnumRoleFilter<"User"> | $Enums.Role
  banned?: Prisma.BoolFilter<"User"> | boolean
  banReason?: Prisma.StringNullableFilter<"User"> | string | null
  archived?: Prisma.BoolFilter<"User"> | boolean
  sessions?: Prisma.SessionListRelationFilter
  accounts?: Prisma.AccountListRelationFilter
  invitations?: Prisma.InvitationListRelationFilter
}

export type UserOrderByWithRelationInput = {
  id?: Prisma.SortOrder
  name?: Prisma.SortOrder
  email?: Prisma.SortOrder
  emailVerified?: Prisma.SortOrder
  image?: Prisma.SortOrderInput | Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
  role?: Prisma.SortOrder
  banned?: Prisma.SortOrder
  banReason?: Prisma.SortOrderInput | Prisma.SortOrder
  archived?: Prisma.SortOrder
  sessions?: Prisma.SessionOrderByRelationAggregateInput
  accounts?: Prisma.AccountOrderByRelationAggregateInput
  invitations?: Prisma.InvitationOrderByRelationAggregateInput
}

export type UserWhereUniqueInput = Prisma.AtLeast<{
  id?: string
  email?: string
  AND?: Prisma.UserWhereInput | Prisma.UserWhereInput[]
  OR?: Prisma.UserWhereInput[]
  NOT?: Prisma.UserWhereInput | Prisma.UserWhereInput[]
  name?: Prisma.StringFilter<"User"> | string
  emailVerified?: Prisma.BoolFilter<"User"> | boolean
  image?: Prisma.StringNullableFilter<"User"> | string | null
  createdAt?: Prisma.DateTimeFilter<"User"> | Date | string
  updatedAt?: Prisma.DateTimeFilter<"User"> | Date | string
  role?: Prisma.EnumRoleFilter<"User"> | $Enums.Role
  banned?: Prisma.BoolFilter<"User"> | boolean
  banReason?: Prisma.StringNullableFilter<"User"> | string | null
  archived?: Prisma.BoolFilter<"User"> | boolean
  sessions?: Prisma.SessionListRelationFilter
  accounts?: Prisma.AccountListRelationFilter
  invitations?: Prisma.InvitationListRelationFilter
}, "id" | "email">

export type UserOrderByWithAggregationInput = {
  id?: Prisma.SortOrder
  name?: Prisma.SortOrder
  email?: Prisma.SortOrder
  emailVerified?: Prisma.SortOrder
  image?: Prisma.SortOrderInput | Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
  role?: Prisma.SortOrder
  banned?: Prisma.SortOrder
  banReason?: Prisma.SortOrderInput | Prisma.SortOrder
  archived?: Prisma.SortOrder
  _count?: Prisma.UserCountOrderByAggregateInput
  _max?: Prisma.UserMaxOrderByAggregateInput
  _min?: Prisma.UserMinOrderByAggregateInput
}

export type UserScalarWhereWithAggregatesInput = {
  AND?: Prisma.UserScalarWhereWithAggregatesInput | Prisma.UserScalarWhereWithAggregatesInput[]
  OR?: Prisma.UserScalarWhereWithAggregatesInput[]
  NOT?: Prisma.UserScalarWhereWithAggregatesInput | Prisma.UserScalarWhereWithAggregatesInput[]
  id?: Prisma.StringWithAggregatesFilter<"User"> | string
  name?: Prisma.StringWithAggregatesFilter<"User"> | string
  email?: Prisma.StringWithAggregatesFilter<"User"> | string
  emailVerified?: Prisma.BoolWithAggregatesFilter<"User"> | boolean
  image?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null
  createdAt?: Prisma.DateTimeWithAggregatesFilter<"User"> | Date | string
  updatedAt?: Prisma.DateTimeWithAggregatesFilter<"User"> | Date | string
  role?: Prisma.EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
  banned?: Prisma.BoolWithAggregatesFilter<"User"> | boolean
  banReason?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null
  archived?: Prisma.BoolWithAggregatesFilter<"User"> | boolean
}

export type UserCreateInput = {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  image?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  role?: $Enums.Role
  banned?: boolean
  banReason?: string | null
  archived?: boolean
  sessions?: Prisma.SessionCreateNestedManyWithoutUserInput
  accounts?: Prisma.AccountCreateNestedManyWithoutUserInput
  invitations?: Prisma.InvitationCreateNestedManyWithoutUserInput
}

export type UserUncheckedCreateInput = {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  image?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  role?: $Enums.Role
  banned?: boolean
  banReason?: string | null
  archived?: boolean
  sessions?: Prisma.SessionUncheckedCreateNestedManyWithoutUserInput
  accounts?: Prisma.AccountUncheckedCreateNestedManyWithoutUserInput
  invitations?: Prisma.InvitationUncheckedCreateNestedManyWithoutUserInput
}

export type UserUpdateInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  name?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  emailVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean
  image?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  banned?: Prisma.BoolFieldUpdateOperationsInput | boolean
  banReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  archived?: Prisma.BoolFieldUpdateOperationsInput | boolean
  sessions?: Prisma.SessionUpdateManyWithoutUserNestedInput
  accounts?: Prisma.AccountUpdateManyWithoutUserNestedInput
  invitations?: Prisma.InvitationUpdateManyWithoutUserNestedInput
}

export type UserUncheckedUpdateInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  name?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  emailVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean
  image?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  banned?: Prisma.BoolFieldUpdateOperationsInput | boolean
  banReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  archived?: Prisma.BoolFieldUpdateOperationsInput | boolean
  sessions?: Prisma.SessionUncheckedUpdateManyWithoutUserNestedInput
  accounts?: Prisma.AccountUncheckedUpdateManyWithoutUserNestedInput
  invitations?: Prisma.InvitationUncheckedUpdateManyWithoutUserNestedInput
}

export type UserCreateManyInput = {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  image?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  role?: $Enums.Role
  banned?: boolean
  banReason?: string | null
  archived?: boolean
}

export type UserUpdateManyMutationInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  name?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  emailVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean
  image?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  banned?: Prisma.BoolFieldUpdateOperationsInput | boolean
  banReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  archived?: Prisma.BoolFieldUpdateOperationsInput | boolean
}

export type UserUncheckedUpdateManyInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  name?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  emailVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean
  image?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  banned?: Prisma.BoolFieldUpdateOperationsInput | boolean
  banReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  archived?: Prisma.BoolFieldUpdateOperationsInput | boolean
}

export type UserCountOrderByAggregateInput = {
  id?: Prisma.SortOrder
  name?: Prisma.SortOrder
  email?: Prisma.SortOrder
  emailVerified?: Prisma.SortOrder
  image?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
  role?: Prisma.SortOrder
  banned?: Prisma.SortOrder
  banReason?: Prisma.SortOrder
  archived?: Prisma.SortOrder
}

export type UserMaxOrderByAggregateInput = {
  id?: Prisma.SortOrder
  name?: Prisma.SortOrder
  email?: Prisma.SortOrder
  emailVerified?: Prisma.SortOrder
  image?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
  role?: Prisma.SortOrder
  banned?: Prisma.SortOrder
  banReason?: Prisma.SortOrder
  archived?: Prisma.SortOrder
}

export type UserMinOrderByAggregateInput = {
  id?: Prisma.SortOrder
  name?: Prisma.SortOrder
  email?: Prisma.SortOrder
  emailVerified?: Prisma.SortOrder
  image?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
  role?: Prisma.SortOrder
  banned?: Prisma.SortOrder
  banReason?: Prisma.SortOrder
  archived?: Prisma.SortOrder
}

export type UserScalarRelationFilter = {
  is?: Prisma.UserWhereInput
  isNot?: Prisma.UserWhereInput
}

export type StringFieldUpdateOperationsInput = {
  set?: string
}

export type BoolFieldUpdateOperationsInput = {
  set?: boolean
}

export type NullableStringFieldUpdateOperationsInput = {
  set?: string | null
}

export type DateTimeFieldUpdateOperationsInput = {
  set?: Date | string
}

export type EnumRoleFieldUpdateOperationsInput = {
  set?: $Enums.Role
}

export type UserCreateNestedOneWithoutInvitationsInput = {
  create?: Prisma.XOR<Prisma.UserCreateWithoutInvitationsInput, Prisma.UserUncheckedCreateWithoutInvitationsInput>
  connectOrCreate?: Prisma.UserCreateOrConnectWithoutInvitationsInput
  connect?: Prisma.UserWhereUniqueInput
}

export type UserUpdateOneRequiredWithoutInvitationsNestedInput = {
  create?: Prisma.XOR<Prisma.UserCreateWithoutInvitationsInput, Prisma.UserUncheckedCreateWithoutInvitationsInput>
  connectOrCreate?: Prisma.UserCreateOrConnectWithoutInvitationsInput
  upsert?: Prisma.UserUpsertWithoutInvitationsInput
  connect?: Prisma.UserWhereUniqueInput
  update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutInvitationsInput, Prisma.UserUpdateWithoutInvitationsInput>, Prisma.UserUncheckedUpdateWithoutInvitationsInput>
}

export type UserCreateNestedOneWithoutSessionsInput = {
  create?: Prisma.XOR<Prisma.UserCreateWithoutSessionsInput, Prisma.UserUncheckedCreateWithoutSessionsInput>
  connectOrCreate?: Prisma.UserCreateOrConnectWithoutSessionsInput
  connect?: Prisma.UserWhereUniqueInput
}

export type UserUpdateOneRequiredWithoutSessionsNestedInput = {
  create?: Prisma.XOR<Prisma.UserCreateWithoutSessionsInput, Prisma.UserUncheckedCreateWithoutSessionsInput>
  connectOrCreate?: Prisma.UserCreateOrConnectWithoutSessionsInput
  upsert?: Prisma.UserUpsertWithoutSessionsInput
  connect?: Prisma.UserWhereUniqueInput
  update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutSessionsInput, Prisma.UserUpdateWithoutSessionsInput>, Prisma.UserUncheckedUpdateWithoutSessionsInput>
}

export type UserCreateNestedOneWithoutAccountsInput = {
  create?: Prisma.XOR<Prisma.UserCreateWithoutAccountsInput, Prisma.UserUncheckedCreateWithoutAccountsInput>
  connectOrCreate?: Prisma.UserCreateOrConnectWithoutAccountsInput
  connect?: Prisma.UserWhereUniqueInput
}

export type UserUpdateOneRequiredWithoutAccountsNestedInput = {
  create?: Prisma.XOR<Prisma.UserCreateWithoutAccountsInput, Prisma.UserUncheckedCreateWithoutAccountsInput>
  connectOrCreate?: Prisma.UserCreateOrConnectWithoutAccountsInput
  upsert?: Prisma.UserUpsertWithoutAccountsInput
  connect?: Prisma.UserWhereUniqueInput
  update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutAccountsInput, Prisma.UserUpdateWithoutAccountsInput>, Prisma.UserUncheckedUpdateWithoutAccountsInput>
}

export type UserCreateWithoutInvitationsInput = {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  image?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  role?: $Enums.Role
  banned?: boolean
  banReason?: string | null
  archived?: boolean
  sessions?: Prisma.SessionCreateNestedManyWithoutUserInput
  accounts?: Prisma.AccountCreateNestedManyWithoutUserInput
}

export type UserUncheckedCreateWithoutInvitationsInput = {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  image?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  role?: $Enums.Role
  banned?: boolean
  banReason?: string | null
  archived?: boolean
  sessions?: Prisma.SessionUncheckedCreateNestedManyWithoutUserInput
  accounts?: Prisma.AccountUncheckedCreateNestedManyWithoutUserInput
}

export type UserCreateOrConnectWithoutInvitationsInput = {
  where: Prisma.UserWhereUniqueInput
  create: Prisma.XOR<Prisma.UserCreateWithoutInvitationsInput, Prisma.UserUncheckedCreateWithoutInvitationsInput>
}

export type UserUpsertWithoutInvitationsInput = {
  update: Prisma.XOR<Prisma.UserUpdateWithoutInvitationsInput, Prisma.UserUncheckedUpdateWithoutInvitationsInput>
  create: Prisma.XOR<Prisma.UserCreateWithoutInvitationsInput, Prisma.UserUncheckedCreateWithoutInvitationsInput>
  where?: Prisma.UserWhereInput
}

export type UserUpdateToOneWithWhereWithoutInvitationsInput = {
  where?: Prisma.UserWhereInput
  data: Prisma.XOR<Prisma.UserUpdateWithoutInvitationsInput, Prisma.UserUncheckedUpdateWithoutInvitationsInput>
}

export type UserUpdateWithoutInvitationsInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  name?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  emailVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean
  image?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  banned?: Prisma.BoolFieldUpdateOperationsInput | boolean
  banReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  archived?: Prisma.BoolFieldUpdateOperationsInput | boolean
  sessions?: Prisma.SessionUpdateManyWithoutUserNestedInput
  accounts?: Prisma.AccountUpdateManyWithoutUserNestedInput
}

export type UserUncheckedUpdateWithoutInvitationsInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  name?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  emailVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean
  image?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  banned?: Prisma.BoolFieldUpdateOperationsInput | boolean
  banReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  archived?: Prisma.BoolFieldUpdateOperationsInput | boolean
  sessions?: Prisma.SessionUncheckedUpdateManyWithoutUserNestedInput
  accounts?: Prisma.AccountUncheckedUpdateManyWithoutUserNestedInput
}

export type UserCreateWithoutSessionsInput = {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  image?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  role?: $Enums.Role
  banned?: boolean
  banReason?: string | null
  archived?: boolean
  accounts?: Prisma.AccountCreateNestedManyWithoutUserInput
  invitations?: Prisma.InvitationCreateNestedManyWithoutUserInput
}

export type UserUncheckedCreateWithoutSessionsInput = {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  image?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  role?: $Enums.Role
  banned?: boolean
  banReason?: string | null
  archived?: boolean
  accounts?: Prisma.AccountUncheckedCreateNestedManyWithoutUserInput
  invitations?: Prisma.InvitationUncheckedCreateNestedManyWithoutUserInput
}

export type UserCreateOrConnectWithoutSessionsInput = {
  where: Prisma.UserWhereUniqueInput
  create: Prisma.XOR<Prisma.UserCreateWithoutSessionsInput, Prisma.UserUncheckedCreateWithoutSessionsInput>
}

export type UserUpsertWithoutSessionsInput = {
  update: Prisma.XOR<Prisma.UserUpdateWithoutSessionsInput, Prisma.UserUncheckedUpdateWithoutSessionsInput>
  create: Prisma.XOR<Prisma.UserCreateWithoutSessionsInput, Prisma.UserUncheckedCreateWithoutSessionsInput>
  where?: Prisma.UserWhereInput
}

export type UserUpdateToOneWithWhereWithoutSessionsInput = {
  where?: Prisma.UserWhereInput
  data: Prisma.XOR<Prisma.UserUpdateWithoutSessionsInput, Prisma.UserUncheckedUpdateWithoutSessionsInput>
}

export type UserUpdateWithoutSessionsInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  name?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  emailVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean
  image?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  banned?: Prisma.BoolFieldUpdateOperationsInput | boolean
  banReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  archived?: Prisma.BoolFieldUpdateOperationsInput | boolean
  accounts?: Prisma.AccountUpdateManyWithoutUserNestedInput
  invitations?: Prisma.InvitationUpdateManyWithoutUserNestedInput
}

export type UserUncheckedUpdateWithoutSessionsInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  name?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  emailVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean
  image?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  banned?: Prisma.BoolFieldUpdateOperationsInput | boolean
  banReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  archived?: Prisma.BoolFieldUpdateOperationsInput | boolean
  accounts?: Prisma.AccountUncheckedUpdateManyWithoutUserNestedInput
  invitations?: Prisma.InvitationUncheckedUpdateManyWithoutUserNestedInput
}

export type UserCreateWithoutAccountsInput = {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  image?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  role?: $Enums.Role
  banned?: boolean
  banReason?: string | null
  archived?: boolean
  sessions?: Prisma.SessionCreateNestedManyWithoutUserInput
  invitations?: Prisma.InvitationCreateNestedManyWithoutUserInput
}

export type UserUncheckedCreateWithoutAccountsInput = {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  image?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
  role?: $Enums.Role
  banned?: boolean
  banReason?: string | null
  archived?: boolean
  sessions?: Prisma.SessionUncheckedCreateNestedManyWithoutUserInput
  invitations?: Prisma.InvitationUncheckedCreateNestedManyWithoutUserInput
}

export type UserCreateOrConnectWithoutAccountsInput = {
  where: Prisma.UserWhereUniqueInput
  create: Prisma.XOR<Prisma.UserCreateWithoutAccountsInput, Prisma.UserUncheckedCreateWithoutAccountsInput>
}

export type UserUpsertWithoutAccountsInput = {
  update: Prisma.XOR<Prisma.UserUpdateWithoutAccountsInput, Prisma.UserUncheckedUpdateWithoutAccountsInput>
  create: Prisma.XOR<Prisma.UserCreateWithoutAccountsInput, Prisma.UserUncheckedCreateWithoutAccountsInput>
  where?: Prisma.UserWhereInput
}

export type UserUpdateToOneWithWhereWithoutAccountsInput = {
  where?: Prisma.UserWhereInput
  data: Prisma.XOR<Prisma.UserUpdateWithoutAccountsInput, Prisma.UserUncheckedUpdateWithoutAccountsInput>
}

export type UserUpdateWithoutAccountsInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  name?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  emailVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean
  image?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  banned?: Prisma.BoolFieldUpdateOperationsInput | boolean
  banReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  archived?: Prisma.BoolFieldUpdateOperationsInput | boolean
  sessions?: Prisma.SessionUpdateManyWithoutUserNestedInput
  invitations?: Prisma.InvitationUpdateManyWithoutUserNestedInput
}

export type UserUncheckedUpdateWithoutAccountsInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  name?: Prisma.StringFieldUpdateOperationsInput | string
  email?: Prisma.StringFieldUpdateOperationsInput | string
  emailVerified?: Prisma.BoolFieldUpdateOperationsInput | boolean
  image?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role
  banned?: Prisma.BoolFieldUpdateOperationsInput | boolean
  banReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null
  archived?: Prisma.BoolFieldUpdateOperationsInput | boolean
  sessions?: Prisma.SessionUncheckedUpdateManyWithoutUserNestedInput
  invitations?: Prisma.InvitationUncheckedUpdateManyWithoutUserNestedInput
}


/**
 * Count Type UserCountOutputType
 */

export type UserCountOutputType = {
  sessions: number
  accounts: number
  invitations: number
}

export type UserCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  sessions?: boolean | UserCountOutputTypeCountSessionsArgs
  accounts?: boolean | UserCountOutputTypeCountAccountsArgs
  invitations?: boolean | UserCountOutputTypeCountInvitationsArgs
}

/**
 * UserCountOutputType without action
 */
export type UserCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the UserCountOutputType
   */
  select?: Prisma.UserCountOutputTypeSelect<ExtArgs> | null
}

/**
 * UserCountOutputType without action
 */
export type UserCountOutputTypeCountSessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: Prisma.SessionWhereInput
}

/**
 * UserCountOutputType without action
 */
export type UserCountOutputTypeCountAccountsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: Prisma.AccountWhereInput
}

/**
 * UserCountOutputType without action
 */
export type UserCountOutputTypeCountInvitationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: Prisma.InvitationWhereInput
}


export type UserSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  name?: boolean
  email?: boolean
  emailVerified?: boolean
  image?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  role?: boolean
  banned?: boolean
  banReason?: boolean
  archived?: boolean
  sessions?: boolean | Prisma.User$sessionsArgs<ExtArgs>
  accounts?: boolean | Prisma.User$accountsArgs<ExtArgs>
  invitations?: boolean | Prisma.User$invitationsArgs<ExtArgs>
  _count?: boolean | Prisma.UserCountOutputTypeDefaultArgs<ExtArgs>
}, ExtArgs["result"]["user"]>

export type UserSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  name?: boolean
  email?: boolean
  emailVerified?: boolean
  image?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  role?: boolean
  banned?: boolean
  banReason?: boolean
  archived?: boolean
}, ExtArgs["result"]["user"]>

export type UserSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  name?: boolean
  email?: boolean
  emailVerified?: boolean
  image?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  role?: boolean
  banned?: boolean
  banReason?: boolean
  archived?: boolean
}, ExtArgs["result"]["user"]>

export type UserSelectScalar = {
  id?: boolean
  name?: boolean
  email?: boolean
  emailVerified?: boolean
  image?: boolean
  createdAt?: boolean
  updatedAt?: boolean
  role?: boolean
  banned?: boolean
  banReason?: boolean
  archived?: boolean
}

export type UserOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "email" | "emailVerified" | "image" | "createdAt" | "updatedAt" | "role" | "banned" | "banReason" | "archived", ExtArgs["result"]["user"]>
export type UserInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  sessions?: boolean | Prisma.User$sessionsArgs<ExtArgs>
  accounts?: boolean | Prisma.User$accountsArgs<ExtArgs>
  invitations?: boolean | Prisma.User$invitationsArgs<ExtArgs>
  _count?: boolean | Prisma.UserCountOutputTypeDefaultArgs<ExtArgs>
}
export type UserIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {}
export type UserIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {}

export type $UserPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  name: "User"
  objects: {
    sessions: Prisma.$SessionPayload<ExtArgs>[]
    accounts: Prisma.$AccountPayload<ExtArgs>[]
    invitations: Prisma.$InvitationPayload<ExtArgs>[]
  }
  scalars: runtime.Types.Extensions.GetPayloadResult<{
    id: string
    name: string
    email: string
    emailVerified: boolean
    image: string | null
    createdAt: Date
    updatedAt: Date
    role: $Enums.Role
    banned: boolean
    banReason: string | null
    archived: boolean
  }, ExtArgs["result"]["user"]>
  composites: {}
}

export type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UserPayload, S>

export type UserCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> =
  Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UserCountAggregateInputType | true
  }

export interface UserDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
  /**
   * Find zero or one User that matches the filter.
   * @param {UserFindUniqueArgs} args - Arguments to find a User
   * @example
   * // Get one User
   * const user = await prisma.user.findUnique({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUnique<T extends UserFindUniqueArgs>(args: Prisma.SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

  /**
   * Find one User that matches the filter or throw an error with `error.code='P2025'`
   * if no matches were found.
   * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
   * @example
   * // Get one User
   * const user = await prisma.user.findUniqueOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Find the first User that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserFindFirstArgs} args - Arguments to find a User
   * @example
   * // Get one User
   * const user = await prisma.user.findFirst({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirst<T extends UserFindFirstArgs>(args?: Prisma.SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

  /**
   * Find the first User that matches the filter or
   * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
   * @example
   * // Get one User
   * const user = await prisma.user.findFirstOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Find zero or more Users that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Users
   * const users = await prisma.user.findMany()
   * 
   * // Get first 10 Users
   * const users = await prisma.user.findMany({ take: 10 })
   * 
   * // Only select the `id`
   * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
   * 
   */
  findMany<T extends UserFindManyArgs>(args?: Prisma.SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

  /**
   * Create a User.
   * @param {UserCreateArgs} args - Arguments to create a User.
   * @example
   * // Create one User
   * const User = await prisma.user.create({
   *   data: {
   *     // ... data to create a User
   *   }
   * })
   * 
   */
  create<T extends UserCreateArgs>(args: Prisma.SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Create many Users.
   * @param {UserCreateManyArgs} args - Arguments to create many Users.
   * @example
   * // Create many Users
   * const user = await prisma.user.createMany({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *     
   */
  createMany<T extends UserCreateManyArgs>(args?: Prisma.SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Create many Users and returns the data saved in the database.
   * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
   * @example
   * // Create many Users
   * const user = await prisma.user.createManyAndReturn({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * 
   * // Create many Users and only return the `id`
   * const userWithIdOnly = await prisma.user.createManyAndReturn({
   *   select: { id: true },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * 
   */
  createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

  /**
   * Delete a User.
   * @param {UserDeleteArgs} args - Arguments to delete one User.
   * @example
   * // Delete one User
   * const User = await prisma.user.delete({
   *   where: {
   *     // ... filter to delete one User
   *   }
   * })
   * 
   */
  delete<T extends UserDeleteArgs>(args: Prisma.SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Update one User.
   * @param {UserUpdateArgs} args - Arguments to update one User.
   * @example
   * // Update one User
   * const user = await prisma.user.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
   */
  update<T extends UserUpdateArgs>(args: Prisma.SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Delete zero or more Users.
   * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
   * @example
   * // Delete a few Users
   * const { count } = await prisma.user.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
   */
  deleteMany<T extends UserDeleteManyArgs>(args?: Prisma.SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Update zero or more Users.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Users
   * const user = await prisma.user.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
   */
  updateMany<T extends UserUpdateManyArgs>(args: Prisma.SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Update zero or more Users and returns the data updated in the database.
   * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
   * @example
   * // Update many Users
   * const user = await prisma.user.updateManyAndReturn({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * 
   * // Update zero or more Users and only return the `id`
   * const userWithIdOnly = await prisma.user.updateManyAndReturn({
   *   select: { id: true },
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * 
   */
  updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

  /**
   * Create or update one User.
   * @param {UserUpsertArgs} args - Arguments to update or create a User.
   * @example
   * // Update or create a User
   * const user = await prisma.user.upsert({
   *   create: {
   *     // ... data to create a User
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the User we want to update
   *   }
   * })
   */
  upsert<T extends UserUpsertArgs>(args: Prisma.SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


  /**
   * Count the number of Users.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserCountArgs} args - Arguments to filter Users to count.
   * @example
   * // Count the number of Users
   * const count = await prisma.user.count({
   *   where: {
   *     // ... the filter for the Users we want to count
   *   }
   * })
  **/
  count<T extends UserCountArgs>(
    args?: Prisma.Subset<T, UserCountArgs>,
  ): Prisma.PrismaPromise<
    T extends runtime.Types.Utils.Record<'select', any>
      ? T['select'] extends true
        ? number
        : Prisma.GetScalarType<T['select'], UserCountAggregateOutputType>
      : number
  >

  /**
   * Allows you to perform aggregations operations on a User.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
   * @example
   * // Ordered by age ascending
   * // Where email contains prisma.io
   * // Limited to the 10 users
   * const aggregations = await prisma.user.aggregate({
   *   _avg: {
   *     age: true,
   *   },
   *   where: {
   *     email: {
   *       contains: "prisma.io",
   *     },
   *   },
   *   orderBy: {
   *     age: "asc",
   *   },
   *   take: 10,
   * })
  **/
  aggregate<T extends UserAggregateArgs>(args: Prisma.Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

  /**
   * Group by User.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {UserGroupByArgs} args - Group by arguments.
   * @example
   * // Group by city, order by createdAt, get count
   * const result = await prisma.user.groupBy({
   *   by: ['city', 'createdAt'],
   *   orderBy: {
   *     createdAt: true
   *   },
   *   _count: {
   *     _all: true
   *   },
   * })
   * 
  **/
  groupBy<
    T extends UserGroupByArgs,
    HasSelectOrTake extends Prisma.Or<
      Prisma.Extends<'skip', Prisma.Keys<T>>,
      Prisma.Extends<'take', Prisma.Keys<T>>
    >,
    OrderByArg extends Prisma.True extends HasSelectOrTake
      ? { orderBy: UserGroupByArgs['orderBy'] }
      : { orderBy?: UserGroupByArgs['orderBy'] },
    OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>,
    ByFields extends Prisma.MaybeTupleToUnion<T['by']>,
    ByValid extends Prisma.Has<ByFields, OrderFields>,
    HavingFields extends Prisma.GetHavingFields<T['having']>,
    HavingValid extends Prisma.Has<ByFields, HavingFields>,
    ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False,
    InputErrors extends ByEmpty extends Prisma.True
    ? `Error: "by" must not be empty.`
    : HavingValid extends Prisma.False
    ? {
        [P in HavingFields]: P extends ByFields
          ? never
          : P extends string
          ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
          : [
              Error,
              'Field ',
              P,
              ` in "having" needs to be provided in "by"`,
            ]
      }[HavingFields]
    : 'take' extends Prisma.Keys<T>
    ? 'orderBy' extends Prisma.Keys<T>
      ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
              ? never
              : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
          }[OrderFields]
      : 'Error: If you provide "take", you also need to provide "orderBy"'
    : 'skip' extends Prisma.Keys<T>
    ? 'orderBy' extends Prisma.Keys<T>
      ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
              ? never
              : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
          }[OrderFields]
      : 'Error: If you provide "skip", you also need to provide "orderBy"'
    : ByValid extends Prisma.True
    ? {}
    : {
        [P in OrderFields]: P extends ByFields
          ? never
          : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
      }[OrderFields]
  >(args: Prisma.SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
/**
 * Fields of the User model
 */
readonly fields: UserFieldRefs;
}

/**
 * The delegate class that acts as a "Promise-like" for User.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__UserClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
  readonly [Symbol.toStringTag]: "PrismaPromise"
  sessions<T extends Prisma.User$sessionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
  accounts<T extends Prisma.User$accountsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$accountsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
  invitations<T extends Prisma.User$invitationsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$invitationsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$InvitationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>
}




/**
 * Fields of the User model
 */
export interface UserFieldRefs {
  readonly id: Prisma.FieldRef<"User", 'String'>
  readonly name: Prisma.FieldRef<"User", 'String'>
  readonly email: Prisma.FieldRef<"User", 'String'>
  readonly emailVerified: Prisma.FieldRef<"User", 'Boolean'>
  readonly image: Prisma.FieldRef<"User", 'String'>
  readonly createdAt: Prisma.FieldRef<"User", 'DateTime'>
  readonly updatedAt: Prisma.FieldRef<"User", 'DateTime'>
  readonly role: Prisma.FieldRef<"User", 'Role'>
  readonly banned: Prisma.FieldRef<"User", 'Boolean'>
  readonly banReason: Prisma.FieldRef<"User", 'String'>
  readonly archived: Prisma.FieldRef<"User", 'Boolean'>
}
    

// Custom InputTypes
/**
 * User findUnique
 */
export type UserFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: Prisma.UserSelect<ExtArgs> | null
  /**
   * Omit specific fields from the User
   */
  omit?: Prisma.UserOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.UserInclude<ExtArgs> | null
  /**
   * Filter, which User to fetch.
   */
  where: Prisma.UserWhereUniqueInput
}

/**
 * User findUniqueOrThrow
 */
export type UserFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: Prisma.UserSelect<ExtArgs> | null
  /**
   * Omit specific fields from the User
   */
  omit?: Prisma.UserOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.UserInclude<ExtArgs> | null
  /**
   * Filter, which User to fetch.
   */
  where: Prisma.UserWhereUniqueInput
}

/**
 * User findFirst
 */
export type UserFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: Prisma.UserSelect<ExtArgs> | null
  /**
   * Omit specific fields from the User
   */
  omit?: Prisma.UserOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.UserInclude<ExtArgs> | null
  /**
   * Filter, which User to fetch.
   */
  where?: Prisma.UserWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Users to fetch.
   */
  orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for searching for Users.
   */
  cursor?: Prisma.UserWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Users from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Users.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   * 
   * Filter by unique combinations of Users.
   */
  distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[]
}

/**
 * User findFirstOrThrow
 */
export type UserFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: Prisma.UserSelect<ExtArgs> | null
  /**
   * Omit specific fields from the User
   */
  omit?: Prisma.UserOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.UserInclude<ExtArgs> | null
  /**
   * Filter, which User to fetch.
   */
  where?: Prisma.UserWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Users to fetch.
   */
  orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for searching for Users.
   */
  cursor?: Prisma.UserWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Users from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Users.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   * 
   * Filter by unique combinations of Users.
   */
  distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[]
}

/**
 * User findMany
 */
export type UserFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: Prisma.UserSelect<ExtArgs> | null
  /**
   * Omit specific fields from the User
   */
  omit?: Prisma.UserOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.UserInclude<ExtArgs> | null
  /**
   * Filter, which Users to fetch.
   */
  where?: Prisma.UserWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Users to fetch.
   */
  orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for listing Users.
   */
  cursor?: Prisma.UserWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Users from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Users.
   */
  skip?: number
  distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[]
}

/**
 * User create
 */
export type UserCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: Prisma.UserSelect<ExtArgs> | null
  /**
   * Omit specific fields from the User
   */
  omit?: Prisma.UserOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.UserInclude<ExtArgs> | null
  /**
   * The data needed to create a User.
   */
  data: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>
}

/**
 * User createMany
 */
export type UserCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to create many Users.
   */
  data: Prisma.UserCreateManyInput | Prisma.UserCreateManyInput[]
  skipDuplicates?: boolean
}

/**
 * User createManyAndReturn
 */
export type UserCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: Prisma.UserSelectCreateManyAndReturn<ExtArgs> | null
  /**
   * Omit specific fields from the User
   */
  omit?: Prisma.UserOmit<ExtArgs> | null
  /**
   * The data used to create many Users.
   */
  data: Prisma.UserCreateManyInput | Prisma.UserCreateManyInput[]
  skipDuplicates?: boolean
}

/**
 * User update
 */
export type UserUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: Prisma.UserSelect<ExtArgs> | null
  /**
   * Omit specific fields from the User
   */
  omit?: Prisma.UserOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.UserInclude<ExtArgs> | null
  /**
   * The data needed to update a User.
   */
  data: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>
  /**
   * Choose, which User to update.
   */
  where: Prisma.UserWhereUniqueInput
}

/**
 * User updateMany
 */
export type UserUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to update Users.
   */
  data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyInput>
  /**
   * Filter which Users to update
   */
  where?: Prisma.UserWhereInput
  /**
   * Limit how many Users to update.
   */
  limit?: number
}

/**
 * User updateManyAndReturn
 */
export type UserUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: Prisma.UserSelectUpdateManyAndReturn<ExtArgs> | null
  /**
   * Omit specific fields from the User
   */
  omit?: Prisma.UserOmit<ExtArgs> | null
  /**
   * The data used to update Users.
   */
  data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyInput>
  /**
   * Filter which Users to update
   */
  where?: Prisma.UserWhereInput
  /**
   * Limit how many Users to update.
   */
  limit?: number
}

/**
 * User upsert
 */
export type UserUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: Prisma.UserSelect<ExtArgs> | null
  /**
   * Omit specific fields from the User
   */
  omit?: Prisma.UserOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.UserInclude<ExtArgs> | null
  /**
   * The filter to search for the User to update in case it exists.
   */
  where: Prisma.UserWhereUniqueInput
  /**
   * In case the User found by the `where` argument doesn't exist, create a new User with this data.
   */
  create: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>
  /**
   * In case the User was found with the provided `where` argument, update it with this data.
   */
  update: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>
}

/**
 * User delete
 */
export type UserDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: Prisma.UserSelect<ExtArgs> | null
  /**
   * Omit specific fields from the User
   */
  omit?: Prisma.UserOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.UserInclude<ExtArgs> | null
  /**
   * Filter which User to delete.
   */
  where: Prisma.UserWhereUniqueInput
}

/**
 * User deleteMany
 */
export type UserDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Users to delete
   */
  where?: Prisma.UserWhereInput
  /**
   * Limit how many Users to delete.
   */
  limit?: number
}

/**
 * User.sessions
 */
export type User$sessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Session
   */
  select?: Prisma.SessionSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Session
   */
  omit?: Prisma.SessionOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.SessionInclude<ExtArgs> | null
  where?: Prisma.SessionWhereInput
  orderBy?: Prisma.SessionOrderByWithRelationInput | Prisma.SessionOrderByWithRelationInput[]
  cursor?: Prisma.SessionWhereUniqueInput
  take?: number
  skip?: number
  distinct?: Prisma.SessionScalarFieldEnum | Prisma.SessionScalarFieldEnum[]
}

/**
 * User.accounts
 */
export type User$accountsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Account
   */
  select?: Prisma.AccountSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Account
   */
  omit?: Prisma.AccountOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.AccountInclude<ExtArgs> | null
  where?: Prisma.AccountWhereInput
  orderBy?: Prisma.AccountOrderByWithRelationInput | Prisma.AccountOrderByWithRelationInput[]
  cursor?: Prisma.AccountWhereUniqueInput
  take?: number
  skip?: number
  distinct?: Prisma.AccountScalarFieldEnum | Prisma.AccountScalarFieldEnum[]
}

/**
 * User.invitations
 */
export type User$invitationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Invitation
   */
  select?: Prisma.InvitationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Invitation
   */
  omit?: Prisma.InvitationOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.InvitationInclude<ExtArgs> | null
  where?: Prisma.InvitationWhereInput
  orderBy?: Prisma.InvitationOrderByWithRelationInput | Prisma.InvitationOrderByWithRelationInput[]
  cursor?: Prisma.InvitationWhereUniqueInput
  take?: number
  skip?: number
  distinct?: Prisma.InvitationScalarFieldEnum | Prisma.InvitationScalarFieldEnum[]
}

/**
 * User without action
 */
export type UserDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the User
   */
  select?: Prisma.UserSelect<ExtArgs> | null
  /**
   * Omit specific fields from the User
   */
  omit?: Prisma.UserOmit<ExtArgs> | null
  /**
   * Choose, which related nodes to fetch as well
   */
  include?: Prisma.UserInclude<ExtArgs> | null
}
```

---

### `packages/db/prisma/generated/models/Verification.ts`

```typescript

/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * This file exports the `Verification` model and its related types.
 *
 * 🟢 You can import this file directly.
 */
import type * as runtime from "@prisma/client/runtime/client"
import type * as $Enums from "../enums"
import type * as Prisma from "../internal/prismaNamespace"

/**
 * Model Verification
 * 
 */
export type VerificationModel = runtime.Types.Result.DefaultSelection<Prisma.$VerificationPayload>

export type AggregateVerification = {
  _count: VerificationCountAggregateOutputType | null
  _min: VerificationMinAggregateOutputType | null
  _max: VerificationMaxAggregateOutputType | null
}

export type VerificationMinAggregateOutputType = {
  id: string | null
  identifier: string | null
  value: string | null
  expiresAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null
}

export type VerificationMaxAggregateOutputType = {
  id: string | null
  identifier: string | null
  value: string | null
  expiresAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null
}

export type VerificationCountAggregateOutputType = {
  id: number
  identifier: number
  value: number
  expiresAt: number
  createdAt: number
  updatedAt: number
  _all: number
}


export type VerificationMinAggregateInputType = {
  id?: true
  identifier?: true
  value?: true
  expiresAt?: true
  createdAt?: true
  updatedAt?: true
}

export type VerificationMaxAggregateInputType = {
  id?: true
  identifier?: true
  value?: true
  expiresAt?: true
  createdAt?: true
  updatedAt?: true
}

export type VerificationCountAggregateInputType = {
  id?: true
  identifier?: true
  value?: true
  expiresAt?: true
  createdAt?: true
  updatedAt?: true
  _all?: true
}

export type VerificationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Verification to aggregate.
   */
  where?: Prisma.VerificationWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Verifications to fetch.
   */
  orderBy?: Prisma.VerificationOrderByWithRelationInput | Prisma.VerificationOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the start position
   */
  cursor?: Prisma.VerificationWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Verifications from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Verifications.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Count returned Verifications
  **/
  _count?: true | VerificationCountAggregateInputType
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Select which fields to find the minimum value
  **/
  _min?: VerificationMinAggregateInputType
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
   * 
   * Select which fields to find the maximum value
  **/
  _max?: VerificationMaxAggregateInputType
}

export type GetVerificationAggregateType<T extends VerificationAggregateArgs> = {
      [P in keyof T & keyof AggregateVerification]: P extends '_count' | 'count'
    ? T[P] extends true
      ? number
      : Prisma.GetScalarType<T[P], AggregateVerification[P]>
    : Prisma.GetScalarType<T[P], AggregateVerification[P]>
}




export type VerificationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  where?: Prisma.VerificationWhereInput
  orderBy?: Prisma.VerificationOrderByWithAggregationInput | Prisma.VerificationOrderByWithAggregationInput[]
  by: Prisma.VerificationScalarFieldEnum[] | Prisma.VerificationScalarFieldEnum
  having?: Prisma.VerificationScalarWhereWithAggregatesInput
  take?: number
  skip?: number
  _count?: VerificationCountAggregateInputType | true
  _min?: VerificationMinAggregateInputType
  _max?: VerificationMaxAggregateInputType
}

export type VerificationGroupByOutputType = {
  id: string
  identifier: string
  value: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  _count: VerificationCountAggregateOutputType | null
  _min: VerificationMinAggregateOutputType | null
  _max: VerificationMaxAggregateOutputType | null
}

type GetVerificationGroupByPayload<T extends VerificationGroupByArgs> = Prisma.PrismaPromise<
  Array<
    Prisma.PickEnumerable<VerificationGroupByOutputType, T['by']> &
      {
        [P in ((keyof T) & (keyof VerificationGroupByOutputType))]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : Prisma.GetScalarType<T[P], VerificationGroupByOutputType[P]>
          : Prisma.GetScalarType<T[P], VerificationGroupByOutputType[P]>
      }
    >
  >



export type VerificationWhereInput = {
  AND?: Prisma.VerificationWhereInput | Prisma.VerificationWhereInput[]
  OR?: Prisma.VerificationWhereInput[]
  NOT?: Prisma.VerificationWhereInput | Prisma.VerificationWhereInput[]
  id?: Prisma.StringFilter<"Verification"> | string
  identifier?: Prisma.StringFilter<"Verification"> | string
  value?: Prisma.StringFilter<"Verification"> | string
  expiresAt?: Prisma.DateTimeFilter<"Verification"> | Date | string
  createdAt?: Prisma.DateTimeFilter<"Verification"> | Date | string
  updatedAt?: Prisma.DateTimeFilter<"Verification"> | Date | string
}

export type VerificationOrderByWithRelationInput = {
  id?: Prisma.SortOrder
  identifier?: Prisma.SortOrder
  value?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
}

export type VerificationWhereUniqueInput = Prisma.AtLeast<{
  id?: string
  AND?: Prisma.VerificationWhereInput | Prisma.VerificationWhereInput[]
  OR?: Prisma.VerificationWhereInput[]
  NOT?: Prisma.VerificationWhereInput | Prisma.VerificationWhereInput[]
  identifier?: Prisma.StringFilter<"Verification"> | string
  value?: Prisma.StringFilter<"Verification"> | string
  expiresAt?: Prisma.DateTimeFilter<"Verification"> | Date | string
  createdAt?: Prisma.DateTimeFilter<"Verification"> | Date | string
  updatedAt?: Prisma.DateTimeFilter<"Verification"> | Date | string
}, "id">

export type VerificationOrderByWithAggregationInput = {
  id?: Prisma.SortOrder
  identifier?: Prisma.SortOrder
  value?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
  _count?: Prisma.VerificationCountOrderByAggregateInput
  _max?: Prisma.VerificationMaxOrderByAggregateInput
  _min?: Prisma.VerificationMinOrderByAggregateInput
}

export type VerificationScalarWhereWithAggregatesInput = {
  AND?: Prisma.VerificationScalarWhereWithAggregatesInput | Prisma.VerificationScalarWhereWithAggregatesInput[]
  OR?: Prisma.VerificationScalarWhereWithAggregatesInput[]
  NOT?: Prisma.VerificationScalarWhereWithAggregatesInput | Prisma.VerificationScalarWhereWithAggregatesInput[]
  id?: Prisma.StringWithAggregatesFilter<"Verification"> | string
  identifier?: Prisma.StringWithAggregatesFilter<"Verification"> | string
  value?: Prisma.StringWithAggregatesFilter<"Verification"> | string
  expiresAt?: Prisma.DateTimeWithAggregatesFilter<"Verification"> | Date | string
  createdAt?: Prisma.DateTimeWithAggregatesFilter<"Verification"> | Date | string
  updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Verification"> | Date | string
}

export type VerificationCreateInput = {
  id: string
  identifier: string
  value: string
  expiresAt: Date | string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type VerificationUncheckedCreateInput = {
  id: string
  identifier: string
  value: string
  expiresAt: Date | string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type VerificationUpdateInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  identifier?: Prisma.StringFieldUpdateOperationsInput | string
  value?: Prisma.StringFieldUpdateOperationsInput | string
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type VerificationUncheckedUpdateInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  identifier?: Prisma.StringFieldUpdateOperationsInput | string
  value?: Prisma.StringFieldUpdateOperationsInput | string
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type VerificationCreateManyInput = {
  id: string
  identifier: string
  value: string
  expiresAt: Date | string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type VerificationUpdateManyMutationInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  identifier?: Prisma.StringFieldUpdateOperationsInput | string
  value?: Prisma.StringFieldUpdateOperationsInput | string
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type VerificationUncheckedUpdateManyInput = {
  id?: Prisma.StringFieldUpdateOperationsInput | string
  identifier?: Prisma.StringFieldUpdateOperationsInput | string
  value?: Prisma.StringFieldUpdateOperationsInput | string
  expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
  updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string
}

export type VerificationCountOrderByAggregateInput = {
  id?: Prisma.SortOrder
  identifier?: Prisma.SortOrder
  value?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
}

export type VerificationMaxOrderByAggregateInput = {
  id?: Prisma.SortOrder
  identifier?: Prisma.SortOrder
  value?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
}

export type VerificationMinOrderByAggregateInput = {
  id?: Prisma.SortOrder
  identifier?: Prisma.SortOrder
  value?: Prisma.SortOrder
  expiresAt?: Prisma.SortOrder
  createdAt?: Prisma.SortOrder
  updatedAt?: Prisma.SortOrder
}



export type VerificationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  identifier?: boolean
  value?: boolean
  expiresAt?: boolean
  createdAt?: boolean
  updatedAt?: boolean
}, ExtArgs["result"]["verification"]>

export type VerificationSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  identifier?: boolean
  value?: boolean
  expiresAt?: boolean
  createdAt?: boolean
  updatedAt?: boolean
}, ExtArgs["result"]["verification"]>

export type VerificationSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
  id?: boolean
  identifier?: boolean
  value?: boolean
  expiresAt?: boolean
  createdAt?: boolean
  updatedAt?: boolean
}, ExtArgs["result"]["verification"]>

export type VerificationSelectScalar = {
  id?: boolean
  identifier?: boolean
  value?: boolean
  expiresAt?: boolean
  createdAt?: boolean
  updatedAt?: boolean
}

export type VerificationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "identifier" | "value" | "expiresAt" | "createdAt" | "updatedAt", ExtArgs["result"]["verification"]>

export type $VerificationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  name: "Verification"
  objects: {}
  scalars: runtime.Types.Extensions.GetPayloadResult<{
    id: string
    identifier: string
    value: string
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
  }, ExtArgs["result"]["verification"]>
  composites: {}
}

export type VerificationGetPayload<S extends boolean | null | undefined | VerificationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$VerificationPayload, S>

export type VerificationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> =
  Omit<VerificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: VerificationCountAggregateInputType | true
  }

export interface VerificationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Verification'], meta: { name: 'Verification' } }
  /**
   * Find zero or one Verification that matches the filter.
   * @param {VerificationFindUniqueArgs} args - Arguments to find a Verification
   * @example
   * // Get one Verification
   * const verification = await prisma.verification.findUnique({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUnique<T extends VerificationFindUniqueArgs>(args: Prisma.SelectSubset<T, VerificationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__VerificationClient<runtime.Types.Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

  /**
   * Find one Verification that matches the filter or throw an error with `error.code='P2025'`
   * if no matches were found.
   * @param {VerificationFindUniqueOrThrowArgs} args - Arguments to find a Verification
   * @example
   * // Get one Verification
   * const verification = await prisma.verification.findUniqueOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findUniqueOrThrow<T extends VerificationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, VerificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__VerificationClient<runtime.Types.Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Find the first Verification that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationFindFirstArgs} args - Arguments to find a Verification
   * @example
   * // Get one Verification
   * const verification = await prisma.verification.findFirst({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirst<T extends VerificationFindFirstArgs>(args?: Prisma.SelectSubset<T, VerificationFindFirstArgs<ExtArgs>>): Prisma.Prisma__VerificationClient<runtime.Types.Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

  /**
   * Find the first Verification that matches the filter or
   * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationFindFirstOrThrowArgs} args - Arguments to find a Verification
   * @example
   * // Get one Verification
   * const verification = await prisma.verification.findFirstOrThrow({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   */
  findFirstOrThrow<T extends VerificationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, VerificationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__VerificationClient<runtime.Types.Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Find zero or more Verifications that matches the filter.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationFindManyArgs} args - Arguments to filter and select certain fields only.
   * @example
   * // Get all Verifications
   * const verifications = await prisma.verification.findMany()
   * 
   * // Get first 10 Verifications
   * const verifications = await prisma.verification.findMany({ take: 10 })
   * 
   * // Only select the `id`
   * const verificationWithIdOnly = await prisma.verification.findMany({ select: { id: true } })
   * 
   */
  findMany<T extends VerificationFindManyArgs>(args?: Prisma.SelectSubset<T, VerificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

  /**
   * Create a Verification.
   * @param {VerificationCreateArgs} args - Arguments to create a Verification.
   * @example
   * // Create one Verification
   * const Verification = await prisma.verification.create({
   *   data: {
   *     // ... data to create a Verification
   *   }
   * })
   * 
   */
  create<T extends VerificationCreateArgs>(args: Prisma.SelectSubset<T, VerificationCreateArgs<ExtArgs>>): Prisma.Prisma__VerificationClient<runtime.Types.Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Create many Verifications.
   * @param {VerificationCreateManyArgs} args - Arguments to create many Verifications.
   * @example
   * // Create many Verifications
   * const verification = await prisma.verification.createMany({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   *     
   */
  createMany<T extends VerificationCreateManyArgs>(args?: Prisma.SelectSubset<T, VerificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Create many Verifications and returns the data saved in the database.
   * @param {VerificationCreateManyAndReturnArgs} args - Arguments to create many Verifications.
   * @example
   * // Create many Verifications
   * const verification = await prisma.verification.createManyAndReturn({
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * 
   * // Create many Verifications and only return the `id`
   * const verificationWithIdOnly = await prisma.verification.createManyAndReturn({
   *   select: { id: true },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * 
   */
  createManyAndReturn<T extends VerificationCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, VerificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

  /**
   * Delete a Verification.
   * @param {VerificationDeleteArgs} args - Arguments to delete one Verification.
   * @example
   * // Delete one Verification
   * const Verification = await prisma.verification.delete({
   *   where: {
   *     // ... filter to delete one Verification
   *   }
   * })
   * 
   */
  delete<T extends VerificationDeleteArgs>(args: Prisma.SelectSubset<T, VerificationDeleteArgs<ExtArgs>>): Prisma.Prisma__VerificationClient<runtime.Types.Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Update one Verification.
   * @param {VerificationUpdateArgs} args - Arguments to update one Verification.
   * @example
   * // Update one Verification
   * const verification = await prisma.verification.update({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
   */
  update<T extends VerificationUpdateArgs>(args: Prisma.SelectSubset<T, VerificationUpdateArgs<ExtArgs>>): Prisma.Prisma__VerificationClient<runtime.Types.Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

  /**
   * Delete zero or more Verifications.
   * @param {VerificationDeleteManyArgs} args - Arguments to filter Verifications to delete.
   * @example
   * // Delete a few Verifications
   * const { count } = await prisma.verification.deleteMany({
   *   where: {
   *     // ... provide filter here
   *   }
   * })
   * 
   */
  deleteMany<T extends VerificationDeleteManyArgs>(args?: Prisma.SelectSubset<T, VerificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Update zero or more Verifications.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationUpdateManyArgs} args - Arguments to update one or more rows.
   * @example
   * // Update many Verifications
   * const verification = await prisma.verification.updateMany({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: {
   *     // ... provide data here
   *   }
   * })
   * 
   */
  updateMany<T extends VerificationUpdateManyArgs>(args: Prisma.SelectSubset<T, VerificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>

  /**
   * Update zero or more Verifications and returns the data updated in the database.
   * @param {VerificationUpdateManyAndReturnArgs} args - Arguments to update many Verifications.
   * @example
   * // Update many Verifications
   * const verification = await prisma.verification.updateManyAndReturn({
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * 
   * // Update zero or more Verifications and only return the `id`
   * const verificationWithIdOnly = await prisma.verification.updateManyAndReturn({
   *   select: { id: true },
   *   where: {
   *     // ... provide filter here
   *   },
   *   data: [
   *     // ... provide data here
   *   ]
   * })
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * 
   */
  updateManyAndReturn<T extends VerificationUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, VerificationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

  /**
   * Create or update one Verification.
   * @param {VerificationUpsertArgs} args - Arguments to update or create a Verification.
   * @example
   * // Update or create a Verification
   * const verification = await prisma.verification.upsert({
   *   create: {
   *     // ... data to create a Verification
   *   },
   *   update: {
   *     // ... in case it already exists, update
   *   },
   *   where: {
   *     // ... the filter for the Verification we want to update
   *   }
   * })
   */
  upsert<T extends VerificationUpsertArgs>(args: Prisma.SelectSubset<T, VerificationUpsertArgs<ExtArgs>>): Prisma.Prisma__VerificationClient<runtime.Types.Result.GetResult<Prisma.$VerificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


  /**
   * Count the number of Verifications.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationCountArgs} args - Arguments to filter Verifications to count.
   * @example
   * // Count the number of Verifications
   * const count = await prisma.verification.count({
   *   where: {
   *     // ... the filter for the Verifications we want to count
   *   }
   * })
  **/
  count<T extends VerificationCountArgs>(
    args?: Prisma.Subset<T, VerificationCountArgs>,
  ): Prisma.PrismaPromise<
    T extends runtime.Types.Utils.Record<'select', any>
      ? T['select'] extends true
        ? number
        : Prisma.GetScalarType<T['select'], VerificationCountAggregateOutputType>
      : number
  >

  /**
   * Allows you to perform aggregations operations on a Verification.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
   * @example
   * // Ordered by age ascending
   * // Where email contains prisma.io
   * // Limited to the 10 users
   * const aggregations = await prisma.user.aggregate({
   *   _avg: {
   *     age: true,
   *   },
   *   where: {
   *     email: {
   *       contains: "prisma.io",
   *     },
   *   },
   *   orderBy: {
   *     age: "asc",
   *   },
   *   take: 10,
   * })
  **/
  aggregate<T extends VerificationAggregateArgs>(args: Prisma.Subset<T, VerificationAggregateArgs>): Prisma.PrismaPromise<GetVerificationAggregateType<T>>

  /**
   * Group by Verification.
   * Note, that providing `undefined` is treated as the value not being there.
   * Read more here: https://pris.ly/d/null-undefined
   * @param {VerificationGroupByArgs} args - Group by arguments.
   * @example
   * // Group by city, order by createdAt, get count
   * const result = await prisma.user.groupBy({
   *   by: ['city', 'createdAt'],
   *   orderBy: {
   *     createdAt: true
   *   },
   *   _count: {
   *     _all: true
   *   },
   * })
   * 
  **/
  groupBy<
    T extends VerificationGroupByArgs,
    HasSelectOrTake extends Prisma.Or<
      Prisma.Extends<'skip', Prisma.Keys<T>>,
      Prisma.Extends<'take', Prisma.Keys<T>>
    >,
    OrderByArg extends Prisma.True extends HasSelectOrTake
      ? { orderBy: VerificationGroupByArgs['orderBy'] }
      : { orderBy?: VerificationGroupByArgs['orderBy'] },
    OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>,
    ByFields extends Prisma.MaybeTupleToUnion<T['by']>,
    ByValid extends Prisma.Has<ByFields, OrderFields>,
    HavingFields extends Prisma.GetHavingFields<T['having']>,
    HavingValid extends Prisma.Has<ByFields, HavingFields>,
    ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False,
    InputErrors extends ByEmpty extends Prisma.True
    ? `Error: "by" must not be empty.`
    : HavingValid extends Prisma.False
    ? {
        [P in HavingFields]: P extends ByFields
          ? never
          : P extends string
          ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
          : [
              Error,
              'Field ',
              P,
              ` in "having" needs to be provided in "by"`,
            ]
      }[HavingFields]
    : 'take' extends Prisma.Keys<T>
    ? 'orderBy' extends Prisma.Keys<T>
      ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
              ? never
              : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
          }[OrderFields]
      : 'Error: If you provide "take", you also need to provide "orderBy"'
    : 'skip' extends Prisma.Keys<T>
    ? 'orderBy' extends Prisma.Keys<T>
      ? ByValid extends Prisma.True
        ? {}
        : {
            [P in OrderFields]: P extends ByFields
              ? never
              : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
          }[OrderFields]
      : 'Error: If you provide "skip", you also need to provide "orderBy"'
    : ByValid extends Prisma.True
    ? {}
    : {
        [P in OrderFields]: P extends ByFields
          ? never
          : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
      }[OrderFields]
  >(args: Prisma.SubsetIntersection<T, VerificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
/**
 * Fields of the Verification model
 */
readonly fields: VerificationFieldRefs;
}

/**
 * The delegate class that acts as a "Promise-like" for Verification.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__VerificationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
  readonly [Symbol.toStringTag]: "PrismaPromise"
  /**
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>
  /**
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>
  /**
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>
}




/**
 * Fields of the Verification model
 */
export interface VerificationFieldRefs {
  readonly id: Prisma.FieldRef<"Verification", 'String'>
  readonly identifier: Prisma.FieldRef<"Verification", 'String'>
  readonly value: Prisma.FieldRef<"Verification", 'String'>
  readonly expiresAt: Prisma.FieldRef<"Verification", 'DateTime'>
  readonly createdAt: Prisma.FieldRef<"Verification", 'DateTime'>
  readonly updatedAt: Prisma.FieldRef<"Verification", 'DateTime'>
}
    

// Custom InputTypes
/**
 * Verification findUnique
 */
export type VerificationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: Prisma.VerificationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Verification
   */
  omit?: Prisma.VerificationOmit<ExtArgs> | null
  /**
   * Filter, which Verification to fetch.
   */
  where: Prisma.VerificationWhereUniqueInput
}

/**
 * Verification findUniqueOrThrow
 */
export type VerificationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: Prisma.VerificationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Verification
   */
  omit?: Prisma.VerificationOmit<ExtArgs> | null
  /**
   * Filter, which Verification to fetch.
   */
  where: Prisma.VerificationWhereUniqueInput
}

/**
 * Verification findFirst
 */
export type VerificationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: Prisma.VerificationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Verification
   */
  omit?: Prisma.VerificationOmit<ExtArgs> | null
  /**
   * Filter, which Verification to fetch.
   */
  where?: Prisma.VerificationWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Verifications to fetch.
   */
  orderBy?: Prisma.VerificationOrderByWithRelationInput | Prisma.VerificationOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for searching for Verifications.
   */
  cursor?: Prisma.VerificationWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Verifications from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Verifications.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   * 
   * Filter by unique combinations of Verifications.
   */
  distinct?: Prisma.VerificationScalarFieldEnum | Prisma.VerificationScalarFieldEnum[]
}

/**
 * Verification findFirstOrThrow
 */
export type VerificationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: Prisma.VerificationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Verification
   */
  omit?: Prisma.VerificationOmit<ExtArgs> | null
  /**
   * Filter, which Verification to fetch.
   */
  where?: Prisma.VerificationWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Verifications to fetch.
   */
  orderBy?: Prisma.VerificationOrderByWithRelationInput | Prisma.VerificationOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for searching for Verifications.
   */
  cursor?: Prisma.VerificationWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Verifications from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Verifications.
   */
  skip?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
   * 
   * Filter by unique combinations of Verifications.
   */
  distinct?: Prisma.VerificationScalarFieldEnum | Prisma.VerificationScalarFieldEnum[]
}

/**
 * Verification findMany
 */
export type VerificationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: Prisma.VerificationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Verification
   */
  omit?: Prisma.VerificationOmit<ExtArgs> | null
  /**
   * Filter, which Verifications to fetch.
   */
  where?: Prisma.VerificationWhereInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
   * 
   * Determine the order of Verifications to fetch.
   */
  orderBy?: Prisma.VerificationOrderByWithRelationInput | Prisma.VerificationOrderByWithRelationInput[]
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
   * 
   * Sets the position for listing Verifications.
   */
  cursor?: Prisma.VerificationWhereUniqueInput
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Take `±n` Verifications from the position of the cursor.
   */
  take?: number
  /**
   * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
   * 
   * Skip the first `n` Verifications.
   */
  skip?: number
  distinct?: Prisma.VerificationScalarFieldEnum | Prisma.VerificationScalarFieldEnum[]
}

/**
 * Verification create
 */
export type VerificationCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: Prisma.VerificationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Verification
   */
  omit?: Prisma.VerificationOmit<ExtArgs> | null
  /**
   * The data needed to create a Verification.
   */
  data: Prisma.XOR<Prisma.VerificationCreateInput, Prisma.VerificationUncheckedCreateInput>
}

/**
 * Verification createMany
 */
export type VerificationCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to create many Verifications.
   */
  data: Prisma.VerificationCreateManyInput | Prisma.VerificationCreateManyInput[]
  skipDuplicates?: boolean
}

/**
 * Verification createManyAndReturn
 */
export type VerificationCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: Prisma.VerificationSelectCreateManyAndReturn<ExtArgs> | null
  /**
   * Omit specific fields from the Verification
   */
  omit?: Prisma.VerificationOmit<ExtArgs> | null
  /**
   * The data used to create many Verifications.
   */
  data: Prisma.VerificationCreateManyInput | Prisma.VerificationCreateManyInput[]
  skipDuplicates?: boolean
}

/**
 * Verification update
 */
export type VerificationUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: Prisma.VerificationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Verification
   */
  omit?: Prisma.VerificationOmit<ExtArgs> | null
  /**
   * The data needed to update a Verification.
   */
  data: Prisma.XOR<Prisma.VerificationUpdateInput, Prisma.VerificationUncheckedUpdateInput>
  /**
   * Choose, which Verification to update.
   */
  where: Prisma.VerificationWhereUniqueInput
}

/**
 * Verification updateMany
 */
export type VerificationUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * The data used to update Verifications.
   */
  data: Prisma.XOR<Prisma.VerificationUpdateManyMutationInput, Prisma.VerificationUncheckedUpdateManyInput>
  /**
   * Filter which Verifications to update
   */
  where?: Prisma.VerificationWhereInput
  /**
   * Limit how many Verifications to update.
   */
  limit?: number
}

/**
 * Verification updateManyAndReturn
 */
export type VerificationUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: Prisma.VerificationSelectUpdateManyAndReturn<ExtArgs> | null
  /**
   * Omit specific fields from the Verification
   */
  omit?: Prisma.VerificationOmit<ExtArgs> | null
  /**
   * The data used to update Verifications.
   */
  data: Prisma.XOR<Prisma.VerificationUpdateManyMutationInput, Prisma.VerificationUncheckedUpdateManyInput>
  /**
   * Filter which Verifications to update
   */
  where?: Prisma.VerificationWhereInput
  /**
   * Limit how many Verifications to update.
   */
  limit?: number
}

/**
 * Verification upsert
 */
export type VerificationUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: Prisma.VerificationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Verification
   */
  omit?: Prisma.VerificationOmit<ExtArgs> | null
  /**
   * The filter to search for the Verification to update in case it exists.
   */
  where: Prisma.VerificationWhereUniqueInput
  /**
   * In case the Verification found by the `where` argument doesn't exist, create a new Verification with this data.
   */
  create: Prisma.XOR<Prisma.VerificationCreateInput, Prisma.VerificationUncheckedCreateInput>
  /**
   * In case the Verification was found with the provided `where` argument, update it with this data.
   */
  update: Prisma.XOR<Prisma.VerificationUpdateInput, Prisma.VerificationUncheckedUpdateInput>
}

/**
 * Verification delete
 */
export type VerificationDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: Prisma.VerificationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Verification
   */
  omit?: Prisma.VerificationOmit<ExtArgs> | null
  /**
   * Filter which Verification to delete.
   */
  where: Prisma.VerificationWhereUniqueInput
}

/**
 * Verification deleteMany
 */
export type VerificationDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Filter which Verifications to delete
   */
  where?: Prisma.VerificationWhereInput
  /**
   * Limit how many Verifications to delete.
   */
  limit?: number
}

/**
 * Verification without action
 */
export type VerificationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
  /**
   * Select specific fields to fetch from the Verification
   */
  select?: Prisma.VerificationSelect<ExtArgs> | null
  /**
   * Omit specific fields from the Verification
   */
  omit?: Prisma.VerificationOmit<ExtArgs> | null
}
```

---

### `packages/db/prisma/generated/models.ts`

```typescript

/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * This is a barrel export file for all models and their related types.
 *
 * 🟢 You can import this file directly.
 */
export type * from './models/User'
export type * from './models/Invitation'
export type * from './models/Session'
export type * from './models/Account'
export type * from './models/Verification'
export type * from './commonInputTypes'
```

---

### `packages/db/prisma/migrations/20260102181519_init/migration.sql`

```sql
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'USER');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

### `packages/db/prisma/migrations/20260103173633_user_invitation/migration.sql`

```sql
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

### `packages/db/prisma/migrations/migration_lock.toml`

```
# Please do not edit this file manually
# It should be added in your version-control system (e.g., Git)
provider = "postgresql"
```

---

### `packages/db/prisma/schema/auth.prisma`

```
enum Role {
  OWNER
  ADMIN
  USER
}

model User {
  id            String    @id
  name          String
  email         String
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]
  role          Role      @default(USER)
  banned        Boolean   @default(false)
  banReason     String?
  archived      Boolean   @default(false)

  invitations Invitation[]

  @@unique([email])
  @@map("user")
}

model Invitation {
  id        String   @id @default(cuid())
  email     String
  role      Role     @default(USER)
  expiresAt DateTime
  inviterId String
  user      User     @relation(fields: [inviterId], references: [id], onDelete: Cascade)
  status    String   @default("pending") // pending, accepted, rejected
  createdAt DateTime @default(now())

  @@map("invitation")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}
```

---

### `packages/db/prisma/schema/schema.prisma`

```
generator client {
  provider = "prisma-client"
  output   = "../generated"
  moduleFormat = "esm"
  runtime = "bun"
}

datasource db {
  provider = "postgresql"
}
```

---

### `packages/db/prisma.config.ts`

```typescript
import dotenv from "dotenv";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

dotenv.config({
  path: "../../apps/server/.env",
});

export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

---

### `packages/db/src/index.ts`

```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@env/server";

import { PrismaClient } from "../prisma/generated/client";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export * from "../prisma/generated/client";
export default prisma;
```

---

### `packages/db/tsconfig.json`

```json
{
  "extends": "../config/tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@env/*": ["../env/src/*"],
      "@config": ["../config/src/config.ts"]
    }
  }
}
```

---

### `tsconfig.json`

```json
{
  "extends": "./packages/config/tsconfig.base.json"
}
```

---

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "db:push": {
      "cache": false,
      "persistent": true
    },
    "db:studio": {
      "cache": false,
      "persistent": true
    },
    "db:migrate": {
      "cache": false,
      "persistent": true
    },
    "db:generate": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

