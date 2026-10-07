# Track courier returns and recover received goods — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Courier returns track parcels coming back through a provider. Open Returns and review the original order, consignment and return state. A provider return notification does not by itself mean the goods are back in your stock location.

Screen actions:

- Open `/admin/couriers/returns`.
- Show and check **Courier returns**.

## 02. Understand the controls

Use supported return actions only for the real parcel outcome and the provider integration in use. Keep the return reference and reason. Cancellation of an order and initiation of a courier return are different operations.

Screen actions:

- Open `/admin/couriers/returns`.
- Show and check **{{returnReference}}**.

## 03. Perform the task

When the parcel physically arrives, inspect the goods through the order recovery workflow. Record receipt and condition before considering restock. Damaged, expired or otherwise unsafe items must not become sellable merely because the return is complete.

Screen actions:

- Open `/admin/couriers/returns`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Physical inventory recovery**.

## 04. Verify and continue

Compare the return history, order timeline, recovery evidence and payment outcome. Refunds and courier collections require their own records. Resolve disagreements before closing the operational case.

Screen actions:

- Open `/admin/couriers/returns`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Timeline**.
