import { expect, test } from 'bun:test';
import { parseOwnedSimulatorRun } from '../../e2e/fixtures/simulator-state';
const record = {
  version: 1, run: 'aabbccddeeff0011', marker: 'v3-browser-sim-aabbccddeeff0011',
  databaseTarget: 'postgresql://127.0.0.1:5433/e2e_v3_step10_20261003_03043274', status: 'active',
  settings: [{ id: 'default', storeName: 'Fictional retained shop', supportEmail: null, supportPhone: null, defaultCurrency: 'BDT', orderNumberPrefix: 'E2E', reservationDurationMinutes: 30, checkoutEnabled: true, checkoutNotice: null, createdAt: '2026-10-03T00:00:00.000Z', updatedAt: '2026-10-03T00:00:00.000Z' }],
  shippingDefaults: [{ id: 'fictional-rate', updatedAt: '2026-10-03T00:00:00.000Z' }], providerExisted: true, retainedOrders: 69,
};
test('saved cleanup ownership rejects alternate targets, namespace/path changes and malformed restoration snapshots', () => {
  expect(parseOwnedSimulatorRun(record).run).toBe(record.run);
  for (const changes of [
    { databaseTarget: 'postgresql://127.0.0.1:5433/other_e2e' }, { run: '../other' }, { marker: 'v3-browser-sim-other' },
    { settings: [] }, { settings: [{ ...record.settings[0], id: 'other' }] },
    { shippingDefaults: [{ id: 'fictional-rate', updatedAt: 'not-a-date' }] }, { deletionWhere: {} }, { retainedOrders: -1 },
  ]) expect(() => parseOwnedSimulatorRun({ ...record, ...changes })).toThrow();
});
