# Synchronized production: Understand courier operations and exceptions

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

The courier overview summarizes delivery configuration and operations. Open Couriers, then Overview.

Focus: `{"role":"heading","name":"Courier overview"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers"}`.

Evidence: controls.

## 02 · Scene 01

Connections identify provider accounts; delivery options map service levels; assignment rules decide how orders are routed.

Focus: `{"css":"a[href=\"/admin/couriers/connections\"]"}`

Evidence: controls.

## 03 · Scene 02

Review connection health and configuration before dispatching. A healthy connection is one prerequisite, not a guarantee that every shipment will succeed.

Focus: `{"css":"a[href=\"/admin/couriers/connections\"]"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers"}`.

Evidence: controls.

## 04 · Scene 02

Shipping methods and delivery options must match the service you intend to offer.

Focus: `{"css":"a[href=\"/admin/couriers/delivery-options\"]"}`

Evidence: controls.

## 05 · Scene 03

Use Shipments to investigate bookings and parcel progress.

Focus: `{"css":"a[href=\"/admin/couriers/shipments\"]"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers"}`.

Evidence: controls.

## 06 · Scene 03

Courier returns and COD payouts are separate operational sections.

Focus: `{"css":"a[href=\"/admin/couriers/returns\"]"}`

Evidence: controls.

## 07 · Scene 03

Open the relevant record rather than interpreting a count as evidence that a parcel was delivered or money was paid.

Focus: `{"css":"a[href=\"/admin/couriers/cod-payouts\"]"}`

Evidence: controls.

## 08 · Scene 04

Resolve authentication, routing, retry and collection exceptions using the specific workflow. A tutorial demonstration must use the local simulator and fictional data. Live bookings, pickup requests and provider actions require deliberate operator authorization.

Focus: `{"role":"heading","name":"Courier overview"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers"}`.

Evidence: controls.
