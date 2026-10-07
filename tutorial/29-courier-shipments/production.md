# Synchronized production: Review shipment booking and parcel handoff

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Shipments tracks courier submission and parcel progress. Open Shipments and identify the order and dispatch you intend to handle. Check routing and the customer address before creating a provider request.

Focus: `{"role":"heading","name":"Shipments"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/shipments"}`.

Evidence: controls.

## 02 · Scene 02

Queue a shipment through the supported dispatch controls only when its prerequisites are met. Submission can be asynchronous. Review queued, processing and error states instead of assuming that clicking once means a consignment exists.

Focus: `{"css":"[data-slot=\"card\"]:has([data-slot=\"card-title\"]:text-is(\"{{shipmentReference}}\"))"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/shipments"}`.

Evidence: controls.

## 03 · Scene 03

When booking succeeds, inspect the provider consignment reference and tracking evidence. Record handoff only when the parcel leaves your control. Pickup and provider operations can create external work and should be used deliberately.

Focus: `{"css":"[data-slot=\"card\"]:has([data-slot=\"card-title\"]:text-is(\"{{shipmentReference}}\"))"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/shipments"}`.

Evidence: controls.

## 04 · Scene 04

Investigate failures using their recorded cause. Follow supported retry or review controls rather than making duplicate bookings. This tutorial uses simulator evidence; a local successful example is not proof of a live provider booking.

Focus: `{"role":"heading","name":"Shipments"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/shipments"}`.

Evidence: controls.
