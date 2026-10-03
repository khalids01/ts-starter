import { assertTestEnvironment } from "../setup/assert-test-environment";
const target = assertTestEnvironment();
if (target.isRemote || target.databaseName !== "e2e_v3_step13_capacity_20261003_a" || process.env.STEP13_LOAD_APPROVED !== "true") throw new Error("Approved exact capacity target required");
const { default: db } = await import("../../packages/db/src/client.server");
const { adminVisitorsService } = await import("../../apps/server/src/modules/admin/visitors/visitors.service");
const prefix = `cap13-visitor-regression-${crypto.randomUUID()}`;
const identity = (n: number) => `${prefix}-${n}`;
const date = (minute: number) => new Date(`2099-01-01T00:${String(minute).padStart(2, "0")}:00Z`);
try {
  const actor = await db.user.findUniqueOrThrow({ where: { id: process.env.STEP13_FIXTURE_ACTOR_ID }, select: { id: true, email: true } });
  if (!actor.email.endsWith(".example.test")) throw new Error("Fictional actor required");
  await db.visitorIdentity.createMany({ data: [0, 1, 2].map((n) => ({ id: identity(n), visitorId: identity(n), firstSeenAt: n === 0 ? new Date("2098-12-15T00:00:00Z") : date(0), lastSeenAt: date(12) })) });
  const sessions = [
    { visitorIdentityId: identity(0), userId: actor.id, minute: 5, path: "/logged-old", isBot: false },
    { visitorIdentityId: identity(1), userId: actor.id, minute: 10, path: "/logged-new", isBot: false },
    { visitorIdentityId: identity(2), userId: null, minute: 3, path: "/guest-old", isBot: false },
    { visitorIdentityId: identity(2), userId: null, minute: 7, path: "/guest-new", isBot: false },
    { visitorIdentityId: identity(0), userId: actor.id, minute: 12, path: "/bot", isBot: true },
  ];
  await db.visitorSession.createMany({ data: sessions.map((s, n) => ({ id: `${prefix}-session-${n}`, visitorIdentityId: s.visitorIdentityId, userId: s.userId, isBot: s.isBot, startedAt: date(0), lastSeenAt: date(s.minute), entryPath: s.path, lastPath: s.path })) });
  const query = { dateFrom: "2099-01-01", dateTo: "2099-01-01", limit: 1 };
  function check(value: unknown, message: string) { if (!value) throw new Error(message); }
  const first = await adminVisitorsService.listVisitors({ ...query, page: 1 });
  check(first.total === 2 && first.pages === 2 && first.items.length === 1, "Visitor person pagination/count");
  check(first.items[0]?.isLoggedIn && first.items[0].userEmail === actor.email && first.items[0].lastPath === "/logged-new" && first.items[0].visitsCount === 2, "Logged identities collapse and latest metadata retained");
  const second = await adminVisitorsService.listVisitors({ ...query, page: 99 });
  check(second.page === 2 && second.items[0]?.lastPath === "/guest-new" && second.items[0].visitsCount === 2, "Page bound and guest latest metadata");
  const returning = await adminVisitorsService.listVisitors({ ...query, type: "returning" });
  check(returning.total === 1 && returning.items[0]?.isLoggedIn, "Returning uses earliest identity date per person");
  const fresh = await adminVisitorsService.listVisitors({ ...query, type: "new" });
  check(fresh.total === 1 && !fresh.items[0]?.isLoggedIn, "New-person filter retained");
  const bots = await adminVisitorsService.listVisitors({ ...query, segment: "bots" });
  check(bots.total === 1 && bots.items[0]?.isBot && bots.items[0].lastPath === "/bot", "Bot filter retained");
  const all = await adminVisitorsService.listVisitors({ ...query, segment: "all" });
  check(all.items[0]?.visitsCount === 3 && all.items[0].lastPath === "/bot", "All-segment aggregation/latest retained");
  await Bun.write("tests/artifacts/step13/visitor-regression.json", JSON.stringify({ passed: true, checks: 7, target: target.databaseName, fixtures: "five own sessions/three identities; cleaned up" }, null, 2));
  console.log("Seven real PostgreSQL visitor grouping/pagination/filter/latest-metadata checks passed");
} finally {
  try { await db.visitorIdentity.deleteMany({ where: { id: { in: [0, 1, 2].map(identity) } } }); }
  finally { await db.$disconnect(); }
}
