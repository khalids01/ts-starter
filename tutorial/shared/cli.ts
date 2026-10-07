import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { recordTutorial } from "./record";
import { renderTutorial } from "./render";
import { publishTutorial } from "./publish";

const root = resolve(import.meta.dir, "..");
const catalogPath = resolve(root, "catalog.json");
const catalog = JSON.parse(await readFile(catalogPath, "utf8")) as Array<{ id: string; folder: string; title: string; status: string }>;
const [command, id] = process.argv.slice(2);
if (command === "list") {
  for (const item of catalog) console.log(`${item.id.padEnd(30)} ${item.status.padEnd(10)} ${item.title}`);
} else {
  const tutorial = catalog.find(item => item.id === id);
  if (!tutorial || !["record", "render", "publish"].includes(command ?? "")) throw new Error("Usage: tutorial:list, tutorial:record <id>, tutorial:render <id>, tutorial:publish <id>");
  const directory = resolve(root, tutorial.folder);
  if (tutorial.id === "product-to-completed-order") throw new Error("Use tutorial:record:legacy / tutorial:render:legacy for the retained continuous recorder. Its timing still needs review.");
  if (command === "record") await recordTutorial(directory);
  else if (command === "render") await renderTutorial(directory);
  else await publishTutorial(directory, catalogPath);
}
