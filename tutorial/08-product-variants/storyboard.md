# Configure SKUs, variants and pricing

The active, sentence-aligned storyboard is [production.md](./production.md), generated from [production.json](./production.json).

Scene narration remains canonical in tutorial.json and narration.txt. The scene action lists mirror the synchronized plan for reference; produce.ts is the generation entry point.

Refresh static storyboards after editing a production plan with `bun run tutorial:storyboards` from the project root. This command creates no media and does not access running services.
