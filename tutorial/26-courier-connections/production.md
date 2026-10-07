# Synchronized production: Configure and review a courier connection

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

A courier connection links your shop to a supported provider account. Open Connections. Check existing records before adding another account, because duplicate configuration can make routing harder to understand.

Focus: `{"role":"heading","name":"Courier connections"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/connections"}`.

Evidence: controls.

## 02 · Scene 02

Select Add connection.

Focus: `{"field":"Connection name","dialog":"Add courier connection"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/connections"}`; `{"kind":"click","target":{"role":"button","name":"Add connection"}}`.

Evidence: controls.

## 03 · Scene 02

Enter a connection name, choose the provider, configuration source and environment, and set priority.

Focus: `{"field":"Courier provider","dialog":"Add courier connection"}`

Evidence: controls.

## 04 · Scene 02

Lower nonnegative priority numbers run first.

Focus: `{"field":"Priority","dialog":"Add courier connection"}`

Evidence: controls.

## 05 · Scene 02

Use the supported credential source for your deployment.

Focus: `{"field":"Configuration source","dialog":"Add courier connection"}`

Evidence: controls.

## 06 · Scene 03

When credentials are entered, keep them private and off the recording. The server does not return saved secrets. Save the connection and use the supported connection test only against the intended provider environment; in tutorials, that means the local simulator.

Focus: `{"role":"heading","name":"Courier connections"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/connections"}`.

Evidence: controls.

## 07 · Scene 04

Review health and enabled state before using the account for dispatch.

Focus: `{"role":"heading","name":"Courier connections"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/connections"}`.

Evidence: controls.

## 08 · Scene 04

Credential rotation, archive and recovery are separate actions.

Focus: `{"role":"tab","name":"Archived"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Archived"}}`.

Evidence: controls.

## 09 · Scene 04

A successful account test does not establish that a parcel has been booked or a collection has settled.

Focus: `{"role":"heading","name":"Courier connections"}`

Prepare frame: `{"kind":"click","target":{"role":"tab","name":"Current"}}`.

Evidence: controls.
