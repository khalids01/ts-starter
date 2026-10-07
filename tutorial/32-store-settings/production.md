# Synchronized production: Configure store details and checkout defaults

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Store settings contains the core values used by checkout and new orders. Open Store settings.

Focus: `{"role":"heading","name":"Store settings"}`

Prepare frame: `{"kind":"goto","path":"/admin/store-settings"}`.

Evidence: controls.

## 02 · Scene 01

Use approved store and support details so customer-facing information is accurate and your team can receive enquiries.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Store details\")"}`

Evidence: controls.

## 03 · Scene 02

Review store name, support email and support phone.

Focus: `{"field":"Store name"}`

Prepare frame: `{"kind":"goto","path":"/admin/store-settings"}`.

Evidence: controls.

## 04 · Scene 02

Configure a three-letter currency code and the supported order-number prefix.

Focus: `{"field":"Default currency"}`

Evidence: controls.

## 05 · Scene 02

The reservation duration controls how long a new checkout can hold stock; choose a value that fits your operation.

Focus: `{"field":"Inventory reservation (minutes)"}`

Evidence: controls.

## 06 · Scene 03

Enable checkout when the store is ready to accept orders.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Checkout\")"}`

Prepare frame: `{"kind":"goto","path":"/admin/store-settings"}`.

Evidence: controls.

## 07 · Scene 03

If pausing it, write a clear checkout notice.

Focus: `{"field":"Checkout notice"}`

Evidence: controls.

## 08 · Scene 03

Disabling checkout does not hide the entire storefront.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Checkout\")"}`

Evidence: controls.

## 09 · Scene 03

Save settings and wait for confirmation.

Focus: `{"role":"button","name":"Save settings"}`

Evidence: controls.

## 10 · Scene 04

Reload the page to confirm persistence, and verify a supervised checkout where relevant. Core settings are not editable home-page body content.

Focus: `{"role":"heading","name":"Store settings"}`

Prepare frame: `{"kind":"goto","path":"/admin/store-settings"}`.

Evidence: controls.

## 11 · Scene 04

Page SEO has its own draft and publication workflow below these settings.

Focus: `{"css":"section[aria-label=\"Website SEO\"]"}`

Evidence: controls.
