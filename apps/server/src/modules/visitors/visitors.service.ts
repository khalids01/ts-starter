import prisma from "@db";
import { connectRedis } from "@redis";
import { auth } from "@/modules/auth/auth.service";
import { createHash } from "node:crypto";
import type { VisitorTrackBody } from "./visitors.dto";

const VISITOR_COOKIE_KEY = "visitor_id";
const VISITOR_COOKIE_TTL_SECONDS = 90 * 24 * 60 * 60;
const SESSION_IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
const RETENTION_DAYS = 90;

let lastCleanupAt = 0;

const botUserAgentRegex =
  /(bot|crawler|spider|slurp|bingpreview|headless|phantom|curl|wget|python-requests|go-http-client|httpclient|uptime|monitor|facebookexternalhit)/i;

function parseCookies(cookieHeader: string | null) {
  const values = new Map<string, string>();
  if (!cookieHeader) {
    return values;
  }

  for (const chunk of cookieHeader.split(";")) {
    const [rawKey, ...rest] = chunk.split("=");
    const key = rawKey?.trim();
    if (!key || rest.length === 0) {
      continue;
    }

    const value = rest.join("=").trim();
    if (!value) {
      continue;
    }

    values.set(key, decodeURIComponent(value));
  }

  return values;
}

function isValidVisitorId(visitorId: string | undefined): visitorId is string {
  if (!visitorId) {
    return false;
  }

  return /^[a-zA-Z0-9-]{20,100}$/.test(visitorId);
}

function buildSetCookieHeader(visitorId: string, requestUrl: string) {
  const parts = [
    `${VISITOR_COOKIE_KEY}=${encodeURIComponent(visitorId)}`,
    `Max-Age=${VISITOR_COOKIE_TTL_SECONDS}`,
    "Path=/",
    "SameSite=Lax",
  ];

  if (requestUrl.startsWith("https://")) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function getForwardedIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp;
  }

  return null;
}

function hashIp(ip: string | null) {
  if (!ip) {
    return null;
  }

  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}

function detectBot(userAgent: string | null) {
  if (!userAgent) {
    return false;
  }

  return botUserAgentRegex.test(userAgent);
}

function detectDeviceType(userAgent: string | null) {
  if (!userAgent) {
    return null;
  }

  const ua = userAgent.toLowerCase();
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "tablet";
  }

  if (
    ua.includes("mobile") ||
    ua.includes("iphone") ||
    ua.includes("android")
  ) {
    return "mobile";
  }

  return "desktop";
}

function detectCountry(headers: Headers) {
  return (
    headers.get("cf-ipcountry") ??
    headers.get("x-vercel-ip-country") ??
    headers.get("x-country-code") ??
    null
  );
}

function normalizePath(inputPath: string) {
  let path = inputPath.trim();

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  if (path.length > 500) {
    path = path.slice(0, 500);
  }

  return path;
}

function normalizeReferrer(inputReferrer: string | undefined) {
  if (!inputReferrer) {
    return null;
  }

  const trimmed = inputReferrer.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, 500);
}

async function enforceTrackRateLimit(ip: string | null, visitorId: string) {
  const redis = await connectRedis();
  if (!redis) {
    return true;
  }

  const now = Date.now();
  const windowId = Math.floor(now / 60_000);

  const ipKey = `visitors:track:ip:${ip ?? "unknown"}:${windowId}`;
  const visitorKey = `visitors:track:visitor:${visitorId}:${windowId}`;

  const [ipCount, visitorCount] = await Promise.all([
    redis.incr(ipKey),
    redis.incr(visitorKey),
  ]);

  if (ipCount === 1) {
    await redis.expire(ipKey, 90);
  }

  if (visitorCount === 1) {
    await redis.expire(visitorKey, 90);
  }

  return ipCount <= 240 && visitorCount <= 120;
}

async function maybeRunRetentionCleanup() {
  const now = Date.now();

  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) {
    return;
  }

  lastCleanupAt = now;

  const cutoff = new Date(now - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.visitorIdentity.deleteMany({
    where: {
      lastSeenAt: {
        lt: cutoff,
      },
    },
  });
}

async function resolveVisitorIdentity(args: {
  visitorId: string;
  userId: string | null;
  now: Date;
}) {
  const existing = await prisma.visitorIdentity.findUnique({
    where: {
      visitorId: args.visitorId,
    },
  });

  if (!existing) {
    return prisma.visitorIdentity.create({
      data: {
        visitorId: args.visitorId,
        firstSeenAt: args.now,
        lastSeenAt: args.now,
        firstUserId: args.userId,
        lastUserId: args.userId,
      },
    });
  }

  return prisma.visitorIdentity.update({
    where: {
      id: existing.id,
    },
    data: {
      lastSeenAt: args.now,
      ...(args.userId
        ? {
            lastUserId: args.userId,
            firstUserId: existing.firstUserId ?? args.userId,
          }
        : {}),
    },
  });
}

async function resolveSession(args: {
  visitorIdentityId: string;
  userId: string | null;
  isBot: boolean;
  now: Date;
  path: string;
  referrer: string | null;
  deviceType: string | null;
  country: string | null;
  ipHash: string | null;
}) {
  const activeSince = new Date(args.now.getTime() - SESSION_IDLE_TIMEOUT_MS);

  const activeSession = await prisma.visitorSession.findFirst({
    where: {
      visitorIdentityId: args.visitorIdentityId,
      isBot: args.isBot,
      lastSeenAt: {
        gte: activeSince,
      },
    },
    orderBy: {
      lastSeenAt: "desc",
    },
  });

  if (activeSession) {
    return prisma.visitorSession.update({
      where: {
        id: activeSession.id,
      },
      data: {
        lastSeenAt: args.now,
        endedAt: args.now,
        lastPath: args.path,
        referrer: args.referrer,
        deviceType: args.deviceType,
        country: args.country,
        ipHash: args.ipHash,
        ...(args.userId ? { userId: args.userId } : {}),
        eventCount: {
          increment: 1,
        },
      },
    });
  }

  return prisma.visitorSession.create({
    data: {
      visitorIdentityId: args.visitorIdentityId,
      userId: args.userId,
      isBot: args.isBot,
      startedAt: args.now,
      lastSeenAt: args.now,
      endedAt: args.now,
      entryPath: args.path,
      lastPath: args.path,
      referrer: args.referrer,
      deviceType: args.deviceType,
      country: args.country,
      ipHash: args.ipHash,
      eventCount: 1,
    },
  });
}

export class VisitorsService {
  async trackVisit(input: {
    request: Request;
    body: VisitorTrackBody;
    setCookie: (value: string) => void;
  }) {
    const cookies = parseCookies(input.request.headers.get("cookie"));
    const existingVisitorId = cookies.get(VISITOR_COOKIE_KEY);
    const visitorId = isValidVisitorId(existingVisitorId)
      ? existingVisitorId
      : crypto.randomUUID();

    if (!existingVisitorId || existingVisitorId !== visitorId) {
      input.setCookie(buildSetCookieHeader(visitorId, input.request.url));
    }

    const ip = getForwardedIp(input.request.headers);
    const allowed = await enforceTrackRateLimit(ip, visitorId);
    if (!allowed) {
      return {
        ok: false,
        rateLimited: true,
      };
    }

    const now = new Date();
    const path = normalizePath(input.body.path);
    const referrer = normalizeReferrer(input.body.referrer);
    const userAgent = input.request.headers.get("user-agent");

    const [session] = await Promise.all([
      auth.api.getSession({ headers: input.request.headers }),
      maybeRunRetentionCleanup(),
    ]);

    const userId = session?.user?.id ?? null;
    const identity = await resolveVisitorIdentity({
      visitorId,
      userId,
      now,
    });

    await resolveSession({
      visitorIdentityId: identity.id,
      userId,
      isBot: detectBot(userAgent),
      now,
      path,
      referrer,
      deviceType: detectDeviceType(userAgent),
      country: detectCountry(input.request.headers),
      ipHash: hashIp(ip),
    });

    return {
      ok: true,
      visitorId,
    };
  }
}

export const visitorsService = new VisitorsService();
