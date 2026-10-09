# Synchronized production: Create categories and configure handling

Capture mode: **workflow**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Categories organize your catalog and determine the fields and handling rules used by products. Open Catalog and stay on Categories.

Focus: `{"role":"tab","name":"Categories"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`.

Evidence: controls.

## 02 · Scene 01

Plan the category before adding products, because food, clothing and gadgets have different requirements.

Focus: `{"role":"heading","name":"Catalog"}`

Evidence: controls.

## 03 · Scene 02

Select Category.

Focus: `{"role":"dialog","name":"Create category"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"button","name":"Category"}}`.

Evidence: controls.

## 04 · Scene 02

Enter a clear name and readable slug.

Focus: `{"field":"Name","dialog":"Create category"}`

Prepare frame: `{"kind":"fill","target":{"field":"Name","dialog":"Create category"},"value":"{{categoryName}}"}`; `{"kind":"fill","target":{"field":"Slug","dialog":"Create category"},"value":"{{categorySlug}}"}`.

Evidence: controls.

## 05 · Scene 02

A parent creates a hierarchy.

Focus: `{"field":"Parent","dialog":"Create category"}`

Evidence: controls.

## 06 · Scene 02

Choose the brand policy

Focus: `{"field":"Brand policy","dialog":"Create category"}`

Evidence: controls.

## 060 · Scene 02

and product handling deliberately: standard, packaged food, fresh food, gadget or clothing. Handling is configured on each category and is not inherited from its parent.

Focus: `{"css":"[role=listbox]","within":"page"}`

Prepare frame: `{"kind":"click","target":{"field":"Product handling","dialog":"Create category"}}`.

Evidence: controls.

## 07 · Scene 03

For a gadget category, configure unit tracking

Focus: `{"field":"Unit tracking","dialog":"Create category"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"button","name":"Category"}}`; `{"kind":"select","target":{"field":"Product handling","dialog":"Create category"},"option":"Gadget"}`; `{"kind":"fill","target":{"field":"Name","dialog":"Create category"},"value":"{{categoryName}}"}`; `{"kind":"fill","target":{"field":"Slug","dialog":"Create category"},"value":"{{categorySlug}}"}`; `{"kind":"select","target":{"field":"Unit tracking","dialog":"Create category"},"option":"Serial"}`.

Evidence: controls.

## 070 · Scene 03

and warranty days when they apply.

Focus: `{"field":"Warranty days from delivery (0 disables)","dialog":"Create category"}`

Prepare frame: `{"kind":"fill","target":{"field":"Warranty days from delivery (0 disables)","dialog":"Create category"},"value":"365"}`.

Evidence: controls.

## 08 · Scene 03

Food and clothing cannot have a warranty.

Focus: `{"field":"Product handling","dialog":"Create category"}`

Prepare frame: `{"kind":"select","target":{"field":"Product handling","dialog":"Create category"},"option":"Clothing"}`.

Evidence: controls.

## 09 · Scene 03

Use the active and featured choices to control availability and presentation,

Focus: `{"css":"label:has-text(\"Active\") >> ..","dialog":"Create category"}`

Evidence: controls.

## 090 · Scene 03

then save the category.

Focus: `{"text":"{{categoryName}}"}`

Prepare frame: `{"kind":"submit","target":{"role":"button","name":"Save"},"capture":{"key":"categoryId","responsePath":"/admin/catalog/categories","field":"id"}}`; `{"kind":"goto","path":"/admin/catalog"}`.

Evidence: persisted-result.

Required API checks: `[{"path":"/admin/catalog/categories/{{categoryId}}","field":"name","equals":"{{categoryName}}"}]`

## 10 · Scene 04

Return to the category list and confirm the saved name

Focus: `{"text":"{{categoryName}}"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`.

Evidence: persisted-result.

Required API checks: `[{"path":"/admin/catalog/categories/{{categoryId}}","field":"name","equals":"{{categoryName}}"}]`

## 100 · Scene 04

and handling.

Focus: `{"field":"Product handling","dialog":"Edit category"}`

Prepare frame: `{"kind":"click","target":{"role":"button","name":"Open category actions","row":"{{categoryName}}"}}`; `{"kind":"click","target":{"role":"menuitem","name":"Edit","within":"page"}}`.

Evidence: persisted-result.

Required API checks: `[{"path":"/admin/catalog/categories/{{categoryId}}","field":"name","equals":"{{categoryName}}"},{"path":"/admin/catalog/categories/{{categoryId}}","field":"fulfillmentKind","equals":"clothing"}]`

## 11 · Scene 04

Category template fields are configured through the category controls and determine what appears in the product builder. Changing a template is a catalog decision; review existing products before changing required fields.

Focus: `{"role":"menuitem","name":"Template","within":"page"}`

Prepare frame: `{"kind":"key","key":"Escape"}`; `{"kind":"click","target":{"role":"button","name":"Open category actions","row":"{{categoryName}}"}}`.

Evidence: persisted-result.

Required API checks: `[{"path":"/admin/catalog/categories/{{categoryId}}","field":"name","equals":"{{categoryName}}"}]`
