# Synchronized production: Validate, activate and manage product visibility

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

A saved product is not automatically ready to sell.

Focus: `{"role":"heading","name":"Validate"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"7 Validate","exact":true}}`.

Evidence: controls.

## 02 · Scene 01

Open the product builder and choose Validate.

Focus: `{"role":"button","name":"7 Validate"}`

Evidence: controls.

## 03 · Scene 01

This step checks the configured requirements before activation. Resolve the actual errors instead of assuming that a saved form means the product is ready.

Focus: `{"role":"heading","name":"Validate"}`

Evidence: controls.

## 04 · Scene 02

Select Validate and read the result.

Focus: `{"role":"button","name":"Validate"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"7 Validate","exact":true}}`.

Evidence: controls.

## 05 · Scene 02

Required product fields, valid variants and inventory requirements can affect readiness. Use the relevant builder or inventory screen to fix each issue, then validate again.

Focus: `{"role":"heading","name":"Validate"}`

Evidence: controls.

## 06 · Scene 03

When readiness succeeds, select Activate product. Confirm the state change and open its storefront page to check what customers see.

Focus: `{"role":"button","name":"Activate product"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products/{{productId}}"}`; `{"kind":"click","target":{"role":"button","name":"7 Validate","exact":true}}`.

Evidence: controls.

## 07 · Scene 03

A product still needs available, eligible inventory and enabled checkout before a customer can complete an order.

Focus: `{"role":"button","name":"6 Inventory"}`

Evidence: controls.

## 08 · Scene 04

Use the product list and lifecycle actions to manage visibility over time.

Focus: `{"text":"{{productName}}"}`

Prepare frame: `{"kind":"goto","path":"/admin/products"}`; `{"kind":"goto","path":"/admin/products"}`.

Evidence: controls.

## 09 · Scene 04

Archive preserves a record separately from the active status.

Focus: `{"role":"tab","name":"Archived"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Archived"}}`.

Evidence: controls.

## 10 · Scene 04

Restore and permanent deletion have server checks.

Focus: `{"role":"tab","name":"Current"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Current"}}`.

Evidence: controls.

## 11 · Scene 04

After important edits, review readiness and storefront presentation again.

Focus: `{"text":"{{productName}}"}`

Evidence: controls.
