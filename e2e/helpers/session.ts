import type { BrowserContext, Page } from "@playwright/test";
import { SESSION_COOKIE_NAMES } from "./constants";

export function getSessionCookie(cookies: Awaited<ReturnType<BrowserContext["cookies"]>>) {
  return cookies.find((cookie) =>
    SESSION_COOKIE_NAMES.some((name) => cookie.name === name)
  );
}

export async function expectValidSessionCookie(context: BrowserContext) {
  const cookies = await context.cookies();
  const session = getSessionCookie(cookies);
  if (!session?.value) {
    throw new Error(
      `Missing session cookie. Expected one of: ${SESSION_COOKIE_NAMES.join(", ")}`
    );
  }
  return session;
}

export async function expectNoSessionCookie(context: BrowserContext) {
  const cookies = await context.cookies();
  const session = getSessionCookie(cookies);
  if (session?.value) {
    throw new Error(`Expected no session cookie but found ${session.name}`);
  }
}

export type SessionPayload = {
  session: { id: string; token: string; expiresAt: string };
  user: { id: string; email: string; role?: string };
};

export async function fetchSession(
  request: Page["request"] | import("@playwright/test").APIRequestContext
): Promise<SessionPayload | null> {
  const response = await request.get("/api/auth/get-session");
  if (!response.ok()) return null;

  const body = (await response.json()) as SessionPayload | null;
  if (!body?.user?.id) return null;
  return body;
}

export async function expectValidSession(
  request: Page["request"] | import("@playwright/test").APIRequestContext
) {
  const session = await fetchSession(request);
  if (!session?.user?.email) {
    throw new Error("Invalid or missing session from /api/auth/get-session");
  }
  return session;
}

export async function expectSessionRefresh(
  request: Page["request"] | import("@playwright/test").APIRequestContext
) {
  const first = await expectValidSession(request);
  const second = await expectValidSession(request);

  if (first.user.id !== second.user.id) {
    throw new Error("Session user changed after refresh");
  }
  if (first.user.email !== second.user.email) {
    throw new Error("Session email changed after refresh");
  }

  return second;
}

export function cookiesToHeader(
  cookies: Awaited<ReturnType<BrowserContext["cookies"]>>
): string {
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
}
