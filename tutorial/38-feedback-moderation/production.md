# Synchronized production: Review and moderate submitted feedback

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Feedback collects submitted messages that need operator attention. Open Feedback and identify the message you intend to review. Read the actual content and context before changing its state.

Focus: `{"role":"heading","name":"User Feedback"}`

Prepare frame: `{"kind":"goto","path":"/admin/feedback"}`.

Evidence: controls.

## 02 · Scene 02

Use the available status controls to represent what your team has done.

Focus: `{"css":"[data-slot=\"card\"]:has(p:text-is(\"{{feedbackText}}\")) button[role=\"combobox\"]"}`

Prepare frame: `{"kind":"goto","path":"/admin/feedback"}`.

Evidence: controls.

## 03 · Scene 02

A status should not imply that the customer received a reply unless that communication actually happened.

Focus: `{"css":"[data-slot=\"card\"]:has(p:text-is(\"{{feedbackText}}\"))"}`

Evidence: controls.

## 04 · Scene 02

Keep private contact details out of shared recordings.

Focus: `{"css":"[data-slot=\"card\"]:has(p:text-is(\"{{feedbackText}}\"))"}`

Evidence: controls.

## 05 · Scene 03

Review the updated item and use pagination to find older submissions.

Focus: `{"css":"[data-slot=\"card\"]:has(p:text-is(\"{{feedbackText}}\"))"}`

Prepare frame: `{"kind":"goto","path":"/admin/feedback"}`.

Evidence: controls.

## 06 · Scene 03

Handle abusive or irrelevant content according to your store's policy.

Focus: `{"role":"button","name":"Next"}`

Evidence: controls.

## 07 · Scene 03

Do not remove a valid report simply because it describes an inconvenient problem.

Focus: `{"css":"[data-slot=\"card\"]:has(p:text-is(\"{{feedbackText}}\"))"}`

Evidence: controls.

## 08 · Scene 04

For an order issue, use the order and customer workflows to investigate the underlying facts. Feedback moderation does not change inventory, issue a refund or resolve a shipment. Record operational actions in their proper sections.

Focus: `{"role":"heading","name":"User Feedback"}`

Prepare frame: `{"kind":"goto","path":"/admin/feedback"}`.

Evidence: controls.
