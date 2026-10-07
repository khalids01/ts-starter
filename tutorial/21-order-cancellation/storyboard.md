# Cancel an order with the correct stock outcome — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Cancellation must match what actually happened to the order. Open its details and inspect inventory, payment and delivery states. Goods still reserved and goods already handed to a courier need different follow-up actions.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Cancellation and refunds**.

## 02. Understand the controls

Open the cancellation control in Cancellation and refunds. Read the dialog, enter a clear reason and add an internal note when needed. Check the consequences before confirming. A cancelled status does not prove that dispatched stock has physically returned.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Cancel order**.

## 03. Perform the task

After cancellation, review the timeline and inventory state. A reservation may be released when allowed; committed or dispatched goods can require physical recovery. Payment that was actually received may need a separate refund record.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Timeline**.

## 04. Verify and continue

Follow the recovery controls when stock is not safely back in inventory. Retain the cancellation reason and evidence. Do not make quantity adjustments simply to hide an unresolved return or unpaid refund.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Physical inventory recovery**.
