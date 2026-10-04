import { ORIGIN, states, type Parcel, type ParcelState, type Fault } from './contract';
import { mappings, type Mapping } from './scenarios';

type JournalEntry = { id: string; request: { method: string; url: string; body?: string }; stubMapping?: { id?: string } };
export class SimulatorControl {
  private readonly owned = new Map<string, { parcel: Parcel; mappingIds: string[] }>();
  constructor(readonly run: string, private readonly requestFetch: typeof fetch = fetch, origin = ORIGIN) {
    if (origin !== ORIGIN || !/^[a-z0-9_-]{1,20}$/.test(run)) throw new Error('Only the fixed local simulator and a bounded run ID are allowed');
  }
  private async admin(path: string, method = 'GET', body?: unknown) {
    const response = await this.requestFetch(`${ORIGIN}/__admin${path}`, { method, redirect: 'error', signal: AbortSignal.timeout(5000), headers: { 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    if (!response.ok) throw new Error(`Local WireMock admin failed (${response.status})`);
    if (response.status === 204 || response.headers.get('content-length') === '0') return undefined;
    const raw = await response.text();
    if (!raw) return undefined;
    try { return JSON.parse(raw) as unknown; } catch { throw new Error('Malformed local WireMock admin response'); }
  }
  async ready() {
    const response = await this.requestFetch(`${ORIGIN}/__simulator`, { redirect: 'error', signal: AbortSignal.timeout(5000) });
    const identity = response.ok ? await response.json() : null;
    if (identity?.profile !== 'steadfast-local-v1') throw new Error('Unexpected simulator profile at local port');
    const value = await this.admin('/mappings');
    if (!value || typeof value !== 'object' || !('mappings' in value) || !Array.isArray(value.mappings)) throw new Error('Unexpected local WireMock mappings response');
  }
  async register(parcel: Parcel, fault: Fault = 'none') {
    if (parcel.run !== this.run || !parcel.scenario.startsWith(`sim-${this.run}-`) || !/^[A-Za-z0-9_-]{1,100}$/.test(parcel.request.invoice)) throw new Error('Parcel belongs to another run');
    if (this.owned.has(parcel.scenario)) throw new Error('Parcel already registered; change fault explicitly');
    if ([...this.owned.values()].some(({ parcel: p }) => p.externalId === parcel.externalId || p.trackingCode === parcel.trackingCode || p.request.invoice === parcel.request.invoice)) throw new Error('Fixture identity collision');
    const list = mappings(parcel, fault);
    // Record each installed mapping immediately, so partial registration can be cleaned safely.
    const entry = { parcel, mappingIds: [] as string[] }; this.owned.set(parcel.scenario, entry);
    for (const mapping of list) { entry.mappingIds.push(mapping.id); await this.install(mapping); }
  }
  private async install(mapping: Mapping) {
    const value = await this.admin('/mappings', 'POST', mapping);
    if (!value || typeof value !== 'object' || !('id' in value) || value.id !== mapping.id) throw new Error('Unexpected mapping installation response');
  }
  private entry(parcel: Parcel) {
    const value = this.owned.get(parcel.scenario);
    if (!value || value.parcel !== parcel) throw new Error('Control does not own this parcel');
    return value;
  }
  async transition(parcel: Parcel, state: ParcelState) {
    this.entry(parcel);
    if (!states.includes(state)) throw new Error('Unsupported parcel state');
    await this.admin(`/scenarios/${encodeURIComponent(parcel.scenario)}/state`, 'PUT', { state });
  }
  async changeFault(parcel: Parcel, fault: Fault) {
    const entry = this.entry(parcel);
    // Keep mapping IDs: old journal entries retain their ownership when faults change.
    const first = mappings(parcel, fault)[0]!;
    first.id = entry.mappingIds[0]!;
    await this.admin(`/mappings/${first.id}`, 'PUT', first);
  }
  async state(parcel: Parcel): Promise<string> {
    this.entry(parcel);
    const value = await this.admin('/scenarios');
    if (!value || typeof value !== 'object' || !('scenarios' in value) || !Array.isArray(value.scenarios)) throw new Error('Unexpected local scenarios response');
    const scenario = value.scenarios.find(row => row.name === parcel.scenario);
    if (!scenario || typeof scenario.state !== 'string') throw new Error('Owned scenario was not found');
    return scenario.state;
  }
  async journal(): Promise<JournalEntry[]> {
    return this.journalFor(new Set([...this.owned.values()].flatMap(entry => entry.mappingIds)));
  }
  private async journalFor(ids: Set<string>): Promise<JournalEntry[]> {
    const value = await this.admin('/requests');
    if (!value || typeof value !== 'object' || !('requests' in value) || !Array.isArray(value.requests)) throw new Error('Unexpected local WireMock journal response');
    return value.requests.filter((entry: unknown): entry is JournalEntry => {
      if (!entry || typeof entry !== 'object' || !('id' in entry) || typeof entry.id !== 'string' || !('request' in entry) || typeof entry.request !== 'object' || entry.request === null) throw new Error('Malformed journal entry');
      const row = entry as JournalEntry;
      if (typeof row.request.method !== 'string' || typeof row.request.url !== 'string') throw new Error('Malformed journal request');
      return !!row.stubMapping?.id && ids.has(row.stubMapping.id);
    });
  }
  private async cleanupMappings(entries: Map<string, string[]>) {
    const ids = new Set([...entries.values()].flat());
    for (const event of await this.journalFor(ids)) await this.admin(`/requests/${encodeURIComponent(event.id)}`, 'DELETE');
    for (const [name, mappingIds] of entries) {
      if (mappingIds.length) {
        try { await this.admin(`/scenarios/${encodeURIComponent(name)}/state`, 'PUT', { state: 'Started' }); }
        catch (error) { if (!(error instanceof Error) || !error.message.includes('(404)')) throw error; }
      }
      for (const id of mappingIds) {
        try { await this.admin(`/mappings/${id}`, 'DELETE'); }
        catch (error) { if (!(error instanceof Error) || !error.message.includes('(404)')) throw error; }
      }
    }
  }
  async cleanup() {
    if (!this.owned.size) return;
    await this.cleanupMappings(new Map([...this.owned].map(([name, entry]) => [name, entry.mappingIds])));
    this.owned.clear();
  }
  async cleanupInterruptedRun() {
    await this.ready();
    const value = await this.admin('/mappings');
    if (!value || typeof value !== 'object' || !('mappings' in value) || !Array.isArray(value.mappings)) throw new Error('Unexpected local mappings response');
    const entries = new Map<string, string[]>();
    for (const mapping of value.mappings) {
      if (mapping.metadata?.simulatorRun !== this.run) continue;
      if (typeof mapping.scenarioName !== 'string' || !mapping.scenarioName.startsWith(`sim-${this.run}-`) || typeof mapping.id !== 'string' || !/^[a-f0-9-]{36}$/.test(mapping.id))
        throw new Error('Interrupted mapping has conflicting run ownership');
      entries.set(mapping.scenarioName, [...(entries.get(mapping.scenarioName) ?? []), mapping.id]);
    }
    // Recover ownership from exact run metadata only. Never reset all mappings, scenarios or the shared journal.
    await this.cleanupMappings(entries);
  }
}
