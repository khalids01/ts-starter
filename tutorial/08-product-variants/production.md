# Synchronized production: Configure SKUs, variants and pricing

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.
- Prepare exactly one saved variant. Scene 02 adds and expands a second unsaved variant; scenes 03–04 reopen the original saved SKU. No variant save is submitted.

## 01 · Scene 01

A variant is the sellable option customers purchase. Even a simple product needs a valid SKU.

Focus: `{"role":"heading","name":"Variants"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"5 Variants","exact":true}}`.

Evidence: controls.

## 02 · Scene 01

Open the product builder and choose Variants.

Focus: `{"role":"button","name":"5 Variants"}`

Evidence: controls.

## 03 · Scene 01

Create separate variants when size, weight, colour or another selling option changes the item being sold.

Focus: `{"role":"heading","name":"Variants"}`

Evidence: controls.

## 04 · Scene 02

Add a variant and enter a unique SKU, customer-facing name, selling price and currency.

Focus: `{"css":"[data-slot=\"accordion-item\"]:last-child label:text-is(\"SKU\") + input"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"5 Variants","exact":true}}`; `{"kind":"click","target":{"role":"button","name":"Variant"}}`; `{"kind":"click","target":{"css":"[data-slot=\"accordion-item\"]:last-child [data-slot=\"accordion-trigger\"]"}}`.

Evidence: controls.

## 05 · Scene 02

A compare-at price is optional and must be higher than the selling price when used.

Focus: `{"css":"[data-slot=\"accordion-item\"]:last-child label:text-is(\"Compare at price\") + input"}`

Evidence: controls.

## 06 · Scene 02

Use prices you can justify, and choose the options required by the category.

Focus: `{"css":"[data-slot=\"accordion-item\"]:last-child label:text-is(\"Price\") + input"}`

Evidence: controls.

## 07 · Scene 03

Add an image and weight when appropriate.

Focus: `{"text":"Variant images"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"5 Variants","exact":true}}`.

Evidence: controls.

## 08 · Scene 03

Keep eligible variants active and choose the intended default.

Focus: `{"css":"label:has-text(\"Default variant\")"}`

Evidence: controls.

## 09 · Scene 03

Select Save variants, then wait for confirmation. Editing a price does not create physical stock; receive inventory separately.

Focus: `{"role":"button","name":"Save variants"}`

Evidence: controls.

## 10 · Scene 04

Reopen Variants and check the saved SKU, price, currency and default selection.

Focus: `{"field":"SKU"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"5 Variants","exact":true}}`.

Evidence: controls.

## 11 · Scene 04

Validate the product before activation.

Focus: `{"role":"button","name":"7 Validate"}`

Evidence: controls.

## 12 · Scene 04

Serialized items and expiring stock have extra inventory requirements, so variant setup alone is not enough to make every product purchasable.

Focus: `{"role":"button","name":"6 Inventory"}`

Evidence: controls.
