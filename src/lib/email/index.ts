import { Resend } from "resend";
import { isProduction } from "@/lib/env";
import {
  invoiceEmail,
  paymentReceiptEmail,
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

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
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
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    if (isProduction()) {
      throw new Error(
        "[CoachOS] RESEND_API_KEY is required in production to send emails."
      );
    }
    console.log("[email:dev-skipped]", { to, subject, from, replyTo });
    return { id: "dev-skipped" };
  }

  const defaultFrom =
    process.env.RESEND_FROM_EMAIL?.trim() ?? "noreply@coachos.app";
  const fromAddress = from ?? defaultFrom;
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
