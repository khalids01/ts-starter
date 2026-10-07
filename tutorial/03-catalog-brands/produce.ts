import { produceTutorial } from "../shared/produce";

await produceTutorial(import.meta.dir, process.argv[2]);
