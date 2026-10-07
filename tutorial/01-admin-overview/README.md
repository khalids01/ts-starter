# Find your way around the admin panel

Status: Heart/Kokoro scene audio generated and real browser capture/render produced locally. Playback review and publication pending.

## Prerequisites

- An admin account with access to the relevant sections.

## Recording

Mode: **walkthrough**. This plan presents the controls and explains the workflow. It does not submit state-changing actions. Do not describe its recording as persisted workflow acceptance. For a full action demonstration, review and extend the explicit actions and add owned fixture/outcome/cleanup evidence first.

Copy `fixtures.example.json` to `fixtures.local.json`, prepare its isolated fictional records and fill every `REPLACE` value. Do not use real accounts or provider credentials. See [shared instructions](../README.md).

```bash
bun run tutorial:record admin-overview
bun run tutorial:render admin-overview
```

The shared recorder captures four independent real browser scenes, removes their measured initial page-loading lead-in, and leaves contextual help visible for this tutorial. The renderer uses `audio/01.wav` through `audio/04.wav` and rejects action footage longer than its narration section. Captions use the measured scene durations. Review the draft video with audio before publication.

The latest output directory is recorded in `artifacts/last-render.json`. Audio and generated outputs stay local and are ignored by Git. See [Voicebox narration](../voicebox.readme.md) for generation commands.
