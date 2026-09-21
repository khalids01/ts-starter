import { describe, expect, it } from "bun:test";

describe("auth response cookies", () => {
  it("separates folded session renewal cookies", async () => {
    const script = `
      import { getSetCookieHeaders } from "./packages/auth/src/session.server.ts";
      const headers = new Headers({ "set-cookie": "better-auth.session_token=renewed; Path=/; HttpOnly, better-auth.session_data=cached; Path=/; Expires=Fri, 04 Sep 2026 00:00:00 GMT; HttpOnly" });
      console.log(JSON.stringify(getSetCookieHeaders(headers)));
    `;
    const process = Bun.spawn(["bun", "-e", script], {
      cwd: new URL("../../..", import.meta.url).pathname,
      env: processEnv(),
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(process.stdout).text(),
      new Response(process.stderr).text(),
      process.exited,
    ]);
    expect(stderr).not.toContain("error");
    expect(exitCode).toBe(0);
    const resultLine = stdout.trim().split("\n").at(-1) ?? "";
    expect(JSON.parse(resultLine)).toEqual([
      "better-auth.session_token=renewed; Path=/; HttpOnly",
      "better-auth.session_data=cached; Path=/; Expires=Fri, 04 Sep 2026 00:00:00 GMT; HttpOnly",
    ]);
  });
});

function processEnv() {
  return { ...process.env, ENABLE_POLAR: "false" };
}
