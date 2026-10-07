# Confirm an order and commit its stock — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Confirmation accepts the order for fulfilment and commits its reserved inventory. Open the pending order and review the customer, line items, totals and reservation first. Confirm only when the order is ready for your team to handle.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Line items**.

## 02. Understand the controls

Use Order status to choose Confirmed. Review the pending change and select Update order. Wait for the success state instead of clicking repeatedly. A reservation that is no longer valid may require investigation before confirmation can succeed.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Order status**.
- Show and check **Update order**.

## 03. Perform the task

After confirmation, verify the order status and inventory status together. Inventory should show the committed state for the accepted goods. Confirmation does not collect payment and does not prove that a parcel has been shipped.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Totals**.

## 04. Verify and continue

Continue with payment evidence and the correct fulfilment controls. Use cancellation and physical recovery workflows if circumstances change. Do not use a status change as a substitute for releasing or recovering stock correctly.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Timeline**.
