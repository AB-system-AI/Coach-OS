#!/usr/bin/env node
/**
 * Smoke-test Resend email delivery (verification template).
 * Usage:
 *   RESEND_API_KEY=re_xxx npm run test:email
 *   RESEND_API_KEY=re_xxx npm run test:email -- you@example.com
 */
import nextEnv from "@next/env";
import path from "path";
import { fileURLToPath } from "node:url";
import { Resend } from "resend";

const { loadEnvConfig } = nextEnv;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvConfig(root);

const apiKey = process.env.RESEND_API_KEY?.trim();
const to = process.argv[2]?.trim() || process.env.TEST_EMAIL_TO?.trim();
const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || "noreply@coachos.app";
const fromName = process.env.RESEND_FROM_NAME?.trim() || process.env.NEXT_PUBLIC_APP_NAME?.trim() || "CoachOS";
const appUrl =
  process.env.BETTER_AUTH_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "http://localhost:3000";

if (!apiKey) {
  console.error("FAIL — RESEND_API_KEY is not set.");
  console.error("Set it in .env or pass inline: RESEND_API_KEY=re_xxx npm run test:email");
  process.exit(1);
}

if (!to) {
  console.error("FAIL — provide a recipient email:");
  console.error("  npm run test:email -- you@example.com");
  console.error("  or set TEST_EMAIL_TO in .env");
  process.exit(1);
}

const verificationUrl = `${appUrl.replace(/\/$/, "")}/verify-email?success=true`;
const html = `<!DOCTYPE html>
<html><body style="font-family:sans-serif;padding:24px;">
  <h1>CoachOS — Resend verification test</h1>
  <p>This is a smoke test for the email verification flow.</p>
  <p><a href="${verificationUrl}">Verify Email Address</a></p>
  <p style="color:#64748b;font-size:13px;">If the button does not work, open: ${verificationUrl}</p>
</body></html>`;

const resend = new Resend(apiKey);
const { data, error } = await resend.emails.send({
  from: `${fromName} <${fromEmail}>`,
  to: [to],
  subject: `${fromName} — Email verification test`,
  html,
});

if (error) {
  console.error("FAIL — Resend API error:", error.message);
  process.exit(1);
}

console.log("PASS — verification test email sent.");
console.log(`  id: ${data?.id}`);
console.log(`  to: ${to}`);
console.log(`  from: ${fromName} <${fromEmail}>`);
