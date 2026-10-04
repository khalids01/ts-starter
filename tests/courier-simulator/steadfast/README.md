# Local Steadfast-shaped courier simulator

Local test tooling: **WireMock 3.13.2**, profile `steadfast-local-v1`, controlled by Bun/TypeScript. Engine controls/contracts remain independent of Prisma/application startup. Separately guarded `app-*.ts` scripts integrate the existing isolated E2E harness; they never migrate, seed, reset or provision. No real merchant credentials, forwarding or recording. Tested on 2026-10-04 with Bun 1.4.0 and Docker Compose v5.5.1.

## Start, check and stop

Run from the repository root:

```sh
docker compose -f tests/courier-simulator/steadfast/compose.yaml up -d
bun tests/courier-simulator/steadfast/ready.ts
```

The image is pinned to `wiremock/wiremock:3.13.2@sha256:0d4ecb3e4dc8213fd7a4d37d6a78f6e6b553a6d2e15bd51b0999781282ac61b3`. Docker downloads it if missing. Only `127.0.0.1:9099` is published; admin and courier interfaces are on that same local port. Readiness requires our profile identity and a valid WireMock admin response, with a bounded wait. An occupied port is an error; never reuse/stop unrelated services to make it work.

```sh
bun test tests/courier-simulator/steadfast/control.unit.test.ts
bun ./node_modules/typescript/bin/tsc --project tests/courier-simulator/steadfast/tsconfig.json --noEmit
NODE_ENV=test E2E_MODE=true STEAD_FAST_BASE_URL=http://localhost:9099 COURIER_SIMULATOR_HTTP_APPROVED=true bun tests/courier-simulator/steadfast/contract.http.ts
```

Unit/type checks need no engine or network. The explicit HTTP command needs only this simulator, **no app/DB/Redis**. It imports the unchanged production adapter, not an adapter fake. Run it separately from suites that globally mock provider imports/fetch. It cleans only mappings, scenario state and matched journal entries belonging to its own fresh run, preserving other runs. Repeating it is supported. No test silently starts Docker.

```sh
docker compose -f tests/courier-simulator/steadfast/compose.yaml logs --tail 50
docker compose -f tests/courier-simulator/steadfast/compose.yaml down
```

`down` affects only this Compose project. There are no persistent volumes; engine state is intentionally in memory. Stopping/restarting clears runtime mappings and journal entries, including any interrupted-run residue. This is simulator state, not application data. The checked image stays installed for tomorrow.

## Fixture and control API

```ts
import { SimulatorControl } from './control';
import { fixture } from './contract';

const run = crypto.randomUUID().replaceAll('-', '').slice(0, 16);
const simulator = new SimulatorControl(run);
await simulator.ready();
const parcel = fixture(run, 'worker1', 'deposit', '125.50');
try {
  await simulator.register(parcel); // production adapter can now book this exact request
  console.log(parcel.request, parcel.externalId, parcel.trackingCode);
  // After booking through the adapter:
  await simulator.transition(parcel, 'delivered_approval_pending');
  console.log(await simulator.journal());
} finally {
  await simulator.cleanup();
}
```

Use a fresh bounded run ID for every process and unique worker/label per parcel. IDs are deterministic hashes of the invoice; registration rejects collisions within that control. Invoice scenarios keep independent state; callers must not reuse a namespace in another control/process. Keep the same `Parcel` object for control actions. Map registrations are tracked before the admin request so partial installation can be cleaned. Unknown admin responses/redirects fail closed. Cleanup never invokes global reset or any app DB action. Orphan scenario names may remain in WireMock until engine restart; their state is reset and owned mappings are deleted, so they cannot serve requests.

`fixture()` builds fictional recipient fields and exact nonnegative BDT COD (at most two decimal places). The app fixture registers its actual reviewed request snapshot before the worker submits, retaining the app-generated invoice and its own run-scoped scenario. Do not put real recipients into fixtures.

## Contract inventory and provenance

| HTTP surface | Implemented behavior | Provenance/limit |
| --- | --- | --- |
| `POST /create_order` | Exact invoice/name/phone/address/COD/delivery type/note, JSON content type and fake auth. First match accepts one registered identity. Repeated invoice returns 409; never mints another identity. | Response shape from repository adapter/fixtures. Duplicate 409 semantics are synthetic, not provider-certified. |
| `GET /status_by_invoice/{invoice}` | 404 before acceptance; status only afterwards. | Current adapter schema. Recovery remains uncertain because no consignment identity is supplied. |
| `GET /status_by_cid/{id}` | Same parcel status by external ID. | Current adapter schema. |
| `GET /status_by_trackingcode/{code}` | Same parcel status by tracking code. | Current adapter schema. |
| `GET /get_balance` | Fake zero BDT balance and connection health. | Adapter/repository contract; not a receipt or payout allocation. |
| All other courier paths | Authenticated request returns 422; missing/wrong auth returns 401. | Intentional unsupported capability. Bulk, pickup, return-request/history, settlement/payment and service-area APIs remain unimplemented. The selected worker return-aware status path is described below. |
| `GET /__simulator` | Fixed profile identity for readiness. | Test control only. |
| Signed callback helper | Exact raw JSON bytes, Bearer token, HMAC-SHA256 signature and idempotency header. | Application integration contract, not independent live merchant verification. |

**Base URL is `http://localhost:9099`, without `/api/v1`.** The existing production adapter permits exactly this local test URL only when `NODE_ENV=test`, `E2E_MODE=true` and `STEAD_FAST_BASE_URL` matches it. Production destination policy is unchanged. Earlier planning documents' `/api/v1` local examples are superseded by this inspected source contract. App and simulator must be reachable from the same host runtime; Docker service names are not allowed adapter destinations.

Fake credentials: `Api-Key: sim-fictional-key`, `Secret-Key: sim-fictional-secret`; callback token `sim-fictional-webhook-token`. They are fixture constants, never production credentials. No default create wildcard: unregistered invoice, wrong COD, wrong customer data, missing content type or extra body fields cannot create a parcel.

All 18 status strings recognized by the current adapter have per-parcel lookup mappings, including approval-pending, partial-delivery and return-progress spellings. `transition()` affects engine state only. Delivered status cannot collect money, and return status cannot receive/restock/refund goods: those remain app-owned operations exercised separately by the guarded app suite below.

## Faults

Pass one fault to `register(parcel, fault)`:

- `none`: normal acceptance.
- `authentication`, `validation`, `rate-limit`, `server`: 401/422/429 with Retry-After 2/500; booking remains unaccepted.
- `network`: empty response, unaccepted synthetic transport failure.
- `malformed`: accepted parcel with malformed successful response; lookup remains available.
- `accepted-response-lost`: accepts the identity before a 1,500ms delayed response. Use an adapter timeout shorter than this to test uncertainty. This is a deliberately lost-client-response scenario, not rejection.

`changeFault()` changes the initial, unaccepted mapping while keeping mapping IDs and journal ownership. It does not roll back an accepted parcel. The HTTP suite proves status-only recovery remains uncertain and a repeated accepted invoice cannot produce a fresh identity. This is not proof of real provider cross-process idempotency, worker claims, crash recovery or app concurrency.

## Callbacks and app integration boundary

`callback(parcel, state, timestamp)` returns signed bytes; `signCallback(rawBody, eventKey)` supports tracking updates and deliberately malformed test payloads. The suite verifies the production adapter's parser/signature, altered bytes, bad auth, invalid JSON/type and body-derived replay identity. It does **not** exercise the application webhook controller, persistence or stock/money effects.

`sendCallback()` defaults to refusing app integration. After separately authorized isolated app setup, `COURIER_SIMULATOR_CALLBACK_APPROVED=true` permits only `http://localhost:3000/courier/webhooks/{connectionPublicId}`, with no redirects/query/credentials. The standalone sender unit tests use mocked fetch; the separately authorized app suite sends real signed local callbacks and verifies persistence. If the future app has a different reviewed local port, explicitly update/review the allowlist rather than widening it to arbitrary hosts.

## Verification and limitations

Standalone evidence from the original engine-only slice: **6 unit tests / 25 assertions**, **16 real-engine HTTP contract groups**, and focused TypeScript passed. HTTP groups include all 18 status mappings, parallel distinct invoices, exact COD/auth/body matching, duplicate create, all fault classes, lost-response uncertainty, production callback parsing and cleanup preserving another run. Private raw logs are under ignored `tests/artifacts/courier-simulator/`.

Only loopback ingress is published. A private project bridge is used because an internal-only bridge prevented host port publication on the tested Docker runtime. This configuration is **not an OS egress firewall**. Supplied mappings contain no proxy responses, record settings or automatic outbound webhook extensions; the control client targets only localhost and follows no redirects. Treat the local WireMock admin interface as trusted developer tooling, never expose it publicly or register arbitrary proxy mappings.

The journal is bounded to 10,000 entries; cleanup between runs and inspect counts before entries can be evicted. Balance/auth fallback requests are shared static mappings and remain in the journal until restart; per-run cleanup targets only its matched invoice mapping IDs. Exact real-provider duplicate semantics, webhook contract, validations, permissions, payouts and merchant operations remain unverified. No real Steadfast request was made.

Historical standalone evidence above remains separate from the subsequent authorized app integration below. Security, peak capacity, staging/recovery and real merchant acceptance remain open. No tutorial or commit is authorized.

Engine references: [official Docker packaging](https://wiremock.org/docs/standalone/docker/), [stateful scenarios](https://wiremock.org/docs/stateful-behaviour/), [request matching](https://wiremock.org/docs/request-matching/), [fault simulation](https://wiremock.org/docs/simulating-faults/). Source contract: `apps/server/src/modules/delivery/providers/steadfast.ts`, `apps/server/tests/fixtures/steadfast/`, `apps/server/src/modules/delivery/webhook.controller.ts`.


## Authorized existing-app integration

Current local integration evidence is in `docs/ecommerce-todo-progress-v3.md` section 27. Reuses the existing Step 10/11 database, Redis, five verified personas and Playwright framework. The Step 13 capacity database is not used. **No migration, seed, reset, new database, auth/RBAC provisioning or production worker-control endpoint is part of these commands.** This section is an operational test reference, not a tutorial; tutorial creation/recording/generation needs an explicit user request.

The private reviewed runtime is `tests/artifacts/step14/runtime.env` (0600); normal app env files and `tests/env/.env` remain untouched. It selects database `e2e_v3_step10_20261003_03043274` at loopback 5433, Redis 6380 and prefix `ts-starter:e2e:step10:e2e_v3_step10_20261003_03043274:`. It uses the fictional credentials above, exactly `http://localhost:9099`, localhost API/web 3000/3001, `NODE_ENV=test`, `E2E_MODE=true`, `COURIER_WORKERS_ENABLED=false`, and explicit `COURIER_SIMULATOR_APP_APPROVED=true` / `COURIER_SIMULATOR_CALLBACK_APPROVED=true`. Mail, payment and external storage configuration are blank. The app guard rejects alternate test targets and real/external configuration. Read-only preflight stops on missing tables/personas/permissions; report the prerequisite instead of provisioning.

From the repository root, when these services are stopped and the exact existing targets have been reviewed:

```sh
docker start ts-starter-e2e-postgres ts-starter-e2e-redis
docker compose -f tests/courier-simulator/steadfast/compose.yaml up -d
bun tests/courier-simulator/steadfast/ready.ts
bun --env-file=tests/artifacts/step14/runtime.env tests/courier-simulator/steadfast/app-preflight.ts
```

Start the API in an owned terminal:

```sh
bun --env-file=tests/artifacts/step14/runtime.env apps/server/src/index.ts
```

Build the web with the explicitly inherited same runtime. After that build finishes, launch preview in its own terminal (use `"preview"` instead of `"build"` in this command). Do not use the root build/start wrappers, which inject another runtime.

```sh
bun --env-file=tests/artifacts/step14/runtime.env -e 'const p=Bun.spawn(["node",process.cwd()+"/apps/web/node_modules/vite/bin/vite.js","build"],{cwd:process.cwd()+"/apps/web",env:{...process.env},stdout:"inherit",stderr:"inherit"});process.exit(await p.exited);'
```

After API 3000 and web 3001 are available, refresh only the existing personas through real password login and verify their role/session contexts. No signup or permission writes:

```sh
bun --env-file=tests/artifacts/step14/runtime.env tests/courier-simulator/steadfast/app-auth.ts
bun --env-file=tests/artifacts/step14/runtime.env ./node_modules/.bin/playwright test --config playwright.step14.config.ts
bun --env-file=tests/artifacts/step14/runtime.env tests/courier-simulator/steadfast/app-audit.ts
```

Run the suite sequentially on this target, with other test/load workloads idle. `playwright.step14.config.ts` inherits the existing Chromium persona/browser settings and pins the local web URL, disables automatic setup dependencies/provisioning, and selects only `v3-simulator.spec.ts`. Its workers run in the test process or two independent Bun peer processes, using real credentials resolver/registry/adapter and transactions. Candidate discovery is restricted to the owned fictional connection. Normal application timers stay disabled in E2E mode. The shared older `submit()` mock helper refuses simulator mode.

The 16 checks assert order/stock/payment/history/claim/outbox/webhook rows and exact provider request journals, including two-account races, two-process worker claims, simultaneous callbacks, invalid signatures, all booking fault classes, uncertain accepted responses, cancellation/reconciliation and safe/unsafe warehouse recovery. Callback replay identity comes from signed payload bytes, including replay under a different header key. Retry scheduling/lease eligibility use the production worker's existing injected clock; requests/timeouts and database persistence are real. HTTP 404 invoice lookup currently holds as `validation`, while found status without an identity holds as `uncertain_submission`; neither creates a second parcel.

`GET /status_with_return_status_by_cid/{id}` is now selected because the actual tracking worker invokes it. It shares the adapter's repository status schema and per-parcel state, including return spellings. It does not implement additional return-detail semantics or certify the live provider contract. Pickup/return submission/history/service-area/payout APIs still fail explicitly.

Cleanup runs in `finally`, even on ordinary assertion/setup failures, and deletes only the generated `v3-browser-sim-<run>` fixture relations and that run's simulator mappings/matched journal entries. Shared store settings/default shipping are snapshotted/restored (including timestamps); existing provider/personas/orders remain. Application audit/login/visitor telemetry remains in the isolated test DB. The read-only audit refuses fixture/mapping residue rather than deleting it. A forcibly terminated test process bypasses `finally`: inspect the precise owned namespace and arrange reviewed cleanup; no global DB reset or automatic global WireMock reset is permitted. Forced process-crash cleanup and broad legacy ambiguous-record coverage remain unverified.

Stop only API/preview processes started for this run with their own terminal interrupt, then stop the owned simulator. Existing test PostgreSQL/Redis can be stopped when this run started them and no other test is using them; retain their data volumes. Leave unrelated services alone.

```sh
docker compose -f tests/courier-simulator/steadfast/compose.yaml down
docker stop ts-starter-e2e-postgres ts-starter-e2e-redis
```

No-runtime checks:

```sh
bun test tests/courier-simulator/steadfast/control.unit.test.ts tests/courier-simulator/steadfast/app-guard.unit.test.ts
bun test apps/server/tests/courier.cancelled-booking-policy.test.ts apps/server/tests/courier.dispatch-hold.test.ts apps/server/tests/courier.dispatch-worker.test.ts
bun ./node_modules/typescript/bin/tsc --noEmit --project tests/courier-simulator/steadfast/tsconfig.json
bun ./node_modules/typescript/bin/tsc --noEmit --project tests/e2e/tsconfig.step14.json
```

App TypeScript uses the existing server aliases through the focused E2E config; the standalone config excludes app runtime imports. Selected local integration passing does not close failed peak capacity, security, staging/recovery or real merchant acceptance. No commit or push until requested.

Final 2026-10-04 evidence: 16 application checks passed twice; 16 standalone HTTP groups reran successfully; 51 no-network tests/149 assertions and all focused/server types passed. Private `tests/artifacts/step14/` contains final `run-7.txt`, `run-8.txt`, contract/unit/type logs and matching independent cleanup audits (69 retained orders, restored settings/default shipping, no owned fixtures, four static mappings). Owned services were stopped. No migration/seed/reset, real provider call, tutorial or commit.
