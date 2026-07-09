import { db } from "@/lib/db";
import { requireTenantAccess, requireAuth } from "@/lib/auth/session";

export async function getSupportTickets(tenantId?: string) {
  if (tenantId) await requireTenantAccess(tenantId);
  return db.supportTicket.findMany({
    where: tenantId ? { tenantId } : undefined,
    include: {
      creator: { select: { name: true, email: true } },
      assignee: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function createSupportTicket(data: {
  tenantId?: string;
  subject: string;
  description: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}) {
  const session = await requireAuth();
  return db.supportTicket.create({
    data: {
      tenantId: data.tenantId,
      creatorId: session.user.id,
      subject: data.subject,
      description: data.description,
      priority: data.priority ?? "MEDIUM",
    },
  });
}

export async function getSupportStats(tenantId?: string) {
  const where = tenantId ? { tenantId } : {};
  const [open, resolved] = await Promise.all([
    db.supportTicket.count({ where: { ...where, status: "OPEN" } }),
    db.supportTicket.count({ where: { ...where, status: "RESOLVED" } }),
  ]);
  return { open, resolved };
}
