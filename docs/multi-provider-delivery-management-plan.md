# Multi-Provider Delivery Management Plan

## Summary

Build a provider-neutral delivery system where Steadfast is the first adapter, while Pathao, FedEx, and future services can be added without rewriting checkout, orders, or admin workflows.

Customers choose store-defined delivery methods such as Standard or Express. After an admin confirms the order, deterministic routing rules recommend an eligible courier connection and explain why. The admin reviews and confirms or overrides that recommendation before dispatch. AI is excluded from v1 but a safe advisory extension point will be retained.

Before continuing delivery implementation, commit the existing five-file admin lifecycle/E2E work separately as:

`test(ecommerce): drive order operations through admin UI`

## Implementation Sequence

Implement the delivery system in reviewable steps. Do not start a later step while an earlier step has unresolved schema, security, or test failures.

1. [x] **Correct and complete the existing foundation.** Rename the unapplied `DeliveryAccount` model and every account relation to `CourierConnection`; replace `credentialReference` with explicit server-environment or encrypted-database credential sources; update the provider credential and routing interfaces; retain the delivery permissions and provider-neutral shipping fields; validate Prisma and relevant TypeScript without creating or applying a migration.
2. [x] **Finalize the database foundation.** Review the corrected schema, then prepare the migration and provider metadata seed only after explicit migration approval. Seeding a provider must never create a merchant courier connection.
3. [x] **Build credential and provider infrastructure.** Implement environment and authenticated-encryption credential resolvers, key-version rotation, redaction, the provider registry, and capability enforcement.
4. [x] **Implement the Steadfast adapter.** Add health/authentication, single-consignment creation, status/tracking lookup, idempotent timeout recovery, normalized failures, and sanitized contract fixtures. Full tracking-history parsing remains deferred until the protected response schema is supplied; v1 currently supports status lookup by consignment ID, invoice, and tracking code.
5. [x] **Build courier connection management.** Add permission-protected Admin UI/API flows to create, edit, disable, test, and inspect connections using either allowed credential source. Never return stored secrets.
6. [x] **Build routing and dispatch.** Add service mappings, deterministic routing rules, recommendation review/override, immutable routing snapshots, and the durable dispatch outbox worker.
7. [ ] **Integrate tracking and webhooks.** The provider-neutral pipeline, shared `WebhookEvent` visibility, connection-aware authentication contract, deduplication, status normalization, polling repair, terminal-conflict protection, exception routing, and order tracking UI are implemented. Keep live Steadfast webhook intake fail-closed until its protected authentication/setup, event-ID, retry, and payload schemas are supplied as sanitized fixtures; then implement and contract-test `verifyAndParseWebhook` before checking off this step.
8. [ ] **Add returns, settlements, and pickup.** Implement returns and COD reconciliation first; implement automatic pickup only after its missing protected API contract has been captured and tested.
9. [ ] **Complete browser E2E and controlled rollout.** Exercise checkout through dispatch, delivery, cancellation, return, settlement, refund, and inventory reconciliation. Keep auto-dispatch off until live verification passes.

## Architecture and Data Changes

### Customer-facing delivery methods

Evolve the current `ShippingRate` concept into provider-independent delivery methods containing:

- Store-facing code and customer label.
- Standard/Express-style delivery tier.
- Store-controlled price, free-delivery threshold, currency, ordering, and availability.
- Optional destination and order-value restrictions.
- No customer-visible courier selection.

Existing shipping-rate records must be migrated without changing current checkout behavior.

### Provider and courier connection management

Add:

- `CourierProvider`: code-registered provider definition such as `steadfast`, `pathao`, or `fedex`, including supported capabilities.
- `CourierConnection`: one store-to-courier merchant connection with provider key, admin-defined name, enabled state, environment, priority, credential source, health state, webhook identifier, and non-secret settings. It is not a customer account.
- `CourierService`: maps a connection’s service—such as Steadfast home delivery—to one or more customer-facing delivery methods.
- Support multiple connections per provider. A fresh store has no connections, even when server environment variables are present.

The Add Courier Connection form requires a name, an integrated courier provider (Steadfast in v1), and a **Configuration source**. For Steadfast, the source options are **Use default Steadfast configuration from server environment** and **Create a new Steadfast connection**. The environment option is shown only when the required server variables are configured; choosing it creates a connection explicitly. It must never be auto-created on startup. The new-connection option collects that merchant profile's credentials in the admin form. Provider-specific fields are shown only after the provider and source are selected. Adding a connection is separate from enabling it for routing or auto-dispatch.

The default Steadfast connection resolves the server-only `STEAD_FAST_API_KEY`, `STEAD_FAST_SECRET_KEY`, and `STEAD_FAST_BASE_URL`; the expected production base URL is `https://portal.packzy.com/api/v1` without a trailing slash. Admin-entered credentials are encrypted before database storage using authenticated encryption and a versioned encryption key kept outside the database. Store only ciphertext, nonce, key version, and non-secret metadata; never store plaintext or the encryption key in database rows. Credential updates replace the encrypted bundle, and rotation must support decrypting existing versions until they are re-encrypted. The generic server-side credential resolver handles both sources so core delivery code never reads provider-specific variables or ciphertext directly. Secret values must never appear in read APIs, responses, logs, audit records, client bundles, or test snapshots. The admin form may accept secrets for creation or replacement, but never returns stored values.

The credential keyring uses `COURIER_CREDENTIAL_ACTIVE_KEY_VERSION` and `COURIER_CREDENTIAL_ENCRYPTION_KEYS`. The latter is normally a server-only JSON object mapping positive integer versions to base64-encoded 32-byte AES keys, for example `{"1":"<base64-32-byte-key>"}`. An initial one-key installation may provide the base64 key directly; it is assigned to the active version. New bundles use the active version; before rotation, convert the value to the JSON form and retain old versions until every bundle has been re-encrypted. Encryption uses AES-256-GCM and binds each bundle to a stable provider/connection credential context to prevent ciphertext from being moved between connections.

The corrected foundation uses `CourierConnection`, connection-based relations, and the credential-source/encrypted-bundle design in the unapplied Prisma schema. Preserve those names and boundaries when preparing the delivery migration; do not reintroduce an account abstraction or a plaintext credential reference.

### Routing and review

Add ordered `CourierRoutingRule` records that may match:

- Customer-selected delivery method.
- Destination country, city, zone, or postal code.
- COD versus prepaid orders.
- Outstanding COD amount range.
- Package weight where available.
- Provider/connection health and enabled state.

The routing engine returns ranked eligible candidates with human-readable reasons and rejection warnings. It must be deterministic and fail closed.

Store a routing snapshot on each dispatch attempt containing the evaluated rule versions, recommendation, selected connection/service, override reason, and confirming admin.

### Delivery operations

Add provider-neutral records for:

- `CourierConsignment`: order, connection, external identifiers, tracking information, internal state, provider state, COD amount, immutable request snapshot, and timestamps.
- `CourierOperation`: durable outbox jobs for create, refresh, return, reconciliation, or supported cancellation actions.
- `CourierEvent`: append-only normalized and raw provider events with idempotency keys.
- `CourierReturn`: return request and provider status.
- `CourierSettlement`: COD payment/reconciliation information.
- `CourierException`: unresolved unknown, partial-delivery, mismatch, duplicate, or manual-review conditions.

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

Steadfast documents `POST /create_pickup_request`, so the generic adapter retains a `requestPickup` capability. Until that endpoint's expanded schema is captured and tested, v1 represents pickup using handoff states—awaiting pickup, pickup requested externally, handed to courier, and in transit—and does not call it automatically. Cancellation after dispatch remains a review/manual-portal workflow unless Steadfast confirms a supported cancellation endpoint.

Before coding the adapter, capture a versioned contract fixture from the [official Steadfast API guide](https://steadfast.com.bd/user/api/guide) and compare it with the currently accessible [API documentation mirror](https://github.com/Mahdi-hasan-shuvo/steadfast/blob/main/steadfast-courier-api-docs.md). Do not implement undocumented endpoints.

### Steadfast v1 API contract

This section is the implementation reference for the Steadfast adapter. Information copied from the merchant-only guide supplied by the account owner takes priority over the public mirror when they differ. Never use real credentials in fixtures, source files, browser code, logs, or test snapshots.

#### Transport, authentication, and limits

- Base URL: `STEAD_FAST_BASE_URL`; expected production value: `https://portal.packzy.com/api/v1`.
- Send `Api-Key: <STEAD_FAST_API_KEY>` and `Secret-Key: <STEAD_FAST_SECRET_KEY>` on every authenticated request.
- Send `Content-Type: application/json` on POST requests.
- There is no login call or refresh token. Both keys belong to one Steadfast business profile and are sent on each request.
- `GET /ping` is the unauthenticated service check.
- A missing or invalid credential returns HTTP `401`. Do not retry `401`; disable automatic processing for the connection, mark its health as an authentication failure, and require configuration review.
- The protected guide states that 10 authentication failures from one address/key within five minutes cause HTTP `429` for 60 minutes, including requests with subsequently corrected keys.
- General limit: 1,000 requests per minute. Booking limit: 6,000 requests per minute. The adapter must still honor `429` and any `Retry-After` header instead of assuming capacity is available.
- Steadfast may strip special characters from names, addresses, and notes and may truncate oversized strings rather than reject them. Validate and normalize locally, store the exact outbound payload, and treat returned text as provider-normalized data rather than overwriting the order address.
- Protected-guide maximums: `invoice` 100 characters, `recipient_name` 100, `recipient_phone` 40, `recipient_address` 490, and `note` 480. The older public mirror says the address limit is 250 and the phone must contain 11 digits. Until verified with the live account, enforce the safer intersection: 100-character invoice/name, normalized 11-digit Bangladesh phone, 250-character address, and 480-character note.

#### Endpoint inventory and adapter mapping

| Method and path | Purpose | Adapter capability | V1 usage |
| --- | --- | --- | --- |
| `GET /ping` | Service availability | `healthCheck` | Yes; never proves credentials are valid |
| `POST /create_order` | Book one parcel | `createConsignment` | Yes |
| `POST /create_order/bulk-order` | Book up to 500 parcels | `bulkCreateConsignments` | Later; not used by automatic single-order dispatch |
| `POST /create_order/bulk-order/extended` | Bulk booking with per-field validation messages | `bulkCreateConsignments` | Later; prefer this variant when bulk UI is implemented |
| `GET /status_by_cid/{consignment_id}` | Current status by Steadfast ID | `getConsignmentStatus` | Yes; primary polling key |
| `GET /status_with_return_status_by_cid/{consignment_id}` | Delivery and return progress | `getConsignmentStatus`/return sync | Yes after a return starts |
| `GET /status_by_invoice/{invoice}` | Current status by merchant order number | recovery lookup | Yes; use to recover from create timeouts before retrying |
| `GET /status_by_trackingcode/{tracking_code}` | Current status by tracking code | recovery lookup | Yes |
| `GET /trackings_by_invoice/{invoice}` | Full tracking history | tracking timeline | Yes |
| `POST /create_pickup_request` | Request rider pickup from a merchant address | `requestPickup` | Phase 2, after its request/response schema is captured |
| `POST /create_return_request` | Ask for a parcel to be returned | `createReturn` | Yes |
| `GET /get_return_requests` | Paginated return requests, newest first | `listReturns` | Yes |
| `GET /get_return_request/{id}` | One return request | `getReturn` | Yes |
| `GET /get_balance` | Current merchant balance | `getBalance` | Yes, read-only |
| `GET /payments` | Paginated payouts, ten per page | `listSettlements` | Yes |
| `GET /payments/{payment_id}` | One payout and its settled parcels | `getSettlement` | Yes |
| `GET /police_stations` | Supported thanas with districts | `getServiceAreas` | Yes; cache and use for address/admin lookup assistance |
| `GET /fraud_check/score/{phone}` | Delivery-risk score from 0 to 100 | separate risk capability | Explicitly excluded from v1; do not confuse it with the third-party EliteMart endpoint |

All path parameters must be URL-encoded. Do not place API keys, customer phones, addresses, or response bodies in query logs.

#### Create-order request and response

`POST /create_order` accepts JSON. Required fields for v1 are:

| Field | Rule and source |
| --- | --- |
| `invoice` | Stable, unique merchant reference derived from the order number; allowed characters are alphanumeric, hyphen, and underscore; never generate a new value during retry |
| `recipient_name` | Shipping-address recipient name, maximum 100 characters |
| `recipient_phone` | Normalized Bangladesh mobile number; locally validate as 11 digits before dispatch |
| `recipient_address` | Flattened shipping address; v1 enforces maximum 250 characters until the live 490-character limit is confirmed |
| `cod_amount` | Authoritative outstanding amount in BDT, numeric and at least zero; prepaid orders send `0` |

Optional fields supported by the documented contract are `alternative_phone`, `recipient_email`, `note`, `item_description`, `total_lot`, and `delivery_type`. V1 sends `delivery_type: 0` for home delivery, may send a sanitized delivery note and item summary, and must not send unnecessary customer email data. `delivery_type: 1` means point delivery/hub pickup and is outside v1.

Example request shape:

```ts
await fetch(`${baseUrl}/create_order`, {
  method: "POST",
  headers: {
    "Api-Key": apiKey,
    "Secret-Key": secretKey,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    invoice: "ORD-10231",
    recipient_name: "Jahid Hasan",
    recipient_phone: "01712345678",
    recipient_address: "Dhanmondi, Dhaka",
    cod_amount: 1060,
    delivery_type: 0,
  }),
});
```

A successful response contains `status`, `message`, and `consignment`. Persist at least `consignment.consignment_id`, `invoice`, `tracking_code`, `cod_amount`, provider `status`, `created_at`, and `updated_at`. Validate the response at runtime; a 2xx response with a missing/malformed consignment is a failed operation requiring review.

Creation is not safe to repeat blindly. If the HTTP result is lost or times out after submission, query `/status_by_invoice/{invoice}` before another create attempt. The database outbox must keep the same invoice and operation identity for every retry.

#### Status normalization

Known polling statuses are:

| Steadfast value | Internal action |
| --- | --- |
| `in_review` | Consignment submitted; keep order preparing/awaiting courier acceptance |
| `pending` | Active delivery; retain the latest internal transit state and continue tracking |
| `hold` | Keep active but create an admin warning if it persists |
| `delivered_approval_pending` | Provisional delivery; do not complete the order or recognize COD settlement |
| `delivered` | Mark delivery as delivered; payment completion still requires settlement evidence |
| `partial_delivered_approval_pending` | Open a blocking exception; do not restock or complete automatically |
| `partial_delivered` | Open a blocking exception and reconcile returned items/COD manually |
| `cancelled_approval_pending` | Provisional cancellation; do not restock yet |
| `cancelled` | Mark courier cancellation confirmed; restock only through the existing audited cancellation/return workflow |
| `unknown_approval_pending` | Open a blocking exception and contact/review Steadfast support |
| `unknown` | Open a blocking exception; no automatic order transition |

Status comparison should be case-normalized because example webhook payloads may use title case while polling responses use lowercase identifiers. Preserve the raw value and payload for audit with sensitive fields redacted.

#### Returns, balance, payments, tracking, and webhooks

- `POST /create_return_request` accepts one parcel identifier—`consignment_id`, `invoice`, or `tracking_code`—plus optional `reason`. Prefer `consignment_id`. Known return states are `pending`, `approved`, `processing`, `completed`, and `cancelled`.
- A completed courier return does not itself decide refund amount or inventory disposition. It creates an admin reconciliation task against the existing refund/restock workflow.
- `GET /get_balance` is expected to return `status` and `current_balance`; store observations for health/operations but do not use balance as proof that a specific order was paid.
- Reconcile individual COD orders from `GET /payments/{payment_id}` parcel details. The exact protected-guide payment and pagination schemas must be captured before implementing settlement parsing.
- Prefer provider webhooks for freshness and use polling for repair. The accessible contract describes incoming `delivery_status` and `tracking_update` notifications authenticated with `Authorization: Bearer <configured webhook token>`. This token is merchant-configured and must not automatically be assumed equal to either API credential. Store an admin-entered token encrypted with the same credential protection, or resolve an explicitly configured environment token.
- Integrate courier intake and event visibility with the existing webhook-management system (`WebhookEvent` and `/admin/webhooks`), using provider and public connection identifiers. Extend that shared system where needed rather than creating an isolated courier webhook dashboard or event registry. Webhook handlers validate authentication, runtime-validate JSON, deduplicate events, enqueue processing, and respond quickly. Unknown notification types or statuses are preserved and routed to review rather than ignored.

#### Known documentation gaps that block full endpoint implementation

The endpoint list is now known, but the supplied screenshots do not include every endpoint's expanded request and response definition. Before implementing the affected capabilities, capture sanitized examples and validation rules from the protected guide for:

- `/create_pickup_request`, including merchant-address identifier, parcel selection, scheduling fields, and response/status values.
- `/create_order/bulk-order/extended` request envelope and success/error response shapes.
- `/status_with_return_status_by_cid` and `/trackings_by_invoice` response schemas.
- Pagination parameters and response envelopes for `/get_return_requests` and `/payments`.
- Full `/payments/{payment_id}` settlement/consignment schema.
- `/police_stations` identifiers, district fields, and pagination/cache behavior.
- `/fraud_check/score/{phone}` response schema, authentication/privacy terms, and rate limits; this remains outside v1 regardless.
- The current official webhook setup screen, token semantics, retry behavior, event IDs, delivery/tracking payloads, and whether pickup/return/payment webhooks exist.
- Error response bodies and validation codes for single create, pickup, returns, and all lookup failures.

Agents must implement only contract portions documented above or subsequently added as sanitized fixtures. They must not infer missing payload fields from UI labels or from unofficial SDKs.

## Order, Payment, and Status Workflow

1. Checkout records the customer-selected delivery method and store-calculated fee.
2. Admin order review shows address, phone, payment state, outstanding COD amount, routing recommendation, eligibility reasons, and warnings.
3. Admin confirms or overrides the recommended provider/connection/service.
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

Add an `/admin/couriers` workspace with:

- Delivery Methods
- Providers and Courier Connections
- Routing Rules
- Dispatches
- Exceptions
- Returns
- Settlements
- Health and Audit History

Order pages must expose:

- Recommendation and reasoning.
- Provider/connection override requiring a reason.
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
- Limit concurrency per courier connection and honor rate-limit responses.
- Poll nonterminal consignments periodically and reconcile returns/payments on a slower schedule.
- Process generic webhook routes through webhook management using provider and public connection identifiers.
- Verify connection-specific webhook bearer tokens before parsing or mutation.
- Deduplicate webhooks and operation results using provider event IDs or canonical payload hashes.
- Never log full addresses, phone numbers, credentials, or unrestricted provider payloads.
- Auto-dispatch defaults to off until live verification is complete.

## Testing and Acceptance

### Automated tests

- Routing priority, eligibility, health filtering, override, and no-candidate behavior.
- Both credential sources: environment availability without automatic connection creation, encrypted database round trips, missing/invalid configuration, key rotation, and secret redaction in reads, errors, logs, audit records, and client bundles.
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
2. Deploy with no courier connections and auto-dispatch disabled.
3. Configure the credential encryption key outside the database. Optionally configure `STEAD_FAST_API_KEY`, `STEAD_FAST_SECRET_KEY`, and `STEAD_FAST_BASE_URL` in server deployment secrets; verify none are exposed to browser builds or logs.
4. Create a Steadfast connection explicitly through the Admin UI using the environment configuration or encrypted admin-entered credentials; keep routing and auto-dispatch disabled.
5. Verify health, balance, and other read-only calls.
6. Register and verify webhooks through webhook management.
7. Send one explicitly approved test consignment.
8. Reconcile its tracking and COD lifecycle.
9. Process a small number of manually confirmed real orders.
10. Enable auto-dispatch only after duplicate prevention, reconciliation, and exception handling are demonstrated.

## Future Providers and AI

Adding Pathao, FedEx, or another provider should require only:

- A new adapter and provider-status mapping.
- Provider-specific credential validation.
- Capability declarations.
- Service/connection configuration.
- Contract fixtures and adapter tests.

Checkout, order lifecycle, routing, and admin pages must remain provider-neutral.

AI/Jev is not part of v1. A future advisory `DeliveryDecisionEngine` may rerank deterministic candidates or flag suspicious cases, but it must explain recommendations, receive only minimized data, never dispatch or mutate orders directly, and still require admin confirmation.
