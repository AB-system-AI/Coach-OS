import { db } from "@/lib/db";
import type { CrmLeadStatus } from "@prisma/client";
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

export async function getCrmPipeline(tenantId: string) {
  await requireTenantAccess(tenantId);
  const pipeline = await db.crmPipeline.findFirst({
    where: { tenantId, isDefault: true },
    include: {
      stages: {
        orderBy: { order: "asc" },
        include: {
          leads: {
            where: { tenantId },
            include: { _count: { select: { tasks: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!pipeline) {
    const created = await db.crmPipeline.create({
      data: {
        tenantId,
        name: "Sales Pipeline",
        isDefault: true,
        stages: {
          create: [
            { name: "New Lead", order: 1, color: "#6366f1" },
            { name: "Contacted", order: 2, color: "#f59e0b" },
            { name: "Qualified", order: 3, color: "#3b82f6" },
            { name: "Proposal", order: 4, color: "#8b5cf6" },
            { name: "Won", order: 5, color: "#22c55e" },
            { name: "Lost", order: 6, color: "#ef4444" },
          ],
        },
      },
      include: {
        stages: {
          orderBy: { order: "asc" },
          include: { leads: { include: { _count: { select: { tasks: true } } } } },
        },
      },
    });
    return created;
  }

  return pipeline;
}

export async function createCrmLead(
  tenantId: string,
  data: { name: string; email?: string; phone?: string; source?: string; value?: number; notes?: string }
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
      name: data.name,
      email: data.email,
      phone: data.phone,
      source: data.source,
      value: data.value ? data.value : undefined,
      notes: data.notes,
    },
  });
}

export async function moveCrmLead(tenantId: string, leadId: string, stageId: string) {
  await requireTenantAccess(tenantId);
  return db.crmLead.update({
    where: { id: leadId, tenantId },
    data: { stageId },
  });
}

export async function updateCrmLead(
  tenantId: string,
  leadId: string,
  data: { name?: string; email?: string; phone?: string; status?: CrmLeadStatus; value?: number; notes?: string }
) {
  await requireTenantAccess(tenantId);
  return db.crmLead.update({
    where: { id: leadId, tenantId },
    data,
  });
}

export async function createCrmTask(
  tenantId: string,
  leadId: string,
  data: { title: string; dueDate?: Date; assignedTo?: string }
) {
  await requireTenantAccess(tenantId);
  const lead = await db.crmLead.findUnique({ where: { id: leadId, tenantId } });
  if (!lead) throw new Error("Lead not found");

  return db.crmTask.create({
    data: {
      leadId,
      title: data.title,
      dueDate: data.dueDate,
      assignedTo: data.assignedTo,
    },
  });
}

export async function completeCrmTask(tenantId: string, taskId: string) {
  await requireTenantAccess(tenantId);
  return db.crmTask.update({
    where: { id: taskId, lead: { tenantId } },
    data: { isCompleted: true },
  });
}

export async function getCrmTasks(tenantId: string, leadId?: string) {
  await requireTenantAccess(tenantId);
  return db.crmTask.findMany({
    where: { lead: { tenantId }, ...(leadId ? { leadId } : {}) },
    include: { lead: { select: { name: true } } },
    orderBy: { dueDate: "asc" },
    take: 50,
  });
}
