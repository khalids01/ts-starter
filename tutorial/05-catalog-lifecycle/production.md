# Synchronized production: Archive, restore and safely delete catalog records

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Archive moves a catalog record out of the current working list while preserving its history.

Focus: `{"role":"tab","name":"Current"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Categories"}}`.

Evidence: controls.

## 02 · Scene 01

In Catalog, choose Categories, Attributes or Brands.

Focus: `{"role":"tab","name":"Categories"}`

Evidence: controls.

## 03 · Scene 01

Current and Archived are separate views; changing an active flag is not the same operation as archiving.

Focus: `{"role":"tab","name":"Archived"}`

Evidence: controls.

## 04 · Scene 02

Find the intended record and open its row menu. Choose Archive and read the confirmation before accepting.

Focus: `{"text":"{{categoryName}}"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Categories"}}`.

Evidence: controls.

## 05 · Scene 02

Check that the record disappears from Current and appears in Archived. Dependencies and permissions are still enforced by the server.

Focus: `{"role":"tab","name":"Archived"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Archived"}}`.

Evidence: controls.

## 06 · Scene 03

To bring a record back, open Archived and use Restore. Read any dependency message: a referenced category, brand or option may need attention before recovery is allowed.

Focus: `{"role":"tab","name":"Archived"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Categories"}}`; `{"kind":"click","target":{"role":"tab","name":"Archived"}}`.

Evidence: controls.

## 07 · Scene 03

Return to Current to confirm the result.

Focus: `{"role":"tab","name":"Current"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Current"}}`.

Evidence: controls.

## 08 · Scene 04

Permanent deletion is for eligible records that can be safely removed. Read the dependency checks instead of repeatedly forcing the action. A record used by products or historical data may be blocked. Preserve history whenever deleting would break a valid reference.

Focus: `{"role":"tab","name":"Current"}`

Prepare frame: `{"kind":"goto","path":"/admin/catalog"}`; `{"kind":"click","target":{"role":"tab","name":"Categories"}}`; `{"kind":"click","target":{"role":"tab","name":"Current"}}`.

Evidence: controls.
