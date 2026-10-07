# Configure checkout shipping methods — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Shipping methods are the delivery choices offered at checkout. Open Shipping methods from Delivery. Decide the method name, price and eligibility before creating a rate. A checkout rate is separate from a courier provider account.

Screen actions:

- Open `/admin/shipping`.
- Show and check **Shipping**.

## 02. Understand the controls

Select Shipping rate and enter its code, label, currency and amount. Configure supported free-shipping and location rules when needed. Set the intended default and active state deliberately; customers should see choices you can actually fulfil.

Screen actions:

- Open `/admin/shipping`.
- Select **Shipping rate**.
- Show and check **Code**.
- Show and check **Name**.

## 03. Perform the task

Save the method and review it in the list. Courier delivery options can map a method to a provider connection. Creating the shipping method alone does not book a parcel or prove that the provider serves the customer address.

Screen actions:

- Open `/admin/shipping`.
- Show and check **Shipping**.

## 04. Verify and continue

Check a supervised checkout with an eligible address to verify the displayed choice and charge. Archive, restore and deletion preserve server dependency checks. Review existing delivery option mappings before removing a method used by operations.

Screen actions:

- Open `/admin/shipping`.
- Show and check **Shipping**.
