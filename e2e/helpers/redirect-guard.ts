import type { APIRequestContext } from "@playwright/test";
import { expect } from "@playwright/test";

export type RedirectHop = {
  url: string;
  status: number;
  location?: string;
};

export type RedirectTraceResult = {
  hops: RedirectHop[];
  finalUrl: string;
  finalStatus: number;
  redirectCount: number;
};

export class RedirectLoopError extends Error {
  constructor(
    message: string,
    public readonly hops: RedirectHop[]
  ) {
    super(message);
    this.name = "RedirectLoopError";
  }
}

function toPath(urlOrPath: string): string {
  if (urlOrPath.startsWith("http")) {
    const url = new URL(urlOrPath);
    return `${url.pathname}${url.search}`;
  }
  return urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`;
}

/**
 * Follow redirects manually and fail if a loop is detected or max hops exceeded.
 * Uses Playwright's request context baseURL for relative paths.
 */
export async function traceRedirects(
  request: APIRequestContext,
  startPath: string,
  options?: { maxHops?: number; cookies?: string }
): Promise<RedirectTraceResult> {
  const maxHops = options?.maxHops ?? 10;
  const hops: RedirectHop[] = [];
  const seen = new Set<string>();

  let currentPath = toPath(startPath);

  for (let i = 0; i < maxHops; i++) {
    if (seen.has(currentPath)) {
      throw new RedirectLoopError(
        `Redirect loop detected at ${currentPath}`,
        hops
      );
    }
    seen.add(currentPath);

    const response = await request.get(currentPath, {
      maxRedirects: 0,
      headers: options?.cookies ? { cookie: options.cookies } : undefined,
    });

    const hop: RedirectHop = {
      url: currentPath,
      status: response.status(),
    };

    if (response.status() >= 300 && response.status() < 400) {
      const location = response.headers()["location"];
      hop.location = location;
      hops.push(hop);

      if (!location) {
        return {
          hops,
          finalUrl: currentPath,
          finalStatus: response.status(),
          redirectCount: hops.length,
        };
      }

      currentPath = toPath(location);
      continue;
    }

    hops.push(hop);
    return {
      hops,
      finalUrl: currentPath,
      finalStatus: response.status(),
      redirectCount: hops.filter((h) => h.status >= 300 && h.status < 400).length,
    };
  }

  throw new RedirectLoopError(
    `Exceeded maximum redirect hops (${maxHops})`,
    hops
  );
}

export function assertProtectedRouteRedirectsToLogin(
  trace: RedirectTraceResult,
  route: string
) {
  assertNoRedirectLoop(trace);
  expect(trace.redirectCount).toBeLessThanOrEqual(1);
  expect(trace.finalStatus).toBeLessThan(500);

  const redirectHop = trace.hops.find((h) => h.status >= 300 && h.status < 400);
  if (redirectHop?.location) {
    expect(redirectHop.location).toMatch(/\/login/);
    expect(redirectHop.location).toContain(
      `callbackUrl=${encodeURIComponent(route)}`
    );
    return;
  }

  expect(trace.finalUrl).toMatch(/\/login/);
}

export function assertNoRedirectLoop(trace: RedirectTraceResult) {
  const paths = trace.hops.map((h) => toPath(h.url));
  const unique = new Set(paths);
  if (unique.size !== paths.length) {
    throw new RedirectLoopError("Redirect loop in trace", trace.hops);
  }
}

export function assertGuestRouteDoesNotLoop(trace: RedirectTraceResult) {
  assertNoRedirectLoop(trace);
  expect(trace.redirectCount).toBeLessThanOrEqual(1);
  expect(trace.finalStatus).toBeLessThan(500);
}

export function assertOnboardingRedirectsToRegister(trace: RedirectTraceResult) {
  assertNoRedirectLoop(trace);
  expect(trace.redirectCount).toBe(1);
  expect(trace.hops[0].location).toMatch(/\/register$/);
}
