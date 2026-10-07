# Mark an order shipped and update tracking — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Mark shipped records a real parcel handoff. Open the confirmed order and check Fulfillment. Complete any required preparation, delivery window or serialized unit assignment first. Recording a shipment does not automatically book a courier.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Fulfillment**.

## 02. Understand the controls

Select Mark shipped. Enter the actual carrier and tracking number, and add a useful note. Check the parcel and address against the order. Save the action only when the parcel has actually left your control.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Select **Mark shipped**.
- Show and check **Carrier**.
- Show and check **Tracking number**.

## 03. Perform the task

Verify that the order now shows shipped delivery evidence, carrier and tracking. Check Timeline for the event. Courier-integrated bookings have their own workflow and may impose additional routing or consignment requirements.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Timeline**.

## 04. Verify and continue

If tracking details change, use Edit tracking rather than inventing another shipment. Record the corrected details and reason, then review the history. A shipped state is not delivery confirmation and does not establish that payment has been collected.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Fulfillment**.
