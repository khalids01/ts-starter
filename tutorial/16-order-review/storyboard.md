# Review a new customer order — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Review an order before accepting it for fulfilment. Open Orders and locate the intended order using search and status filters. Open its details and confirm that the order number belongs to the customer request you are handling.

Screen actions:

- Open `/admin/orders`.
- Show and check **Orders**.

## 02. Understand the controls

Review Customer, Addresses and Line items. Check contact details, the delivery address, SKU, quantity and any special handling. A customer profile and an order address can have different purposes; use the order details for this shipment.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Customer**.
- Show and check **Addresses**.

## 03. Perform the task

Review Totals, payment method, delivery state and inventory state. Look at the outstanding amount and reservation information. An order marked pending is not automatically paid or shipped. Investigate unexpected prices or missing operational details before proceeding.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Line items**.
- Show and check **Totals**.

## 04. Verify and continue

Read Timeline to see the recorded sequence. When everything is correct, follow the confirmation workflow. If it is not, use the supported operational actions and retain a clear reason. Do not casually edit status fields to make inconsistent states appear resolved.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Timeline**.
