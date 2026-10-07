# Record an inventory adjustment — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

An adjustment records a verified change to a stock quantity. Use it after counting stock or investigating a discrepancy, not to hide an unexplained order or movement. Open Inventory and choose Adjustments.

Screen actions:

- Open `/admin/inventory`.
- Select **Adjustments**.

## 02. Understand the controls

Select the exact stock row. Check its SKU, location and current availability. Enter Delta as the change: a positive value adds quantity, and a negative value removes quantity. Delta is not the new total you want to display.

Screen actions:

- Open `/admin/inventory`.
- Select **Adjustments**.
- Show and check **Stock row**.
- Show and check **Delta**.

## 03. Perform the task

Enter unit cost when it applies and give a clear reason explaining the evidence behind the change. Review the numbers, then submit the adjustment. Server checks may block changes that would make stock invalid or conflict with reserved or tracked inventory.

Screen actions:

- Open `/admin/inventory`.
- Select **Adjustments**.
- Show and check **Reason**.

## 04. Verify and continue

Return to Stock and Movements. Confirm the resulting quantity and the adjustment record, including its reason. If it is wrong, investigate and record a justified correction rather than making repeated unexplained changes.

Screen actions:

- Open `/admin/inventory`.
- Select **Movements**.
