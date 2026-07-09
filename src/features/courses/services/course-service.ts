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

export async function getCourse(tenantId: string, courseId: string) {
  await requireTenantAccess(tenantId);
  return db.course.findUnique({
    where: { id: courseId, tenantId },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
      enrollments: {
        orderBy: { enrolledAt: "desc" },
        take: 20,
      },
      _count: { select: { sections: true, enrollments: true } },
    },
  });
}

export async function createCourse(
  tenantId: string,
  data: { title: string; description?: string; price?: number; status?: CourseStatus }
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
      status: data.status ?? "DRAFT",
    },
  });
}

export async function updateCourse(
  tenantId: string,
  courseId: string,
  data: { title?: string; description?: string; price?: number; status?: CourseStatus; thumbnail?: string }
) {
  await requireTenantAccess(tenantId);
  return db.course.update({
    where: { id: courseId, tenantId },
    data,
  });
}

export async function createCourseSection(
  tenantId: string,
  courseId: string,
  data: { title: string; description?: string }
) {
  await requireTenantAccess(tenantId);
  const count = await db.courseSection.count({ where: { courseId } });
  return db.courseSection.create({
    data: { courseId, title: data.title, order: count + 1 },
  });
}

export async function createCourseLesson(
  tenantId: string,
  sectionId: string,
  data: { title: string; content?: string; videoUrl?: string; duration?: number; isLocked?: boolean }
) {
  await requireTenantAccess(tenantId);
  const section = await db.courseSection.findUnique({
    where: { id: sectionId },
    include: { course: { select: { tenantId: true } } },
  });
  if (!section || section.course.tenantId !== tenantId) throw new Error("Section not found");
  const count = await db.courseLesson.count({ where: { sectionId } });
  return db.courseLesson.create({
    data: {
      sectionId,
      title: data.title,
      content: data.content,
      videoUrl: data.videoUrl,
      duration: data.duration,
      isLocked: data.isLocked ?? false,
      order: count + 1,
    },
  });
}

export async function enrollInCourse(tenantId: string, courseId: string, userId: string) {
  await requireTenantAccess(tenantId);
  const course = await db.course.findUnique({ where: { id: courseId, tenantId } });
  if (!course) throw new Error("Course not found");

  return db.courseEnrollment.upsert({
    where: { courseId_userId: { courseId, userId } },
    create: { courseId, userId },
    update: {},
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

export async function issueCertificate(enrollmentId: string) {
  const enrollment = await db.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: true },
  });
  if (!enrollment) throw new Error("Enrollment not found");
  if (enrollment.progress < 100) throw new Error("Course not completed (progress must be 100%)");

  const certificateUrl = `/certificates/${enrollment.id}.pdf`;

  return db.courseEnrollment.update({
    where: { id: enrollmentId },
    data: {
      certificateUrl,
      completedAt: enrollment.completedAt ?? new Date(),
    },
  });
}

export type { CourseStatus };
