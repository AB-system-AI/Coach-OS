import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";

async function createPlatformAnnouncement(formData: FormData) {
  "use server";
  await requireRole("SUPER_ADMIN");
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) return;

  await db.platformAnnouncement.create({
    data: { title, content, isActive: true },
  });
  revalidatePath("/admin/announcements");
}

async function deactivateAnnouncement(id: string) {
  "use server";
  await requireRole("SUPER_ADMIN");
  await db.platformAnnouncement.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/admin/announcements");
}

export default async function AdminAnnouncementsPage() {
  await requireRole("SUPER_ADMIN");

  const announcements = await db.platformAnnouncement.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Announcements</h1>
        <p className="text-muted-foreground mt-1">Broadcast messages to all tenants.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Create Announcement</CardTitle></CardHeader>
        <CardContent>
          <form action={createPlatformAnnouncement} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required maxLength={200} placeholder="Scheduled maintenance..." />
            </div>
            <div className="space-y-1">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                name="content"
                required
                maxLength={5000}
                rows={4}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
                placeholder="We will be performing maintenance on..."
              />
            </div>
            <Button type="submit">Create Announcement</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Announcements</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {announcements.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No announcements yet.</p>
          )}
          {announcements.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-4 py-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{a.title}</p>
                  <Badge variant={a.isActive ? "default" : "secondary"}>
                    {a.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{a.content.slice(0, 200)}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(a.createdAt).toLocaleString()}</p>
              </div>
              {a.isActive && (
                <form action={async () => {
                  "use server";
                  await deactivateAnnouncement(a.id);
                }}>
                  <Button variant="outline" size="sm" type="submit">Deactivate</Button>
                </form>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
