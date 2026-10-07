# Synchronized production: Record an inventory adjustment

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

An adjustment records a verified change to a stock quantity. Use it after counting stock or investigating a discrepancy, not to hide an unexplained order or movement. Open Inventory and choose Adjustments.

Focus: `{"role":"tab","name":"Adjustments"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Adjustments"}}`.

Evidence: controls.

## 02 · Scene 02

Select the exact stock row. Check its SKU, location and current availability.

Focus: `{"field":"Stock row"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Adjustments"}}`.

Evidence: controls.

## 03 · Scene 02

Enter Delta as the change: a positive value adds quantity, and a negative value removes quantity. Delta is not the new total you want to display.

Focus: `{"field":"Delta"}`

Evidence: controls.

## 04 · Scene 03

Enter unit cost when it applies and give a clear reason explaining the evidence behind the change.

Focus: `{"field":"Reason"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Adjustments"}}`.

Evidence: controls.

## 05 · Scene 03

Review the numbers, then submit the adjustment.

Focus: `{"role":"button","name":"Adjust stock"}`

Evidence: controls.

## 06 · Scene 03

Server checks may block changes that would make stock invalid or conflict with reserved or tracked inventory.

Focus: `{"field":"Delta"}`

Evidence: controls.

## 07 · Scene 04

Return to Stock and Movements.

Focus: `{"role":"tab","name":"Stock"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Movements"}}`; `{"kind":"click","target":{"role":"tab","name":"Stock"}}`.

Evidence: controls.

## 08 · Scene 04

Confirm the resulting quantity and the adjustment record, including its reason. If it is wrong, investigate and record a justified correction rather than making repeated unexplained changes.

Focus: `{"role":"tab","name":"Movements"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Movements"}}`.

Evidence: controls.
