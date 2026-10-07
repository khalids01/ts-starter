# Archive, restore and safely delete catalog records — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Archive moves a catalog record out of the current working list while preserving its history. In Catalog, choose Categories, Attributes or Brands. Current and Archived are separate views; changing an active flag is not the same operation as archiving.

Screen actions:

- Open `/admin/catalog`.
- Select **Categories**.

## 02. Understand the controls

Find the intended record and open its row menu. Choose Archive and read the confirmation before accepting. Check that the record disappears from Current and appears in Archived. Dependencies and permissions are still enforced by the server.

Screen actions:

- Open `/admin/catalog`.
- Select **Categories**.
- Show and check **{{categoryName}}**.

## 03. Perform the task

To bring a record back, open Archived and use Restore. Read any dependency message: a referenced category, brand or option may need attention before recovery is allowed. Return to Current to confirm the result.

Screen actions:

- Open `/admin/catalog`.
- Select **Categories**.
- Select **Archived**.

## 04. Verify and continue

Permanent deletion is for eligible records that can be safely removed. Read the dependency checks instead of repeatedly forcing the action. A record used by products or historical data may be blocked. Preserve history whenever deleting would break a valid reference.

Screen actions:

- Open `/admin/catalog`.
- Select **Categories**.
- Select **Current**.
