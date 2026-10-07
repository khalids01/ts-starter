# Synchronized production: Configure product attributes and options

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Attributes describe product details and selectable options. Open Catalog, then Attributes. Reuse a well-defined field instead of creating several fields that mean the same thing. The category template decides where and how the field is used.

Focus: `{"role":"tab","name":"Attributes"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Attributes"}}`.

Evidence: controls.

## 02 · Scene 02

Select Attribute and enter a name, slug and field type.

Focus: `{"field":"Name","dialog":"Create attribute"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Attributes"}}`; `{"kind":"click","target":{"role":"button","name":"Attribute"}}`.

Evidence: controls.

## 03 · Scene 02

Choose a type that matches the information: text, number or a supported choice type.

Focus: `{"field":"Type","dialog":"Create attribute"}`

Evidence: controls.

## 04 · Scene 02

Assign relevant categories and decide whether customers should be able to filter by it.

Focus: `{"text":"Product categories","dialog":"Create attribute"}`

Evidence: controls.

## 05 · Scene 03

Save the attribute, then configure its supported values and template placement through the catalog controls.

Focus: `{"role":"button","name":"Save","dialog":"Create attribute"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Attributes"}}`; `{"kind":"click","target":{"role":"button","name":"Attribute"}}`.

Evidence: controls.

## 06 · Scene 03

Product details, variant options and inventory fields serve different purposes. A size option for a SKU is different from a descriptive specification.

Focus: `{"text":"Product categories","dialog":"Create attribute"}`

Evidence: controls.

## 07 · Scene 04

Open a prepared product to check the resulting fields. Required values must be present before readiness validation succeeds. Review existing category templates before removing values or making fields required; historical product data must remain understandable.

Focus: `{"text":"{{attributeName}}"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Attributes"}}`.

Evidence: controls.
