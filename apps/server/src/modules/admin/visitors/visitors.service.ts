import prisma, { Prisma } from "@db";
import type {
  VisitorsListQuery,
  VisitorsOverviewQuery,
} from "./visitors.dto";

type Segment = "humans" | "bots" | "all";
type VisitorType = "all" | "new" | "returning";

type NormalizedQuery = {
  from: Date;
  to: Date;
  segment: Segment;
  type: VisitorType;
};

type OverviewPoint = {
  date: string;
  visits: number;
  uniqueVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  botVisits: number;
};

type VisitorListItem = {
  visitorId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastSeenInRange: string;
  visitsCount: number;
  lastPath: string;
  isLoggedIn: boolean;
  deviceType: string | null;
  country: string | null;
  isBot: boolean;
};

function normalizeDateRange(dateFrom?: string, dateTo?: string) {
  const now = new Date();
  const to = dateTo
    ? new Date(`${dateTo}T23:59:59.999Z`)
    : new Date(now.toISOString().slice(0, 10) + "T23:59:59.999Z");

  const defaultFrom = new Date(to);
  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 29);
  defaultFrom.setUTCHours(0, 0, 0, 0);

  const from = dateFrom ? new Date(`${dateFrom}T00:00:00.000Z`) : defaultFrom;

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    const fallbackTo = new Date(
      now.toISOString().slice(0, 10) + "T23:59:59.999Z",
    );
    const fallbackFrom = new Date(fallbackTo);
    fallbackFrom.setUTCDate(fallbackFrom.getUTCDate() - 29);
    fallbackFrom.setUTCHours(0, 0, 0, 0);

    return {
      from: fallbackFrom,
      to: fallbackTo,
    };
  }

  return { from, to };
}

function normalizeOverviewQuery(query: VisitorsOverviewQuery): NormalizedQuery {
  const { from, to } = normalizeDateRange(query.dateFrom, query.dateTo);

  return {
    from,
    to,
    segment: query.segment ?? "humans",
    type: query.type ?? "all",
  };
}

function normalizePagination(page?: number, limit?: number) {
  const normalizedLimit = Math.min(Math.max(limit ?? 20, 1), 100);
  const normalizedPage = Math.max(page ?? 1, 1);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
}

function whereConditions(
  query: NormalizedQuery,
  options?: {
    sessionAlias?: string;
    identityAlias?: string;
    applyRange?: boolean;
    applyVisitType?: boolean;
  },
) {
  const sessionAlias = options?.sessionAlias ?? "s";
  const identityAlias = options?.identityAlias ?? "i";
  const applyRange = options?.applyRange ?? true;
  const applyVisitType = options?.applyVisitType ?? true;
  const conditions: Prisma.Sql[] = [];

  if (applyRange) {
    conditions.push(
      Prisma.sql`${Prisma.raw(sessionAlias)}."startedAt" >= ${query.from}`,
      Prisma.sql`${Prisma.raw(sessionAlias)}."startedAt" <= ${query.to}`,
    );
  }

  if (query.segment === "humans") {
    conditions.push(Prisma.sql`${Prisma.raw(sessionAlias)}."isBot" = false`);
  }

  if (query.segment === "bots") {
    conditions.push(Prisma.sql`${Prisma.raw(sessionAlias)}."isBot" = true`);
  }

  if (applyVisitType && query.type === "new") {
    conditions.push(
      Prisma.sql`${Prisma.raw(identityAlias)}."firstSeenAt" >= ${query.from}`,
      Prisma.sql`${Prisma.raw(identityAlias)}."firstSeenAt" <= ${query.to}`,
    );
  }

  if (applyVisitType && query.type === "returning") {
    conditions.push(
      Prisma.sql`${Prisma.raw(identityAlias)}."firstSeenAt" < ${query.from}`,
    );
  }

  return {
    hasConditions: conditions.length > 0,
    sql:
      conditions.length === 0
        ? Prisma.empty
        : Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`,
  };
}

function listDateRangeDays(from: Date, to: Date) {
  const items: string[] = [];
  const cursor = new Date(from);
  cursor.setUTCHours(0, 0, 0, 0);

  while (cursor <= to) {
    items.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return items;
}

export class AdminVisitorsService {
  async getOverview(query: VisitorsOverviewQuery) {
    const normalized = normalizeOverviewQuery(query);
    const where = whereConditions(normalized);

    type OverviewRow = {
      totalVisits: number;
      uniqueVisitors: number;
      newVisitors: number;
      returningVisitors: number;
      botVisits: number;
    };

    const [totalsRow] = await prisma.$queryRaw<OverviewRow[]>(Prisma.sql`
      SELECT
        COUNT(*)::int AS "totalVisits",
        COUNT(DISTINCT s."visitorIdentityId")::int AS "uniqueVisitors",
        COUNT(DISTINCT CASE
          WHEN i."firstSeenAt" >= ${normalized.from}
            AND i."firstSeenAt" <= ${normalized.to}
          THEN s."visitorIdentityId"
        END)::int AS "newVisitors",
        COUNT(DISTINCT CASE
          WHEN i."firstSeenAt" < ${normalized.from}
          THEN s."visitorIdentityId"
        END)::int AS "returningVisitors",
        COUNT(*) FILTER (WHERE s."isBot" = true)::int AS "botVisits"
      FROM "visitor_session" s
      JOIN "visitor_identity" i ON i.id = s."visitorIdentityId"
      ${where.sql}
    `);

    const activeWhere = whereConditions(normalized, {
      applyRange: false,
      applyVisitType: true,
    });

    type ActiveRow = {
      activeNow: number;
    };

    const [activeRow] = await prisma.$queryRaw<ActiveRow[]>(Prisma.sql`
      SELECT COUNT(DISTINCT s."visitorIdentityId")::int AS "activeNow"
      FROM "visitor_session" s
      JOIN "visitor_identity" i ON i.id = s."visitorIdentityId"
      ${activeWhere.sql}
      ${activeWhere.hasConditions ? Prisma.sql`AND` : Prisma.sql`WHERE`}
      s."lastSeenAt" >= ${new Date(Date.now() - 5 * 60 * 1000)}
    `);

    type SeriesRow = {
      day: Date;
      visits: number;
      uniqueVisitors: number;
      newVisitors: number;
      returningVisitors: number;
      botVisits: number;
    };

    const seriesRows = await prisma.$queryRaw<SeriesRow[]>(Prisma.sql`
      SELECT
        date_trunc('day', s."startedAt") AS day,
        COUNT(*)::int AS visits,
        COUNT(DISTINCT s."visitorIdentityId")::int AS "uniqueVisitors",
        COUNT(DISTINCT CASE
          WHEN i."firstSeenAt" >= date_trunc('day', s."startedAt")
            AND i."firstSeenAt" < date_trunc('day', s."startedAt") + interval '1 day'
          THEN s."visitorIdentityId"
        END)::int AS "newVisitors",
        COUNT(DISTINCT CASE
          WHEN i."firstSeenAt" < date_trunc('day', s."startedAt")
          THEN s."visitorIdentityId"
        END)::int AS "returningVisitors",
        COUNT(*) FILTER (WHERE s."isBot" = true)::int AS "botVisits"
      FROM "visitor_session" s
      JOIN "visitor_identity" i ON i.id = s."visitorIdentityId"
      ${where.sql}
      GROUP BY day
      ORDER BY day ASC
    `);

    const byDate = new Map<string, OverviewPoint>();
    for (const row of seriesRows) {
      const date = row.day.toISOString().slice(0, 10);
      byDate.set(date, {
        date,
        visits: row.visits,
        uniqueVisitors: row.uniqueVisitors,
        newVisitors: row.newVisitors,
        returningVisitors: row.returningVisitors,
        botVisits: row.botVisits,
      });
    }

    const series = listDateRangeDays(normalized.from, normalized.to).map(
      (date) =>
        byDate.get(date) ?? {
          date,
          visits: 0,
          uniqueVisitors: 0,
          newVisitors: 0,
          returningVisitors: 0,
          botVisits: 0,
        },
    );

    return {
      filters: {
        dateFrom: normalized.from.toISOString().slice(0, 10),
        dateTo: normalized.to.toISOString().slice(0, 10),
        segment: normalized.segment,
        type: normalized.type,
      },
      cards: {
        activeNow: activeRow?.activeNow ?? 0,
        totalVisits: totalsRow?.totalVisits ?? 0,
        uniqueVisitors: totalsRow?.uniqueVisitors ?? 0,
        newVisitors: totalsRow?.newVisitors ?? 0,
        returningVisitors: totalsRow?.returningVisitors ?? 0,
        botVisits: totalsRow?.botVisits ?? 0,
      },
      series,
    };
  }

  async listVisitors(query: VisitorsListQuery) {
    const normalized = normalizeOverviewQuery(query);
    const { page, limit } = normalizePagination(query.page, query.limit);
    const where = whereConditions(normalized);

    type TotalRow = {
      total: number;
    };

    const [totalRow] = await prisma.$queryRaw<TotalRow[]>(Prisma.sql`
      WITH filtered AS (
        SELECT
          s."visitorIdentityId"
        FROM "visitor_session" s
        JOIN "visitor_identity" i ON i.id = s."visitorIdentityId"
        ${where.sql}
      )
      SELECT COUNT(DISTINCT "visitorIdentityId")::int AS total
      FROM filtered
    `);

    const total = totalRow?.total ?? 0;
    const pages = Math.max(1, Math.ceil(total / limit));
    const boundedPage = Math.min(page, pages);
    const boundedSkip = (boundedPage - 1) * limit;

    type ListRow = {
      visitorId: string;
      firstSeenAt: Date;
      lastSeenAt: Date;
      lastSeenInRange: Date;
      visitsCount: number;
      lastPath: string;
      isLoggedIn: boolean;
      deviceType: string | null;
      country: string | null;
      isBot: boolean;
    };

    const rows = await prisma.$queryRaw<ListRow[]>(Prisma.sql`
      WITH filtered AS (
        SELECT
          s."visitorIdentityId",
          s."lastSeenAt",
          s."lastPath",
          s."deviceType",
          s."country",
          s."isBot",
          s."userId",
          i."visitorId",
          i."firstSeenAt",
          i."lastSeenAt" AS "identityLastSeenAt"
        FROM "visitor_session" s
        JOIN "visitor_identity" i ON i.id = s."visitorIdentityId"
        ${where.sql}
      ),
      rollup AS (
        SELECT
          f."visitorIdentityId",
          MIN(f."visitorId") AS "visitorId",
          MIN(f."firstSeenAt") AS "firstSeenAt",
          MAX(f."identityLastSeenAt") AS "lastSeenAt",
          MAX(f."lastSeenAt") AS "lastSeenInRange",
          COUNT(*)::int AS "visitsCount",
          BOOL_OR(f."userId" IS NOT NULL) AS "isLoggedIn"
        FROM filtered f
        GROUP BY f."visitorIdentityId"
      )
      SELECT
        r."visitorId",
        r."firstSeenAt",
        r."lastSeenAt",
        r."lastSeenInRange",
        r."visitsCount",
        latest."lastPath",
        r."isLoggedIn",
        latest."deviceType",
        latest."country",
        latest."isBot"
      FROM rollup r
      LEFT JOIN LATERAL (
        SELECT
          f."lastPath",
          f."deviceType",
          f."country",
          f."isBot"
        FROM filtered f
        WHERE f."visitorIdentityId" = r."visitorIdentityId"
        ORDER BY f."lastSeenAt" DESC
        LIMIT 1
      ) latest ON true
      ORDER BY r."lastSeenInRange" DESC
      LIMIT ${limit}
      OFFSET ${boundedSkip}
    `);

    return {
      filters: {
        dateFrom: normalized.from.toISOString().slice(0, 10),
        dateTo: normalized.to.toISOString().slice(0, 10),
        segment: normalized.segment,
        type: normalized.type,
      },
      items: rows.map((row): VisitorListItem => ({
        visitorId: row.visitorId,
        firstSeenAt: row.firstSeenAt.toISOString(),
        lastSeenAt: row.lastSeenAt.toISOString(),
        lastSeenInRange: row.lastSeenInRange.toISOString(),
        visitsCount: row.visitsCount,
        lastPath: row.lastPath,
        isLoggedIn: row.isLoggedIn,
        deviceType: row.deviceType,
        country: row.country,
        isBot: row.isBot,
      })),
      total,
      pages,
      page: boundedPage,
      limit,
    };
  }
}

export const adminVisitorsService = new AdminVisitorsService();
