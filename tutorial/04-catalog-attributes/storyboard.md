# Configure product attributes and options — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Attributes describe product details and selectable options. Open Catalog, then Attributes. Reuse a well-defined field instead of creating several fields that mean the same thing. The category template decides where and how the field is used.

Screen actions:

- Open `/admin/catalog`.
- Select **Attributes**.

## 02. Understand the controls

Select Attribute and enter a name, slug and field type. Choose a type that matches the information: text, number or a supported choice type. Assign relevant categories and decide whether customers should be able to filter by it.

Screen actions:

- Open `/admin/catalog`.
- Select **Attributes**.
- Select **Attribute**.
- Show and check **Name**.
- Show and check **Type**.

## 03. Perform the task

Save the attribute, then configure its supported values and template placement through the catalog controls. Product details, variant options and inventory fields serve different purposes. A size option for a SKU is different from a descriptive specification.

Screen actions:

- Open `/admin/catalog`.
- Select **Attributes**.
- Select **Attribute**.
- Show and check **Slug**.
- Show and check **Sort order**.

## 04. Verify and continue

Open a prepared product to check the resulting fields. Required values must be present before readiness validation succeeds. Review existing category templates before removing values or making fields required; historical product data must remain understandable.

Screen actions:

- Open `/admin/catalog`.
- Select **Attributes**.
- Show and check **{{attributeName}}**.
