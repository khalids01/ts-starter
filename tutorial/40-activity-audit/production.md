# Synchronized production: Use the activity log to trace admin changes

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

The activity log helps you understand recorded administrative actions.

Focus: `{"role":"heading","name":"Activity"}`

Prepare frame: `{"kind":"goto","path":"/admin/activity"}`.

Evidence: controls.

## 02 · Scene 01

Open Activity and choose the relevant filters or period.

Focus: `{"css":"button[role=\"combobox\"]:has-text(\"All events\")"}`

Evidence: controls.

## 03 · Scene 01

Start with the account, resource or event you are investigating.

Focus: `{"role":"heading","name":"Activity"}`

Evidence: controls.

## 04 · Scene 02

Read the event time, actor and action together.

Focus: `{"css":"div.px-6.py-4:has(:text-is(\"{{activityMessage}}\"))"}`

Prepare frame: `{"kind":"goto","path":"/admin/activity"}`.

Evidence: controls.

## 05 · Scene 02

Where details are available, compare them with the affected record.

Focus: `{"css":"div.px-6.py-4:has(:text-is(\"{{activityMessage}}\"))"}`

Evidence: controls.

## 06 · Scene 02

An audit entry shows what was recorded by the application; it is not a substitute for checking the current operational state.

Focus: `{"css":"div.px-6.py-4:has(:text-is(\"{{activityMessage}}\"))"}`

Evidence: controls.

## 07 · Scene 03

Use the log to trace a configuration, role or data change.

Focus: `{"css":"div.px-6.py-4:has(:text-is(\"{{activityMessage}}\"))"}`

Prepare frame: `{"kind":"goto","path":"/admin/activity"}`.

Evidence: controls.

## 08 · Scene 03

Order timeline and inventory movement history provide additional evidence for sales workflows.

Focus: `{"css":"div.px-6.py-4:has(:text-is(\"{{activityMessage}}\"))"}`

Evidence: controls.

## 09 · Scene 03

Different histories answer different questions, so compare the relevant sources.

Focus: `{"css":"div.px-6.py-4:has(:text-is(\"{{activityMessage}}\"))"}`

Evidence: controls.

## 10 · Scene 04

Keep log details private and avoid putting credentials in notes.

Focus: `{"css":"div.px-6.py-4:has(:text-is(\"{{activityMessage}}\"))"}`

Prepare frame: `{"kind":"goto","path":"/admin/activity"}`.

Evidence: controls.

## 11 · Scene 04

If an event looks unexpected, investigate its actor and related records before taking corrective action.

Focus: `{"css":"div.px-6.py-4:has(:text-is(\"{{activityMessage}}\"))"}`

Evidence: controls.

## 12 · Scene 04

Preserve useful history instead of deleting evidence to hide a mistake.

Focus: `{"css":"div.px-6.py-4:has(:text-is(\"{{activityMessage}}\"))"}`

Evidence: controls.
