import { describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const productionRoots = ["apps", "packages"];
const forbiddenImport = /(?:from\s*["'][^"']*(?:tests\/users-config|tests\/setup)[^"']*["']|import\s*\(\s*["'][^"']*(?:tests\/users-config|tests\/setup)[^"']*["']\s*\))/;

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(file);
      return /\.(?:ts|tsx|mts|cts)$/.test(entry.name) ? [file] : [];
    }),
  );
  return nested.flat();
}

describe("test-only credential boundary", () => {
  test("application packages do not import E2E credential or setup modules", async () => {
    const violations: string[] = [];
    for (const root of productionRoots) {
      for (const file of await sourceFiles(path.resolve(root))) {
        if (forbiddenImport.test(await readFile(file, "utf8"))) {
          violations.push(path.relative(process.cwd(), file));
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
