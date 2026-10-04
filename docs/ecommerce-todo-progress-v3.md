# Ecommerce readiness TODO and execution guide V3

Created: 2026-09-26

Status: Step 1 inspection and launch-scope confirmation complete on 2026-09-27. Steps 2–8 implemented; schema/RBAC prerequisites applied and covered database/browser checks passed; remaining review gates are open. Step 9 regression checks implemented; coverage gates remain open. Step 10 isolated database checks passed after explicit execution authorization; human review remains pending. Step 11 browser/RBAC checks and targeted corrections are verified; awaiting user review (section 21). Step 12 security acceptance remains open. Step 13 local workloads passed except unresolved peak; staging/recovery remain open. Step 14 selected simulator-backed app integration and interruption/legacy checks are verified (sections 27–28); real merchant acceptance is open. Steps 15–16 have not executed; tutorials require an explicit user request.

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
| 2 | Define shared lifecycle/custody/money rules and required schema | Foundation implemented; schema/RBAC applied; review pending | 14 |
| 3 | Make cancellation and physical restocking safe | Implementation checked; schema/RBAC applied; covered runtime checks passed; review pending | 13 |
| 4 | Correct COD accounting and settlement boundaries | Implementation checked; schema/RBAC applied; covered runtime checks passed; review pending | 12 |
| 5 | Enforce one active shipment under concurrency | Implementation checked; schema/RBAC applied; covered runtime checks passed; review pending | 11 |
| 6 | Recheck queued dispatches and harden worker recovery | Implementation checked; schema/RBAC applied; covered runtime checks passed; review pending | 10 |
| 7 | Enforce food expiry and safe batch allocation | Implementation checked; schema/RBAC applied; covered runtime checks passed; review pending | 9 |
| 8 | Complete selected niche behavior and operator UI | Implementation checked; schema/RBAC applied; covered runtime checks passed; review pending | 8 |
| 9 | Complete focused regression and contract coverage | Regression assertions pass; coverage and runtime gates open | 7 |
| 10 | Verify real persistence and concurrency with user-run tests | Isolated database checks passed; browser workflows exercised; human review pending | 6 |
| 11 | Verify full browser workflows and permissions | Automated scenarios verified after targeted corrections; user review pending (section 21) | 5 |
| 12 | Complete security verification and fixes | Focused remediation/tests passed; active scan, residual risk disposition and review pending | 4 |
| 13 | Verify runtime, capacity, and operational recovery | Local runtime verified; smoke/volume/expected/soak passed, peak failed; staging/restore pending | 3 |
| 14 | Complete controlled live courier acceptance | Selected simulator-backed app integration/recovery verified (sections 27–28); real merchant acceptance open | 2 |
| 15 | Build and verify automated tutorials | Not started; explicit user request required | 1 |
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

SEO is committed as `91f1c9c`. Requested FoodShop catalog/inventory seed is complete (section 33). Shopping, customer account/orders/auth and information-page work is implemented and the final isolated customer journey passed (sections 34–36); seed work is committed as `3fa1bde`, and page work is committed with this checkpoint. Next requires merchant domain/contact/approved legal content, and separately authorized provisioning of the existing SEO migration on the isolated test target for persisted publication acceptance. Editable home/about body CMS needs a reviewed schema/storage prerequisite and remains unfinished. No migrations/resets/new database, additional images or tutorials. Retain failed peak, security, staging, recovery and real merchant acceptance gates. All task-owned services must be stopped after testing.


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

## 19. Step 10/16 — Isolated persistence/concurrency suite preparation (2026-10-03)

**Status: preparation complete; awaiting user-run real PostgreSQL evidence.** User requested Step 10. Its explicit default boundary permits test/checklist preparation and safe static checks, not database commands or DB-backed execution. The prior migration/RBAC authorization in section 18 covered the local development database migration and seed; it did not provision or approve an isolated integration test target. No new database access, migrations, seeds, reset, service startup, E2E execution or commit occurred in Step 10.

### What changed

1. Expanded `tests/integration/ecommerce.real-db.test.ts` from six to **16 prepared database scenarios**. The existing checkout/discount/customer rollback races remain, with V3 checks added for shipment claims, physical recovery, money, expiry, worker crash/cancellation coordination and niche constraints.
2. Moved target validation before dynamic DB/env/service imports and before hook registration. Teardown therefore cannot run against an unvalidated target after guard failure. Cleanup scopes fictional users, variants, slots and courier connection to a per-run UUID; includes restrictive payment/recovery/courier dependencies and restores store settings when successfully loaded. Partial setup retains its ownership IDs for cleanup. Cleanup is test-data deletion, not a database reset.
3. Strengthened known-development/production target comparison by host/port/database identity; changing credentials, `postgres` versus `postgresql`, query parameters or localhost alias no longer bypasses it. Existing remote E2E support is retained in the shared guard, but this persistence suite and worker fixture reject remote targets.
4. Added an independent Prisma-client factory and a test-only courier worker process fixture in `tests/integration/fixtures/courier-worker.ts`. Discovery is scoped to this run's fictional connection; actual worker leases/transactions/writes use real Prisma. Fake provider methods return locally generated identities and make no HTTP requests. The executable fixture rejects non-fictional connection/provider records and requires the suite's IPC launch.
5. The two-process case waits for both initialized workers at an IPC barrier before releasing them together. It verifies exactly one fake provider call across both processes and uses a fresh client to inspect persisted operation, consignment and claim facts. Startup/work timeouts terminate child processes. A separate in-flight cancellation test blocks fake provider completion while cancellation runs through the real service.
6. Added `tests/integration/tsconfig.json` for a separate, no-execution type check. No production dependency or application behavior changed in this step.

### Prepared real database scenario map

| Scenario | Expected persisted evidence |
| --- | --- |
| Normalized customer email contention | One success, one rejection, one row |
| Explicit transaction failure | Customer write rolled back |
| Last-unit checkouts | One winning reservation; on-hand/reserved remain coherent |
| Duplicate checkout key | One order and same returned order identity |
| Last discount redemption | One redemption; usage counter one |
| Failing checkout | No customer/order/reservation side effects |
| Claim writes through independent clients | One claim; losing unique constraint is P2002 |
| Concurrent physical restock | One successful restock, one rejected replay, stock increases once, durable recovery stamp |
| Duplicate deposit and competing refunds | One receipt; one refund wins, other cannot exceed received money; exact minor-unit balances, no refund-induced new COD or stock mutation |
| Batch expiry/FEFO | Expired/unsafe stock excluded; earliest eligible batch reserved; expiring it rejects commitment without changing reservation, inventory or order status |
| Cancellation before worker | Operation stopped; no fake provider call; claim released and safe stock recovered |
| Cancellation during provider call | Cancellation keeps committed custody and claim; original response identity persists; no second create |
| Crashed expired operation/connection lease | Recovery precedes create, found identity persists, attempt increments, dead token cannot complete |
| Last food-slot unit | One booking; capacity one; repeated pre-preparation cancellation releases capacity once |
| Serial/IMEI duplicate writes | Database rejects duplicate identifiers across independent clients |
| Separate worker processes | Simultaneous launch barrier, one create, completed operation and original claim visible after client restart |

The slot/unit tests deliberately exercise real capacity helpers and database uniqueness rather than claiming the full browser/catalog/warranty workflow. They do not prove warranty UI, actual merchant callbacks, PostgreSQL crash restoration, network partition safety, live provider idempotency, or all niche lifecycle races. The crash case simulates expired durable leases, not killing PostgreSQL. Provider behavior is a fictional adapter, not Steadfast compatibility certification. Those limitations remain explicit later acceptance gates.

### Safe checks run by the agent

- `bun test tests/setup/assert-test-environment.test.ts`: **10 passed, 0 failed, 10 assertions**; no database import or access.
- `bunx tsc --project tests/integration/tsconfig.json --noEmit`: passed; includes real suite and child fixture without executing either.
- Formatting of changed test files and `git diff --check`: passed.
- The 16 persistence scenarios have **not run**. No runtime passing count, query evidence or real concurrency acceptance is claimed. The development migration previously applied does not satisfy the isolated target prerequisite.

### Exact user preparation and execution sequence

1. From the repository root, record `git rev-parse HEAD` and `git diff --stat`. The base revision for these prepared changes is `e7db4d2`; these Step 10 files are uncommitted. Save these identifiers with the eventual report. Do not assume an older integration result covers this diff.
2. Prepare a disposable, dedicated **local PostgreSQL database** whose name begins `e2e_` or ends `_e2e`, and separate test Redis with prefix `ts-starter:e2e:`. Use a test-only DB role with no rights on development/production databases. Run only one suite against this target at a time; it temporarily updates the singleton store settings and restores them. Do not run an app or background worker on this test database during the suite.
3. Copy `tests/env/e2e.env.example` to ignored `tests/env/.env` and configure the dedicated target locally. Keep `E2E_MODE=true`, `NODE_ENV=test`; explicitly set `REDIS_KEY_PREFIX=ts-starter:e2e:`. Set `DATABASE_URL_DEVELOPMENT`/`DATABASE_URL_PRODUCTION` locally if available so identity exclusion also applies. Never paste credentials into the report. The local development DB named `ecommerce` is intentionally rejected by this suite.
4. Validate the environment before any provisioning command: `bun --env-file=tests/env/.env tests/setup/assert-test-environment.ts`. Expected output exposes only target host/path and prefix, no credentials. Stop on any guard failure. Check the target identity manually before the following migration; Prisma's migration command itself does not run this test guard.
5. **User-only explicit schema preparation, separate from the test command:** from the repository root, run `bun --env-file=tests/env/.env tests/setup/migrate-test-database.ts`, then from `packages/db` run `bun run db:generate`. The named migration runner validates local test-only targets before launching Prisma with an explicitly inherited environment; do not use `bun --env-file … x prisma`, which lost the env-file values during the actual run. Inspect that Prisma names the dedicated test DB, not `ecommerce`. No reset is required or embedded. Do not create/alter migration SQL or run a demo seed for this suite; it creates its own fictional data. RBAC seeding is unnecessary for these direct service tests; Step 11 permission/browser preparation is separate.
6. Return to the repository root. Optional safe type check: `bunx tsc --project tests/integration/tsconfig.json --noEmit`. Then **user-run DB-backed command:** `bun --env-file=tests/env/.env test --timeout 60000 tests/integration/ecommerce.real-db.test.ts`. The command performs fictional fixture inserts/updates and scoped cleanup, but embeds no migrations, resets, seeds, server startup or real courier request. Do not combine this file with mocked unit suites; Bun module mocks are global.
7. Expect 16 database scenarios to pass and cleanup to finish. If a test, child fixture or cleanup fails, retain sanitized test name/error class/code, test target classification, date, revision/diff identifier and counts. Treat unexpected rejection causes, rollback/cleanup failures or leftover fictional records as failures; do not rerun blindly, weaken an assertion, reset the target, or mark the step complete.
8. Share sanitized results. Until those results arrive, keep Step 10 awaiting verification. Manual application timeline/balance inspection requested by the numbered step remains pending; Step 11 later supplies browser workflow evidence. The agent may fix narrow test or production issues found by actual evidence within authorized scope, but must not infer new DB execution or reset authority.

### What is next and how many steps remain

**Immediate next action: user executes the isolated Step 10 prerequisites and prepared suite, then supplies sanitized results.** If the user wants the agent to provision/run it, explicitly authorize the isolated target and DB-backed execution; the default Step 10 boundary still applies. After actual passing persistence evidence and manual inspection are recorded, next numbered step is Step 11. **Six implementation steps remain after this preparation (11–16); 15 numbered acceptance gates remain unfinished (2–16), including Step 9 coverage and Step 10 real execution.** No commit was made for Step 10; the prior commit request was already fulfilled by `e7db4d2`.

## 20. Step 10/16 — Authorized isolated database execution and findings (2026-10-03)

User explicitly requested: “first commit then Set up the isolated local test environment and run Step 10.” This authorizes the separate test services, disposable database provisioning/migrations and DB-backed suite execution. It does not authorize resetting development data, live courier operations, browser/app startup or security scans.

### What changed and concrete evidence

1. Committed the prepared Step 10 tests/guide first as **`10e0c29`** (`test(ecommerce): prepare isolated V3 persistence and concurrency checks`). The development implementation/migration base remains `e7db4d2`.
2. Started the repository's test-only PostgreSQL 17 and Redis 7 compose services on 5433/6380. Created the dedicated database **`e2e_v3_step10_20261003_03043274`** and a separate ignored `tests/artifacts/step10/runtime.env`, mode 0600. Preserved the existing `tests/env/.env` and all application environment files. Redis prefix is `ts-starter:e2e:step10:e2e_v3_step10_20261003_03043274:`; no real credentials or customer data appear in this guide.
3. The first proposed `bun --env-file … x prisma migrate deploy` command lost the supplied environment in the Prisma child process. It reported the local development database `ecommerce` with **no pending migrations**; no schema changes/reset occurred there. The guarded suite itself selected the proper isolated target and failed on missing tables. Corrected setup by launching the installed Prisma Node entrypoint with the explicitly validated/inherited process environment; all **36 existing migrations** then applied to the dedicated test database. Added `tests/setup/migrate-test-database.ts` so future execution validates targets and preserves the environment automatically. Verified a subsequent guarded deploy named the isolated DB and reported no pending migrations. No migration SQL was changed and no seed was required.
4. The initial substantive persistence run exposed a fixture bug: unbatched stock keys used `:none`, whereas production stock actions use `:no_batch`. Corrected the fixture keys; production stock-key behavior was retained.
5. Real worker persistence then exposed a **production JSONB comparison bug**. `assertReviewedCourierRequest` compared `JSON.stringify` output, but PostgreSQL JSONB does not preserve insertion order. Therefore unchanged persisted snapshots were falsely held as `payment_or_address_review_changed`. Changed only this comparison to require the exact scalar field set and values while ignoring key order. Money fingerprint, COD amount, invoice, recipient fields and currency remain in the reviewed contract. Added regression tests proving reordered keys pass, changed monetary/address values fail, and missing/extra fields fail. Invoice is deliberately frozen from the reviewed snapshot; the helper supports explicit reviewed invoice selection.
6. Final real command, from the repository root: `bun --env-file=tests/artifacts/step10/runtime.env test --timeout 60000 tests/integration/ecommerce.real-db.test.ts`. **16 passed, 0 failed, 69 assertions**. This includes independent clients, actual unique constraints/Serializable conflicts, the two-process IPC start barrier, in-flight cancellation, expired crash lease recovery, exactly-once stock recovery, duplicate deposit/competing refunds, FEFO/expiry rejection, food capacity and serial/IMEI uniqueness.
7. Safe affected checks after the fix: **126 tests, 320 assertions** across seven isolated courier/order suites; **13 tests, 13 assertions** for shared target guards and the migration runner. Integration TypeScript check and server TypeScript check pass. `git diff --check` passes. No web/UI code changed in this follow-up.
8. Queried only the authorized isolated database after cleanup. Orders, users, products, stock, reservations, courier connections, payments, recoveries, food slots and store settings all had **zero rows**. No unexplained fixture cleanup failure remains. No app/background worker ran against the development database and no actual provider request was sent.

### Artifacts, services and remaining limits

- Ignored local evidence: `tests/artifacts/step10/migrations.txt`, `migration-verified.txt`, `run-1.txt` through `run-5.txt`, `cleanup.txt`, `summary.json`, affected unit logs, `guard-tests.txt`, `types.txt`, `server-types.txt`. Earlier failing runs are retained; final passing evidence is `run-5.txt`. Do not publish `runtime.env`.
- These results describe commit `10e0c29` plus the current uncommitted comparison/fixture/runner diff. They do not describe an older revision or an unmodified committed tree. No second commit was made after the requested first commit.
- Isolated compose services remain running for the requested test environment; development services were not started/restarted. The dedicated database remains migrated and empty after fixture cleanup. Do not remove Docker volumes or reset databases as an inferred cleanup action.
- Database acceptance is satisfied for the prepared scenarios. Manual fictional order timeline/balance inspection through the running app has not been performed and remains pending with Step 11 browser acceptance. Real merchant callbacks, warranty UI/ownership browsing, live courier acceptance, crash durability of PostgreSQL itself and the existing coverage gates remain unverified. Passing Step 10 does not imply all previous acceptance gates or release/tutorial readiness are complete.

### How to test after running the app, what is next, and steps left

1. Repeat the isolated suite only while no application/background worker is using its target. Validate the environment with the guard, run the explicit guarded migration runner if needed, and use the exact recorded suite command; migration and test commands remain separate.
2. For app verification, authorize Step 11, prepare its fictional browser personas/fixtures and run the recorded lifecycle/RBAC checklists. Inspect the order timeline, receipt/refund balances, operation/claim and recovery facts rather than relying on success toasts. The suite cleaned its own records, so do not assume its fictional orders remain available in the UI.
3. The JSONB fix and execution evidence are currently uncommitted; review the diff before any requested commit. The prepared test commit already exists as `10e0c29`.

**Next: Step 11, browser workflows and RBAC, after authorization. Six implementation steps remain (11–16). Fifteen numbered acceptance gates remain unfinished (2–16), because manual/browser acceptance and earlier coverage/review gates are still open; Step 10's real database subgate has passed.** No active security test or automated tutorial generation should be inferred from this authorization.


## 21. Step 11/16 — Browser workflows and RBAC (2026-10-03)

**Status: automated scenarios verified; awaiting user review.** User requested “ok make commit and do step 11.” The existing isolated local test environment authorization carries forward for this named browser step, including fictional account/RBAC provisioning, app startup and DB-backed browser assertions. No development database reset, live courier action, active security scan, load test, tutorial recording or Step 12 execution is authorized by this work.

### What changed

1. Committed the previous Step 10 snapshot comparison fix and execution evidence first as **`da3da63`** (`fix(ecommerce): compare persisted courier snapshots without JSON key ordering`). All Step 11 changes remain uncommitted; this request does not authorize another commit after the step.
2. Moved the existing `/track-order` and `/saved` routes under the existing pathless `_public` layout. Their public URLs stay unchanged; the shared public loader/provider now supplies its header/footer. Actual browser checkout exposed `usePublicData must be used inside PublicDataProvider` on this page. The saved-products route had the same layout omission. Keep the generated route tree consistent with these moves; do not introduce a second provider or swallow the error. WebKit then exposed a catalog hydration mismatch: a module-global React Query client reused earlier requests' catalog data during SSR. `TanstackQueryProvider` now creates its stable client with component state, so server requests do not share that cache. This finding is fixed rather than filtering the hydration error out of the browser assertions.
3. Added accessible labels to the pickup form's address IDs, address, contact, parcel quantity and note fields. No courier URL policy or production permission was weakened.
4. Reused the existing five fictional test personas, provisioner and auth storage. The ecommerce manager's explicit test role now includes the five delivery permissions required by its launch duties; production role defaults are unchanged. Auth setup derives expectations from the provisioner's exported lists and waits for page hydration before filling inputs.
5. Added `playwright.step11.config.ts`, isolated V3 browser fixtures and lifecycle/niche/RBAC tests. Tests run serially because store settings and defaults are shared within this single-shop test database. The config explicitly excludes legacy V2 lifecycle tests that assume direct paid/status edits and manual shipping can bypass the V3 ledger/courier rules. This exclusion is not evidence that those historical scenarios pass; the V3 replacements exercise the supported contract.
6. Added a guarded local HTTP response fixture on `127.0.0.1:3903` for fictional health/balance, pickup and provider-return requests. It requires the public fictional headers and never forwards requests. Actual create operations use the production dispatch worker with the existing scoped fake adapter and real PostgreSQL writes. Actual tracking uses signed raw-body HTTP callbacks with Bearer plus HMAC. This is **not** the complete simulator specified in `docs/steadfast-courier-simulation-plan.md` and is not merchant acceptance.
7. Browser assertions check persisted inventory, shipment claims, operation outcomes, payment/refund totals, recovery evidence, food bookings and warranty state. The final direct API matrix includes 29 custody/money/niche mutation routes for each of read-only, ordinary and anonymous identities (87 expected permission denials), including queue/handoff, receipt reversal, unit release, claim resolution and food-slot changes. Browser selectors distinguish order numbers from provider invoices. Existing admin route/navigation/archive tests now wait for hydration. Responsive tests include shop/cart/checkout/tracking and detect page errors; an additional Chromium/Firefox/WebKit case checks saved/tracking layout and footer at all three viewport sizes; a temporary courier-list failure checks the visible Retry action.

### Environment and safe rerun instructions

Read first: this section, `playwright.step11.config.ts`, `tests/e2e/fixtures/v3.ts`, `tests/e2e/fixtures/courier-http.ts`, `tests/e2e/setup/auth.setup.ts`, `tests/setup/assert-test-environment.ts` and the four `v3-*.spec.ts` files. Do not invoke the old root build/start or reset wrappers blindly.

1. Use only the dedicated Step 10 target `e2e_v3_step10_20261003_03043274`, PostgreSQL at loopback port 5433 and Redis at loopback port 6380 with its dedicated prefix. Schema was already applied in Step 10. Do not migrate/reset development data or reapply migrations merely to repeat browser tests.
2. The ignored mode-0600 runtime file is `tests/artifacts/step11/runtime.env`. Keep it private and inspect targets locally without printing credentials. Its database and Redis values select the above target. Required browser values include `E2E_MODE=true`, `NODE_ENV=test`, `BETTER_AUTH_URL=http://localhost:3000`, `CORS_ORIGIN=http://localhost:3001`, `VITE_SERVER_URL=http://localhost:3000`, and the disabled Polar/owner-setup switches. Courier base URL must be exactly `http://localhost:3903`, with fictional Step 11 headers/token. `localhost` satisfies the existing plain-HTTP development URL policy; do not replace it with a live courier URL. Fixtures reject remote targets before DB import.
3. Start the narrow local response fixture with `bun --env-file=tests/artifacts/step11/runtime.env tests/e2e/fixtures/courier-http.ts`. Start the isolated API directly with `bun --env-file=tests/artifacts/step11/runtime.env apps/server/src/index.ts`. E2E mode disables automatic dispatch/tracking workers; the tests invoke scoped fictional workers themselves. It also disables request rate limiting and email-verification delivery, so these passes do not verify production rate limits, verification emails or authentication-abuse defenses. Existing development services are not stopped.
4. Build the frontend with explicit environment inheritance, then serve its production preview. The exact build command used was:

   ```sh
   bun --env-file=tests/artifacts/step11/runtime.env -e 'const p=Bun.spawn(["node",process.cwd()+"/apps/web/node_modules/vite/bin/vite.js","build"],{cwd:process.cwd()+"/apps/web",env:{...process.env},stdout:"inherit",stderr:"inherit"});process.exit(await p.exited);'
   ```

   For preview, use the same command with `"preview"` in place of `"build"`. Verify frontend port 3001 and API port 3000. Rebuild/restart this isolated preview after a frontend change; do not test stale production assets. The first development-server attempt lost filled signup fields during HMR; the production preview avoids that fixture instability. `bun --env-file … x` and repository wrappers can lose or replace the intended environment, so do not substitute them without inspecting inherited targets.
5. On a newly authorized empty isolated target, seed only required RBAC using the guarded target environment, then run the auth setup. This run seeded RBAC once and passed both signup/login setup tests for all five identities. Existing `.auth` state files and all runtime logs/reports are ignored. No reset or demo seed is included. On this prepared target, reuse the state with `--no-deps`; a fresh target requires setup and explicit environment authorization first.
6. The single-command rerun below covers all 83 configured browser cases. The recorded final execution split it into a serial 21-case Chromium/Firefox/WebKit lifecycle run and a 62-case layout/persona run with two workers (read-only and expected-denial actions). Both used the same rebuilt assets and isolated API; only the lifecycle run changed domain data. The lifecycle/layout blob reports and targeted refund/RBAC rerun blobs are merged into the final report. The 29-route permission expansion also passed its own focused rerun after the lifecycle runner had collected the earlier 18-route version. Do not count these repeated checks as additional unique matrix cases. Run the complete selected browser matrix with:

   ```sh
   bun --env-file=tests/artifacts/step11/runtime.env ./node_modules/.bin/playwright test --config playwright.step11.config.ts --no-deps --project=chromium --project=firefox --project=webkit --project=mobile --project=tablet --project=desktop-responsive --project=persona-owner --project=persona-admin --project=persona-commerceManager --project=persona-commerceViewer --project=persona-user
   ```

7. Run the focused TypeScript check with `bun ./node_modules/typescript/bin/tsc --project tests/e2e/tsconfig.step11.json --noEmit`; run the web boundary checker from `apps/web`. Do not represent this focused test typecheck as a clean whole-repository typecheck. Review `git diff --check` and the actual diff. No schema changes or Prisma generation are required by Step 11.
8. Keep the fictional records in the isolated target for review. Tests use unique fixture markers and scoped workers so reruns do not require a blanket cleanup/reset. Close only processes started for this isolated run when finished; this step does not authorize deleting shared services/data.

### Required review matrix and results

The final matrix executed **83 unique configured cases**: 62 layout/persona cases passed and the 21-case lifecycle/browser run had 20 passes plus one WebKit refund-entry failure. That failed case had empty fields after synthetic filling and a correctly disabled submit button. The test now waits for the dialog's amount autofocus, enters the amount/reason with normal keyboard events and asserts both values before submitting. Its updated sequence passed targeted reruns in WebKit, Chromium and Firefox. No production refund rule was bypassed and no forced click or API substitution completed the refund. Retain this failed attempt in the merged history and identify the targeted final result explicitly; do not present the original matrix as a clean 83-pass run.

| Project / scenario | Unique cases | Viewport / scope | Latest result |
| --- | --- | --- | --- |
| Chromium | 11 | Desktop 1280×720; admin navigation/archive/retry, three lifecycle cases, gadget, food, public layout, RBAC | Covered scenarios passed; updated refund entry also passed targeted rerun |
| Firefox | 5 | Desktop 1280×720; critical shell, three lifecycle cases, public layout | Covered scenarios passed; updated refund entry also passed targeted rerun |
| WebKit | 5 | Desktop 1280×720; same critical/lifecycle/public scope | Four passed in matrix; corrected refund-entry case passed targeted rerun |
| Mobile | 19 | WebKit/iPhone 13, 390×664; 4 public and 15 admin routes | 19 passed |
| Tablet | 19 | WebKit/iPad gen 7, 810×1080; same 19 routes | 19 passed |
| Desktop responsive | 19 | Chromium, 1440×900; same 19 routes | 19 passed |
| Five personas | 5 | Owner, restricted admin, commerce manager, commerce viewer, ordinary user | 5 passed |

The additional public-layout case checks saved/tracking pages at 390×664, 810×1080 and 1440×900 in each desktop browser engine. This is layout/runtime coverage; mobile/tablet did not execute the complete transactional lifecycle. Auth setup separately passed **2 tests** creating/verifying/login-testing all five fictional accounts. The expanded 29-route RBAC check separately passed with 87 denied API attempts; the main lifecycle run had collected its earlier 18-route version before that expansion.

Static evidence: frontend production build passed; focused Step 11 TypeScript check passed; web client boundary check passed; `git diff --check` passed. There was no schema edit, Prisma generation, production deployment, active security scan, live courier action or tutorial recording in Step 11.

Authoritative final artifacts are under the ignored `tests/artifacts/step11/` directory: `final-core.txt`, `final-layout-personas.txt`, `refund-final.txt`, `refund-other-final.txt`, `rbac-final.txt`, `build.txt`, `typecheck.txt`, merged `results.json`, `latest-verification.json` and `report/index.html`. The early `final-browser.txt` run was interrupted after discovering SSR cache leakage; it is failure history, not final acceptance. The merged report contains **87 entries: 86 passing entries and one retained historical failure**. Its original failure is not an unresolved production finding: the updated test passed the targeted reruns described above. `latest-verification.json` groups entries by file/title/project and records **83 unique scenarios, all with a passing latest result**. No full 83-case rerun occurred after the test-only refund-entry correction; the affected case was rerun in all three engines. Do not relabel the main matrix as an uninterrupted clean pass or erase the historical attempt.


Report reproduction: the recorded lifecycle command selected `--project=chromium --project=firefox --project=webkit`; the layout/persona command selected the remaining eight projects with `--workers=2`. Both used the same guarded env-file and `--no-deps --reporter=list,blob`, with separate `--output` directories and `PLAYWRIGHT_BLOB_OUTPUT_FILE` targets. The focused refund reruns used `test v3-lifecycle --grep 'cancellation and return'`; the expanded permission rerun used `test v3-rbac --project=chromium`. All had `retries: 0`; these were explicit fixes and reruns, not a retry loop hiding failures. Copy the five final blob files from `core-blob`, `blob-report`, `refund-blob`, `refund-other-blob` and `rbac-blob` into `merged-blob`, then merge without starting services or touching DB data:

```sh
PLAYWRIGHT_HTML_OUTPUT_DIR=tests/artifacts/step11/report PLAYWRIGHT_HTML_OPEN=never PLAYWRIGHT_JSON_OUTPUT_FILE=tests/artifacts/step11/results.json bun ./node_modules/.bin/playwright merge-reports --reporter=html,json tests/artifacts/step11/merged-blob
```

The isolated frontend/API/courier fixture and PostgreSQL/Redis containers remain running for user review at ports 3001/3000/3903/5433/6380. Account definitions are in `tests/users-config.ts`; do not publish auth state or the ignored runtime file. All schema/RBAC changes for this target were already applied; Step 11 creates no new migration prerequisite.

### How to test after running the isolated app

1. As the fictional ordinary customer, browse the fixture product, add one item to cart and check out. As owner, confirm the order, record a BDT 30 deposit, review the route and queue it. The fictional worker books BDT 80 COD against a BDT 110 total. Request pickup, explicitly hand over, apply the signed delivered callback, record the BDT 80 payout and complete the order. Verify two payment records, no active claim and an audited history. Customer tracking must load and omit private notes.
2. Before provider submission, cancel a queued order and verify stock/claim release. After handoff, record/submit a return to the local fixture and complete the courier return; verify stock remains committed. Cancel the failed delivery, record every item physically received, inspect all items sellable, explicitly restock and refund the deposit. Verify one restock record, original on-hand quantity restored and zero reserved units. A refund or courier-return status alone must not restore stock.
3. Repeat route confirmation and expect conflict with one shipment claim. Change payment after queue and expect cancellation before submission plus claim release. Attempt confirmation against the deliberately expired fictional batch and expect a visible rejection without commitment; its storefront Add to cart button must be disabled.
4. Register a gadget serial and IMEI against received stock without increasing quantity, assign it to the customer order, deliver via the signed fixture, request warranty review as its purchaser and approve with owner evidence. For fresh food, reject warranty configuration, start preparation, reject parcel routing and cancel; the prepared booking capacity/committed stock remain retained and generic restocking is disabled.
5. Verify the owner, restricted admin, commerce manager, commerce viewer and ordinary-user sessions match their roles. Test read-only/user/anonymous direct calls to the sensitive custody/money endpoints and require 401/403. Inspect connection response redaction. Temporarily fail courier-list loading, restore it and use Retry. Check keyboard focus in the payment dialog and disabled confirmation before required evidence is entered.
6. Review mobile/tablet/desktop pages for overflow and runtime errors, then Chromium/Firefox/WebKit lifecycle results. The report is automated evidence; final human review is still required. Do not use real customer data or live merchant credentials for these checks.

### Open gates and next step

- Earlier Step 9 coverage/review gates remain open. Passing this selected browser matrix does not close every historical acceptance checklist, establish production capacity, or prove live courier compatibility.
- Security verification, production operations/load evidence, controlled live merchant acceptance, tutorials and independent review remain Steps 12–16.
- **Next: Step 12 — security verification and remediation, after user authorization/review. Five numbered implementation steps remain (12–16).** Acceptance gates still require their recorded review; do not turn this implementation count into a claim that only five acceptance gates remain. No Step 12 scan or Step 15 recording has been started.
- **Git: previous work committed as `da3da63`; Step 11 changes are uncommitted.**


## 22. Step 12/16 — Security remediation and focused verification (2026-10-03)

**Status: code remediation and focused checks verified; acceptance remains OPEN.** User authorized “ok do commits and do step 12.” Step 11 was committed first as `6872adb` (`test(ecommerce): verify V3 browser workflows and isolate SSR query caches`). Step 12 changes remain uncommitted. Existing authorization covers the retained local fictional Postgres/Redis/app environment and focused tests; section 12's separate active-scan target authorization still applies. A concrete anonymous ZAP plan and guarded runner are prepared; the explicit approval question is pending and **no active ZAP scan has run**.

### 22.1 What changed and why

| Finding / boundary | Severity / scope | Remediation and evidence |
| --- | --- | --- |
| Courier credential destinations | High: a user able to configure a connection could direct credential-bearing requests to arbitrary HTTPS/internal destinations. `localhost` also previously permitted non-HTTP schemes. | Generic encrypted credential validation rejects userinfo/query/fragment and unsafe protocols. Steadfast's own adapter allows only the repository's established `https://portal.packzy.com/api/v1` destination; it validates before constructing/sending credential headers. Redirects are disabled. Arbitrary private IPs, lookalike domains, ports and paths are rejected with no fetch calls. |
| Local simulator exception | Configuration boundary | HTTP is allowed only for test/E2E mode. Steadfast additionally restricts the exact origin to the current `localhost:3903` fictional fixture or planned `localhost:9099` simulator, and requires it to match `STEAD_FAST_BASE_URL`. This preserves the separate simulator plan without admitting arbitrary development hosts into production. Generic provider code stays provider-neutral. |
| Concurrent failed/stale webhook retries | Medium: two retries could both reclaim the same previously observed event. | Reclamation uses a conditional `updateMany` matching provider/event ID, status and observed timestamp; only a one-row result owns processing. Regression uses independent database-read snapshots and parallel retries, and asserts one tracking call. |
| Signed webhook replay identity | Medium: the idempotency header is not covered by the body HMAC and could change across identical callbacks. | Deduplication identity is now `sha256:<raw authenticated body hash>` within the existing connection/provider namespace. The required header remains validated and bounded to 200 characters. Changing the header on identical signed bytes returns duplicate and creates only one tracking event. Different connections never acquire another connection's consignment. |
| Malformed webhook identity/timestamp | Input validation | Invalid dates and oversized invoice/consignment identities fail before claiming an event; malformed/unknown payloads, wrong Bearer/HMAC and altered raw bytes fail closed. The existing server-wide one-MiB body limit rejects oversized raw callbacks. Unknown connection returns 404; a valid callback delivered to a different known connection returns a generic processing failure and leaves the original order/events unchanged. |
| E2E mode enabled in production | High-impact deployment misconfiguration: E2E disables verification and request limiters. | Env loading now rejects `E2E_MODE=true` with `NODE_ENV=production` before creating app configuration. A separate-process regression proves fail-fast behavior. |
| Cookie-authenticated custom admin mutations | High: production cookies use SameSite=None, and CORS did not reject authenticated cross-origin form requests before custom route execution. | A real fictional payment form POST returned 200 before remediation. The new request-origin plugin rejects foreign/null origins (and cross-site Fetch Metadata without Origin) on cookie-bearing mutations before nested controllers run. Trusted storefront/API origins and server-to-server callbacks remain supported. The final regression checks 403 plus unchanged payment count/full order row. |
| Origin/CSRF security under test | Test evidence gap, not a demonstrated production bypass | Better Auth defaults origin checks off under `NODE_ENV=test`; the initial hostile-origin sign-out consequently revoked the fictional owner session. Both origin and CSRF checks are now explicitly enabled in auth options. Fictional sessions were restored using existing setup. The final hostile-origin sign-out returns 403 and preserves the owner session; forged cookies cannot authenticate. |
| New package advisories | High Elysia/Nodemailer; critical Next preview tooling | Targeted versions: Elysia 1.4.30, Nodemailer 10.0.13, Next 16.3.6 override for React Email UI's exact pin. Installation hooks were skipped. See `tests/security/dependency-audit.md` for primary advisory links, final audit counts and the pending residual disposition. |
| Anonymous test identity | Evidence integrity | Explicit empty storage state prevents owner cookies being inherited by anonymous security requests. A guarded Step 12 config and focused TS config keep repeat runs reproducible. |

No schema/generation/migration/seed command was needed for these changes. Fictional account/RBAC refresh and fixture database operations occurred only in the already-authorized isolated environment. No development database, production target, SMTP recipient, live courier or tutorial flow was used.

### 22.2 Verification actually performed

Retained target: PostgreSQL 17 on `127.0.0.1:5433`, database `e2e_v3_step10_20261003_03043274`; Redis on `127.0.0.1:6380` with the Step 10 E2E-only prefix. API `localhost:3000`, production frontend preview `localhost:3001`, fictional courier HTTP fixture `localhost:3903`. Runtime env/auth states remain ignored and must never be printed or committed.

| Check | Result | Ignored local evidence |
| --- | --- | --- |
| Credential encryption/resolution, provider adapter security/webhooks, production E2E guard | 28 tests passed | `tests/artifacts/step12/courier-tests.txt` |
| Webhook authentication/deduplication and parallel failed-event retry | 3 tests passed | `webhook-tests.txt` |
| Auth guard/session headers and API security headers | 6 tests passed | `auth-tests.txt` |
| Rate limiter/config unit tests | 10 tests passed | `limits-tests.txt` |
| Cookie mutation-origin guard, including nested controllers and preflight | 3 tests passed | `origin-tests.txt` |
| Elysia request routing with mocked limiter/Redis | 1 test passed | `rate-limit-tests.txt` |
| Auth configuration after explicit origin/CSRF policy | 2 tests passed | `auth-config-tests.txt` |
| Application reset-email rendering and Nodemailer stream/MIME composition | 1 test passed; no SMTP connection | `email-tests.txt` |
| Email preview after Next patch | React Email preview started on local port 3904; HTTP 200; stopped after smoke check | `email-preview.txt`, `email-preview-response.html` |
| HTTP/browser security/RBAC/ownership/webhooks | 8 Chromium scenarios passed, including 87 denied mutation requests across three identities | `browser.txt`, `results.json`, `test-results/` |
| Fictional persona session restoration | 1 setup scenario passed for all five personas | `auth-setup.txt` |
| Server TypeScript and focused Step 12 TypeScript | Passed | `server-types.txt`, `typecheck.txt` |
| API production build | Passed after final auth/config changes | `server-build.txt` |
| High-confidence source secret scan | Passed; matched values are not printed | `secrets.txt` |
| Dependency audit | 33 advisories: 12 high, zero critical; still exits nonzero | `dependency-audit-final.json` |
| Scanner approval guard | Refuses before Docker execution when approval flag absent | `zap-guard.txt` |
| Active ZAP scan | NOT RUN; explicit target approval pending | No scan report exists |

The first session-abuse run uncovered Better Auth's test default and invalidated only the fictional owner session; subsequent persona failures were dependent on that session loss. After enabling origin checks and restoring sessions, the final full eight-case run passed. A separate test assertion initially required 401 for a forged-cookie admin request; this API correctly returns 403, and the regression now accepts either denial while requiring a null auth session. Do not present failed intermediate attempts as final unresolved product failures or conceal the initial evidence gap.

The hostile-origin form reproduction is retained in `tests/artifacts/step12/csrf-before.txt`: it created only fictional payment evidence before remediation. The final full run requires denial and unchanged financial data. One intermediate first request raced API startup; subsequent runs used the already-ready retained services. The final HTTP cases assert customer ownership even when another account supplies matching contact details; rejected reads do not disclose the email or mutate the order. Webhook tests cover malformed signed JSON, unknown type, body alteration, incorrect Bearer/signature, unknown/other connection, body-size rejection, and identical-body replay with a changed header. Tracking-update callbacks leave the full order row unchanged and produce exactly one courier event.

### 22.3 Limits and mandatory unfinished acceptance work

1. **Run the prepared anonymous active scan only after explicit approval** of `tests/security/step12-zap-plan.yaml` against the recorded local target. The runner and plan have not yet been executed/validated inside ZAP. Inspect reports, reproduce findings, fix narrowly and rerun affected tests. Record container digest, exact scope and dispositions. Auth/admin/checkout/payment/courier-action routes are deliberately outside this anonymous scan; passing it will not establish full authenticated coverage.
2. **Obtain explicit user disposition or remediate remaining high development-tool advisories.** The earlier audit snapshot's “accepted” language is superseded. Current source/lockfile tracing points to Prisma/scaffolding/React Email/jsdom/build tools, but does not replace deployed artifact-closure inspection. Do not quietly mark them accepted or report a clean dependency tree.
3. **Production rate-limit acceptance remains open.** E2E mode bypasses both app and Better Auth runtime limiters. The mocked tests cover fixed windows, thresholds, cache invalidation and Redis-unavailable failure behavior; they do not prove production Redis TTL/auth limiter behavior or proxy/IP attribution. Validate these on an explicitly approved production-like local/staging configuration in Step 13 before release.
4. **Earlier correctness/coverage/human-review gates still apply.** This bounded security work is not an exhaustive independent penetration test. Follow recorded Step 10/11 evidence and outstanding Step 8/9 acceptance requirements, including operator review.
5. **Merchant callback contract remains separate.** These callbacks use the application's Bearer/HMAC test contract; no real Steadfast endpoint was called and official merchant webhook support was not newly verified. Confirm the actual merchant setup before launch. Provider URL policy follows the existing repository contract; it intentionally rejects alternate hosts/redirects until explicitly reviewed.
6. **Replay identity upgrade:** previously persisted header-based webhook IDs are not automatically backfilled into body hashes. This is intended for the pre-launch workflow. If an existing deployed installation has old event rows, review its upgrade/replay history before rollout; do not perform an unapproved database backfill.
7. Step 12 code is **uncommitted**. Do not stage/commit it until the user asks again. Do not start Step 13, load tests, restore exercises or tutorial generation automatically.

### 22.4 How to test after running the app

1. Use only the recorded ignored local runtime env, existing fictional identities and dedicated DB/Redis. Re-run the test-environment guard before any fixture/setup command; never use root `build`/`start` wrappers that inject `tests/env/.env` implicitly. No new migration is required.
2. API: `bun --env-file=tests/artifacts/step11/runtime.env apps/server/src/index.ts`. Start the existing built frontend preview with explicitly inherited local env and the fictional `tests/e2e/fixtures/courier-http.ts` helper as recorded in section 21. API root `/` returns OK; do not substitute the nonexistent `/health` route.
3. Run `bun --env-file=tests/artifacts/step11/runtime.env ./node_modules/.bin/playwright test --config=playwright.step12.config.ts --no-deps`. Expected result is eight passed scenarios. Inspect `tests/artifacts/step12/results.json` and terminal output, not only a process exit. If persona sessions are stale, use the existing guarded setup on this same fictional target; never reuse real accounts.
4. Manually verify ordinary/read-only accounts cannot record/reverse payments, alter custody, create returns or modify inventory; owner connection responses never reveal credential values/ciphertext. Another customer's order number plus matching email/phone must still fail lookup.
5. Confirm an invalid callback returns a stable generic denial and changes no order/money/history. Identical signed raw bytes with a different idempotency header must return duplicate. Use fixture helpers/automated scenarios; do not copy real credentials into curl commands or docs.
6. Review `tests/security/dependency-audit.md`; review the active plan and pending approval question. Only after target approval, follow the scanner command in `tests/security/README.md`, inspect its output and record actual findings here.

**Next:** finish Step 12's active-scan/risk-disposition/review gates. The next numbered implementation phase is **Step 13 — runtime, capacity and operations**, after authorization. **Four subsequent numbered steps remain (13–16); Step 12 acceptance and earlier acceptance gates are still open.** Security scan success alone does not authorize automated tutorial recording.


## 23. Step 13/16 — Production runtime and operational preparation (2026-10-03)

### Authorization and scope

The user requested committing Step 12 and then doing Step 13. Step 12 is committed as **`932f5b5`** (`fix(ecommerce): harden courier and cookie mutation security for V3 step 12`). The user authorized Step 13 commits on 2026-10-03. Runtime changes are committed as `1b7da9f`; capacity preparation and this handoff are committed together separately. Independent deployments per shop remain the architecture; no schema changes or DB CLI migration/generation/seed/reset commands were needed or run.

Local runtime/database evidence used the already authorized fictional database **`e2e_v3_step10_20261003_03043274`**, PostgreSQL on `127.0.0.1:5433`, Redis on `127.0.0.1:6380`. Production-mode checks owned separate API/web ports **3013/3014**, used fictional credentials, set `E2E_MODE=false`, and paused courier workers with `COURIER_WORKERS_ENABLED=false`. No live courier, mail, payment-provider or production/staging actions were performed. The smoke test temporarily changed fictional public rate-limit settings and restored them during cleanup; it did not operate on a merchant DB.

### What changed

1. Fixed the compiled API build by removing `--bytecode`; the installed Bun bytecode build rejected valid top-level await. The normal compiled executable now builds and starts.
2. Replaced the web production `start` path with a Bun HTTP entry serving built client assets and the actual TanStack SSR handler, including native Response normalization. Static serving handles HEAD, MIME/cache headers, root SSR fallback and encoded traversal rejection. Build output still needs matching runtime dependencies; it is not a standalone pruned deployment image. Root wrappers inject test environment, so production deployments must use the inspected app scripts and explicit shop environment.
3. Added a shared non-overlapping background worker lifecycle. Dispatch/tracking stop before claiming the next item, drain current work, and cancel delayed starts; visitor flushing also drains active work. API shutdown drains HTTP/workers, closes Prisma/Redis and has a 30-second hard deadline. Added `/health/live` as process liveness only and explicit HOST binding. Database/Redis readiness must be checked separately.
4. Added a courier-worker pause switch, default enabled, for controlled recovery/restore and isolated runtime checks. Moving the shadcn scaffold CLI to development dependencies changes only its workspace lockfile declaration; resolved package versions were preserved.
5. Added guarded production smoke, client secret-canary and Redis namespace checks; focused worker/static-server tests; prepared k6 workload profiles, a separate-capacity-DB runner and a read-only pre/post-load invariant checker. **Capacity preparation is now implemented and checked in section 24; database population and HTTP load have not run.**
6. Added `docs/ecommerce-runtime-operations-v3.md` with per-shop configuration, deployment dependencies, proxy/rate-limit cautions, worker recovery, key rotation, monitoring, backup ownership, restore procedure and capacity execution gates.

### Verified evidence and practical limits

Ignored local evidence is under `tests/artifacts/step13/`; environment files and authenticated artifacts must not be committed or copied into documentation.

| Check | Actual result | Limit |
| --- | --- | --- |
| Compiled API + production SSR smoke | 15 check entries passed, including API startup, public and authenticated SSR, root page, static cache headers, secure/HttpOnly/SameSite cookies, authenticated API read, Redis-backed public limit/window, clean SIGTERM and persisted session after API restart | Local HTTP production mode; no HTTPS browser/proxy acceptance, auth-limit saturation, or live worker restart |
| Real isolated DB persistence/recovery | 16 tests passed, 69 assertions | Fictional correctness fixtures; includes expired leases and two-process fake-worker concurrency, not capacity or Steadfast compatibility |
| Dispatch recovery | 27 tests passed, 61 assertions | Mocked provider failures/deadlines/auth |
| Tracking recovery | 5 tests passed, 13 assertions | Mocked provider polling/leases/auth |
| Visitor handling | 6 tests passed, 25 assertions | Mocked buffering/privacy |
| Credential rotation and trusted proxy IP | 10 tests passed, 21 assertions | Unit evidence; no deployed credential rewrite/rotation |
| New worker/static/capacity tests | 15 tests passed, 56 assertions (section 24) | Focused behavior checks, not full relational load proof |
| Browser bundle secret canaries | 166 client artifacts checked against six configured private values; no matches | Checks configured values only; not a universal secret scanner |
| Redis isolation | Unique local prefixes retained different values/TTL, own keys cleaned up | Shared local test Redis; actual shops still require separate Redis deployments |
| Static verification | Server and focused runtime TypeScript checks, web client boundary check and diff whitespace check passed | Does not certify a complete production deployment or all repository tests |
| Prepared capacity scripts | Full pure dataset dry run, focused tests/types, approval guards, k6 v2.3.0 inspection of five profiles | No database population, HTTP load, throughput/latency/soak result or capacity claim |

### How to test after running the app

1. Read the operations guide first. Use an isolated fictional environment; never point these scripts at a shop DB or reuse production credentials. Retained local smoke scripts intentionally reject any database other than the named correctness target.
2. Re-run the scoped production build/smoke with `bun --env-file=tests/artifacts/step11/runtime.env tests/runtime/step13-production-smoke.ts`. It builds its own artifacts, starts ports 3013/3014, checks public/authenticated SSR and API/Redis behavior, restarts its API, and stops its processes. Inspect `smoke.json`, build logs and clean shutdown logs. It does not replace or restart existing development services on 3000/3001.
3. With the ignored production-local environment generated by that script, run `bun --env-file=tests/artifacts/step13/production-local.env tests/runtime/check-client-secrets.ts`; run the guarded Redis isolation script with the retained test environment. Never print the generated environment or session cookie.
4. Re-run the focused worker/static/capacity tests and runtime TypeScript project. For DB recovery, use the existing explicitly guarded persistence suite against the retained fictional target; review its own fixture cleanup and report. Do not substitute a merchant environment.
5. On separately approved staging, follow the guide in order: explicit environment/build selection, HTTPS browser/auth/SSR, proxy attribution and auth-limit checks, worker restart during fake-provider submission, outage/backlog recovery, observability/alerts, credential rotation and restore into a new isolated target. Record actual evidence; unit tests do not satisfy these staging checks.
6. Full capacity execution needs the prepared generator reviewed, a newly approved separate fictional `e2e_v3_step13_capacity_*` DB, the agreed dataset/distribution, k6 installation/runtime validation and approved expected/peak/soak profiles. The runner must own its API process and reject an existing service, validate dataset counts and fictional addresses, then run pre/post-load checks. Collect hardware/CPU/memory/DB/Redis/backlog evidence and complete missing relational checks before interpreting latency thresholds. Existing correctness fixtures must not be inflated or reset for this purpose.

### Remaining acceptance gates and exact next work

- **Step 13 remains incomplete:** approved database population and actual measured smoke/volume/expected/peak/soak workloads, staging HTTPS/proxy/auth-limit and live worker-restart evidence, deployed monitoring, credential rotation/restore drill, and agreed backup ownership/RPO/RTO remain open. No claim that 10,000 customers/month is supported follows from these smoke tests.
- Point 4 of the Step 13 instructions requires **“user execution or explicit expanded authorization”** for load work. Obtain target, dataset and workload approval before provisioning/populating the new capacity DB or running k6. Backup/restore remains user-controlled.
- Step 12 active scan authorization, development-tool vulnerability risk disposition and final security review remain open. The production public-limiter smoke closes only the narrow local Redis/window question; it does not close all rate-limit or security acceptance.
- The courier simulator plan is still unimplemented. Fake-adapter recovery evidence does not establish Steadfast compatibility; never treat a production merchant booking as an ordinary E2E fixture.
- **Next agent task:** follow the section 24 capacity execution handoff: obtain explicit approval for its exact separate target, fixture population, temporary limiter policy and five workloads; then execute, inspect and record results, and finish user-operated staging/restore gates. Re-check current source and artifact freshness before relying on this handoff.
- **Steps left:** three subsequent numbered steps (**14–16**), plus the remaining Step 13 acceptance work and earlier unresolved gates. Step 14 is controlled live courier acceptance; do not start real actions automatically. Do not make additional commits without a new user request. Automated tutorial generation stays behind final acceptance.


## 24. Step 13 continuation — Capacity preparation completed (2026-10-03)

**What changed:** implemented a pure deterministic dataset builder and separately guarded empty-target/batched writer; extended k6 to smoke and data-volume profiles, catalog/search/detail/facets and ten admin reads; fresh-food checkouts carry slots and every execution has new checkout keys. Added stock movement/reservation, food booking, discount counter and durable row preservation checks. The load runner authenticates its fictional admin, reconciles successful checkouts against new orders, records build/source fingerprints, owns/stops its API, requires an explicitly approved isolated limiter headroom policy and restores settings. It uses an empty local k6 configuration and whitelisted environment; five-second read-only resource/queue sampling records errors and prevents a clean acceptance when collection fails. No production application code changed during this continuation.

**Evidence:** `tests/artifacts/step13/dataset-dry-run.json` records the full 10,000-customer/25,000-order/1,000-product/3,000-variant plan with related histories. All **15 focused tests passed, 56 assertions**, including accounting/counter reconciliation, write batch bounds, fail-fast guards, fresh-food payloads, malformed HTTP responses and missing admin thresholds. The focused runtime TypeScript check passed. Checksum-verified k6 **v2.3.0** configuration inspection passed for **smoke, volume, expected, peak and soak**; `inspect` runs no HTTP iterations. Earlier actual production smoke/recovery evidence remains in section 23. **No database was populated, migrated or seeded; no load profile or restore exercise ran during this continuation.**

**How to test locally:** run `bun tests/load/generate-step13.ts` for a full pure dry run, `bun test tests/load apps/server/tests/background-worker.test.ts apps/server/tests/web.static-server.test.ts`, the focused runtime TypeScript project, and `bun tests/runtime/step13-inspect-load.ts` with the ignored reviewed k6 binary. These preparation checks require no database/application startup. Do not run the generator's `--apply` branch or load runner before approval.

**Next:** review `docs/ecommerce-step13-capacity-execution.md`; it specifies the proposed separate local DB **`e2e_v3_step13_capacity_20261003_a`** on port 5433, a new local Redis test instance on port 6381, fictional auth/RBAC and bounded data population, enabled temporary headroom limits in only that capacity DB, and smoke/volume/15-minute expected/2-minute peak/60-minute soak execution. Obtain explicit approval for that full scope, then execute sequentially and investigate any failure before advancing. User-operated staging HTTPS/proxy/auth limits, simulator/worker recovery, monitoring and credential/backup restore acceptance remain open.

**Steps left:** three subsequent numbered steps (14–16), plus Step 13 execution/staging/restore and earlier security/review gates. The user subsequently authorized committing Step 13. Runtime fixes are committed as `1b7da9f`; capacity preparation and this handoff are committed together. Resolve that commit from `git log`; do not infer authorization for capacity execution or additional commits. Tutorial recording remains gated.


## 25. Step 13/16 — Approved local capacity execution (2026-10-03–04)

### Authorization and target

The user explicitly approved section 24 after commits `1b7da9f` and `be448a9`. Created only the approved new local database `e2e_v3_step13_capacity_20261003_a` on fictional PostgreSQL port 5433 and dedicated Redis container `ts-starter-step13-capacity-redis` on loopback port 6381. Applied 36 existing migrations, provisioned fictional verified auth/RBAC accounts, populated the reviewed 10k-customer/25k-order/1k-product/3k-variant dataset and verified initial invariants. No new schema changes, merchant data operations, resets, external courier/mail/payment calls, staging actions, restore exercises, active scans or additional commits are authorized by this execution. The default no-DB boundary remains outside this exact approved scope.

### What changed

1. Moved visitor-list pagination before the lateral latest-session lookup. Seven actual PostgreSQL checks verify grouped people, latest metadata, page bounds and segments.
2. Narrowed facet selections and added parameterized PostgreSQL aggregation for price/availability/brand counts when no attribute facets exist. Attribute-bearing and mixed-currency paths preserve the mapper. Three paired facet responses and seven additional summary/fallback checks match original behavior. No stock-result cache or schema/index change. Warmed alternating comparison measured median 307.00ms original versus 76.38ms aggregated.
3. Added private live resource progress, local-only k6 diagnostics and explicit p99 summaries. Future runs retain API logs per execution instead of overwriting a shared log; the completed soak predates that log-retention change.
4. Retained failed smoke/initial expected reports. Final-build smoke and volume passed, and the full expected 15-minute profile passed: 25,203 requests, 901 successful persisted checkouts, zero failures/drops; p95 public 89ms/admin 281ms/checkout 116ms. Post-run counters/money/order reconciliation passed.
5. Full two-minute peak failed: public p95 4.40s, checkout p95 5.49s, 3,338 dropped iterations and one failed checkout response. Its 581 successful checkouts reconciled and invariants passed. API samples suggest CPU saturation on this shared host; no sampled DB lock waits/deadlocks. This remains a failed acceptance profile. The lower-rate full 60-minute soak passed separately: 36,721 requests, 721 successful persisted checkouts, zero failures/drops, p95 public 78ms/checkout 160ms, with reconciled invariants. It does not clear peak.

See `docs/ecommerce-step13-capacity-results.md` for current measurements, limits and exact retained evidence. Focused checks passed: 15 tests/56 assertions and runtime TypeScript. Execution changes remain uncommitted.

### How to test after running the app

1. Review the isolated capacity env/manifest under ignored `tests/artifacts/step13/`; never copy cookies or credential URLs into documentation. The new DB is already populated. **Do not rerun dataset `--apply`, recreate/reset resources or apply migrations again.**
2. Rebuild the capacity executable when API source changes using the reviewed production-local env; do not use root build/start wrappers that inject an unrelated env. Preserve binary/source fingerprints.
3. Use the guarded runner with this exact env and a reviewed profile. It owns API 3013, enforces fictional auth, temporarily applies the approved headroom limits, restores settings, records resource/summary/invariant files and stops its API/k6 processes. Run profiles sequentially; do not reuse a separately running API or run another profile while any capacity workload is active.
4. Inspect the final summary thresholds, dropped iterations, business invariants, persisted checkout delta and sampling errors. An HTTP 200 or process launch alone is not acceptance. Failed peak must stay failed until diagnosis and a passing repeat on a reviewed topology.
5. Regression scripts under `tests/runtime/` guard the exact approved target and clean only their own fixtures. The paired facet script requires freshly matching baseline/fixture capture; do not reuse a prior baseline after its temporary fixtures were removed. Run DB regressions only while capacity sampling is idle.
6. Safe checks without application/DB execution: `bun test tests/load apps/server/tests/background-worker.test.ts apps/server/tests/web.static-server.test.ts`, and `bun ./node_modules/typescript/bin/tsc --noEmit --project tests/runtime/tsconfig.step13.json`. These are focused checks, not a clean whole-repository or browser/security acceptance claim.

### Next and steps remaining

All approved profiles have executed and final cleanup was verified: API/k6 ports stopped, original default limits restored, regression fixtures gone, 27,503 retained orders and counters reconciled. The capacity DB/Redis remain retained. Investigate peak performance and the failed checkout response on the intended deployment topology before declaring capacity accepted. Remaining Step 13 staging/proxy/rate policy, worker/simulator, monitoring and backup/restore gates need their separately scoped approval/evidence. Unresolved Step 12 active security scan and dependency risk dispositions also remain. Do not begin automated tutorial recording. **Three subsequent numbered steps remain (14–16), with Step 13 acceptance still open.** No additional commits until the user asks.


## 26. Step 14 — Standalone courier simulator only (2026-10-04)

User requested only the local courier simulator and deferred the remaining work until tomorrow. Implemented `tests/courier-simulator/steadfast/` and verified the unchanged production Steadfast adapter over actual local HTTP. Six unit tests/25 assertions, focused TypeScript and 16 HTTP contract groups passed, including all 18 mapped states, exact fictional COD/auth/payload, independent parcels, duplicate replay, faults, uncertain lost-response recovery, callback parser/signatures and scoped cleanup. Pinned WireMock engine was started for these checks and stopped afterwards. No app/DB/Redis setup, browser E2E, live courier requests, production changes or commits.

**Test after starting:** follow `tests/courier-simulator/steadfast/README.md` for Docker start, readiness, engine-only HTTP checks and stop. The local adapter base URL is `http://localhost:9099` without `/api/v1`; normal production allowlists remain unchanged. Callback sending to the app is separately gated and was not exercised today.

**Next:** integrate the existing isolated app harness and complete Step 14 lifecycle/worker/persistence/browser acceptance later, under the relevant authorization. Optional simulator capabilities and real merchant acceptance remain open. Step 13 peak/staging/recovery and Step 12 security gates remain unchanged. **Three numbered V3 steps remain (14–16); Step 14 is only partially done.** Simulator-plan acceptance remains open in 7 steps; standalone tooling is ready. No tutorial recording or further work today. Execution changes remain uncommitted.


## 27. Step 14 — Authorized simulator-backed isolated app integration (2026-10-04)

### Authorization and exact targets

The user explicitly authorized simulator startup, isolated local app/worker/browser tests, and narrowly scoped fictional fixture writes/cleanup after guard/target verification. Reused **existing** database `e2e_v3_step10_20261003_03043274` on `127.0.0.1:5433`, Redis on `127.0.0.1:6380`, and prefix `ts-starter:e2e:step10:e2e_v3_step10_20261003_03043274:`. The capacity database/Redis were not targeted. Read-only preflight verified existing schema tables, verified personas and permission catalog; existing persona sessions were refreshed through real password login, without signup/provisioning. No migrations, seeds, resets, new database, schema edits or generation were needed or executed.

Private mode-0600 runtime: `tests/artifacts/step14/runtime.env`, copied from the reviewed Step 11 runtime with fictional simulator credentials and `STEAD_FAST_BASE_URL=http://localhost:9099` (no `/api/v1`). API/web retain localhost 3000/3001. `NODE_ENV=test`, `E2E_MODE=true`, automatic workers disabled; mail/payment/storage configuration blank. No real courier/payment/mail call, staging/production action, scan, load workload, recovery exercise, commit/push, or tutorial creation/recording/generation is authorized by this slice.

### What changed

- Reused existing Playwright config, V3 catalog/order/browser helpers, existing personas/session paths and independent Prisma client helper. Added a focused Step 14 config/spec, owned fixture cleanup, fail-closed app guard/preflight/session refresh, and read-only cleanup audit. The old mocked `submit()` helper rejects simulator mode.
- Test-process workers call the real `CourierDispatchWorker` / `CourierTrackingWorker`, configured resolver, production registry and unchanged Steadfast adapter. Only candidate discovery is restricted to the owned connection; actual transactions, leases, writes, provider HTTP and tracking persistence execute normally. Two independent Bun processes use an IPC start barrier. No production test bypass, scheduler change or public worker-trigger route.
- Simulator preserves application-generated attempt invoices within its own scenario namespace and now implements the exact return-aware status lookup used by the actual tracking worker. Optional pickup/return-submission/history/payout/service-area endpoints remain deliberately unsupported.
- Fixed a runtime-discovered booking policy defect: cancelling an attempted retry moves it to `order_recovery_required`, which previously disabled booking identity reconciliation. This reason now permits authenticated explicit identity evidence only for an attempted, unleased review with no existing identity. Reconciliation preserves the open custody exception, cancelled order, committed inventory and shipment claim; blind retry remains forbidden. Production adapter and destination policy are unchanged.

### Tests and results

Selected application matrix: **16 Chromium checks passed** on the final suite. Coverage includes real storefront checkout/reservation; browser confirmation/commit/deposit/routing/queue/handoff/gross settlement/completion; actual HTTP booking and exact journal payload/count; polling approval-pending; concurrent signed callbacks plus replay under a different header key; invalid bytes/auth/JSON/payload with unchanged history; return/partial-delivery exceptions; explicit full receipt/sellable inspection/one-time restock/refund; unsafe inspection refusing restock; unpaid/deposit/prepaid COD; early collection and delayed delivery after partial refund; mismatched amount/currency; competing authorized account routing/queue; two independent worker-process claims; connection-wide cooldown; disabled connection/stale snapshot holds; pre-attempt cancellation/payment invalidation/new attempt invoice; all seven fault classes; lost-response status-only uncertainty; cancellation after lost acceptance plus explicit identity reconciliation; and actual-resource viewer/customer/anonymous permission denials.

Retry scheduling and expired-lease eligibility use the existing injectable worker clock to avoid waiting minutes; HTTP and request aborts are real. This proves durable policy behavior at those clock instants, not a wall-clock crash/soak test. Missing invoice lookup currently becomes a `validation` review on HTTP 404; found status without identity becomes `uncertain_submission`. Neither sends a second create. Concurrent Serializable queue conflict is an explicit 409 followed by operator replay returning the existing row. Duplicate restock is a 409 with unchanged stock. Delivery retains ownership until money is reconciled.

Focused no-network worker/hold/policy checks: **44 tests / 113 assertions**. Simulator/control/app-guard checks: **7 tests / 36 assertions**. Focused Step 14 and standalone simulator TypeScript passed; server package TypeScript passed. Failed early harness expectations are retained privately in `run-1.txt`, `run-2.txt`, and `run-4.txt`; intermediate passing suites are `run-3.txt`, `run-5.txt`, `run-6.txt`. Final suite/repetition, contract rerun and cleanup evidence are recorded in the completion subsection below.

### How to test after app startup

1. Use the reviewed retained Step 14 private runtime, not root build/start wrappers or `tests/env/.env`. Inspect exact targets via the existing guard plus `app-preflight.ts`. Start only the existing test PostgreSQL/Redis resources and pinned local simulator. No migration/seed/reset/provision command is part of reproduction.
2. Start the API with that runtime; build and preview the web with explicitly inherited runtime as recorded in the simulator README. Keep automatic workers disabled and no other test suite/workload running on this DB.
3. Refresh the existing persona sessions using `app-auth.ts`, then run the existing Playwright framework through `playwright.step14.config.ts`. Test helpers own only fresh `v3-browser-sim-<run>` catalog/shipping/connection/order fixtures and scoped simulator mappings/journal entries.
4. Read persisted assertions and private reports, then run `app-audit.ts`. Verify zero owned fixture residue, restored store settings/default shipping and unchanged retained order count. Test failures use `finally` cleanup; a forcibly killed test process may leave fixtures requiring separately reviewed owned-run cleanup. Never substitute a global DB/simulator reset.

### Next, remaining steps and unfinished gates

The requested selected local simulator/app integration is complete; review the final diff and evidence before expanding scope. **Three numbered V3 steps remain (14–16)** because real merchant acceptance is still open and Steps 15–16 have not executed. No next-scope implementation, commit or push is authorized. Step 13 peak remains failed and unresolved; security/dependency review, staging HTTPS/proxy/auth/rate policy/monitoring, backup/restore recovery and real merchant courier contracts/operations remain explicit gates. Legacy ambiguous-record breadth, forced process-interruption/crash cleanup, other browser engines and optional provider APIs are not newly certified by this suite. **Do not create, record or generate tutorials unless the user explicitly asks**, even after other gates pass.


### Completion evidence and shutdown

Final **16-check suite passed twice**: private `tests/artifacts/step14/run-7.txt` (36.2s) and `run-8.txt` (36.4s), zero retries. Final standalone adapter HTTP rerun passed **16 contract groups** (`contract-http.txt`). Focused worker/policy and simulator/guard unit suites total **51 tests / 149 assertions**; Step 14, standalone simulator and server package typechecks passed, and `git diff --check` passed.

Independent read-only audits (`audit-before.json`, `audit-after-7.json`, `audit-after-8.json`, `audit-final.json`) matched exactly: zero owned product/category/location/shipping/connection/customer/order/webhook fixture residue, identical restored shared settings/default shipping with preserved timestamps, **69 pre-existing retained orders**, and only **four static simulator mappings**. Application audit/login/visitor telemetry remains in the isolated test DB; no broad telemetry/session cleanup ran. Existing test database/Redis data volumes are retained.

Owned API/preview/simulator and the existing test PostgreSQL/Redis services started by this task were stopped after final verification. Local ports 3000/3001/9099/5433/6380 are no longer listening. Capacity Redis/database were untouched. Baseline commit is `846ed77`; all new integration/simulator/test/documentation changes remain uncommitted on `ecommerce`. No tutorial was created, recorded or generated.


## 28. Step 14 — Authorized local interruption and legacy-record checks (2026-10-04)

The user requested “commit first and do it” after the proposed bounded next action: worker termination/restart during booking, owned cleanup after interrupted tests, and legacy ambiguous payment/shipment records. Committed the previously completed simulator/app integration as **`abf36a4`** on `ecommerce`, without pushing. Follow-on changes remain uncommitted unless separately requested.

Reuse section 27's exact isolated database/Redis/runtime/personas and existing Playwright harness. No migrations, seeds, resets, new database, real courier/payment/mail, production/staging, scans, load/capacity or backup/restore exercise. No tutorials. Revalidate targets and read-only prerequisites before fixture mutation/startup. The failed peak and all security/staging/recovery/merchant gates remain unchanged.

Prepared narrow test-only changes: persist per-run ownership/restoration snapshots before mutation and an exclusive active-run lock; move the existing scoped cleanup into a reusable helper and add a CLI that requires the saved exact run/target. New suite cases will kill an actual peer process after simulator acceptance, restart before/after real persisted lease expiry without clock injection, kill an actual fixture process and recover from disk while preserving another simulator run, and inspect legacy missing/contradictory receipts and missing claim/operation evidence. No public worker trigger or production bypass. Focused TypeScript passed; runtime acceptance is pending execution below.


### Completion evidence, reproduction and remaining gates

The new **9-check recovery suite passed** (`recovery-run-1.txt`, 2.3m), then the combined **25-check Chromium suite passed** (`recovery-full.txt`, 3.0m, zero retries) through the same `playwright.step14.config.ts`. The recovery tests use an actual SIGKILL and wait for the persisted 120-second lease to expire; no injected worker clock or lease mutation is used for the crash test. Restart before expiry cannot claim the job. Restart after expiry performs one invoice lookup, holds uncertain acceptance for operator review, and sends no second create. Cancellation/reconciliation retains the stock claim and custody exception without changing payment history.

Interrupted-run cleanup runs in a fresh CLI process using a strict private mode-0600 manifest and exclusive active-run lock saved before fixture writes. It restores settings/default shipping, deletes only owned relations and matching simulator journal/mappings, tolerates repeat completion, and preserves another simulator run. A new fixture suite refuses to start while an interrupted run owns the lock. Recovery is an explicit operator action for a confirmed stopped run; never invoke it while that run is active. This verifies selected process interruption, not arbitrary disk corruption, PostgreSQL crash durability or backup/restore.

Legacy checks cover four status-only payment states without ledger entries, contradictory paid-versus-partial receipt evidence, and missing shipment claim/operation records. They assert actual persisted history, receipts/refunds, committed stock and recovery holds. Unsafe booking/payment/restock actions remain blocked; no provider request is emitted for these ambiguous cases. This is selected legacy coverage, not exhaustive certification of every historical record shape.

Simulator/control/environment/manifest unit checks: **10 tests / 50 assertions passed** (`recovery-unit.txt`). Focused app and standalone simulator TypeScript passed (`recovery-types.txt`, `recovery-simulator-types.txt`). No production source/schema changes were needed for this follow-on work. Independent audits before, after the 9-case suite and after the combined suite match exactly: zero owned fixture residue, identical settings/default shipping including timestamps, **69 retained orders**, four static simulator mappings, and no active run lock. Application telemetry remains; no broad cleanup ran.

After the reviewed exact app startup in section 27, refresh existing sessions with `app-auth.ts` and run `bun --env-file=tests/artifacts/step14/runtime.env ./node_modules/.bin/playwright test --config playwright.step14.config.ts`. Filter `v3-simulator-recovery.spec.ts` for the recovery cases; allow the actual two-minute lease wait. Run guarded `app-audit.ts` afterwards. For a confirmed stopped interrupted run only, inspect its saved `tests/artifacts/step14/owned-runs/<run>.json` and run `bun --env-file=tests/artifacts/step14/runtime.env tests/courier-simulator/steadfast/app-recover.ts <run>`; this cannot substitute for missing manifests or different targets. Never reset the DB or simulator globally.

The requested simulator-backed app integration and bounded follow-on are complete. **Three numbered V3 steps remain (14–16)**: real merchant acceptance remains open and Steps 15–16 have not executed. Next: review the uncommitted follow-on diff and choose a separately scoped remaining gate. Failed peak, security/dependency review, staging, backup/restore and real merchant courier acceptance remain unresolved; optional provider APIs and other browser engines remain uncertified. No scope expansion, push or second commit was performed. No tutorial was created, recorded or generated; an explicit request remains required.

Owned API/preview/simulator and the test PostgreSQL/Redis services started for this follow-on were stopped after final audit. Ports 3000/3001/9099/5433/6380 no longer listen; data volumes retained, capacity resources untouched. `git diff --check` passed.


## 29. Public/customer landing page — 2026-10-04

User authorized committing previous work, then implementing the responsive landing page with app-like mobile icon navigation. Prior recovery committed as `ccba53d`; public/customer plan committed as `c076aee`. The new landing/header/footer/search/mobile navigation implementation and WebP hero asset remain uncommitted. See `docs/ecommerce-public-customer-content-plan.md` section 11 for files/asset prompt, actual checks, startup review instructions and remaining phases.

Production web build, client boundary checker and diff whitespace checks passed. Browser review covered light/dark desktop and mobile, 320/390/768 px layouts without horizontal overflow, active Home navigation, existing cart-sheet interaction and Enter search. Full web TypeScript still has alias/other-file failures; changed UI files have no reported diagnostics. No schema/data provisioning, migration/seed/reset, new catalog fixture write, real payment/mail/courier, deployment or tutorial. The existing isolated runtime guards were verified before starting the retained app for review; automatic workers remained disabled and courier simulator stopped. Ordinary app visitor telemetry may be retained; no broad cleanup.

Next: review the landing design, then agree the next public/customer plan phase. Dashboard/profile/settings, informational pages and admin content/SEO have not been implemented by this landing task. Failed peak, security, staging, backup/restore and real merchant acceptance remain explicit unfinished gates.

Local API/web preview and existing test PostgreSQL/Redis are running for visual review at handoff. Courier simulator remains stopped; workers disabled. No catalog fixtures were created for this task.

Runtime correction — 2026-10-04: user reported `EADDRINUSE` on port 3001 when starting their own build. Stopped the task-owned preview/API and test PostgreSQL/Redis containers; verified ports 3000/3001/9099/5433/6380 are free. Data volumes retained. Standing user instruction: never leave task-owned servers running after work finishes. Earlier running-preview handoff is superseded.


## 30. Deployment branding and niche assets — 2026-10-04

User authorized committing prior landing/plan work first, then implementing BRAND selection and generating niche hero/product assets. Prior work committed as `176f5f7` and `2e9d2bd`; new branding remains uncommitted, no push. Detailed implementation, prompts/paths, startup verification commands and remaining gates are in `docs/ecommerce-branding-plan.md` section 11 and `docs/ecommerce-brand-assets.json`.

Completed: shared typed foodshop/bestsky/airshop registry, required same BRAND selector for API/web, build/runtime mismatch checks, all-route API identity check, cache inputs, selected homepage/identity/favicon/SEO defaults, AirShop hero retention, two new heroes and three product assets per niche. Seed path/image declarations do not execute or create datasets. No schema/provision/seed/reset/new DB or live service operation.

Checks passed: 5 tests/53 assertions, all three web builds, server build/types, web client boundary check and diff check; actual isolated HTTP rendering/identity/mismatch checks and phone/desktop review. Full web types remain blocked by existing alias/other-page errors. Task-owned services stopped and ports 3000/3001/9099/5433/6380 verified free; retained volumes preserved.

Next: separately scoped niche dataset work and explicit seed execution authorization. Full FoodShop domain, merchant logos/contact/policy facts and customer/admin-content/SEO phases remain outstanding. Peak/security/staging/backup-restore/real merchant acceptance remain unresolved. No tutorial created/recorded/generated.


## 31. Shop and product presentation — 2026-10-04

The user paused the additional 21 image/product request and authorized proceeding with product and other pages. No additional images were generated, and no brand products were seeded. Existing branding changes are preserved and remain uncommitted.

Completed this bounded step: niche-aware catalog heading; responsive square-image cards, refined spacing and touch controls; clearer search/sort/results and retry states; product gallery with contained images, named thumbnail controls and selected-state accessibility; active default variant selection, refined purchase panel, genuine gadget/fresh-food guidance and structured product specifications. Crossed-out prices show only when higher than the selling price. Filtered URLs no longer receive unfiltered initial rows. Existing cart and server-authoritative checkout/payment/inventory contracts remain in place. No new content claims, schema or API changes.

Validation: production web build and client boundary check passed; git diff whitespace check passed. Full web TypeScript still reports existing errors outside these three changed shop files; no diagnostics name product-page.tsx, shop-page.tsx or catalog/product-card.tsx. This step has no actual browser/mobile screenshot or persisted purchase evidence, so visual and interaction acceptance remains unfinished. No server/container was started; no DB writes, migrations, seeds or resets.

How to review after the user's app startup: build with the same BRAND as the API; open /shop and a real product; check widths 320/390/768/1440, long names, absent images, unavailable variants, search/filter URLs, gallery controls, save state and existing cart opening. Inspect fresh-food delivery guidance and eligible gadget warranty text; food/clothing must have no gadget warranty text. Failed requests must offer retry rather than masquerading as an empty catalog. Existing pagination is still limited to the current first 100 results and needs a separate follow-up.

Next bounded step: cart/checkout/confirmation/tracking visual polish, followed by customer dashboard/orders/profile/settings. About/contact/approved policies and admin-managed content/SEO remain unfinished. Brand seed datasets and the paused seven additional product images per brand remain pending. Retain failed peak, security, staging, recovery and real merchant acceptance gates. No tutorials; no new commit or push.


## 32. Admin SEO implementation — 2026-10-04

The user authorized committing completed work first, then SEO from admin. Committed branding/assets as `a5e58ec` and shop/product presentation as `c37fed1`, without pushing. New SEO changes remain uncommitted.

Implemented:
- Admin → Store settings has independent home/about SEO editors with title, description and share-image URL, brand-default placeholders, draft search preview, Save draft and Publish SEO. Empty published values restore brand defaults. Publishing requires saved edits. Read/manage use the existing `AdminAccess` plus `AdminStoreSettingsRead`/`AdminStoreSettingsManage` permissions on the server; banned/archived accounts are rejected. Published actions use the existing best-effort activity log with actor/page/source revision.
- Added deployment-local `StoreSeoPage` enum (`home`, `about`) and `StorePageSeo` model mapped to `store_page_seo`. Separate draft and published fields prevent draft leakage. Compare-and-update revisions reject stale saves/publication races. Public queries explicitly select only published fields. An absent optional table yields public brand defaults; admin editing returns an actionable 503. Other database errors are not disguised as unpublished content.
- Home and new `/about` route load published metadata on the server. About renders existing brand copy/imagery without inventing a merchant story. Footer links About. Product pages load the same eligible public product for SSR content and SEO, honor existing admin SEO overrides, and derive missing values from product information. Missing/inactive products use a real 404 with noindex. Products expose safe Product/Breadcrumb JSON-LD with active valid offers, current prices/currencies/availability and no invented reviews.
- Title/description, canonical, Open Graph and Twitter tags use the configured brand origin. FoodShop’s unknown origin remains unset, so no guessed canonical or relative social-image URL is emitted. `/shop` has a canonical; filter/search URLs are noindex. Account/auth/admin/cart/checkout/tracking/saved/setup/payment flows have noindex metadata. `robots.txt` blocks non-production/E2E runtimes and excludes private/purchase paths in production. Replaced the starter static robots file after actual serving exposed its precedence over the dynamic route.
- `/sitemap.xml` includes existing home/about/shop and eligible active product routes through cursor batches; no filtered/private URLs. XML/JSON-LD escaping tested. Sitemap responses are not cached; the single-file protocol limit is 50,000 URLs, above which a sharded sitemap is explicitly required rather than silently truncating. Page/product loaders use zero staleTime and no new shared page cache.

Schema prerequisite (not executed): provision PostgreSQL enum `StoreSeoPage` and table `store_page_seo` from the reviewed Prisma model in the intended deployment database. The table needs enum primary key `page`, integer `revision` default 1, nullable draft/published title (120), description (320), image URL (2048), nullable `publishedAt` and created/updated timestamps. No schema migration was generated/applied, seed/reset/new database or fixture write occurred. Only `prisma generate` ran to update the ignored local client; it does not provision this table. Home/about saving/publication and real persisted draft isolation remain unverified until provisioning is separately authorized/performed. Product SEO reuses already existing columns.

Verification: 24 focused tests / 83 assertions passed (8 draft/publication service tests, 7 HTTP permission/audit tests and 9 metadata/crawler tests), using the existing Bun test setup with mocked storage, not database persistence. Server TypeScript and server/web production builds passed; web client boundary and whitespace checks passed. Full web TypeScript still fails in existing cross-app aliases/other pages; newly added server modules consequently also appear under those unresolved aliases, but no final errors name the SEO editor/helpers/routes in web code.

Read-only runtime verification uses the retained exact guard: NODE_ENV=test, E2E_MODE=true, BRAND=airshop, PostgreSQL 127.0.0.1:5433/e2e_v3_step10_20261003_03043274 and Redis 127.0.0.1:6380 with the matching isolated prefix. Courier workers disabled by E2E guards; no simulator/provider/payment/mail call. Verified actual raw HTML metadata/canonicals for home/about, actual product Product/Breadcrumb JSON-LD and missing-product 404; robots and sitemap HTTP output, cart/login/filter noindex, anonymous draft denial and unknown-page rejection: all 12 read-only HTTP checks passed. Private evidence: tests/artifacts/admin-seo/. This is not persisted publication or browser acceptance.

How to test after startup/provisioning: build/start API and web with matching BRAND using direct package commands and reviewed env; no root data-setup wrappers. At /admin/store-settings, compare an anonymous user, read-only admin and manager. Save a distinctive home/about draft, reload admin and confirm it persists while public raw HTML retains the previous published/default values; publish, reload public HTML and confirm tags change. Edit another draft without publishing and confirm public tags stay unchanged. Two editors with the same revision must receive conflict rather than overwrite. Blank published fields should restore brand defaults. Change existing product SEO overrides and inspect raw product tags/JSON-LD; inactive/missing products must return 404. Check /robots.txt, /sitemap.xml, /shop?search=... and cart/auth noindex. Stop all task-owned services at completion.

Next: review/provision the precise schema prerequisite before database-backed SEO save/publish/browser acceptance. Then continue cart/checkout/confirmation/tracking and customer dashboard/orders/profile/settings. Structured editable home/about body content, approved contact/policies, brand seed datasets/additional images, FoodShop’s exact domain and large-catalog sitemap sharding remain unfinished. Failed peak capacity, security, staging, recovery and real merchant acceptance remain open. No tutorial, push or additional commit.

SEO handoff runtime: task-owned API/web processes and retained test PostgreSQL/Redis containers stopped; verified ports 3000/3001/9099/5433/6380 free. Data volumes retained. No service left running.

## 33. FoodShop catalog/inventory seed — 2026-10-04

User authorized committing existing work, FoodShop product/inventory seeding and continuing public/customer pages in sequence. Existing admin SEO and the user-supplied migration are committed as `91f1c9c`; no push. Read-only inspection confirmed the local merchant development target `localhost:5432/ecommerce`, matching BRAND=foodshop, and the already present `store_page_seo` table. No migration, reset or new database was executed.

Completed: an explicit local database guard and brand-specific create-only seed add ten fictional FoodShop products/variants (four mango, three honey, three dates), three food categories, one owned brand/location, ten batches and 300 units. Reuses the three existing product images; no image generation. Re-running preserves merchant edits, expiry dates, stock balances and receipts. Two runs and read-only verification confirmed ten receipt movements and eight existing orders unchanged; older mixed catalog remains intact. Seed safeguard/data tests: two passed, 40 assertions.

How to repeat on the reviewed local development target: `bun --env-file=apps/server/.env packages/db/prisma/seed/ecommerce.ts`. The command requires BRAND=foodshop and DATABASE_URL identifying a local non-production/non-E2E database; no additional database selector is required. Other brand datasets are not prepared. Do not use the legacy `--catalog` seed for this task. Fresh mango ordering still requires real merchant-configured delivery slots; none were seeded under product/inventory authorization.

Next: verify cart/checkout/confirmation, customer orders/profile/settings and contact/shipping in the established isolated harness. Approved legal policies, FoodShop public domain/contact facts, editable home/about body content and persisted SEO publication acceptance remain open. Peak capacity/security/staging/recovery/real merchant acceptance remain unresolved. No tutorial.

## 34. Cart, checkout, confirmation and tracking — 2026-10-04

Completed: consistent cart/sheet/saved cards and contained images; named quantity and shipping-radio controls; item-subtotal labels without misleading zero delivery/tax promises. Checkout shows actual available delivery choices, required contact/address fields, retryable settings/rate errors and accurate COD copy. Fresh-food windows are required for fresh items, with postal-code changes clearing selection. Cart snapshots preserve fulfillment type; older saved carts resolve missing policies through existing product reads and block ordering until checked. Server checkout remains authoritative for availability, slots, fee and idempotency. Confirmation displays the accepted response's order number/total from browser-session receipt; a missing receipt does not claim an accepted order. Tracking adds address, minimal food window, public history and evidence-backed received/refunded/outstanding values. No gateway/provider call or worker-trigger endpoint.

Verification: final established Playwright journey passed. It created an owned fictional packaged-food product/stock via the existing isolated harness, purchased through the browser and asserted persisted order total 1050 BDT, history, on-hand 10/reserved 1 and an active reservation. A fictional 300 BDT admin receipt persisted and customer API/UI showed 750 BDT outstanding. Fresh-food checkout remained disabled without a selected window, including a legacy cart missing fulfillment type. Fixture payments/orders/stock/catalog/location/rate were cleaned in finally; unrelated order count was preserved. Earlier failures uncovered an unnamed radio and dropped cart fulfillment field, both corrected and rerun. Screenshot assets are private under tests/artifacts/customer.

How to test after startup: use matching FoodShop builds and the reviewed isolated runtime.env, then run `bun --env-file=tests/artifacts/step14/runtime.env run node node_modules/@playwright/test/cli.js test tests/e2e/__step_8_3__/customer-journey.spec.ts --project=chromium --no-deps --workers=1`. Retained persona sessions must be valid; this command skips broad user provisioning/seeding. Do not run root data-setup wrappers or migrations. For merchant development, fresh mango checkout requires real configured slots; the seed does not invent them.

Next: customer account verification below. Remaining: visual merchant review, real policy/delivery content and broader acceptance gates; no new payment gateway or customer returns portal under this phase.

## 35. Customer dashboard, orders, profile, settings and auth — 2026-10-04

Completed: storefront account shell with Overview/Orders/Profile/Settings and mobile account navigation; recent orders instead of SaaS billing/upgrade content; owned paginated order list/detail with loading/error/retry/empty states. API pagination applies the identical user ownership condition to both rows and count, with deterministic ordering and limit validation. Customer output strips staff history notes/actors/provider metadata and internal food-booking capacity. Balance computation reuses receipt/refund accounting and reports ambiguous legacy money rather than fabricating amounts. Profile retains existing name/avatar/security operations in a clearer layout; device/settings error states and actual light/dark/system controls. Auth pages share storefront branding; password/magic-link return destinations are restricted to local paths. Existing social/2FA default-dashboard flows are retained; no live mail/OAuth test was run.

Verification: 19 server tests/51 assertions passed, including owner-scoped pagination, denied other-user lookup and ledger/privacy mapping. Safe-return/seed/SEO pure tests: 12 passed/82 assertions; existing SEO service/controller tests: 15 passed/48 assertions. Server TypeScript and server/web builds passed; client boundary and whitespace checks passed. Full web TypeScript still fails in existing cross-app aliases/admin/payment files; no diagnostics reference the changed customer/auth/shop/information routes/features. The browser journey verified profile writes through the real UI and persistence/reload, restoring the original fictional user's name; dark preference survived reload. Eleven routes (home/about/dashboard/orders/owned detail/profile/settings/contact/shipping/saved/cart) had no horizontal overflow at 320/390/768/1440px. Anonymous and another authenticated customer received 404 for the owned order; purchaser email in the URL did not bypass ownership. Out-of-range limit was rejected.

How to test after startup: run the same customer-journey spec after starting the retained isolated services with matching BRAND and valid persona states; inspect dashboard/order screenshots and manually review account/security dialogs without deleting shared accounts. Existing security operations were retained but password changes, 2FA, device revocation, account deletion, real OAuth/mail and gadget warranty claim flows were not rerun in this page checkpoint.

Next: publication facts/content prerequisites below. Remaining: human visual review, deeper security-operation acceptance and the existing release gates. No tutorial.

## 36. Contact, shipping and policy page publication — 2026-10-04

Completed: responsive contact page reads current public store support settings with brand fallback, uses only configured email/phone/address and provides owned-orders navigation. Shipping page shows actual active rate values/free thresholds without invented delivery guarantees. Structured policy renderer supports separately approved terms/privacy/returns content, with effective dates and plain paragraphs rather than injected HTML. Policy routes stay 404/noindex and absent from footer/sitemap until approved sections are configured. Contact/shipping have SSR metadata and sitemap entries; product metadata remains derived from product information. No fake contact submission form, certifications or legal policies.

Verification: contact/shipping and unavailable policy routes covered by the final browser pass; home/about raw HTTP remained 200 under FoodShop. Read-only isolated target inspection confirmed `public.store_page_seo` is absent, although the merchant local development database has the user-provisioned table. Therefore persisted admin SEO save/publish/conflict/browser acceptance remains blocked on applying the already committed `20261004144706_store_seo` migration to the separately reviewed isolated target under explicit migration authorization. No migration was run by this work.

How to test after startup: open /contact and /shipping; compare contact facts with admin settings and rates with checkout. /terms, /privacy and /returns currently return 404. Once merchant-approved sections/effective dates are supplied, configure brand policies and rebuild; then verify published routes/footer/sitemap. FoodShop requires its exact HTTPS public origin before canonical URLs and sitemap publication can be accepted; sitemap intentionally returns 503 while unset.

Next: supply FoodShop's exact domain/contact facts and approved policies, and separately authorize/provision the isolated SEO table for persistence acceptance. Editable home/about body content still needs a reviewed draft/published content model (validated section data, revision/conflict control and permission/audit boundaries); existing StoreSettings/StorePageSeo have no body-content storage. Implementing/provisioning that CMS prerequisite is unfinished under the no-migration boundary. BestSky/AirShop seed datasets and extra images remain deferred. Failed peak capacity, security, staging, recovery and real merchant/courier acceptance remain open; no tutorials.

Runtime handoff: task-owned API/web and retained isolated PostgreSQL/Redis are stopped. Ports 3000/3001/9099/5433/6380 verified free; test volumes and preexisting merchant development services retained. Seed work is committed as `3fa1bde`; public/customer pages and tests are committed with this checkpoint under the user’s explicit commit request. No push.

Seed configuration correction — 2026-10-04: removed the redundant database acknowledgement variable at the user’s request. DATABASE_URL determines the seed target; existing local/non-production/non-E2E guards and create-only behavior remain. Focused safeguard/data tests passed (2 tests, 43 assertions); no database seed, migration or service startup was run for this correction. Next and unfinished publication/release gates remain as recorded above.
