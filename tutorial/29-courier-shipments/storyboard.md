# Review shipment booking and parcel handoff — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Shipments tracks courier submission and parcel progress. Open Shipments and identify the order and dispatch you intend to handle. Check routing and the customer address before creating a provider request.

Screen actions:

- Open `/admin/couriers/shipments`.
- Show and check **Shipments**.

## 02. Understand the controls

Queue a shipment through the supported dispatch controls only when its prerequisites are met. Submission can be asynchronous. Review queued, processing and error states instead of assuming that clicking once means a consignment exists.

Screen actions:

- Open `/admin/couriers/shipments`.
- Show and check **{{shipmentReference}}**.

## 03. Perform the task

When booking succeeds, inspect the provider consignment reference and tracking evidence. Record handoff only when the parcel leaves your control. Pickup and provider operations can create external work and should be used deliberately.

Screen actions:

- Open `/admin/couriers/shipments`.
- Show and check **{{shipmentReference}}**.

## 04. Verify and continue

Investigate failures using their recorded cause. Follow supported retry or review controls rather than making duplicate bookings. This tutorial uses simulator evidence; a local successful example is not proof of a live provider booking.

Screen actions:

- Open `/admin/couriers/shipments`.
- Show and check **Shipments**.
