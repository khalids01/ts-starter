# Ecommerce readiness TODO and execution guide V3

Created: 2026-09-26

Status: Step 1 inspection and launch-scope confirmation complete on 2026-09-27. Steps 2–4 implemented with safe checks; awaiting user schema/permission prerequisites and runtime acceptance. Steps 5–16 are not started.

## 1. Purpose and deployment model

Make this starter dependable for independently deployed niche ecommerce shops before final security verification and automated tutorial production.

Each shop has its own deployment, database, Redis, runtime, domain, configuration, and courier credentials. This is a single-store application reused across deployments. Do not introduce tenancy, store IDs, cross-store dashboards, shared inventories, shared customers, or cross-store authorization.

The supported baseline is unit-based physical products, existing catalog attributes/variants, inventory locations/batches, checkout, discounts, customer records, audited admin order operations, and provider-neutral courier delivery with Steadfast as the first implemented adapter.

This document is the execution authority for V3. V2 and the delivery plan remain historical/contextual references. Preserve useful acceptance requirements from `ecommerce-step-8-plan.md`; do not silently weaken them. If current code contradicts this guide, inspect and explain the difference before choosing an implementation. The audit findings below are starting hypotheses grounded in source inspection, not permission to rewrite an entire module.

## 2. Absolute working boundaries

These rules apply to every model, agent, reviewer, and subtask.

1. Implement only the step explicitly authorized by the user. Creating this guide does not authorize implementation.
2. Do not commit, stage, push, merge, tag, or release unless the user explicitly asks. Read-only Git inspection is allowed. Never overwrite unrelated user changes.
3. **No database commands or database access during implementation.** No database queries, Studio, migration creation/application/status/diff, `prisma migrate`, `prisma db push`, resets, seeds, provisioning, backfills, or real-database tests. Do not write or edit migration SQL.
4. Schema edits and `bun run db:generate` are the only permitted Prisma/database-tool operations. Generation is allowed only when needed. Do not run Prisma format/validate separately under this agreement; generation and static checks provide the permitted checks.
5. A schema change is incomplete for runtime until the user applies the corresponding database change outside this workflow. Report that prerequisite; never infer it happened because generation succeeded or a migration file exists.
6. Do not start/stop applications, workers, Docker, PostgreSQL, Redis, SMTP, browser recording services, or supporting services without explicit user authorization. Do not trigger live courier bookings, pickups, returns, refunds, or external messages without explicit authorization.
7. Do not run database-backed tests, E2E provisioning/reset, scans, load tests, or tutorial recording under the default scope. Later steps describe user-operated or separately authorized workflows; listing a command is not permission to execute it.
8. Keep changes narrow, clean, modular, and consistent with existing repository conventions. No unrelated refactors, formatting sweeps, package upgrades, new frameworks, generic engines, or wholesale file replacement.
9. Use existing UI components and thin routes. Shared business rules belong in a neutral ecommerce/delivery module; admin controllers enforce authentication, DTO validation, and action-specific permissions.
10. Keep authorization server-side. UI visibility does not authorize an action. Preserve existing role defaults unless a reviewed permission change is required.
11. Never expose credentials, raw private provider payloads, customer addresses/phones, or real customer data in logs, fixtures, tutorials, reports, or responses.
12. Do not create additional agents unless the user or an applicable instruction explicitly authorizes delegation.
13. After each step, stop with the handoff in section 5. Do not start the next step automatically.

### Safe verification during implementation

- Inspect source and read-only repository state.
- Run focused mocked/unit tests only after inspecting their setup and confirming they cannot connect to a database, Redis, external provider, or start a service.
- Run relevant package TypeScript checks and builds after inspecting scripts for side effects. Use only the affected packages; do not blindly run every root script.
- Run `bun run db:generate` if a schema/client change requires it.
- Inspect the resulting diff and report unverified runtime behavior honestly.

The user may change these boundaries explicitly. Record the exact expanded authorization in the handoff before executing dependent work. Do not treat an earlier V2 approval as a V3 database authorization.

## 3. Starting evidence and known limitations

Source audit on 2026-09-26 found:

- Standard cancellation restocks committed inventory without checking courier custody; refund restocking also lacks physical receipt/disposition checks.
- Dispatch worker submission does not recheck current order eligibility or connection enabled/health state.
- Route confirmation uses separate read/insert operations; active-shipment uniqueness is not enforced per order across connections.
- COD calculation derives collection from order total/refunds/payment status rather than a partial-payment ledger.
- Inventory batches have expiry dates, but checkout stock allocation sorts by stock update time and does not exclude expired batches.
- V2 progress and Step 8 status disagree.

Focused audit verification: 33 mocked tests passed across routing/dispatch, dispatch worker, returns/settlements, order operations, and Steadfast adapter. This does not prove database concurrency, browser behavior, production readiness, or live provider behavior.

Existing documents record a 41-test isolated browser pass. Treat that as historical evidence until rerun against the final implementation. Security, capacity, live courier acceptance, and final release gates remain open.

Do not assume documented provider gaps have disappeared. Automatic parcel-level payout reconciliation, unpublished webhook payloads, additional provider adapters, and unsupported cancellation endpoints remain deferred unless authoritative sanitized contracts are supplied.

## 4. Step ledger and counting rule

There are **16 numbered steps**. Count unfinished numbered steps, including blocked or partially complete steps. Optional niche features are selected or explicitly deferred in Step 1; do not invent hidden extra steps. If scope requires extra work, revise the ledger with user approval before changing the count.

| Step | Outcome | Status | Remaining after completion |
| --- | --- | --- | --- |
| 1 | Confirm launch scope and inspect current invariants | Complete: inspection and user launch-scope confirmation recorded | 15 |
| 2 | Define shared lifecycle/custody/money rules and required schema | Foundation implemented; awaiting schema prerequisite/review | 14 |
| 3 | Make cancellation and physical restocking safe | Not started | 13 |
| 4 | Correct COD accounting and settlement boundaries | Not started | 12 |
| 5 | Enforce one active shipment under concurrency | Not started | 11 |
| 6 | Recheck queued dispatches and harden worker recovery | Not started | 10 |
| 7 | Enforce food expiry and safe batch allocation | Not started | 9 |
| 8 | Complete selected niche behavior and operator UI | Not started | 8 |
| 9 | Complete focused regression and contract coverage | Not started | 7 |
| 10 | Verify real persistence and concurrency with user-run tests | Not started | 6 |
| 11 | Verify full browser workflows and permissions | Not started | 5 |
| 12 | Complete security verification and fixes | Not started | 4 |
| 13 | Verify runtime, capacity, and operational recovery | Not started | 3 |
| 14 | Complete controlled live courier acceptance | Not started | 2 |
| 15 | Build and verify automated tutorials | Not started | 1 |
| 16 | Independent final review and release readiness decision | Not started | 0 |

Do not mark a step complete merely because code exists. Record implementation, safe automated checks, user-run runtime evidence, review status, and outstanding blockers separately. A step whose required database/runtime evidence is missing stays `Awaiting user verification`.

## 5. Mandatory handoff after every step

Use this exact structure, with concrete values rather than generic assurances:

```text
Step N/16 — <name>
Status: implemented / awaiting user prerequisite / verified / blocked

What changed:
- Files and resulting behavior.
- Schema changes, if any; required user-applied database changes.
- Permissions/configuration/API changes, if any.

What was checked:
- Exact safe commands and results.
- Runtime/database/browser/live-provider checks not performed.

How you can test after running the app:
1. Required database/configuration/permission prerequisites.
2. Exact screen, role, fictional test data, and action.
3. Expected visible result, persisted state, history, and stock/money effect.
4. Negative/repeated-action case and expected rejection.

Open issues or decisions:
- None, or concrete unresolved items and their impact.

Next: Step N+1 — <name>, after your review/authorization.
Steps left: X unfinished numbered steps, including any incomplete current step.
Git: no commit made.
```

Update this document's ledger and step evidence after authorized work. Include the next agent's first read locations, chosen policy, outstanding schema prerequisites, and exact test evidence. Do not put credentials or customer data in the handoff.

For final Step 16, `Next` is the user-controlled release decision or named remediation; there is no automatic deployment or commit.

## 6. Step-by-step execution

### Step 1 — Confirm launch scope and inspect current invariants

**Goal:** remove business ambiguity before implementation.

1. Read this guide, V2, Step 8, delivery plan, applicable repository instructions, and current working-tree changes.
2. Confirm the separate-deployment decision; do not propose multi-tenancy.
3. Ask the user to choose food scope: packaged/shelf-stable products, fresh/prepared products, or both. Until answered, inspect independently; do not implement fresh-food scheduling assumptions.
4. Confirm whether gadget launch requires serial/IMEI assignment, warranty claims, or simply normal unit-based sales. Generic catalog attributes do not constitute a serial lifecycle or warranty workflow.
5. Recommend the smallest explicit payment scope: fully unpaid COD or fully paid manually verified orders. Ask whether partial deposits are required. Do not assume partial refunds mean partial payments.
6. Trace checkout -> reservation -> confirmation/commit -> route confirmation -> queue -> worker -> tracking -> settlement -> completion -> cancellation/return/refund.
7. Find every path that changes order/payment/delivery/inventory state, including general order editing, manual fulfillment, jobs, webhooks, polling, and admin UI. Build a short file map in this guide.
8. Confirm how manual delivery without a courier consignment is represented and how physical receipt is evidenced.
9. Record chosen launch features, explicitly deferred features, and unresolved decisions. Identify existing tests and their real versus mocked dependencies.

**Acceptance:** agreed scope; complete mutation-path map; no database actions; no code changes beyond documentation.

**User runtime check:** browse current order, inventory, courier, refund, and settings screens; confirm the desired operator workflow and terminology.

### Step 2 — Define shared lifecycle rules and minimal schema

**Goal:** give later steps one consistent definition of custody, stock, collection, and active shipment ownership.

Read: `packages/db/prisma/schema/ecommerce-orders.prisma`, `ecommerce-inventory.prisma`, `ecommerce-delivery.prisma`; admin order and delivery services; delivery tracking service.

1. Document allowed transitions and rejection conditions for pending submission, queued, submitting, submitted, handoff, in transit, delivered, cancellation review, return in progress, received return, and manual review. Reuse existing states where their meaning is sufficient.
2. Define cancellation of the commercial order separately from physical recovery of goods. Order cancellation must not imply courier cancellation or stock receipt.
3. Define return disposition: sellable, damaged/unsafe, or awaiting inspection. Physical return completion and saleable restock are different facts.
4. Define who may confirm physical receipt and restock. Prefer existing action-specific permissions; add a permission only if existing ones cannot express the responsibility safely.
5. Define when an active shipment slot can be released. A timeout or unknown provider result must keep the slot occupied until reconciled; do not enable a second booking while the first may exist.
6. Define money invariants: total, amount received, refunds, collectible COD, and settlement evidence. Use exact decimal/minor-unit arithmetic consistent with existing code.
7. Choose the smallest schema changes needed for the agreed scope. For active shipment ownership, use a schema-expressible unique claim or equivalent atomic strategy; do not rely on a custom SQL index that agents would need to create.
8. Define receipt/disposition audit fields only if existing return/event records cannot safely represent them. Do not add a generic workflow engine.
9. Apply only approved schema/interface changes and run generation if needed. Keep frontend contracts compatible or document exact necessary changes.
10. Document required user-applied database changes and migration safety expectations without creating SQL or running database commands.

**Acceptance:** written invariants; no ambiguous return-to-stock meaning; schema generates if changed; affected TypeScript passes; focused pure policy tests where useful.

**User runtime check:** schema-dependent features await user database preparation. State this explicitly; do not claim runtime readiness before that prerequisite.

### Step 3 — Make cancellation and restocking safe

Read: `admin/orders/order-operations.service.ts`, `orders.service.ts`, `fulfillment.service.ts`, `orders.controller.ts`, `admin/delivery/returns-settlements.service.ts`, and their tests.

1. Route every cancellation/restock path through the agreed shared policy; inspect general order editing and delivery-failure side effects for bypasses.
2. Before handoff, release or restock only inventory actually owned by this order and stop queued submission safely. A job already submitting is an uncertain custody case until reconciled.
3. After handoff, record cancellation/recovery review without putting goods into saleable inventory. Never call an undocumented provider cancellation API.
4. Require physical receipt evidence before restocking returned courier goods. Require explicit disposition; damaged/unsafe goods never enter saleable stock.
5. Keep refund money recording separate from inventory disposition. A partial refund must not silently restock the whole order; make any whole-order restock choice explicit under the current no-partial-item scope.
6. Make repeated and concurrent cancellation/restock safe: guard the transition atomically, move each reservation/stock quantity once, and retain audit history in the same transaction.
7. Preserve legacy manual orders with an explicit operator receipt workflow rather than pretending they have courier evidence.
8. Update only affected UI controls, confirmations, response contracts, and history labels.

**Acceptance tests:** cancellation before queue; while queued; during uncertain submission; after handoff; after delivery; confirmed received return; unsafe return; repeated/concurrent restock; refund without return; unauthorized action; transaction rollback.

**User runtime check:** cancel an unshipped fictional order and verify stock recovers once. Cancel a handed-off order and verify stock stays unavailable. Record receipt/disposition, then restock once; repeat and expect rejection/no movement. Inspect actor/reason/history.

### Step 4 — Correct COD and settlement accounting

Read: `calculateCourierCod` in `routing-dispatch.service.ts`, order/payment DTOs, general order update, checkout, refund and settlement services.

1. Implement the Step 1 payment scope. If partial payments are deferred, remove claims/UI choices that imply them and reject ambiguous payment states at dispatch.
2. If deposits are required, use auditable received-payment records and derive authoritative outstanding money; do not add a mutable unverified amount field as the sole authority.
3. Fully paid orders collect zero COD, including after partial refunds. Refunds of received money must not automatically create a new courier receivable.
4. Fully unpaid eligible COD orders collect the approved outstanding total; unpaid non-COD orders cannot dispatch under the baseline policy.
5. Reject negative, overpaid, invalid-currency, contradictory, or unsupported states. Use exact money arithmetic.
6. Freeze the reviewed monetary snapshot. Payment changes before submission require revalidation/review; changes after booking require reconciliation rather than silent payload replacement.
7. Keep delivery and payment completion separate. A delivered COD parcel is not paid without accepted payment evidence.
8. Make duplicate settlement evidence idempotent; mismatches open exceptions. Keep unpublished automatic payout mapping disabled.

**Acceptance tests:** unpaid COD; prepaid; paid then partially/full refunded; unsupported deposit; currency mismatch; duplicate settlement; amount mismatch; settlement before delivery; changed money after queue; RBAC denial.

**User runtime check:** preview COD on unpaid and paid orders; partially refund a paid test order and verify collection stays zero. Reconcile a delivered COD order with matching evidence; repeat and verify no duplicate credit/history. Try a mismatch and expect review.

### Step 5 — Enforce one active shipment under concurrency

Read: route `confirm`/`queue`, courier schema, active lifecycle updates in tracking/returns/workers.

1. Acquire the per-order active shipment claim atomically with route confirmation and its immutable snapshot.
2. Ensure simultaneous confirmations on the same or different connections cannot both win. Per-connection invoice uniqueness alone is insufficient.
3. Make repeated queue requests resolve to the existing consignment/operation or a documented conflict without duplicating work.
4. Keep one stable invoice and operation identity through all retries; do not mint a new reference after a timeout.
5. Release ownership only at the defined reconciled terminal point. Define subsequent re-dispatch identity explicitly; the current connection/invoice uniqueness must not be accidentally broken by reusing an old booking reference.
6. Resolve database uniqueness/transaction conflicts into safe API responses. Do not use process-local locks as the cross-runtime authority.
7. Record claim creation/release and selected route history; preserve historical consignments.

**Acceptance tests:** simultaneous confirmations across two connections; double queue; uncertain booking blocks another route; terminal release; authorized re-dispatch if in scope; rollback leaves no orphan claim/outbox.

**User runtime check:** confirm the same order from two tabs with different connections. Exactly one active route should remain; the losing action should show a clear conflict. Double-click dispatch and verify one operation/consignment.

### Step 6 — Harden dispatch eligibility and recovery

Read: `delivery/dispatch-worker.ts`, credential/registry code, Steadfast adapter, routing service, tracking worker.

1. Recheck order cancellation, committed stock, active claim, connection/service archive/enabled/health, reviewed address/money snapshot, and provider capability immediately before external submission.
2. Define invalid queued-job handling: hold for review or terminate safely with audited reason. Do not silently dispatch or discard the claim.
3. Coordinate cancellation with operation leasing. A lease is not proof the provider has not received a parcel request.
4. Prevent overlapping processing for one operation; bound provider request duration relative to lease and guard completion by lease ownership/version. Consider multiple runtimes and interval ticks.
5. Recover before another create after a previous uncertain/crashed attempt. Looking up the invoice only after issuing another create is not sufficient for crash recovery.
6. On dispatch authentication failure, disable automatic processing for that connection and mark auth failure. Other queued operations must stop attempting the same credentials.
7. Honor rate-limit cooldown per connection, limit connection concurrency, and retain durable retry/manual-review state. Avoid shared-key auth request storms.
8. Separate provider success from local persistence failure. A successfully booked parcel must not be blindly recreated because saving its response failed.
9. Keep retries stable, bounded, secret-safe, and visible to operators; add operational error visibility without logging private payloads.

**Acceptance tests:** cancelled queue; disabled/archived connection/service; changed payment/address; auth failure stops sibling work; 429 cooldown; overlapping ticks; expired lease; crash after provider acceptance; local persistence failure; missing recovery response; unknown operation kind.

**User runtime check:** queue an order then disable the connection before processing; verify no provider call and visible hold/review. Exercise fake-provider timeout/auth/recovery fixtures in an isolated environment; never deliberately provoke live auth lockout.

### Step 7 — Make food inventory expiry-safe

Read: `shop/services/order.service.ts`, shop stock includes/mappers/product queries, inventory service/schema, stock commitment helpers.

1. Establish one time boundary for expiry and timezone/date semantics. Specify whether the expiry date is inclusive and test the chosen policy.
2. Exclude expired/quarantined/unsafe batches from both storefront availability and checkout allocation. Displayed availability and reservable availability must agree.
3. Allocate eligible dated batches by earliest expiry with deterministic tie-breakers; define where undated batches fall. Do not use stock update time as the expiry policy.
4. Recheck eligibility at commitment/dispatch where required; handle a batch that expires after reservation without selling it automatically or creating partial commits.
5. Preserve atomic last-unit reservation and rollback behavior. Do not weaken existing overselling protections.
6. Preserve non-food inventory and deliberately allow undated gadget stock under the selected policy.
7. Show useful expiry warnings/disposition to operators using existing inventory UI; avoid implying a batch field alone provides expiry enforcement.

**Acceptance tests:** expired batch only; mixed expired/valid; earliest expiry allocation; tied expiry; undated stock; expiry boundary/timezone; expiry after reservation; unsafe return; concurrent last unit; inactive location.

**User runtime check:** receive fictional expired, soon-expiring, and later-expiring batches. Verify expired stock is unavailable, checkout uses the earliest valid batch, and stock/history identifies the selected batch. Repeat with ordinary undated gadget inventory.

### Step 8 — Finish selected niche workflows and operator UI

1. Re-read Step 1 decisions. Implement only selected launch requirements; record unselected features as deferred.
2. For packaged food, verify category attributes can present required product information and batch details without claiming specialized regulatory validation.
3. For fresh/prepared food, if selected, define and implement delivery areas, slots/cutoffs, preparation capacity, and operational cancellation rules. General parcel routing is not proof of fresh-food delivery suitability. If too broad for one step, obtain approval to expand the ledger before implementation.
4. For gadgets, if selected, define serial/IMEI assignment and uniqueness, shipment/return linkage, warranty eligibility and claim ownership. A free-text product attribute is not sufficient tracking. Expand the ledger with approval if required.
5. Finish affected admin controls for receipt, disposition, review, COD warnings, dispatch hold, exceptions, and retry eligibility.
6. Verify useful empty/loading/error states, clear confirmation copy, mobile/tablet layouts, and keyboard interaction. Avoid implementation terminology in customer/operator copy.
7. Ensure manual and courier-managed fulfillment do not permit conflicting state transitions.

**Acceptance:** selected niche features work and are tested; deferred features are explicit; responsive UI and permissions match server policy; no unapproved scope expansion.

**User runtime check:** complete one representative food order and one gadget order using selected attributes and operational rules. Attempt invalid niche operations and confirm clear rejection.

### Step 9 — Complete regression and provider contract coverage

1. Inventory existing tests; distinguish pure/mocked tests from real persistence and browser tests.
2. Add missing meaningful tests from Steps 3–8. Avoid tests that merely repeat implementation branches without asserting stock, money, custody, or uniqueness outcomes.
3. Cover every mutation entry point and permission, including general editing/manual fulfillment bypasses.
4. Add fake-provider coverage proving core order/routing code does not depend on Steadfast-specific identifiers or recovery casts.
5. Use sanitized authoritative provider fixtures only. Preserve unknown statuses/events in review; do not infer unpublished payloads.
6. Retain the Step 8 coverage requirements; report line/function/branch metrics separately. If branch coverage cannot be measured safely, record the gap and approved alternative rather than inventing a percentage.
7. Run inspected safe unit tests and affected static checks; update coverage/evidence ledger.

**Acceptance:** focused safe suites pass; assertions cover invariants and failure paths; missing database/browser evidence is clearly assigned to Steps 10–11.

**User runtime check:** use the regression scenario checklist to reproduce invalid actions on fictional data; no production provider calls.

### Step 10 — Verify real persistence and concurrency

**Default execution boundary:** agent prepares tests/checklists but runs no DB commands or DB-backed tests. The user prepares an isolated test environment and executes them, or grants a new explicit authorization. Keep this step awaiting verification until actual evidence arrives.

1. Adapt existing `tests/integration/ecommerce.real-db.test.ts` and test guards only as needed.
2. Specify test-only targets and fictional data; reject development/production targets. Do not read/print connection secrets.
3. Give the user exact environment preparation prerequisites and inspected test command. Do not package migrations/seeds/resets inside an innocently named test command.
4. Prove real transaction rollback, active-claim uniqueness across connections, cancellation-versus-submission coordination, exactly-once stock recovery, money consistency, expiry allocation, and last-unit races.
5. Include simultaneous requests and separate worker/process behavior where necessary; sequential mocked calls do not prove concurrency.
6. Record command, code revision/diff identifier, date, target classification, counts, and failures without secrets.

**Acceptance:** user-run isolated persistence tests pass; schema is confirmed applied by user; no unexplained integrity failure; no agent DB execution under default scope.

**User runtime check:** run the supplied isolated integration suite and provide sanitized results. Manually inspect fictional order timelines and balances through the app.

### Step 11 — Verify browser workflows and RBAC

**Boundary:** no server startup, provisioning, reset, or browser E2E execution without separate authorization. Prepare tests and instructions first.

1. Reuse `tests/e2e/__step_8_3__/` and existing fictional personas/guards.
2. Cover catalog/stock -> checkout -> customer -> confirm -> reviewed route -> queue -> handoff -> tracking -> delivered -> settlement -> completion.
3. Cover cancellation before/after queue/handoff, receipt/disposition, explicit refund/restock, changed payment, duplicate dispatch conflict, and expiry rejection.
4. Add pickup form, reviewed provider-return submission, and signed webhook fixture coverage using fake provider responses; browser actions must not book real parcels.
5. Verify owner/admin/custom read-only/ordinary-user behavior and direct API denial for each sensitive action. Confirm private notes/credentials are absent from unauthorized responses.
6. Test mobile/tablet/desktop, keyboard focus and confirmations, relevant Chromium/Firefox/WebKit workflows, and meaningful failure/retry states.
7. Assert persisted outcomes through approved isolated test helpers, not just success toasts. Helpers remain forbidden to run until authorization changes.

**Acceptance:** required browser scenarios pass against final code; failures are fixed in their narrow owning module; user reviews results.

**User runtime check:** execute the full fictional lifecycle and persona checklist; return sanitized browser report/screenshots. Record exactly which viewports/browsers passed.

### Step 12 — Complete security verification and remediation

1. Start after correctness/integration/browser gates; security-conscious coding remains required throughout earlier steps.
2. Carry forward unfinished Step 8 security requirements: ownership/IDOR, privilege escalation, authentication/session abuse, hostile input, request limits, credential redaction, URL restrictions, dependencies, and local ZAP.
3. Review courier webhook raw-body authentication, both Bearer/HMAC checks, replay/idempotency, connection isolation, unknown payload handling, and malformed/oversized requests.
4. Review credential input/base URL handling and possible server-side request abuse; use authoritative provider constraints rather than accepting arbitrary destinations without policy.
5. Review race conditions and sensitive general-order edits as security boundaries, not only happy-path business behavior.
6. Inspect safe scan/test scripts before execution. Active scans require explicit target authorization; production scans are not implied.
7. Fix findings narrowly, add meaningful regression coverage, rerun affected checks, and record severity/evidence/disposition. Do not blanket-upgrade dependencies without checking affected runtime behavior.

**Acceptance:** no unresolved release-blocking high/critical or ownership/RBAC flaw; required security checks have real evidence; accepted residual risks have explicit user disposition.

**User runtime check:** follow isolated security reproduction cases; verify forbidden actions fail and do not mutate stock/money. Run separately approved local scans and provide sanitized findings.

### Step 13 — Verify runtime, capacity, and operations

1. Inspect production build/start paths and environment selection. Root `build`/`start` currently inject test env; use inspected production scripts for production-like evidence.
2. Verify compiled runtime startup, SSR/auth, worker startup/shutdown, Redis isolation, credential key configuration, and absent browser secrets on user-operated staging.
3. Carry forward Step 8.5 workload assumptions: 10,000 distinct customers/month is not concurrency. Define data volume, request rate, peak/soak duration, hardware, and latency/error thresholds before testing.
4. Prepare guarded fixtures/load scripts and require user execution or explicit expanded authorization. Never seed/reset/query a DB under the default agreement.
5. Check invariants after load: no overselling, duplicate bookings, lost operations, over-refunds, or unbounded retry/exception buildup.
6. Verify operational recovery: process restart after submission, expired leases, provider outage, queue backlog, authentication failure, key rotation, and restore procedure with user-run staging evidence.
7. Document per-shop env/configuration, health checks, operator exception handling, backup/restore ownership, and deployment prerequisites. Keep secrets out of docs.

**Acceptance:** measured results and tested deployment shape recorded; runtime and recovery evidence exists; no unsubstantiated capacity claim.

**User runtime check:** start production-like staging, run agreed smoke/load scenarios, restart workers during fake-provider operations, and verify durable recovery. Backup/restore exercises are user-controlled.

### Step 14 — Controlled live courier acceptance

**Boundary:** Steadfast has no assumed test environment. Real bookings/pickups/returns require explicit merchant/user authorization for each controlled action. Never automate them as ordinary E2E fixtures.

1. Confirm user-applied schema/permission/provider setup, encrypted credentials, domain/webhook configuration, and no automatically created connection.
2. Verify read-only authenticated health/balance first under authorized credentials; health ping alone does not prove merchant authentication.
3. Verify signed webhook arrival and shared webhook management visibility with sanitized evidence.
4. Have the user explicitly approve one real test parcel, its COD amount, recipient, and eventual disposal/return handling.
5. Observe booking identity, handoff, tracking, delivery, payment evidence, and completion. Do not claim payout automation from merchant balance.
6. Complete reviewed pickup/return checks only if explicitly authorized; verify receipt/disposition and inventory effects.
7. Keep automatic dispatch off until all required evidence passes. If auto-dispatch is absent, do not imply it exists or enable a fictional setting; manual dispatch is a valid launch scope.
8. Record provider-contract gaps and manual operational fallbacks. Preserve failed/unknown operations for review.

**Acceptance:** user-reviewed live merchant checklist passes for selected capabilities; no duplicates or incorrect COD/stock effects; limitations documented.

**User runtime check:** carry out the approved merchant checklist and provide sanitized identifiers/status outcomes; never paste credentials.

### Step 15 — Build and verify automated tutorials

**Entry gate:** behavior/UI is stable, preceding correctness/security/runtime/live requirements pass or have explicit reviewed launch deferrals. Do not record workflows with known release-blocking defects.

1. Re-read Step 8.6 tutorial requirements and `tests/tutorials/README.md`; retain the central library/contextual-link design and fictional fixtures.
2. Inventory the existing planned 16 tutorial manifests; revise/add courier, cancellation/custody, return disposition, expiry, and niche guides as needed. Record the final tutorial count separately from this 16-step implementation ledger.
3. Define each manifest's audience/permissions, starting state, actions, assertions, expected endpoint/result, cleanup ownership, and contextual entry links.
4. Separate recording fixtures from live merchant configuration. Recording must use isolated fictional data and fake provider behavior; no production credentials or orders.
5. Build replayable recording workflows with deterministic waits/assertions. A captured video without verified results is not acceptance evidence.
6. Generate video, poster, written guide/transcript, WebVTT captions, and narration script for every required tutorial; generated voice is optional.
7. Implement role-aware library and contextual links with accessible playback, mobile layouts, empty/error states, and no sensitive implementation details in operator instructions.
8. Record only after user-authorized services/test setup; no DB preparation commands under default scope.
9. Review each recording against final UI/actions, stock/payment implications, text/captions, permission filtering, links, and asset existence. Fix and rerecord stale segments.
10. Document regeneration commands, fixture assumptions, asset location, versioning, and triggers for rerecording after UI/behavior changes.

**Acceptance:** all selected tutorials have complete verified assets; workflows replay; permission filtering is correct; no private data; user reviews samples and full inventory.

**User runtime check:** open the library as owner/admin/read-only/user; verify visibility, links, playback, captions, and one full guide replay per workflow category.

### Step 16 — Independent final review and readiness decision

1. Re-read all selected scope, invariants, ledger, code changes, and evidence. A stronger model/agent may review here; delegation still needs explicit authorization.
2. Review final code independently for bypasses, races, money/stock errors, secret leakage, and mismatches between UI and server permissions.
3. Verify required user-applied schema and permission prerequisites from explicit evidence; migration files or generated client alone do not prove deployment state.
4. Inspect test discovery/report counts and final revision. Do not reuse results from a different implementation without explaining the difference.
5. Require the clean-state repetitions from Step 8 release acceptance through user-run/explicitly authorized workflows; do not perform resets yourself.
6. Reconcile V2, Step 8, delivery, `ecommerce-flows.md`, `ecommerce-prisma.md`, and this guide. Remove stale completion claims and document selected niche boundaries.
7. State readiness separately for code, schema application, permissions, persistence, browsers, security, capacity, live provider, operations, and tutorials.
8. List release blockers separately from accepted deferrals. An unimplemented fresh-food/serial feature is acceptable only if excluded from the agreed launch scope.
9. Present the concrete readiness result to the user. No commit/deploy/publish occurs without their instruction.

**Acceptance:** no unresolved launch blocker; every selected workflow has evidence; deferrals are explicit; user performs final approval.

**User runtime check:** repeat one complete food/gadget lifecycle for each selected launch profile on its independently configured staging deployment and verify the corresponding tutorial.

## 7. Persistent evidence template

Append one entry per authorized step. Keep previous results; mark superseded results rather than deleting history.

```text
Step:
Date:
Authorized scope:
Chosen policies:
Changed files:
Schema/client impact:
User-applied database prerequisite and confirmation:
RBAC/configuration impact:
Safe commands run and results:
User-run/explicitly authorized runtime evidence:
Code revision or diff identifier:
Unverified requirements:
Review findings and disposition:
Status:
Next agent: first files to read and first action:
Unfinished numbered steps:
```

## 8. Current next action

Step 1 is complete. Steps 2–4 implementation/evidence are recorded in sections 10–12. Schema application, updated RBAC catalog/defaults, and runtime acceptance remain unconfirmed. Next implementation is Step 5 only after authorization. **12 implementation steps remain (5–16); 15 acceptance gates remain unfinished including Steps 2–4.** Local Steadfast simulation research is recorded in `docs/courier-simulator-e2e.md`; mappings/installation/E2E remain future work, not a passed provider acceptance gate.


## 9. Step 1 inspection and handoff — 2026-09-27

### Confirmed scope and pending decisions

- Confirmed: independent single-store deployments, each with separate DB, runtime, Redis, domain, configuration, and courier credentials. No tenancy implementation.
- Confirmed: Step 1 is inspection/documentation only; no implementation, database commands/access, generation, service startup, or commits.
- Confirmed by user: both packaged/shelf-stable food and fresh/prepared food are required at launch. Delivery areas, slots/cutoffs, preparation capacity, expiry and unsafe-return handling are selected requirements; their exact policies must be defined before implementation.
- Confirmed by user: gadget serial/IMEI tracking and warranty claims are required at launch. Warranty does not apply to food or clothing. See the catalog and operational-data boundary below.
- Confirmed by user: partial payments/deposits are required. The fully-unpaid/fully-paid-only recommendation is superseded. Received-payment records, refunds, outstanding COD, and settlement evidence must agree; partial refunds are not partial payments.
- Carry forward deferred V2 scope: payment gateways, partial item fulfillment, customer returns portal, advanced promotions, tax-provider integration. Additional courier adapters and unpublished automatic payout mapping remain deferred unless explicitly selected and contracted.
- Manual-return receipt policy is not chosen yet. Inspection confirms no receipt/disposition workflow currently protects manual restocking; Step 2 must define it for manual and courier orders.

### Current workflow and mutation map

Paths are relative to the repository root. This is source evidence, not runtime verification. Re-read these files before editing.

| Responsibility | Files / entry points | Current behavior and next concern |
| --- | --- | --- |
| Checkout | `apps/server/src/modules/shop/shop.controller.ts`; `shop/services/order.service.ts` | Creates pending/unpaid/unfulfilled/reserved order, snapshots, customer link, reservations, discount redemption transactionally. Stock selection uses active locations and update-time ordering without batch expiry filtering. Steps 4/7/9/10. |
| Storefront stock | `apps/server/src/modules/shop/lib/includes.ts`, `lib/product-mappers.ts`, `lib/product-query.ts`, `services/product.service.ts` | On-hand/reserved availability must share checkout batch eligibility. Step 7. |
| Shared checkout dependencies | `apps/server/src/modules/ecommerce/store-settings/`, `discounts/`, `customers/` | Preserve settings, discount limits, customer identity and historical snapshots; edit only affected behavior. |
| Confirmation/stock commit | `apps/server/src/modules/admin/orders/orders.service.ts::updateOrderStatuses`, `applyInventorySideEffects`, `commitReservations` | Confirmation commits active reservations and decrements on-hand/reserved stock. Review races and expiry before commitment. Steps 2/3/7/10. |
| General status editing | `admin/orders/orders.controller.ts` PATCH `/:id/status` -> `orders.service.ts` | Guards dedicated cancel/refund/shipped/delivered actions, but delivery returned triggers restock. Completed has no paid-and-delivered check here. Steps 2/3/4/9. |
| Contact/address editing | `admin/orders/orders.service.ts::updateOrder` | Customer/address edits do not invalidate reviewed/queued shipment snapshot. Step 6. |
| Reservation expiry | `admin/orders/orders.controller.ts` POST `/admin/orders/release-expired-reservations` -> `orders.service.ts::releaseExpiredReservations` | Releases active expired reservations and updates stock/order/history. Search found admin invocation, no scheduled invocation in server source. Review commit/expiry races and operator expectations. Steps 2/9/10/13. |
| Cancellation/refund | `admin/orders/order-operations.service.ts`; controller POST `/:id/cancel`, `/:id/refunds` | Cancellation releases/restocks without custody checks before delivery. Refund uses serializable transaction/cumulative totals, optional whole-order restock without receipt/disposition. Step 3. |
| Stock recovery helpers | `admin/orders/orders.service.ts::releaseReservations`, `restockCommittedReservations` | Release changes reservation status. Restock increments stock and flags order restocked but leaves reservations committed. Guard every caller atomically. Steps 3/9/10. |
| Manual fulfillment | `admin/orders/fulfillment.service.ts`; POST `/:id/ship`, PATCH `/:id/tracking`, POST `/:id/delivered` | Carrier/tracking, timestamps, events; shipping requires committed stock but does not coordinate courier ownership. Steps 2/8/9. |
| Routing/queue | `admin/delivery/routing-dispatch.service.ts`, `delivery/routing.ts`, `admin/delivery/delivery.controller.ts` | Recommendation/confirmation snapshot; queue creates consignment/outbox after eligibility check. Separate confirmation read/insert permits races; queue uses current address/money instead of enforcing reviewed snapshot. Steps 4/5/6. |
| Booking/retry | `delivery/dispatch-worker.ts`, `providers/steadfast.ts`, `provider.ts`, `registry.ts` | Lease/retry/create state; worker lacks current order/connection checks. Recovery follows failed create, so crash recovery before another create needs review. Step 6. |
| Worker startup | `apps/server/src/index.ts`, dispatch/tracking worker start functions | App startup starts worker timers unless E2E mode suppresses them; startup may trigger external work. Steps 6/11/13. |
| Webhook intake | `delivery/webhook.controller.ts`, `webhook.service.ts`, Steadfast verifier | Resolves credentials, verifies/parses, claims shared WebhookEvent, synchronously invokes tracking, records processed/failed status. Preserve shared webhook management; no background processing outbox is implemented here. Steps 9/11/12. |
| Polling | `delivery/tracking-worker.ts` | Selects active external consignments on enabled/healthy connections; auth failure disables connection. Identifier/status event keys and inactive terminal parcels require return/repeated-state policy review. Steps 6/9. |
| Tracking | `delivery/tracking.ts`, `tracking.service.ts` | Normalizes state, writes consignment/order/history, marks delivered/cancelled inactive, opens exceptions, reconciles pending settlement on delivery. Pretransaction reads require race review. Steps 2/4/5/9/10. |
| Returns/settlements/handoff/pickup | `admin/delivery/returns-settlements.service.ts`, `delivery.controller.ts`, `delivery.dto.ts` | Return completion opens reconciliation exception without restock/refund. Return/pickup directly call provider; handoff changes delivery; matched settlement may mark paid. Steps 2/3/4/6/9. |
| Receive/adjust stock | `admin/inventory/inventory.service.ts::receiveStock`, `adjustStock`; inventory controller/DTO | Batch expiry and audited purchases/adjustments exist. Adjustment is not order-return receipt/disposition. Steps 7/8/9. |
| Order UI | `apps/web/src/features/admin/ecommerce/orders/` | `detail-page.tsx`, `status.tsx`, `status-drafts.ts`, `order-operations.tsx`, `fulfillment.tsx`, `courier-routing.tsx`, `courier-tracking.tsx`. Steps 3/4/8/11/15. |
| Courier UI | `apps/web/src/features/admin/ecommerce/delivery/` | Connection dialog, routing management, operations and overview pages. Steps 6/8/11/15. |
| Inventory UI | `apps/web/src/features/admin/ecommerce/inventory/` | Receive/adjust forms, stock/movement tables, supplier/location management. Steps 7/8/11/15. |
| Schema | `packages/db/prisma/schema/ecommerce-*.prisma` | Domain schemas, singleton settings, no partial received-payment ledger or serial/warranty workflow. Step 2 changes only necessary fields/models. |
| RBAC | `packages/rbac/src/permissions.ts`; order/delivery/inventory controller guards | Dedicated fulfillment/cancel/refund and courier action permissions. General state edits must not bypass stock/money authority. Steps 2/3/9/12. |

### Additional source findings for later steps

These are inspected concerns, not live reproductions or completed fixes:

1. Returned-status editing bypasses physical receipt/disposition and calls restock. Include direct API regression tests in Step 3.
2. Restock leaves reservation records committed. Order flags block some sequential repeats but do not establish concurrent exactly-once recovery. Steps 3/10.
3. General status update accepts completed without paid/delivered enforcement. Define completion invariant in Step 2; implement money/lifecycle guards in Step 4.
4. Settlement recording can set any non-paid order to paid; delayed pending settlement on delivery also writes paid. Prevent overwriting refunded states. Step 4.
5. Manual fulfillment, general edits, courier handoff and tracking are independent delivery writers. Define authority and audited override boundaries in Steps 2/8.
6. Tracking reads state before transaction; terminal-conflict protection requires race tests. Terminal inactive consignments are excluded from polling, affecting later return synchronization. Steps 2/5/9/10.
7. Webhook tracking processing is synchronous, although the plan describes enqueueing. Review reliability/time bounds and reconcile documentation without adding a parallel webhook system. Steps 9/12/13.
8. Provider return/pickup requests precede saving returned references. Cover concurrent submission and failure after provider acceptance. Steps 6/9/10/14.

### Test dependency classification

- `apps/server/tests/admin.orders.operations.test.ts`, `admin.orders.service.test.ts`, `admin.orders.fulfillment.test.ts` mock `@db/server`: service logic, not real PostgreSQL constraints/isolation.
- Courier routing/dispatch/returns/tracking/webhook tests inject fake database dependencies; Steadfast adapter tests inject fake fetch; routing tests cover pure ranking. Inspect imports/config before execution even with mocks.
- `courier.dispatch-worker.test.ts` currently has one happy-path lease/create test, not crash/cross-process/concurrency proof.
- `tests/integration/ecommerce.real-db.test.ts` imports real Prisma and creates/updates/deletes fixtures/settings. Forbidden under current no-DB agreement despite its guard.
- Playwright setup/lifecycle tests may provision roles/data and use a real isolated database. Inspect all imports/helpers before future authorization.
- `playwright.config.ts` with `E2E_MANAGED_SERVER=true` runs build/start and starts services. Forbidden during this step.
- Historical 245-unit/6-DB/41-browser evidence in Step 8 is not a current V3 pass. No suite rerun for this documentation-only step.

### Evidence and next-agent handoff

```text
Step: 1/16 — Confirm launch scope and inspect current invariants
Date: 2026-09-27
Authorized scope: Step 1 source inspection/documentation, by user instruction do it.
Chosen policies: separate deployments; both food types; gadget serial/IMEI and warranty claims; no warranty for food/clothing; partial payments required.
Changed files: docs/ecommerce-todo-progress-v3.md only.
Schema/client impact: none; generation not needed.
Database prerequisite: none for documentation; no database accessed or inspected.
RBAC/configuration impact: none.
Safe checks: source/doc reads, targeted rg, read-only git status/diff and documentation checks.
Runtime evidence: none; no app, DB, browser or provider checks executed.
Revision: uncommitted guide; git status showed guide untracked and no tracked changes at inspection start.
Findings: eight additional concerns mapped to later steps; no implementation fixes.
Status: complete following user launch-scope confirmation; implementation not started.
Next agent: read section 9 and the confirmed scope below. Do not implement Step 2 until separately authorized. Then inspect existing catalog inheritance/attributes, general order mutations/inventory helpers, tracking, returns/settlements and schema; define the selected niche/payment rules and minimal schema.
Unfinished numbered steps: 15; Steps 2–16 remain.
Git: no stage or commit made.
```

### User app review for Step 1

No app behavior changed, so there is no new feature to test. After starting the app yourself:

1. As an authorized operator, inspect Orders, Inventory and Couriers with fictional data.
2. Inspect status editing, cancel/refund/restock, manual fulfillment, route confirmation/dispatch, return/handoff/settlement controls and history.
3. Confirm launch food/gadget/payment requirements and preferred operator terminology. Confirm returns need physical receipt and a sellable/unsafe decision, rather than provider status alone.
4. Do not exercise hazardous restock cases on real orders or book real parcels for this review.
5. This scope review does not fix or verify the source defects. Later steps provide isolated negative/repeated/concurrent tests.


### Confirmed launch requirements and catalog boundary

User confirmation on 2026-09-27:

1. Food launch includes both packaged/shelf-stable and fresh/prepared products.
2. Gadget launch includes serial/IMEI tracking and warranty claims. Food and clothing have no warranty.
3. Partial payments/deposits are required.

These are required launch scope, not optional/deferred features. Earlier alternatives in numbered steps are conditional instructions; the choices above determine the branch to execute. Keep the 16-step ledger for now; Step 2 must propose a revised breakdown for approval if the selected niche work cannot remain reviewable within it. Do not silently add steps or inflate completion claims.

#### Catalog policy versus operational records

- Reuse the existing category hierarchy, category attribute templates, product/variant attributes, and batch attributes where they fit. Inspect inheritance and product-category assignment semantics before proposing fields. Do not create a parallel catalog.
- Catalog policy may determine product handling type, whether serial/IMEI tracking is required, and whether warranty applies, with warranty duration/terms where appropriate. Define precedence for parent/child categories, multiple assigned categories, product overrides, and variant overrides explicitly in Step 2; do not guess from a category name.
- Food and clothing must be ineligible for warranty under the agreed policy, even if an attribute or override accidentally requests it. Define the authoritative product classification and server-side rejection rules, including mixed/conflicting category assignments. UI hiding alone is insufficient.
- Do not treat generic attributes as the only authority for stock uniqueness, shipped serial assignment, physical returns, or warranty claim state. Use minimal dedicated operational records linked to variant/stock unit, order line, fulfillment, return, and claim as needed.
- A serial/IMEI identifies a physical unit, not a product variant. Define uniqueness scope, optional versus required identifiers, receiving/import validation, assignment, replacement, and return inspection. Do not require every gadget to have an IMEI; some have only manufacturer serials.
- Snapshot warranty eligibility, terms/duration and covered unit at sale/fulfillment as appropriate, so later catalog edits do not silently rewrite sold coverage. Define when coverage starts, proof of purchase, claim statuses, operator permissions, resolution/replacement, and audit history.
- Define fresh/prepared versus packaged handling through explicit catalog policy where appropriate. Generic parcel delivery must not imply fresh-food suitability; service-area, slot/cutoff, preparation-capacity, cancellation and perishability rules need server enforcement and operator UI.
- Use catalog attributes for descriptive details when sufficient. Add typed policy fields or dedicated records only where business validation, relationships, uniqueness, or lifecycle requires them. Keep code modular and changes limited to selected requirements.

#### Step 2 decisions still to specify

These are detailed implementation policies, not unresolved launch-scope choices:

- Food expiry date/time semantics, undated stock policy, preparation slot capacity units, delivery areas/cutoffs, and cancellation after preparation starts.
- Catalog policy precedence and authoritative classification; handling of products assigned conflicting food/clothing/gadget categories.
- Serial/IMEI uniqueness and assignment timing; warranty duration/start/eligibility and claim outcomes.
- Manual receipt evidence and sellable/unsafe disposition, including legacy orders.
- Partial-payment evidence, actor/action permissions, duplicate references, money allocation/refund rules, outstanding COD, stale queued snapshots, and courier fee versus order-total settlement semantics.

Step 2 may inspect and propose concrete options before seeking missing business choices. No schema or behavior change is authorized by recording these requirements.

## 10. Step 2 rules and schema foundation — 2026-09-27

### Scope and implementation boundary

Step 2 authorized after committing the guide as `ae358f8`. The changes below add persistence contracts and a pure money helper, not new operational endpoints. No migration SQL, database commands/access, seed, or service startup. Step 2 changes remain uncommitted; the commit instruction covered the existing guide before this work.

### Lifecycle and custody invariants

| Phase | Allowed actions | Stock and claim rule |
| --- | --- | --- |
| Pending/reserved | Confirm with valid unexpired reservations; cancel/release | Reserve is not sale; atomic commit/expiry/release, never negative reserved stock. |
| Confirmed/processing, no external submission | Review route; acquire one claim; queue | Claim created with confirmation transaction. Stock committed once. |
| Queued, never attempted | Stop queue atomically on cancellation; invalidate changed review | Only proven no-submit operations allow immediate stock recovery without return receipt. |
| Submitting, crashed, timed out, or unknown provider result | Recover using stable invoice; hold cancellation for review | No second booking, no stock recovery, no claim release while provider acceptance is uncertain. |
| Provider accepted, awaiting handoff | Reviewed handoff; tracking; cancellation/recovery review | Booking acceptance is not custody proof. Without documented cancellation confirmation, do not assume parcel absence or permit duplicate dispatch. |
| Handed off/in transit | Track; request documented return; hold exceptions | Commercial cancellation does not recover goods. No sellable stock increase. |
| Delivered | Accept matching collection evidence; complete only if money settled | Delivery does not prove paid. Historical claim release is audited; no automatic second shipment. |
| Provider cancelled or return completed | Record physical receipt and inspect | Provider state alone is not warehouse receipt or permission to restock. Retain review ownership until uncertain shipment/stock recovery is reconciled. |
| Physically received | Whole-order receipt, sellable/unsafe disposition | Sellable recovery is once-only; unsafe/awaiting inspection never increases sellable stock. |

- `OrderStatus`, `DeliveryStatus`, courier status strings, and operation state remain distinct; do not overload one status to represent all custody/money facts.
- Completed requires delivered, fully covered collection evidence, no blocking reconciliation exception, and no unresolved cancellation/return. Do not infer completion from a success toast or a single status field.
- Manual fulfillment must use the same custody policy. Explicit manual shipment/receipt events are evidence; legacy orders without evidence go to review, not automatic recovery.
- Active claim is operational exclusivity, not permission for arbitrary re-dispatch. Step 5 must require an explicit audited subsequent attempt and unique attempt invoice, while preserving one identity for every retry of that attempt.
- Keep original order number as merchant context; a later attempt must not violate existing `(connectionId, invoice)` uniqueness. Do not regenerate invoices during retries.
- Cancellation, refund, status editing, manual fulfillment, webhook/poll updates, and reservation expiry must obey these invariants. Later steps must remove the inspected general-return/completion bypasses.
- Receipt/disposition is whole-order for this baseline. Mixed sellable/unsafe returned items require item-level recovery scope; reject that operation rather than restock everything. Partial monetary refunds remain supported independently.
- Ordinary stock adjustments remain separate audited operations, not a shortcut for order-return reconciliation.

### Recovery schema and permission contract

Added `OrderRecovery`, unique by order, with receipt timestamp/actor/note, disposition, inspection timestamp/actor/note, and restock timestamp/actor. Disposition is `awaiting_inspection`, `sellable`, or `unsafe`.

- Require complete physical receipt before creation; record courier return/reference evidence in the order timeline alongside it. For a manual shipment, require explicit operator receipt evidence.
- Inspection changes must be audited; once restocked, reject changing the disposition or issuing another restock.
- Add `restocked` to reservation status. Step 3 must transition each recovered committed reservation in the same transaction as stock, recovery stamp, order flag, and history. A new enum alone fixes nothing.
- Use order fulfillment permission for physical receipt/inspection and order refund permission for refund money; existing courier return permission covers provider-return actions. The actual recovery/restock mutation must also require inventory manage permission. Guard the server, not only the form. Confirm operator/custom-role ergonomics in Step 3 before finalizing the endpoint.
- Actor IDs in new records are immutable audit identifiers; they intentionally remain stored if an auth user is removed. Validate actor identity from authentication, never accept it from client payload.

### Payment ledger and money contract

Added `OrderPayment` with receipt/reversal entries, positive exact amount/currency/method, global idempotency key, reference/note, actor, received timestamp, one-to-one reversal relation, and optional unique courier settlement linkage. Existing `OrderRefund` remains the separate actual-refund record.

`apps/server/src/modules/ecommerce/orders/payment-policy.ts` defines exact minor-unit parsing and derives:

- Received = receipts minus receipt corrections/reversals.
- Outstanding = approved order total minus received.
- Net received = received minus actual refunds.
- COD = outstanding for eligible COD orders; refunds do not increase it.
- Refund sum cannot exceed received. Negative received, overpayment, currency mismatch, zero payment entries, and unsupported precision are rejected.

Integration rules for Step 4:

1. Store only confirmed receipts; pending promises, authorized gateway amounts, courier balance, and delivery status are not receipts.
2. Validate reversals reference one same-order/same-currency receipt and exactly reverse its amount. A receipt may have one reversal only; reversal entries cannot themselves be reversed. Never reverse collection already refunded without reconciling the resulting inconsistency.
3. Receipt correction means evidence was wrong; actual money returned is a refund. Do not use reversals to bypass refund permission or history.
4. Enforce duplicate reference protection for manual receipts using a canonical method/reference-derived idempotency key. Replaying the same key with different order/money data must return conflict, not silently reuse it. Additional receipts need actual independent evidence, not arbitrary new keys.
5. Recording money requires dedicated action permission. Step 4 should add an order-payment permission rather than relying on general order manage; update catalog/defaults/tests then report the user-controlled RBAC prerequisite. No RBAC changes are made in Step 2.
6. Add and expose `partially_paid` during Step 4 together with DTO/UI/status derivation. It is intentionally not added alone now because endpoints could expose unsupported transitions.
7. Payment status is derived from ledger and refunds, never a free manual edit after ledger adoption. A refunded fully collected order has zero outstanding; commercial replacement/extra charge needs explicit scope, not inferred new COD.
8. Settlement evidence produces at most one receipt through unique settlement linkage. It must not double-count a manual receipt for the same collection. Match actual gross customer collection separately from provider fees/net payout; do not equate net payout with order money.
9. Existing paid/refunded orders have no ledger. Never automatically synthesize receipts or recalculate them as unpaid. User-controlled reviewed legacy reconciliation is required before ledger-dependent actions; block ambiguous cases. No backfill is executed here.
10. Changing money or address after route review invalidates approval. Compare reviewed snapshot at queue and before booking. After external acceptance, freeze the booking and route mismatches to reconciliation.
11. All money mutations lock/serialize the order, derive from current evidence, persist history atomically, and handle transaction conflicts safely. Pure arithmetic does not prove database concurrency.

### One active shipment claim

Added `CourierShipmentClaim`: order ID primary key, unique dispatch ID, restrictive foreign keys to order and dispatch, creation timestamp.

- Step 5 creates dispatch/snapshot and claim in one transaction; competing connections hit the same order uniqueness guard.
- Queue and worker must verify ownership; repeat queue reuses existing operation/consignment.
- Release only in reconciled safe terminal state, with an order timeline event; never on a timeout or bare provider-cancelled status.
- Existing dispatches are not claimed automatically. Before enabling new flows, the user must reconcile existing active dispatches, duplicates and uncertain submissions. New empty table alone does not protect historical active bookings.
- Do not delete historical dispatch/consignment records when releasing the claim.

### Catalog policy design for Step 8

Inspection corrected a planning assumption: `Product.categoryId` is required and singular. Category/attribute relationships are many-to-many; product/category membership is not. Preserve the single category and its ancestor chain. Do not add multi-category assignment to implement warranty.

Proposed typed policy, to implement with its resolver/admin validation in Step 8:

- Category handling classification: nullable inherited value `general`, `gadget`, `clothing`, `packaged_food`, or `prepared_food`.
- The nearest explicit ancestor establishes classification; a conflicting descendant classification under a classified ancestor is rejected. Specialized child categories share their parent classification.
- Defaults for serialized tracking and warranty duration/terms may inherit through category ancestors. Product/variant overrides may select supported serial requirements and warranty duration/terms only inside eligible gadget classification.
- No food/clothing warranty override, attribute, or child category may bypass eligibility. General products remain ineligible until explicitly classified as eligible gadgets. Validate catalog reassignment and overrides server-side.
- Serial policy distinguishes none, manufacturer serial required, and serial plus IMEI required. Not all gadgets require IMEI. Product attributes remain descriptive; operational IDs belong to physical units.
- Warranty sale snapshot preserves policy version, duration, terms, covered unit, start time and eligibility. Later edits affect future sales only.
- Category policy schema is deliberately not added in isolation in Step 2: expose it alongside resolver/DTO/UI tests in Step 8, after detailed warranty terms are chosen. Required launch features are not deferred out of scope.

Minimal operational model blueprint for Step 8 (not added yet):

| Record | Required relationships and constraints |
| --- | --- |
| Serialized inventory unit | Variant, location and optional batch, lifecycle/condition; typed identifiers with normalized global `(kind, value)` uniqueness per independently deployed shop. Quantity on-hand must equal eligible unassigned units for serialized stock; no duplicate aggregate stock on receipt. |
| Unit fulfillment assignment | Unit and order line, assignment/release/return history; one active assignment per unit, exact line quantity before handoff, inventory reservation coordination. Preserve original assignment on return/replacement. |
| Warranty coverage | Sold unit and order line, immutable eligibility/terms/duration/start/end snapshot; reject food/clothing and uncovered units. |
| Warranty claim | Coverage, authenticated/verified claimant or audited operator, status/reason/evidence, assigned operator, timestamps/history, resolution. Pending/review/accepted/rejected/repair/replacement/closed transitions; no automatic money or stock mutation on status change. |
| Replacement linkage | Original claim/unit and replacement assignment with stock/history; serial substitution never overwrites original sale. Define coverage for replacement explicitly before implementation. |

### Food handling design for Steps 7–8

Proposed engineering defaults, to review before implementing business-dependent UI:

- Use Asia/Dhaka for shop date entry/display; store UTC timestamps. Date-only packaged-food expiry becomes the exclusive start of the following local day. Compare one explicit clock against normalized timestamps; no server-local-time assumptions.
- Packaged food requires a valid expiry date for saleable received batches. Undated gadget/general stock is permitted. Fresh prepared inventory follows production/shelf-life policy, not a fabricated packaged batch date.
- Allocate earliest valid expiry first with deterministic receipt/ID ties; exclude expired, unsafe/quarantined and inactive-location stock from availability/reservation/commit.
- Fresh delivery requires explicit eligible area and dated delivery slot; no unrestricted parcel fallback. Merchant configures areas, slots, cutoff and capacity; missing configuration disables fresh checkout with a clear message.
- Capacity uses sellable prepared units per slot for the baseline, reserved atomically with stock/checkout and released exactly once on eligible cancellation. Merchants must confirm whether kitchen workload needs weighted capacity before Step 8.
- Mixed packaged/prepared carts must satisfy all selected handling/slot/area rules. Until a single compatible fulfillment can be guaranteed, reject incompatible carts clearly; no silent split shipment.
- After preparation starts, cancellation goes to operator review; perishables do not automatically restock. Monetary refund policy is separate and needs merchant-confirmed terms.
- Fresh pickup/delivery partners must be explicitly designated suitable by the merchant. Steadfast integration alone establishes no cold-chain or meal-delivery capability.

### Decisions for user review before the niche implementation

Step 2 supplies concrete defaults; it does not invent merchant warranty/refund terms. Before Step 8, confirm warranty duration/start date (proposed delivery date), repair/replacement outcomes, prepared-unit capacity suitability, service areas/slots/cutoffs, prepared-food shelf life and cancellation/refund terms. These do not block the current additive foundation; do not implement dependent behavior until settled.

### Schema rollout prerequisite and compatibility

Changed `ecommerce-orders.prisma`, `ecommerce-delivery.prisma`, and `ecommerce-inventory.prisma` only. New relations/models and reservation enum are additive; no existing model/field is renamed or removed. Generation does not create/apply database tables or backfill records.

The user must prepare/review/apply the corresponding database changes separately before runtime code selects the new relations/statuses. No database state was inspected. Existing handlers are not yet wired to these records; current bugs remain until Steps 3–6. Legacy payment/active-shipment/recovery records require deliberate reconciliation, not silent data fabrication.

### Step 2 handoff

- Changed: three schema files; pure payment policy and five focused tests; this guide with transition tables, money/custody rules, and niche model blueprint.
- Permissions/config/API: no runtime changes; future payment permission and partial-paid status reserved for Step 4.
- Verified: client generation passed; pure policy tests 5/5 passed, 17 assertions. Database-package/server static results recorded below after completion.
- Runtime test after user starts app: no new operational UI exists in Step 2. Review order/return/settlement controls against the tables above; do not assume the existing cancellation/restock/dispatch bugs are fixed. After user-applied schema and later implementation, execute their dedicated positive/negative workflows on fictional isolated data.
- Next: Step 3, after user review/authorization, starts with all restock callers and general returned-status bypass, using this recovery contract.
- Step 2 status: foundation implemented and safely checked; awaiting user schema prerequisite/review. Therefore 15 unfinished steps remain, including Step 2; 14 remain after its acceptance. No Step 2 commit made.

Step 2 final safe verification: `bun run db:generate` passed; `bun test apps/server/tests/order.payment-policy.test.ts` passed 5/5 with 17 assertions; `bun run --cwd packages/db check-types` and `bun run --cwd apps/server check-types` completed with exit code 0; `git diff --check` passed. No app/browser/real-database/live-provider tests or migrations/seeds were run. Commit `ae358f8` contains the guide before Step 2 only; Step 2 diff remains uncommitted.


## 11. Step 3 — Safe cancellation and physical inventory recovery — 2026-10-02

### Authorization and status

User authorized “do step 3”. Implemented cancellation/custody guards, physical receipt, inspection, explicit whole-order restocking, server permissions, UI, and focused regression tests. No database access, migration, seed, application startup, live courier action, staging, or commit performed. Previously staged Step 2 changes were preserved. Step 3 is implemented with safe checks; runtime acceptance remains pending. No Step 4 behavior is implemented.

### Resulting policies

1. Cancel retained, unshipped reserved inventory by releasing its reservations once. For retained committed inventory, automatic restoration also requires inventory-management permission and unexpired batches.
2. Stop never-attempted queued create operations transactionally. A lost operation lease or reservation claim aborts the transaction. Historical handoff, accepted booking, attempted submission, missing/contradictory operation evidence, and uncertain custody keep inventory unavailable.
3. Cancellation after actual delivery remains rejected; use the physical return/recovery workflow. Cancellation changes commercial state; it does not refund money or call a provider cancellation API.
4. For committed inventory requiring recovery, record full physical receipt with operator identity, timestamp, and evidence. Courier tracking/return completion alone is insufficient. Pending/in-flight create operations prevent receipt/restocking until resolved.
5. Inspect all received goods as `sellable` or `unsafe`; the initial disposition is `awaiting_inspection`, and the UI inspection choice defaults to unsafe. Receipt and inspection do not change stock or money.
6. Explicit restoration requires receipt, sellable inspection, committed reservations, unexpired batches, and fulfillment plus inventory-management permissions. Stamp recovery, transition order and reservations to `restocked`, increment original stock, and write movements/history in one serializable transaction. Repeated restoration fails without an additional stock increase.
7. Ordinary refunds never restore stock. A separately selected refund/restock action requires refund, fulfillment, and inventory-management permissions and the same recovery evidence. Even a partial monetary refund restores the **whole order** when explicitly selected; the UI states this. Partial or mixed-condition physical returns remain unavailable pending later reconciliation.
8. General status editing cannot newly set `returned`; physical receipt owns that transition. Queueing rereads order/recovery in its transaction, and the worker checks current order eligibility before claiming/submitting. An already-running external request cannot be unsent: preserve its result and retain recovery review rather than release stock.
9. Cancellation with uncertain courier custody opens an `order_recovery_required` exception; attempted retries stop for manual review. Shipment claims and unresolved courier exceptions are retained. Physical receipt does not prove that an external booking has been cancelled.

### Changed areas and next-agent read order

- Pure evidence policy: `apps/server/src/modules/ecommerce/orders/recovery-policy.ts`.
- Custody and booking control: `apps/server/src/modules/admin/orders/order-custody.ts`.
- Recovery workflow: `apps/server/src/modules/admin/orders/order-recovery.service.ts`.
- Cancellation/refunds: `admin/orders/order-operations.service.ts`; shared transaction, stock and returned-status guards: `admin/orders/orders.service.ts`.
- API validation/authorization: `admin/orders/orders.dto.ts`, `orders.controller.ts`. New actions: POST `/:id/recovery`, PATCH `/:id/recovery`, POST `/:id/recovery/restock` under `/admin/orders`.
- Related race boundaries: `admin/orders/fulfillment.service.ts`, `admin/delivery/routing-dispatch.service.ts`, `delivery/dispatch-worker.ts`.
- UI/types: `apps/web/src/features/admin/ecommerce/types.ts`, `apiCall.ts`, and `orders/{detail-page,order-operations,order-recovery,status}.tsx`.
- Tests: `apps/server/tests/admin.orders.{operations,service,controller}.test.ts` and `courier.{dispatch-worker,routing-dispatch.service}.test.ts`; existing fulfillment regression tests also pass.

### Schema and permissions prerequisite

No additional schema or permission-catalog changes in Step 3. The generated Step 2 schema/client must match the user-managed database before app testing: `OrderRecovery`, reservation `restocked`, and other Step 2 additions must exist. Schema application is **not confirmed**. Do not run database commands to supply this evidence.

Receipt/inspection require admin access and order fulfillment. Explicit restock additionally requires inventory manage. Refund/restock additionally requires refund authority. Cancellation authority by itself permits cancellation but does not grant committed-stock restoration. Use existing permission assignments; no new seed requirement. Verify custom-role combinations through the app.

### Safe verification evidence

- `bun run --cwd apps/server check-types`: passed.
- Focused files run in separate Bun processes to isolate module mocks: operations 26 tests/86 assertions, service 9/21, controller 7/12, fulfillment 11/17, worker 6/13, routing/queue 11/25. Total **70 passed, 174 assertions, zero failures**.
- Tests use in-memory Prisma/provider/environment mocks. Lost conditional updates, serializable conflict mapping, and rollback assertions are code evidence; they do not prove real PostgreSQL concurrency or provider behavior.
- Web Vite build with `tests/env/.env` and web boundary check passed. This build does not start the app or access the database.
- Raw web TypeScript checking remains blocked by repository-wide server import/path-alias and existing UI typing errors; the new cancellation result guard was corrected. Do not claim a clean full web typecheck.
- `git diff --check`: passed. Full server test suite, real database concurrency, browser behavior, and live providers were not tested.

### User-run app acceptance: step by step

Use isolated fictional orders after personally confirming schema prerequisites and starting the app. Record before/after stock quantities, reservation states, recovery, and order timeline. Do not use live courier credentials for these checks.

1. Cancel an unshipped reserved order. Expect one release, no refund, cancelled status. Repeat cancellation; expect conflict and unchanged quantities.
2. Cancel an unshipped committed order with inventory authority. Expect original inventory restored once, each committed reservation changed to `restocked`, stock movements and actor/reason history. Repeat; no increase.
3. Cancel a committed order as a role with cancel permission but no inventory manage. Expect commercial cancellation and a recovery warning; stock remains unavailable. Use an authorized recovery operator for subsequent receipt/inspection/restock.
4. For a fake-provider dispatch whose create operation has never been attempted, cancel it. Expect create job/dispatch stopped; a worker must not submit it. Check unchanged booking count.
5. For attempted/in-flight/accepted fake-provider submission or manually shipped inventory, cancel. Expect recovery review and no stock restoration. An in-flight booking may still complete; its result must remain available for reconciliation. Receipt/restock during active processing must conflict.
6. For a delivered order, cancellation must conflict. Record full physical receipt instead. Missing confirmation or blank evidence must fail. Receipt changes delivery to returned and creates recovery/history without increasing stock or refunding.
7. Inspect received goods as unsafe. Stock stays unavailable; explicit restock conflicts. Awaiting-inspection goods must also fail. Do not mark expired or damaged goods sellable merely to bypass the workflow.
8. On a different complete, unexpired return, inspect every item as sellable and explicitly restock. Expect all original quantities restored once, recovery actor/time stamped and movement/history recorded. Repeat restock, including two competing requests; only one may succeed. Real concurrency remains an acceptance requirement.
9. Attempt restoring an expired batch after sellable inspection. Expect rejection and no partial stock/recovery changes. Partial/missing/mixed-condition physical receipts cannot use this whole-order action.
10. Record a refund without selecting restock. Expect money/history change only. On another fully received/inspected paid order, explicitly select restock with a partial refund; expect partial money refund and full-order stock restoration, as the dialog states. Refund totals and deposit behavior are completed in Step 4.
11. Test roles with fulfillment alone, inventory manage alone, refund alone, and the required combinations. Buttons and server API must enforce the same boundaries; denied requests must leave stock/money unchanged.
12. Try general status editing to `returned`; expect rejection. Reload order/inventory/delivery screens after successful actions; verify quantities, recovery evidence, actor history, and stopped jobs persist. Verify queued/recovered orders cannot submit through direct API calls.

### Remaining limits and handoff

- No partial-item recovery, replacement sale, disposal, or quarantine workflow is claimed. Unsafe goods remain unavailable. Prepared-food/product policy, serial tracking, and warranty rules are Step 8 scope.
- Payment receipts/deposits, completion invariants, settlement/refund reconciliation, and delayed tracking writers remain Step 4 work. Current refund eligibility remains the existing paid/partially-refunded contract.
- Duplicate-dispatch claim lifecycle remains Step 5. General worker lease/retry/crash behavior, uncertain external reconciliation, and exception resolution remain Step 6. No undocumented provider cancellation is called.
- Real transaction isolation, browser UX, schema application, permission assignments, and fake/live provider acceptance require later user-controlled testing. Passing mocks/build do not establish ecommerce launch readiness.
- Next agent: read sections 10–11, inspect the current staged/unstaged diff without staging or reverting it, and start Step 4 only when authorized. Trace every payment/completion writer, including settlements and delayed delivery reconciliation, before changing behavior.
- **Next: Step 4. 13 implementation steps remain (4–16). 15 unfinished acceptance gates remain, including schema/runtime acceptance for Steps 2 and 3. No commit made.**


### Commit handoff — 2026-10-02

User authorized commits after Step 3. Step 2 was already committed as `8370197`. The existing user/workspace-provided `20261002144938_returned_restocked/migration.sql` is recorded in a separate schema-migration commit; the agent did not create, edit, or execute that SQL. Its presence does not establish that the database schema has been applied. Step 3 code, tests, UI, and this handoff are committed together. Earlier “uncommitted/no commit” statements describe the evidence at their original handoff time and are superseded by this entry. No push or database command performed. Next remains Step 4; 13 implementation steps and 15 unfinished acceptance gates remain.


## 12. Step 4 — Receipt accounting, COD and settlement correctness — 2026-10-02

### Authorization and status

User authorized “do it” following the Step 4 proposal and asked to find a locally installable Steadfast-compatible courier simulator for future E2E. Step 4 code/UI and safe checks implemented; runtime acceptance pending. No app/simulator startup, database access, migration creation/application, seed execution, E2E setup execution, live courier request, staging, commit, or push performed. Previous commit authorization was fulfilled for Steps 2–3; it does not automatically commit this step.

### Chosen behavior

1. POST `/admin/orders/:id/payments` records confirmed receipt evidence: exact amount, matching order currency, collection method, real reference, evidence note, authenticated actor and timestamp. It does not move money. Partial collection derives `partially_paid`; full collection derives `paid`.
2. Canonical method/reference-derived idempotency keys prevent repeated manual evidence from crediting twice. Reference normalization trims/collapses whitespace, applies Unicode NFKC and lowercases before hashing. Same data replays the existing receipt; changed order/amount/currency conflicts. Independent receipts need independent actual evidence.
3. POST `/admin/orders/:id/payments/:paymentId/reverse` appends a full reversal of a same-order manual receipt. No edits/deletes and no partial reversal. Reversal of a reversed receipt, courier settlement receipt, or refunded collection that would make refunds exceed received is rejected. Actual customer money returned belongs to the refund action, not correction.
4. Refunded money cannot exceed confirmed received money. Refunds of deposits are allowed within that bound; status follows total receipts/reversals and cumulative refunds. Refunds do not increase outstanding COD. Fully collected orders remain zero COD after refunds.
5. General order/status management can no longer change payment state. The UI shows derived payment status and uses dedicated evidence actions. Fully covered non-COD orders may dispatch; outstanding non-COD orders cannot. COD dispatch remains BDT only and exact minor-unit accounting supplies the authoritative outstanding amount.
6. Paid/refunded/authorized legacy orders without receipt evidence are held for reviewed reconciliation. No backfill or synthetic receipt is created. Read-only order detail shows the accounting issue; money/dispatch/completion actions reject ambiguous evidence. Legacy reconciliation tooling/data review remains user-controlled; do not invent an automatic conversion.
7. Review freezes a schema-version-2 request containing recipient/address, COD and a receipt/refund fingerprint. Queue rereads ledger/address inside its serializable transaction; worker checks current evidence before submission. Old version-1 reviews require renewed review. Generic shipping/contact edits are blocked while an active courier review/booking exists.
8. Payment/refund/correction changes cancel confirmed reviews and safely stop never-attempted queued operations. Attempted/accepted booking amounts are preserved, retries are held, and `payment_review_changed` exceptions require reconciliation. A request already in flight cannot be unsent. No second booking or provider amount-change API is claimed.
9. Settlement records represent **gross customer collection**, not merchant balance, fees, net payout, or an inferred payment from delivery. Exact collection must match booked COD, current outstanding evidence and currency. Mismatches/legacy ambiguity/cancelled recovery open review without credit. Zero-COD shipments do not generate payment receipts.
10. Same consignment/reference settlement replay is idempotent; conflicting data returns conflict. Accepted collection creates one linked receipt and one history event. Additional references cannot double-credit already covered collection. Manual cash receipt for a courier-managed parcel is rejected; use settlement evidence. Independent bank/mobile receipts which conflict with booked courier collection are held for reconciliation.
11. Matching pre-delivery collection remains `matched_pending_delivery` without a receipt. Delayed delivery processes pending evidence through the same accounting helper and never blindly sets paid. Later refunds are preserved on replay or mismatch; delivery alone leaves unpaid orders unpaid. Automatic provider payout mapping stays disabled.
12. Completion requires delivered status, fully covered collection evidence, committed inventory, no physical recovery, no open courier exception, and no recorded unresolved courier return. No manual paid/completed shortcut is accepted. Money writes serialize and conflicts return reload/retry responses; mock race tests do not prove real PostgreSQL isolation.

### Files and integration map

- Exact accounting/status/legacy validation: `apps/server/src/modules/ecommerce/orders/payment-accounting.ts`, using the Step 2 `payment-policy.ts`.
- Review invalidation: `ecommerce/orders/payment-dispatch.ts`; snapshot comparison: `delivery/dispatch-snapshot.ts`.
- Manual receipt/correction service: `admin/orders/order-payments.service.ts`; routes/validation: `orders.controller.ts`, `orders.dto.ts`.
- Refund bounds, summary mapping, general payment guards and completion: `order-operations.service.ts`, `orders.service.ts`.
- Courier review/queue/submission: `admin/delivery/routing-dispatch.service.ts`, `delivery/dispatch-worker.ts`.
- Shared gross collection credit: `delivery/settlement-accounting.ts`, used by `admin/delivery/returns-settlements.service.ts` and `delivery/tracking.service.ts`.
- Admin UI: new `orders/order-payments.tsx`, order detail/status/refund components, API/types, and courier collection copy.
- Permissions: `packages/rbac/src/permissions.ts`; catalog/default synchronization source `packages/db/prisma/seed/rbac.ts`; isolated auth/provision fixture source updated. No fixture/seed run.
- Regression files: payment policy/service, admin order operations/service/controller/fulfillment, routing/worker/returns-settlements/tracking, and RBAC permission catalog tests.

### User-controlled prerequisites

- Step 2 schema must exist and the additional `PaymentStatus.partially_paid` enum value must be applied by the user. `db:generate` only generated the client; it does not update the database. No Step 4 migration SQL was created.
- New permission is `admin.orders.payments` (`AdminOrdersPayments`). Permission catalog source version is 13; default owner/admin maps include it and platform user does not. The user must apply the permission catalog/default updates through their approved process, verify custom-role assignment, and refresh stale permission caches/sessions. This agent did not run seeds or Redis operations.
- Existing paid/refunded data needs independently reviewed actual receipts/reconciliation before ledger-dependent actions. Review reference uniqueness conventions across bank/mobile/cash evidence. Do not fabricate evidence to get past the guard.

### Safe verification

- `bun run db:generate`: passed; Prisma client generated. No database query/migration performed.
- Server and DB package typechecks, web client-boundary check and `git diff --check`: passed.
- Vite web client/server build with fictional `tests/env/.env`: passed. No app server or browser started.
- Focused tests ran in separate processes to isolate module mocks: payment policy 5/17 assertions; payment service/accounting 24/75; admin operations 26/86; admin service 14/26; admin controller 8/13; fulfillment 11/17; dispatch worker 7/16; routing/queue 13/29; returns/settlements 6/19; tracking 5/15; RBAC catalog 3/62. Total **122 tests passed, 375 assertions, zero failures**.
- Initial implementation/harness failures were corrected and the focused files rerun. These are mock/static checks; no full-suite, browser, database concurrency, live merchant or simulator-backed E2E claim.
- Standalone web TypeScript checking still reports repository-wide server alias/import and existing UI typing problems. The new unused payment-selector import was removed. Do not report a clean full web typecheck.

### App acceptance checklist after the user starts the isolated app

Use fictional data and local simulation when its profile has been implemented; do not submit these tests to Steadfast production.

1. As a role with order-manage permission alone, try payment recording and reversal APIs. Expect 403 and no ledger/history change. Grant dedicated payment authority through the user-managed role process and refresh the session.
2. Create a 100 BDT COD order. Record a real fictional confirmed bank receipt of 30 BDT with reference `E2E-DEPOSIT-1` and evidence note. Expect partially paid, received 30, outstanding/COD 70. Reload and verify persistence/actor/history.
3. Replay that reference with whitespace/case changes and identical amount/order/method/currency. Expect the same receipt and no duplicate history. Change amount or order with the same canonical reference; expect conflict. Empty note/reference, zero/negative/three-decimal amounts, wrong currency or excess receipt must fail atomically.
4. Record a second independent 70 BDT receipt. Expect paid and zero COD. Partially refund 20 BDT; expect partially refunded and COD still zero. Refund beyond remaining received money must fail.
5. On a deposit-only 100 BDT order with 30 received, refund up to the received amount; do not refund the unpaid 70. Verify refund does not increase original outstanding 70. Inventory is unchanged unless the separately authorized whole-order recovery is selected with its Step 3 evidence.
6. Correct a mistaken unrefunded manual receipt with a reason. Expect one append-only reversal, updated balance/status, no customer-refund record, and timeline actor. Repeat reversal, reverse a settlement receipt, or reverse collection already refunded beyond the resulting balance; expect rejection.
7. Try ordinary status editing/direct API to paid, partially paid or refunded. Expect rejection. The list/detail payment display remains derived/read-only. A legacy paid/refunded order without receipts displays a review issue; payment/COD/completion operations must not silently reset it to unpaid.
8. Review a 70 BDT COD route, then change payment evidence before queue. Expect the old review stopped/invalid, and queue/submission rejects stale money. Review again using current evidence. Also test changed address and legacy version-1 snapshot rejection.
9. Queue a never-attempted fake-provider operation, then record new money. Expect queued create stopped without stock restoration. If the worker wins the stop race, receipt recording conflicts and rolls back. If provider submission already started/was accepted, original booking amount remains frozen and reconciliation opens; no second booking.
10. On a delivered fictional 70-COD shipment after a 30 deposit, record gross collection 70 with a stable reference. Expect one linked receipt, fully covered collection and paid status. Repeat identical reference; no duplicate payment/history. Change its amount/reference association; conflict or mismatch rather than double credit.
11. Enter net payout 65, wrong currency or collection inconsistent with existing manual receipts. Expect mismatch/open exception and no payment credit. Do not use merchant balance or a provider payout total as order evidence.
12. Record matching collection before delivery. Expect pending delivery evidence and no credit. Deliver through the fake callback/poll flow; expect one credit. Repeat delivery/settlement after refund; refunded status and totals must remain correct. Delivery without collection must leave payment unpaid.
13. Attempt completion while unpaid, partially paid, undelivered, recovered, awaiting courier-return reconciliation or with an open courier exception. Expect rejection. Complete a delivered, fully evidenced, committed order with no blocking recovery/reconciliation; expect success/history.
14. Test competing receipt/refund/settlement requests using an authorized real isolated database. Verify no overpayment/over-refund/duplicate credit, transaction conflicts are recoverable and stock/history do not partially change. Record this as new runtime evidence; mocks do not substitute for it.

### Simulator finding and next handoff

Read `docs/courier-simulator-e2e.md`. No maintained ready-made Steadfast emulator was verified in the search. WireMock Open Source is locally installable and suitable as the engine; Steadfast-specific stateful mappings, signature helper if needed, network isolation and adapter/E2E verification still need implementation. No installation/startup or E2E DB setup was performed. Add that implementation to Step 12, retain all fault/identity/payment scenarios, and keep live merchant acceptance separate.

Next agent: first read sections 10–12 and the current uncommitted diff, payment accounting/invalidation, queue/worker snapshots, and settlement reconciliation. Start **Step 5 — one active shipment under concurrency** only after authorization. In particular, integrate shipment-claim ownership/release with cancelled never-attempted reviews from payment invalidation without releasing uncertain accepted bookings. Wider worker lifecycle and tracking authority remain Steps 6/9.

**12 implementation steps remain (5–16); 15 unfinished acceptance gates remain including Steps 2–4 prerequisites/runtime acceptance. Step 4 remains uncommitted.**


### Step 4 commit authorization — 2026-10-03

User authorized committing Step 4 before starting Step 5. The existing workspace-provided payment-status migration is recorded separately; the agent did not create/edit/apply its SQL. Step 4 source, tests, and documentation are committed together. Earlier uncommitted statements describe the original handoff and are superseded by this entry. Schema/permission application and runtime acceptance remain unconfirmed.
