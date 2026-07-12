import { getCurrentTenant } from "@/lib/auth/session";
import { getCourse, updateCourse, createCourseSection, createCourseLesson, issueCertificate } from "@/features/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, Users, Award } from "lucide-react";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const course = await getCourse(tenant.id, id);
  if (!course) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/courses" className="text-sm text-muted-foreground hover:underline mb-1 block">← Courses</Link>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          {course.description && <p className="text-muted-foreground mt-1">{course.description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={course.status === "PUBLISHED" ? "default" : "secondary"}>
            {course.status}
          </Badge>
          <form
            action={async (_formData: FormData) => {
              "use server";
              const newStatus = course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
              await updateCourse(tenant.id, id, { status: newStatus as "DRAFT" | "PUBLISHED" });
              revalidatePath(`/dashboard/courses/${id}`);
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              {course.status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xl font-bold">{course._count.sections}</div>
              <p className="text-sm text-muted-foreground">Sections</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xl font-bold">{course._count.enrollments}</div>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xl font-bold">{formatCurrency(Number(course.price))}</div>
            <p className="text-sm text-muted-foreground">Price</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sections</h2>
          </div>

          {course.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {section.lessons.length > 0 ? (
                  <ul className="space-y-1">
                    {section.lessons.map((lesson) => (
                      <li key={lesson.id} className="flex items-center gap-2 text-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground shrink-0" />
                        <span className="truncate">{lesson.title}</span>
                        {!lesson.isLocked && <Badge variant="outline" className="text-xs">Free</Badge>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No lessons yet.</p>
                )}

                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const title = formData.get("lessonTitle") as string;
                    if (title?.trim()) {
                      await createCourseLesson(tenant.id, section.id, {
                        title,
                        content: (formData.get("lessonContent") as string) || undefined,
                      });
                      revalidatePath(`/dashboard/courses/${id}`);
                    }
                  }}
                  className="mt-3 flex gap-2"
                >
                  <Input name="lessonTitle" placeholder="Add lesson..." className="h-8 text-sm flex-1" />
                  <Button type="submit" size="sm" variant="outline" className="h-8">Add</Button>
                </form>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed">
            <CardContent className="pt-4">
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const title = formData.get("sectionTitle") as string;
                  if (title?.trim()) {
                    await createCourseSection(tenant.id, id, { title });
                    revalidatePath(`/dashboard/courses/${id}`);
                  }
                }}
                className="flex gap-2"
              >
                <Input name="sectionTitle" placeholder="New section title..." className="flex-1" />
                <Button type="submit" variant="outline">Add Section</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Students ({course._count.enrollments})</h2>
          <Card>
            <CardContent className="divide-y pt-0">
              {course.enrollments.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">No students enrolled yet.</p>
              )}
              {course.enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm font-mono text-xs">{enrollment.userId.slice(0, 12)}…</p>
                    <p className="text-xs text-muted-foreground">
                      Progress: {enrollment.progress}%
                      {enrollment.completedAt && ` · Completed ${new Date(enrollment.completedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {enrollment.certificateUrl ? (
                      <Badge variant="default"><Award className="h-3 w-3 mr-1" />Certified</Badge>
                    ) : enrollment.progress >= 100 ? (
                      <form
                        action={async () => {
                          "use server";
                          await issueCertificate(enrollment.id);
                          revalidatePath(`/dashboard/courses/${id}`);
                        }}
                      >
                        <Button type="submit" variant="outline" size="sm">Issue Certificate</Button>
                      </form>
                    ) : (
                      <span className="text-xs text-muted-foreground">{enrollment.progress}%</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
