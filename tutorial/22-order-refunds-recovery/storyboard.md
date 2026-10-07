# Record refunds and recover physical inventory — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

A refund records money returned, while inventory recovery records what happened to the goods. Open the order and inspect Cancellation and refunds together with Physical inventory recovery. Neither event should be assumed from the other.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Cancellation and refunds**.

## 02. Understand the controls

Use Record manual refund only for a real refund you can support with evidence. Enter the amount and reason, and read the restock choice carefully. Partial refunds must reflect the actual money returned, not an arbitrary adjustment to the total.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Record manual refund**.

## 03. Perform the task

For goods returned after dispatch, record physical receipt first. Inspect every returned item and choose its condition. Unsafe or unsellable goods must not be made available merely because a customer was refunded.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Physical inventory recovery**.

## 04. Verify and continue

Restock only when the recovery controls confirm eligibility and every required inspection is complete. Review payment totals, timeline and inventory history afterward. A refund, receipt, inspection and restock are distinct evidence events.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Timeline**.
