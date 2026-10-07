# Synchronized production: Map courier delivery options to shipping methods

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

A delivery option connects a checkout shipping method to a courier account and service level. Open Delivery options and review the current mappings. Keep customer-facing choices consistent with services that the provider can actually fulfil.

Focus: `{"role":"heading","name":"Delivery options"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/delivery-options"}`.

Evidence: controls.

## 02 · Scene 02

Choose the intended connection and shipping method in the option controls.

Focus: `{"field":"Connection","dialog":"Add delivery option"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/delivery-options"}`; `{"kind":"click","target":{"role":"button","name":"Add delivery option"}}`.

Evidence: controls.

## 03 · Scene 02

Configure the supported provider service level and enabled state.

Focus: `{"field":"Service code","dialog":"Add delivery option"}`

Evidence: controls.

## 04 · Scene 02

Use descriptive names so another operator can identify the mapping without reading credentials.

Focus: `{"field":"Display name","dialog":"Add delivery option"}`

Evidence: controls.

## 05 · Scene 03

Save and check the resulting option.

Focus: `{"role":"button","name":"Save delivery option","dialog":"Add delivery option"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/delivery-options"}`; `{"kind":"click","target":{"role":"button","name":"Add delivery option"}}`.

Evidence: controls.

## 06 · Scene 03

An enabled mapping is configuration; it does not submit an order. Review assignment rules to understand which orders will use this connection and option.

Focus: `{"role":"dialog","name":"Add delivery option"}`

Evidence: controls.

## 07 · Scene 04

When a service is retired, review dependent rules and shipments before archiving or removing it.

Focus: `{"role":"tab","name":"Current"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/delivery-options"}`.

Evidence: controls.

## 08 · Scene 04

Use a simulated order to verify routing. Do not infer successful booking from the existence of a delivery option.

Focus: `{"role":"heading","name":"Delivery options"}`

Evidence: controls.
