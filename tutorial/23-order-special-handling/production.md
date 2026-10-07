# Synchronized production: Handle food preparation, tracked gadgets and warranty

Capture mode: **walkthrough**. Prepared code only; audio, capture and playback review remain pending.

- Capture only settled production-build frames at 1440 x 900; do not film navigation or loading.
- Each frame holds its one spotlight for the entire measured narration section, followed by 0.2 seconds of silence.
- Walkthrough frames explain controls. They do not establish that an unsubmitted operation succeeded.
- Prepare fictional marker-owned fixtures with the states specified in the recording checklist; capture refuses missing, ambiguous or ineligible controls.
- Audio, capture, full playback review and upload require separate authorization. No batch production or live provider actions.

## 01 · Scene 01

Some products need extra fulfilment evidence. The category handling policy determines the required controls. Open the order and review Preparation and tracked units before shipping.

Focus: `{"role":"heading","name":"Preparation and tracked units"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.

## 02 · Scene 01

Use the controls appropriate to the actual goods.

Focus: `{"role":"heading","name":"Line items"}`

Evidence: controls.

## 03 · Scene 02

For fresh or prepared food, review the delivery window and preparation requirements. Record the supported preparation evidence as work happens. Do not mark a parcel ready simply because a generic order status allows an update.

Focus: `{"role":"heading","name":"Preparation and tracked units"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{orderId}}"}`.

Evidence: controls.

## 04 · Scene 03

For tracked gadgets, assign the serial number or IMEI of the physical unit being sent.

Focus: `{"role":"heading","name":"Preparation and tracked units"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{gadgetOrderId}}"}`.

Evidence: controls.

## 05 · Scene 03

Verify the unit and condition against the parcel.

Focus: `{"role":"heading","name":"Line items"}`

Evidence: controls.

## 06 · Scene 03

Gadget warranty follows its configured policy and delivery evidence; food and clothing have no warranty.

Focus: `{"role":"heading","name":"Preparation and tracked units"}`

Evidence: controls.

## 07 · Scene 04

Use the supported claim and recovery controls when an eligible gadget later needs attention. Keep identifiers and inspection evidence connected to the order.

Focus: `{"role":"heading","name":"Preparation and tracked units"}`

Prepare frame: `{"kind":"goto","path":"/admin/orders"}`; `{"kind":"goto","path":"/admin/orders/{{gadgetOrderId}}"}`.

Evidence: controls.

## 08 · Scene 04

Check the order timeline so preparation, unit assignment and subsequent recovery remain traceable.

Focus: `{"role":"heading","name":"Timeline"}`

Evidence: controls.
