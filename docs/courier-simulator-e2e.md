# Local Steadfast simulation for E2E

Research date: 2026-10-02. Historical research snapshot. A standalone simulator was implemented and engine-verified on 2026-10-04; see `tests/courier-simulator/steadfast/README.md`. Selected isolated app integration is now verified under subsequent explicit authorization (V3 section 27); no live-provider request executed. The research findings below remain historical, not current provider certification.

## Finding and choice

Targeted searches for Steadfast courier simulator, sandbox, and mock server did not identify a verified, maintained, ready-made Steadfast emulator. Search results primarily describe client SDKs; an SDK or mocked `fetch` is not a local HTTP courier simulator. The merchant reports no Steadfast testnet. Do not claim a sandbox exists or that searches prove no emulator exists anywhere.

Use **WireMock Open Source** as the proposed local HTTP simulation engine. It runs as a standalone JAR or Docker container, supports request matching, state-machine scenarios, response templating, request verification, delays/errors, and outbound webhooks. It does not ship a verified Steadfast contract. We must supply versioned mappings and validate them against our adapter and reviewed provider documentation.

Primary references:

- [Standalone process and JSON configuration](https://wiremock.org/docs/standalone/java-jar/)
- [Official Docker image](https://wiremock.org/docs/standalone/docker/)
- [Stateful scenarios and resets](https://wiremock.org/docs/stateful-behaviour/)
- [Response templating](https://wiremock.org/docs/response-templating/)
- [Webhooks and callbacks](https://wiremock.org/docs/webhooks-and-callbacks/)
- [Faults and delays](https://wiremock.org/docs/simulating-faults/)

A local simulation demonstrates our HTTP integration and application behavior against its defined contract. It does not verify Steadfast's deployed validation, rate limits, signature contract, payouts, merchant permissions, or delivery operations. Track simulator, reviewed contract, and live merchant acceptance separately.

## Existing repository integration

1. Read `apps/server/src/modules/delivery/providers/steadfast.ts`, credentials configuration, webhook handlers, and `apps/server/tests/steadfast.adapter.test.ts`.
2. Reuse `apps/server/tests/fixtures/steadfast/{create-order.success,status.success}.json` for reviewed example response shapes. Do not treat fixture contents as independently verified provider behavior.
3. The adapter uses credentials `baseUrl`; configure the isolated simulator connection with `http://localhost:9099` and fictional keys. Existing credentials validation allows local HTTP for hostname `localhost`; do not weaken production HTTPS validation to accommodate a Docker service name.
4. The app process must be able to reach its own `localhost:9099`. If it runs in a container, solve the network placement explicitly or use a properly configured HTTPS simulator. Browser localhost and app-server localhost may be different machines.
5. `E2E_MODE=true` currently disables the dispatch timer. A future E2E harness must invoke `runOnce` through an isolated test process/helper. Do not expose a production worker-trigger endpoint or silently enable uncontrolled workers.
6. Existing Prisma-based E2E fixtures require separately authorized DB provisioning/reset. Simulator research does not authorize those operations.

The detailed execution guide is [Steadfast courier simulation plan](steadfast-courier-simulation-plan.md). Use its 12-step ledger for implementation; this document retains research and integration context.

## Simulator preparation for V3 Steps 10–11

Do this after the preceding payment, shipment-claim, retry, tracking, and authorization fixes. The simulator can be installed by the user earlier, but that is not acceptance of the unfinished delivery workflow.

1. Pin an Open Source release and its image digest or JAR checksum. The official docs currently show `3.13.2`; verify availability when setup is authorized. Avoid `latest` and avoid cloud sign-in/proxy recording.
2. Add mappings under `tests/courier-simulator/steadfast/mappings`, fictional response files under `__files`, and a dedicated loopback-only launch configuration. Never insert real keys or merchant response captures.
3. Supply an explicit user-run launch command or isolated compose file. Example engine startup, not a ready Steadfast profile:

   ```sh
   docker run --rm --name ts-starter-courier-simulator \
     -p 127.0.0.1:9099:8080 \
     -v "$PWD/tests/courier-simulator/steadfast:/home/wiremock:ro" \
     wiremock/wiremock:3.13.2 --global-response-templating
   ```

   This command is documentation only. The referenced mappings have not been created, and the command has not been run. A JAR installation is also supported if the user prefers no Docker.

4. Configure a separate fictional Steadfast connection through isolated app settings. Verify every external request goes to the local engine. No fallback to `portal.packzy.com` or another merchant endpoint. Disable proxying and live outbound provider access in the test environment.
5. Generate invoice-specific scenarios/mappings from each fictional order. Allocate unique external/tracking IDs per invoice. Open Source scenarios are per instance; do not use one global parcel scenario for parallel orders. Reset only simulator state/journal owned by this test; never app data implicitly.
6. Require `Api-Key`, `Secret-Key`, and JSON content-type in the mappings, using only fake expected values. Wrong/missing credentials must fail. Validate required payload fields and exact reviewed `cod_amount` in each scenario instead of accepting all POST bodies.
7. Implement POST `/create_order`, GET `/status_by_invoice/{invoice}`, GET `/status_by_cid/{id}`, and GET `/get_balance` for the capabilities the current adapter actually invokes. Preserve status and body semantics used by the adapter. Unimplemented paths must fail, not report fictional success.
8. Model one accepted booking per invoice. Repeated creates must exercise duplicate/recovery behavior using the same identity. Status lookup before acceptance returns documented not-found behavior; do not fabricate recovered external identity when the contract does not return one.
9. Drive `in_review`, approval-pending states, `delivered`, cancellation, partial delivery, return-processing, and return-received deliberately. Approval pending must not become delivered/paid. Physical warehouse receipt and sellable inspection remain separate app actions.
10. Add 401, 422, 429/Retry-After, 500, delayed success beyond timeout, connection failure, and accepted-but-response-lost scenarios. Assert provider request counts and durable operation identity. A timeout must not permit a second active shipment or restock uncertain goods.
11. For callbacks, use the repository's reviewed webhook parser/signature contract. If WireMock cannot generate the required HMAC directly, have a small test helper sign the exact JSON bytes and send them to the local app. Never use an unsigned webhook shortcut in production code. Keep callback targets restricted to the isolated local app.
12. Settlement is currently manual gross customer collection evidence. A simulator's account balance/net payout is not a receipt. Exercise the real reconciliation action with matching/mismatched amounts; keep undocumented provider payout mapping disabled.
13. Write adapter HTTP contract tests against the engine before Playwright flows. Then cover checkout -> deposit -> route review -> queue -> dispatch -> callback/poll -> delivered -> settlement -> completion, plus cancellation/recovery/refund and permission negatives.
14. Assert app DB/history effects through authorized isolated test fixtures, and WireMock request journal counts/fields. A successful mocked HTTP response or video alone is insufficient.
15. Run the simulator contract suite and browser E2E only after user authorization for service startup and DB-backed setup. Record exact engine/profile version, application revision, test counts, limitations, and cleanup ownership in the V3 guide.

## Acceptance before claiming simulator E2E readiness

- Engine installation and local networking verified; mappings tested against the unchanged production Steadfast adapter.
- Unique invoice state, repeated booking recovery, exact money, auth failures, transient faults, signed callbacks, and multiple parallel parcels tested.
- No live provider traffic, real merchant data, or production bypass configuration.
- App stock, ledger, shipment claim, timeline, and permissions asserted—not merely fake response status.
- Simulation limitations documented; live merchant acceptance remains separately tracked.

Current status (2026-10-04): standalone engine/mappings/control library and production-adapter HTTP contract checks passed. See the simulator README for exact verified commands and limits. App/DB/browser E2E and live merchant acceptance remain deferred. Earlier preparation paragraphs are historical proposals, not evidence of completed application acceptance.
