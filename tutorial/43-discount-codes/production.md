# Synchronized production: Create and manage discount codes

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Discount codes apply supported promotional rules at checkout.

Focus: `{"role":"heading","name":"Discounts"}`

Prepare frame: `{"kind":"goto","path":"/admin/discounts"}`.

Evidence: controls.

## 02 · Scene 01

Open Discounts and create a code that your team can recognize.

Focus: `{"role":"button","name":"Discount"}`

Evidence: controls.

## 03 · Scene 01

Define the actual offer before entering values, including eligibility and usage limits.

Focus: `{"role":"heading","name":"Discounts"}`

Evidence: controls.

## 04 · Scene 02

Choose percentage or fixed amount and enter its value.

Focus: `{"text":"Type","dialog":"Create discount"}`

Prepare frame: `{"kind":"goto","path":"/admin/discounts"}`; `{"kind":"click","target":{"role":"button","name":"Discount"}}`.

Evidence: controls.

## 05 · Scene 02

Fixed discounts need the correct currency.

Focus: `{"field":"Currency","dialog":"Create discount"}`

Prepare frame: `{"kind":"select","target":{"field":"Type","dialog":"Create discount"},"option":"Fixed amount"}`.

Evidence: controls.

## 06 · Scene 02

Configure a minimum order amount, start and end dates, total usage limit and per-customer limit when the offer requires them.

Focus: `{"field":"Minimum order amount","dialog":"Create discount"}`

Evidence: controls.

## 07 · Scene 03

Review active state and save the discount.

Focus: `{"role":"button","name":"Save discount","dialog":"Create discount"}`

Prepare frame: `{"kind":"goto","path":"/admin/discounts"}`; `{"kind":"click","target":{"role":"button","name":"Discount"}}`.

Evidence: controls.

## 08 · Scene 03

An active code can still be ineligible because of its dates, order amount, currency or usage rules.

Focus: `{"text":"Starts on","dialog":"Create discount"}`

Evidence: controls.

## 09 · Scene 03

Test an eligible fictional checkout and an ineligible case before announcing a promotion.

Focus: `{"field":"Minimum order amount","dialog":"Create discount"}`

Evidence: controls.

## 10 · Scene 04

Check the accepted order total and retained discount information. Disable a code when it should no longer be offered. Do not assume that editing a promotion retroactively changes orders that have already been accepted.

Focus: `{"role":"heading","name":"Discounts"}`

Prepare frame: `{"kind":"goto","path":"/admin/discounts"}`.

Evidence: controls.
