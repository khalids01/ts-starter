# Synchronized production: Mark an order shipped and update tracking

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.
- After-operation frames are separately prepared, API-checked fictional examples and carry a visible example label. This walkthrough never performs those state transitions.

## 01 · Scene 01

Mark shipped records a real parcel handoff. Open the confirmed order and check Fulfillment.

Focus: `{"role":"heading","name":"Fulfillment"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"committed"},{"path":"/admin/orders/{{orderId}}","field":"deliveryStatus","equals":"unfulfilled"}]`

## 02 · Scene 01

Complete any required preparation, delivery window or serialized unit assignment first.

Focus: `{"role":"heading","name":"Preparation and tracked units"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"committed"},{"path":"/admin/orders/{{orderId}}","field":"deliveryStatus","equals":"unfulfilled"}]`

## 03 · Scene 01

Recording a shipment does not automatically book a courier.

Focus: `{"role":"heading","name":"Fulfillment"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"committed"},{"path":"/admin/orders/{{orderId}}","field":"deliveryStatus","equals":"unfulfilled"}]`

## 04 · Scene 02

Select Mark shipped.

Focus: `{"role":"dialog","name":"Mark order shipped"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`; `{"kind":"click","target":{"role":"button","name":"Mark shipped"}}`.

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"committed"},{"path":"/admin/orders/{{orderId}}","field":"deliveryStatus","equals":"unfulfilled"}]`

## 05 · Scene 02

Enter the actual carrier and tracking number, and add a useful note.

Focus: `{"field":"Carrier","dialog":"Mark order shipped"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"committed"},{"path":"/admin/orders/{{orderId}}","field":"deliveryStatus","equals":"unfulfilled"}]`

## 06 · Scene 02

Check the parcel and address against the order.

Focus: `{"field":"Tracking number","dialog":"Mark order shipped"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"committed"},{"path":"/admin/orders/{{orderId}}","field":"deliveryStatus","equals":"unfulfilled"}]`

## 07 · Scene 02

Save the action only when the parcel has actually left your control.

Focus: `{"role":"button","name":"Mark shipped","dialog":"Mark order shipped"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{orderId}}","field":"inventoryStatus","equals":"committed"},{"path":"/admin/orders/{{orderId}}","field":"deliveryStatus","equals":"unfulfilled"}]`

## 08 · Scene 03

Verify that the order now shows shipped delivery evidence, carrier and tracking.

Focus: `{"role":"heading","name":"Fulfillment"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{shippedOrderId}}"}`.

Evidence: persisted-example. Visible label: Shipped example.

Required API checks: `[{"path":"/admin/orders/{{shippedOrderId}}","field":"deliveryStatus","equals":"shipped"},{"path":"/admin/orders/{{shippedOrderId}}","field":"inventoryStatus","equals":"committed"}]`

## 09 · Scene 03

Check Timeline for the event.

Focus: `{"role":"heading","name":"Timeline"}`

Evidence: persisted-example. Visible label: Shipped example.

Required API checks: `[{"path":"/admin/orders/{{shippedOrderId}}","field":"deliveryStatus","equals":"shipped"},{"path":"/admin/orders/{{shippedOrderId}}","field":"inventoryStatus","equals":"committed"}]`

## 10 · Scene 03

Courier-integrated bookings have their own workflow and may impose additional routing or consignment requirements.

Focus: `{"role":"heading","name":"Fulfillment"}`

Evidence: persisted-example. Visible label: Shipped example.

Required API checks: `[{"path":"/admin/orders/{{shippedOrderId}}","field":"deliveryStatus","equals":"shipped"},{"path":"/admin/orders/{{shippedOrderId}}","field":"inventoryStatus","equals":"committed"}]`

## 11 · Scene 04

If tracking details change, use Edit tracking rather than inventing another shipment. Record the corrected details and reason, then review the history. A shipped state is not delivery confirmation and does not establish that payment has been collected.

Focus: `{"role":"heading","name":"Fulfillment"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{shippedOrderId}}"}`.

Evidence: persisted-example. Visible label: Shipped tracking example.

Required API checks: `[{"path":"/admin/orders/{{shippedOrderId}}","field":"deliveryStatus","equals":"shipped"}]`
