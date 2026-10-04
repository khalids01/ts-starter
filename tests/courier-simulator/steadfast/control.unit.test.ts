import { test, expect } from 'bun:test';
import { fixture, payload } from './contract';
import { SimulatorControl } from './control';
import { mappings } from './scenarios';
import { callback, sendCallback } from './webhooks';

test('worker identities and decimal COD remain exact', () => {
  const a = fixture('unit', 'a', 'parcel', '19.99'), b = fixture('unit', 'b', 'parcel', '0');
  expect(a.externalId).not.toBe(b.externalId); expect(a.scenario).not.toBe(b.scenario); expect(payload(a).cod_amount).toBe(19.99); expect(payload(b).cod_amount).toBe(0);
  expect(() => fixture('../bad', 'a', 'parcel')).toThrow(); expect(() => fixture('unit', 'a', 'parcel', '-1')).toThrow();
});
test('exact booking matcher and accepted response loss transition', () => {
  const a = fixture('unit', 'a', 'parcel'), list = mappings(a, 'accepted-response-lost');
  expect(list[0]!.newScenarioState).toBe('pending'); expect(list[0]!.response.fixedDelayMilliseconds).toBe(1500);
  expect(JSON.stringify(list[0]!.request)).toContain('125.5'); expect(mappings(a, 'server')[0]!.newScenarioState).toBeUndefined();
  expect(new Set(list.map(m => m.id)).size).toBe(list.length);
});
test('control fails closed on external origins and malformed admin', async () => {
  expect(() => new SimulatorControl('unit', fetch, 'https://portal.packzy.com')).toThrow();
  const control = new SimulatorControl('unit', (async () => Response.json({ wrong: [] })) as unknown as typeof fetch);
  await expect(control.ready()).rejects.toThrow(); await expect(control.journal()).rejects.toThrow();
  await expect(control.register(fixture('other', 'a', 'parcel'))).rejects.toThrow();
});
test('partial registration retains installed mapping IDs for scoped cleanup', async () => {
  const calls: { method: string; url: string }[] = []; let posts = 0;
  const control = new SimulatorControl('unit', (async (url, init) => {
    calls.push({ method: init?.method ?? 'GET', url: String(url) });
    if (init?.method === 'POST' && ++posts === 2) return new Response('', { status: 500 });
    if (init?.method === 'POST') return Response.json(JSON.parse(String(init.body)));
    return init?.method === 'GET' ? Response.json({ requests: [] }) : new Response('', { status: 200 });
  }) as typeof fetch);
  await expect(control.register(fixture('unit', 'a', 'partial'))).rejects.toThrow(); await control.cleanup();
  expect(calls.filter(c => c.method === 'DELETE').length).toBe(2);
  expect(calls.some(c => c.url.endsWith('/reset'))).toBe(false);
});
test('callback signs exact bytes and app sending requires separate approval', async () => {
  const signed = callback(fixture('unit', 'a', 'parcel'), 'delivered', '2026-10-04T00:00:00Z');
  expect(signed.headers['x-signature']).toMatch(/^[a-f0-9]{64}$/);
  await expect(sendCallback('https://example.com/courier/webhooks/fixture', signed)).rejects.toThrow();
});

test('callback sender restricts route/origin and keeps signed bytes unchanged', async () => {
  const previous = process.env.COURIER_SIMULATOR_CALLBACK_APPROVED;
  process.env.COURIER_SIMULATOR_CALLBACK_APPROVED = 'true';
  const signed = callback(fixture('unit', 'a', 'parcel'), 'delivered');
  const calls: RequestInit[] = [];
  const mock = (async (_url: unknown, init: RequestInit) => { calls.push(init); return Response.json({ received: true }); }) as unknown as typeof fetch;
  try {
    await expect(sendCallback('https://example.com/courier/webhooks/fixture', signed, mock)).rejects.toThrow();
    await expect(sendCallback('http://localhost:3000/admin/orders', signed, mock)).rejects.toThrow();
    await sendCallback('http://localhost:3000/courier/webhooks/fixture', signed, mock);
    expect(calls.length).toBe(1); expect(calls[0]!.body).toBe(signed.body); expect(calls[0]!.redirect).toBe('error');
  } finally { if (previous === undefined) delete process.env.COURIER_SIMULATOR_CALLBACK_APPROVED; else process.env.COURIER_SIMULATOR_CALLBACK_APPROVED = previous; }
});

test('interrupted cleanup rediscovers only matching metadata/scenarios and preserves another journal', async () => {
  const ownId = '11111111-1111-4111-8111-111111111111', foreignId = '22222222-2222-4222-8222-222222222222';
  const calls: { method: string; url: string }[] = [];
  const control = new SimulatorControl('recover', (async (url, init) => {
    const path = new URL(String(url)).pathname;
    calls.push({ method: init?.method ?? 'GET', url: path });
    if (path === '/__simulator') return Response.json({ profile: 'steadfast-local-v1' });
    if (path === '/__admin/mappings') return Response.json({ mappings: [{ id: ownId, metadata: { simulatorRun: 'recover' }, scenarioName: 'sim-recover-app-one' }, { id: foreignId, metadata: { simulatorRun: 'other' }, scenarioName: 'sim-other-app-one' }] });
    if (path === '/__admin/requests') return Response.json({ requests: [{ id: 'own-event', request: { method: 'POST', url: '/create_order' }, stubMapping: { id: ownId } }, { id: 'foreign-event', request: { method: 'POST', url: '/create_order' }, stubMapping: { id: foreignId } }] });
    return new Response('', { status: 200 });
  }) as typeof fetch);
  await control.cleanupInterruptedRun();
  expect(calls.filter(c => c.method === 'DELETE').map(c => c.url)).toEqual(['/__admin/requests/own-event', `/__admin/mappings/${ownId}`]);
  expect(calls.find(c => c.method === 'PUT')?.url).toBe('/__admin/scenarios/sim-recover-app-one/state');
  expect(calls.some(c => c.url.endsWith('/reset'))).toBe(false);
});
test('interrupted cleanup rejects conflicting scenario ownership before any deletion', async () => {
  let mutations = 0;
  const control = new SimulatorControl('recover', (async (url, init) => {
    if (init?.method && init.method !== 'GET') mutations++;
    return String(url).endsWith('/__simulator') ? Response.json({ profile: 'steadfast-local-v1' }) : Response.json({ mappings: [{ id: '11111111-1111-4111-8111-111111111111', metadata: { simulatorRun: 'recover' }, scenarioName: 'sim-other-app-one' }] });
  }) as typeof fetch);
  await expect(control.cleanupInterruptedRun()).rejects.toThrow('conflicting run ownership');
  expect(mutations).toBe(0);
});
