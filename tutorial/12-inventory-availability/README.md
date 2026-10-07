# Understand on-hand, reserved and available stock

- A fictional stock row and an order showing a reservation or commitment.

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
bun tutorial/12-inventory-availability/produce.ts prepare

# Future production, after reviewing the plan and prerequisites:
TUTORIAL_AUDIO_APPROVED=true bun tutorial/12-inventory-availability/produce.ts audio
TUTORIAL_RECORD_APPROVED=true bun run tutorial:record inventory-availability
TUTORIAL_RENDER_APPROVED=true bun run tutorial:render inventory-availability
```

The capture command expects the existing production app, the correct `BRAND`, isolated environment variables, disabled integrations and the fictional owner session. It never builds, starts a server, provisions fixtures or installs tools. See [shared production instructions](../synchronized-production.readme.md).

Mode: **walkthrough**. Business writes are blocked. Saving, refunding, booking, inviting or other state changes are explained through their controls and pre-existing fictional records. A walkthrough does not claim to prove an unsubmitted operation.

Before production, review `production.md` and `recording-checklist.md`, prepare the required fictional state and check every target against the running app. After generation, watch the entire video with audio and review captions before marking its artifact approved. Source inspection cannot establish runtime accuracy.
