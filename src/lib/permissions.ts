import { db } from "@/lib/db";
import type { StaffRole } from "@prisma/client";

const ROLE_PERMISSIONS: Record<StaffRole, string[]> = {
  COACH: ["*"],
  ASSISTANT_COACH: ["clients.read", "programs.read", "bookings.manage"],
  RECEPTION: ["clients.read", "bookings.manage", "attendance.manage"],
  NUTRITIONIST: ["clients.read", "meals.manage", "progress.read"],
  PHYSIOTHERAPIST: ["clients.read", "recovery.manage", "bookings.manage"],
  MANAGER: ["*"],
  TRAINER: ["clients.read", "programs.manage", "bookings.read"],
};

export async function hasPermission(
  tenantId: string,
  userId: string,
  permission: string
): Promise<boolean> {
  const staff = await db.tenantStaff.findFirst({
    where: { tenantId, userId, isActive: true },
  });

  if (!staff) return true;

  const custom = staff.permissions as Record<string, boolean> | null;
  if (custom?.[permission] === true) return true;
  if (custom?.[permission] === false) return false;

  const rolePerms = ROLE_PERMISSIONS[staff.role] ?? [];
  return rolePerms.includes("*") || rolePerms.includes(permission);
}
