import path from "node:path";
import {
  assertTestEnvironment,
  printValidatedTestEnvironment,
  type TestEnvironmentInput,
} from "./assert-test-environment";

export function validatedMigrationTarget(
  input: TestEnvironmentInput = process.env,
) {
  const target = assertTestEnvironment(input);
  if (target.isRemote)
    throw new Error("Test migration requires a dedicated local test database");
  return target;
}

if (import.meta.main) {
  // Run Prisma directly with the validated environment; `bun x` may lose --env-file values.
  printValidatedTestEnvironment(validatedMigrationTarget());
  const dbDirectory = path.resolve(import.meta.dir, "../../packages/db");
  const child = Bun.spawn(
    [
      "node",
      path.join(dbDirectory, "node_modules/prisma/build/index.js"),
      "migrate",
      "deploy",
    ],
    {
      cwd: dbDirectory,
      env: { ...process.env },
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  process.exit(await child.exited);
}
