/**
 * DESTRUCTIVE E2E RESET ENTRY POINT.
 *
 * It deliberately performs no mutation yet. Prisma migration-reset behavior
 * must be approved with an exact user-run command before this project encodes
 * destructive database or Redis cleanup semantics.
 */
import { assertTestEnvironment, printValidatedTestEnvironment } from "./assert-test-environment";

export function explainResetIsNotImplemented(): never {
  printValidatedTestEnvironment(assertTestEnvironment());
  throw new Error(
    "Destructive E2E reset is intentionally not implemented. After reviewing the disposable environment, run the approved reset/migration command manually; do not infer or automate it here.",
  );
}

if (import.meta.main) {
  explainResetIsNotImplemented();
}
