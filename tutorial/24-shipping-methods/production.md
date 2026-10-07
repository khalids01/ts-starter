# Synchronized production: Configure checkout shipping methods

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Shipping methods are the delivery choices offered at checkout. Open Shipping methods from Delivery. Decide the method name, price and eligibility before creating a rate. A checkout rate is separate from a courier provider account.

Focus: `{"role":"heading","name":"Shipping"}`

Prepare frame: `{"kind":"goto","path":"/admin/shipping"}`.

Evidence: controls.

## 02 · Scene 02

Select Shipping rate and enter its code, label, currency and amount.

Focus: `{"field":"Code","dialog":"Create shipping rate"}`

Prepare frame: `{"kind":"goto","path":"/admin/shipping"}`; `{"kind":"click","target":{"role":"button","name":"Shipping rate"}}`.

Evidence: controls.

## 03 · Scene 02

Configure supported free-shipping and location rules when needed.

Focus: `{"field":"Free over amount","dialog":"Create shipping rate"}`

Evidence: controls.

## 04 · Scene 02

Set the intended default and active state deliberately; customers should see choices you can actually fulfil.

Focus: `{"field":"Currency","dialog":"Create shipping rate"}`

Evidence: controls.

## 05 · Scene 03

Save the method and review it in the list. Courier delivery options can map a method to a provider connection. Creating the shipping method alone does not book a parcel or prove that the provider serves the customer address.

Focus: `{"role":"heading","name":"Shipping"}`

Prepare frame: `{"kind":"goto","path":"/admin/shipping"}`.

Evidence: controls.

## 06 · Scene 04

Check a supervised checkout with an eligible address to verify the displayed choice and charge.

Focus: `{"role":"heading","name":"Shipping"}`

Prepare frame: `{"kind":"goto","path":"/admin/shipping"}`.

Evidence: controls.

## 07 · Scene 04

Archive, restore and deletion preserve server dependency checks.

Focus: `{"role":"tab","name":"Archived"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Archived"}}`.

Evidence: controls.

## 08 · Scene 04

Review existing delivery option mappings before removing a method used by operations.

Focus: `{"role":"tab","name":"Current"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Current"}}`.

Evidence: controls.
