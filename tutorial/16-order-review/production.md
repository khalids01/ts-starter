# Synchronized production: Review a new customer order

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Review an order before accepting it for fulfilment.

Focus: `{"role":"heading","name":"Orders"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`.

Evidence: controls.

## 02 · Scene 01

Open Orders and locate the intended order using search and status filters.

Focus: `{"field":"Search"}`

Evidence: controls.

## 03 · Scene 01

Open its details and confirm that the order number belongs to the customer request you are handling.

Focus: `{"role":"heading","name":"Orders"}`

Evidence: controls.

## 04 · Scene 02

Review Customer, Addresses and Line items.

Focus: `{"role":"heading","name":"Customer"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.

## 05 · Scene 02

Check contact details, the delivery address, SKU, quantity and any special handling.

Focus: `{"role":"heading","name":"Line items"}`

Evidence: controls.

## 06 · Scene 02

A customer profile and an order address can have different purposes; use the order details for this shipment.

Focus: `{"role":"heading","name":"Addresses"}`

Evidence: controls.

## 07 · Scene 03

Review Totals, payment method, delivery state and inventory state. Look at the outstanding amount and reservation information.

Focus: `{"role":"heading","name":"Totals"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.

## 08 · Scene 03

An order marked pending is not automatically paid or shipped.

Focus: `{"role":"heading","name":"Fulfillment"}`

Evidence: controls.

## 09 · Scene 03

Investigate unexpected prices or missing operational details before proceeding.

Focus: `{"role":"heading","name":"Totals"}`

Evidence: controls.

## 10 · Scene 04

Read Timeline to see the recorded sequence. When everything is correct, follow the confirmation workflow. If it is not, use the supported operational actions and retain a clear reason. Do not casually edit status fields to make inconsistent states appear resolved.

Focus: `{"role":"heading","name":"Timeline"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.
