# Synchronized production: Upload, find and reuse images

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.
- The upload section selects the authored local SVG only to show the real file preview; it does not upload. The image library section requires a separately prepared Serve-hosted fictional image with originalName equal to imageName.

## 01 · Scene 01

The image library lets you upload and reuse assets across the admin panel. Open Images. Use files you own or have permission to publish, and keep sensitive documents out of the product image library.

Focus: `{"role":"heading","name":"Images"}`

Prepare frame: `{"kind":"goto","path":"/admin/images"}`.

Evidence: controls.

## 02 · Scene 02

Choose Upload images and select the intended files.

Focus: `{"role":"dialog","name":"Upload images"}`

Prepare frame: `{"kind":"goto","path":"/admin/images"}`; `{"kind":"click","target":{"role":"button","name":"Upload images"}}`.

Evidence: controls.

## 03 · Scene 02

Check the previews and add useful tags where supported.

Focus: `{"field":"Tags","dialog":"Upload images"}`

Prepare frame: `{"kind":"file","target":{"css":"input[type=\"file\"]","dialog":"Upload images"},"path":"tutorial/shared/assets/tutorial-product.svg"}`.

Evidence: controls.

## 04 · Scene 02

Wait for upload success before assuming an image is available.

Focus: `{"role":"dialog","name":"Upload images"}`

Evidence: controls.

## 05 · Scene 02

The file server must be configured and reachable.

Focus: `{"role":"dialog","name":"Upload images"}`

Evidence: controls.

## 06 · Scene 03

Use search, filters and the table or grid view to find assets.

Focus: `{"css":"input[placeholder=\"Search images\"]"}`

Prepare frame: `{"kind":"goto","path":"/admin/images"}`.

Evidence: controls.

## 07 · Scene 03

Preview an image and copy its public URL when appropriate.

Focus: `{"role":"button","name":"Copy URL","dialog":"{{imageName}}"}`

Prepare frame: `{"kind":"click","target":{"css":"button[title=\"List view\"]"}}`; `{"kind":"click","target":{"css":"tr:has(:text-is(\"{{imageName}}\")) button[title=\"Preview\"]"}}`.

Evidence: controls.

## 08 · Scene 03

Product and category image pickers can reuse library assets instead of uploading the same file repeatedly.

Focus: `{"role":"dialog","name":"{{imageName}}"}`

Evidence: controls.

## 09 · Scene 04

Before deleting an image, check where it is used. Removing an asset can affect existing product presentation. Verify the storefront image after changing a reference, and retain the approved source file for future revisions.

Focus: `{"role":"heading","name":"Images"}`

Prepare frame: `{"kind":"goto","path":"/admin/images"}`.

Evidence: controls.
