# Configure and review a courier connection — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

A courier connection links your shop to a supported provider account. Open Connections. Check existing records before adding another account, because duplicate configuration can make routing harder to understand.

Screen actions:

- Open `/admin/couriers/connections`.
- Show and check **Courier connections**.

## 02. Understand the controls

Select Add connection. Enter a connection name, choose the provider, configuration source and environment, and set priority. Lower nonnegative priority numbers run first. Use the supported credential source for your deployment.

Screen actions:

- Open `/admin/couriers/connections`.
- Select **Add connection**.
- Show and check **Connection name**.
- Show and check **Priority**.

## 03. Perform the task

When credentials are entered, keep them private and off the recording. The server does not return saved secrets. Save the connection and use the supported connection test only against the intended provider environment; in tutorials, that means the local simulator.

Screen actions:

- Open `/admin/couriers/connections`.
- Show and check **Courier connections**.

## 04. Verify and continue

Review health and enabled state before using the account for dispatch. Credential rotation, archive and recovery are separate actions. A successful account test does not establish that a parcel has been booked or a collection has settled.

Screen actions:

- Open `/admin/couriers/connections`.
- Show and check **Courier connections**.
