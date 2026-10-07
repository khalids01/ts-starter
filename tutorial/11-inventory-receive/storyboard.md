# Receive stock into inventory — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Receive records stock that has physically arrived. Open Inventory and choose Receive. Check the product, SKU and location against the goods in front of you. Receiving the wrong selling option can make stock appear available for an item you do not actually hold.

Screen actions:

- Open `/admin/inventory`.
- Select **Receive**.

## 02. Understand the controls

Select the product, its SKU and location, then enter the quantity received. Add the supplier, batch number, unit cost and reorder level when relevant. Unavailable-from is a local date and time after which that stock must not be offered.

Screen actions:

- Open `/admin/inventory`.
- Select **Receive**.
- Show and check **Product**.
- Show and check **Location**.
- Show and check **Quantity**.

## 03. Perform the task

Complete any inventory fields required by the category. For serialized gadgets, receiving quantity and registering identifiable units are separate requirements. Select Receive stock only after checking the details, and wait for the success state.

Screen actions:

- Open `/admin/inventory`.
- Select **Receive**.
- Show and check **Batch number**.
- Show and check **Receive stock**.

## 04. Verify and continue

Open Stock and Movements to verify the receipt. The expected row should show the received quantity at the correct location, with the movement retained in history. Product activation and checkout eligibility are separate from this inventory receipt.

Screen actions:

- Open `/admin/inventory`.
- Select **Movements**.
