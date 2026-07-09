import { db } from "@/lib/db";
import type { AuditAction } from "@prisma/client";

type AuditInput = {
  tenantId?: string;
  userId?: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  reason?: string;
  metadata?: object;
  previousData?: object;
  canRollback?: boolean;
  ipAddress?: string;
};

export async function writeAuditLog(input: AuditInput) {
  return db.auditLog.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      reason: input.reason,
      metadata: input.metadata ?? {},
      previousData: input.previousData,
      canRollback: input.canRollback ?? false,
      ipAddress: input.ipAddress,
    },
  });
}
