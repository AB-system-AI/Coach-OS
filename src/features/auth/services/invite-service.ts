import { db } from "@/lib/db";
import { sendEmail, invitationEmail } from "@/lib/email/index";
import { resolveAuthUrl } from "@/lib/env";
import { randomBytes } from "crypto";
import type { TenantBranding } from "@/lib/email/templates";
import { UserRole } from "@prisma/client";

interface InvitePayload {
  email: string;
  role: UserRole;
  tenantId: string;
  inviterId: string;
}

const INVITE_PREFIX = "invite-token:";
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createInvite(
  payload: InvitePayload,
  _branding?: TenantBranding
): Promise<{ token: string; inviteUrl: string }> {
  const { email, role, tenantId, inviterId } = payload;

  // Invalidate any existing pending invites for this email+tenant combo
  await db.verification.deleteMany({
    where: {
      identifier: { startsWith: INVITE_PREFIX },
      expiresAt: { gt: new Date() },
    },
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

  await db.verification.create({
    data: {
      identifier: `${INVITE_PREFIX}${token}`,
      value: JSON.stringify({ email, role, tenantId, inviterId }),
      expiresAt,
    },
  });

  const baseUrl = resolveAuthUrl();
  const inviteUrl = `${baseUrl}/invite?token=${token}&email=${encodeURIComponent(email)}`;

  return { token, inviteUrl };
}

export async function sendInvitation(
  inviterName: string,
  payload: InvitePayload,
  branding?: TenantBranding
): Promise<{ token: string; inviteUrl: string }> {
  const result = await createInvite(payload, branding);

  const template = invitationEmail(
    inviterName,
    result.inviteUrl,
    payload.role,
    branding
  );

  await sendEmail({
    to: payload.email,
    subject: template.subject,
    html: template.html,
  });

  return result;
}

export async function getInviteByToken(
  token: string
): Promise<(InvitePayload & { expiresAt: Date }) | null> {
  const record = await db.verification.findFirst({
    where: {
      identifier: `${INVITE_PREFIX}${token}`,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) return null;

  try {
    const raw = JSON.parse(record.value) as Record<string, string>;
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(raw.role as UserRole)) return null;
    const payload: InvitePayload = {
      email: raw.email,
      role: raw.role as UserRole,
      tenantId: raw.tenantId,
      inviterId: raw.inviterId,
    };
    return { ...payload, expiresAt: record.expiresAt };
  } catch {
    return null;
  }
}

export interface AcceptInviteResult {
  success: boolean;
  error?: string;
  tenantId?: string;
}

export async function acceptInvite(
  token: string,
  userId: string
): Promise<AcceptInviteResult> {
  const invite = await getInviteByToken(token);

  if (!invite) {
    return { success: false, error: "Invitation not found or has expired." };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return {
      success: false,
      error: "This invitation is for a different email address.",
    };
  }

  // Add user to tenant
  await db.tenantMember.upsert({
    where: { tenantId_userId: { tenantId: invite.tenantId, userId } },
    update: { isActive: true, role: invite.role },
    create: {
      tenantId: invite.tenantId,
      userId,
      role: invite.role,
      isActive: true,
    },
  });

  // Consume the invite token
  await db.verification.deleteMany({
    where: { identifier: `${INVITE_PREFIX}${token}` },
  });

  return { success: true, tenantId: invite.tenantId };
}
