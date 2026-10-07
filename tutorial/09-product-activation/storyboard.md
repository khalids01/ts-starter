# Validate, activate and manage product visibility — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

A saved product is not automatically ready to sell. Open the product builder and choose Validate. This step checks the configured requirements before activation. Resolve the actual errors instead of assuming that a saved form means the product is ready.

Screen actions:

- Open `/admin/products`.
- Open `/admin/products/{{productId}}`.
- Select **7 Validate**.

## 02. Understand the controls

Select Validate and read the result. Required product fields, valid variants and inventory requirements can affect readiness. Use the relevant builder or inventory screen to fix each issue, then validate again.

Screen actions:

- Open `/admin/products`.
- Open `/admin/products/{{productId}}`.
- Select **7 Validate**.
- Show and check **Validate**.

## 03. Perform the task

When readiness succeeds, select Activate product. Confirm the state change and open its storefront page to check what customers see. A product still needs available, eligible inventory and enabled checkout before a customer can complete an order.

Screen actions:

- Open `/admin/products`.
- Open `/admin/products/{{productId}}`.
- Select **7 Validate**.
- Show and check **Activate product**.

## 04. Verify and continue

Use the product list and lifecycle actions to manage visibility over time. Archive preserves a record separately from the active status. Restore and permanent deletion have server checks. After important edits, review readiness and storefront presentation again.

Screen actions:

- Open `/admin/products`.
- Open `/admin/products`.
- Show and check **{{productName}}**.
