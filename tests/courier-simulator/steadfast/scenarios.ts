import { credentials, payload, states, type Fault, type Parcel } from './contract';
export type Mapping = { id: string; metadata: { simulatorRun: string }; priority: number; request: Record<string, unknown>; response: Record<string, unknown>; scenarioName?: string; requiredScenarioState?: string; newScenarioState?: string };
export const authHeaders = { 'Api-Key': { equalTo: credentials.values.apiKey }, 'Secret-Key': { equalTo: credentials.values.secretKey } };
export function mappings(parcel: Parcel, fault: Fault = 'none'): Mapping[] {
  const make = (request: Record<string, unknown>, response: Record<string, unknown>, state: string, next?: string): Mapping => ({ id: crypto.randomUUID(), metadata: { simulatorRun: parcel.run }, priority: 1, request: { ...request, headers: authHeaders }, response, scenarioName: parcel.scenario, requiredScenarioState: state, ...(next ? { newScenarioState: next } : {}) });
  const json = (status: number, jsonBody: unknown) => ({ status, headers: { 'Content-Type': 'application/json' }, jsonBody });
  let response: Record<string, unknown> = json(200, { status: 200, message: 'Fictional consignment created', consignment: { consignment_id: parcel.externalId, invoice: parcel.request.invoice, tracking_code: parcel.trackingCode, status: 'pending' } });
  const faults: Partial<Record<Fault, Record<string, unknown>>> = {
    authentication: json(401, { error: 'Fictional authentication fault' }), validation: json(422, { error: 'Fictional validation fault' }),
    'rate-limit': { ...json(429, { error: 'Fictional cooldown' }), headers: { 'Content-Type': 'application/json', 'Retry-After': '2' } },
    server: json(500, { error: 'Fictional provider fault' }), network: { fault: 'EMPTY_RESPONSE' }, malformed: json(200, { status: 200, consignment: {} }),
    'accepted-response-lost': { ...response, fixedDelayMilliseconds: 1500 },
  };
  response = faults[fault] ?? response;
  const accepted = ['none', 'accepted-response-lost', 'malformed'].includes(fault);
  const create = { method: 'POST', urlPath: '/create_order', headers: { ...authHeaders, 'Content-Type': { contains: 'application/json' } }, bodyPatterns: [{ equalToJson: JSON.stringify(payload(parcel)), ignoreArrayOrder: false, ignoreExtraElements: false }] };
  const first = make(create, response, 'Started', accepted ? 'pending' : undefined);
  first.request = create;
  const result = [first];
  const paths = [`/status_by_invoice/${parcel.request.invoice}`, `/status_by_cid/${parcel.externalId}`, `/status_with_return_status_by_cid/${parcel.externalId}`, `/status_by_trackingcode/${parcel.trackingCode}`];
  for (const path of paths) result.push(make({ method: 'GET', urlPath: path }, json(404, { status: 404, message: 'Fictional parcel not found' }), 'Started'));
  for (const state of states) {
    const duplicate = make(create, json(409, { status: 409, message: 'Synthetic duplicate invoice; lookup required' }), state);
    duplicate.request = create;
    result.push(duplicate);
    for (const path of paths) result.push(make({ method: 'GET', urlPath: path }, json(200, { status: 200, delivery_status: state }), state));
  }
  return result;
}
