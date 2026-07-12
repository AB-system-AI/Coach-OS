import { Resend } from "resend";
import { isProduction, resolvePublicAppUrl } from "@/lib/env";
import { readRuntimeEnv } from "@/lib/env/runtime";
import {
  invoiceEmail,
  paymentReceiptEmail,
  welcomeEmail,
  type TenantBranding,
} from "./templates";

export type { TenantBranding, EmailTemplate } from "./templates";
export {
  welcomeEmail,
  verificationEmail,
  resetPasswordEmail,
  invitationEmail,
  magicLinkEmail,
  paymentReceiptEmail,
  invoiceEmail,
  bookingConfirmationEmail,
  bookingReminderEmail,
} from "./templates";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface SendEmailResult {
  id: string;
}

let resendClient: Resend | null = null;

export function isEmailDeliveryConfigured(): boolean {
  return readRuntimeEnv("RESEND_API_KEY") !== undefined;
}

export function resolveFromEmailAddress(override?: string): string {
  if (override) return override;

  const email = readRuntimeEnv("RESEND_FROM_EMAIL") ?? "noreply@coachos.app";
  const name =
    readRuntimeEnv("RESEND_FROM_NAME") ??
    readRuntimeEnv("NEXT_PUBLIC_APP_NAME") ??
    "CoachOS";

  return `${name} <${email}>`;
}

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = readRuntimeEnv("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("[CoachOS] RESEND_API_KEY is required to send emails.");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendEmail({
  to,
  subject,
  html,
  from,
  replyTo,
}: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = readRuntimeEnv("RESEND_API_KEY");

  if (!apiKey) {
    if (readRuntimeEnv("E2E_TEST") === "true" || !isProduction()) {
      console.log("[email:e2e-skipped]", { to, subject, from, replyTo });
      return { id: "e2e-skipped" };
    }
    if (isProduction()) {
      throw new Error(
        "[CoachOS] RESEND_API_KEY is required in production to send emails."
      );
    }
    console.log("[email:dev-skipped]", { to, subject, from, replyTo });
    return { id: "dev-skipped" };
  }

  const fromAddress = resolveFromEmailAddress(from);
  const recipients = Array.isArray(to) ? to : [to];

  const client = getResendClient();
  const { data, error } = await client.emails.send({
    from: fromAddress,
    to: recipients,
    subject,
    html,
    replyTo: replyTo ?? undefined,
  });

  if (error) {
    throw new Error(`[CoachOS] Email send failed: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error("[CoachOS] Email send returned no ID.");
  }

  return { id: data.id };
}

/** Sends the post-registration welcome email (non-blocking for auth flows). */
export async function sendWelcomeEmail(input: {
  to: string;
  name: string;
  loginUrl?: string;
  branding?: TenantBranding;
}): Promise<SendEmailResult> {
  const loginUrl = input.loginUrl ?? `${resolvePublicAppUrl()}/login`;
  const template = welcomeEmail(input.name, loginUrl, input.branding);

  return sendEmail({
    to: input.to,
    subject: template.subject,
    html: template.html,
    from: input.branding?.fromEmail
      ? resolveFromEmailAddress(input.branding.fromEmail)
      : undefined,
  });
}

/** Convenience wrapper used by payment-service */
export async function sendInvoiceEmail(input: {
  to: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate?: Date | null;
  recipientName?: string;
  branding?: TenantBranding;
}): Promise<SendEmailResult> {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: input.currency,
  }).format(input.amount);

  const dueDate = input.dueDate
    ? input.dueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Upon receipt";

  const template = invoiceEmail(
    input.recipientName ?? "Customer",
    {
      invoiceNumber: input.invoiceNumber,
      dueDate,
      items: [{ description: `Invoice ${input.invoiceNumber}`, amount: formattedAmount }],
      total: formattedAmount,
      currency: input.currency,
    },
    input.branding
  );

  return sendEmail({
    to: input.to,
    subject: template.subject,
    html: template.html,
    from: input.branding?.fromEmail,
  });
}

export async function sendPaymentReceiptEmail(input: {
  to: string;
  amount: number;
  currency: string;
  paymentId: string;
  description?: string;
  recipientName?: string;
  branding?: TenantBranding;
}): Promise<SendEmailResult> {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: input.currency,
  }).format(input.amount);

  const template = paymentReceiptEmail(
    input.recipientName ?? "Customer",
    {
      receiptNumber: input.paymentId,
      amount: formattedAmount,
      currency: input.currency,
      date: new Date().toLocaleDateString("en-US"),
      description: input.description ?? "Payment",
    },
    input.branding
  );

  return sendEmail({
    to: input.to,
    subject: template.subject,
    html: template.html,
    from: input.branding?.fromEmail,
  });
}
