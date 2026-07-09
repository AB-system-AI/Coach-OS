"use server";

import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { revokeSession, revokeAllOtherSessions } from "../services/session-service";
import { sendInvitation } from "../services/invite-service";
import { UserRole } from "@prisma/client";

// ─── Change password ──────────────────────────────────────────────────────────

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = getAuth();
    const hdrs = await headers();

    await auth.api.changePassword({
      headers: hdrs,
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to change password",
    };
  }
}

// ─── Update email ─────────────────────────────────────────────────────────────

export async function updateEmailAction(
  newEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = getAuth();
    const hdrs = await headers();

    await auth.api.changeEmail({
      headers: hdrs,
      body: { newEmail },
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update email",
    };
  }
}

// ─── Revoke session ───────────────────────────────────────────────────────────

export async function revokeSessionAction(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth();
    await revokeSession(sessionId, session.user.id);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to revoke session",
    };
  }
}

export async function revokeAllOtherSessionsAction(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  try {
    const session = await requireAuth();
    const count = await revokeAllOtherSessions(session.user.id);
    return { success: true, count };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to revoke sessions",
    };
  }
}

// ─── Invite user ──────────────────────────────────────────────────────────────

export async function inviteUserAction(
  email: string,
  role: UserRole,
  tenantId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await requireAuth();

    const inviter = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, role: true },
    });

    if (!inviter) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify inviter has access to this tenant
    const membership = await db.tenantMember.findUnique({
      where: { tenantId_userId: { tenantId, userId: session.user.id } },
      select: { role: true },
    });

    const isSuperAdmin = inviter.role === "SUPER_ADMIN";
    const isOwnerOrCoach =
      membership && (["COACH", "SUPER_ADMIN"] as string[]).includes(membership.role);

    if (!isSuperAdmin && !isOwnerOrCoach) {
      return { success: false, error: "Insufficient permissions to invite users" };
    }

    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    });

    await sendInvitation(inviter.name, { email, role, tenantId, inviterId: session.user.id }, { fromName: tenant?.name ?? undefined });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send invitation",
    };
  }
}
