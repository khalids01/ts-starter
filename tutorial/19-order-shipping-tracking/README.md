# Mark an order shipped and update tracking

Status: prepared script and recording plan; audio, fixture review, capture and publication pending.

## Prerequisites

- An eligible confirmed order with its product-specific fulfilment prerequisites met.

## Recording

Mode: **walkthrough**. This plan presents the controls and explains the workflow. It does not submit state-changing actions. Do not describe its recording as persisted workflow acceptance. For a full action demonstration, review and extend the explicit actions and add owned fixture/outcome/cleanup evidence first.

Copy `fixtures.example.json` to `fixtures.local.json`, prepare its isolated fictional records and fill every `REPLACE` value. Do not use real accounts or provider credentials. See [shared instructions](../README.md).

```bash
bun run tutorial:record order-shipping-tracking
bun run tutorial:render order-shipping-tracking
```

The shared recorder captures four independent real browser scenes. The renderer requires supplied audio and rejects action footage longer than its narration section. Review the draft video before publication.
