import { getCurrentTenant } from "@/lib/auth/session";
import { createCourse } from "@/features/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";

export default async function NewCoursePage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Create Course</h1>
        <p className="text-muted-foreground text-sm">Set up a new online course with sections and lessons.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form
            action={async (formData: FormData) => {
              "use server";
              const course = await createCourse(tenant.id, {
                title: formData.get("title") as string,
                description: (formData.get("description") as string) || undefined,
                price: formData.get("price") ? parseFloat(formData.get("price") as string) : 0,
                status: (formData.get("status") as "DRAFT" | "PUBLISHED") || "DRAFT",
              });
              redirect(`/dashboard/courses/${course.id}`);
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="title">Course Title *</Label>
              <Input id="title" name="title" required placeholder="e.g. 12-Week Fat Loss Fundamentals" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
                placeholder="What will students learn in this course?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue="0" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" className="h-10 w-full rounded-md border border-input px-3 text-sm">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Course</Button>
              <Button type="button" variant="outline" formAction={() => redirect("/dashboard/courses")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
