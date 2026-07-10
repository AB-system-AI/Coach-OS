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

  await page.goto(loginUrl);
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 45_000,
    waitUntil: "commit",
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
  await expect(
    page.getByRole("heading", { name: /what type of business are you/i })
  ).toBeVisible();

  await page.locator("button", { hasText: "Fitness Coach" }).first().click();
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await page.getByRole("button", { name: "Next", exact: true }).click();

  await page.getByLabel(/business email/i).fill("coach@e2e.coachos.app");
  await page.getByLabel(/^phone$/i).fill("+1-555-0199");
  await page.getByLabel(/whatsapp/i).fill("+1-555-0199");
  await page.getByLabel(/^city$/i).fill("Test City");
  await page.getByLabel(/^country$/i).fill("United States");
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await page.locator("button", { hasText: /^Starter$/ }).first().click();
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await page.getByRole("button", { name: /launch dashboard/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 90_000 });
}

export async function openAuthDialog(page: Page, mode: "login" | "register") {
  await page.goto("/");
  const buttonName = mode === "login" ? /log in/i : /get started/i;
  await page.getByRole("button", { name: buttonName }).first().click();
  await page.getByRole("dialog").waitFor({ state: "visible" });
}

export async function submitForgotPassword(page: Page, email: string) {
  await page.goto("/forgot-password");
  await page.locator('input[name="email"]').fill(email);
  await page.getByRole("button", { name: /send reset link/i }).click();
  await page.getByRole("heading", { name: /check your inbox/i }).waitFor();
}
