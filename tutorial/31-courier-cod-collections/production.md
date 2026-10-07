# Synchronized production: Record courier COD collection evidence

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.
- shipmentReference is the fictional order number displayed as the Shipments card title, not a raw provider consignment ID. Prepare its booked COD consignment and an orderId with reconciled collection evidence for the final example.

## 01 · Scene 01

COD collection evidence concerns money collected from the customer by the courier. Open COD payouts. Distinguish booked COD, gross customer collection, courier fees and net payout: these values are related but they are not interchangeable.

Focus: `{"role":"heading","name":"COD collections"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/cod-payouts"}`.

Evidence: controls.

## 02 · Scene 02

Find the intended consignment or collection record.

Focus: `{"role":"dialog","name":"Record gross COD collection evidence"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/shipments"}`; `{"kind":"click","target":{"css":"[data-slot=\"card\"]:has([data-slot=\"card-title\"]:text-is(\"{{shipmentReference}}\")) button:text-is(\"Record settlement\")"}}`.

Evidence: controls.

## 03 · Scene 02

Verify the provider reference, currency and gross amount collected.

Focus: `{"field":"Amount","dialog":"Record gross COD collection evidence"}`

Evidence: controls.

## 04 · Scene 02

Enter the collection reference and a factual evidence note through the supported controls.

Focus: `{"field":"Collection/reference ID","dialog":"Record gross COD collection evidence"}`

Evidence: controls.

## 05 · Scene 03

Record only evidence you actually have.

Focus: `{"field":"Evidence note","dialog":"Record gross COD collection evidence"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/shipments"}`; `{"kind":"click","target":{"css":"[data-slot=\"card\"]:has([data-slot=\"card-title\"]:text-is(\"{{shipmentReference}}\")) button:text-is(\"Record settlement\")"}}`.

Evidence: controls.

## 06 · Scene 03

A net bank payout after fees is not the same as gross customer collection.

Focus: `{"field":"Amount","dialog":"Record gross COD collection evidence"}`

Evidence: controls.

## 07 · Scene 03

Review mismatches instead of inventing a manual payment to make the customer order appear fully paid.

Focus: `{"field":"Evidence note","dialog":"Record gross COD collection evidence"}`

Evidence: controls.

## 08 · Scene 04

Check the order payment totals and collection history after reconciliation.

Focus: `{"role":"heading","name":"Payment evidence"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/cod-payouts"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: persisted-example. Visible label: Reconciled COD order example.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"paymentStatus","equals":"paid"}]`

## 09 · Scene 04

Keep fees and payout evidence distinct.

Focus: `{"role":"heading","name":"Totals"}`

Evidence: persisted-example. Visible label: Reconciled COD order example.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"paymentStatus","equals":"paid"}]`

## 10 · Scene 04

This demonstration uses fictional simulator records; it does not request or confirm a real provider payout.

Focus: `{"role":"heading","name":"Timeline"}`

Evidence: persisted-example. Visible label: Reconciled COD order example.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"paymentStatus","equals":"paid"}]`
