# Create and manage product brands

Status: prepared script and recording plan; audio, fixture review, capture and publication pending.

## Prerequisites

- A category that permits brands, if demonstrating a product association.

## Recording

Mode: **workflow**. This plan demonstrates a real write. Provide marker-owned fixture checks, persisted outcome checks and exact cleanup actions before recording.

Copy `fixtures.example.json` to `fixtures.local.json`, prepare its isolated fictional records and fill every `REPLACE` value. Do not use real accounts or provider credentials. See [shared instructions](../README.md).

```bash
bun run tutorial:record catalog-brands
bun run tutorial:render catalog-brands
```

The shared recorder captures four independent real browser scenes. The renderer requires supplied audio and rejects action footage longer than its narration section. Review the draft video before publication.
