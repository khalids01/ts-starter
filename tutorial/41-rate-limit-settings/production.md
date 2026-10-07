# Synchronized production: Review and configure request rate limits

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Rate limits protect the application from excessive requests. Open Rate Limits and review the configured groups. Public, authentication, protected and administrative endpoints have different purposes and may need different thresholds.

Focus: `{"role":"heading","name":"Rate Limits"}`

Prepare frame: `{"kind":"goto","path":"/admin/rate-limits"}`.

Evidence: controls.

## 02 · Scene 02

Each group exposes a time window and maximum request count. Understand the units before editing.

Focus: `{"css":"#public-window"}`

Prepare frame: `{"kind":"goto","path":"/admin/rate-limits"}`.

Evidence: controls.

## 03 · Scene 02

A smaller threshold can block legitimate use, while a larger threshold may weaken protection. Choose values using evidence from your actual traffic.

Focus: `{"css":"#public-max"}`

Evidence: controls.

## 04 · Scene 03

Save only a reviewed configuration change.

Focus: `{"role":"button","name":"Save Changes"}`

Prepare frame: `{"kind":"goto","path":"/admin/rate-limits"}`.

Evidence: controls.

## 05 · Scene 03

Verify both ordinary permitted requests and the expected rejection behavior in a supervised environment.

Focus: `{"css":"#auth-window"}`

Evidence: controls.

## 06 · Scene 03

Authentication limits deserve special care because an incorrect setting can interfere with sign-in.

Focus: `{"css":"#auth-max"}`

Evidence: controls.

## 07 · Scene 04

Do not interpret a saved setting as proof of production capacity or security acceptance. Monitor latency, errors and rejected requests after deployment.

Focus: `{"role":"heading","name":"Rate Limits"}`

Prepare frame: `{"kind":"goto","path":"/admin/rate-limits"}`.

Evidence: controls.

## 08 · Scene 04

Keep a known previous configuration so an operator can restore it when a reviewed change causes trouble.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Change Metadata\")"}`

Evidence: controls.
