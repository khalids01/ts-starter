import { assertTestEnvironment } from "../../setup/assert-test-environment";
const target = assertTestEnvironment();
if (target.isRemote)
  throw new Error("Step 11 requires an isolated local target");
// Narrow HTTP response fixtures for Step 11; no forwarding and no live-provider access.
let sequence = 1;
Bun.serve({
  hostname: "127.0.0.1",
  port: 3903,
  async fetch(request) {
    const pathname = new URL(request.url).pathname;
    if (
      request.headers.get("api-key") !== "step11-fictional-key" ||
      request.headers.get("secret-key") !== "step11-fictional-secret"
    )
      return Response.json(
        { error: "Invalid fictional credentials" },
        { status: 401 },
      );
    console.log(JSON.stringify({ method: request.method, pathname }));
    if (pathname === "/get_balance")
      return Response.json({ status: 200, current_balance: 0 });
    if (pathname === "/create_pickup_request")
      return Response.json({
        message: "Fictional pickup",
        data: {
          id: `pickup-${sequence++}`,
          req_status: "pending",
          created_at: new Date().toISOString(),
        },
      });
    if (pathname === "/create_return_request") {
      const body = (await request.json()) as {
        consignment_id: string;
        reason?: string;
      };
      return Response.json({
        id: `return-${sequence++}`,
        consignment_id: body.consignment_id,
        reason: body.reason,
        status: "pending",
      });
    }
    return Response.json(
      { error: "Step 11 fixture does not implement this endpoint" },
      { status: 400 },
    );
  },
});
console.log("Step 11 local courier fixture ready");
