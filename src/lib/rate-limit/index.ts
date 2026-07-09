export type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

export const authLimit: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60_000,
};

export const apiLimit: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60_000,
};

export const webhookLimit: RateLimitConfig = {
  maxRequests: 50,
  windowMs: 60_000,
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

// ─── In-memory fallback ───────────────────────────────────────────────────────

type InMemoryEntry = { count: number; resetAt: number };
const inMemoryStore = new Map<string, InMemoryEntry>();

function inMemoryCheck(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = inMemoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs;
    inMemoryStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// ─── Upstash Redis backend ────────────────────────────────────────────────────

type UpstashClient = {
  pipeline: () => {
    incr: (key: string) => void;
    expire: (key: string, seconds: number) => void;
    exec: () => Promise<[number, number]>;
  };
};

let upstashRedis: UpstashClient | null = null;
let upstashInitialized = false;

async function getUpstashClient(): Promise<UpstashClient | null> {
  if (upstashInitialized) return upstashRedis;
  upstashInitialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) return null;

  try {
    const { Redis } = await import("@upstash/redis");
    upstashRedis = new Redis({ url, token }) as unknown as UpstashClient;
    return upstashRedis;
  } catch {
    return null;
  }
}

async function upstashCheck(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult | null> {
  const client = await getUpstashClient();
  if (!client) return null;

  try {
    const windowSeconds = Math.ceil(config.windowMs / 1000);
    const pipeline = client.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSeconds);
    const [count] = await pipeline.exec();

    const resetAt = Date.now() + config.windowMs;
    const allowed = count <= config.maxRequests;
    return {
      allowed,
      remaining: Math.max(0, config.maxRequests - count),
      resetAt,
    };
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = apiLimit
): Promise<RateLimitResult> {
  const upstashResult = await upstashCheck(key, config);
  if (upstashResult !== null) return upstashResult;
  return inMemoryCheck(key, config);
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.remaining + (result.allowed ? 1 : 0)),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    "Retry-After": result.allowed
      ? "0"
      : String(Math.ceil((result.resetAt - Date.now()) / 1000)),
  };
}
