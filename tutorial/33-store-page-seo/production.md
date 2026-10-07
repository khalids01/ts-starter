# Synchronized production: Save and publish home and about page SEO

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Page SEO controls metadata for the home and about pages. Open Store settings and locate Website SEO.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Home page SEO\")"}`

Prepare frame: `{"kind":"goto","path":"/admin/store-settings"}`.

Evidence: controls.

## 02 · Scene 01

These fields change titles, descriptions and social images; they do not edit the body content of those pages.

Focus: `{"css":"#home-seo-title"}`

Evidence: controls.

## 03 · Scene 02

Choose the relevant page and enter a concise title and description based on approved facts.

Focus: `{"css":"#home-seo-title"}`

Prepare frame: `{"kind":"goto","path":"/admin/store-settings"}`.

Evidence: controls.

## 04 · Scene 02

Select an appropriate image when needed.

Focus: `{"css":"#home-seo-image"}`

Evidence: controls.

## 05 · Scene 02

Review the current revision and state so you do not overwrite someone else's changes without noticing.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Home page SEO\")"}`

Evidence: controls.

## 06 · Scene 03

Save the draft first.

Focus: `{"css":"[data-slot=\"card\"]:has(#home-seo-title) button:text-is(\"Save draft\")"}`

Prepare frame: `{"kind":"goto","path":"/admin/store-settings"}`.

Evidence: controls.

## 07 · Scene 03

A saved draft is separate from the published metadata.

Focus: `{"css":"[data-slot=\"card\"]:has(#home-seo-title) button:text-is(\"Publish SEO\")"}`

Evidence: controls.

## 08 · Scene 03

Review it before using the publish control, and resolve any revision conflict by reloading and comparing the changes.

Focus: `{"css":"[data-slot=\"card\"]:has(#home-seo-title) button:text-is(\"Reload saved version\")"}`

Evidence: controls.

## 09 · Scene 04

After publication, inspect the public page metadata and preview where supported. Publishing code or building the app does not establish that the storage prerequisite exists. If persistence fails, resolve that prerequisite before describing the metadata as published.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Home page SEO\")"}`

Prepare frame: `{"kind":"goto","path":"/admin/store-settings"}`.

Evidence: controls.
