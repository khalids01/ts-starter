# Synchronized production: Create and manage product brands

Capture mode: **workflow**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Brands identify who makes or owns a product. Open Catalog, then Brands. Use accurate brand names and owned or approved logo images. A brand is a catalog record; it does not change the deployment brand or the shop itself.

Focus: `{"role":"tab","name":"Brands"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Brands"}}`.

Evidence: controls.

## 02 · Scene 02

Select Brand.

Focus: `{"role":"dialog","name":"Create brand"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Brands"}}`; `{"kind":"click","target":{"role":"button","name":"Brand"}}`.

Evidence: controls.

## 03 · Scene 02

Enter its name and slug.

Focus: `{"field":"Name","dialog":"Create brand"}`

Evidence: controls.

## 04 · Scene 02

You can add a logo, website URL and description when those details are known.

Focus: `{"field":"Website URL","dialog":"Create brand"}`

Evidence: controls.

## 05 · Scene 02

Active and featured control the record state and presentation.

Focus: `{"css":"label:has-text(\"Active\")","dialog":"Create brand"}`

Evidence: controls.

## 06 · Scene 02

Leave optional facts empty rather than inventing them.

Focus: `{"field":"Website URL","dialog":"Create brand"}`

Evidence: controls.

## 07 · Scene 03

Save the brand and check that it appears in the list. When editing a product, its category brand policy decides whether a brand is optional, required or unavailable. Selecting a brand does not create inventory or activate the product.

Focus: `{"text":"{{brandName}}"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Brands"}}`; `{"kind":"click","target":{"role":"button","name":"Brand"}}`; `{"kind":"fill","target":{"field":"Name"},"value":"{{brandName}}"}`; `{"kind":"fill","target":{"field":"Slug"},"value":"{{brandSlug}}"}`; `{"kind":"submit","target":{"role":"button","name":"Save"},"capture":{"key":"brandId","responsePath":"/admin/catalog/brands","field":"id"}}`; `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Brands"}}`.

Evidence: persisted-result.

Required API checks: `[{"path":"/admin/catalog/brands?search={{brandName}}&limit=100","field":"items.0.name","equals":"{{brandName}}"},{"path":"/admin/catalog/brands?search={{brandName}}&limit=100","field":"items.0.id","equals":"{{brandId}}"}]`

## 08 · Scene 04

Use the row actions to edit a brand.

Focus: `{"text":"{{brandName}}"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Brands"}}`.

Evidence: controls.

## 09 · Scene 04

Archive and restore belong to the catalog lifecycle workflow.

Focus: `{"role":"tab","name":"Archived"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Archived"}}`.

Evidence: controls.

## 10 · Scene 04

Permanent deletion is guarded by dependencies; a brand already referenced by other records may need to remain available as history.

Focus: `{"text":"{{brandName}}"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Current"}}`.

Evidence: controls.
