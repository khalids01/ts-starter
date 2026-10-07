# Record delivery and complete an order — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Delivery and completion record different milestones. Open the shipped order and verify delivery evidence from the actual handoff. Use Mark delivered only after delivery is confirmed; a tracking number by itself is not proof.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Fulfillment**.

## 02. Understand the controls

Select Mark delivered and record a factual note. Wait for the saved state, then check delivery status and timestamp. If a courier integration supplies delivery information, review its evidence and supported controls before adding a conflicting manual action.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Select **Mark delivered**.
- Show and check **Note**.

## 03. Perform the task

Check that payment is fully collected, delivery is delivered, inventory remains committed and no operational issue blocks completion. Then choose Completed in Order status and select Update order. Read any guard message and resolve its cause.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Totals**.

## 04. Verify and continue

Review Timeline and Totals after the update. The order should show the recorded delivery and completion events. Completing an order does not replace missing money or physical evidence. Use the appropriate recovery or refund workflow when the real outcome is different.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Timeline**.
