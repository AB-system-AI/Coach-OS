import { getCurrentTenant } from "@/lib/auth/session";
import { getCourseStats } from "@/features/courses";
import { ModuleOverview } from "@/components/layout/module-overview";
import { redirect } from "next/navigation";

export default async function CoursesPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");
  const stats = await getCourseStats(tenant.id);

  return (
    <ModuleOverview
      title="Online Courses"
      description="Create courses with sections, lessons, videos, quizzes, and certificates."
      stats={[
        { label: "Total Courses", value: stats.total },
        { label: "Published", value: stats.published },
        { label: "Enrollments", value: stats.enrollments },
      ]}
      actions={[{ label: "Create Course", href: "/dashboard/courses/new" }]}
    />
  );
}
