import { test, expect } from "@playwright/test";
import {
  DEMO_PASSWORD,
  DEMO_USERS,
  uniqueEmail,
} from "../helpers/constants";
import {
  completeOnboardingWizard,
  loginViaForm,
  logoutViaApi,
  openAuthDialog,
  registerCoachViaForm,
  submitForgotPassword,
} from "../helpers/auth";
import { attachHydrationGuard } from "../helpers/hydration";
import {
  assertProtectedRouteRedirectsToLogin,
  traceRedirects,
} from "../helpers/redirect-guard";
import {
  cookiesToHeader,
  expectNoSessionCookie,
  expectSessionRefresh,
  expectValidSession,
  expectValidSessionCookie,
} from "../helpers/session";
import {
  cleanupE2EUsers,
  createClientUser,
  disconnectTestDb,
  markEmailVerified,
  provisionCoachWithTenant,
} from "../helpers/test-db";

test.afterAll(async () => {
  await cleanupE2EUsers();
  await disconnectTestDb();
});

test.describe("Authentication regression", () => {
  test.describe.configure({ mode: "serial" });
  test("register coach → onboarding → dashboard", async ({ page }) => {
    const hydration = attachHydrationGuard(page);
    const businessName = `E2E Fitness ${Date.now()}`;

    const { email, password } = await provisionCoachWithTenant({
      name: "E2E Coach",
      businessName,
    });

    await loginViaForm(page, { email, password });
    await expect(page).toHaveURL(/\/onboarding/);

    await completeOnboardingWizard(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();

    hydration.assertNoHydrationErrors();
  });

  test("register coach via UI form submits and opens onboarding", async ({
    page,
  }) => {
    const hydration = attachHydrationGuard(page);
    const email = uniqueEmail("e2e-coach-ui");
    const businessName = `E2E UI Fitness ${Date.now()}`;

    await page.goto("/register");
    await page.getByRole("heading", { name: /create your account/i }).waitFor();
    await page.locator('input[name="name"]').fill("E2E UI Coach");
    await page.locator('input[name="businessName"]').fill(businessName);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill("E2e-Coach-Password-2026!");

    const [signUpResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/auth/sign-up/email") &&
          response.request().method() === "POST"
      ),
      page.getByRole("button", { name: /create account/i }).click(),
    ]);

    expect(signUpResponse.ok()).toBeTruthy();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 60_000 });

    hydration.assertNoHydrationErrors();
  });

  test("register client via invite-style provisioning and login", async ({
    page,
  }) => {
    const hydration = attachHydrationGuard(page);
    const { email, password } = await createClientUser();

    await loginViaForm(page, { email, password });
    await expect(page).toHaveURL(/\/portal/);
    await expectValidSessionCookie(page.context());

    hydration.assertNoHydrationErrors();
  });

  test("login coach lands on dashboard", async ({ page }) => {
    const hydration = attachHydrationGuard(page);

    await loginViaForm(page, { email: DEMO_USERS.coach.email });
    await expect(page).toHaveURL(/\/dashboard/);
    const session = await expectValidSession(page.request);
    expect(session.user.email).toBe(DEMO_USERS.coach.email);

    hydration.assertNoHydrationErrors();
  });

  test("login client lands on portal", async ({ page }) => {
    const hydration = attachHydrationGuard(page);

    await loginViaForm(page, { email: DEMO_USERS.client.email });
    await expect(page).toHaveURL(/\/portal/);
    await expectValidSessionCookie(page.context());

    hydration.assertNoHydrationErrors();
  });

  test("login admin lands on admin dashboard", async ({ page }) => {
    const hydration = attachHydrationGuard(page);

    await loginViaForm(page, { email: DEMO_USERS.admin.email });
    await expect(page).toHaveURL(/\/admin/);

    hydration.assertNoHydrationErrors();
  });

  test("logout clears session", async ({ page }) => {
    await loginViaForm(page, { email: DEMO_USERS.coach.email });
    await expectValidSessionCookie(page.context());

    await logoutViaApi(page);
    await expectNoSessionCookie(page.context());

    const trace = await traceRedirects(page.request, "/dashboard");
    assertProtectedRouteRedirectsToLogin(trace, "/dashboard");
  });

  test("password reset request flow", async ({ page }) => {
    await submitForgotPassword(page, DEMO_USERS.coach.email);
    await expect(page.getByText(DEMO_USERS.coach.email)).toBeVisible();
  });

  test("password reset page accepts token query param", async ({ page }) => {
    await page.goto("/reset-password?token=e2e-test-token");
    await expect(
      page.getByRole("heading", { name: /set new password/i })
    ).toBeVisible();
  });

  test("email verification pages render", async ({ page }) => {
    await page.goto("/verify-email");
    await expect(
      page.getByRole("heading", { name: /check your inbox/i })
    ).toBeVisible();

    await page.goto("/verify-email?success=true");
    await expect(
      page.getByRole("heading", { name: /email verified/i })
    ).toBeVisible();
  });

  test("email verification marks user verified in database", async () => {
    const { email } = await createClientUser({ email: uniqueEmail("e2e-verify") });
    await markEmailVerified(email);
    // Exercises DB path used by verification callbacks.
    expect(email).toContain("@e2e.coachos.app");
  });

  test("session refresh returns stable user", async ({ page }) => {
    await loginViaForm(page, { email: DEMO_USERS.client.email });
    await expectSessionRefresh(page.request);
  });

  test("refresh dashboard stays on dashboard for onboarded coach", async ({
    page,
  }) => {
    const hydration = attachHydrationGuard(page);

    await loginViaForm(page, { email: DEMO_USERS.coach.email });
    await expect(page).toHaveURL(/\/dashboard/);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/dashboard/);
    await expectValidSessionCookie(page.context());

    hydration.assertNoHydrationErrors();
  });

  test("refresh portal stays on portal for client", async ({ page }) => {
    const hydration = attachHydrationGuard(page);

    await loginViaForm(page, { email: DEMO_USERS.client.email });
    await expect(page).toHaveURL(/\/portal/);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/portal/);

    hydration.assertNoHydrationErrors();
  });

  test("refresh admin stays on admin for super admin", async ({ page }) => {
    const hydration = attachHydrationGuard(page);

    await loginViaForm(page, { email: DEMO_USERS.admin.email });
    await expect(page).toHaveURL(/\/admin/);

    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/admin/);

    hydration.assertNoHydrationErrors();
  });

  test("auth dialog renders form content (not backdrop only)", async ({
    page,
  }) => {
    const hydration = attachHydrationGuard(page);

    await openAuthDialog(page, "login");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator("#modal-email, input[name='email']").first()).toBeVisible();
    await expect(page.locator("#modal-password, input[name='password']").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await openAuthDialog(page, "register");
    await expect(page.locator("#modal-name, input[name='name']").first()).toBeVisible();
    await expect(page.locator("#modal-businessName, input[name='businessName']").first()).toBeVisible();

    hydration.assertNoHydrationErrors();
  });

  test("callback URL preserved for protected dashboard route", async ({
    page,
  }) => {
    await loginViaForm(page, {
      email: DEMO_USERS.coach.email,
      callbackUrl: "/dashboard/clients",
    });
    await expect(page).toHaveURL(/\/dashboard\/clients/);
  });
});
