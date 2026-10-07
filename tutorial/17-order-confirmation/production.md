# Synchronized production: Confirm an order and commit its stock

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.
- After-operation frames are separately prepared, API-checked fictional examples and carry a visible example label. This walkthrough never performs those state transitions.

## 01 · Scene 01

Confirmation accepts the order for fulfilment and commits its reserved inventory.

Focus: `{"role":"heading","name":"Line items"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"pending"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"reserved"}]`

## 02 · Scene 01

Open the pending order and review the customer, line items, totals and reservation first.

Focus: `{"role":"heading","name":"Customer"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"pending"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"reserved"}]`

## 03 · Scene 01

Confirm only when the order is ready for your team to handle.

Focus: `{"role":"heading","name":"Totals"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"pending"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"reserved"}]`

## 04 · Scene 02

Use Order status to choose Confirmed.

Focus: `{"css":"div:has(> div > p:text-is(\"Order status\")) > button[role=\"combobox\"]"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`; `{"kind":"select","target":{"css":"div:has(> div > p:text-is(\"Order status\")) > button[role=\"combobox\"]"},"option":"Confirmed"}`.

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"pending"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"reserved"}]`

## 05 · Scene 02

Review the pending change and select Update order. Wait for the success state instead of clicking repeatedly.

Focus: `{"role":"button","name":"Update order"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"pending"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"reserved"}]`

## 06 · Scene 02

A reservation that is no longer valid may require investigation before confirmation can succeed.

Focus: `{"css":"div:has(> div > p:text-is(\"Order status\")) > button[role=\"combobox\"]"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"pending"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"reserved"}]`

## 07 · Scene 03

After confirmation, verify the order status and inventory status together.

Focus: `{"css":"div:has(> div > p:text-is(\"Order status\")) > button[role=\"combobox\"]"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{confirmedOrderId}}"}`.

Evidence: persisted-example. Visible label: Confirmed example.

Required API checks: `[{"path":"/admin/orders/{{confirmedOrderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{confirmedOrderId}}","field":"inventoryStatus","equals":"committed"}]`

## 08 · Scene 03

Inventory should show the committed state for the accepted goods.

Focus: `{"css":"p:text-is(\"Inventory\")"}`

Evidence: persisted-example. Visible label: Confirmed example.

Required API checks: `[{"path":"/admin/orders/{{confirmedOrderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{confirmedOrderId}}","field":"inventoryStatus","equals":"committed"}]`

## 09 · Scene 03

Confirmation does not collect payment and does not prove that a parcel has been shipped.

Focus: `{"role":"heading","name":"Payment evidence"}`

Evidence: persisted-example. Visible label: Confirmed example.

Required API checks: `[{"path":"/admin/orders/{{confirmedOrderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{confirmedOrderId}}","field":"inventoryStatus","equals":"committed"}]`

## 10 · Scene 04

Continue with payment evidence and the correct fulfilment controls.

Focus: `{"role":"heading","name":"Payment evidence"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{confirmedOrderId}}"}`.

Evidence: persisted-example. Visible label: Confirmed example.

Required API checks: `[{"path":"/admin/orders/{{confirmedOrderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{confirmedOrderId}}","field":"inventoryStatus","equals":"committed"}]`

## 11 · Scene 04

Use cancellation and physical recovery workflows if circumstances change. Do not use a status change as a substitute for releasing or recovering stock correctly.

Focus: `{"role":"heading","name":"Physical inventory recovery"}`

Evidence: persisted-example. Visible label: Confirmed example.

Required API checks: `[{"path":"/admin/orders/{{confirmedOrderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{confirmedOrderId}}","field":"inventoryStatus","equals":"committed"}]`
