const allowed = new Set(['app-worker.ts', 'app-interrupted-fixture.ts']);
export async function startSimulatorPeer(script: string, args: string[] = []) {
  if (!allowed.has(script)) throw new Error('Unrecognized isolated peer script');
  let ready!: (message: Record<string, unknown>) => void;
  const readiness = new Promise<Record<string, unknown>>(resolve => { ready = resolve; });
  const child = Bun.spawn(['bun', `tests/courier-simulator/steadfast/${script}`, ...args], {
    env: { ...process.env }, stdout: 'pipe', stderr: 'pipe',
    ipc(message) { if ((message as { type?: string }).type === 'ready') ready(message as Record<string, unknown>); },
  });
  const output = new Response(child.stdout).text();
  const errors = new Response(child.stderr).text();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const message = await Promise.race([
      readiness,
      child.exited.then(async () => { throw new Error(`Peer exited before readiness: ${await errors}`); }),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Peer readiness timed out')), 15000); }),
    ]);
    return { child, message, output, errors };
  } catch (error) { child.kill('SIGKILL'); await child.exited; throw error; }
  finally { clearTimeout(timer); }
}
export async function finishSimulatorPeer(peer: Awaited<ReturnType<typeof startSimulatorPeer>>) {
  const code = await peer.child.exited;
  const stderr = await peer.errors;
  if (code !== 0) throw new Error(`Peer failed (${code}): ${stderr}`);
  return JSON.parse((await peer.output).trim().split('\n').at(-1)!) as { processed: number };
}
