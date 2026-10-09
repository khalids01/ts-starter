# Synchronized production: Register gadget serial numbers and IMEIs

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Serialized inventory connects a physical gadget to its unique identifiers. The category decides whether serial numbers, IMEIs or both are required. Receive the stock first, then open Inventory and use the gadget unit registration section.

Focus: `{"role":"heading","name":"Register gadget unit"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Stock"}}`.

Evidence: controls.

## 02 · Scene 02

Choose the correct stock row.

Focus: `{"css":"label:text-is(\"Received stock\") + select"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Stock"}}`.

Evidence: controls.

## 03 · Scene 02

Enter the identifiers exactly as recorded on the unit and check them against the physical unit. Use fictional identifiers in a tutorial environment.

Focus: `{"css":"label:has-text(\"Serial\") input"}`

Evidence: controls.

## 04 · Scene 02

An identifier must not be reused for a different unit.

Focus: `{"css":"label:has-text(\"IMEI\") input"}`

Evidence: controls.

## 05 · Scene 03

Register each required unit and check the resulting inventory information.

Focus: `{"role":"button","name":"Register unit"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Stock"}}`.

Evidence: controls.

## 06 · Scene 03

Receiving a quantity alone does not prove that eligible identifiable units exist.

Focus: `{"css":"label:text-is(\"Received stock\") + select"}`

Evidence: controls.

## 07 · Scene 03

Assignment to an order must use the units that will actually be handed over.

Focus: `{"role":"button","name":"Register unit"}`

Evidence: controls.

## 08 · Scene 04

Keep the unit history when a gadget is shipped, returned or inspected. Warranty depends on the gadget policy and delivery evidence. Never duplicate the same physical item by adding aggregate stock after it has already been received and registered.

Focus: `{"role":"tab","name":"Movements"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Movements"}}`.

Evidence: controls.
