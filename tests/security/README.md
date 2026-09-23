# Security test boundary

Generated reports belong under `tests/security/reports/` and are ignored.

Implemented local checks:

- `bun run test:security:secrets` scans source files for high-confidence private-key and provider-token patterns without printing matched values.
- `bun audit` records dependency advisories; see [`dependency-audit.md`](./dependency-audit.md) for the reviewed disposition.
- DTO and service regression tests cover request limits, dangerous URL protocols, stable errors, RBAC, rate limiting, and ecommerce concurrency.

The OWASP ZAP active scan remains approval-gated because it starts services and actively probes an HTTP target. It must only target the guarded local E2E environment unless a staging URL is explicitly approved.
