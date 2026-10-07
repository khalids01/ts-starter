# Synchronized production: Create a product draft

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.
- Use an optional-brand category and a prepared draft product with that same category. Scene 02 fills only unsaved Basics fields; later scenes reopen the prepared draft.

## 01 · Scene 01

A product begins as a draft.

Focus: `{"role":"heading","name":"Products"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`.

Evidence: controls.

## 02 · Scene 01

Open Products and select Product to start the builder.

Focus: `{"role":"link","name":"Product"}`

Evidence: controls.

## 03 · Scene 01

This tutorial covers category selection and basic information. Stock, variants and activation are separate steps, so saving a draft does not make it purchasable.

Focus: `{"role":"heading","name":"Products"}`

Evidence: controls.

## 04 · Scene 02

Choose the category that matches the product. Read the field summary and brand policy before continuing.

Focus: `{"field":"Category"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/new"}`; `{"kind":"select","target":{"field":"Category"},"option":"{{categoryName}}"}`.

Evidence: controls.

## 05 · Scene 02

Open Basics and enter an accurate name and description.

Focus: `{"field":"Name"}`

Prepare frame: `{"kind":"click","target":{"role":"button","name":"2 Basics"}}`; `{"kind":"fill","target":{"field":"Name"},"value":"{{productName}}"}`; `{"kind":"fill","target":{"field":"Description"},"value":"Fictional product for the admin guide."}`.

Evidence: controls.

## 06 · Scene 02

The slug forms the readable part of its address and must be suitable for this item.

Focus: `{"field":"Slug"}`

Prepare frame: `{"kind":"fill","target":{"field":"Slug"},"value":"{{productName}}"}`.

Evidence: controls.

## 07 · Scene 03

Choose a brand when allowed or required, and add an approved cover image.

Focus: `{"text":"Brand"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"2 Basics","exact":true}}`.

Evidence: controls.

## 08 · Scene 03

Featured, Trending and search keywords are optional presentation choices.

Focus: `{"css":"label:has-text(\"Featured\")"}`

Evidence: controls.

## 09 · Scene 03

SEO title and description are optional overrides.

Focus: `{"field":"SEO title"}`

Evidence: controls.

## 10 · Scene 03

Select Save basics and wait for the success message.

Focus: `{"role":"button","name":"Save basics"}`

Evidence: controls.

## 11 · Scene 04

The builder now opens the saved product. Confirm the name and category, then continue with specifications, highlights and variants.

Focus: `{"field":"Name"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"2 Basics","exact":true}}`.

Evidence: controls.

## 12 · Scene 04

The product remains a draft until its readiness checks pass and you activate it.

Focus: `{"role":"button","name":"7 Validate"}`

Evidence: controls.
