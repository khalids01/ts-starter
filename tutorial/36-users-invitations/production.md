# Synchronized production: Manage users and invitations

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

User Management controls application accounts, while Customers represents shop customer records. Open Users.

Focus: `{"role":"heading","name":"User Management"}`

Prepare frame: `{"kind":"goto","path":"/admin/users"}`.

Evidence: controls.

## 02 · Scene 01

Your permissions determine whether you can inspect details, invite someone, change a role or manage sessions.

Focus: `{"role":"tab","name":"Users"}`

Evidence: controls.

## 03 · Scene 02

Use the Users tab to find an account and inspect its details through the row actions.

Focus: `{"css":"input[placeholder=\"Filter users...\"]"}`

Prepare frame: `{"kind":"goto","path":"/admin/users"}`; `{"kind":"click","target":{"role":"tab","name":"Users"}}`.

Evidence: controls.

## 04 · Scene 02

Review the current role before changing access.

Focus: `{"css":"thead th:text-is(\"Role\")"}`

Evidence: controls.

## 05 · Scene 02

A role change can grant sensitive capabilities, so choose the minimum role needed for the person's work.

Focus: `{"css":"thead th:text-is(\"Role\")"}`

Evidence: controls.

## 06 · Scene 03

Use Invites to review invitation state.

Focus: `{"css":"#invitation-status"}`

Prepare frame: `{"kind":"goto","path":"/admin/users"}`; `{"kind":"click","target":{"role":"tab","name":"Invites"}}`.

Evidence: controls.

## 07 · Scene 03

Creating an invitation can send email; a tutorial must use fictional addresses and the isolated mail sink.

Focus: `{"css":"#invitation-search"}`

Evidence: controls.

## 08 · Scene 03

Revoking sessions and banning or archiving accounts are deliberate security actions, not ordinary profile edits.

Focus: `{"css":"thead th:text-is(\"Status\")"}`

Evidence: controls.

## 09 · Scene 04

Verify the saved account or invitation state after any action. Role permissions are configured in Roles. Keep credentials, tokens and verification links out of screen recordings, and never demonstrate user deletion against a real account.

Focus: `{"role":"tab","name":"Users"}`

Prepare frame: `{"kind":"goto","path":"/admin/users"}`; `{"kind":"click","target":{"role":"tab","name":"Users"}}`.

Evidence: controls.
