# Synchronized production: Configure roles and permission boundaries

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Roles group permissions for people doing similar work. Open Roles and review the existing roles before creating another. The owner role has special authority; ordinary staff should receive only the capabilities their job requires.

Focus: `{"role":"heading","name":"Roles"}`

Prepare frame: `{"kind":"goto","path":"/admin/roles"}`.

Evidence: controls.

## 02 · Scene 02

Create a custom role when the built-in choices do not fit.

Focus: `{"role":"dialog","name":"Create custom role"}`

Prepare frame: `{"kind":"goto","path":"/admin/roles"}`; `{"kind":"click","target":{"role":"button","name":"Create Role"}}`.

Evidence: controls.

## 03 · Scene 02

Use a clear name and description.

Focus: `{"field":"Name","dialog":"Create custom role"}`

Evidence: controls.

## 04 · Scene 02

Permission groups distinguish reading data from managing it, and order fulfilment, payment, refund and courier reconciliation are separate capabilities.

Focus: `{"role":"dialog","name":"Create custom role"}`

Evidence: controls.

## 05 · Scene 03

Open the role detail page to inspect or edit supported permissions. Save deliberately and review the result. Resetting or deleting roles has separate controls and may be restricted for built-in or referenced roles.

Focus: `{"role":"heading","name":"Permissions"}`

Prepare frame: `{"kind":"goto","path":"/admin/roles"}`; `{"kind":"goto","path":"/admin/roles/{{roleId}}"}`.

Evidence: controls.

## 06 · Scene 04

Verify access using a suitable isolated account, including a denied action as well as an allowed one. Hiding a navigation item is not the whole access boundary: server authorization must still apply. Keep the role understandable to the next administrator.

Focus: `{"role":"heading","name":"Roles"}`

Prepare frame: `{"kind":"goto","path":"/admin/roles"}`.

Evidence: controls.
