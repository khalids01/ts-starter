# Create and manage product brands

- A category that permits brands, if demonstrating a product association.

## Generation files

- `production.json`: sentence-aligned narration, exact screen setup, spotlight and evidence checks.
- `production.md`: readable version of those sections, for reviewing before production.
- `produce.ts`: shared synchronized producer, following the accepted tutorial 01 approach.
- `tutorial.json`, `narration.txt`: canonical narration and scene grouping.
- `fixtures.example.json`: fictional data contract; copy to ignored `fixtures.local.json` and supply isolated values/checks.
- `record.ts`, `render.ts`: entry points for synchronized capture/render, also used by the root CLI.

## Commands (run later, separately authorized)

```bash
# Offline plan inspection only; creates no audio or video:
bun tutorial/03-catalog-brands/produce.ts prepare

# Future production, after reviewing the plan and prerequisites:
TUTORIAL_AUDIO_APPROVED=true bun tutorial/03-catalog-brands/produce.ts audio
TUTORIAL_RECORD_APPROVED=true bun run tutorial:record catalog-brands
TUTORIAL_RENDER_APPROVED=true bun run tutorial:render catalog-brands
```

The capture command expects the existing production app, the correct `BRAND`, isolated environment variables, disabled integrations and the fictional owner session. It never builds, starts a server, provisions fixtures or installs tools. See [shared production instructions](../synchronized-production.readme.md).

Mode: **workflow**. Only reviewed category/brand writes run, with persisted checks and marker-checked cleanup.

Before production, review `production.md` and `recording-checklist.md`, prepare the required fictional state and check every target against the running app. After generation, watch the entire video with audio and review captions before marking its artifact approved. Source inspection cannot establish runtime accuracy.
