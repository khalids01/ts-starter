# Multi-Provider Delivery Management Plan

## Summary

Build a provider-neutral delivery system where Steadfast is the first adapter, while Pathao, FedEx, and future services can be added without rewriting checkout, orders, or admin workflows.

Customers choose store-defined delivery methods such as Standard or Express. After an admin confirms the order, deterministic routing rules recommend an eligible courier account and explain why. The admin reviews and confirms or overrides that recommendation before dispatch. AI is excluded from v1 but a safe advisory extension point will be retained.

Before implementation, commit the existing five-file admin lifecycle/E2E work separately as:

`test(ecommerce): drive order operations through admin UI`

## Architecture and Data Changes

### Customer-facing delivery methods

Evolve the current `ShippingRate` concept into provider-independent delivery methods containing:

- Store-facing code and customer label.
- Standard/Express-style delivery tier.
- Store-controlled price, free-delivery threshold, currency, ordering, and availability.
- Optional destination and order-value restrictions.
- No customer-visible courier selection.

Existing shipping-rate records must be migrated without changing current checkout behavior.

### Provider and account management

Add:

- `DeliveryProvider`: code-registered provider definition such as `steadfast`, `pathao`, or `fedex`, including supported capabilities.
- `DeliveryAccount`: merchant account configuration with provider key, display name, enabled state, environment, priority, credential reference, health state, webhook identifier, and non-secret settings.
- `DeliveryService`: maps an account’s service—such as Steadfast home delivery—to one or more customer-facing delivery methods.
- Support multiple accounts per provider even though v1 initially configures one Steadfast account.

Provider credentials must never be saved in the database. The account stores a reference such as `steadfast_primary`; the server resolves it from a server-only `COURIER_CREDENTIALS_JSON` secret bundle injected by deployment infrastructure. Responses, logs, audit records, and UI must redact all secret values.

### Routing and review

Add ordered `DeliveryRoutingRule` records that may match:

- Customer-selected delivery method.
- Destination country, city, zone, or postal code.
- COD versus prepaid orders.
- Outstanding COD amount range.
- Package weight where available.
- Provider/account health and enabled state.

The routing engine returns ranked eligible candidates with human-readable reasons and rejection warnings. It must be deterministic and fail closed.

Store a routing snapshot on each dispatch attempt containing the evaluated rule versions, recommendation, selected account/service, override reason, and confirming admin.

### Delivery operations

Add provider-neutral records for:

- `DeliveryConsignment`: order, account, external identifiers, tracking information, internal state, provider state, COD amount, immutable request snapshot, and timestamps.
- `DeliveryOperation`: durable outbox jobs for create, refresh, return, reconciliation, or supported cancellation actions.
- `DeliveryEvent`: append-only normalized and raw provider events with idempotency keys.
- `DeliveryReturn`: return request and provider status.
- `DeliverySettlement`: COD payment/reconciliation information.
- `DeliveryException`: unresolved unknown, partial-delivery, mismatch, duplicate, or manual-review conditions.

V1 supports one active consignment per order and home delivery for Steadfast. Split shipments and partial item fulfillment remain deferred, but provider interfaces must not assume Steadfast-specific identifiers.

## Provider Interface and Steadfast Adapter

Define one adapter contract with capability flags and typed methods:

- `healthCheck`
- `createConsignment`
- `getConsignmentStatus`
- Optional `bulkCreateConsignments`
- Optional `requestPickup`
- Optional `cancelConsignment`
- Optional `createReturn`
- Optional return, settlement, balance, and service-area retrieval

Unsupported features return a typed capability error and corresponding admin actions remain hidden or disabled.

The Steadfast adapter will use its documented API key and secret-key authentication, validate recipient and COD fields before submission, and support:

- Single consignment creation.
- Status retrieval by supported Steadfast identifiers.
- Balance inspection.
- Return and payment APIs where confirmed by the official contract.
- Delivery-status and tracking webhooks.

Steadfast pickup will initially be represented as handoff states—awaiting pickup, handed to courier, and in transit—because the inspected API material does not establish merchant-side rider assignment or pickup scheduling. Cancellation after dispatch will therefore become a review/manual-portal workflow unless Steadfast confirms a supported cancellation endpoint.

Before coding the adapter, capture a versioned contract fixture from the [official Steadfast API guide](https://steadfast.com.bd/user/api/guide) and compare it with the currently accessible [API documentation mirror](https://github.com/Mahdi-hasan-shuvo/steadfast/blob/main/steadfast-courier-api-docs.md). Do not implement undocumented endpoints.

## Order, Payment, and Status Workflow

1. Checkout records the customer-selected delivery method and store-calculated fee.
2. Admin order review shows address, phone, payment state, outstanding COD amount, routing recommendation, eligibility reasons, and warnings.
3. Admin confirms or overrides the recommended provider/account/service.
4. If auto-dispatch is enabled, confirmation writes a durable consignment-create operation in the same transaction. If disabled, the order waits for an explicit dispatch action.
5. The worker submits idempotently, saves external identifiers, and records the response.
6. Webhooks provide immediate updates; polling repairs missed events.
7. Safe provider statuses automatically advance delivery state.
8. Delivered does not automatically mean COD paid. Order completion waits for payment/settlement evidence.
9. Partial delivery, cancelled, unknown, payload mismatch, and conflicting events enter the exception queue.
10. Inventory is not restocked after dispatched cancellation until cancellation or return is confirmed.

COD rules:

- Fully prepaid order: courier COD amount is zero.
- COD or partially paid order: use the authoritative outstanding amount.
- Negative, stale, currency-mismatched, or otherwise inconsistent amounts block dispatch.
- Refunds remain in the existing payment/refund system; courier settlement records are reconciliation evidence, not the refund authority.

## Admin Experience and Permissions

Add an `/admin/delivery` workspace with:

- Delivery Methods
- Providers and Accounts
- Routing Rules
- Dispatches
- Exceptions
- Returns
- Settlements
- Health and Audit History

Order pages must expose:

- Recommendation and reasoning.
- Provider/account override requiring a reason.
- Final payload preview before dispatch.
- Retry controls that reuse the same idempotency identity.
- Tracking timeline and external tracking link.
- Return/cancellation workflow.
- Settlement mismatch warnings.

Introduce dedicated permissions:

- `admin.delivery.read`
- `admin.delivery.dispatch`
- `admin.delivery.returns`
- `admin.delivery.reconcile`
- `admin.delivery.settings`

Server-side permissions remain authoritative. All settings changes, overrides, retries, and manual status actions require immutable audit entries.

## Reliability and Security

- Use a database-backed outbox; Redis may wake workers but cannot be the source of truth.
- Retry transient failures after approximately 1, 5, 15, 30, and 30 minutes, then move to manual review.
- Limit concurrency per provider account and honor rate-limit responses.
- Poll nonterminal consignments periodically and reconcile returns/payments on a slower schedule.
- Process generic webhook routes by provider and public account identifier.
- Verify account-specific webhook bearer tokens before parsing or mutation.
- Deduplicate webhooks and operation results using provider event IDs or canonical payload hashes.
- Never log full addresses, phone numbers, credentials, or unrestricted provider payloads.
- Auto-dispatch defaults to off until live verification is complete.

## Testing and Acceptance

### Automated tests

- Routing priority, eligibility, health filtering, override, and no-candidate behavior.
- Secret-reference resolution and redaction.
- Provider capability enforcement.
- Steadfast validation, authentication headers, response parsing, and every documented status mapping.
- Duplicate submissions, timeouts after provider acceptance, retries, and webhook/poll races.
- COD calculation for prepaid, COD, partial payment, refund, and inconsistent states.
- Cancellation and return inventory safety.
- Settlement reconciliation and exception generation.
- RBAC denial for each delivery permission.
- Fake generic provider contract tests proving another provider can be added without modifying order or checkout services.
- Browser E2E from shop checkout through admin review, routing confirmation, dispatch, tracking, delivery, settlement/completion, cancellation, return, and refund.
- Existing ecommerce E2E suite must remain green.

### Controlled live rollout

1. Apply reviewed migrations and RBAC seed changes.
2. Deploy with all provider accounts and auto-dispatch disabled.
3. Configure the Steadfast secret reference outside the database.
4. Verify health, balance, and other read-only calls.
5. Register and verify webhooks.
6. Send one explicitly approved test consignment.
7. Reconcile its tracking and COD lifecycle.
8. Process a small number of manually confirmed real orders.
9. Enable auto-dispatch only after duplicate prevention, reconciliation, and exception handling are demonstrated.

## Future Providers and AI

Adding Pathao, FedEx, or another provider should require only:

- A new adapter and provider-status mapping.
- Provider-specific credential validation.
- Capability declarations.
- Service/account configuration.
- Contract fixtures and adapter tests.

Checkout, order lifecycle, routing, and admin pages must remain provider-neutral.

AI/Jev is not part of v1. A future advisory `DeliveryDecisionEngine` may rerank deterministic candidates or flag suspicious cases, but it must explain recommendations, receive only minimized data, never dispatch or mutate orders directly, and still require admin confirmation.
