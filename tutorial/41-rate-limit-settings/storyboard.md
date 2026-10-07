# Review and configure request rate limits — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Rate limits protect the application from excessive requests. Open Rate Limits and review the configured groups. Public, authentication, protected and administrative endpoints have different purposes and may need different thresholds.

Screen actions:

- Open `/admin/rate-limits`.
- Show and check **Rate Limits**.

## 02. Understand the controls

Each group exposes a time window and maximum request count. Understand the units before editing. A smaller threshold can block legitimate use, while a larger threshold may weaken protection. Choose values using evidence from your actual traffic.

Screen actions:

- Open `/admin/rate-limits`.
- Show and check **#public-window**.

## 03. Perform the task

Save only a reviewed configuration change. Verify both ordinary permitted requests and the expected rejection behavior in a supervised environment. Authentication limits deserve special care because an incorrect setting can interfere with sign-in.

Screen actions:

- Open `/admin/rate-limits`.
- Show and check **#public-max**.

## 04. Verify and continue

Do not interpret a saved setting as proof of production capacity or security acceptance. Monitor latency, errors and rejected requests after deployment. Keep a known previous configuration so an operator can restore it when a reviewed change causes trouble.

Screen actions:

- Open `/admin/rate-limits`.
- Show and check **Rate Limits**.
