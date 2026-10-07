# Synchronized production: Configure and verify courier assignment rules

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Assignment rules determine how eligible orders are routed to courier connections and options. Open Assignment rules. Plan the conditions and priority so an order has a predictable outcome instead of relying on an accidental overlap.

Focus: `{"role":"heading","name":"Assignment rules"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/assignment-rules"}`.

Evidence: controls.

## 02 · Scene 02

Review each rule condition against the addresses, payment choices and product handling you support.

Focus: `{"field":"Rule name","dialog":"Add assignment rule"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/assignment-rules"}`; `{"kind":"click","target":{"role":"button","name":"Add assignment rule"}}`.

Evidence: controls.

## 03 · Scene 02

Choose the intended connection and delivery option.

Focus: `{"field":"Delivery option","dialog":"Add assignment rule"}`

Evidence: controls.

## 04 · Scene 02

Use clear rule names and the supported priority and enabled settings.

Focus: `{"field":"Priority","dialog":"Add assignment rule"}`

Evidence: controls.

## 05 · Scene 03

Save the configuration and test representative fictional orders. Inspect the routing decision on the order before submission. A matching rule does not guarantee provider acceptance; booking and address validation remain separate steps.

Focus: `{"css":"[data-slot=\"card-title\"]:text-is(\"Courier routing\")"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/assignment-rules"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.

## 06 · Scene 04

Review rules when shipping methods or courier accounts change. Keep an understandable fallback where supported, and investigate orders with no eligible route. Do not repeatedly submit an unroutable order to make the error disappear.

Focus: `{"role":"heading","name":"Assignment rules"}`

Prepare frame: `{"kind":"goto","path":"/admin/couriers/assignment-rules"}`.

Evidence: controls.
