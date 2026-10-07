# Map courier delivery options to shipping methods — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

A delivery option connects a checkout shipping method to a courier account and service level. Open Delivery options and review the current mappings. Keep customer-facing choices consistent with services that the provider can actually fulfil.

Screen actions:

- Open `/admin/couriers/delivery-options`.
- Show and check **Delivery options**.

## 02. Understand the controls

Choose the intended connection and shipping method in the option controls. Configure the supported provider service level and enabled state. Use descriptive names so another operator can identify the mapping without reading credentials.

Screen actions:

- Open `/admin/couriers/delivery-options`.
- Show and check **Delivery options**.

## 03. Perform the task

Save and check the resulting option. An enabled mapping is configuration; it does not submit an order. Review assignment rules to understand which orders will use this connection and option.

Screen actions:

- Open `/admin/couriers/delivery-options`.
- Show and check **Delivery options**.

## 04. Verify and continue

When a service is retired, review dependent rules and shipments before archiving or removing it. Use a simulated order to verify routing. Do not infer successful booking from the existence of a delivery option.

Screen actions:

- Open `/admin/couriers/delivery-options`.
- Show and check **Delivery options**.
