# Understand on-hand, reserved and available stock — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Stock quantities describe different things. On-hand is physical inventory recorded at a location. Reserved stock is held for an order. Available stock is the quantity still eligible to sell. Open Inventory and use Stock to inspect these values together.

Screen actions:

- Open `/admin/inventory`.
- Select **Stock**.

## 02. Understand the controls

Check the SKU, location and batch before reading a quantity. Expiry or unavailable-from rules and serialized unit eligibility can affect what is sellable. Do not treat every physical unit as available to a new customer.

Screen actions:

- Open `/admin/inventory`.
- Select **Stock**.
- Show and check **{{sku}}**.

## 03. Perform the task

A checkout reservation holds the requested quantity. Confirming an order commits the inventory for fulfilment. Releasing a reservation and physically returning committed stock are different operations and must follow the corresponding order controls.

Screen actions:

- Open `/admin/inventory`.
- Select **Movements**.

## 04. Verify and continue

Use Movements to investigate a discrepancy before making an adjustment. Compare the order history with the SKU and location. This screen is a view of recorded state; changing a product price or active status does not correct a physical stock count.

Screen actions:

- Open `/admin/inventory`.
- Select **Stock**.
- Show and check **{{sku}}**.
