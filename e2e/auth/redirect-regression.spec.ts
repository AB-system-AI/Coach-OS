import { test, expect } from "@playwright/test";
import {
  DEMO_USERS,
  GUEST_AUTH_ROUTES,
  PROTECTED_ROUTES,
} from "../helpers/constants";
import { loginViaForm } from "../helpers/auth";
import {
  assertGuestRouteDoesNotLoop,
  assertNoRedirectLoop,
  assertOnboardingRedirectsToRegister,
  assertProtectedRouteRedirectsToLogin,
  traceRedirects,
} from "../helpers/redirect-guard";
import { cookiesToHeader } from "../helpers/session";

test.describe("Redirect regression (unauthenticated)", () => {
  for (const route of PROTECTED_ROUTES.dashboard) {
    test(`dashboard route ${route} redirects once to login`, async ({
      request,
    }) => {
      const trace = await traceRedirects(request, route);
      assertProtectedRouteRedirectsToLogin(trace, route);
    });
  }

  for (const route of PROTECTED_ROUTES.portal) {
    test(`portal route ${route} redirects once to login`, async ({ request }) => {
      const trace = await traceRedirects(request, route);
      assertProtectedRouteRedirectsToLogin(trace, route);
    });
  }

  for (const route of PROTECTED_ROUTES.admin) {
    test(`admin route ${route} redirects once to login`, async ({ request }) => {
      const trace = await traceRedirects(request, route);
      assertProtectedRouteRedirectsToLogin(trace, route);
    });
  }

  test("onboarding redirects once to register when unauthenticated", async ({
    request,
  }) => {
    const trace = await traceRedirects(request, "/onboarding");
    assertOnboardingRedirectsToRegister(trace);
  });

  for (const route of GUEST_AUTH_ROUTES.filter((r) => r !== "/onboarding")) {
    test(`guest route ${route} does not loop when unauthenticated`, async ({
      request,
    }) => {
      const trace = await traceRedirects(request, route);
      assertGuestRouteDoesNotLoop(trace);
    });
  }
});

test.describe("Redirect regression (authenticated)", () => {
  test("coach login page redirects once away from login", async ({ page }) => {
    await loginViaForm(page, { email: DEMO_USERS.coach.email });
    const cookies = await page.context().cookies();
    const trace = await traceRedirects(page.request, "/login", {
      cookies: cookiesToHeader(cookies),
    });
    assertNoRedirectLoop(trace);
    expect(trace.redirectCount).toBeLessThanOrEqual(1);
    expect(trace.finalUrl).toMatch(/\/dashboard/);
  });

  test("client hitting dashboard is redirected without loop", async ({
    page,
  }) => {
    await loginViaForm(page, { email: DEMO_USERS.client.email });
    const cookies = await page.context().cookies();

    const trace = await traceRedirects(page.request, "/dashboard", {
      cookies: cookiesToHeader(cookies),
    });
    assertNoRedirectLoop(trace);
    expect(trace.redirectCount).toBeLessThanOrEqual(2);
    expect(trace.finalUrl).toMatch(/\/(portal|onboarding|login)/);
  });

  test("completed coach never bounces between onboarding and dashboard", async ({
    page,
  }) => {
    await loginViaForm(page, { email: DEMO_USERS.coach.email });
    const cookies = await page.context().cookies();

    for (const path of ["/dashboard", "/onboarding", "/login"]) {
      const trace = await traceRedirects(page.request, path, {
        cookies: cookiesToHeader(cookies),
      });
      assertNoRedirectLoop(trace);
      expect(trace.redirectCount).toBeLessThanOrEqual(1);
    }
  });
});
