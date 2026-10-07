# Trace inventory movement history — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Movement history explains how recorded stock changed. Open Inventory and choose Movements. Use the SKU, location, quantity and event details to connect each movement to a receipt, order or adjustment.

Screen actions:

- Open `/admin/inventory`.
- Select **Movements**.

## 02. Understand the controls

Start with the event you are investigating. Identify whether it received, committed, released or otherwise changed stock. Read its quantity and any reason or reference. A list of movements is evidence of recorded operations, not proof that a physical count is correct.

Screen actions:

- Open `/admin/inventory`.
- Select **Movements**.
- Show and check **{{sku}}**.

## 03. Perform the task

Compare the movement with the related stock row and order timeline. Reservations and commitments have different effects. A return or cancellation does not always mean that goods are physically back in a sellable location.

Screen actions:

- Open `/admin/inventory`.
- Select **Stock**.
- Show and check **{{sku}}**.

## 04. Verify and continue

If the history and physical stock disagree, investigate first. Record a justified adjustment or recovery through the appropriate controls. Preserve the existing history so another operator can understand what happened.

Screen actions:

- Open `/admin/inventory`.
- Select **Movements**.
