# Produce the focused tutorials later

Tutorials **02–43** now use sentence-aligned production plans and the shared producer in `shared/produce.ts`. Tutorial 01 keeps its accepted producer, existing audio, video and YouTube upload.

This change prepares code and instructions. It generates no audio, screenshots or videos, and provisions no database records. Runtime captures and full playback review remain necessary before calling a future video approved.

## How timing works

1. `production.json` divides canonical narration into short sections, each with one explicit UI focus.
2. Heart/Kokoro generates a separate WAV per section, only when audio generation is authorized.
3. Playwright performs the section's setup actions, waits for the production CSS, fonts and visible images, then captures a real settled screenshot with its spotlight.
4. Rendering holds that exact frame for the measured speech duration plus 0.2 seconds. No loading or navigation frames enter the timeline.
5. Captions use the measured speech boundaries. Rendering checks final duration and compares the start/end frame of every section with its source capture (SSIM ≥ 0.98).
6. A person reviews the full playback, captions and factual workflow before publication.

Within a scene, actions run once and the page keeps its state. The next scene opens a fresh page. Fields and modal buttons are scoped explicitly. Missing or ambiguous targets cause failure rather than silently dropping a highlight.

After editing a plan, run `bun run tutorial:storyboards` to refresh only its static storyboards and canonical scene action references. It produces no media or service requests.

`production.md` is a readable copy of the executable plan. The content validator checks that it matches `production.json`, and that section narration reconstructs `tutorial.json` exactly.

## Offline preparation commands

These inspect plans without accessing Voicebox, the browser, APIs or the database and without creating media:

```bash
bun run tutorial:prepare all
bun run tutorial:prepare order-confirmation
bun run tutorial:check
```

Only the `prepare` command accepts `all`. Generate and review one selected tutorial at a time. There is no batch audio/video/upload command.

## Prepare the recording environment

The producer does not install tools, build the app, start servers, apply migrations, seed/reset the database or create prerequisite business data.

Before a separately authorized capture:

- Use the guarded local isolated E2E database and Redis configuration in `tests/env/.env`, with `NODE_ENV=test`, disabled courier workers and payments integrations, and the fictional owner storage state.
- Run the existing production web build and matching local API on the configured E2E URLs. Set `BRAND` to match `apps/web/dist/brand.json`. Do not overwrite a foodshop build with an airshop build for recording; arrange any build separately.
- Keep server-side courier/payment/email calls disabled or directed at the local simulator/mail sink. The browser blocks external requests and walkthrough business writes, but cannot independently prove a server's environment.
- Ensure existing ffmpeg/ffprobe and Playwright Chromium are available. Missing tools are a prerequisite to resolve; the producer never installs them.
- Copy the selected package's `fixtures.example.json` to `fixtures.local.json`, then supply the actual fictional resource IDs and GET ownership checks. Prepare precisely the required states described in `production.md` and `recording-checklist.md`.

An existing `...Id` used in a production plan must have a GET ownership check for that ID and a marker-prefixed name or note. Examples now provide these identity checks for products, orders, customers and roles. Additional state checks run before capturing the relevant frame. Keep fictional fixture names consistent with the example's expected values; don't merely substitute an arbitrary ID.

Some pages show the same SKU in several rows. Prepare a fixture whose intended row is unique or tighten its target with a location/batch/reference. The recorder never chooses the first matching target.

### Actual workflow vs prepared examples

Category and brand creation retain actual submit/ID capture, persisted outcome checks, and marker-checked cleanup. Review their write and cleanup plans before authorization. If an attempt or cleanup fails, the producer does not publish a successful capture pointer, and rendering refuses an older attempt.

Other tutorials remain control walkthroughs; they do not submit payments, shipment bookings, refunds, invitations or other business writes. Where narration describes an after-operation state, order tutorials show a separate, prepared fictional example, verified by GET checks and visibly labeled **Prepared fictional example**. These records must be prepared separately; no DOM state is fabricated. A checked example is not proof that this recording performed the operation.

For a future full workflow demonstration, deliberately extend that tutorial's mode, submit actions, persisted checks and cleanup contract. Do not add an ordinary click that submits a business write to a walkthrough.

## Future audio generation

Only after explicit authorization for the selected tutorial:

```bash
TUTORIAL_AUDIO_APPROVED=true bun run tutorial:audio order-confirmation
```

The Voicebox tunnel must already be reachable at `VOICEBOX_URL` (default `http://127.0.0.1:17493`). The producer checks the configured Heart profile is Kokoro `af_heart`. It generates the exact text in the plan, saves a job receipt immediately, resumes existing jobs and retains hash-checked completed WAVs. A request without a returned job ID stops for inspection rather than blindly retrying.

Audio lives in the ignored `artifacts/synchronized-audio/` directory as section/text-hash WAVs and receipts. Capture requires all section WAVs and their matching receipts before it performs any business operation. Changing narration selects new audio inputs; do not manually rename an old paragraph WAV into a section.

## Future capture and render

After separately approving the isolated capture:

```bash
# The root record command loads tests/env/.env; BRAND must match the running build.
BRAND=foodshop TUTORIAL_RECORD_APPROVED=true bun run tutorial:record order-confirmation
```

Inspect the resulting `artifacts/<run-id>-synchronized/*.png` and `capture.json` before authorizing rendering. Capturing creates screenshots, not raw video or narration. It does not start/stop the running app.

Only after authorizing the render:

```bash
TUTORIAL_RENDER_APPROVED=true bun run tutorial:render order-confirmation
```

Outputs:

- `video.mp4`, `poster.webp`, `captions.vtt`.
- `timeline.json`: exact speech/scene boundaries and focus/evidence metadata.
- `frame-quality.json`: measured start/end screenshot comparisons for every section.
- `review.json`: input hashes and review flags, initially unapproved.

Rendering rejects a changed plan, a different source commit, changed screenshots/audio/shared production code, an incomplete latest capture, frame mismatch or timeline drift. Commit the reviewed generation code before capture; avoid changing source midway through production.

## Playback review and publication

Watch the whole video with audio. Check the actual controls, result/example labels, sentence timing, reading pace, captions and fictional data. Automated frame checks only establish that encoded frames match captures; they do not establish correctness or good narration.

Do not set review flags until that playback has been accepted. Publishing checks both the canonical tutorial hash and the synchronized generation plan hash. Upload and publication are separate authorized actions, using the existing YouTube uploader and catalog publication workflow.

Tutorial 01 needs no remake or reupload for this preparation work.
