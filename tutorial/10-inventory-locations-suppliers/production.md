# Synchronized production: Manage inventory locations and suppliers

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Inventory locations identify where stock is held.

Focus: `{"role":"tab","name":"Locations"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Locations"}}`.

Evidence: controls.

## 02 · Scene 01

Suppliers record where it comes from.

Focus: `{"role":"tab","name":"Suppliers"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Suppliers"}}`.

Evidence: controls.

## 03 · Scene 01

Open Inventory and choose Locations or Suppliers. Prepare these records before receiving stock so inventory movements have the correct operational context.

Focus: `{"role":"tab","name":"Locations"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Locations"}}`.

Evidence: controls.

## 04 · Scene 02

In Locations, select Location and enter a recognizable name, a unique code and the address when needed.

Focus: `{"field":"Name","dialog":"Create location"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Locations"}}`; `{"kind":"click","target":{"role":"button","name":"Location"}}`.

Evidence: controls.

## 05 · Scene 02

Save, then confirm that the location is listed.

Focus: `{"role":"button","name":"Save","dialog":"Create location"}`

Evidence: controls.

## 06 · Scene 02

Choose a location that matches the physical stock, rather than assigning everything to an unrelated warehouse.

Focus: `{"field":"Code","dialog":"Create location"}`

Evidence: controls.

## 07 · Scene 03

In Suppliers, select Supplier and enter the known business and contact details.

Focus: `{"field":"Name","dialog":"Create supplier"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Suppliers"}}`; `{"kind":"click","target":{"role":"button","name":"Supplier"}}`.

Evidence: controls.

## 08 · Scene 03

Save and verify the record.

Focus: `{"role":"button","name":"Save","dialog":"Create supplier"}`

Evidence: controls.

## 09 · Scene 03

A supplier is optional when receiving stock, but an inventory location is required. Keep fictional contact details in demonstration recordings.

Focus: `{"field":"Name","dialog":"Create supplier"}`

Evidence: controls.

## 10 · Scene 04

Use the edit and disable controls deliberately. Disabling a location or supplier does not erase historical movements. Review any stock or dependency restrictions before changing a record that is already in use.

Focus: `{"text":"{{locationName}}"}`

Prepare frame: `{"kind":"goto","path":"/admin/inventory"}`; `{"kind":"click","target":{"role":"tab","name":"Locations"}}`.

Evidence: controls.
