# Configure roles and permission boundaries — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Roles group permissions for people doing similar work. Open Roles and review the existing roles before creating another. The owner role has special authority; ordinary staff should receive only the capabilities their job requires.

Screen actions:

- Open `/admin/roles`.
- Show and check **Roles**.

## 02. Understand the controls

Create a custom role when the built-in choices do not fit. Use a clear name and description. Permission groups distinguish reading data from managing it, and order fulfilment, payment, refund and courier reconciliation are separate capabilities.

Screen actions:

- Open `/admin/roles`.
- Select **Create Role**.
- Show and check **Create custom role**.

## 03. Perform the task

Open the role detail page to inspect or edit supported permissions. Save deliberately and review the result. Resetting or deleting roles has separate controls and may be restricted for built-in or referenced roles.

Screen actions:

- Open `/admin/roles`.
- Open `/admin/roles/{{roleId}}`.
- Show and check **Permissions**.

## 04. Verify and continue

Verify access using a suitable isolated account, including a denied action as well as an allowed one. Hiding a navigation item is not the whole access boundary: server authorization must still apply. Keep the role understandable to the next administrator.

Screen actions:

- Open `/admin/roles`.
- Show and check **Roles**.
