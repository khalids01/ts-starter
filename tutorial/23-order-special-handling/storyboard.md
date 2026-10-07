# Handle food preparation, tracked gadgets and warranty — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Some products need extra fulfilment evidence. The category handling policy determines the required controls. Open the order and review Preparation and tracked units before shipping. Use the controls appropriate to the actual goods.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Preparation and tracked units**.

## 02. Understand the controls

For fresh or prepared food, review the delivery window and preparation requirements. Record the supported preparation evidence as work happens. Do not mark a parcel ready simply because a generic order status allows an update.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Line items**.

## 03. Perform the task

For tracked gadgets, assign the serial number or IMEI of the physical unit being sent. Verify the unit and condition against the parcel. Gadget warranty follows its configured policy and delivery evidence; food and clothing have no warranty.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{gadgetOrderId}}`.
- Show and check **Preparation and tracked units**.

## 04. Verify and continue

Use the supported claim and recovery controls when an eligible gadget later needs attention. Keep identifiers and inspection evidence connected to the order. Check the order timeline so preparation, unit assignment and subsequent recovery remain traceable.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{gadgetOrderId}}`.
- Show and check **Timeline**.
