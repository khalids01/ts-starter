# Ecommerce admin todo and progress V2

Last reviewed: 2026-09-20

Status: Steps 0-6 completed through the required migration/RBAC gates. Step 7 implementation, migration, and RBAC seed are complete; historical-order backfill is deferred and final review remains. Step 8.1 test-infrastructure code is implemented and statically/unit verified; runtime and review gates remain.

## Goal

Finish the ecommerce admin as a practical, maintainable starter without turning it into an enterprise commerce platform.

The admin will be considered complete when an authorized operator can:

- configure the store and shipping methods;
- manage the catalog, products, inventory, and customers;
- create and manage discount codes;
- fulfill, cancel, and record refunds for orders with correct inventory side effects;
- understand every sensitive action through order history and RBAC;
- use every workflow on mobile, tablet, and desktop.

The following are deliberately outside V2: payment-gateway integration, courier label purchasing, partial line-item fulfillment, a customer returns portal/RMA system, advanced promotion engines, tax-provider integration, accounting reconciliation, customer segmentation, and advanced analytics.

## Working agreement

V2 is implemented one step at a time.

For every step:

1. Implement only the approved step.
2. Run focused tests, TypeScript checks, Prisma generation when relevant, and the web build.
3. Report changed files, behavior, RBAC changes, schema changes, and anything not runtime-verified.
4. If permissions changed, stop and ask the user to seed RBAC permissions.
5. If Prisma models changed, stop and ask the user to create/apply the migration.
6. The user reviews the result and may request fixes, updates, or upgrades.
7. The user commits the approved step.
8. Continue only after the user explicitly approves the next step.

Codex must not create migration SQL, run `prisma migrate`, run `prisma db push`, seed the database, or start an app/server. Codex may run `prisma generate` after schema changes.

## Engineering rules

- Keep code focused, modular, and readable. Do not add abstractions until at least two real responsibilities need them.
- Follow the existing repository structure and naming conventions before introducing new patterns.
- Web feature code belongs under `apps/web/src/features/`; route files under `apps/web/src/routes/` should remain thin imports and route guards.
- Admin-only server behavior belongs under `apps/server/src/modules/admin/`.
- Business behavior shared by admin, checkout, storefront, or jobs belongs under a non-admin module such as `apps/server/src/modules/ecommerce/`; admin controllers may call those shared services.
- Controllers own HTTP routing, DTO validation, authentication, and RBAC guards. Services own business rules and transactions. Split helpers/mappers when they have a distinct responsibility.
- Avoid large files. Prefer small files organized by feature responsibility rather than generic utility folders.
- Use existing shadcn/Base UI components. Add a shared component under `apps/web/src/components/ui/` only when no suitable component exists.
- Every new or changed screen must work at mobile, tablet, and desktop widths. Tables must have a deliberate narrow-screen treatment.
- Read permissions protect pages and GET endpoints. Action-specific permissions protect every mutation. Hiding a button is not authorization; server guards are mandatory.
- Platform owner receives every permission. Platform admin receives new ecommerce permissions by default except explicitly owner-only security/role operations already excluded by the RBAC map. Custom roles can be narrower.
- Mutations that alter order money, fulfillment, refund, discount usage, or inventory must be transactional and auditable.
- Preserve existing APIs unless a changed contract is necessary and documented.

## Prisma organization

The project already configures Prisma with `schema: prisma/schema`, so multi-file Prisma schemas are supported. Keep schema files flat inside `packages/db/prisma/schema/`; do not add nested schema directories unless Prisma generation is first proven to load them correctly.

Split the current `ecommerce.prisma` by domain without changing table mappings:

- `ecommerce-catalog.prisma`: categories, brands, products, attributes, values, category templates, variants, highlights.
- `ecommerce-inventory.prisma`: suppliers, locations, batches, stock, movements, reservations, batch attributes.
- `ecommerce-cart.prisma`: carts and cart items.
- `ecommerce-orders.prisma`: orders, addresses, line items, status events, fulfillment/refund records.
- `ecommerce-shipping.prisma`: shipping rates and shipping configuration.
- `ecommerce-discounts.prisma`: discount codes and redemptions.
- `ecommerce-settings.prisma`: editable store settings.
- `ecommerce-customers.prisma`: ecommerce customer profiles and admin notes.

Cross-file Prisma relations remain normal Prisma relations. Moving an unchanged model between schema files is organizational only and must not produce database changes.

## RBAC design

Use action-specific permissions so custom roles can be safe without complicating the default owner/admin roles.

Planned permissions:

- `admin.shipping.read`
- `admin.shipping.manage`
- `admin.orders.fulfill`
- `admin.orders.cancel`
- `admin.orders.refund`
- `admin.discounts.read`
- `admin.discounts.manage`
- `admin.store_settings.read`
- `admin.store_settings.manage`
- `admin.customers.read`
- `admin.customers.manage`

Existing `admin.orders.read` and `admin.orders.manage` continue to cover general order viewing and editable contact/status information. Sensitive fulfillment, cancellation, and refund endpoints require their dedicated action permission in addition to `admin.access`.

Permission implementation must update:

- `packages/rbac/src/permissions.ts`
- `packages/rbac/src/maps.ts` only if a new owner/admin exclusion is intentionally required
- `packages/db/prisma/seed/rbac.ts`, including its catalog version and ecommerce permission list
- server endpoint guards
- web route access, nav visibility, and action visibility
- focused RBAC tests

After every step that introduces permissions, the user runs the RBAC seed. Codex must wait for confirmation before runtime verification that depends on those permissions.

## Progress overview

| Step | Work | Status | Schema change | Permission seed |
| --- | --- | --- | --- | --- |
| 0 | Split ecommerce Prisma schema by domain | Completed | Organizational only | No |
| 1 | Final catalog attribute schema cleanup | Completed | Yes | No |
| 2 | Shipping-rate management | Completed through migration/RBAC gates | Adds shipping-rate currency | Yes |
| 3 | Order fulfillment and tracking | Completed through migration/RBAC gates | Yes | Yes |
| 4 | Cancellation and refund workflow | Completed through migration/RBAC gates | Yes | Yes |
| 5 | Basic discount codes | Completed through migration/RBAC gates | Yes | Yes |
| 6 | Store settings | Completed through migration/RBAC gates | Yes | Yes |
| 7 | Customer view | Implementation, migration, and permission seed complete; backfill deferred; final review required | Yes | Yes |
| 8 | Final admin completion verification | Step 8.1 infrastructure/personas implemented; awaiting isolated runtime gates and review before Step 8.2 | No confirmed schema change | No confirmed new seed |

## Step 0 — Split the ecommerce Prisma schema

Purpose: make future ecommerce schema work understandable before adding more models.

Scope:

- Move existing enums/models from `ecommerce.prisma` into the domain files listed above.
- Initially create only files needed for existing models; later steps add the new domain files when their models are introduced.
- Preserve every model, enum, field, relation, index, unique constraint, and `@@map` exactly.
- Remove the old `ecommerce.prisma` only after all contents have moved.
- Run `prisma format`, `prisma validate`, and `prisma generate`.
- Confirm Prisma reports no schema errors.

Database gate: no migration should be required. If Prisma produces a database diff from moving files only, stop and investigate before continuing.

Acceptance:

- Generated client succeeds.
- Server typecheck and focused ecommerce tests pass.
- No semantic code or database changes are mixed into this step.
- User reviews and commits before Step 1.

## Step 1 — Final catalog attribute schema cleanup

Purpose: make `CategoryAttribute` the only source of contextual variant behavior.

Scope:

- Remove `ProductAttribute.variantDefining` and its index from Prisma.
- Keep `CategoryAttribute.variantDefining` and enforce that it is valid only when `scope === "variant"`.
- Confirm create/update DTOs and API responses no longer expose the global field.
- Preserve the explicit many-to-many relationship:

  `Category <-> CategoryAttribute <-> ProductAttribute`

- Retain active-variant required-value validation and unique variant-defining combination validation.
- Add regression tests for product, variant, and batch scopes.
- Review global `ProductAttribute.filterable`; document its current meaning as a default for direct product-category assignment. Do not remove it in this step unless separately approved.

Database gate: yes. After schema code and generation pass, Codex tells the user to create/apply a migration such as `remove_product_attribute_variant_defining`. Codex does not create the migration SQL.

Acceptance:

- No global variant-defining UI, DTO, response, or service write remains.
- Non-variant category fields cannot become variant defining.
- Existing catalog/product tests, server typecheck, and web build pass.
- User applies the migration, reviews, and commits before Step 2.

## Step 2 — Shipping-rate management

Purpose: let an admin configure the shipping rates already consumed by checkout.

Minimum data and behavior:

- Name, code, flat amount, currency, active state, default state, sort order.
- Optional minimum order amount for free shipping.
- Exactly one active default per currency, enforced transactionally.
- Disabling the current default requires selecting another active default or an explicit safe server rule.
- Orders keep their existing shipping method/amount snapshots; editing a rate never rewrites old orders.

Suggested structure:

- Shared service/DTO/mapper under `apps/server/src/modules/ecommerce/shipping/` because checkout also consumes shipping behavior.
- Thin admin controller under `apps/server/src/modules/admin/shipping/` if that best matches route registration.
- Admin feature under `apps/web/src/features/admin/ecommerce/shipping/`.
- Thin route under `apps/web/src/routes/admin/` and permission-aware nav entry.

RBAC:

- Read: `admin.shipping.read`.
- Create/update/disable/default: `admin.shipping.manage`.
- Owner and platform admin receive both by default.

Database gate: likely yes if free-shipping threshold or default uniqueness support requires schema changes. Codex reports the exact schema delta; the user creates/applies the migration.

Permission gate: user runs the RBAC seed after permission code is ready.

Responsive UI:

- Mobile cards or stacked rows with primary rate information and an actions menu.
- Tablet/desktop table with active/default badges and edit/disable actions.
- shadcn dialog/form controls with clear currency and amount labels.

Acceptance:

- Admin can list, create, edit, disable, and choose a default rate.
- Checkout continues to use only active rates and calculates the free-shipping threshold server-side.
- Unauthorized users cannot access endpoints or actions.
- Historical orders remain unchanged.
- User reviews and commits before Step 3.

## Step 3 — Order fulfillment and tracking

Purpose: turn delivery status into an auditable operational workflow.

Minimum data and behavior:

- Order-level carrier, tracking number, fulfillment note, shipped timestamp, and delivered timestamp.
- `mark shipped` requires a committed/reservable order state and records a status event.
- `mark delivered` requires shipped state and records a status event.
- Tracking values can be corrected with an audit event.
- No partial line-item fulfillment in V2.

Suggested structure:

- Fulfillment helpers/service split from the existing large order service under `apps/server/src/modules/admin/orders/` unless storefront tracking also needs the shared mapper; shared tracking reads can live under `apps/server/src/modules/ecommerce/orders/`.
- Focused admin UI components under `apps/web/src/features/admin/ecommerce/orders/`, not inside one growing detail-page file.

RBAC:

- View remains `admin.orders.read`.
- Fulfillment mutations require `admin.orders.fulfill`.
- Owner and platform admin receive it by default.

Database gate: yes. The user creates/applies the fulfillment-field/model migration after Codex finishes schema code and generation.

Permission gate: user runs the RBAC seed.

Acceptance:

- Valid transitions succeed and invalid transitions are rejected by the server.
- Tracking details appear in admin order detail and customer tracking where appropriate.
- Every change produces a timeline event with actor and note/metadata.
- Mobile, tablet, and desktop layouts remain usable.
- User reviews and commits before Step 4.

## Step 4 — Cancellation and refund workflow

Purpose: support the minimum safe after-order operations without building a full RMA platform.

Cancellation:

- Cancel only when the order is not delivered and has not already been cancelled.
- Release reserved inventory or restock committed inventory exactly once.
- Record actor, reason, timestamp, previous state, and inventory side effect.
- Make repeated cancellation requests idempotent or reject them without repeating stock movement.

Refunds:

- Record full or partial refund amount, reason, note, actor, and timestamp.
- Validate cumulative refund amount never exceeds the paid/order total.
- Update payment status to `partially_refunded` or `refunded` transactionally.
- Treat this as a manual refund record; no payment-gateway money movement is claimed.
- Restocking is an explicit operator choice and must never happen twice.

Suggested schema:

- A small `OrderRefund` audit model rather than overwriting a single amount on `Order`.
- Existing status-event history remains the main order timeline.

RBAC:

- Cancellation requires `admin.orders.cancel`.
- Refund recording requires `admin.orders.refund`.
- General order editing does not imply either sensitive action.
- Owner and platform admin receive both by default; custom roles may omit refund access.

Database gate: yes. The user creates/applies the refund-model migration.

Permission gate: user runs the RBAC seed.

Acceptance:

- Inventory side effects are correct and tested for reserved, committed, released, restocked, and repeated requests.
- Refund totals and payment statuses cannot diverge.
- UI uses confirmation dialogs and clearly states that the refund is a manual record.
- Timeline shows cancellation/refund actor and reason.
- User reviews and commits before Step 5.

## Step 5 — Basic discount codes

Purpose: provide the smallest useful promotion system.

Minimum capability:

- Code, description, percentage or fixed-amount type, value, currency for fixed discounts, active state.
- Start/end dates, optional minimum order amount, optional total usage limit, and optional per-customer usage limit.
- Case-insensitive unique normalized code.
- Server-side checkout validation and calculation.
- Discount snapshot on the order so later code edits do not change history.
- Redemption creation in the same checkout transaction as the order.
- No stacking; one code per order in V2.

Suggested structure:

- Shared discount validation/calculation module under `apps/server/src/modules/ecommerce/discounts/`.
- Admin CRUD controller under the appropriate admin route module.
- Admin UI under `apps/web/src/features/admin/ecommerce/discounts/`.
- Small checkout input/result changes using the shared service.

RBAC:

- Read: `admin.discounts.read`.
- Create/update/disable: `admin.discounts.manage`.
- Owner and platform admin receive both by default.

Database gate: yes. The user creates/applies the discount and redemption migration.

Permission gate: user runs the RBAC seed.

Acceptance:

- Valid codes calculate deterministically on the server.
- Invalid, expired, inactive, over-limit, currency-mismatched, and below-minimum codes are rejected.
- Concurrent checkout cannot exceed a total usage limit.
- Old orders retain their original discount snapshot.
- Admin CRUD and checkout tests pass.
- User reviews and commits before Step 6.

## Step 6 — Store settings

Purpose: centralize the few store values that should not be hardcoded.

Minimum settings:

- Store name and support email/phone.
- Default currency.
- Order-number prefix.
- Reservation duration in minutes.
- Basic checkout enable/disable flag and optional checkout notice.

Keep one validated settings record. Avoid a generic key/value settings engine.

Suggested structure:

- Shared settings service/cache under `apps/server/src/modules/ecommerce/store-settings/` because checkout and order creation consume it.
- Admin feature under `apps/web/src/features/admin/ecommerce/store-settings/`.
- Split the form into logical cards rather than one large component.

RBAC:

- Read: `admin.store_settings.read`.
- Update: `admin.store_settings.manage`.
- Owner and platform admin receive both by default. If a future setting controls credentials or security, that setting must be owner-only and separated from this ecommerce form.

Database gate: yes. The user creates/applies the settings-model migration and then creates/seeds the singleton settings row through the approved repository seed path.

Permission gate: user runs the RBAC seed.

Acceptance:

- Checkout/order creation reads validated settings server-side with safe defaults.
- Invalid currency, order prefix, or reservation duration is rejected.
- Settings updates invalidate any cache used by checkout.
- Responsive form and RBAC behavior are verified.
- User reviews and commits before Step 7.

## Step 7 — Customer view

Purpose: give operators useful customer context without building a CRM.

Minimum capability:

- Customer list with search by name, email, or phone.
- Customer detail with contact details, latest addresses, order history, order count, and total completed spend.
- One internal admin note.
- Link from order detail to the customer view.
- Guest and signed-in orders are handled consistently by normalized email; do not merge customers automatically on ambiguous phone/name matches.

Suggested schema:

- A small `EcommerceCustomer` profile with normalized unique email, optional user relation, contact fields, and admin note.
- Checkout upserts the profile and relates new orders.
- Existing orders require a deliberate migration/backfill plan owned by the user; do not silently rewrite production data.

Suggested structure:

- Shared customer identity/upsert behavior under `apps/server/src/modules/ecommerce/customers/` because checkout consumes it.
- Admin query/update controller under the admin surface.
- Admin feature under `apps/web/src/features/admin/ecommerce/customers/` with thin routes.

RBAC:

- Read: `admin.customers.read`.
- Update admin note/contact corrections: `admin.customers.manage`.
- Owner and platform admin receive both by default.

Database gate: yes. The user creates/applies the customer relation migration and explicitly approves/runs any data backfill.

Permission gate: user runs the RBAC seed.

Acceptance:

- Customer totals use defined qualifying order/payment states and are tested.
- Email normalization prevents duplicate profiles while avoiding unsafe merges.
- Customer note is private to authorized admin users.
- Mobile view uses readable cards; tablet/desktop can use a table and detail layout.
- User reviews and commits before Step 8.

## Step 8 — Final admin completion verification

Purpose: prove the scoped V2 admin is complete without claiming unsupported capabilities.

The authoritative, approval-gated execution guide is [`docs/ecommerce-step-8-plan.md`](./ecommerce-step-8-plan.md). It expands Step 8 into isolated test infrastructure, unit/integration coverage, Playwright E2E, security hardening, performance/capacity verification, admin tutorials, and the final release audit.

Confirmed Step 8 assumptions:

- capacity means 10,000 distinct customers per month, not concurrent users;
- the Step 7 customer migration and RBAC seed have been run by the user;
- historical-order customer backfill is deferred unless separately approved;
- every Step 8 substep requires user review and explicit approval before the next begins.

Verification checklist:

- Run Prisma validate/generate.
- Run database package and server TypeScript checks.
- Run all ecommerce server tests, including RBAC denial cases and transaction/side-effect cases.
- Run the web production build.
- Run boundary checks already supported by the repo.
- With explicit permission to start services, run a browser smoke across mobile, tablet, and desktop widths.
- Test the lifecycle: configure settings/rate -> create discount -> create product/stock -> checkout -> customer view -> fulfill -> refund/cancel where valid.
- Confirm platform owner sees all actions, platform admin receives intended defaults, read-only/custom roles cannot mutate, and direct API requests are rejected without permission.
- Update `docs/ecommerce-todo-progress.md`, `docs/ecommerce-prisma.md`, and `docs/ecommerce-flows.md` to match the final implementation.

Completion means all V2 acceptance criteria pass and remaining deferred features are explicitly documented. It does not mean payment gateways, courier integrations, advanced returns, tax engines, or enterprise analytics exist.

## Current next action

User: review the Step 8.1 implementation in [`docs/ecommerce-step-8-plan.md`](./ecommerce-step-8-plan.md). Before Step 8.2, authorize the isolated E2E service/database workflow and review the resulting browser/RBAC evidence; do not begin Step 8.2 without explicit approval.
