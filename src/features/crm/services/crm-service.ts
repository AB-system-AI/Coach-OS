import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";

export async function getCrmStats(tenantId: string) {
  await requireTenantAccess(tenantId);
  const [leads, tasks, won] = await Promise.all([
    db.crmLead.count({ where: { tenantId } }),
    db.crmTask.count({ where: { lead: { tenantId }, isCompleted: false } }),
    db.crmLead.count({ where: { tenantId, status: "WON" } }),
  ]);
  return { leads, tasks, won };
}

export async function getCrmLeads(tenantId: string) {
  return db.crmLead.findMany({
    where: { tenantId },
    include: { stage: true, _count: { select: { tasks: true, activities: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCrmLead(
  tenantId: string,
  data: { name: string; email?: string; phone?: string; source?: string }
) {
  await requireTenantAccess(tenantId);
  const pipeline = await db.crmPipeline.findFirst({
    where: { tenantId, isDefault: true },
    include: { stages: { orderBy: { order: "asc" }, take: 1 } },
  });

  return db.crmLead.create({
    data: {
      tenantId,
      pipelineId: pipeline?.id,
      stageId: pipeline?.stages[0]?.id,
      ...data,
    },
  });
}
