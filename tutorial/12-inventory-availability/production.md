# Synchronized production: Understand on-hand, reserved and available stock

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Stock quantities describe different things.

Focus: `{"role":"tab","name":"Stock"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Stock"}}`.

Evidence: controls.

## 02 · Scene 01

On-hand is physical inventory recorded at a location.

Focus: `{"css":"thead th:text-is(\"On hand\")"}`

Evidence: controls.

## 03 · Scene 01

Reserved stock is held for an order.

Focus: `{"css":"thead th:text-is(\"Reserved\")"}`

Evidence: controls.

## 04 · Scene 01

Available stock is the quantity still eligible to sell.

Focus: `{"css":"thead th:text-is(\"Available\")"}`

Evidence: controls.

## 05 · Scene 01

Open Inventory and use Stock to inspect these values together.

Focus: `{"role":"tab","name":"Stock"}`

Evidence: controls.

## 06 · Scene 02

Check the SKU, location and batch before reading a quantity.

Focus: `{"css":"tr:has(td:text-is(\"{{sku}}\")) td:text-is(\"{{sku}}\")"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Stock"}}`.

Evidence: controls.

## 07 · Scene 02

Expiry or unavailable-from rules and serialized unit eligibility can affect what is sellable.

Focus: `{"css":"thead th:text-is(\"Expiry / safety\")"}`

Evidence: controls.

## 08 · Scene 02

Do not treat every physical unit as available to a new customer.

Focus: `{"css":"thead th:text-is(\"Available\")"}`

Evidence: controls.

## 09 · Scene 03

A checkout reservation holds the requested quantity. Confirming an order commits the inventory for fulfilment. Releasing a reservation and physically returning committed stock are different operations and must follow the corresponding order controls.

Focus: `{"role":"tab","name":"Movements"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Movements"}}`.

Evidence: controls.

## 10 · Scene 04

Use Movements to investigate a discrepancy before making an adjustment. Compare the order history with the SKU and location. This screen is a view of recorded state; changing a product price or active status does not correct a physical stock count.

Focus: `{"role":"tab","name":"Movements"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Movements"}}`.

Evidence: controls.
