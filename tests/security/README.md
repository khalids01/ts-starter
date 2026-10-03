# Security test boundary

Generated reports belong under `tests/security/reports/` and are ignored.

Implemented local checks:

- `bun run test:security:secrets` scans source files for high-confidence private-key and provider-token patterns without printing matched values.
- `bun audit` records dependency advisories; see [`dependency-audit.md`](./dependency-audit.md) for the reviewed disposition.
- DTO and service regression tests cover request limits, dangerous URL protocols, stable errors, RBAC, rate limiting, and ecommerce concurrency.

The OWASP ZAP active scan remains approval-gated because it starts services and actively probes an HTTP target. It must only target the guarded local E2E environment unless a staging URL is explicitly approved.

## V3 Step 12 local run

The recorded isolated runtime file is ignored, mode 0600, at `tests/artifacts/step11/runtime.env`. Inspect/confirm its target with the existing test-environment guard. Never print or commit it or browser authentication state.

Focused HTTP/browser checks (existing fictional accounts and services must already be running):

```bash
bun --env-file=tests/artifacts/step11/runtime.env ./node_modules/.bin/playwright test --config=playwright.step12.config.ts --no-deps
```

The config guards a local test target, uses only Chromium, and includes security, V3 RBAC and V3 ownership/webhook regressions. E2E mode bypasses production rate limiting; passing this suite does not verify production Redis/auth limiter enforcement. Origin/CSRF checks are explicitly enabled in all environments.

### Active scan: prepared, not executed

Review `step12-zap-plan.yaml` and `run-step12-zap.ts` before obtaining explicit approval. The plan targets only localhost:3000/3001 public product/catalog/settings pages and `/shop`, `/saved`, `/track-order`. It excludes authentication, admin, courier actions, checkout and payments. Anonymous public scanning does not replace authenticated tests or a staging security assessment. Active scanning is capped at five minutes, two threads per host and 100 ms request delay; spider/passive waits add elapsed time.

Only **after explicit user approval of this exact local target and plan**:

```bash
STEP12_ZAP_APPROVED=true bun --env-file=tests/artifacts/step11/runtime.env tests/security/run-step12-zap.ts
```

The flag records approval, it does not grant it. The runner rejects remote targets and any database other than the recorded fictional Step 10 database, checks local services, then runs the official Docker image. Docker may download the image. The scanner binds no public host ports. HTML/JSON outputs go to ignored `tests/artifacts/step12/zap/`. Inspect scanner exit status AND report contents: a zero process exit is not evidence of zero alerts. Record image digest, scan scope, alerts, reproducibility and each disposition before closing the gate. The prepared plan/runner have not yet been executed or validated inside a ZAP container.

Official parameter reference: [ZAP activeScan job](https://www.zaproxy.org/docs/desktop/addons/automation-framework/job-ascan/).
