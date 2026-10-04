import { createHash } from 'node:crypto';
import type { CourierCredentials, CreateConsignmentRequest } from '../../../apps/server/src/modules/delivery/provider';

export const ORIGIN = 'http://localhost:9099';
export const credentials: CourierCredentials = { baseUrl: ORIGIN, values: { apiKey: 'sim-fictional-key', secretKey: 'sim-fictional-secret', webhookToken: 'sim-fictional-webhook-token' } };
export const states = ['pending', 'in_review', 'delivered_approval_pending', 'partial_delivered_approval_pending', 'cancelled_approval_pending', 'unknown_approval_pending', 'delivered', 'partial_delivered', 'cancelled', 'hold', 'exceptional', 'unknown', 'partial_delivered_return_proccessing', 'partial_delivered_return_rider_assigned', 'partial_delivered_return_received', 'cancelled_return_proccessing', 'cancelled_return_rider_assigned', 'cancelled_return_received'] as const;
export type ParcelState = typeof states[number];
export type Fault = 'none' | 'authentication' | 'validation' | 'rate-limit' | 'server' | 'network' | 'malformed' | 'accepted-response-lost';
export type Parcel = { run: string; scenario: string; externalId: number; trackingCode: string; request: CreateConsignmentRequest };
export function fixture(run: string, worker: string, label: string, codAmount = '125.50'): Parcel {
  for (const value of [run, worker, label]) if (!/^[a-z0-9_-]{1,20}$/.test(value)) throw new Error('Use bounded fictional fixture names');
  if (!/^\d+(\.\d{1,2})?$/.test(codAmount) || !Number.isSafeInteger(Number(codAmount.split('.')[0]) * 100 + Number((codAmount.split('.')[1] ?? '').padEnd(2, '0')))) throw new Error('Invalid fictional COD');
  const invoice = `sim-${run}-${worker}-${label}`;
  const digest = createHash('sha256').update(invoice).digest('hex');
  return { run, scenario: invoice, externalId: parseInt(digest.slice(0, 12), 16), trackingCode: `SIM${digest.slice(0, 20).toUpperCase()}`, request: { invoice, recipientName: 'Fictional simulator buyer', recipientPhone: '01700000000', recipientAddress: '1 Fictional Road, Dhaka', codAmount, currency: 'BDT', note: 'Fictional test parcel' } };
}
export function payload(parcel: Parcel) {
  const r = parcel.request;
  return { invoice: r.invoice, recipient_name: r.recipientName, recipient_phone: r.recipientPhone, recipient_address: r.recipientAddress, cod_amount: Number(r.codAmount), delivery_type: 0, ...(r.note ? { note: r.note } : {}) };
}
