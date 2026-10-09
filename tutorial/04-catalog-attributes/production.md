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

Select Attribute

Focus: `{"role":"dialog","name":"Create attribute"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Attributes"}}`; `{"kind":"click","target":{"role":"button","name":"Attribute"}}`.

Evidence: controls.

## 03 · Scene 02

and enter a name,

Focus: `{"field":"Name","dialog":"Create attribute"}`

Prepare frame: `{"kind":"fill","target":{"field":"Name","dialog":"Create attribute"},"value":"{{attributeName}}"}`.

Evidence: controls.

## 04 · Scene 02

slug

Focus: `{"field":"Slug","dialog":"Create attribute"}`

Prepare frame: `{"kind":"fill","target":{"field":"Slug","dialog":"Create attribute"},"value":"{{attributeSlug}}"}`.

Evidence: controls.

## 05 · Scene 02

and field type.

Focus: `{"field":"Type","dialog":"Create attribute"}`

Evidence: controls.

## 06 · Scene 02

Choose a type that matches the information: text, number or a supported choice type.

Focus: `{"field":"Type","dialog":"Create attribute"}`

Evidence: controls.

## 07 · Scene 02

Assign relevant categories

Focus: `{"text":"Product categories","dialog":"Create attribute"}`

Evidence: controls.

## 08 · Scene 02

and decide whether customers should be able to filter by it.

Focus: `{"css":"label:has-text(\"Filterable\")","dialog":"Create attribute"}`

Evidence: controls.

## 09 · Scene 03

Save the attribute, then configure its supported values and template placement through the catalog controls.

Focus: `{"role":"button","name":"Save","dialog":"Create attribute"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Attributes"}}`; `{"kind":"click","target":{"role":"button","name":"Attribute"}}`.

Evidence: controls.

## 10 · Scene 03

Product details, variant options and inventory fields serve different purposes. A size option for a SKU is different from a descriptive specification.

Focus: `{"text":"{{attributeName}}"}`

Prepare frame: `{"kind":"key","key":"Escape"}`.

Evidence: controls.

## 11 · Scene 04

Open a prepared product to check the resulting fields. Required values must be present before readiness validation succeeds. Review existing category templates before removing values or making fields required; historical product data must remain understandable.

Focus: `{"css":"label:has-text(\"{{attributeName}}\") >> .."}`

Prepare frame: `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"3 Specs"}}`.

Evidence: controls.
