import { expect, test } from 'bun:test';
import { canReconcileBooking, canRetryUnsubmittedHold } from '../src/modules/delivery/dispatch-policy';

test('cancelled attempted booking accepts identity evidence but never a blind retry', () => {
  const operation = { kind: 'create', state: 'manual_review', attemptCount: 1, leaseUntil: null, lastErrorCode: 'order_recovery_required' };
  const consignment = { externalId: null, submittedAt: null };
  expect(canReconcileBooking(operation, consignment)).toBe(true);
  expect(canRetryUnsubmittedHold(operation, consignment)).toBe(false);
  expect(canReconcileBooking({ ...operation, attemptCount: 0 }, consignment)).toBe(false);
  expect(canReconcileBooking({ ...operation, leaseUntil: new Date() }, consignment)).toBe(false);
  expect(canReconcileBooking({ ...operation, state: 'processing' }, consignment)).toBe(false);
  expect(canReconcileBooking(operation, { ...consignment, externalId: 'accepted' })).toBe(false);
});
