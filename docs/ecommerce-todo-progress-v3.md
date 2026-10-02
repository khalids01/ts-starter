# Ecommerce readiness TODO and execution guide V3

Created: 2026-09-26

Status: Step 1 inspection and launch-scope confirmation complete on 2026-09-27. Steps 2–8 implemented with safe checks; awaiting user schema/permission prerequisites and runtime acceptance. Step 9 regression checks implemented; coverage gates remain open. Steps 10–16 are not started.

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
| 3 | Make cancellation and physical restocking safe | Implementation checked; awaiting schema/runtime acceptance | 13 |
| 4 | Correct COD accounting and settlement boundaries | Implementation checked; awaiting schema/runtime acceptance | 12 |
| 5 | Enforce one active shipment under concurrency | Implementation checked; awaiting schema/runtime acceptance | 11 |
| 6 | Recheck queued dispatches and harden worker recovery | Implementation checked; awaiting schema/runtime acceptance | 10 |
| 7 | Enforce food expiry and safe batch allocation | Implementation checked; awaiting schema/runtime acceptance | 9 |
| 8 | Complete selected niche behavior and operator UI | Implementation checked; awaiting schema/runtime acceptance | 8 |
| 9 | Complete focused regression and contract coverage | Regression assertions pass; coverage and runtime gates open | 7 |
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

Steps 6–9 were authorized together and implementation/evidence are recorded in sections 14–17. Steps 2–8 still require schema application, permission prerequisites and runtime acceptance; Step 9 additionally has open coverage gates. **Next numbered step: Step 10. Seven implementation steps remain (10–16); 15 numbered acceptance gates remain unfinished (2–16).** No further implementation, database setup, app startup or commits are authorized by this batch. Steps 4–5 and the simulator plan were committed previously; this batch remains uncommitted. The simulator has its own 12-step ledger and has not been implemented; it is a prerequisite for applicable simulated courier E2E evidence, not proof of live Steadfast compatibility.


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


## 13. Step 5 — One active shipment under concurrency — 2026-10-03

### Authorization, commit boundary and status

User asked to commit existing work first, implement Step 5, and create a detailed Steadfast courier simulation plan. Existing payment-status migration recorded as `b78fd13`; Step 4 source/tests/docs committed as `b636550`. Neither operation applied SQL or accessed a database. Step 5 implementation and the new simulator plan remain uncommitted; the instruction was to commit before starting Step 5.

Step 5 is implemented with focused mocked/static checks. Real PostgreSQL uniqueness/isolation, multi-runtime races, schema application and browser acceptance remain pending. No migrations, schema edits/generation, seeds, DB access, simulator/app startup, E2E provisioning, live provider calls, or push performed in Step 5.

### Final ownership and attempt policies

1. Route confirmation uses a serializable transaction. It rereads current order/ledger/address, rejects cancelled/shipped/recovered/noncommitted orders and historical handoff, checks existing active/uncertain dispatch history, creates the immutable dispatch and `CourierShipmentClaim`, and writes acquisition history atomically.
2. `CourierShipmentClaim.orderId` primary key is the cross-connection/cross-runtime ownership authority. A uniqueness/serialization conflict returns 409 with reload/retry guidance. No process-local lock is used in production. Failure rolls back dispatch/claim/history rather than leaving an orphan owner.
3. Each reviewed attempt gets one bounded invoice: sanitized order-number prefix plus a random 16-hex-character attempt suffix, at most 100 characters. Queue uses the frozen invoice; operation identity remains `create:<dispatchId>`. Retrying never mints another invoice. The snapshot comparator preserves the reviewed attempt invoice while rechecking money/address.
4. Queue reads current dispatch and validates claim ownership inside the transaction. Existing consignment replay returns the same record only while that dispatch owns the claim; otherwise it conflicts. Creating consignment, outbox operation and queued status is atomic. Concurrent queue losers may receive 409; a subsequent valid retry reuses the existing record.
5. Worker scan/lease filters require a dispatch with a claim. The worker checks exact order/dispatch ownership before credential resolution and again before the provider call. Claimless/changed ownership is held for manual review without submission. Wider lease-version, crash-recovery, retry/auth/cooldown work remains Step 6.
6. Commercial cancellation and payment invalidation release ownership only when the cancelled dispatch has no consignment, or its sole create operation is cancelled, never attempted, has no lease, and its consignment is `cancelled_before_submission` without acceptance evidence. Release and its order timeline event occur in the same transaction as the action. Stock restoration remains governed by Step 3, not claim deletion.
7. Attempted/retry/processing/manual-review/accepted/cancelled/returned parcels retain ownership until reconciled. Bare provider-cancelled, timeout, inactive flags and physical receipt alone do not release uncertain bookings. Contradictory lease evidence is treated as uncertain custody.
8. Delivered terminal release requires actual consignment/order delivered state, fully evidenced collection, committed inventory, no unfinished create operation, no cancellation/recovery, no open courier exception and no unresolved courier return. Release marks dispatch completed and records history. It is invoked from delivery tracking, collection reconciliation and manual payment evidence for delivered parcels. Legacy ambiguous paid evidence cannot satisfy release.
9. Terminal release does not permit another shipment of a delivered/previously submitted order. This baseline permits a new review only after **proven never-submitted** cancellation while the order still has eligible committed stock. New attempt gets a new invoice; old dispatch/consignment/outbox/history remains intact. Post-handoff replacement/re-dispatch is not introduced here.
10. Existing active/uncertain legacy dispatches are not silently claimed or overwritten. Confirmation rejects their history, queue rejects missing ownership, and worker excludes claimless dispatches. User-controlled review of duplicates/uncertainty and deliberate ownership reconciliation is a prerequisite before existing jobs can resume. This agent performs no backfill.

### Files changed and first reads for the next agent

- New `apps/server/src/modules/delivery/shipment-claim.ts`: exact ownership assertion, proven-unsubmitted release, reconciled-delivered release and atomic release audit.
- `admin/delivery/routing-dispatch.service.ts`: serializable confirmation, unique claim creation, transaction-scoped queue replay/creation and safe conflict mapping.
- `delivery/dispatch-snapshot.ts`: fixed invoice preservation; `delivery/dispatch-worker.ts`: claim filters and exact ownership checks.
- `admin/orders/order-custody.ts`, `order-operations.service.ts`, `order-recovery.service.ts`, `order-payments.service.ts`, `orders.service.ts`: action integration, authenticated release actors and conflict mapping.
- `ecommerce/orders/payment-dispatch.ts`, `recovery-policy.ts`: invalidation release and conservative leased-operation evidence.
- `delivery/settlement-accounting.ts`, `tracking.service.ts`: delivered/money terminal release without deleting history.
- New `apps/server/tests/courier.shipment-claim.test.ts`: rollback/uniqueness fixture, competing confirmation/queue, release/hold policies and action integration. Existing affected fixtures updated for required claim lookups.
- New `docs/steadfast-courier-simulation-plan.md`: 12 detailed future simulator steps; research document links to it. No simulator source/configuration/runtime was created.

### Schema, permissions and legacy prerequisite

No new schema or permission identifiers in Step 5. Requires user-applied Step 2 `CourierShipmentClaim` and preceding payment/recovery schema plus Step 4 payment enum/catalog. Those applications are unconfirmed. A generated client, committed migration or empty claim table is insufficient runtime evidence.

No automatic adoption of existing active jobs. The user must review legacy dispatch/consignment/operation evidence and duplicates before ownership is explicitly reconciled through an approved process. Do not use unrestricted SQL, reset records, release uncertain ownership or invent a successful external cancellation to unblock jobs. Operator exception-resolution tooling and broader recovery remain Step 6; no generic claim-delete API is exposed.

### Safe evidence

- Server typecheck, web client boundary check and `git diff --check`: passed.
- Vite web client/server build with fictional `tests/env/.env`: passed; no service start/DB access.
- Focused files run in separate Bun processes to isolate mocks: shipment claims **24 tests/66 assertions**; routing/queue 13/29; dispatch worker 9/20; admin operations 26/86; payment service 24/75; returns/settlements 6/19; tracking 5/15; admin controller 8/13; admin service 14/26; fulfillment 11/17; payment policy 5/17. Total **145 tests passed, 383 assertions, zero failures**.
- New fixture simulates serialized persistence, rollback and unique keys. Initial missing-routing-rule/invalid-relation fixture failures were corrected and rerun. Promise-based competing calls in this fixture are **not** real database/multi-runtime concurrency evidence.
- No full-suite, browser, real PostgreSQL, simulator HTTP or live courier test run. Previously recorded standalone web typecheck alias/UI issues remain unresolved; build success is not a clean full web typecheck claim.

### User-run app acceptance after schema and isolated services are ready

Do not send these tests to live Steadfast. Use the later local simulator or authorized fake provider test environment. Record observed identities, stock, ledger, timeline and exact booking count.

1. Prepare one eligible confirmed/committed unshipped fictional order and two eligible courier connections. Open two admin tabs with different selected connections; confirm simultaneously. Exactly one dispatch/claim/history acquisition may succeed. Other request must conflict without an orphan dispatch.
2. Inspect winning attempt invoice: merchant order context plus bounded suffix. Double queue that dispatch; expect one consignment and one `create:<dispatchId>` operation, or a safe conflict followed by reuse. Invoice must be unchanged across replay.
3. Check queue/worker against an isolated legacy dispatch without a claim. Expect review-required rejection/no provider call, not silent ownership adoption. Do not create a competing claim by hand without reviewing historical submissions.
4. Change payment evidence after a confirmed review with no submission. Expect cancelled review, release history, and eligible fresh review with a different invoice. Retain the old dispatch record.
5. Repeat after queueing a never-attempted job. Expect cancelled create/consignment, released claim and no stock effect from payment invalidation. Review/queue again; expect new attempt invoice and outbox identity. Old cancelled operation must not book later.
6. Cancel the commercial order before submission. Expect safe claim release combined with the Step 3 stock policy; cancellation audit includes actor. A cancelled commercial order cannot start another shipment merely because its claim is gone.
7. Inject attempted/in-flight/retry/manual-review or accepted booking. Cancellation/payment change must retain claim and booking identity, with no second confirmation or unsafe stock restoration. Provider cancellation/return-received flags alone must not release it.
8. Deliver unpaid COD without collection evidence. Expect delivered state but retained claim and unpaid status. Reconcile exact gross collection; when no open recovery/return/exception exists, expect dispatch completed, one release event, claim removed and unchanged historical consignment.
9. For a fully evidenced prepaid order, deliver through the fake callback/poll. Expect the same reconciled terminal release. A later replay must not add another release event.
10. With open exceptions, physical recovery or unresolved courier return, matching money/delivery must still retain ownership. Do not bypass review by changing active/status flags.
11. After successful delivered release, try another confirmation. Expect rejection because the order has shipped/delivered history. Release is cleanup of operational ownership, not authorization to resend delivered goods.
12. With authorized real PostgreSQL and independent runtimes, repeat two-connection confirmation, double queue, lease-vs-cancellation/payment race and failure rollback. Verify one owner/outbox, no orphan writes and no provider duplicate. Record actual persistence/browser evidence before accepting concurrency readiness.

### Handoff and remaining work

Read claim/routing/worker and action integrations first. Next is **Step 6 — harden dispatch eligibility and recovery**: connection/service/capability checks immediately before submission, lease overlap/version ownership, recovery before uncertain retry, auth/cooldown handling, provider-success/local-save failure separation, and clear operator reconciliation. Do not turn conservative Step 5 holds into automatic resubmission or release.

The separate simulator plan is ready for future execution; all 12 simulator steps remain unstarted. Follow its contract provenance, per-invoice state, real adapter HTTP, signed callback, fault, money and isolated E2E gates. Simulator success will not establish live merchant acceptance.

**11 ecommerce implementation steps remain (6–16); 15 acceptance gates remain unfinished including Steps 2–5 prerequisites/runtime acceptance. Step 5 and the new plan are uncommitted.**

### Step 5 commit authorization and simulator sequencing correction

User authorized committing Step 5 and the simulator documentation. Step 5 source, focused tests, and this guide are committed together; the simulator plan and research link are committed separately. Earlier uncommitted statements describe their historical handoff time and are superseded by this entry. No push, database command, service startup, or live courier action was performed.

Correction to the earlier Step 4 simulator handoff: prepare the simulator before V3 Steps 10–11 persistence/browser verification; V3 Step 12 is security verification, not simulator implementation. The simulator has its own 12-step ledger. Next ecommerce implementation remains Step 6; 11 implementation steps and 15 unfinished acceptance gates remain. User asked whether the remaining work can run together; this does not authorize implementing those steps yet.

## 14. Step 6/16 — Dispatch eligibility and recovery — 2026-10-03

Status: implemented; awaiting user schema prerequisite and isolated runtime verification. User authorized Steps 6–9 as one batch, overriding the per-step pause for this batch only. No commits authorized for this batch.

What changed:
- Operation lease tokens and per-connection durable lease/cooldown fields added to the Prisma delivery schema. User must apply schema separately; generation passed. No migration SQL or DB access.
- Worker serializes provider requests per connection across runtimes. Its 30-second request deadline is below the 120-second lease; completion/retry/review mutations require the current token and unexpired lease. Credential resolution is followed by a fresh eligibility read.
- Cancelled/recovered/uncommitted orders, missing ownership, changed money/address, unavailable connection/service, and unsupported operations/capabilities are held with durable exception reasons. Authentication disables the connection; 429 persists cooldown. Cooldown skips do not count as provider attempts.
- A previous attempt/crashed lease invokes the neutral adapter recovery contract before any create. Missing/status-only recovery is held, including Steadfast's status-only invoice endpoint. No proof of rejection is inferred from 404. Provider-success/local-save failure is held without automatic recreation.

What was checked:
- `bun run db:generate`: passed. `bun test apps/server/tests/courier.dispatch-worker.test.ts`: 23 passed / 50 assertions. `bun run --cwd apps/server check-types`: passed.
- Tests use mocked persistence/provider, not real lease/concurrency proof. No service, DB, browser, or live provider action.

How you can test after running the app:
1. Apply schema in a separately controlled workflow and use the later isolated simulator.
2. Queue an eligible order, disable/archive its connection or service, or change payment/address before the tick. Expect no booking, manual review and an exception reason; claim and inventory remain intact.
3. Inject authentication failure. Expect connection disabled/auth_failed and no sibling booking. Fix credentials, run the existing health check and explicitly enable; held jobs still need reviewed reconciliation, not automatic resumption.
4. Inject 429; verify durable cooldown. Inject timeout/crash after acceptance; retry must recover the same invoice and never issue another create when recovery is incomplete.
5. Run competing runtimes and stale-result/local-save-failure scenarios. Verify token guards, one connection request, no late overwrite and no second booking. This remains Step 10 evidence.

Open issues: existing legacy jobs need ownership review; no generic manual-review reset or claim-delete endpoint is introduced. Operator intervention must not manufacture booking evidence.
Next: Step 7 — expiry-safe inventory (authorized in this batch).
Steps left: 10 implementation steps (7–16); Steps 2–6 runtime acceptance remains pending.
Git: no staging/commit/push.

## 15. Step 7/16 — Expiry-safe inventory — 2026-10-03

Status: implemented; awaiting user schema prerequisite and runtime verification.

What changed:
- Shared `ecommerce/inventory/stock-policy.ts`: exclusive expiry instant (`expiryDate <= now` is unavailable), including timezone-equivalent instants; undated inventory remains allowed. A date-only input means UTC midnight at the start of that date, not an inclusive end-of-day promise. The receiving UI now accepts a local datetime and sends an absolute ISO instant. Operators must enter the intended timestamp; do not silently reinterpret legacy timestamps.
- Storefront product/checkout/filter stock queries exclude expired, quarantined/unsafe, and inactive-location stock. Availability subtracts reservations; in-stock query uses the database reserved-quantity field rather than merely on-hand > 0.
- Checkout uses earliest eligible expiry then stable stock ID, undated last. Existing serializable checkout/rollback and last-unit protections retained. Commitment validates all reservations before any stock writes, including reservation expiry. Manual shipment and worker recheck committed batch safety; cancellation/restocking cannot make unsafe stock sellable.
- Batch disposition enum/field added; audited inventory-management endpoint and existing stock-table inspection dialog allow quarantine/unsafe/sellable disposition without changing quantities. Expired batches cannot be marked sellable. User-applied schema required; generation passed.

What was checked:
- Pure inventory policy: 4 tests / 8 assertions. Shop service: 12 / 38 including FEFO allocation. Admin order service: 16 / 32 including no partial unsafe commit. Manual fulfillment: 11 / 17. Worker: 24 / 52. Inventory service: 7 / 13. Server typecheck passed before final UI; final batch checks will verify the resulting UI/API.
- Fixtures are mocked; real last-unit/expiry races and browser behavior remain Steps 10–11. No DB/service/live action.

How you can test after running the app:
1. Apply disposition schema separately; use fictional dated stock and an undated gadget.
2. In Inventory, inspect a batch as awaiting inspection or unsafe with evidence. Availability becomes zero; history records actor/reason with zero quantity change. Returning to sellable is rejected if expired.
3. Receive expired, early-future and late-future batches; storefront count excludes expired and reserved units. Checkout reserves early-future first; verify batch in reservation/movement history.
4. Let a reservation expire or its batch expire/become quarantined before confirming. Confirmation fails with no partial stock commitment. Repeat after commitment and before manual/courier shipment; shipment is rejected/held, with no provider call.
5. Verify undated gadget checkout still works; repeat last-unit concurrent checkout on an authorized real DB. Do not treat the mocked fixture as that evidence.

Open issues: legacy expiry timestamps and batch safety must be reviewed by operators; no automatic backfill/disposal. No regulatory compliance claim.
Next: Step 8 — selected food/gadget workflows and operator UI (authorized in batch).
Steps left: 9 implementation steps (8–16); Steps 2–7 runtime acceptance remains pending.
Git: no staging/commit/push.

## 16. Step 8/16 — Selected food/gadget workflows and operator controls — 2026-10-03

Status: implemented baseline; awaiting user schema/configuration prerequisites and browser/persistence verification. Both food scopes, launch serial/IMEI tracking, category-based warranty, and partial payments remain selected. No ledger expansion or new framework introduced.

What changed:
- Explicit category `fulfillmentKind` (standard, packaged_food, fresh_food, gadget, clothing), `serialTracking` (none, serial, imei, serial_and_imei), and `warrantyDays` (0 disables; up to 3650). Only gadgets can have tracking/warranty; warranty requires tracked units. Configure each actual product category: handling is deliberately **not inherited** from parents or guessed from slugs/attributes. Existing catalog templates/specs remain for ingredients, storage, size, and other product information; product detail shows configured gadget warranty duration and fresh-food slot requirements. No regulatory validation claim.
- Checkout stores immutable category handling/tracking/warranty snapshots on order lines. Later category edits cannot remove an existing purchase's tracking requirement or change its warranty duration.
- Fresh delivery slots have explicit postal-code areas, absolute cutoff/start/end instants, and capacity measured in total fresh-food item units. Checkout reserves slot capacity in the stock/order serializable transaction. No slot, wrong area, cutoff reached, full/closed slot or CAS loss rejects the order. Mixed fresh/ordinary carts use one local shipment/window for the whole order.
- Admin Orders exposes dated slot creation/closure; slots are immutable apart from closure. Local browser datetimes are submitted as absolute ISO timestamps. Slots are publicly selectable at checkout by postal code. Bookings move reserved -> preparing -> ready; preparing stores an irreversible timestamp and actor/evidence timeline. Shipment requires ready state within the active [start,end) window.
- General parcel dispatch is blocked for fresh food in route confirmation, queue, and worker. Use manually recorded local delivery. This baseline deliberately does not assume Steadfast freshness/temperature suitability. A merchant must arrange appropriate transport and configure actual areas/cutoffs/capacity; software alone does not establish freshness safety.
- Cancellation before preparation releases capacity once; after preparation it retains consumed capacity and forces recovery review. Prepared food cannot be saleably restocked even after a sellable inspection. Packaged-food returns still require the existing physical receipt/inspection and valid batch safety.
- `InventoryUnit` identifies already received gadget stock; normalized serial and IMEI each have a unique key. One 15-digit IMEI per unit is supported; no device-authenticity or carrier validation is claimed. Registration never increases stock. Register before stock commitment. Allocation requires matching variant/committed batch/location, exactly one unit per tracked item quantity, atomic availability claim, and no courier review/handoff. Operators can unassign before review/shipment to correct allocation.
- Shipment, full physical receipt, unsafe inspection and saleable restock update unit custody in the same order transactions. `UnitAllocation` preserves the purchase history when a returned unit is restocked/resold. Never infer a physical receipt from provider return status.
- Warranty starts at accepted delivery, lasts elapsed 24-hour days with an exclusive deadline, and belongs to the purchased allocation. Non-gadgets, untracked/no-warranty, undelivered, cancelled, fully refunded, returned and expired purchases reject claims. Claim references are idempotent, only one open claim per purchase is accepted, decisions require evidence/actor and are final. Approval records warranty review; it does not automatically refund, replace, book a return or restock inventory.
- Customers can open claims only for their signed-in purchase. Customer order lookup now requires the purchasing account; knowing another customer's email/phone is not authorization. Customer responses omit adminNotes. **Guest checkout remains supported, but guest private tracking/warranty access is unavailable until a separately reviewed verified-access flow exists.** Do not reintroduce email/phone-only authorization. Guest customers require operator assistance in this baseline.
- Existing Orders, Inventory, Catalog, Checkout and Track Order screens provide the controls with loading/error states. Manual fulfillment now rejects courier-managed consignments/claims, preventing conflicting tracking/shipping/delivery actions.
- Courier Tracking exposes submission state, attempts, next check and durable exception reasons. Dispatch permission can resume only a reviewed **first-attempt pre-submission eligibility hold**, with current claim, money/address, order, niche and stock checks. Same invoice/operation is retained. Authentication/network/uncertain/accepted/local-save-failed or leased bookings cannot be reset into a fresh create. The hold reason is resolved and retry evidence audited atomically; generic exception dismissal/claim deletion remains unavailable.

Schema prerequisite:
- User must apply all changed delivery, inventory, catalog and order Prisma models/fields outside this agent workflow. Includes batch disposition, lease/cooldown fields, category and line snapshots, InventoryUnit, UnitAllocation, WarrantyClaim, FoodDeliverySlot and FoodOrderBooking/preparedAt. Generation passed; no migration SQL created/edited/applied. Existing categories default standard/none/0; existing lines default standard/none/0. **Those defaults do not retroactively classify food/gadgets or establish legacy tracking/warranty entitlement.** Configure categories and review legacy orders before accepting launch data; no backfill performed.

Permissions/API:
- Category policies: existing Catalog manage; registration/disposition: Inventory manage; available-unit list: Inventory read; allocation/unassignment: Orders fulfill + Inventory manage; slot manage/closure: Orders manage; preparation/warranty decisions: Orders fulfill. All also require Admin access. No new permission identifiers/default role changes.
- New APIs: `/admin/inventory/units`, `/admin/inventory/batches/:id/disposition`, `/admin/orders/food-slots`, `/admin/orders/:id/preparation`, `/admin/orders/:id/units`, `/admin/orders/:id/warranty-claims`, `/shop/food-slots`, `/shop/warranty-claims`, `/admin/delivery/consignments/:id/retry-hold`. Typed DTOs bound identifiers, evidence, times, capacity and quantities.

What was checked:
- Niche policy/service fixtures: 28 tests / 75 assertions; niche operator service: 6 / 22; reviewed hold retry: 12 tests (final batch ledger below records final assertion count). Order controller permission tests include every new slot/preparation/allocation/warranty mutation; customer service tests cover ownership and required fresh slot/snapshots.
- No real DB, services, browser or live provider work. Final Step 9 ledger supersedes intermediate test counts.

How you can test after running the app:
1. Apply schema separately. In Catalog, set a actual gadget category to gadget/serial_and_imei/warrantyDays=30; set food categories to packaged_food or fresh_food and clothing to clothing. Attempt warranty on food/clothing and expect server rejection. Enter product facts via existing templates.
2. Receive undated gadget stock at a known location/batch; in Inventory register its unique serial/15-digit IMEI. Repeat the same serial/IMEI and expect conflict, unchanged quantity. Place/confirm an order, then assign the registered unit in Order details. A wrong variant/batch/location or another order's assigned unit must reject. Assign before confirming a courier route. Shipment without all required units rejects.
3. Unassign/reassign before courier review; verify allocation timeline. Once reviewed/queued/shipped, corrections reject. Deliver through manual fulfillment or the isolated courier simulator; verify the same allocated unit and purchase history.
4. As the purchasing account, Track Order shows unit/warranty evidence and allows a claim. Another account knowing the order number/email/phone must get not found. Repeat the claim reference and verify one claim/audit; another open claim rejects. A fulfillment operator approves/rejects with evidence; history records actor and no stock/money changes occur. Test expired, returned, refunded, undelivered, food and clothing purchases.
5. Physically receive a returned gadget, inspect, and restock once. Current unit becomes available while the original purchase allocation stays returned. Resell it through a new order; preserve both allocations and deny warranty to the returned purchase.
6. In Orders, create a future fresh slot for a fictional postal code, cutoff before start, end after start and capacity 2 units. Checkout fresh food with matching code/slot; test missing/wrong code/full/cutoff/closed cases. Confirm stock; record preparation evidence then ready evidence. General courier route rejects; local manual shipment succeeds only in the active ready window.
7. Cancel a reserved fresh booking and verify one capacity release. Cancel after preparation and verify consumed capacity retained, recovery required, no automatic restock, and prepared food cannot return to saleable stock even if an operator tries sellable inspection.
8. Hold an ordinary courier job by disabling its service before processing, restore the service, record retry review evidence. Expect the same invoice/operation requeued, one resolved hold exception and an actor timeline event. Try a timed-out/accepted booking: retry must reject and preserve ownership/evidence.
9. Verify all controls on mobile/tablet and with keyboard; role without the action permission must receive 403 regardless of hidden buttons. Guest order assistance is an explicit limitation, not an ownership bypass.

Open issues/limits: actual merchant food areas, slot times/capacity, transport suitability, gadget warranty durations/terms and legacy classifications must be configured/reviewed. No weighted food sales, recurring slot scheduler, cold-chain telemetry, dual-IMEI device support, partial physical returns, automatic warranty replacement/refund, or verified guest-access flow introduced. Do not present these as implemented.
Next: Step 9 — focused regression and contract coverage (authorized in batch).
Steps left: 8 implementation steps (9–16); runtime acceptance remains pending.
Git: no staging/commit/push.

## 17. Step 9/16 — Regression evidence and cross-agent handoff (2026-10-03)

**Status: regression implementation and safe assertion checks done; coverage acceptance remains open.** This section supersedes earlier test counts and current-next-action statements. No database command, migration SQL, seed, service startup, live courier request, E2E execution, staging or commit was performed in this batch.

### What changed

1. Expanded 22 isolated mocked suites around dispatch leases, timeout/crash recovery, authentication/cooldown holds, immutable shipment ownership, stale tracking events, stock expiry/FEFO, physical custody, money boundaries, fresh-food preparation/capacity, gadget unit history, warranty ownership and HTTP permission denials.
2. Closed manual-fulfillment bypass of courier ownership; fresh-food parcel routing is blocked and prepared food cannot be returned to sellable stock. Reservation release also releases an unprepared food booking's capacity.
3. Added an audited retry only for a proven first-attempt pre-submission hold. Uncertain bookings and authentication failures cannot be reset into fresh creates. Restore connection credentials/health before progressing; ambiguous outcomes remain operator review rather than automatic rebooking. A definitive rejected/not-booked disposition workflow remains an operational limitation requiring reviewed proof before any claim release or new attempt.
4. Added `POST /admin/delivery/consignments/:id/reconcile-booking` and the tracking-card evidence form under `AdminDeliveryReconcile`. The operator supplies the exact original invoice, merchant consignment ID, optional tracking code, merchant status and source evidence. It completes only an unleased uncertain original operation, preserves shipment claim and money/cancellation/recovery facts, resolves only its submission exception, and performs no provider create. `submittedAt` records local confirmation time, not a claimed historical merchant booking timestamp. Duplicate identical booking identity is idempotent. Evidence must be verified by the operator; typed text is not provider authentication or delivery proof.

### Safe verification and limitations

- All 22 inspected isolated assertion suites pass. The refreshed run has **294 tests and 757 assertions**, including reconciliation identity checks and its permission denial. Isolation is intentional because Bun module mocks are global; this is not evidence that a monolithic repository run or real database concurrency passed.
- Server and generated database TypeScript checks, web boundary checks and production web build pass. Raw web TypeScript checking still has existing alias/UI errors; do not claim that gate passes. New niche components had no reported errors in the inspected raw check.
- Prisma client generation ran after schema changes. No schema was applied to a database and no migration was authored. Actual unique constraints, Serializable contention, FK behavior and restart durability remain Step 10 evidence.
- Coverage artifacts live in ignored `tests/artifacts/coverage/v3-steps6-9/<suite>/` (`tests.txt`, `coverage.txt`, `lcov.info`). The existing root thresholds are 80% lines and 70% functions. **21 of 22 isolated coverage commands fail these thresholds** because imported unexercised modules are counted; only the payment-policy suite passes. These failures are preserved and were not bypassed or weakened. `summary.json` has refreshed assertion totals; inspect each refreshed coverage log for the two changed suites rather than treating earlier coverage percentages as current.
- Bun LCOV output here has line/function totals but no branch records or function identity suitable for trustworthy cross-suite union. The Step 8/9 critical-branch targets are **not verified**. Next verifier must choose and document an approved branch-capable measurement approach, add meaningful missing cases, and pass the established coverage gate; do not sum isolated percentages or claim the branch target from line coverage.
- Signed-in purchasers can access private order tracking and their own warranty allocations. Guest checkout remains supported, but guest private tracking/warranty requires operator assistance until a separately reviewed verified-access flow exists.
- No actual food safety/temperature suitability, merchant operating schedule, dual-IMEI support, automatic warranty replacement/refund, partial physical return or live provider capability is proven by these changes.

### How to test after the user runs the app

1. First have the user apply/review schema changes and refresh the existing permission catalog through their own approved process. An agent must not infer authorization to run migrations, seed, query or start services from this guide.
2. Run the Step 6 operator checklist: disable a queued connection, restore a proven preflight hold with review evidence, verify one request per connection across workers, trigger timeout/429/authentication fixtures, and confirm uncertain submissions never generate another create. For a verified existing parcel, record its exact invoice/merchant identity under reconciliation permission; verify dispatch completes but payment/delivery remain unchanged. A dispatch-only account must receive 403.
3. Run Step 7 checks at an expiry boundary and across sellable/quarantined/unsafe batches. Verify storefront availability, reservation FEFO, commitment, shipment and restock agree. Test actual concurrent stock contention separately in Step 10.
4. Run Step 8 checklists with explicitly configured categories: food/clothing reject warranty, gadget identifiers bind to committed units, cancellation/return preserves history, only the purchasing account can claim within the window. Configure a future food slot, fill capacity, test area/cutoff, prepare it, cancel, and confirm prepared capacity/custody cannot be undone or restocked as sellable.
5. Test tracking regression/identity conflicts and duplicate reconciliation while checking persisted order, operation, exception and claim facts through approved user-run fixtures. Browser appearance and real persistence are unverified here.
6. Store actual observed results and failures in this document. Keep Steps 6–9 awaiting acceptance until their missing evidence is supplied; security verification and tutorial recording are later gates.

### What is next and steps left

**Next: Step 10, real persistence and concurrency verification. Seven numbered implementation steps remain (10–16), and 15 numbered acceptance gates remain unfinished (2–16).** Step 9 coverage gates remain open. Build the separately planned local simulator when explicitly authorized before using it for courier E2E. Do not start Step 10 database/E2E setup, Step 12 security scans, Step 15 tutorial generation or make commits without the applicable user authorization.

Next agent first reads: this header/ledger/current action, sections 14–17, `delivery/dispatch-worker.ts`, `delivery/tracking-worker.ts`, `delivery/dispatch-policy.ts`, `admin/delivery/routing-dispatch.service.ts`, `ecommerce/inventory/stock-policy.ts`, `ecommerce/niche/*`, `admin/orders/niche-operations.service.ts`, the four ecommerce schema files, and the simulator plan. Read current git diff before modifying anything; this batch is intentionally uncommitted. Preserve neutral provider contracts, exact lease/claim ownership, historical allocations, audit evidence, no warranty for food/clothing, and the no-database-operation boundary.

## 18. User-authorized migration, RBAC refresh and commit handoff

The user explicitly authorized running Prisma migration in `packages/db`, seeding RBAC, and committing this batch. This supersedes the earlier no-migration/no-seed/no-commit boundary only for these actions.

- Ran `bunx prisma migrate dev --name ecommerce_v3_dispatch_stock_niche` from `packages/db`. Prisma connected to local PostgreSQL database `ecommerce`, public schema, at `localhost:5432`; created and successfully applied `20261002210646_ecommerce_v3_dispatch_stock_niche`. Prisma reported the database in sync. No reset was required or performed.
- Ran `bun run db:seed:rbac` from `packages/db`. Prisma Client 7.8.0 generation and RBAC seeding completed successfully. Used the dedicated permission/role seed; the full demo ecommerce seed was not run.
- Committing the authorized Steps 6–9 implementation, regression tests, guide and generated migration. This removes the local schema-application/RBAC prerequisite for this database only; it does not prove database concurrency, browser acceptance, another deployment's schema, coverage thresholds, or release readiness.
- After starting the app, verify the updated permissions in a refreshed admin session, then run the step-specific operator checklists. Recheck explicitly configured category policies, inventory batch disposition and future food slots; legacy records retain conservative defaults.

**Next: Step 10. Seven implementation steps remain (10–16); the previous 15 unfinished numbered acceptance gates remain open until runtime/review evidence is recorded.** No app startup, real courier call, active scan or E2E execution was authorized or performed in this follow-up. Use this section as the latest database/commit authorization evidence; older sections describe the state before this follow-up.
