import { createHmac } from 'node:crypto';
import { credentials, type Parcel, type ParcelState } from './contract';
export function callback(parcel: Parcel, state: ParcelState, updatedAt = new Date().toISOString()) {
  const body = JSON.stringify({ notification_type: 'delivery_status', consignment_id: parcel.externalId, invoice: parcel.request.invoice, status: state, updated_at: updatedAt });
  return signCallback(body);
}
export function signCallback(body: string, eventKey: string = crypto.randomUUID()) {
  const token = credentials.values.webhookToken!;
  return { body, headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}`, 'x-signature': createHmac('sha256', token).update(body).digest('hex'), 'idempotency-key': eventKey } };
}
export async function sendCallback(target: string, signed: ReturnType<typeof signCallback>, requestFetch: typeof fetch = fetch) {
  if (process.env.COURIER_SIMULATOR_CALLBACK_APPROVED !== 'true') throw new Error('Callback app integration requires separate explicit approval');
  const url = new URL(target);
  if (url.origin !== 'http://localhost:3000' || !/^\/courier\/webhooks\/[A-Za-z0-9_-]+$/.test(url.pathname) || url.search || url.hash || url.username || url.password) throw new Error('Only the isolated local app courier callback route is allowed');
  return requestFetch(url, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(5000), headers: signed.headers, body: signed.body });
}
