# Dependency audit disposition

Reviewed: 2026-09-23

`bun audit --json` was reviewed after upgrading TanStack Start, React Email, and Nodemailer. Those upgrades removed the previously reported critical Next.js findings and the runtime-relevant TanStack/h3, Nodemailer, PostCSS, and Sharp findings.

The remaining high findings are accepted as non-shipped development-tool exposure, not application runtime exposure:

| Package | Dependency path | Disposition |
| --- | --- | --- |
| `deepmerge-ts` | Prisma CLI configuration | Accepted temporarily; Prisma pins the affected major and the application never passes request data to the CLI configuration merger. |
| `mysql2` | Optional Prisma CLI dependency | Accepted temporarily; this application uses PostgreSQL and does not ship or configure the MySQL driver. |
| `ip-address` | shadcn CLI to MCP SDK to rate-limit parser | Accepted temporarily; shadcn is build-time scaffolding and is not imported by the application runtime. |
| `ws` | React Email preview to Socket.IO | Accepted temporarily; React Email preview is a development-only tool and is absent from the production server/web dependency graph. |

Remaining moderate/low findings are likewise confined to Prisma, shadcn, or other development tooling. Recheck them on every dependency refresh. Do not convert these dispositions into a claim that the dependency tree has zero advisories.
