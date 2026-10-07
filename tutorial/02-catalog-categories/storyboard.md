# Create categories and configure handling — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Categories organize your catalog and determine the fields and handling rules used by products. Open Catalog and stay on Categories. Plan the category before adding products, because food, clothing and gadgets have different requirements.

Screen actions:

- Open `/admin/catalog`.
- Show and check **Catalog**.

## 02. Understand the controls

Select Category. Enter a clear name and readable slug. A parent creates a hierarchy. Choose the brand policy and product handling deliberately: standard, packaged food, fresh food, gadget or clothing. Handling is configured on each category and is not inherited from its parent.

Screen actions:

- Open `/admin/catalog`.
- Select **Category**.
- Show and check **Name**.
- Show and check **Product handling**.

## 03. Perform the task

For a gadget category, configure unit tracking and warranty days when they apply. Food and clothing cannot have a warranty. Use the active and featured choices to control availability and presentation, then save the category.

Screen actions:

- Open `/admin/catalog`.
- Select **Category**.
- Enter `{{categoryName}}` in **Name**.
- Enter `{{categorySlug}}` in **Slug**.
- Select **Save**, wait for the saved response and capture the new `categoryId`.
- Show and check **Category saved**.

## 04. Verify and continue

Return to the category list and confirm the saved name and handling. Category template fields are configured through the category controls and determine what appears in the product builder. Changing a template is a catalog decision; review existing products before changing required fields.

Screen actions:

- Open `/admin/catalog`.
- Show and check **{{categoryName}}**.
