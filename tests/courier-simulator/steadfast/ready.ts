import { SimulatorControl } from './control';
const control = new SimulatorControl('readiness');
const deadline = Date.now() + 20000;
while (true) {
  try { await control.ready(); console.log('Local courier simulator ready on http://localhost:9099'); break; }
  catch (error) { if (Date.now() >= deadline) throw error; await Bun.sleep(250); }
}
