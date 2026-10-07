# Synchronized production: Review and maintain customer records

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Customer records connect contact information with the shop's order history.

Focus: `{"role":"heading","name":"Customers"}`

Prepare frame: `{"kind":"goto","path":"/admin/customers"}`.

Evidence: controls.

## 02 · Scene 01

Open Customers and find the intended customer. Use the available search rather than choosing a similarly named person.

Focus: `{"css":"input[placeholder=\"Search name, email, or phone\"]"}`

Evidence: controls.

## 03 · Scene 02

Open the record and review its contact details and order history.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Customer details\")"}`

Prepare frame: `{"kind":"goto","path":"/admin/customers"}`; `{"kind":"goto","path":"/admin/customers/{{customerId}}"}`.

Evidence: controls.

## 04 · Scene 02

Completed spend and order counts describe the recorded orders; they do not replace payment evidence on an individual order.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Order history\")"}`

Evidence: controls.

## 05 · Scene 03

When your role permits editing, update only verified customer facts through the supported controls.

Focus: `{"field":"Name"}`

Prepare frame: `{"kind":"goto","path":"/admin/customers"}`; `{"kind":"goto","path":"/admin/customers/{{customerId}}"}`.

Evidence: controls.

## 06 · Scene 03

An order retains its own delivery details, so editing a profile should not be assumed to rewrite historical order addresses.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Latest addresses\")"}`

Evidence: controls.

## 07 · Scene 04

Open the relevant order for payment, shipment or refund work.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Order history\")"}`

Prepare frame: `{"kind":"goto","path":"/admin/customers"}`; `{"kind":"goto","path":"/admin/customers/{{customerId}}"}`.

Evidence: controls.

## 08 · Scene 04

Keep personal information private when sharing screenshots or recordings.

Focus: `{"field":"Email"}`

Evidence: controls.

## 09 · Scene 04

Tutorial fixtures use fictional customers and addresses in the isolated environment.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Customer details\")"}`

Evidence: controls.
