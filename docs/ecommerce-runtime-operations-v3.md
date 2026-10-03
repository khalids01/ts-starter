# Ecommerce V3 runtime and operations guide

This guide belongs to Step 13. Each shop is a separate single-store deployment: its own PostgreSQL, Redis, API/web processes, domains, credentials, storage and backups. No tenant IDs or shared-shop database/Redis are introduced.

## 1. Deployable runtime shape

1. Build from the reviewed commit with the frozen lockfile. Build/generate prerequisites happen in the build stage; runtime startup must never run a migration, seed, reset or generation command.
2. Set the shop's real `VITE_SERVER_URL` before the web build. Vite embeds public configuration: changing the runtime env alone does not update a previously built browser bundle. Build a separate web artifact per shop.
3. Use inspected `build:production`/package build scripts with explicitly supplied shop configuration. Root `build` and `start` inject `tests/env/.env`; they are local-test wrappers and must not be deployment entrypoints.
4. API: either the compiled Bun binary from the package `compile` script, or `apps/server/dist/index.mjs` with its workspace/runtime dependencies retained. Bytecode is omitted because the existing top-level startup await failed bytecode compilation on the tested Bun version. Compilation without bytecode passed.
5. Web: `apps/web/scripts/production-server.ts` serves `dist/client` and invokes `dist/server/server.js`. `apps/web` package `start` now launches it. `serve` remains an explicit Vite preview command for local review. The web output externalizes packages: **do not ship only `dist` and assume it is self-contained**. Keep the matching production dependencies/workspace layout and required TS exports. The isolated smoke output used a symlink to the existing web dependencies to reproduce that layout; it was not an independently pruned container deployment.
6. The tested build produces a Response-compatible NodeResponse from H3; the Bun entry converts it to a native Response while retaining status, headers and streamed body. Static assets are restricted to the built client directory, use MIME/nosniff headers, and hashed assets have immutable caching. Routes, including `/`, fall through to SSR. POST requests never become static file responses.
7. API uses `PORT` (default 3000); web uses `VITE_PORT`, then `PORT` (default 3001). `HOST` controls binding. Keep API/web private behind the shop's HTTPS proxy; use loopback for local checks. The two processes must not inherit the same port unintentionally.

Primary hosting references: [Bun's TanStack Start hosting guide](https://bun.sh/guides/ecosystem/tanstack-start), [TanStack hosting guide](https://github.com/TanStack/router/blob/main/docs/start/framework/react/guide/hosting.md).

## 2. Configuration checklist per shop

| Setting | Required choice / verification |
| --- | --- |
| `NODE_ENV` | `production`. `E2E_MODE=true` is rejected in production; never reuse test bypasses for deployment. |
| `DATABASE_URL` | This shop's PostgreSQL only. User confirms required schema and RBAC setup before startup. No startup migration/reset. |
| `REDIS_URL`, `REDIS_KEY_PREFIX` | A distinct Redis deployment and shop-specific prefix. Prefixes are defense in depth, not permission to share shops' Redis instances. |
| `BETTER_AUTH_SECRET` | Independent strong secret per shop, supplied securely; never the fictional runtime smoke secret. Rotation affects sessions and may invalidate them. |
| `BETTER_AUTH_URL`, `CORS_ORIGIN` | Exact external API/auth and storefront URLs behind HTTPS. OAuth callback URLs must match this shop. Origin/CSRF checks remain enabled. |
| `AUTH_SESSION_COOKIE_NAME`, `AUTH_COOKIE_DOMAIN` | Prefer a host-only cookie unless a reviewed domain scope is required. Keep cookies isolated across shops. Production cookies are Secure/HttpOnly and currently SameSite=None. Confirm real HTTPS browser behavior. |
| `COURIER_WORKERS_ENABLED` | Defaults true, preserving queued dispatch/polling behavior. Set false for standby, reviewed maintenance and local production smoke. With workers paused, queued bookings do not submit and polling does not repair tracking; UI/manual queue actions do not override this flag. Resume only after provider/configuration review. |
| Courier credentials | Separate merchant credentials/connection per shop. Steadfast production destination is the repository's reviewed `https://portal.packzy.com/api/v1`; local simulator exceptions are test-only. No live courier action is authorized by this guide. |
| Credential keyring | `COURIER_CREDENTIAL_ACTIVE_KEY_VERSION` plus a securely supplied version-to-base64-key map in `COURIER_CREDENTIAL_ENCRYPTION_KEYS`. Each decoded AES key must be 32 bytes. Do not persist secrets in a manifest, log or tutorial. |
| Email/storage/optional payment provider | This shop's configuration only. Explicitly disable unused providers and keep server credentials out of `VITE_*`. Fictional local smoke blanks all courier/SMTP/file/payment secrets and disables Polar. |
| Runtime dependencies | Install/package the frozen production dependency closure in an isolated build/deploy job. `shadcn` was moved to devDependencies because it is a scaffold CLI, not an application runtime import. Remaining advisory disposition and actual pruned deployment inspection are still required. |

## 3. Startup, shutdown and health

1. Start only after PostgreSQL/Redis are reachable and the operator has confirmed schema/configuration. API startup explicitly connects Redis; an unreachable Redis can prevent listening.
2. `GET /health/live` is the new API liveness endpoint and bypasses normal request rate limits. It says the HTTP process is alive; it does not claim database, courier, storage or email readiness. API `/` still returns OK. There is no `/health/ready` endpoint.
3. Readiness smoke must include `/shop/settings`, a catalog read, an authenticated admin read, SSR plus one built asset, and the configured Redis/auth behavior. Do not label a liveness-only probe as full readiness.
4. Background ticks no longer overlap in one process. Dispatch/polling/visitor schedules have stop hooks; startup is idempotent. Courier batches check for shutdown between items, leaving unclaimed work durable for the next process.
5. SIGTERM/SIGINT stops accepting new HTTP work, stops worker scheduling, waits for active requests/ticks, then disconnects Prisma and Redis. There is a 30-second hard deadline. Set the supervisor/container termination grace period above that deadline (for example 40 seconds) and record forced exits as failures, not clean shutdowns.
6. Incomplete external requests remain governed by durable operation/connection leases and uncertainty handling. Never erase/requeue a possibly submitted booking as if no provider action occurred. A forced process kill can require expired-lease recovery and operator review.
7. Visitor buffers remain in Redis for the next worker. Shutdown waits for an active flush; it does not force a new full visitor flush or claim Redis persistence is a backup strategy.
8. Monitor process health, queue age/depth, oldest operation lease, retry/manual-review counts, provider auth/cooldown exceptions, HTTP latency/errors, database connections/locks, Redis latency/memory and disk/backup state. No complete metrics exporter/alert service was added in Step 13; wiring these to the operator's monitoring remains a deployment task.

[Bun server shutdown reference](https://bun.com/reference/bun/Server/stop).

## 4. Proxy and request-limit checks

- The local production smoke uses E2E=false and verifies a real Redis-backed public limit, then recovery in the next window. Only the fictional DB's public limiter settings are temporarily changed/restored; no real shop settings are touched.
- It does not exhaust Better Auth's production limiter or validate every protected/admin policy under load. Earlier mocked limiter tests and explicit config checks remain relevant but are not substitutes for deployed measurements.
- IP attribution trusts proxy headers when the direct peer is private/loopback, and ignores spoofed proxy headers from public peers. Keep API access restricted to the reviewed reverse proxy; confirm the proxy overwrites forwarded IP headers. Do not expose a private-peer trust path to arbitrary callers.
- SSR catalog/session requests originate from the frontend server. Catalog fetches currently do not forward a reviewed client-IP identity to the API. A shared SSR source IP can therefore consume a common public limit under load. Measure this with the real proxy/frontend topology before increasing limits or changing attribution; no capacity claim or unmeasured proxy refactor is made here.
- Capacity scripts do not spoof client-IP headers. HTTP 429 is counted as a failure, so a single-generator-IP result may measure policy saturation rather than server capacity. Use an explicitly reviewed representative traffic/proxy setup for the eventual claim.

## 5. Failure and recovery checklist

| Scenario | Evidence so far | Operator acceptance still required |
| --- | --- | --- |
| API/web restart | Local production binary/web SIGTERM and API restart passed; persisted fictional session still authenticated. | Actual supervisor/proxy restart and HTTPS browser/session behavior. |
| Crash/expired booking lease | Real isolated PostgreSQL suite verifies expired lease recovery, obsolete-token rejection and two-process exactly-once submission. | Process crash against the completed HTTP simulator and production-like staging topology. |
| Provider outage/deadline/rate cooldown | Mocked worker regressions verify deadlines, retry/manual-review/cooldown behavior. | Approved HTTP simulator fault profile and queue/backlog drain measurements. |
| Authentication failure | Worker regression verifies connection disablement and sibling suppression. | Merchant credentials/permission acceptance is Step 14, separately approved. |
| Key rotation | Credential tests verify new writes use the active version and old ciphertext still decrypts with retained old key. | Secure staging rollout, re-encryption and rollback exercise. No automated DB re-encryption/backfill was run. |
| Stock/money invariants | Real DB suite rechecks overselling/idempotency/refunds/food capacity and serial uniqueness. | Repeat invariants after the agreed full capacity dataset/load. |
| Backup/restore | Procedure below is prepared. | An operator-run restore drill with measured recovery and application checks; none was performed here. |

### Key rotation procedure

1. Record the shop and affected connection IDs without exposing keys. Schedule maintenance and pause courier workers in every replica of this shop.
2. Add the new version/key while retaining every version referenced by existing ciphertext. Set the new active version and restart reviewed processes. Old ciphertext must still decrypt; new credential writes must use the active version.
3. Verify an approved local/staging encrypted connection and server's generic redacted responses. Live provider health/actions require their own authorization.
4. Re-encrypt existing records only through a separately approved reviewed operation. The new active version alone does not rewrite old rows. Do not remove old keys until evidence proves no records reference them and the backup retention/restore plan handles old versions.
5. Roll back by restoring the old active version while keeping both keys available; preserve all relevant key versions for retained backups. Never treat authentication secret rotation as courier key rotation.
6. Resume workers after reviewed verification. Record version numbers/results only, never key contents.

### Backup/restore procedure (operator-run; no DB commands included)

1. Assign an owner for each shop's PostgreSQL backup, Redis durability, object/file backups and encryption-key escrow. Set and approve RPO/RTO, retention, location and access; no values are claimed tested yet.
2. Confirm a current restorable backup, the source app/schema revision and required encryption keys. Backup completion alone is not a restore test.
3. Restore into a new isolated target with its own Redis/domain/storage and outbound courier/email/payment integrations disabled. Never restore over the running shop for a drill.
4. Start the matching application revision with workers paused. Check schema compatibility, owner access, catalog/orders/customer relationships, stock/reservations, payments/refunds, shipment identities, open operations and credential decryption.
5. Review external side effects after the backup timestamp. A restored local state cannot roll back a courier booking or real payment. Reconcile external identities before worker resumption to prevent duplicate submission.
6. Measure restore time and data loss against approved RTO/RPO. Record sanitized results and rollback/cutover ownership. Resume service only after review; this guide does not authorize a production cutover.

## 6. Capacity plan and execution gate

The inherited Step 8.5 target is **10,000 distinct customers/month**, not 10,000 concurrent users. Required dataset: 10,000 fictional customers, 25,000 representative orders, 1,000 products, approximately 3,000 variants, inventory/reservations/batches/refunds/visitors/activity rows. The deterministic generator now builds this dataset in a pure dry run; it has **not** populated a database. See `docs/ecommerce-step13-capacity-execution.md` for exact approval scope and execution steps.

| Profile | Workload | Duration |
| --- | --- | --- |
| Expected | 25 public requests/s, 2 admin reads/s, 1 checkout/s | 15 minutes |
| Peak | 100 public requests/s, 5 checkouts/s | 2 minutes |
| Soak | 10 public requests/s, 0.2 checkouts/s | 60 minutes |

The prepared k6 script uses at most 200 public, 20 admin and 40 checkout VUs; profiles are arrival rates, not promises of achieved throughput. It reports separate catalog/admin/checkout trends and rejects dropped iterations. Thresholds: unexpected failures below 1%, all business checks true, public p95 <500 ms, admin p95 <750 ms, checkout p95 <1.5 s/p99 <3 s, zero dropped expected iterations. Peak/soak do not include admin traffic; do not infer admin coverage from them.

### Exact next execution procedure

1. Obtain explicit approval for the **local capacity setup, distinct fictional DB, dataset sizes, selected profile and maximum traffic**. Current runtime-smoke authorization does not authorize these arrival-rate/soak runs. Staging/production targets require separate approval and a revised guard; the prepared runner accepts only localhost:3013.
2. Prepare a separate database named `e2e_v3_step13_capacity_<approved-run>` with separate Redis configuration. User/operator controls schema setup. The retained Step 10 correctness database is deliberately excluded by the load runner. Do not modify or reset it for capacity.
3. Review `tests/load/capacity-dataset.ts` and its pure dry-run report. The guarded generator requires an explicitly empty commerce/analytics target and writes batches of 100; it never resets/resumes a partial population. Its synthetic distribution includes receipts/refunds, physical stock and bookings, gadget serial/warranty, and analytics records. Apply only after approval with the exact target/fictional actor guards.
4. Use its generated ignored mode-0600 `capacity-fixtures-<run>.json`; add the verified fictional owner's production-compatible cookie after controlled authentication. Never use a real shop session. See the execution handoff for the exact flags and provisioning sequence.
5. The ignored checksum-verified k6 v2.3.0 tool passes configuration inspection for all five profiles. No HTTP workload was run. Build the reviewed compiled API first; the load runner owns production API port 3013, guarded DB, blank external credentials and paused workers. It rejects an existing service on that port.
6. Approve the `isolated-headroom` policy for the dedicated capacity DB: enabled public 10,000/min and admin/protected/special 1,000/min, auth policy unchanged; original settings restored afterward. This addresses single-generator-IP limits and is not merchant/proxy security acceptance. Run smoke, volume, expected, peak and soak separately under the exact approved scope.
7. The runner records API/k6 source fingerprints, dataset/run/target metadata and unique `capacity-<run>-<profile>-<execution>.json`, `invariants-...json` and `resources-...json`. Five-second samples capture API RSS/CPU counters/FDs, hardware/cgroup limits, DB connections/locks/transaction counters, Redis metrics and queue age/state. Capture infrastructure configuration and interpretation too; no session/env secrets belong in reports.
8. Pre/post-load checks reconcile receipts/refunds/status, checkout uniqueness/counts, stock movements/reservations, food bookings/capacity, discounts/limits, active provider identities and preserved order/operation IDs. Sampling errors, count/counter mismatch, lost rows or new expired leases reject acceptance. Courier workers remain paused: no provider-side booking, backlog-drain or compatibility claim follows.
9. Review bounded memory/connections and DB/Redis/backlog trends during soak. HTTP summaries and configuration inspection alone do not meet this gate. Compare slow tagged endpoints and resource usage before making any optimization.
10. Finish separately approved staging HTTPS/browser/worker/simulator/restore checks and user review. Local smoke/pure fixture preparation is not a staging or 10,000-customer capacity claim.


## Local capacity evidence update (2026-10-04)

The approved separate capacity target executed all five local workloads. Smoke, volume, 15-minute expected and 60-minute soak passed; the two-minute peak failed latency/check/drop thresholds. Final read-only invariants and successful-checkout reconciliation passed, original limiter settings were restored and owned processes stopped. Detailed results and limitations are in `docs/ecommerce-step13-capacity-results.md` and V3 section 25. This does not close staging, restore, proxy/auth/rate policy, worker/simulator, monitoring or security acceptance.
