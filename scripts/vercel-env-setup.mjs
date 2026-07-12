#!/usr/bin/env node
/**
 * Prints required Vercel environment variables for CoachOS production deploys.
 * Run: npm run vercel:env-setup
 */
import { randomBytes } from "node:crypto";

const appUrl =
  process.argv[2]?.trim() || "https://coach-osaa-weld.vercel.app";
const secret = randomBytes(32).toString("base64");

console.log(`
CoachOS — Vercel environment setup
====================================

Add these in Vercel → your project → Settings → Environment Variables
(apply to Production, Preview, and Development):

  DATABASE_URL
    Your PostgreSQL connection string (Neon, Supabase, Railway, etc.)

  BETTER_AUTH_SECRET
    ${secret}

  BETTER_AUTH_URL
    ${appUrl}

  NEXT_PUBLIC_APP_URL
    ${appUrl}

  RESEND_API_KEY
    Your Resend API key (https://resend.com/api-keys)

  RESEND_FROM_EMAIL
    Verified sender address, e.g. noreply@yourdomain.com

  RESEND_FROM_NAME
    CoachOS

After saving, redeploy the project (Deployments → ... → Redeploy).

Then apply the database schema once:

  DATABASE_URL="your-production-url" npm run db:migrate:deploy

Verify:

  ${appUrl}/api/health
  ${appUrl}/register
`);
