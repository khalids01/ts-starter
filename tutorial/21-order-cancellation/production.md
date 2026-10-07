# Synchronized production: Cancel an order with the correct stock outcome

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.
- After-operation frames are separately prepared, API-checked fictional examples and carry a visible example label. This walkthrough never performs those state transitions.

## 01 · Scene 01

Cancellation must match what actually happened to the order.

Focus: `{"role":"heading","name":"Cancellation and refunds"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"pending"}]`

## 02 · Scene 01

Open its details and inspect inventory, payment and delivery states.

Focus: `{"role":"heading","name":"Totals"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"pending"}]`

## 03 · Scene 01

Goods still reserved and goods already handed to a courier need different follow-up actions.

Focus: `{"role":"heading","name":"Fulfillment"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"pending"}]`

## 04 · Scene 02

Open the cancellation control in Cancellation and refunds.

Focus: `{"role":"dialog","name":"Cancel order?"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`; `{"kind":"click","target":{"role":"button","name":"Cancel order"}}`.

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"pending"}]`

## 05 · Scene 02

Read the dialog, enter a clear reason and add an internal note when needed.

Focus: `{"field":"Reason","dialog":"Cancel order?"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"pending"}]`

## 06 · Scene 02

Check the consequences before confirming. A cancelled status does not prove that dispatched stock has physically returned.

Focus: `{"role":"dialog","name":"Cancel order?"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"pending"}]`

## 07 · Scene 03

After cancellation, review the timeline and inventory state.

Focus: `{"role":"heading","name":"Timeline"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{cancelledOrderId}}"}`.

Evidence: persisted-example. Visible label: Cancelled reservation example.

Required API checks: `[{"path":"/admin/orders/{{cancelledOrderId}}","field":"orderStatus","equals":"cancelled"},{"path":"/admin/orders/{{cancelledOrderId}}","field":"inventoryStatus","equals":"released"}]`

## 08 · Scene 03

A reservation may be released when allowed; committed or dispatched goods can require physical recovery.

Focus: `{"role":"heading","name":"Physical inventory recovery"}`

Evidence: persisted-example. Visible label: Cancelled reservation example.

Required API checks: `[{"path":"/admin/orders/{{cancelledOrderId}}","field":"orderStatus","equals":"cancelled"},{"path":"/admin/orders/{{cancelledOrderId}}","field":"inventoryStatus","equals":"released"}]`

## 09 · Scene 03

Payment that was actually received may need a separate refund record.

Focus: `{"role":"heading","name":"Payment evidence"}`

Evidence: persisted-example. Visible label: Cancelled reservation example.

Required API checks: `[{"path":"/admin/orders/{{cancelledOrderId}}","field":"orderStatus","equals":"cancelled"},{"path":"/admin/orders/{{cancelledOrderId}}","field":"inventoryStatus","equals":"released"}]`

## 10 · Scene 04

Follow the recovery controls when stock is not safely back in inventory.

Focus: `{"role":"heading","name":"Physical inventory recovery"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{dispatchedCancelledOrderId}}"}`.

Evidence: persisted-example. Visible label: Cancelled dispatched example.

Required API checks: `[{"path":"/admin/orders/{{dispatchedCancelledOrderId}}","field":"orderStatus","equals":"cancelled"},{"path":"/admin/orders/{{dispatchedCancelledOrderId}}","field":"inventoryStatus","equals":"committed"}]`

## 11 · Scene 04

Retain the cancellation reason and evidence.

Focus: `{"role":"heading","name":"Timeline"}`

Evidence: persisted-example. Visible label: Cancelled dispatched example.

Required API checks: `[{"path":"/admin/orders/{{dispatchedCancelledOrderId}}","field":"orderStatus","equals":"cancelled"},{"path":"/admin/orders/{{dispatchedCancelledOrderId}}","field":"inventoryStatus","equals":"committed"}]`

## 12 · Scene 04

Do not make quantity adjustments simply to hide an unresolved return or unpaid refund.

Focus: `{"role":"heading","name":"Physical inventory recovery"}`

Evidence: persisted-example. Visible label: Cancelled dispatched example.

Required API checks: `[{"path":"/admin/orders/{{dispatchedCancelledOrderId}}","field":"orderStatus","equals":"cancelled"},{"path":"/admin/orders/{{dispatchedCancelledOrderId}}","field":"inventoryStatus","equals":"committed"}]`
