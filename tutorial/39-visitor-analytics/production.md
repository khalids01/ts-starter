# Synchronized production: Read visitor trends and filters

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Visitors summarizes recorded site activity.

Focus: `{"role":"heading","name":"Visitors"}`

Prepare frame: `{"kind":"goto","path":"/admin/visitors"}`.

Evidence: controls.

## 02 · Scene 01

Open Visitors and select the period you want to inspect.

Focus: `{"css":"#visitors-date-from"}`

Evidence: controls.

## 03 · Scene 01

Read each metric according to its label: visits, unique visitors and returning visitors describe different measurements.

Focus: `{"css":"section:has([data-slot=\"card-title\"]:text-is(\"Total visits\")):has([data-slot=\"card-title\"]:text-is(\"Returning visitors\"))"}`

Evidence: controls.

## 04 · Scene 02

Use the available filters to separate human and bot activity and compare periods where supported.

Focus: `{"css":"#visitors-segment"}`

Prepare frame: `{"kind":"goto","path":"/admin/visitors"}`.

Evidence: controls.

## 05 · Scene 02

Check the active dates before interpreting a rise or fall.

Focus: `{"css":"#visitors-date-to"}`

Evidence: controls.

## 06 · Scene 02

A filtered result is not necessarily the total traffic for the shop.

Focus: `{"css":"#visitors-type"}`

Evidence: controls.

## 07 · Scene 03

Inspect the trend chart and breakdowns together. Traffic counts do not prove revenue, successful checkout or delivery. Use order records for those outcomes, and avoid presenting a visitor count as a conversion rate without the correct denominator.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Visitors Trend\")"}`

Prepare frame: `{"kind":"goto","path":"/admin/visitors"}`.

Evidence: controls.

## 08 · Scene 04

Treat analytics as a guide for investigation. Missing events, privacy choices and classification rules can affect the recorded data.

Focus: `{"role":"heading","name":"Visitors"}`

Prepare frame: `{"kind":"goto","path":"/admin/visitors"}`.

Evidence: controls.

## 09 · Scene 04

Keep personal details private when showing reports and state the actual period when sharing a finding.

Focus: `{"css":"#visitors-date-from"}`

Evidence: controls.
