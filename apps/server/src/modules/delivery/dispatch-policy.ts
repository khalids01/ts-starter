// These reasons are produced only by pre-submission eligibility checks.
const PRE_SUBMISSION_HOLDS = new Set([
  "connection_unavailable",
  "service_unavailable",
  "inventory_expired_or_unsafe",
  "niche_fulfillment_not_ready",
  "provider_capability_unavailable",
]);
export function canRetryUnsubmittedHold(
  operation: {
    kind: string;
    state: string;
    attemptCount: number;
    leaseUntil: unknown;
    lastErrorCode: string | null;
  },
  consignment: { externalId: unknown; submittedAt: unknown },
) {
  return (
    operation.kind === "create" &&
    operation.state === "manual_review" &&
    operation.attemptCount === 1 &&
    !operation.leaseUntil &&
    !consignment.externalId &&
    !consignment.submittedAt &&
    PRE_SUBMISSION_HOLDS.has(operation.lastErrorCode ?? "")
  );
}

const UNCERTAIN_BOOKING_REASONS = new Set([
  "uncertain_submission",
  "network",
  "provider",
  "invalid_response",
  "provider_success_local_save_failed",
  "recovery_not_supported",
  "validation",
]);
export function canReconcileBooking(
  operation: {
    kind: string;
    state: string;
    attemptCount: number;
    leaseUntil: unknown;
    lastErrorCode: string | null;
  },
  consignment: { externalId: unknown; submittedAt: unknown },
) {
  return (
    operation.kind === "create" &&
    operation.state === "manual_review" &&
    operation.attemptCount > 0 &&
    !operation.leaseUntil &&
    !consignment.externalId &&
    !consignment.submittedAt &&
    UNCERTAIN_BOOKING_REASONS.has(operation.lastErrorCode ?? "")
  );
}
