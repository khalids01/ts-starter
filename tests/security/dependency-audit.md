# Dependency audit disposition

Reviewed: 2026-10-03 (V3 Step 12). This supersedes the 2026-09-23 snapshot: new advisories made its zero-critical/runtime-patched statement stale. Do not treat an earlier temporary disposition as approval of a newly published finding.

## Targeted remediation

| Package | Before → locked after | Evidence / scope |
| --- | --- | --- |
| Elysia | 1.4.27 → 1.4.30 | [Multipart denial of service advisory](https://github.com/elysiajs/elysia/security/advisories/GHSA-9643-4qgh-g8mx), patched from 1.4.29. Direct API runtime dependency. |
| Nodemailer | 9.1.1 → 10.0.13 | [Address parser advisory](https://github.com/nodemailer/nodemailer/security/advisories/GHSA-prgh-xp8r-p3m5), [recipient parser advisory](https://github.com/nodemailer/nodemailer/security/advisories/GHSA-v53p-9fqp-m79j). All three workspace declarations require at least 10.0.6; application email template/MIME composition tested using an in-memory stream, with no SMTP connection. |
| Next.js | 16.3.3 → 16.3.6 | [Critical ImageResponse advisory](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j). Root override corrects React Email UI's exact transitive pin. Next is email-preview tooling, not this TanStack storefront framework. |

`bun install --ignore-scripts` deliberately avoided installation hooks/Prisma commands. No schema or database migration was needed. The lockfile changes only these targeted packages and Next's matching platform packages.

## Remaining findings: reviewed exposure, NOT user-accepted risk

Final `bun audit --json`: **33 advisories, 12 high, 0 critical**, across 13 package names. The audit still exits nonzero. Raw before/intermediate/final JSON is ignored under `tests/artifacts/step12/`. Package-name counts are not exploit counts.

| Package(s) | Traced dependency use | Required disposition |
| --- | --- | --- |
| `deepmerge-ts`, `mysql2` | Prisma CLI/configuration and optional MySQL driver. Application Prisma adapter is PostgreSQL. | Keep CLI/configuration isolated from request input; obtain user disposition or update the owning tool in a separate bounded change. |
| `@hono/node-server`, `hono`, `valibot` | Prisma local-development tooling; Hono also appears under scaffolding's MCP SDK. Application API uses Elysia and env validation uses Zod. | Do not expose Prisma's development server or scaffolding MCP tools as shop runtime services. Confirm deployed artifact closure in Step 13. |
| `ip-address`, `fast-uri` | Scaffolding MCP/rate-limit tooling and AJV through MCP, Prisma streams, React Email configuration. | Keep tooling local and trusted-input only; user disposition or targeted tool maintenance remains pending. |
| `engine.io`, `ws` | React Email preview/Socket.IO and scaffolding MCP tooling. | Email preview is not a public shop server. Do not expose it publicly. Pending user disposition; refreshing Next does not fix these advisories. |
| `undici` | `jsdom` in frontend development/test dependencies. | Keep test DOM/resource loading separate from shop runtime. Pending user disposition. |
| `brace-expansion`, `braces` | Glob/minimatch/micromatch used by build, scaffold, email-preview and source tooling. | Treat hostile patterns as untrusted input; no application request-input use was found in reviewed source. Confirm deployed runtime closure; pending user disposition. |
| `esbuild` | Build/preview tooling; reported finding has platform-specific conditions. | Record low severity and recheck with tool refresh. |

The source/lockfile trace supports development-tool exposure for the remaining findings. It is **not** a deployed-container SBOM or proof that every externalized runtime import excludes these packages. Server builds externalize workspace packages; Step 13 must inspect the actual deployment layout. Step 12's residual-risk acceptance remains open until the user explicitly disposes of remaining high findings or they are remediated. Do not label them accepted automatically, or claim a clean dependency tree.
