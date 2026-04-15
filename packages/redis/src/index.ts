import Redis from "ioredis";
import { env } from "@env/server";

let redisClient: Redis | null = null;

function getRedisUrl() {
  if (!env.REDIS_ENABLED || !env.REDIS_URL) {
    return null;
  }

  return env.REDIS_URL;
}

export function getRedis() {
  const redisUrl = getRedisUrl();

  if (!redisUrl) {
    throw new Error(
      "Redis is not enabled. Set REDIS_ENABLED=true and provide REDIS_URL.",
    );
  }

  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      keyPrefix: env.REDIS_KEY_PREFIX,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableAutoPipelining: true,
    });
  }

  return redisClient;
}

export async function connectRedis() {
  const redisUrl = getRedisUrl();

  if (!redisUrl) {
    return null;
  }

  const redis = getRedis();

  if (redis.status === "wait") {
    await redis.connect();
  }

  return redis;
}

export async function getCache<T>(key: string) {
  const redis = await connectRedis();

  if (!redis) {
    return null;
  }

  const value = await redis.get(key);
  if (!value) {
    return null;
  }

  return JSON.parse(value) as T;
}

export async function setCache(key: string, value: unknown, ttlInSeconds?: number) {
  const redis = await connectRedis();

  if (!redis) {
    return;
  }

  const payload = JSON.stringify(value);

  if (ttlInSeconds) {
    await redis.set(key, payload, "EX", ttlInSeconds);
    return;
  }

  await redis.set(key, payload);
}

export async function deleteCache(key: string) {
  const redis = await connectRedis();

  if (!redis) {
    return;
  }

  await redis.del(key);
}
