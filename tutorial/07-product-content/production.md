# Synchronized production: Edit specifications, highlights and images

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Product content helps customers understand what they are buying. Open the product builder for the item. Specifications come from the category template; highlights are short factual selling points; images show the product itself.

Focus: `{"role":"heading","name":"Basics"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"2 Basics","exact":true}}`.

Evidence: controls.

## 02 · Scene 02

Open Specs and complete required fields using accurate values.

Focus: `{"role":"heading","name":"Specs"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"3 Specs","exact":true}}`.

Evidence: controls.

## 03 · Scene 02

Save specs before moving on.

Focus: `{"role":"button","name":"Save specs"}`

Evidence: controls.

## 04 · Scene 02

If there are no configured specification fields, review the category template rather than inventing unrelated details.

Focus: `{"role":"heading","name":"Specs"}`

Evidence: controls.

## 05 · Scene 03

Open Highlights, add a concise title and description, then save.

Focus: `{"field":"Title"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"4 Highlights","exact":true}}`; `{"kind":"click","target":{"role":"button","name":"Highlight"}}`.

Evidence: controls.

## 06 · Scene 03

Use facts such as material, origin or storage guidance.

Focus: `{"field":"Description"}`

Evidence: controls.

## 07 · Scene 03

In Basics, choose a clean cover image through the image picker.

Focus: `{"text":"Cover image"}`

Prepare frame: `{"kind":"click","target":{"role":"button","name":"2 Basics"}}`.

Evidence: controls.

## 08 · Scene 03

Variant images are configured separately when selling options need different pictures.

Focus: `{"role":"button","name":"5 Variants"}`

Prepare frame: `{"kind":"click","target":{"role":"button","name":"5 Variants"}}`.

Evidence: controls.

## 09 · Scene 04

Reopen the product to confirm the saved content.

Focus: `{"field":"Name"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"2 Basics","exact":true}}`.

Evidence: controls.

## 10 · Scene 04

Check readability and the image preview.

Focus: `{"text":"Cover image"}`

Evidence: controls.

## 11 · Scene 04

Content changes do not replace stock or readiness checks. Validate the product after meaningful changes, and review its storefront presentation when it is active.

Focus: `{"role":"button","name":"7 Validate"}`

Evidence: controls.
