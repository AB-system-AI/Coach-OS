import { getCurrentTenant } from "@/lib/auth/session";
import { getCourses, getCourseStats } from "@/features/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default async function CoursesPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [courses, stats] = await Promise.all([
    getCourses(tenant.id),
    getCourseStats(tenant.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Online Courses</h1>
          <p className="text-muted-foreground">Create and manage courses with sections, lessons, and certificates.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/courses/new">Create Course</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Courses</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Published</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats.published}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Enrollments</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.enrollments}</div></CardContent>
        </Card>
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No courses yet. Create your first course.</p>
            <Button asChild>
              <Link href="/dashboard/courses/new">Create Course</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col">
            <CardContent className="pt-6 flex-1">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold leading-tight">{course.title}</h3>
                <Badge variant={course.status === "PUBLISHED" ? "default" : "secondary"}>
                  {course.status}
                </Badge>
              </div>
              {course.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
              )}
              <div className="flex gap-3 text-xs text-muted-foreground mb-4">
                <span>{course._count.sections} sections</span>
                <span>{course._count.enrollments} students</span>
                <span>{formatCurrency(Number(course.price))}</span>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/dashboard/courses/${course.id}`}>Manage</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
