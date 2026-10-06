# Tutorial recording pipeline

Source for the automated admin tutorials. The recorder drives the real app in the
isolated E2E environment, records the browser session as video, and overlays a
synthetic cursor so the result looks like an ordinary screen recording instead of
stacked screenshots.

## Pieces

- `record-product-to-order.ts` — guarded fixture/workflow. Creates a fictional
  product, receives stock, runs a storefront checkout and completes the order,
  asserting persisted state and cleaning up marker-owned rows. Records the whole
  browser session with Playwright `recordVideo` at 1440x900.
- `cursor.ts` — injects the cursor/click-ripple overlay and exposes
  `cursorClick`/`cursorFill` helpers that animate real mouse movement.
- `segments.ts` — narration-derived pacing (`Pacer`). Each screen holds until its
  `untilSec`, so the continuous recording lines up with `audio_normalized.mp3`.
- `render-tutorial.ts` — ffmpeg: WebM -> H.264/AAC MP4, muxes the narration, and regenerates `poster.webp`. Captions are not burned in; `captions.vtt` stays as a sidecar.

## Record and render

The isolated runtime (Postgres, Redis, API on :3000, web on :3001) must already
be running; configuration lives in `tests/env/.env`. Recording is headless by
default.

```sh
bun run tutorial:record
bun run tutorial:render
```

`tutorial:record` writes the raw WebM under
`tests/artifacts/tutorials/product-to-order/` plus a `last-recording.json`
manifest. `tutorial:render` reads that manifest (or a WebM path you pass as an
argument) and writes the final MP4 and poster into
`docs/tutorials/01-product-to-completed-order/`.

## Tuning

- Segment timing: edit `TUTORIAL_SEGMENTS` and `TUTORIAL_DURATION_SEC` in `segments.ts`.
- Typing animation: set `TUTORIAL_TYPE_DELAY_MS` (e.g. `30`) to type instead of filling values instantly.
- Cursor pace: `TUTORIAL_CLICK_PAUSE_MS`, `TUTORIAL_MOVE_STEPS`.
- Poster frame: `TUTORIAL_POSTER_SEC` (seconds into the final video).
- Headed capture: `TUTORIAL_HEADED=true`.
