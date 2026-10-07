# Synchronized production: Record refunds and recover physical inventory

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.
- After-operation frames are separately prepared, API-checked fictional examples and carry a visible example label. This walkthrough never performs those state transitions.

## 01 · Scene 01

A refund records money returned, while inventory recovery records what happened to the goods.

Focus: `{"role":"heading","name":"Cancellation and refunds"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"paymentStatus","equals":"paid"}]`

## 02 · Scene 01

Open the order and inspect Cancellation and refunds together with Physical inventory recovery. Neither event should be assumed from the other.

Focus: `{"role":"heading","name":"Physical inventory recovery"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"paymentStatus","equals":"paid"}]`

## 03 · Scene 02

Use Record manual refund only for a real refund you can support with evidence.

Focus: `{"role":"dialog","name":"Record manual refund"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`; `{"kind":"click","target":{"role":"button","name":"Record refund"}}`.

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"paymentStatus","equals":"paid"}]`

## 04 · Scene 02

Enter the amount and reason, and read the restock choice carefully. Partial refunds must reflect the actual money returned, not an arbitrary adjustment to the total.

Focus: `{"css":"#refund-amount","dialog":"Record manual refund"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"paymentStatus","equals":"paid"}]`

## 05 · Scene 03

For goods returned after dispatch, record physical receipt first. Inspect every returned item and choose its condition. Unsafe or unsellable goods must not be made available merely because a customer was refunded.

Focus: `{"role":"heading","name":"Physical inventory recovery"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{returnedOrderId}}"}`.

Evidence: persisted-example. Visible label: Returned goods awaiting inspection.

Required API checks: `[{"path":"/admin/orders/{{returnedOrderId}}","field":"inventoryStatus","equals":"committed"},{"path":"/admin/orders/{{returnedOrderId}}","field":"recovery.disposition","equals":"awaiting_inspection"}]`

## 06 · Scene 04

Restock only when the recovery controls confirm eligibility and every required inspection is complete.

Focus: `{"role":"heading","name":"Physical inventory recovery"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{recoveredOrderId}}"}`.

Evidence: persisted-example. Visible label: Inspected and restocked example.

Required API checks: `[{"path":"/admin/orders/{{recoveredOrderId}}","field":"inventoryStatus","equals":"restocked"},{"path":"/admin/orders/{{recoveredOrderId}}","field":"recovery.disposition","equals":"sellable"}]`

## 07 · Scene 04

Review payment totals, timeline and inventory history afterward.

Focus: `{"role":"heading","name":"Timeline"}`

Evidence: persisted-example. Visible label: Inspected and restocked example.

Required API checks: `[{"path":"/admin/orders/{{recoveredOrderId}}","field":"inventoryStatus","equals":"restocked"},{"path":"/admin/orders/{{recoveredOrderId}}","field":"recovery.disposition","equals":"sellable"}]`

## 08 · Scene 04

A refund, receipt, inspection and restock are distinct evidence events.

Focus: `{"role":"heading","name":"Physical inventory recovery"}`

Evidence: persisted-example. Visible label: Inspected and restocked example.

Required API checks: `[{"path":"/admin/orders/{{recoveredOrderId}}","field":"inventoryStatus","equals":"restocked"},{"path":"/admin/orders/{{recoveredOrderId}}","field":"recovery.disposition","equals":"sellable"}]`
