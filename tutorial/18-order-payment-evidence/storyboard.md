# Record and correct payment evidence — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Payment evidence records money that has actually been received. It does not move money between accounts. Open the order and check Payment evidence, Totals and the outstanding amount before choosing Record confirmed payment.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Payment evidence**.

## 02. Understand the controls

Enter only the amount received. Choose the real collection method, provide the transaction or receipt reference and add a clear evidence note. Partial receipts can be recorded separately until the outstanding amount reaches zero.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Select **Record confirmed payment**.
- Show and check **Collection reference**.
- Show and check **Evidence / correction reason**.

## 03. Perform the task

Select Record evidence after reviewing the details, then verify the receipt and totals. For courier-collected cash on delivery, use the courier collection workflow with actual collection evidence. Do not invent a manual receipt to make an unpaid order appear paid.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Totals**.

## 04. Verify and continue

If a receipt was recorded by mistake, use Correct mistaken receipt and explain the correction. Preserve the receipt history. Check the updated net received and outstanding values before fulfilment or completion.

Screen actions:

- Open `/admin/orders`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Payment evidence**.
