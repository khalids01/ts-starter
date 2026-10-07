# Inspect webhook events and failures — storyboard

Status: authored; audio and recording review pending.

## 01. Find the workflow

Webhooks reports inbound integration events recorded by the application. Open Webhooks and find the event by provider, status, time or reference. Check the intended integration before interpreting the event.

Screen actions:

- Open `/admin/webhooks`.
- Show and check **Webhooks**.

## 02. Understand the controls

Review its processing state and supported details. An inbound event and its resulting business action are different evidence. A received event does not automatically prove that a payment, delivery or collection was successfully applied.

Screen actions:

- Open `/admin/webhooks`.
- Show and check **Webhooks**.
- Show and check **input[placeholder="Filter event type"]**.

## 03. Perform the task

Compare the event with the relevant order or integration record. Investigate failed processing using the recorded cause. Replays can repeat business effects, so use only supported recovery controls with deliberate authorization.

Screen actions:

- Open `/admin/webhooks`.
- Show and check **Webhooks**.

## 04. Verify and continue

Keep payloads and secrets out of tutorials and shared screenshots. Demonstrations use fictional events. Resolve the underlying error and verify the resulting state rather than treating a green webhook status as the complete operational outcome.

Screen actions:

- Open `/admin/webhooks`.
- Show and check **Webhooks**.
