# Create and manage product brands — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Brands identify who makes or owns a product. Open Catalog, then Brands. Use accurate brand names and owned or approved logo images. A brand is a catalog record; it does not change the deployment brand or the shop itself.

Screen actions:

- Open `/admin/catalog`.
- Select **Brands**.
- Show and check **Catalog**.

## 02. Understand the controls

Select Brand. Enter its name and slug. You can add a logo, website URL and description when those details are known. Active and featured control the record state and presentation. Leave optional facts empty rather than inventing them.

Screen actions:

- Open `/admin/catalog`.
- Select **Brands**.
- Select **Brand**.
- Show and check **Name**.
- Show and check **Website URL**.

## 03. Perform the task

Save the brand and check that it appears in the list. When editing a product, its category brand policy decides whether a brand is optional, required or unavailable. Selecting a brand does not create inventory or activate the product.

Screen actions:

- Open `/admin/catalog`.
- Select **Brands**.
- Select **Brand**.
- Enter `{{brandName}}` in **Name**.
- Enter `{{brandSlug}}` in **Slug**.
- Select **Save**, wait for the saved response and capture the new `brandId`.
- Show and check **Brand saved**.

## 04. Verify and continue

Use the row actions to edit a brand. Archive and restore belong to the catalog lifecycle workflow. Permanent deletion is guarded by dependencies; a brand already referenced by other records may need to remain available as history.

Screen actions:

- Open `/admin/catalog`.
- Select **Brands**.
- Show and check **{{brandName}}**.
