# Admin tutorial library

All tutorial content lives here, outside `docs/`. There are **43 focused tutorial packages**, plus the existing complete-workflow reference in `00-product-to-completed-order/`.

The admin UI reads the public metadata in `catalog.json`. `/admin/guide` provides search/category filters and permission-filtered videos, workflow diagrams and concise instructions. The small help button within each admin page opens its related topics without navigating away. Tutorial 01 uses the reviewed YouTube upload; future videos are added after review.

## Folder structure

```text
tutorial/
  catalog.json                     # shared public library metadata
  shared/
    cli.ts                         # list / record / render / publish
    record.ts                      # guarded per-scene Playwright capture
    render.ts                      # audio-based scene assembly
    publish.ts                     # explicit reviewed-artifact publication
    cursor.ts                      # cursor, click ripple and highlighting
    types.ts
  01-admin-overview/
    narration.txt                  # exact narration to read, four paragraphs
    storyboard.md                  # narration + UI actions by section
    tutorial.json                  # executable recording plan
    record.ts                      # standalone recording entry point
    render.ts                      # standalone rendering entry point
    fixtures.example.json          # copied locally and filled before capture
    media.example.json             # HTTPS media URLs after upload
    recording-checklist.md
    README.md
    audio/
      README.md
      cues.example.json
    artifacts/                     # generated locally, ignored by Git
```

Every focused folder has this structure. Local fixtures, supplied audio and recordings are ignored by Git. Existing accepted files from the original tutorial were moved intact to `00-product-to-completed-order/`.

## What is ready, and what remains

Ready: the 43 narration scripts, explicit storyboards/action plans, folder entry points, shared capture/render/review tools, library page and contextual help UI.

Tutorial 01 has a generated, reviewed and uploaded narrated video. Other recording plans still need their own runtime review. A script or TypeScript build is not workflow acceptance.

Plans declare either `walkthrough` (explain and show controls without submitting business writes) or `workflow` (perform a real write and verify its persisted outcome). The category and brand creation packages contain submit/capture/cleanup plans. The other packages currently provide control walkthroughs. Before turning one into a full state-transition demonstration, extend its reviewed actions, prepare owned fixtures and add persisted checks/cleanup. Do not claim a walkthrough proved a saved payment, shipment, refund or other state transition.

Advanced topics additionally depend on the application's actual prerequisites: SEO storage, appropriate category policies, serialized inventory, refund/recovery eligibility and the local courier simulator. These are not provisioned automatically.

## Audio workflow

For each tutorial, read `narration.txt` as written without filenames, headings or stage directions. Prefer a calm, natural pace. Do not shorten a sentence just to fit an old timestamp: the new pipeline uses the supplied audio as its timeline.

Two input options:

1. **Preferred:** one file per paragraph/scene: `audio/01.wav`, `02.wav`, `03.wav`, `04.wav`. MP3 and M4A also work. Put a short pause at the end of each section.
2. **Single recording:** `audio/narration.wav` (MP3/M4A supported) plus `audio/cues.json`, copied from the example and filled with measured start/end seconds for each paragraph. Cue times are taken from actual speech, not guessed from text.

No empty audio file or fake caption timing is supplied. If professionally timed captions are available, place `audio/captions.vtt` alongside the audio. Otherwise the renderer writes **draft** sentence timings, which must be corrected/reviewed against speech before publication.

## Recording prerequisites

Recording does not start or stop servers, reset databases, apply migrations or provision accounts. Use the existing guarded local E2E environment and prepared owner storage state at `tests/e2e/.auth/owner.json`.

The API/web must already be running on `localhost:3000` / `localhost:3001`, with the intended E2E DB/Redis. In the recorder environment and running API set `COURIER_WORKERS_ENABLED=false` and `ENABLE_POLAR=false`. Any courier demonstration must use simulator-owned data; these plans never deliberately submit a live booking, request a pickup, collect money or send an invitation.

Copy the selected folder's `fixtures.example.json` to `fixtures.local.json`. Fill its real isolated IDs and values. Every `REPLACE` marker must be resolved before capture. Never copy development or production IDs. Use a `tutorial-...` ownership marker.

A workflow needs:

- Owned prerequisite checks when it uses existing resources.
- Persisted outcome checks for the demonstrated operation.
- Exact cleanup actions, each with a marker-ownership check.

The category/brand create plans capture the newly created ID from the real save response and use marker-checked archive/deletion cleanup. For any additional workflow, review the cleanup against the actual API. The recorder refuses incomplete workflow evidence and does not replace the success manifest after a failed capture/cleanup.

## Commands

Run from the project root:

```bash
bun run tutorial:list
bun run tutorial:check  # content/registry consistency; no browser or database access

# Only after authorizing the selected isolated recording:
TUTORIAL_RECORD_APPROVED=true bun run tutorial:record admin-overview

# After supplying its audio:
bun run tutorial:render admin-overview
```

Recording captures each section as a separate real browser page/video. Each scene navigates independently, so a slow operation cannot shift every later scene against a global clock. Required highlights/targets are checked rather than silently ignored. Set `TUTORIAL_HEADED=true` if supervised capture is needed; cursor speed/typing options are in `shared/cursor.ts`.

Rendering produces `artifacts/<run-id>/render/video.mp4`, `poster.webp`, `captions.vtt` and `review.json`. It pads the settled screen to the narration duration. If action footage is longer than the section's audio, rendering fails instead of truncating a click/result. Revise the actions or narration section and render again.

Rendering needs ffmpeg/ffprobe installed. Playwright's Chromium and the frozen project dependencies are required for recording. No dependency install or browser recording has been run by this authoring change.

## Review and publication

Watch the entire output with audio. Check every narrated field/action, visible result, reading pause and caption. Set the review flags only for the exact approved artifact. Hashes tie approval to the current storyboard, video and captions.

Upload the approved MP4, poster and VTT to your chosen file storage in a separately authorized action. Copy `media.example.json` to `media.local.json` and enter the real HTTPS URLs. The media server must serve correct content types and allow the web origin to read video/captions using CORS. Confirm playback and captions after upload.

Only after explicit approval:

```bash
TUTORIAL_PUBLISH_APPROVED=true bun run tutorial:publish admin-overview
```

This updates the local catalog entry; it does not upload media, commit, push or deploy. Deploy the web app after reviewing the catalog change. The admin player never presents an unreviewed entry as a playable published video. Written guides remain available before video publication.

The catalog is bundled public instructional content, so it must never contain credentials, fixture IDs, personal data or confidential administration material. Permission filtering helps show relevant tutorials in the UI; it is not private media access control. Use authenticated media storage if the videos themselves must be private.

## Existing full workflow

The original continuous recording and audio are retained in `00-product-to-completed-order/`:

```bash
bun run tutorial:record:legacy
bun run tutorial:render:legacy
```

The legacy recorder still uses the old fixed narration timing and performs its existing owned-fixture operations. Its known delivery/closing timing concerns remain for review; moving it did not retime or re-record it. It is listed as a review candidate and is not automatically published.

## Production image packaging

Only `tutorial/catalog.json` is included in Docker's build context. Recorder scripts, fixtures, unpublished audio and artifacts are excluded. Large videos are served from media storage rather than bundled into the web image.

## Videos and workflow diagrams in Guide

The Guide library and contextual help popup use the same metadata in `catalog.json`.

- YouTube media: `provider: "youtube"`, `videoId`, measured `durationSec`, and the full `reviewedCommit` hash. The popup uses the privacy-enhanced YouTube iframe and a permanent Watch on YouTube fallback link. It mounts only while the topic is open and does not autoplay.
- File media: keep HTTPS `videoUrl`, `posterUrl` and `captionsUrl` (optional `provider: "file"`). Existing MP4 playback remains supported.
- Optional `instructions`: short practical steps for the popup. `steps` retains canonical narration paragraphs so authoring drift checks continue to work.
- Optional `diagram`: a title, description, rows of nodes, and named edges. Nodes have stable IDs, labels, short descriptions, and an optional `step`, `decision` or `success` kind. Every edge references two node IDs; branch labels such as Yes/No explain decisions. Diagrams use theme-aware native SVG, no external renderer or dependency. Scroll horizontally on small screens when a branch needs more room.

Add diagrams when a sequence, decision or independent money/stock path benefits from a visual. Simple guides do not need a diagram. Initial flows cover product activation, stock receipt, order confirmation, delivery/completion, refunds/recovery and courier shipments.

`shared/content.ts` defines public media/diagram types and validation. Docker includes this file alongside `catalog.json`, while authoring scripts and local media stay excluded. Publishing accepts the YouTube shape in `media.local.json`; its existing exact-artifact review checks remain required for future publications.
