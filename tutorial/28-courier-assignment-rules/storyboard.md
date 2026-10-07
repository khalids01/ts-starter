# Configure and verify courier assignment rules — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Assignment rules determine how eligible orders are routed to courier connections and options. Open Assignment rules. Plan the conditions and priority so an order has a predictable outcome instead of relying on an accidental overlap.

Screen actions:

- Open `/admin/couriers/assignment-rules`.
- Show and check **Assignment rules**.

## 02. Understand the controls

Review each rule condition against the addresses, payment choices and product handling you support. Choose the intended connection and delivery option. Use clear rule names and the supported priority and enabled settings.

Screen actions:

- Open `/admin/couriers/assignment-rules`.
- Show and check **Assignment rules**.

## 03. Perform the task

Save the configuration and test representative fictional orders. Inspect the routing decision on the order before submission. A matching rule does not guarantee provider acceptance; booking and address validation remain separate steps.

Screen actions:

- Open `/admin/couriers/assignment-rules`.
- Open `/admin/orders/{{orderId}}`.
- Show and check **Fulfillment**.

## 04. Verify and continue

Review rules when shipping methods or courier accounts change. Keep an understandable fallback where supported, and investigate orders with no eligible route. Do not repeatedly submit an unroutable order to make the error disappear.

Screen actions:

- Open `/admin/couriers/assignment-rules`.
- Show and check **Assignment rules**.
