# Step 13 local capacity execution results

Status: **approved local execution finished; capacity acceptance remains open because peak failed**. The user explicitly approved the capacity setup and workloads on 2026-10-03 after commits `1b7da9f` and `be448a9`. This approval does not include staging, backup/restore, real courier actions, active security scans or additional commits.

## Target and setup

- New database: `e2e_v3_step13_capacity_20261003_a`, existing fictional PostgreSQL 17 test container, `127.0.0.1:5433`. Created only after confirming the approved name did not exist. All 36 existing migrations applied successfully; no schema changes or normal ecommerce seed used.
- Dedicated Redis 7 container: `ts-starter-step13-capacity-redis`, loopback-only port 6381, append-only persistence enabled. Existing correctness Redis on 6380 remains separate.
- API: owned compiled Bun production process on `127.0.0.1:3013`, `E2E_MODE=false`, courier workers paused, external provider/mail/storage/payment credentials blank. No customer-IP spoofing.
- Five fictional signup accounts provisioned via the application auth API with verified RBAC. Auth/RBAC provisioning is scoped to the approved database. No mailbox or external provider was used.
- Private environment/session/fixture artifacts remain ignored under `tests/artifacts/step13/`. Never include cookies, passwords or credential URLs in a public report or tutorial.
- Approved temporary app headroom policy applies only inside this capacity DB: public 10,000/minute, admin/protected/special 1,000/minute; enabled, auth policy unchanged; restored after each profile. This is an application capacity test, not acceptance of merchant limit policy, customer IP attribution or proxy behavior.

## Workload results

| Profile | Status | Evidence |
| --- | --- | --- |
| Dataset population and pre-load invariants | Passed | 10,000 customers, 25,000 orders, 1,000 products/3,000 variants, related histories and reconciled counters |
| Smoke | Passed after measured fixes | 17/17 checks; zero HTTP failures; p95 public 254ms/admin 299ms/checkout 207ms; persisted checkout and invariants matched |
| Data volume | Passed | 320/320 checks; zero HTTP failures; p95 public 98ms/admin 238ms; resource/invariant checks passed |
| Expected | Passed on final aggregation build; first attempt failed/aborted | Full 15 minutes, 25,203 requests, 901 persisted checkouts; zero failures/dropped iterations; p95 public 89ms/admin 281ms/checkout 116ms, checkout p99 158ms; invariants and persisted delta matched |
| Peak | Failed | Full 2 minutes at 100 public + 5 checkout requests/second; 9,264 completed requests, 3,338 dropped iterations, one failed checkout response; p95 public 4,404ms/checkout 5,489ms, checkout p99 5,900ms; 581 successful checkouts matched the persisted delta and invariants passed |
| Soak | Passed | Full 60 minutes at 10 public + 0.2 checkout requests/second; 36,721 requests, 721 successful persisted checkouts; zero failures/drops; p95 public 78ms/checkout 160ms, checkout p99 173ms; invariants and persisted delta matched |

Investigate any failed profile before increasing load. After the peak failed, the approved soak uses a lower load to assess sustained stability; it cannot erase the failed peak. Final evidence must include thresholds, dropped iterations, business/counter/checkout reconciliation, resource trends, source/build fingerprints and cleanup verification. Passing this local workload does not prove production capacity or close the staging/worker/simulator/restore/security gates.

## Measured corrections during execution

1. Initial smoke timed out on `/admin/visitors` at 10 seconds. The original query joined latest-session details for all grouped people before the page limit. Added a materialized paged rollup before the lateral latest-session lookup. Seven real PostgreSQL checks verify person grouping across identities, latest details, bounded pages and new/returning/bot/all segments. The temporary regression identities/sessions were cleaned up. Initial failed report is retained.
2. The next smoke had no HTTP/business failures but public p95 508ms exceeded 500ms. The filters endpoint loaded complete product/variant/attribute detail graphs for facet counts. Reduced selection to prices, stock, brands and only relevant facet assignment fields. Three real PostgreSQL responses exactly match the original for global/category, numeric, boolean and product/variant value cases. A same-process alternating-order benchmark discarded two warmup pairs and measured ten pairs: median 319.16ms before versus 186.31ms after. This is a query/service comparison, not a production throughput claim; first-call timings were noisy and did not improve consistently. The paired fixtures were cleaned up.
3. Added private live resource progress files to inspect ongoing approved runs and corrected resource scope metadata: the dedicated capacity Redis instance runs on 6381, while hardware is still a shared local host. No schema/index/migration changes or commits were made during execution.

Hardware baseline: Linux x64, Intel Core i5-8250U, eight available logical CPUs, about 11.6GiB host RAM; PostgreSQL 17.11, Redis 7.4.11, k6 2.3.0. API/k6 source fingerprints and per-execution IDs are retained in ignored metadata reports. PostgreSQL shares the pre-existing test container; these results are specific to this local topology.

4. The first expected-load attempt was interrupted after approximately 303.5 seconds because p95 public was 7.30s, admin/checkout about 10s, HTTP failures 1.69%, and 279 iterations dropped. It is a failed, incomplete profile; its reports remain retained. It had 280 successful checkout responses but 296 new orders: 16 orders persisted without a successful observed response, so checkout-delta reconciliation also failed. Its stock/money/counter invariants passed. The retry used fresh execution identities and did not reset/delete these orders. Database samples had no lock waits/deadlocks. The remaining unscoped facet path still hydrated hundreds of product/variant/stock graphs per request. Added `filter-summary.ts` to aggregate prices, available products and brands in PostgreSQL when there are no attribute facets; attribute-bearing and mixed-currency cases retain the mapping path. No stock-result cache or stale availability window was introduced. Seven additional real PostgreSQL checks cover default/active prices, brand counts/sorting/nulls/inactive exclusions, expired/quarantined/inactive-location stocks, empty selections and mixed-currency fallback; paired facet cases also match the original service. Final alternating warmed comparison: 307.00ms median original versus 76.38ms aggregated. The full expected profile subsequently passed on that build, as recorded above.
5. The runner now exposes k6's local-only diagnostic REST interface on `127.0.0.1:6565` during its owned process, allowing read-only live metrics inspection. It exits with k6. Explicit p99 summary statistics were added for the checkout evidence; resource and metrics progress files remain private and ignored.

## Expected and peak resource interpretation

The passed expected run collected 182 samples with no sampling errors, database lock waits or deadlocks; its last API RSS was approximately 258MiB and Redis memory about 1.19MiB. Fourteen database connections include the observer. Peak collected 26 samples with no sampling errors or lock waits/deadlocks. API CPU counters increased by approximately 141 CPU seconds over 124 wall seconds (Linux ticks converted using 100 ticks/second): roughly one CPU core continuously. Peak RSS reached approximately 344MiB before falling to 279MiB during drainage; Redis remained about 1.2MiB. This suggests API CPU/queue saturation, but these samples are not an endpoint profiler or proof of the exclusive bottleneck. One checkout response failed; all 581 successful checkout responses reconciled to new orders and stock/money invariants passed. Do not relax thresholds or mark peak accepted. A deployment capacity decision requires a reviewed performance investigation and repeat on the intended topology.

The runner now preserves a unique API runtime log per future execution instead of overwriting a shared file. Earlier peak API stderr was overwritten by the subsequent soak startup; the peak k6, metrics, metadata and invariant reports remain retained. The completed soak started before this log-retention change and used the legacy runtime log.

## Soak resources and final cleanup

The full soak collected **722 samples, zero sampling errors**. API RSS ranged 212–247MiB and ended at 238MiB. Median RSS after warmup in the first ten minutes was 232MiB versus 238MiB in the last ten minutes; no sustained runaway growth was observed in this hour, which is not proof against all leaks. Database connections peaked at 14 including the observer; sampled lock waits and deadlocks were zero. Redis ended at about 1.19MiB, with zero blocked/rejected clients or evicted keys. Courier queues/leases remained empty because workers were paused and no courier workload was populated.

A separate guarded read-only audit after cleanup passed: **27,503 total retained orders**, 3,000 stock rows, no invariant failures, no regression fixture rows, no courier connections/consignments/operations. The original rate-limit row was restored (public 60, auth 10, protected 120, admin 300, special 30 requests per 60-second window, all enabled; preserved original `updatedAt` 2026-10-03T17:51:29.256Z). The first audit incorrectly assumed the original row was absent; inspection confirmed an existing default row. Corrected the audit assertion without changing database settings and reran successfully.

Owned API port 3013 and k6 diagnostic port 6565 are no longer listening. The capacity DB and dedicated Redis container on 6381 remain retained for review; no reset/deletion or commit followed.

## Retained evidence and reproduction

All following files are private ignored artifacts under `tests/artifacts/step13/`. Each `capacity-<suffix>.json` has matching `invariants-<suffix>.json`, `resources-<suffix>.json` and `metadata-<suffix>.json`. Metadata contains API/k6 script hashes and the unique execution ID; reports preserve failed attempts separately.

| Final profile | Exact suffix | Raw log |
| --- | --- | --- |
| Smoke | `20261003-a-smoke-c0b70ea3-d0f8-46f9-9b9d-29de8b7feade` | `load-smoke-after-aggregate.txt` |
| Volume | `20261003-a-volume-a98de05a-014f-4d2d-9ddb-2d6ea7100bab` | `load-volume-after-aggregate.txt` |
| Expected | `20261003-a-expected-1279def2-a913-4f4a-a202-102d9434a3c3` | `load-expected-after-aggregate.txt` |
| Peak (failed) | `20261003-a-peak-e43f5397-3349-43c8-93f4-1943a53de76d` | `load-peak.txt` |
| Soak | `20261003-a-soak-6a1af81a-993b-4569-8ea9-6eb7ce59d93e` | `load-soak.txt` |

The failed interrupted expected suffix is `20261003-a-expected-ceaa7c3f-59be-4a82-92c7-97283cc0635f`; its raw log is `load-expected.txt`. Final independent audit: `audit-final.json`; focused checks: `final-focused-tests.txt` (15 tests, 56 assertions), `final-types.txt` (focused runtime TypeScript), plus `git diff --check`. The actual-DB regression reports are independent evidence, not part of that unit-test count.

Do not repopulate this DB or rerun migrations. Follow the guarded existing-target reproduction in V3 section 25 and the capacity execution guide, rebuilding the compiled API if source changed and preserving fingerprints. Never use a real session/courier credential. API runtime logs were shared before the final harness correction; peak stderr is unavailable, so the exact cause of its one failed checkout response remains unresolved.

## What remains

1. Profile the saturated peak workload by endpoint on the intended per-shop deployment shape; explain the failed checkout and repeat the unchanged peak thresholds. Do not treat the passed 28 requests/second expected run as a maximum-throughput result or translate it into concurrent shopper/production sizing claims.
2. Complete separately scoped staging HTTPS/proxy/IP/auth/rate-policy and deployed monitoring acceptance; this single-IP local headroom workload does not cover them.
3. Complete worker/courier simulator recovery and separately authorized backup/restore evidence. Real courier acceptance remains Step 14.
4. Resolve Step 12 active-scan and dependency-risk/review gates and earlier recorded acceptance gaps before tutorial recording or release. Three subsequent numbered steps remain (14–16); Step 13 acceptance is still open.

Execution-discovered source/test/documentation changes remain uncommitted.
