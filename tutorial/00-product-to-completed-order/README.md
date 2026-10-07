# From Product Setup to a Completed Order

Status: review video complete — a real browser capture with an overlaid cursor and synchronized narration, plus poster and verified isolated workflow evidence. Captions ship as a sidecar `captions.vtt` track and are not burned into the video.

## Audience and goal

This tutorial is for a shop owner or manager using the admin panel for the first time. It shows the shortest complete workflow: create a sellable product, receive stock, make the product visible, let a customer place an order, and complete that order correctly.

Duration: 5 minutes 59 seconds.

Required permissions:

- `admin.products.manage`
- `admin.inventory.manage`
- `admin.orders.manage`
- `admin.orders.fulfill`
- `admin.orders.payments`

## Prerequisites

- Store settings, at least one active category and one inventory location already exist.
- The category template is already suitable for the product. A supplier is optional.
- The recording uses fictional product, customer, payment and tracking information in the isolated tutorial environment.

## Learning outcome

After the tutorial, the viewer can:

1. Create a product draft and enter its basic information.
2. Add category-specific specifications, highlights and a sellable SKU.
3. Receive inventory and activate the product.
4. Understand how a checkout reserves stock.
5. Confirm an order, record real payment evidence, ship it, deliver it and mark it completed.
6. Verify the order timeline, payment totals and inventory state.

## Files

- `narration.txt` — exact text to generate as one voice track.
- `captions.vtt` — WebVTT captions synchronized to the normalized narration; sidecar only, not burned in.
- `recording-plan.md` — shot list and screen actions matched to the narration.
- `audio_v1.mp3` — user-generated source narration.
- `audio_normalized.mp3` — mono 48 kHz, 192 kbps narration normalized for the final mix.
- `frames/` — legacy screenshots from the earlier screenshot-stacked pipeline; no longer used.
- `poster.webp` — tutorial cover image.
- `tutorial-product-to-completed-order.mp4` — review video: real browser capture at 1440 × 900 with an overlaid cursor, H.264/AAC.
- `record.legacy.ts` — guarded fixture, capture, persistence assertion and cleanup workflow.

## Voice generation

Generate one clean audio file from `narration.txt`, without reading headings, timestamps or stage directions. Use a calm, friendly instructional voice at a natural pace. Keep pauses between paragraphs. WAV is preferred; high-quality MP3 is acceptable.

The source audio is 5 minutes 59 seconds. Its integrated level was about -25 LUFS, so the final copy is normalized toward -16 LUFS with a -1.5 dB true-peak ceiling. Caption boundaries follow the real audio pauses and were visually reviewed in the rendered video.

## Recording evidence

The user authorized resetting the exact retained test database. The database was dropped and recreated, all 38 committed migrations were applied, and only the existing RBAC and courier-provider fixture setup was run. The established environment guard and five fictional Playwright personas were reused; no development, staging or production target was touched.

The capture workflow created a fictional product and completed a real storefront checkout through the current app. It asserted persisted `completed`, `paid`, `delivered` and `committed` states, plus stock moving from 25 on hand to 24 with zero reserved. Exact marker-owned categories, brands, products, inventory locations, shipping rates, orders and customers were removed afterward. The final read-only residue check returned zero for every marker.

## Regenerating this tutorial

The video is produced by a real browser-session recording with an overlaid cursor,
not by stacking screenshots. With the isolated runtime (Postgres, Redis, API on
:3000, web on :3001) running:

```sh
bun run tutorial:record:legacy   # records the workflow to a raw WebM + manifest
bun run tutorial:render:legacy   # muxes audio_normalized.mp3 with sidecar captions.vtt, writes the MP4 + poster
```

See `../README.md` for pacing and capture tuning.

## Important behavior explained in the tutorial

- Saving product information creates a draft; it does not make the product public.
- A product needs at least one valid active SKU and available stock before customers can buy it.
- Confirming an order commits its reserved inventory.
- Payment controls record evidence of money actually received; they do not move money.
- Shipping and delivery use guarded actions that add timeline events.
- Completion is allowed only after delivery, full collection and a clean operational state.
