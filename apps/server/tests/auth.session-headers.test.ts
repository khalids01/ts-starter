import { describe, expect, it } from "bun:test";
import { getSetCookieHeaders } from "@auth/server";

describe("auth response cookies", () => {
  it("separates folded session renewal cookies", () => {
    const headers = new Headers({
      "set-cookie": [
        "better-auth.session_token=renewed; Path=/; HttpOnly",
        "better-auth.session_data=cached; Path=/; Expires=Fri, 04 Sep 2026 00:00:00 GMT; HttpOnly",
      ].join(", "),
    });

    expect(getSetCookieHeaders(headers)).toEqual([
      "better-auth.session_token=renewed; Path=/; HttpOnly",
      "better-auth.session_data=cached; Path=/; Expires=Fri, 04 Sep 2026 00:00:00 GMT; HttpOnly",
    ]);
  });
});
