# Ecommerce readiness TODO and execution guide V3

Created: 2026-09-26

Status: Step 1 inspection and launch-scope confirmation complete on 2026-09-27. Steps 2–16 are not started. Implementation requires separate next-step authorization.

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
| 2 | Define shared lifecycle/custody/money rules and required schema | Not started | 14 |
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

Step 1 is complete with the user launch-scope answers recorded below. Next is Step 2: define shared lifecycle/custody/money rules and minimal schema for the selected scope. Do not begin Step 2 under Step 1 authorization. **15 steps remain.**


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
