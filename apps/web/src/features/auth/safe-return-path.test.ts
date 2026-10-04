import { expect, test } from "bun:test";
import { safeReturnPath } from "./safe-return-path";
test("authentication return paths stay on the store origin", () => {
  expect(safeReturnPath("/orders/ORD-1?tab=history")).toBe(
    "/orders/ORD-1?tab=history",
  );
  for (const value of [
    undefined,
    "",
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/\nevil.test",
  ])
    expect(safeReturnPath(value)).toBe("/dashboard");
});
