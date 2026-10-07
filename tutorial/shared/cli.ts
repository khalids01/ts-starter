import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { recordTutorial } from "./record";
import { renderTutorial } from "./render";
import { publishTutorial } from "./publish";

const root = resolve(import.meta.dir, "..");
const catalogPath = resolve(root, "catalog.json");
const catalog = JSON.parse(await readFile(catalogPath, "utf8")) as Array<{ id: string; folder: string; title: string; status: string }>;
const [command, id] = process.argv.slice(2);
if (command === "prepare" && id === "all") {
  for (const item of catalog.filter(item => !item.folder.startsWith("00-") && !item.folder.startsWith("01-"))) {
    const child = Bun.spawn(["bun", resolve(root, item.folder, "produce.ts"), "prepare"], { stdout: "inherit", stderr: "inherit" });
    if (await child.exited !== 0) throw new Error(`Invalid prepared plan: ${item.id}`);
  }
} else if (command === "list") {
  for (const item of catalog) console.log(`${item.id.padEnd(30)} ${item.status.padEnd(10)} ${item.title}`);
} else {
  const tutorial = catalog.find(item => item.id === id);
  if (!tutorial || !["prepare", "audio", "record", "render", "publish"].includes(command ?? "")) throw new Error("Usage: tutorial:list, tutorial:prepare <id|all>, tutorial:audio <id>, tutorial:record <id>, tutorial:render <id>, tutorial:publish <id>");
  const directory = resolve(root, tutorial.folder);
  if (tutorial.id === "product-to-completed-order") throw new Error("Use tutorial:record:legacy / tutorial:render:legacy for the retained continuous recorder. Its timing still needs review.");
  if (tutorial.folder.startsWith("01-") && ["prepare", "audio"].includes(command!)) throw new Error("Tutorial 01 retains its accepted producer; use its existing commands separately. Prepare all covers only 02–43.");
  const producer = resolve(directory, "produce.ts");
  if (["prepare", "audio", "record", "render"].includes(command!) && await Bun.file(producer).exists()) {
    const child = Bun.spawn(["bun", producer, command === "record" ? "capture" : command!], { stdout: "inherit", stderr: "inherit", env: process.env });
    if (await child.exited !== 0) throw new Error(`Tutorial ${command} failed`);
  } else if (command === "record") await recordTutorial(directory);
  else if (command === "render") await renderTutorial(directory);
  else await publishTutorial(directory, catalogPath);
}
