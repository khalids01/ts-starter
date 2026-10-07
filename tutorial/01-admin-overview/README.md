# Find your way around the admin panel

Tutorial 01 now uses 15 synchronized narration sections, defined in `production.json`. The canonical four paragraphs remain in `narration.txt` and `tutorial.json`.

## Produce the corrected video

Keep the Mac Voicebox tunnel available. Use the existing Heart/Kokoro preset:

```bash
bun tutorial/01-admin-overview/produce.ts audio
```

Serve the API and frontend from their builds against the configured isolated E2E environment. The frontend must use `apps/web/scripts/production-server.ts` and its built assets. Use loopback ports 3000/3001, the fictional owner session, disabled courier workers/payment integrations, and `TUTORIAL_RECORD_APPROVED=true`. Do not run migrations, resets, seeds, or live provider operations for this navigation walkthrough.

```bash
TUTORIAL_RECORD_APPROVED=true COURIER_WORKERS_ENABLED=false ENABLE_POLAR=false bun run tutorial:record admin-overview
bun run tutorial:render admin-overview
```

The capture requires built CSS to be loaded, rejects Vite development scripts, and captures fully settled browser frames after preparing each menu group or help dialog. The rendered video holds each real UI frame and its highlight throughout the corresponding section's exact WAV duration, with a short pause before the next section. It is a narrated sequence of screenshots; navigation/loading transitions are excluded. There are no guessed word timestamps or fixed highlight timeouts.

`artifacts/last-render.json` points to the latest video, captions, poster, and review file. `render/timeline.json` records speech boundaries and visual targets. Audio jobs are cached by text and settings and reused on reruns; capture records hash the exact PNG and WAV inputs. Generated media remains local and ignored by Git.

Review the final playback, then upload:

```bash
bun --env-file=apps/server/.env tutorial/shared/youtube-upload.ts admin-overview --visibility=unlisted --upload
```

Each new render has its own upload receipts; rerunning the command for the same render checks or resumes that video without creating a duplicate. A corrected render uploads as a new YouTube video. This command does not delete or change visibility of the previous upload.
