# Steadfast courier simulation plan

Date: 2026-10-03. Status: standalone simulator and selected isolated app/DB/browser/worker integration verified on 2026-10-04; see V3 sections 27–28 for current authorization/evidence/gates. See `tests/courier-simulator/steadfast/README.md`. No E2E database setup performed.

This is the execution guide for building a local Steadfast-shaped HTTP simulator later. It expands `docs/courier-simulator-e2e.md`, which retains the research findings and primary WireMock links. This simulator has **12 implementation steps**, separate from the 16-step ecommerce V3 ledger. Its persistence and browser runtime evidence supports V3 Steps 10–11; security review remains Step 12 and tutorials remain Step 15. Build the simulator before those runtime checks, subject to the setup authorization below.

## Objective and design

Use WireMock Open Source locally, with a small Bun/TypeScript control library that installs invoice-specific mappings, drives parcel states, signs fictional callbacks, verifies HTTP requests, and resets only its own test state. Exercise the production Steadfast adapter over HTTP rather than swapping it for a fake adapter in E2E.

No verified maintained turnkey Steadfast emulator was found in the earlier search. WireMock is an engine, not an existing verified Steadfast contract. Our simulated behavior must be labeled either reviewed provider behavior or application test behavior. The merchant reports no Steadfast testnet; do not claim this replaces real merchant acceptance.

Keep the simulator outside the production application. It must never use Prisma, merchant credentials, live courier forwarding, real customer data, or unsigned production webhook shortcuts. No simulator-only database schema, production controller, or public worker trigger is needed.

## Non-negotiable boundaries and entry gates

1. Re-read applicable instructions, V3 guide, this plan, and current diffs before each step. Implement only the authorized slice and preserve unrelated work.
2. Current authorization permits planning, source/schema edits where needed, generation if needed, and safe mocked/static checks. It does not authorize future database operations, service/Docker startup, provisioning, reset, browser E2E, or live courier calls. Obtain specific expanded authorization before dependent execution; do not treat this plan as authorization.
3. No DB commands under the standing boundary. The simulator itself needs no database. User-controlled schema/RBAC application and isolated E2E provisioning remain separate prerequisites.
4. Do not commit, install dependencies globally, pull/run containers, or modify real `.env` files unless instructed. Prepare reviewable source/configuration first.
5. Never proxy or record live Steadfast traffic. Never fall back to a merchant URL when the simulator is unavailable.
6. Pin dependencies and the engine image digest/JAR checksum when implementing. Recheck supported syntax using official WireMock docs rather than assuming a remembered version.
7. Runtime E2E acceptance waits for V3 claim, retry, tracking-authority and security correctness gates. A simulator cannot make unfinished production behavior correct.
8. Every step ends with: what changed; safe checks and results; how the user tests after starting the isolated services; outstanding prerequisites; exact next step; remaining simulator-step count; modified files; and commit status. Update this plan's ledger. Do not silently proceed across runtime/DB gates.

## Repository sources to read first

- `apps/server/src/modules/delivery/providers/steadfast.ts`: validation, headers, response schemas, capabilities, timeout and recovery behavior.
- `delivery/provider.ts`, `credentials.ts`, `credentials.config.ts`, `registry.config.ts`: base URL and configuration boundaries.
- `delivery/webhook.controller.ts`, `webhook.service.ts`, `tracking.service.ts`, `tracking-worker.ts`: real callback route, authentication and normalized states.
- `delivery/dispatch-worker.ts`, `shipment-claim.ts`, `dispatch-snapshot.ts`: current ownership, stable attempt invoice, worker controls and snapshot checks.
- `delivery/settlement-accounting.ts` and admin returns/settlement actions: gross collection evidence and manual reconciliation.
- `apps/server/tests/steadfast.adapter.test.ts` and `tests/fixtures/steadfast/`: existing contract examples, not proof of live provider behavior.
- `tests/setup/assert-test-environment.ts`, Playwright configuration, E2E persona setup, and `tests/env/`: isolation requirements. Read files; do not run provisioning/reset.

## Planned artifact layout

Use `tests/courier-simulator/steadfast/` with these small, clearly owned files; adapt names only for actual repository conventions:

- `README.md`: exact user-run commands, isolation, limitations and cleanup.
- `compose.yaml` or standalone launcher description: pinned engine, loopback port, read-only fixture mounts, no production networks.
- `contract.ts` and `fixtures/`: typed synthetic response/payload builders and explicit contract provenance.
- `control.ts`: typed WireMock admin client with fixed allowed local origin, explicit timeouts and no forwarding.
- `scenarios.ts`: per-invoice mapping builder and scenario transitions.
- `webhooks.ts`: local-target-only callback signer/sender.
- `assertions.ts`: request journal and semantic field/count checks.
- `contract.test.ts`: engine-backed production-adapter tests, separate from no-network unit tests.
- `control.unit.test.ts`: mocked-fetch tests for mapping/signature/allowlist logic.
- Later Playwright specs in the existing ecommerce E2E layout; do not create a second auth or database fixture framework.

Avoid new dependencies unless existing Bun, fetch, crypto, validation and Playwright cannot handle the task. WireMock remains the HTTP simulation engine; the control library does not reimplement the entire courier backend.

## Contract inventory to establish in Step 1

| Surface | Minimum behavior | Critical limit |
| --- | --- | --- |
| POST `/api/v1/create_order` | Exact invoice, customer fields, JSON/auth headers, COD validation; deterministic unique external/tracking identity | Same attempt invoice cannot create another parcel |
| GET `/api/v1/status_by_invoice/{invoice}` | Before-booking not found; accepted parcel status | Current adapter expects status only; do not invent a recovered consignment ID |
| GET `/api/v1/status_by_cid/{id}` | Per-parcel states and not-found response | Independent parcels must not share one scenario |
| GET `/api/v1/status_by_trackingcode/{code}` | Same parcel state via tracking identity | Enable only where current adapter/flow actually uses it |
| GET `/api/v1/get_balance` | Fictional account balance for connection health | Balance is not an order receipt or payout allocation |
| Return APIs | Shape/status validation for enabled adapter capabilities | Provider return completion is not physical warehouse receipt |
| Pickup/tracking/history/service-area APIs | Only capabilities selected for the test suite | Unimplemented paths fail, never falsely succeed |
| Signed callback to local app | Production bearer/HMAC/idempotency contract | This is our configured integration contract; do not claim independent live verification |
| Settlement/payments APIs | Optional isolated fixture responses for adapter contract tests | Automatic payout-to-order credit remains disabled |

Every endpoint lists fixture provenance and selected semantics. If a real contract is unknown, hold that scenario pending contract review rather than invent production behavior.

## Step 1 — Freeze simulator scope and contract

1. Inspect the files above and list every Steadfast adapter method the selected E2E flows invoke.
2. Record request paths, auth headers, body rules, response schema, status mapping and expected errors per method.
3. Choose launch suite: booking, polling, signed callbacks, deposits/COD, cancellation, receipt/inspection, manual gross settlement, and permission negatives. Return/pickup adapter tests may be separate where their app workflows are still gated.
4. Assign each fixture a source: reviewed provider example, repository fixture, or deliberately synthetic fault. Do not call repository-only evidence provider-certified.
5. Record explicit unknowns and gates. No server code change or DB operation needed.

Acceptance: source-backed contract inventory, required/optional capability list, and unresolved assumptions visible. User check: review terminology and selected workflows. Next Step 2; **11 simulator steps remain**.

## Step 2 — Prepare isolated engine packaging

1. Verify a supported pinned Open Source engine version and record digest/checksum.
2. Prepare loopback-only `localhost:9099` launch configuration. Use read-only fixture mounts and no proxy/record flags.
3. Keep WireMock admin API local. App must reach its own localhost; browser and container localhost may differ. Document a supported placement instead of weakening HTTPS validation for a Docker hostname.
4. Provide a startup readiness check and an explicit stop command. Do not automatically start services from unit tests, install scripts, or normal app startup.
5. Separate no-network unit commands from engine-backed contract/E2E commands.

Acceptance: reviewed launch config, pinned engine, explicit networking. Runtime launch requires authorization. Next Step 3; **10 remain**.

## Step 3 — Build typed control and fixture identity

1. Add a typed WireMock admin client restricted to the configured loopback origin. Validate scheme/host/port, reject redirects to nonlocal destinations, set request timeouts, and reject unexpected response schemas.
2. Allocate a run ID, worker ID and per-invoice scenario namespace. Allocate unique numeric external IDs and tracking codes for each fixture; do not reuse one static response identity across orders.
3. Register exact invoice/customer/COD mappings from the fictional order being tested. Do not accept every create body with a wildcard success.
4. Keep fixture registration state in the test process and parcel scenario state in WireMock. Reset only mappings/scenarios/journal entries owned by that run. Never reset app databases as part of simulator cleanup.
5. Unit-test namespace isolation, malformed admin responses, allowlist rejection and deterministic fixture builders using mocked fetch only.

Acceptance: no-network unit checks pass, two workers cannot overwrite each other's fixtures. Next Step 4; **9 remain**.

## Step 4 — Implement booking and stable identity

1. Match POST create against exact invoice, fake `Api-Key`/`Secret-Key`, JSON content type, required fields, supported phone/address formats and authoritative COD.
2. First accepted request transitions only that invoice from unbooked to accepted and returns the registered external/tracking identity.
3. Subsequent same-invoice create uses the reviewed duplicate semantics. Never mint a new external ID on replay.
4. Before acceptance, invoice/ID lookup returns selected documented not-found behavior. After acceptance, status lookup returns the actual status shape the adapter consumes.
5. Verify the exact request journal fields and booking count. Retry uses the same invoice and outbox identity; a fresh reviewed attempt after proven never-submitted cancellation has a different invoice.

Acceptance: production adapter succeeds on valid booking and rejects malformed/auth requests; double creates cannot add another parcel. Next Step 5; **8 remain**.

## Step 5 — Model parcel progress and signed callbacks

1. Add per-parcel states for in-review/pending, approval pending, delivered, cancelled, partial delivery, hold and selected return progress states.
2. State changes are test-control actions; app status remains updated through real polling/callback flows. Do not directly mutate app DB status from the simulator.
3. Read the current webhook route/headers before implementing sender. Current adapter uses bearer token, `x-signature`, `idempotency-key`, and HMAC-SHA256 of exact raw JSON bytes with the fake webhook token.
4. Sign once and send those exact bytes to the allowlisted isolated app URL. Never use real secrets or publicly exposed callback targets.
5. Test valid delivery/tracking callbacks, missing auth, wrong signature, altered bytes, duplicate keys, invalid JSON and unsupported payloads. Bad callbacks must leave app history/state unchanged.
6. Approval pending stays pending; partial delivery goes to review; return status does not restock or refund.

Acceptance: two parcels progress independently and callback authentication/deduplication works. Next Step 6; **7 remain**.

## Step 6 — Add faults and uncertain booking recovery

1. Add selectable 401, validation failure, 429 with Retry-After, 500, network failure and malformed successful response scenarios.
2. Model accepted-but-response-lost by advancing booking state before delaying/aborting the response. Lookup must then find the invoice status.
3. Preserve the current adapter behavior: found invoice with status but no external ID remains uncertain/manual review. Do not fabricate successful identity recovery to make tests pass.
4. Distinguish request never accepted from accepted/unknown acceptance; test missing/unavailable lookup independently.
5. Exercise lease overlap/crash retry only after V3 Step 6 fixes are implemented. Assert provider journal create count, stable invoice, durable job state and retained claim, rather than assuming a timeout is safe to retry.
6. Authentication failure/rate-limit cooldown scenarios verify connection-wide worker behavior where implemented. Unknown behavior is a failing/gated test, not a swallowed assertion.

Acceptance: every fault has a defined expected application outcome and no duplicate shipment/unsafe stock release. Next Step 7; **6 remain**.

## Step 7 — Test money, return and optional capabilities

1. Exercise unpaid COD, partial deposit, prepaid/fully collected, partial/full refunds and reviewed-money changes. Assert exact booked COD; refunds never recreate already collected debt.
2. Use fake balance only for connection health. Fake net payouts/payments do not automatically credit orders.
3. Record gross collection through the real authorized reconciliation action. Test matching/mismatched amount/currency, duplicate evidence, collection before delivery and delayed delivery after a refund.
4. For enabled return capabilities, test provider requests/status independently from full physical receipt, unsafe inspection and explicit one-time stock restoration.
5. Add optional pickup/history/service-area endpoints only when selected tests use them and their adapter contract is reviewed. Unrecognized endpoints return failure.

Acceptance: money and stock remain application-owned and independently evidenced. Next Step 8; **5 remain**.

## Step 8 — Verify production adapter against local HTTP

1. After explicit engine-start authorization, launch the reviewed engine with fictional configuration and no app/DB dependency.
2. Instantiate the unchanged production Steadfast adapter with local base URL and fake credentials. Contract tests go through actual HTTP; they must not replace adapter methods or fetch with synthetic success.
3. Register one fixture per test, run the happy/error contract matrix, inspect the request journal, and reset only owned simulator state.
4. Test simultaneous invoices and independent state, request encoding, auth/response parsing and shutdown cleanup.
5. Record engine/profile version, test counts and limits. Engine tests can run without app DB provisioning; do not bundle unauthorized setup.

Acceptance: adapter HTTP tests pass and no traffic reaches provider origins. Next Step 9; **4 remain**.

## Step 9 — Integrate the isolated app E2E harness

1. Confirm user-applied schema, permission catalog, isolated PostgreSQL/Redis/domain configuration and separately authorized E2E fixture preparation.
2. Configure a separate fake Steadfast account through the app's existing credential flow using localhost base URL and fake API/secret/webhook values. Do not modify production credentials.
3. Keep `E2E_MODE` ownership explicit: existing timers are disabled. Add a test-process worker harness that invokes `runOnce` on the isolated runtime when authorized, rather than adding a production HTTP worker-control endpoint.
4. Start only user-authorized processes. Check origins/configuration before any provider operation, and fail closed if the simulator is absent. Do not weaken production auth/HTTPS/callback checks.
5. Reuse existing persona/session setup. Use test-owned cleanup; no automatic DB migration, seed/reset or hidden database writes beyond the separately authorized fixture flow.

Acceptance: local app->production adapter->local engine path proven, with isolated fixture ownership and no live traffic. Next Step 10; **3 remain**.

## Step 10 — Implement browser lifecycle and concurrency tests

1. Test checkout/reservation -> confirm/commit -> deposit -> reviewed route -> queue -> worker -> signed callback/poll -> delivered -> gross collection -> completion.
2. Test two accounts confirming one order, duplicate queue, uncertain acceptance retaining ownership, payment changes stopping unattempted jobs, and new unique attempt invoice after safe review cancellation.
3. Test cancellation before/after attempt, rejected delivered cancellation, warehouse receipt, unsafe goods, explicit one-time restoration, refund-only action and partial refund with separately selected whole-order recovery.
4. Test legacy ambiguous payment/claim records as review-required cases, custom-role permission denials, stale snapshots and incorrect callback credentials.
5. For every scenario, assert UI plus authorized persistence/history evidence and exact simulator request count/fields. Toasts and screenshots are insufficient.
6. Run concurrency using the actual isolated PostgreSQL/runtime setup. Earlier serialized in-memory fixtures are not proof of cross-runtime uniqueness or transaction behavior.

Acceptance: selected lifecycle/race scenarios pass without live courier calls or hidden test bypasses. Next Step 11; **2 remain**.

## Step 11 — Review completeness, isolation and cleanup

1. Inspect production diff for test-only bypasses, leaked keys, external forwarding, uncontrolled timers and destructive cleanup.
2. Verify every selected contract/state/fault has assertions, including assertions that forbidden money/stock/provider operations did not happen.
3. Validate parallel-worker namespace isolation and safe interrupted-run cleanup. Confirm missing simulator or invalid config cannot silently send a live request.
4. Run the authorized clean-state repetitions and record exact revisions, reports, profile versions and remaining live-contract limitations.
5. Distinguish readiness for simulator control, adapter HTTP contract, browser E2E, real concurrency, and live merchant acceptance. Fix defects before marking these gates passed.

Acceptance: no unresolved simulator/E2E blocker; cleanup ownership and limits documented. Next Step 12; **1 remains**.

## Step 12 — Publish repository runbook and handoff

1. Update README with exact pinned install/start/stop commands, configuration, test commands, fixture API, fault selection, journal inspection and troubleshooting.
2. Document which commands require expanded DB/service authorization. Separate engine-only tests from browser/DB E2E.
3. Link final persistence and browser reports back into V3 Steps 10–11 and security findings into Step 12. Do not mark live provider readiness or tutorials complete from simulation results.
4. Describe reproducible fixture/scenario regeneration and when adapter/provider changes require contract review.
5. Stop with the required handoff. Commit only when asked. Tutorial recording can reuse accepted fictional workflows only after V3 Step 15 entry gates pass.

Acceptance: another agent can reproduce the authorized isolated suite from the runbook. **0 simulator implementation steps remain**, provided every preceding acceptance gate is evidenced; otherwise list the precise incomplete gates instead of claiming completion.

## Persistent progress ledger

| Step | Status | Evidence |
| --- | --- | --- |
| 1–4 | Standalone scope complete | Adapter contract inventory, pinned engine, exact per-invoice mappings and stable identity; real HTTP checks passed |
| 5–6 | Selected app acceptance verified | Signed callback persistence/replay/authentication, real polling, all fault classes and retained uncertain custody |
| 7 | Selected money/stock flows verified; optional APIs deferred | Deposits/prepaid/unpaid COD, early/gross/mismatched collection, refunds, receipt/inspection and safe/unsafe restock |
| 8 | Complete for selected standalone capabilities | 16 production-adapter HTTP contract groups passed; no app/DB imports |
| 9–10 | Selected isolated integration verified | Existing framework/personas/DB; 16 persisted Chromium checks, competing accounts and two actual worker processes |
| 11 | Selected ordinary/interrupted cleanup and worker restart verified | Saved ownership/restoration manifest, explicit scoped recovery, real lease expiry, identical independent audits; no global reset |
| 12 | Selected app handoff complete | Operational reproduction in README and V3 section 27; real courier/tutorial/release gates remain open |

For each future completed slice append: date; user authorization; chosen contract semantics; files changed; commands/results; user runtime checklist; unverified DB/provider facts; next step/count; and commit/revision. Preserve previous evidence and mark superseded results explicitly.


## 2026-10-04 — Simulator-only handoff

**Authorization:** user requested only the local courier simulator; all other work is deferred until tomorrow. This authorizes its local engine verification, not app startup, DB/Redis changes, browser E2E, real courier actions or commits. Standing boundaries above remain outside this explicitly authorized slice.

**What changed:** added the standalone WireMock profile and Bun controls under `tests/courier-simulator/steadfast/`, with pinned image digest, loopback launch, exact fictional booking fixtures, independent parcel states, fault controls, status-only uncertain recovery, callback signing and scoped journal/mapping cleanup. No production code/schema/package dependencies changed. The correct local base URL is `http://localhost:9099` **without `/api/v1`**, as required by the current adapter allowlist. Pickup/return/payment/history/service-area APIs deliberately fail until selected for a later reviewed suite.

**Checks:** 6 no-network unit tests/25 assertions, focused TypeScript and 16 actual WireMock HTTP contract groups passed. All 18 supported status strings were checked. Accepted-but-lost response remains uncertain; duplicate booking returns synthetic 409 without a new identity. Callback parsing uses the production adapter; app callback/persistence was not exercised. Cleanup preserves another run. First runtime attempt found that internal-only Docker networking prevented loopback publication; switched only this project to a normal bridge, documenting that it is not an egress firewall. Final owned engine is stopped after verification; pinned image remains installed. No DB operation, app service or live-provider request ran.

**How to test after startup:** follow the exact README start/readiness command, explicit engine-only HTTP command, then stop command. Unit/type commands require no startup. Do not configure a merchant connection or invoke app workers during this slice.

**Next:** separately authorize/integrate the existing isolated app harness (Step 9), then complete lifecycle/worker/browser/persistence acceptance. Full acceptance remains open in **7 simulator-plan steps (5–7 and 9–12)** despite standalone implementation being ready. Optional capabilities remain deliberately unimplemented. V3 Step 14 and tutorials are not complete. Files changed: simulator directory plus this plan, research status doc and V3 handoff. **Uncommitted; no commits authorized.**


## 2026-10-04 — Authorized isolated app integration handoff

The user's subsequent authorization supersedes the simulator-only deferral for isolated local app/worker/browser integration and fictional fixture writes/cleanup only. Exact retained Step 10/11 targets, the 16-check persistence/browser/concurrency matrix, runtime-discovered cancellation reconciliation correction, commands/results, private artifacts and unfinished gates are in V3 section 27 and the simulator README. No schema/provisioning operation was needed. No migration/seed/reset/new database, real courier/payment/mail, production/staging, active scan, backup/restore, tutorial or commit/push occurred.

Step 9 integration is complete using the existing framework. Selected Step 10 lifecycle/concurrency and Steps 5–7 money/state/fault acceptance are verified. Step 11 ordinary failure/success cleanup is verified; forced process interruption/crash cleanup and broader legacy-record coverage remain unverified, so **one simulator-plan acceptance step (11) remains partially open**. Optional provider APIs remain intentionally deferred. This is not an unresolved blocker to the requested selected local integration, nor a claim of complete real merchant acceptance. **Three numbered V3 steps remain (14–16)** and peak/security/staging/recovery gaps remain. Next: review this handoff; obtain a separately scoped task before further acceptance work. Tutorial creation/recording/generation requires an explicit user request. Everything remains uncommitted on `ecommerce`.

Final selected application suite: 16 checks passed twice (`run-7.txt`, `run-8.txt`); standalone adapter HTTP rerun 16 groups; 51 no-network tests/149 assertions; focused app/simulator and server types passed. Independent audits match: zero owned fixture residue, 69 retained orders, identical shared settings/default shipping, four static simulator mappings. Owned processes/supporting services started for this task are stopped; data retained. Evidence remains private under `tests/artifacts/step14/`. Baseline `846ed77`; no commit/push.


## 2026-10-04 — Local interruption and legacy acceptance completion

User authorized “commit first and do it.” Initial integration committed as `abf36a4`; follow-on test/harness/docs remain uncommitted, no push. V3 section 28 records the same guarded targets, selected legacy checks, actual SIGKILL/restart with real 120-second lease expiry, and fresh-process cleanup from a private saved ownership manifest. The 9 new cases passed, then all 25 application checks passed together; 10 simulator/control/guard/manifest unit tests with 50 assertions and focused app/simulator types passed. Independent before/after audits match: 69 retained orders, restored settings/default shipping, no owned fixtures, four static mappings, no active lock.

Selected Step 11 acceptance is now complete. No remaining simulator-plan step blocks this selected local matrix; optional capabilities, arbitrary crash/corruption cases and other browser engines are not certified. Operational commands and explicit stopped-run cleanup requirement are in the README and V3 section 28. Next: review follow-on changes before selecting a separately scoped remaining gate. Three numbered V3 steps (14–16), failed peak, security, staging, backup/restore and real merchant acceptance remain open. No migration/seed/reset/new DB, live provider/payment/mail, release action or tutorial occurred. Owned services are stopped after verification; data volumes retained.
