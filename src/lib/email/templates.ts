export interface TenantBranding {
  fromName?: string;
  fromEmail?: string;
  logoUrl?: string;
  primaryColor?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
}

function baseLayout(
  content: string,
  branding: TenantBranding = {},
  previewText?: string
): string {
  const primaryColor = branding.primaryColor ?? "#0f172a";
  const logoUrl = branding.logoUrl ?? "";
  const appName = branding.fromName ?? "CoachOS";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${appName}</title>
  ${previewText ? `<meta name="description" content="${previewText}" />` : ""}
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .wrapper { width: 100%; padding: 40px 16px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .header { background-color: ${primaryColor}; padding: 32px 40px; text-align: center; }
    .header img { max-height: 40px; }
    .header-text { color: #ffffff; font-size: 20px; font-weight: 600; margin: 0; }
    .body { padding: 40px; }
    .footer { padding: 24px 40px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; }
    h1 { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px; }
    p { font-size: 15px; line-height: 1.7; color: #475569; margin: 0 0 16px; }
    .btn { display: inline-block; padding: 14px 28px; background-color: ${primaryColor}; color: #ffffff !important; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px; margin: 8px 0; }
    .divider { border: none; border-top: 1px solid #f1f5f9; margin: 24px 0; }
    .code-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 24px; font-family: monospace; font-size: 28px; font-weight: 700; letter-spacing: 4px; text-align: center; color: ${primaryColor}; }
    .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
    .meta-label { color: #94a3b8; }
    .meta-value { color: #1e293b; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 10px 0; vertical-align: top; font-size: 14px; }
    .label-cell { color: #94a3b8; width: 40%; }
    .value-cell { color: #1e293b; font-weight: 500; }
    .amount-row td { border-top: 2px solid #f1f5f9; padding-top: 14px; font-size: 16px; font-weight: 700; color: #0f172a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        ${logoUrl ? `<img src="${logoUrl}" alt="${appName}" />` : `<p class="header-text">${appName}</p>`}
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p style="margin:0;">&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        <p style="margin:4px 0 0;">If you did not request this email, you can safely ignore it.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function welcomeEmail(
  name: string,
  loginUrl: string,
  branding: TenantBranding = {}
): EmailTemplate {
  const appName = branding.fromName ?? "CoachOS";
  return {
    subject: `Welcome to ${appName}, ${name}!`,
    html: baseLayout(
      `<h1>Welcome, ${name}! 🎉</h1>
      <p>Your account has been created successfully. You're ready to start your coaching journey on ${appName}.</p>
      <p style="text-align:center; margin:32px 0;">
        <a href="${loginUrl}" class="btn">Get Started</a>
      </p>
      <p>If you have any questions, just reply to this email — we're always happy to help.</p>`,
      branding,
      `Welcome to ${appName}`
    ),
  };
}

export function verificationEmail(
  name: string,
  verificationUrl: string,
  branding: TenantBranding = {}
): EmailTemplate {
  const appName = branding.fromName ?? "CoachOS";
  return {
    subject: `Verify your email address — ${appName}`,
    html: baseLayout(
      `<h1>Confirm your email</h1>
      <p>Hi ${name}, please verify your email address to activate your ${appName} account.</p>
      <p style="text-align:center; margin:32px 0;">
        <a href="${verificationUrl}" class="btn">Verify Email Address</a>
      </p>
      <p>This link expires in <strong>24 hours</strong>. If you did not create an account, no action is required.</p>
      <hr class="divider" />
      <p style="font-size:13px; color:#94a3b8;">If the button above doesn't work, copy and paste this URL into your browser:<br /><a href="${verificationUrl}" style="color:#64748b; word-break:break-all;">${verificationUrl}</a></p>`,
      branding,
      "Verify your email address"
    ),
  };
}

export function resetPasswordEmail(
  name: string,
  resetUrl: string,
  branding: TenantBranding = {}
): EmailTemplate {
  const appName = branding.fromName ?? "CoachOS";
  return {
    subject: `Reset your password — ${appName}`,
    html: baseLayout(
      `<h1>Reset your password</h1>
      <p>Hi ${name}, we received a request to reset your ${appName} password. Click the button below to choose a new password.</p>
      <p style="text-align:center; margin:32px 0;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </p>
      <p>This link expires in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email — your password will remain unchanged.</p>
      <hr class="divider" />
      <p style="font-size:13px; color:#94a3b8;">If the button above doesn't work, copy and paste this URL into your browser:<br /><a href="${resetUrl}" style="color:#64748b; word-break:break-all;">${resetUrl}</a></p>`,
      branding,
      "Reset your password"
    ),
  };
}

export function invitationEmail(
  inviterName: string,
  inviteUrl: string,
  role: string,
  branding: TenantBranding = {}
): EmailTemplate {
  const appName = branding.fromName ?? "CoachOS";
  return {
    subject: `You've been invited to join ${appName}`,
    html: baseLayout(
      `<h1>You're invited!</h1>
      <p><strong>${inviterName}</strong> has invited you to join ${appName} as a <strong>${role}</strong>.</p>
      <p style="text-align:center; margin:32px 0;">
        <a href="${inviteUrl}" class="btn">Accept Invitation</a>
      </p>
      <p>This invitation expires in <strong>7 days</strong>. If you have questions, reply to this email.</p>
      <hr class="divider" />
      <p style="font-size:13px; color:#94a3b8;">If the button above doesn't work, copy and paste this URL into your browser:<br /><a href="${inviteUrl}" style="color:#64748b; word-break:break-all;">${inviteUrl}</a></p>`,
      branding,
      `Join ${appName}`
    ),
  };
}

export function magicLinkEmail(
  email: string,
  magicUrl: string,
  branding: TenantBranding = {}
): EmailTemplate {
  const appName = branding.fromName ?? "CoachOS";
  return {
    subject: `Your sign-in link for ${appName}`,
    html: baseLayout(
      `<h1>Sign in to ${appName}</h1>
      <p>Click the button below to sign in instantly. No password needed.</p>
      <p style="text-align:center; margin:32px 0;">
        <a href="${magicUrl}" class="btn">Sign In</a>
      </p>
      <p>This link expires in <strong>5 minutes</strong> and can only be used once. If you did not request this, you can safely ignore this email.</p>
      <hr class="divider" />
      <p style="font-size:13px; color:#94a3b8;">Signing in as: <strong>${email}</strong></p>`,
      branding,
      "Sign in to your account"
    ),
  };
}

export function paymentReceiptEmail(
  name: string,
  receiptData: {
    receiptNumber: string;
    amount: string;
    currency: string;
    date: string;
    description: string;
    paymentMethod?: string;
  },
  branding: TenantBranding = {}
): EmailTemplate {
  const appName = branding.fromName ?? "CoachOS";
  const { receiptNumber, amount, currency, date, description, paymentMethod } =
    receiptData;
  return {
    subject: `Payment receipt #${receiptNumber} — ${appName}`,
    html: baseLayout(
      `<h1>Payment Confirmed ✓</h1>
      <p>Hi ${name}, your payment has been processed successfully. Here's your receipt.</p>
      <hr class="divider" />
      <table>
        <tr><td class="label-cell">Receipt No.</td><td class="value-cell">#${receiptNumber}</td></tr>
        <tr><td class="label-cell">Date</td><td class="value-cell">${date}</td></tr>
        <tr><td class="label-cell">Description</td><td class="value-cell">${description}</td></tr>
        ${paymentMethod ? `<tr><td class="label-cell">Payment Method</td><td class="value-cell">${paymentMethod}</td></tr>` : ""}
        <tr class="amount-row"><td class="label-cell">Total Paid</td><td class="value-cell">${amount} ${currency}</td></tr>
      </table>
      <p style="margin-top:24px;">Keep this email as your proof of payment. If you have any questions, please contact support.</p>`,
      branding,
      `Payment receipt #${receiptNumber}`
    ),
  };
}

export function invoiceEmail(
  name: string,
  invoiceData: {
    invoiceNumber: string;
    dueDate: string;
    items: { description: string; amount: string }[];
    total: string;
    currency: string;
    paymentUrl?: string;
  },
  branding: TenantBranding = {}
): EmailTemplate {
  const appName = branding.fromName ?? "CoachOS";
  const { invoiceNumber, dueDate, items, total, currency, paymentUrl } =
    invoiceData;

  const itemRows = items
    .map(
      (item) =>
        `<tr><td class="label-cell">${item.description}</td><td class="value-cell" style="text-align:right;">${item.amount} ${currency}</td></tr>`
    )
    .join("");

  return {
    subject: `Invoice #${invoiceNumber} — ${appName}`,
    html: baseLayout(
      `<h1>Invoice #${invoiceNumber}</h1>
      <p>Hi ${name}, please find your invoice details below.</p>
      <hr class="divider" />
      <table>
        <tr><td class="label-cell">Invoice No.</td><td class="value-cell">#${invoiceNumber}</td></tr>
        <tr><td class="label-cell">Due Date</td><td class="value-cell">${dueDate}</td></tr>
      </table>
      <hr class="divider" />
      <table>
        <thead><tr><td style="font-size:12px; color:#94a3b8; font-weight:600; text-transform:uppercase; padding-bottom:8px;">Description</td><td style="font-size:12px; color:#94a3b8; font-weight:600; text-transform:uppercase; text-align:right; padding-bottom:8px;">Amount</td></tr></thead>
        <tbody>${itemRows}</tbody>
        <tr class="amount-row"><td>Total</td><td style="text-align:right;">${total} ${currency}</td></tr>
      </table>
      ${paymentUrl ? `<p style="text-align:center; margin:32px 0;"><a href="${paymentUrl}" class="btn">Pay Now</a></p>` : ""}`,
      branding,
      `Invoice #${invoiceNumber}`
    ),
  };
}

export function bookingConfirmationEmail(
  name: string,
  bookingData: {
    serviceName: string;
    date: string;
    time: string;
    location?: string;
    coachName?: string;
    notes?: string;
  },
  branding: TenantBranding = {}
): EmailTemplate {
  const appName = branding.fromName ?? "CoachOS";
  const { serviceName, date, time, location, coachName, notes } = bookingData;
  return {
    subject: `Booking confirmed: ${serviceName} on ${date} — ${appName}`,
    html: baseLayout(
      `<h1>Booking Confirmed ✓</h1>
      <p>Hi ${name}, your booking has been confirmed. Here are the details:</p>
      <hr class="divider" />
      <table>
        <tr><td class="label-cell">Service</td><td class="value-cell">${serviceName}</td></tr>
        <tr><td class="label-cell">Date</td><td class="value-cell">${date}</td></tr>
        <tr><td class="label-cell">Time</td><td class="value-cell">${time}</td></tr>
        ${coachName ? `<tr><td class="label-cell">Coach</td><td class="value-cell">${coachName}</td></tr>` : ""}
        ${location ? `<tr><td class="label-cell">Location</td><td class="value-cell">${location}</td></tr>` : ""}
        ${notes ? `<tr><td class="label-cell">Notes</td><td class="value-cell">${notes}</td></tr>` : ""}
      </table>
      <p style="margin-top:24px;">We look forward to seeing you! If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>`,
      branding,
      `Booking confirmed: ${serviceName}`
    ),
  };
}

export function bookingReminderEmail(
  name: string,
  bookingData: {
    serviceName: string;
    date: string;
    time: string;
    location?: string;
    coachName?: string;
    hoursUntil: number;
  },
  branding: TenantBranding = {}
): EmailTemplate {
  const appName = branding.fromName ?? "CoachOS";
  const { serviceName, date, time, location, coachName, hoursUntil } =
    bookingData;
  const timeLabel = hoursUntil <= 2 ? "shortly" : `in ${hoursUntil} hours`;
  return {
    subject: `Reminder: ${serviceName} ${timeLabel} — ${appName}`,
    html: baseLayout(
      `<h1>Session Reminder 🔔</h1>
      <p>Hi ${name}, just a reminder that your session is coming up ${timeLabel}.</p>
      <hr class="divider" />
      <table>
        <tr><td class="label-cell">Service</td><td class="value-cell">${serviceName}</td></tr>
        <tr><td class="label-cell">Date</td><td class="value-cell">${date}</td></tr>
        <tr><td class="label-cell">Time</td><td class="value-cell">${time}</td></tr>
        ${coachName ? `<tr><td class="label-cell">Coach</td><td class="value-cell">${coachName}</td></tr>` : ""}
        ${location ? `<tr><td class="label-cell">Location</td><td class="value-cell">${location}</td></tr>` : ""}
      </table>
      <p style="margin-top:24px;">See you soon! If you need to cancel or reschedule, please do so as soon as possible.</p>`,
      branding,
      `Reminder: ${serviceName} ${timeLabel}`
    ),
  };
}
