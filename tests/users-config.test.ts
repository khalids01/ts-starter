import { describe, expect, test } from "bun:test";
import {
  AUTHENTICATED_SHOPPER,
  BILLING_ALTERNATIVE,
  GUEST_SHOPPER,
  TEST_USERS,
  assertTestUsersAreSafe,
  getTestUser,
} from "./users-config";

describe("shared E2E personas", () => {
  test("uses only fictional example.test accounts and deterministic state paths", () => {
    expect(() => assertTestUsersAreSafe()).not.toThrow();
    expect(Object.values(TEST_USERS)).toHaveLength(5);
    expect(Object.values(TEST_USERS).every((user) => user.email.endsWith(".example.test"))).toBe(true);
    expect(Object.values(TEST_USERS).every((user) => user.storageStatePath.startsWith("tests/e2e/.auth/"))).toBe(true);
  });

  test("keeps checkout and tutorial profiles password-free and distinct", () => {
    expect(getTestUser("user").email).toBe(AUTHENTICATED_SHOPPER.email);
    expect(GUEST_SHOPPER.email).not.toBe(AUTHENTICATED_SHOPPER.email);
    expect(BILLING_ALTERNATIVE.addressLine1).not.toBe(AUTHENTICATED_SHOPPER.addressLine1);
    expect(Object.hasOwn(AUTHENTICATED_SHOPPER, "password")).toBe(false);
  });
});
