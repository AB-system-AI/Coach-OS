import { db } from "@/lib/db";
import { requireTenantAccess } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";
import type { CourseStatus } from "@prisma/client";

export async function getCourses(tenantId: string) {
  await requireTenantAccess(tenantId);
  return db.course.findMany({
    where: { tenantId },
    include: { _count: { select: { sections: true, enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCourse(
  tenantId: string,
  data: { title: string; description?: string; price?: number }
) {
  await requireTenantAccess(tenantId);
  const slug = slugify(data.title);
  return db.course.create({
    data: {
      tenantId,
      title: data.title,
      slug,
      description: data.description,
      price: data.price ?? 0,
      status: "DRAFT",
    },
  });
}

export async function getCourseStats(tenantId: string) {
  const [total, published, enrollments] = await Promise.all([
    db.course.count({ where: { tenantId } }),
    db.course.count({ where: { tenantId, status: "PUBLISHED" } }),
    db.courseEnrollment.count({ where: { course: { tenantId } } }),
  ]);
  return { total, published, enrollments };
}

export type { CourseStatus };
