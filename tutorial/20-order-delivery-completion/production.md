# Synchronized production: Record delivery and complete an order

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.
- After-operation frames are separately prepared, API-checked fictional examples and carry a visible example label. This walkthrough never performs those state transitions.

## 01 · Scene 01

Delivery and completion record different milestones. Open the shipped order and verify delivery evidence from the actual handoff. Use Mark delivered only after delivery is confirmed; a tracking number by itself is not proof.

Focus: `{"role":"heading","name":"Fulfillment"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"deliveryStatus","equals":"shipped"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"committed"}]`

## 02 · Scene 02

Select Mark delivered and record a factual note.

Focus: `{"field":"Note","dialog":"Mark order delivered"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`; `{"kind":"click","target":{"role":"button","name":"Mark delivered"}}`.

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"deliveryStatus","equals":"shipped"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"committed"}]`

## 03 · Scene 02

Wait for the saved state, then check delivery status and timestamp. If a courier integration supplies delivery information, review its evidence and supported controls before adding a conflicting manual action.

Focus: `{"css":"section:has(> h2:text-is(\"Fulfillment\"))"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders/{{deliveredOrderId}}"}`.

Evidence: persisted-example. Visible label: Saved delivery evidence example.

Required API checks: `[{"path":"/admin/orders/{{deliveredOrderId}}","field":"deliveryStatus","equals":"delivered"},{"path":"/admin/orders/{{deliveredOrderId}}","field":"inventoryStatus","equals":"committed"}]`

## 04 · Scene 03

Check that payment is fully collected, delivery is delivered, inventory remains committed and no operational issue blocks completion.

Focus: `{"role":"heading","name":"Totals"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{deliveredOrderId}}"}`.

Evidence: persisted-example. Visible label: Delivered and paid example.

Required API checks: `[{"path":"/admin/orders/{{deliveredOrderId}}","field":"deliveryStatus","equals":"delivered"},{"path":"/admin/orders/{{deliveredOrderId}}","field":"paymentStatus","equals":"paid"},{"path":"/admin/orders/{{deliveredOrderId}}","field":"inventoryStatus","equals":"committed"},{"path":"/admin/orders/{{deliveredOrderId}}","field":"orderStatus","equals":"confirmed"}]`

## 05 · Scene 03

Then choose Completed in Order status and select Update order.

Focus: `{"css":"div:has(> div > p:text-is(\"Order status\")) > button[role=\"combobox\"]"}`

Prepare frame: `{"kind":"select","target":{"css":"div:has(> div > p:text-is(\"Order status\")) > button[role=\"combobox\"]"},"option":"Completed"}`.

Evidence: persisted-example. Visible label: Delivered and paid example.

Required API checks: `[{"path":"/admin/orders/{{deliveredOrderId}}","field":"deliveryStatus","equals":"delivered"},{"path":"/admin/orders/{{deliveredOrderId}}","field":"paymentStatus","equals":"paid"},{"path":"/admin/orders/{{deliveredOrderId}}","field":"inventoryStatus","equals":"committed"},{"path":"/admin/orders/{{deliveredOrderId}}","field":"orderStatus","equals":"confirmed"}]`

## 06 · Scene 03

Read any guard message and resolve its cause.

Focus: `{"role":"button","name":"Update order"}`

Evidence: persisted-example. Visible label: Delivered and paid example.

Required API checks: `[{"path":"/admin/orders/{{deliveredOrderId}}","field":"deliveryStatus","equals":"delivered"},{"path":"/admin/orders/{{deliveredOrderId}}","field":"paymentStatus","equals":"paid"},{"path":"/admin/orders/{{deliveredOrderId}}","field":"inventoryStatus","equals":"committed"},{"path":"/admin/orders/{{deliveredOrderId}}","field":"orderStatus","equals":"confirmed"}]`

## 07 · Scene 04

Review Timeline and Totals after the update. The order should show the recorded delivery and completion events.

Focus: `{"role":"heading","name":"Timeline"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{completedOrderId}}"}`.

Evidence: persisted-example. Visible label: Completed example.

Required API checks: `[{"path":"/admin/orders/{{completedOrderId}}","field":"orderStatus","equals":"completed"},{"path":"/admin/orders/{{completedOrderId}}","field":"deliveryStatus","equals":"delivered"},{"path":"/admin/orders/{{completedOrderId}}","field":"paymentStatus","equals":"paid"},{"path":"/admin/orders/{{completedOrderId}}","field":"inventoryStatus","equals":"committed"}]`

## 08 · Scene 04

Completing an order does not replace missing money or physical evidence.

Focus: `{"role":"heading","name":"Totals"}`

Evidence: persisted-example. Visible label: Completed example.

Required API checks: `[{"path":"/admin/orders/{{completedOrderId}}","field":"orderStatus","equals":"completed"},{"path":"/admin/orders/{{completedOrderId}}","field":"deliveryStatus","equals":"delivered"},{"path":"/admin/orders/{{completedOrderId}}","field":"paymentStatus","equals":"paid"},{"path":"/admin/orders/{{completedOrderId}}","field":"inventoryStatus","equals":"committed"}]`

## 09 · Scene 04

Use the appropriate recovery or refund workflow when the real outcome is different.

Focus: `{"role":"heading","name":"Physical inventory recovery"}`

Evidence: persisted-example. Visible label: Completed example.

Required API checks: `[{"path":"/admin/orders/{{completedOrderId}}","field":"orderStatus","equals":"completed"},{"path":"/admin/orders/{{completedOrderId}}","field":"deliveryStatus","equals":"delivered"},{"path":"/admin/orders/{{completedOrderId}}","field":"paymentStatus","equals":"paid"},{"path":"/admin/orders/{{completedOrderId}}","field":"inventoryStatus","equals":"committed"}]`
