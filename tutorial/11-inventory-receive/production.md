# Synchronized production: Receive stock into inventory

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Receive records stock that has physically arrived. Open Inventory and choose Receive.

Focus: `{"role":"tab","name":"Receive"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Receive"}}`.

Evidence: controls.

## 02 · Scene 01

Check the product, SKU and location against the goods in front of you.

Focus: `{"field":"Product"}`

Evidence: controls.

## 03 · Scene 01

Receiving the wrong selling option can make stock appear available for an item you do not actually hold.

Focus: `{"field":"SKU"}`

Evidence: controls.

## 04 · Scene 02

Select the product, its SKU and location, then enter the quantity received.

Focus: `{"field":"Product"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Receive"}}`.

Evidence: controls.

## 05 · Scene 02

Add the supplier, batch number, unit cost and reorder level when relevant.

Focus: `{"field":"Batch number"}`

Evidence: controls.

## 06 · Scene 02

Unavailable-from is a local date and time after which that stock must not be offered.

Focus: `{"field":"Unavailable from (local date and time)"}`

Evidence: controls.

## 07 · Scene 03

Complete any inventory fields required by the category.

Focus: `{"field":"Batch number"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Receive"}}`.

Evidence: controls.

## 08 · Scene 03

For serialized gadgets, receiving quantity and registering identifiable units are separate requirements.

Focus: `{"field":"Quantity"}`

Evidence: controls.

## 09 · Scene 03

Select Receive stock only after checking the details, and wait for the success state.

Focus: `{"role":"button","name":"Receive stock"}`

Evidence: controls.

## 10 · Scene 04

Open Stock and Movements to verify the receipt.

Focus: `{"role":"tab","name":"Stock"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Stock"}}`.

Evidence: controls.

## 11 · Scene 04

The expected row should show the received quantity at the correct location, with the movement retained in history. Product activation and checkout eligibility are separate from this inventory receipt.

Focus: `{"role":"tab","name":"Movements"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Movements"}}`.

Evidence: controls.
