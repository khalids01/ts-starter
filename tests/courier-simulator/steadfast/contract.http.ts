// Explicit engine-only HTTP suite. Never imported by normal unit tests.
import { strict as assert } from 'node:assert';
import { SteadfastCourierAdapter, CourierProviderRequestError } from '../../../apps/server/src/modules/delivery/providers/steadfast';
import { credentials, fixture, ORIGIN, payload, states } from './contract';
import { SimulatorControl } from './control';
import { callback, signCallback } from './webhooks';
if (process.env.COURIER_SIMULATOR_HTTP_APPROVED !== 'true' || process.env.NODE_ENV !== 'test' || process.env.E2E_MODE !== 'true' || process.env.STEAD_FAST_BASE_URL !== ORIGIN) throw new Error('Explicit local simulator HTTP configuration required');
const run = crypto.randomUUID().replaceAll('-', '').slice(0, 16);
const control = new SimulatorControl(run), other = new SimulatorControl(`${run}b`);
const adapter = new SteadfastCourierAdapter(), fast = new SteadfastCourierAdapter(fetch, 150);
let checks = 0;
function errorDetails(error: unknown) { assert(error instanceof CourierProviderRequestError); return error.details; }
async function verify(name: string, fn: () => Promise<void>) { await fn(); checks++; console.log(`PASS ${name}`); }
try {
  await control.ready();
  await verify('fictional balance and health', async () => { assert.deepEqual(await adapter.getBalance(credentials), { amount: '0', currency: 'BDT' }); assert.deepEqual(await adapter.healthCheck(credentials), { available: true }); });
  const a = fixture(run, 'worker1', 'deposit', '125.50'), b = fixture(run, 'worker2', 'prepaid', '0');
  await control.register(a); await control.register(b);
  await verify('not found before booking', async () => { await assert.rejects(adapter.getStatusByInvoice(credentials, a.request.invoice), e => errorDetails(e).httpStatus === 404); });
  await verify('parallel invoices have independent stable IDs', async () => { const results = await Promise.all([adapter.createConsignment(credentials, a.request), adapter.createConsignment(credentials, b.request)]); assert.equal(results[0]!.externalId, String(a.externalId)); assert.equal(results[1]!.externalId, String(b.externalId)); assert.notEqual(results[0]!.externalId, results[1]!.externalId); });
  await verify('exact COD, headers and stable duplicate booking', async () => {
    const before = await control.journal();
    const creates = before.filter(e => e.request.url === '/create_order');
    assert.equal(creates.length, 2); assert(creates.some(e => e.request.body && JSON.stringify(JSON.parse(e.request.body)) === JSON.stringify(payload(a))));
    await assert.rejects(adapter.createConsignment(credentials, a.request), e => errorDetails(e).httpStatus === 409);
    assert.deepEqual(await adapter.recoverConsignment(credentials, a.request.invoice), { kind: 'uncertain', providerState: 'pending' });
  });
  await verify('independent transitions and three lookup identities', async () => {
    await control.transition(a, 'delivered_approval_pending');
    assert.equal((await adapter.getConsignmentStatus(credentials, String(a.externalId))).providerState, 'delivered_approval_pending');
    assert.equal((await adapter.getStatusByTrackingCode(credentials, a.trackingCode)).providerState, 'delivered_approval_pending');
    assert.equal((await adapter.getStatusByInvoice(credentials, b.request.invoice)).providerState, 'pending');
    for (const state of states) { await control.transition(a, state); assert.equal((await adapter.getStatusByInvoice(credentials, a.request.invoice)).providerState, state); }
    await control.transition(a, 'delivered'); assert.equal((await adapter.getStatusByInvoice(credentials, a.request.invoice)).providerState, 'delivered');
    await control.transition(b, 'cancelled_return_received'); assert.equal((await adapter.getConsignmentStatus(credentials, String(b.externalId))).providerState, 'cancelled_return_received');
  });
  await verify('wrong authentication, wrong COD and unknown endpoints fail', async () => {
    await assert.rejects(adapter.getBalance({ ...credentials, values: { ...credentials.values, apiKey: 'wrong' } }), e => errorDetails(e).code === 'authentication');
    const c = fixture(run, 'worker1', 'exact'); await control.register(c);
    await assert.rejects(adapter.createConsignment(credentials, { ...c.request, codAmount: '1' }), e => errorDetails(e).httpStatus === 422);
    const unknown = await fetch(`${ORIGIN}/unsupported`, { headers: { 'Api-Key': credentials.values.apiKey!, 'Secret-Key': credentials.values.secretKey! }, redirect: 'error' }); assert.equal(unknown.status, 422);
  });
  for (const [fault, code] of [['authentication', 'authentication'], ['validation', 'validation'], ['rate-limit', 'rate_limited'], ['server', 'provider'], ['network', 'network'], ['malformed', 'invalid_response']] as const) {
    await verify(`${fault} fault classification`, async () => { const p = fixture(run, 'fault', fault); await control.register(p, fault); await assert.rejects(adapter.createConsignment(credentials, p.request), e => { const d = errorDetails(e); return d.code === code && (fault !== 'rate-limit' || d.retryAfterSeconds === 2); }); });
  }
  await verify('never-accepted fault can be cleared without changing invoice', async () => {
    const p = fixture(run, 'fault', 'retry'); await control.register(p, 'server'); await assert.rejects(adapter.createConsignment(credentials, p.request)); await control.changeFault(p, 'none'); assert.equal((await adapter.createConsignment(credentials, p.request)).externalId, String(p.externalId));
  });
  await verify('accepted response loss remains uncertain with status-only recovery', async () => {
    const p = fixture(run, 'fault', 'lost'); await control.register(p, 'accepted-response-lost');
    const result = await fast.createConsignmentWithRecovery(credentials, p.request); assert.equal(result.kind, 'uncertain'); if (result.kind === 'uncertain') { assert.equal(result.reason, 'provider_found_invoice'); assert.equal(result.providerState, 'pending'); }
    await assert.rejects(adapter.createConsignment(credentials, p.request), e => errorDetails(e).httpStatus === 409);
  });
  await verify('production callback parser verifies exact bytes and rejects altered payloads', async () => {
    const signed = callback(a, 'delivered', '2026-10-04T00:00:00.000Z');
    const parse = (s: ReturnType<typeof signCallback>) => adapter.verifyAndParseWebhook(credentials, { body: s.body, authorization: s.headers.authorization, signature: s.headers['x-signature'], idempotencyKey: s.headers['idempotency-key'] });
    const event = await parse(signed); assert.equal(event.externalId, String(a.externalId)); assert.equal(event.providerState, 'delivered');
    assert.equal((await parse({ ...signed, headers: { ...signed.headers, 'idempotency-key': 'another-header' } })).eventId, event.eventId);
    await assert.rejects(parse({ ...signed, body: signed.body + ' ' })); await assert.rejects(parse({ ...signed, headers: { ...signed.headers, authorization: '' } }));
    await assert.rejects(parse(signCallback('{'))); await assert.rejects(parse(signCallback(JSON.stringify({ notification_type: 'unsupported' }))));
  });
  await verify('cleanup preserves another run mappings and journal', async () => {
    const p = fixture(other.run, 'worker', 'preserved'); await other.register(p); await adapter.createConsignment(credentials, p.request);
    await control.cleanup(); assert.equal((await adapter.getConsignmentStatus(credentials, String(p.externalId))).providerState, 'pending'); assert.equal((await other.journal()).filter(e => e.request.url === '/create_order').length, 1);
  });
  console.log(`Simulator HTTP contract: ${checks} checks passed; no app/DB services used.`);
} finally { await control.cleanup(); await other.cleanup(); }
