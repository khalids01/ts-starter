# Synchronized production: Record and correct payment evidence

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.
- After-operation frames are separately prepared, API-checked fictional examples and carry a visible example label. This walkthrough never performs those state transitions.

## 01 · Scene 01

Payment evidence records money that has actually been received. It does not move money between accounts.

Focus: `{"role":"heading","name":"Payment evidence"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{orderId}}","field":"paymentStatus","equals":"unpaid"}]`

## 02 · Scene 01

Open the order and check Payment evidence, Totals and the outstanding amount before choosing Record confirmed payment.

Focus: `{"role":"button","name":"Record confirmed payment"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{orderId}}","field":"paymentStatus","equals":"unpaid"}]`

## 03 · Scene 02

Enter only the amount received.

Focus: `{"css":"#payment-amount","dialog":"Record confirmed payment"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`; `{"kind":"click","target":{"role":"button","name":"Record confirmed payment"}}`.

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{orderId}}","field":"paymentStatus","equals":"unpaid"}]`

## 04 · Scene 02

Choose the real collection method, provide the transaction or receipt reference and add a clear evidence note.

Focus: `{"field":"Collection reference","dialog":"Record confirmed payment"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{orderId}}","field":"paymentStatus","equals":"unpaid"}]`

## 05 · Scene 02

Partial receipts can be recorded separately until the outstanding amount reaches zero.

Focus: `{"css":"#payment-amount","dialog":"Record confirmed payment"}`

Evidence: controls.

Required API checks: `[{"path":"/admin/orders/{{orderId}}","field":"orderStatus","equals":"confirmed"},{"path":"/admin/orders/{{orderId}}","field":"paymentStatus","equals":"unpaid"}]`

## 06 · Scene 03

Select Record evidence after reviewing the details, then verify the receipt and totals.

Focus: `{"role":"button","name":"Record evidence","dialog":"Record confirmed payment"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`; `{"kind":"click","target":{"role":"button","name":"Record confirmed payment"}}`.

Evidence: controls.

## 07 · Scene 03

For courier-collected cash on delivery, use the courier collection workflow with actual collection evidence.

Focus: `{"role":"heading","name":"Payment evidence"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders/{{paidOrderId}}"}`.

Evidence: persisted-example. Visible label: Payment receipt example.

Required API checks: `[{"path":"/admin/orders/{{paidOrderId}}","field":"paymentStatus","equals":"paid"}]`

## 08 · Scene 03

Do not invent a manual receipt to make an unpaid order appear paid.

Focus: `{"role":"heading","name":"Totals"}`

Evidence: persisted-example. Visible label: Payment receipt example.

Required API checks: `[{"path":"/admin/orders/{{paidOrderId}}","field":"paymentStatus","equals":"paid"}]`

## 09 · Scene 04

If a receipt was recorded by mistake, use Correct mistaken receipt and explain the correction. Preserve the receipt history.

Focus: `{"role":"heading","name":"Payment evidence"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{paidOrderId}}"}`.

Evidence: persisted-example. Visible label: Payment receipt example.

Required API checks: `[{"path":"/admin/orders/{{paidOrderId}}","field":"paymentStatus","equals":"paid"},{"path":"/admin/orders/{{paidOrderId}}","field":"payments.0.entryType","equals":"receipt"}]`

## 10 · Scene 04

Check the updated net received and outstanding values before fulfilment or completion.

Focus: `{"role":"heading","name":"Totals"}`

Evidence: persisted-example. Visible label: Payment receipt example.

Required API checks: `[{"path":"/admin/orders/{{paidOrderId}}","field":"paymentStatus","equals":"paid"},{"path":"/admin/orders/{{paidOrderId}}","field":"payments.0.entryType","equals":"receipt"}]`
