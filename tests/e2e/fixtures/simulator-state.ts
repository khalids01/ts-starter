import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { z } from 'zod';
import { assertSimulatorAppEnvironment } from '../../courier-simulator/steadfast/app-guard';

const runId = z.string().regex(/^[a-f0-9]{16}$/);
const timestamp = z.string().datetime();
const settingsSchema = z.object({
  id: z.literal('default'), storeName: z.string(), supportEmail: z.string().nullable(), supportPhone: z.string().nullable(),
  defaultCurrency: z.string(), orderNumberPrefix: z.string(), reservationDurationMinutes: z.number().int().positive(),
  checkoutEnabled: z.boolean(), checkoutNotice: z.string().nullable(), createdAt: timestamp, updatedAt: timestamp,
}).strict();
const schema = z.object({
  version: z.literal(1), run: runId, marker: z.string(),
  databaseTarget: z.literal('postgresql://127.0.0.1:5433/e2e_v3_step10_20261003_03043274'),
  status: z.enum(['active', 'cleaned']),
  settings: z.array(settingsSchema).length(1),
  shippingDefaults: z.array(z.object({ id: z.string().min(1), updatedAt: timestamp }).strict()),
  providerExisted: z.boolean(), retainedOrders: z.number().int().nonnegative(),
}).strict().refine(value => value.marker === `v3-browser-sim-${value.run}`, 'Run namespace does not match');
export type OwnedSimulatorRun = z.infer<typeof schema>;
export function parseOwnedSimulatorRun(value: unknown) { return schema.parse(value); }
const directory = resolve(import.meta.dir, '../../artifacts/step14/owned-runs');
const lockPath = resolve(directory, 'active-run.json');
function manifestPath(run: string) { return resolve(directory, `${runId.parse(run)}.json`); }
async function activeRun(): Promise<string | null> {
  try { return runId.parse(JSON.parse(await readFile(lockPath, 'utf8')).run); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error; }
}
export async function beginOwnedSimulatorRun(value: unknown) {
  assertSimulatorAppEnvironment();
  const record = parseOwnedSimulatorRun(value);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  // Serial fixture ownership is required because existing helpers temporarily change shared settings/default shipping.
  // Persist the exclusive lock and restoration snapshot before the first application mutation.
  await writeFile(lockPath, JSON.stringify({ run: record.run }), { flag: 'wx', mode: 0o600 });
  try { await writeFile(manifestPath(record.run), JSON.stringify(record), { flag: 'wx', mode: 0o600 }); }
  catch (error) { await unlink(lockPath); throw error; }
  return record;
}
export async function readOwnedSimulatorRun(run: string) {
  assertSimulatorAppEnvironment();
  const record = parseOwnedSimulatorRun(JSON.parse(await readFile(manifestPath(run), 'utf8')));
  if (record.run !== run) throw new Error('Manifest file belongs to another run');
  return record;
}
export async function assertOwnedSimulatorRun(record: OwnedSimulatorRun) {
  assertSimulatorAppEnvironment();
  const saved = await readOwnedSimulatorRun(record.run);
  if (JSON.stringify(saved) !== JSON.stringify(record) || await activeRun() !== record.run)
    throw new Error('Cleanup requires this exact active run and unchanged restoration snapshot');
}
export async function finishOwnedSimulatorRun(record: OwnedSimulatorRun) {
  await assertOwnedSimulatorRun(record);
  const temporary = `${manifestPath(record.run)}.tmp`;
  await writeFile(temporary, JSON.stringify({ ...record, status: 'cleaned' }), { mode: 0o600 });
  await rename(temporary, manifestPath(record.run));
  await unlink(lockPath);
}
export async function releaseCleanedSimulatorRun(record: OwnedSimulatorRun) {
  assertSimulatorAppEnvironment();
  if (record.status !== 'cleaned') throw new Error('Run has not been cleaned');
  // If the process died after marking cleanup complete but before releasing the lock, replay can finish that exact unlink.
  const active = await activeRun();
  if (active === record.run) await unlink(lockPath);
}
export async function assertNoInterruptedSimulatorRun() {
  assertSimulatorAppEnvironment();
  const active = await activeRun();
  if (active) throw new Error(`Owned run ${active} needs scoped recovery before another suite starts`);
}
