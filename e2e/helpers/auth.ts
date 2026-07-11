import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { DEMO_PASSWORD } from "./constants";

export type LoginOptions = {
  email: string;
  password?: string;
  callbackUrl?: string;
};

export async function loginViaForm(page: Page, options: LoginOptions) {
  const password = options.password ?? DEMO_PASSWORD;

  const signInResponse = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email: options.email,
      password,
    },
  });

  expect(
    signInResponse.ok(),
    `Sign-in failed for ${options.email}: ${await signInResponse.text()}`
  ).toBeTruthy();

  const loginUrl = options.callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(options.callbackUrl)}`
    : "/login";

  await page.goto(loginUrl, { waitUntil: "domcontentloaded" });
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 45_000,
  });
}

export async function logoutViaApi(page: Page) {
  await page.request.post("/api/auth/sign-out");
  await page.context().clearCookies();
}

export async function registerCoachViaForm(
  page: Page,
  data: {
    name: string;
    businessName: string;
    email: string;
    password: string;
  }
) {
  await page.goto("/register");
  await page.getByRole("heading", { name: /create your account/i }).waitFor();
  await page.locator('input[name="name"]').fill(data.name);
  await page.locator('input[name="businessName"]').fill(data.businessName);
  await page.locator('input[name="email"]').fill(data.email);
  await page.locator('input[name="password"]').fill(data.password);
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForLoadState("networkidle");

  const cookies = await page.context().cookies();
  const hasSession = cookies.some((cookie) =>
    cookie.name.includes("session_token")
  );
  expect(hasSession).toBeTruthy();

  if (!page.url().includes("/onboarding")) {
    await page.goto("/onboarding");
  }

  await expect(page).toHaveURL(/\/onboarding/, { timeout: 30_000 });
}

export async function completeOnboardingWizard(page: Page) {
  if (!page.url().includes("/onboarding")) {
    await page.goto("/onboarding", { waitUntil: "networkidle" });
  }

  await expect(page.getByText(/DATABASE_URL is not configured/i)).not.toBeVisible({
    timeout: 5_000,
  });

  await expect(
    page.getByText(/what type of business are you/i)
  ).toBeVisible({ timeout: 30_000 });

  await page.locator("button", { hasText: "Fitness Coach" }).first().click();
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await expect(page.getByText(/brand your business/i)).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await expect(page.getByText(/contact & social/i)).toBeVisible();
  await fillOnboardingField(page, "Business Email", "coach@e2e.coachos.app");
  await fillOnboardingField(page, "Phone", "+1-555-0199");
  await fillOnboardingField(page, "WhatsApp", "+1-555-0199");
  await fillOnboardingField(page, "City", "Test City");
  await fillOnboardingField(page, "Country", "United States");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await expect(page.getByText(/choose your plan/i)).toBeVisible();
  await page
    .locator("button")
    .filter({ has: page.getByText("Starter", { exact: true }) })
    .first()
    .click();
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await expect(page.getByText(/choose your modules/i)).toBeVisible();
  await page.getByRole("button", { name: /launch dashboard/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 90_000 });
}

async function fillOnboardingField(page: Page, label: string, value: string) {
  const field = page.locator("div.space-y-2").filter({ hasText: label });
  await field.locator("input").fill(value);
}

export async function openAuthDialog(page: Page, mode: "login" | "register") {
  await page.goto("/", { waitUntil: "networkidle" });
  const buttonName =
    mode === "login" ? /^log in$/i : /^get started$/i;
  await page.getByRole("button", { name: buttonName }).click();
  await page.getByRole("dialog").waitFor({ state: "visible", timeout: 30_000 });
}

export async function submitForgotPassword(page: Page, email: string) {
  await page.goto("/forgot-password");
  await page.locator('input[name="email"]').fill(email);
  await page.getByRole("button", { name: /send reset link/i }).click();
  await expect(page.getByText(/check your inbox/i)).toBeVisible({ timeout: 30_000 });
}
