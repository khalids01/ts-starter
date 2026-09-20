# Ecommerce V2 Step 8 execution plan

Last reviewed: 2026-09-20

Status: Step 8.1 test-infrastructure code is implemented and statically/unit verified. Runtime, browser, database, and user-review gates remain.

## Purpose

Step 8 proves that the scoped ecommerce V2 implementation is correct enough to release, resistant to common attacks, usable through real browsers, measurable under a workload larger than 10,000 distinct customers per month, and understandable through an in-admin tutorial library.

This document is the authoritative execution guide for Step 8. The shorter checklist in [`ecommerce-todo-progress-v2.md`](./ecommerce-todo-progress-v2.md) remains the high-level project record. If the two documents disagree, stop and reconcile them before changing code.

Tests can provide strong, repeatable evidence, but they cannot prove absolute correctness or complete security. Completion therefore means that the explicit functional, security, performance, role, browser, and tutorial gates in this document pass with no unresolved release blocker.

## Confirmed decisions

- Capacity means at least 10,000 distinct customers per month, not 10,000 concurrent users.
- The Step 7 customer migration has been created and applied by the user.
- RBAC catalog version 11 has been seeded by the user.
- Historical orders will not be backfilled into `EcommerceCustomer` during Step 8. A backfill requires a separate proposal and explicit approval.
- E2E tests use the real password signup and password login screens.
- E2E state is isolated in disposable PostgreSQL and Redis services and a local SMTP catcher.
- Capacity work uses a repeatable local baseline and a final production-like staging run.
- Tutorials use a central admin library plus contextual links from the relevant admin pages.
- Every tutorial requires a written guide, WebVTT subtitles, and narration script. Generated voice is optional.
- Test identities and tutorial content are fictional and may never contain production credentials or personal data.

## Non-negotiable working agreement

Step 8 is implemented one approved substep at a time:

1. Inspect the current code related to the approved substep.
2. Implement only that substep.
3. Run only the checks that are safe and relevant to that substep.
4. Report changed files, behavior, test evidence, and anything not verified.
5. Stop for user review and explicit approval before starting the next substep.

The following actions remain user-controlled:

- starting application or example servers;
- starting or stopping Docker services;
- resetting or deleting a database or Redis data;
- applying migrations, running `prisma migrate`, or running `prisma db push`;
- running RBAC or application data seeds;
- executing load tests against any remote environment;
- running an active security scan against any remote environment;
- Git commands, commits, pushes, merges, tags, or releases.

Codex must never use the development or production database for E2E, security, performance, provisioning, or tutorial recording. A command that can destroy test data must validate all test-only guards before its first mutation.

## Progress and result ledger

Update this table at the end of every approved substep. A substep is not complete when code exists; its required verification and user-review gate must also be recorded.

| Substep | Status | Implementation evidence | Verification evidence | Findings/fixes | Limitations or next gate |
| --- | --- | --- | --- | --- | --- |
| 8.0 Documentation reconciliation | Completed; awaiting user review | This plan created; V2 progress status reconciled | Documentation inspected for matching status and links | Step 2 and Step 7 status corrected; stale Step 5 next action removed | No runtime, test, security, performance, or browser claims made |
| 8.1 Test infrastructure and personas | Implemented; awaiting user-controlled runtime gates and review | `docker-compose.e2e.yml`, guarded setup scripts, public fictional personas, Playwright setup/config, ignored artifacts | 9 focused Bun tests, Playwright discovery, Compose validation, web boundary check, typechecks, and production build passed | Server/web use the standard local ports `3000`/`3001`; reset intentionally refuses destructive mutation pending an approved exact workflow | Requires isolated services, disposable-database migrations/RBAC seed, real signup/provision/login session run, then user review |
| 8.2 Unit and integration coverage | Not started | — | — | — | Requires 8.1 completion and approval |
| 8.3 Playwright E2E | Not started | — | — | — | Requires 8.2 completion and permission to start isolated services |
| 8.4 Security hardening | Not started | — | — | — | Active scans require explicit target approval |
| 8.5 Performance and capacity | Not started | — | — | — | Remote load requires explicit staging approval |
| 8.6 Admin tutorials | Not started | — | — | — | Reuses approved E2E fixtures and workflows |
| 8.7 Final release audit | Not started | — | — | — | Requires every prior gate |

## Shared completion language

Use these terms consistently in progress reports:

- **Implemented**: code or documentation exists.
- **Statically verified**: typecheck, build, lint, or source-level checks passed.
- **Unit verified**: isolated/mocked tests passed.
- **Integration verified**: real PostgreSQL/Redis behavior passed in the isolated test environment.
- **Browser verified**: the named Playwright browser and viewport completed the named workflow.
- **Security verified**: the named regression suite and scan completed with reviewed findings.
- **Capacity verified**: the named workload passed on documented hardware with recorded thresholds.
- **Deployment verified**: the built application was exercised in the named deployed environment.

Never use one category as proof of another. For example, a successful build is not browser, deployment, security, persistence, or capacity proof.

---

## Step 8.0 — Documentation and release-state reconciliation

### Required work

- [x] Create this detailed Step 8 execution plan.
- [x] Record that 10,000 customers/month means distinct monthly customers, not concurrency.
- [x] Record the user's confirmation that the customer migration was applied.
- [x] Record the user's confirmation that the RBAC seed was run.
- [x] Record historical-customer backfill as deferred.
- [x] Correct the stale Step 2 status in the V2 overview.
- [x] Correct the Step 7 migration/RBAC status without claiming final review.
- [x] Replace the stale Step 5 next action with the Step 8 approval gate.
- [x] Link the high-level Step 8 section to this document.
- [x] Add the progress/result ledger above.

### Acceptance

- [x] The two Step 8 documents agree about current status.
- [x] No browser, runtime, security, performance, or release result is claimed.
- [x] User reviewed Step 8.0 and explicitly approved Step 8.1.

---

## Step 8.1 — Isolated test infrastructure and shared personas

### Outcome

Create a safe, deterministic test environment that supports real password signup/login, reusable role-aware browser sessions, security scanning, load testing, and tutorial recording without touching development or production data.

### Target layout

Create the following root structure:

```text
tests/
  users-config.ts
  env/
    .env (ignored; copied from e2e.env.example)
  setup/
    assert-test-environment.ts
    provision-users.ts
    reset-test-state.ts
  e2e/
    fixtures/
    setup/
    auth/
    ecommerce/
    admin/
    responsive/
  performance/
    fixtures/
    scenarios/
    reports/
  security/
    api/
    zap/
    reports/
  tutorials/
    manifests/
    workflows/
    scripts/
  artifacts/
```

`tests/artifacts/` and generated report directories must be ignored. Source manifests, scripts, security plans, and test specifications remain tracked.

### Dedicated services

Add a separate test Compose file. It must not reuse the development containers, ports, database, Redis namespace, or persistent volumes.

Required defaults:

- PostgreSQL 17 on host port `5433`.
- Database `ts_starter_e2e`.
- Redis 7 on host port `6380`.
- Redis prefix `ts-starter:e2e:`.
- Mailpit SMTP on host port `1025` and web UI on `8025`.
- Server on `3000` and web on `3001` when the user authorizes startup.
- `NODE_ENV=test`.
- `ENABLE_POLAR=false`.
- `OWNER_SETUP_CHECK=false` after the test provisioner owns owner creation.
- OAuth credentials use non-secret test placeholders because OAuth is outside this E2E suite.
- A dedicated test-only Better Auth secret of at least 32 characters.

Compose must use clearly E2E-named containers and volumes. It must not mount the development PostgreSQL or Redis volumes.

### Destructive-operation guard

`tests/setup/assert-test-environment.ts` is imported before any reset, fixture generation, user provisioning, performance seeding, or cleanup.

It must reject the operation unless all conditions are true:

- `NODE_ENV === "test"`;
- the parsed PostgreSQL database name is exactly `ts_starter_e2e` or ends with `_e2e`;
- the database URL is not the configured development/production URL;
- `REDIS_KEY_PREFIX` begins with `ts-starter:e2e:`;
- every configured test email ends with `.example.test`;
- the target host is local for the local workflow, unless a separate remote-test flag and URL were explicitly supplied by the user;
- no production-like hostname, database name, or Redis prefix is present.

The guard prints the resolved safe targets but must redact passwords and secrets. Failure terminates before the first write.

### Shared user contract

Create `tests/users-config.ts` with these public test-only identities:

| Key | Name | Email | Password | Expected role |
| --- | --- | --- | --- | --- |
| `owner` | Ayesha Rahman | `owner@northstar.example.test` | `OwnerFlow!2026#A` | `platform.owner` |
| `admin` | Tanvir Hasan | `admin@northstar.example.test` | `AdminFlow!2026#T` | `platform.admin` |
| `commerceManager` | Farhana Islam | `manager@northstar.example.test` | `ManagerFlow!2026#F` | `custom.ecommerce_manager` |
| `commerceViewer` | Arif Chowdhury | `viewer@northstar.example.test` | `ViewerFlow!2026#A` | `custom.ecommerce_viewer` |
| `user` | Nusrat Jahan | `user@northstar.example.test` | `CustomerFlow!2026#N` | `platform.user` |

Required exports:

```ts
export type TestUserKey =
  | "owner"
  | "admin"
  | "commerceManager"
  | "commerceViewer"
  | "user";

export type TestUser = {
  key: TestUserKey;
  name: string;
  email: `${string}@${string}.example.test`;
  password: string;
  roleSlug: string;
  storageStatePath: string;
};

export const TEST_USERS: Readonly<Record<TestUserKey, TestUser>>;
export function getTestUser(key: TestUserKey): TestUser;
export function assertTestUsersAreSafe(): void;
```

Also export fictional checkout/tutorial profiles without passwords:

- authenticated shopper: Nusrat Jahan, Dhaka address, Bangladeshi phone-format fixture;
- guest shopper: Samiha Ahmed, Chattogram address, separate email and phone;
- billing alternative: a second fictional Dhaka address.

The module must contain a prominent warning that the passwords are intentionally public test data. Application code under `apps/` and `packages/` must never import this module. Add a boundary check or source scan proving that restriction.

### Custom roles

Provision these idempotently in the isolated database:

`custom.ecommerce_manager`:

- `admin.access`;
- catalog, products, inventory, orders, shipping, discounts, store settings, customers, and images read/manage permissions;
- order fulfill, cancel, and refund permissions.

`custom.ecommerce_viewer`:

- `admin.access`;
- catalog, products, inventory, orders, shipping, discounts, store settings, customers, and images read permissions only.

Neither role receives user management, invitation management, role management, activity, visitor analytics, rate-limit management, webhook, owner-only, or mutation permissions outside ecommerce.

### Provisioning sequence

The full setup runs serially:

1. The user starts the dedicated PostgreSQL, Redis, and Mailpit services.
2. The user applies existing migrations to the disposable E2E database.
3. The user runs the RBAC seed against the disposable E2E database.
4. The user authorizes starting the server and web application with the test environment.
5. Playwright visits `/signup` and submits the real password form once for every configured user.
6. Assert that Mailpit accepted the verification messages and no external SMTP host was contacted.
7. Assert an unverified account cannot complete password login.
8. The guarded provisioner marks only the configured `.example.test` accounts verified.
9. The provisioner creates/updates the two custom roles with the exact permissions above.
10. The provisioner assigns the five expected roles, using the existing owner-assignment escape hatch only under the test guard.
11. Invalidate affected user/role RBAC caches.
12. Playwright logs in through `/login` for each user and saves one storage state per identity.
13. Query the public session surface and assert the expected user, primary role, and effective permissions.
14. Redact cookies, passwords, tokens, and verification URLs from logs and reports.

The setup is safe to retry: existing known accounts are recognized, role definitions converge to the declared permissions, and unknown accounts are never modified.

### Target scripts

Add root scripts with these stable names during implementation:

- `test:e2e:guard` — print/redact targets and perform no mutation.
- `test:e2e:provision` — guarded user/role provisioning after signup.
- `test:e2e:setup` — Playwright signup/login/storage-state setup.
- `test:e2e` — complete browser suite.
- `test:e2e:auth` — password-authentication project only.

Do not make `test:e2e` silently reset a database. Reset remains a distinct, conspicuously named user-run command.

### Verification and acceptance

- [x] Test Compose configuration is isolated from development services (static Compose validation only; services not started).
- [x] Guard unit tests pass for the E2E environment and fail for development/production-shaped targets.
- [ ] All five users sign up through the actual UI.
- [ ] Mail is captured locally.
- [ ] All five users log in through the actual UI after provisioning.
- [ ] Each session has the exact intended role and permissions.
- [ ] Viewer and ordinary user cannot gain mutation permissions.
- [x] Source boundary test confirms application packages do not import test credentials/setup modules.
- [x] Generated auth states, traces, videos, screenshots, and reports are ignored; runtime artifact redaction remains to be verified.
- [x] Focused setup tests, Playwright discovery, affected workspace typechecks, web boundary check, Compose validation, and production build pass.
- [ ] User reviews and approves Step 8.1 before Step 8.2.

---

## Step 8.2 — Unit and real-database integration coverage

### Outcome

Build a layered suite that proves business rules in isolation and then proves database constraints, transactions, and races against real PostgreSQL. Mocked unit tests remain fast; they are not treated as transaction or persistence proof.

### Test layers

1. **Pure unit tests**: normalization, calculations, state rules, DTO helpers, mappers, and permission helpers.
2. **Mocked service/controller tests**: orchestration, expected Prisma calls, error mapping, and route guards.
3. **Real-database integration tests**: unique constraints, transactions, rollbacks, concurrency, relations, and aggregate query correctness.
4. **Coverage report**: branch coverage is the release metric; line coverage alone is insufficient.

### Required customer coverage

- normalized lower-case/trimmed email identity;
- guest and signed-in checkout linking to one email identity;
- no merge by name or phone;
- duplicate normalized email conflict handling;
- safe authenticated-user relation updates;
- concurrent upsert behavior;
- customer list search and pagination boundaries;
- contact correction and empty-to-null normalization;
- private note length, trimming, visibility, and permission protection;
- latest shipping/billing address selection;
- completed-spend inclusion/exclusion matrix;
- partial/full refund subtraction without negative spend;
- explicit behavior for orders with different currencies;
- customer detail order-history pagination introduced before large-data verification.

Mixed currencies must not be silently summed into one number. The implementation must either return totals grouped by currency or clearly reject/omit an ambiguous combined total; document the selected API shape and update UI/tests together.

### Required settings, shipping, and discount coverage

- settings singleton creation and safe defaults;
- currency, prefix, reservation duration, email/phone, checkout notice, and checkout-disabled validation;
- cache invalidation after settings changes;
- one active default shipping rate per currency;
- disabling/replacing defaults and free-shipping thresholds;
- inactive and currency-mismatched rate rejection at checkout;
- discount code normalization and uniqueness;
- percentage/fixed calculations and money precision;
- start/end boundaries, minimum amount, currency, total limit, and per-customer limit;
- concurrent redemption cannot cross a limit;
- rollback leaves no redemption or partial order.

### Required catalog, inventory, checkout, and order coverage

- product draft versus active validation;
- category template scope and variant-defining rules;
- SKU/barcode uniqueness and generated SKU behavior;
- maximum arrays for variants, highlights, media, keywords, and attribute values;
- malformed, negative, excessive, or non-finite numeric inputs;
- stock receipt, adjustment, reservation, commit, release, restock, and expiry;
- insufficient stock and concurrent last-item purchase;
- checkout idempotency races and duplicate submission;
- invalid/inactive products, variants, rates, settings, and discounts;
- complete transaction rollback at every failure boundary;
- fulfillment/tracking transition rules and audit metadata;
- cancellation/refund limits, repeated requests, and inventory idempotency;
- controller authentication and exact action permission for every mutation.

### Role matrix

Every ecommerce controller is checked as:

- owner: allowed for all actions;
- platform admin: allowed for intended default ecommerce actions but not role-management exclusions;
- ecommerce manager: allowed for declared ecommerce actions only;
- ecommerce viewer: read allowed, every mutation denied;
- platform user: admin endpoints denied;
- unauthenticated: protected endpoints denied.

### Coverage gates

- Critical ecommerce services: at least 90% branch coverage.
- All Step 0–7 ecommerce modules: at least 80% branch coverage.
- Every sensitive mutation: success, invalid input, permission denial, transaction rollback, and repeated-request case.
- Complete Bun suite passes twice from a clean isolated test state.
- Test failures are fixed in the smallest owning module; do not weaken assertions to make the suite pass.

### Acceptance

- [ ] Customer and settings gaps are covered.
- [ ] Existing shipping/discount suites cover negative and concurrency cases.
- [ ] Real PostgreSQL tests prove constraints, rollback, and races.
- [ ] Role matrix is complete.
- [ ] Coverage thresholds pass and reports are retained as artifacts.
- [ ] Two clean runs pass with exact counts recorded in the result ledger.
- [ ] User reviews and approves Step 8.2 before Step 8.3.

---

## Step 8.3 — Playwright end-to-end verification

### Configuration

Use Playwright Test in the root test workspace. Configure:

- Chromium full functional matrix;
- Firefox and WebKit critical smoke flows;
- mobile around 390 px, tablet around 768 px, and desktop around 1440 px;
- trace on first retry;
- screenshots and video retained on failure;
- HTML and machine-readable reports under ignored artifact directories;
- serial account/setup project followed by dependent role-aware projects;
- saved authentication state per configured user;
- stable accessible roles, labels, visible text, and deliberate `data-testid` only when semantic selectors cannot be reliable.

Retries must not hide flakes. A test that passes only on retry is reported as flaky and fixed before release.

### Required workflows

#### Authentication

- password signup through UI;
- verification message captured locally;
- unverified login rejected;
- verified login succeeds;
- invalid password fails without account enumeration;
- logout revokes the browser session;
- saved session restores the correct identity;
- expired/revoked session redirects safely;
- password method disabled behavior is clear.

#### Commerce lifecycle

1. Owner configures store settings and shipping.
2. Manager creates category, attributes, category template, and brand.
3. Manager creates a draft product, highlights, variants, and media.
4. Invalid activation is rejected; valid product is published.
5. Manager receives stock and performs a valid adjustment.
6. Manager creates a discount.
7. Guest browses, filters, adds to cart, applies discount, and checks out.
8. Authenticated shopper completes a second checkout.
9. Admin finds the resulting customer and linked order.
10. Admin corrects customer contact data and saves a private note.
11. Manager/admin confirms, ships, corrects tracking, and delivers a valid order.
12. Separate orders prove cancellation, partial refund, full refund, and rejected repeated actions.
13. UI and direct API results show the correct inventory, discount, refund, customer, and timeline effects.

#### Administration and RBAC

- owner creates/edits a custom role through UI;
- owner invites or assigns a user through the supported flow;
- platform admin cannot access owner-only role management;
- ecommerce manager sees only permitted admin navigation/actions;
- ecommerce viewer sees read surfaces and no mutation controls;
- direct mutation requests from viewer/user/guest are rejected server-side;
- users, roles, customers, visitors, activity, feedback, images, rate limits, and webhooks receive appropriate smoke coverage.

#### Responsive behavior

For every ecommerce admin route at mobile, tablet, and desktop:

- no horizontal page overflow;
- primary actions remain reachable;
- tables have cards, scroll containers, or deliberate narrow layouts;
- dialogs/sheets fit the viewport and scroll internally;
- navigation opens/closes and active state is correct;
- focus is visible and keyboard traversal reaches controls;
- empty, loading, error, and populated states remain readable.

### Assertion rules

- Do not pass a workflow based only on a toast.
- Confirm the changed state after reload through public UI or API.
- For money/inventory operations, confirm timeline and resulting totals/stock.
- Do not query the database directly from normal E2E assertions. Direct database access is limited to guarded setup/cleanup and diagnostic verification helpers.

### Acceptance

- [ ] Chromium full suite passes.
- [ ] Firefox/WebKit critical smoke passes.
- [ ] Mobile/tablet/desktop matrix passes.
- [ ] Role and direct-API denial matrix passes.
- [ ] No unresolved flake, console error, hydration error, or failed request remains.
- [ ] User reviews and approves Step 8.3 before Step 8.4.

---

## Step 8.4 — Security tests and hardening

### Method

Combine source review, targeted regression tests, authenticated browser/API probes, dependency checks, secret scans, and an OWASP ZAP automation plan. ZAP and abuse tests run only against the isolated local environment unless the user explicitly approves a staging target.

### Input and injection matrix

Test SQL metacharacters, comment syntax, Unicode, encoded payloads, null bytes, path-like values, HTML/SVG/script payloads, protocol URLs, and extremely long values in:

- IDs and route parameters;
- search/filter/sort/date query parameters;
- names, emails, phones, addresses, notes, descriptions, tracking, SKU/barcode, and discount codes;
- product HTML/media/URLs and uploaded filenames/metadata;
- checkout items, quantities, prices exposed by clients, and idempotency keys;
- login, signup, verification, reset, invitation, and two-factor inputs.

Prisma parameterization reduces SQL-injection risk but does not replace hostile-input tests. Every raw SQL use must be separately inspected for parameter binding.

### Required hardening

- Add explicit maximum lengths to every public/admin string DTO.
- Add maximum counts to arrays such as checkout items, variants, attributes, media, highlights, addresses, and keywords.
- Add a request-body limit that rejects excessive bodies before expensive business work and returns `413`.
- Enforce upload type, size, extension/content agreement, and safe filename handling.
- Ensure stored rich HTML is sanitized at a documented trust boundary or rendered as text.
- Validate external URLs and disallow dangerous protocols.
- Return stable public errors without stack, SQL, secret, or internal-path disclosure.
- Verify API and web security headers separately; expand CSP beyond frame protection without breaking required assets.

### Authentication and session coverage

- password lengths 7, 8, 128, 129, and a very large password;
- signup/login/reset enumeration resistance;
- verification and reset token expiry/replay;
- invitation identity, expiry, and replay;
- cookie `HttpOnly`, `Secure` in production, and intended `SameSite` behavior;
- trusted origins, CORS credentials, CSRF behavior, and cross-origin rejection;
- password reset session revocation;
- logout and admin session-revoke behavior;
- repeated two-factor attempts and resend throttling;
- disabled authentication method enforcement on both UI and direct API.

### Authorization and abuse coverage

- IDOR probes for orders, customers, inventory, images, users, roles, activity, visitors, and webhooks;
- hidden-button bypass through direct API calls;
- role mutation/grant escalation;
- owner invariants;
- rate-limit `429`, headers, reset/recovery, user/IP separation, proxy spoofing, Redis failure, and websocket behavior;
- login floods, signup floods, search abuse, checkout floods, and idempotency-key abuse;
- concurrent stock, discount, cancellation, refund, and restock abuse.

### Automated scans

- Configure ZAP with public and authenticated contexts.
- Exclude logout/destructive endpoints from spidering when required, then cover them with targeted tests.
- Use explicit allowed target URLs.
- Fail on high/critical alerts.
- Review every medium alert; suppress only with an inline reason and evidence.
- Store sanitized HTML/JSON reports as artifacts.
- Run dependency vulnerability checks and a repository secret scan without printing discovered secret values.

### Acceptance

- [ ] Zero unresolved critical/high finding.
- [ ] No RBAC/IDOR finding remains.
- [ ] Medium findings are fixed or explicitly accepted with evidence.
- [ ] ZAP plan exits successfully with reviewed exclusions.
- [ ] Security fixes have regression tests.
- [ ] No secret value appears in reports or logs.
- [ ] User reviews and approves Step 8.4 before Step 8.5.

---

## Step 8.5 — Performance and 10,000-customer capacity

### Meaning of the target

The target is a monthly business volume, not concurrency. The test proves adequate headroom by combining realistic data volume with sustained and peak request rates far above the evenly distributed monthly average. Results are valid only for the documented application version and infrastructure.

### Dataset

Generate deterministic, isolated performance data:

- 10,000 ecommerce customers;
- 25,000 orders with addresses, line items, status events, discounts, and representative refunds;
- 1,000 products and approximately 3,000 active/draft variants;
- multiple inventory locations, batches, movements, and reservations;
- enough visitor/activity rows to exercise admin analytics;
- stable IDs or lookup keys needed by k6 scenarios.

The generator imports the destructive-operation guard, batches writes, reports counts, and is idempotent or requires an explicitly empty test database. It is never part of normal application seeding.

### k6 scenarios

- **Smoke**: one public browse/product/cart/checkout journey and one authenticated admin read journey.
- **Expected load**: 25 public requests/second, 2 admin requests/second, and 1 checkout/second for 15 minutes.
- **Peak**: 100 public requests/second and 5 checkouts/second for 2 minutes.
- **Soak**: 10 public requests/second and 0.2 checkouts/second for 60 minutes.
- **Data-volume**: customer, order, product, inventory, visitor, and activity list/detail/search operations against the full dataset.

Use protocol-level requests for most load. Use browser measurements only for a small representative user-experience sample so the load generator is not the bottleneck.

### Thresholds

- unexpected HTTP failures below 1%; expected validation/authorization rejections are tracked separately;
- public catalog/search p95 below 500 ms;
- admin list/detail p95 below 750 ms;
- checkout p95 below 1.5 seconds and p99 below 3 seconds;
- zero dropped expected-load iterations;
- zero oversold stock, duplicate checkout key, overused discount, negative stock, or inconsistent refund;
- stable memory and connection counts during soak;
- no sustained database/Redis saturation or transaction-error growth.

### Measurement and optimization loop

1. Record unoptimized baseline, hardware, database settings, dataset version, and application version.
2. Inspect slow endpoints, query count, query plans, response sizes, CPU, memory, PostgreSQL connections, locks, and Redis latency.
3. Change only a measured bottleneck.
4. Add correctness regression coverage for the changed behavior.
5. Rerun the identical scenario.
6. Record before/after evidence and reject changes that trade correctness for speed.

Initial profiling candidates, not pre-approved fixes:

- customer list spend calculation loading qualifying orders per visible customer;
- customer detail loading complete orders/addresses without pagination;
- storefront facet generation loading every matching product graph;
- case-insensitive substring search and index usefulness;
- rate-limit config retrieval coupled to blocked-request statistics;
- large product/order response graphs;
- sequential transaction loops in checkout/inventory operations;
- PostgreSQL/Redis connection and cache behavior.

Any index, extension, materialized value, or schema change stops at the schema gate. Codex reports the exact change and asks the user to create/apply the migration.

### Staging confirmation

After local thresholds pass:

- document staging compute, PostgreSQL, Redis, proxy, network, and connection-pool configuration;
- obtain explicit approval for the staging URL, schedule, and maximum load;
- confirm no production hostname or production database is targeted;
- use isolated staging test identities/data and a cleanup plan;
- run the same thresholds and retain the report;
- do not claim production capacity from the local run alone.

### Acceptance

- [ ] Full data-volume suite passes locally.
- [ ] Smoke, expected, peak, and soak thresholds pass locally.
- [ ] Correctness invariants pass after load.
- [ ] Measured bottlenecks and before/after results are documented.
- [ ] Approved staging run passes on documented infrastructure.
- [ ] The 10,000-distinct-customers/month claim is limited to the tested deployment shape.
- [ ] User reviews and approves Step 8.5 before Step 8.6.

---

## Step 8.6 — Admin tutorial system

### Product behavior

Add an authenticated `/admin/tutorials` route with a searchable, category-filtered tutorial library. Add contextual Help links on the relevant admin screens. Tutorial visibility follows the same permissions as the feature it teaches.

V1 tutorial content is versioned static application content. Do not add a database model or migration. Optional completion state may use local storage and must not gate admin functionality.

### Internal contract

Define a `TutorialManifest` with:

```ts
type TutorialManifest = {
  id: string;
  version: number;
  title: string;
  summary: string;
  category: "getting-started" | "commerce" | "administration" | "operations";
  estimatedMinutes: number;
  requiredPermissions: string[];
  relatedRoutes: string[];
  steps: Array<{ title: string; description: string }>;
  assets: {
    video: string;
    poster: string;
    captions: string;
    transcript: string;
    narration: string;
    audio?: string;
  };
  workflowId: string;
  lastVerifiedAt: string;
};
```

Validate manifests at build/test time. Missing assets, duplicate IDs, invalid routes, missing permissions, or stale workflow IDs fail verification.

### Tutorial catalog

Create these tutorials:

1. Admin overview and navigation.
2. Store settings.
3. Categories, attributes, templates, and brands.
4. Creating and publishing a product.
5. Variants, pricing, media, and highlights.
6. Receiving and adjusting inventory.
7. Shipping rates.
8. Discount codes.
9. Storefront checkout and order creation.
10. Order confirmation, shipping, tracking, and delivery.
11. Cancellation and manual refunds.
12. Customer profiles, order history, and private notes.
13. Users and invitations.
14. Roles and permissions.
15. Visitors and activity.
16. Images, feedback, rate limits, and webhooks.

Each tutorial must state prerequisites, required role/permission, goal, ordered steps, expected result, common mistakes, and related tutorials.

### Deterministic recording pipeline

- Reuse the shared fictional users and deterministic ecommerce fixtures.
- Use dedicated Playwright tutorial workflows, separate from failure-diagnostic E2E recordings.
- Record at a fixed desktop viewport with fixed theme, reduced animation, deterministic clock where needed, and clean notification state.
- Use named `test.step` sections that match the manifest steps.
- Never show credentials, tokens, email verification URLs, developer tools, test setup, or destructive commands.
- Close/reset menus, dialogs, and transient state before each segment.
- Record successful final behavior only.

Generate:

- optimized MP4 or WebM video;
- poster/thumbnail image;
- WebVTT captions;
- Markdown written guide/transcript;
- plain-text narration script;
- optional audio path that can later receive user-generated narration.

Use `ffmpeg` for normalization, compression, poster extraction, subtitle embedding when desired, and optional audio muxing. The source narration script remains authoritative so audio can be regenerated after copy changes.

### UI and accessibility

- Filter out tutorials whose required permissions the current user lacks.
- Contextual Help links open the exact relevant tutorial.
- Video controls are keyboard accessible.
- Captions are available and enabled through the player.
- The full transcript is readable without playing video.
- Layout works on mobile, tablet, and desktop.
- Dark/light themes preserve contrast.
- Missing optional audio falls back to video plus captions/transcript without error.

### Drift prevention

Tutorial verification fails when:

- workflow selectors or expected results no longer match;
- a related route or permission disappears;
- a required asset is missing;
- manifest steps and Playwright step IDs diverge;
- `lastVerifiedAt` is not updated after a regenerated workflow.

### Acceptance

- [ ] All 16 manifests validate.
- [ ] Permission filtering is correct for owner/admin/manager/viewer/user.
- [ ] Every tutorial has video, poster, captions, transcript, and narration script.
- [ ] Contextual links resolve correctly.
- [ ] Every recording workflow passes current behavior.
- [ ] Playback/accessibility/responsive checks pass.
- [ ] User reviews and approves Step 8.6 before Step 8.7.

---

## Step 8.7 — Final release audit

### Required verification

Record exact commands, dates, environments, pass counts, and artifact paths for:

- repository-pinned Prisma format/validate/generate as applicable;
- database package and server TypeScript checks;
- complete Bun tests and coverage thresholds;
- web boundary check and production build;
- Playwright browser, viewport, lifecycle, and role matrix;
- security regressions, dependency/secret checks, and ZAP report;
- local k6 smoke/expected/peak/soak/data-volume runs;
- approved staging capacity run;
- tutorial manifest, workflow, asset, playback, and accessibility checks;
- final responsive and RBAC review;
- final documentation synchronization.

Run the final automated suite twice from clean isolated test state. A second pass does not replace investigation of a flaky first pass.

### Documentation synchronization

Update at minimum:

- `docs/ecommerce-todo-progress-v2.md`;
- `docs/ecommerce-todo-progress.md`;
- `docs/ecommerce-prisma.md`;
- `docs/ecommerce-flows.md`;
- this result ledger;
- test/security/performance/tutorial runbooks introduced by Step 8.

Remove stale claims and document deferred features, operational prerequisites, tested browsers, tested infrastructure, and limitations.

### Final completion checklist

- [ ] Every Step 8 substep was separately reviewed and approved.
- [ ] No unresolved release-blocking correctness, security, RBAC, or data-integrity finding remains.
- [ ] All required automated suites pass twice from clean test state.
- [ ] Real browser workflows pass for the named browsers and viewports.
- [ ] Local and production-like staging capacity evidence passes.
- [ ] Tutorials match the final UI and all required assets exist.
- [ ] No unapproved migration, seed, reset, server start, remote scan, or load test occurred.
- [ ] Deferred features are explicitly listed and are not implied to exist.
- [ ] Build success is not presented as browser, runtime, deployment, security, or capacity proof.
- [ ] User performs the final completion review.

## Explicitly deferred from Step 8

- historical order-to-customer backfill;
- payment-gateway authorization/capture/refund integration;
- courier label purchasing or courier API integration;
- partial line-item fulfillment;
- customer returns/RMA portal;
- advanced promotion/tax/accounting engines;
- customer segmentation and enterprise analytics;
- production load or active security testing without separate explicit approval.
