# Manage inventory locations and suppliers

Status: prepared script and recording plan; audio, fixture review, capture and publication pending.

## Prerequisites

- Fictional location and supplier records; no real contact details.

## Recording

Mode: **walkthrough**. This plan presents the controls and explains the workflow. It does not submit state-changing actions. Do not describe its recording as persisted workflow acceptance. For a full action demonstration, review and extend the explicit actions and add owned fixture/outcome/cleanup evidence first.

Copy `fixtures.example.json` to `fixtures.local.json`, prepare its isolated fictional records and fill every `REPLACE` value. Do not use real accounts or provider credentials. See [shared instructions](../README.md).

```bash
bun run tutorial:record inventory-locations-suppliers
bun run tutorial:render inventory-locations-suppliers
```

The shared recorder captures four independent real browser scenes. The renderer requires supplied audio and rejects action footage longer than its narration section. Review the draft video before publication.
