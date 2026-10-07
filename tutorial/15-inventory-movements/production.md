# Synchronized production: Trace inventory movement history

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Movement history explains how recorded stock changed. Open Inventory and choose Movements.

Focus: `{"role":"tab","name":"Movements"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Movements"}}`.

Evidence: controls.

## 02 · Scene 01

Use the SKU, location, quantity and event details to connect each movement to a receipt, order or adjustment.

Focus: `{"css":"thead th:text-is(\"Delta\")"}`

Evidence: controls.

## 03 · Scene 02

Start with the event you are investigating.

Focus: `{"css":"tr:has(td:text-is(\"{{sku}}\")) td:text-is(\"{{sku}}\")"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Movements"}}`.

Evidence: controls.

## 04 · Scene 02

Identify whether it received, committed, released or otherwise changed stock.

Focus: `{"css":"thead th:text-is(\"Type\")"}`

Evidence: controls.

## 05 · Scene 02

Read its quantity and any reason or reference.

Focus: `{"css":"thead th:text-is(\"Delta\")"}`

Evidence: controls.

## 06 · Scene 02

A list of movements is evidence of recorded operations, not proof that a physical count is correct.

Focus: `{"css":"thead th:text-is(\"Type\")"}`

Evidence: controls.

## 07 · Scene 03

Compare the movement with the related stock row and order timeline.

Focus: `{"css":"tr:has(td:text-is(\"{{sku}}\")) td:text-is(\"{{sku}}\")"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Stock"}}`; `{"kind":"click","target":{"role":"tab","name":"Stock"}}`.

Evidence: controls.

## 08 · Scene 03

Reservations and commitments have different effects.

Focus: `{"css":"thead th:text-is(\"Reserved\")"}`

Evidence: controls.

## 09 · Scene 03

A return or cancellation does not always mean that goods are physically back in a sellable location.

Focus: `{"css":"thead th:text-is(\"Available\")"}`

Evidence: controls.

## 10 · Scene 04

If the history and physical stock disagree, investigate first. Record a justified adjustment or recovery through the appropriate controls. Preserve the existing history so another operator can understand what happened.

Focus: `{"role":"tab","name":"Movements"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Movements"}}`.

Evidence: controls.
