# Synchronized production: Track courier returns and recover received goods

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.
- returnReference is the fictional order number displayed as the Courier returns card title. Use the matching consignment/order recovery example.

## 01 · Scene 01

Courier returns track parcels coming back through a provider. Open Returns and review the original order, consignment and return state. A provider return notification does not by itself mean the goods are back in your stock location.

Focus: `{"role":"heading","name":"Courier returns"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/returns"}`.

Evidence: controls.

## 02 · Scene 02

Use supported return actions only for the real parcel outcome and the provider integration in use. Keep the return reference and reason. Cancellation of an order and initiation of a courier return are different operations.

Focus: `{"css":"[data-slot=\"card\"]:has([data-slot=\"card-title\"]:text-is(\"{{returnReference}}\"))"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/returns"}`.

Evidence: controls.

## 03 · Scene 03

When the parcel physically arrives, inspect the goods through the order recovery workflow. Record receipt and condition before considering restock. Damaged, expired or otherwise unsafe items must not become sellable merely because the return is complete.

Focus: `{"role":"heading","name":"Physical inventory recovery"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/returns"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.

## 04 · Scene 04

Compare the return history, order timeline, recovery evidence and payment outcome.

Focus: `{"role":"heading","name":"Timeline"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/returns"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.

## 05 · Scene 04

Refunds and courier collections require their own records.

Focus: `{"role":"heading","name":"Payment evidence"}`

Evidence: controls.

## 06 · Scene 04

Resolve disagreements before closing the operational case.

Focus: `{"role":"heading","name":"Timeline"}`

Evidence: controls.
