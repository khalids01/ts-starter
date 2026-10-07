# Understand courier operations and exceptions — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

The courier overview summarizes delivery configuration and operations. Open Couriers, then Overview. Connections identify provider accounts; delivery options map service levels; assignment rules decide how orders are routed.

Screen actions:

- Open `/admin/couriers`.
- Show and check **Courier overview**.

## 02. Understand the controls

Review connection health and configuration before dispatching. A healthy connection is one prerequisite, not a guarantee that every shipment will succeed. Shipping methods and delivery options must match the service you intend to offer.

Screen actions:

- Open `/admin/couriers`.
- Show and check **a[href="/admin/couriers/connections"]**.

## 03. Perform the task

Use Shipments to investigate bookings and parcel progress. Courier returns and COD payouts are separate operational sections. Open the relevant record rather than interpreting a count as evidence that a parcel was delivered or money was paid.

Screen actions:

- Open `/admin/couriers`.
- Show and check **a[href="/admin/couriers/shipments"]**.

## 04. Verify and continue

Resolve authentication, routing, retry and collection exceptions using the specific workflow. A tutorial demonstration must use the local simulator and fictional data. Live bookings, pickup requests and provider actions require deliberate operator authorization.

Screen actions:

- Open `/admin/couriers`.
- Show and check **a[href="/admin/couriers/cod-payouts"]**.
