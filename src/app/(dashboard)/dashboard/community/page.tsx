import { getCurrentTenant } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function CommunityPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [groups, postCount] = await Promise.all([
    db.communityGroup.findMany({
      where: { tenantId: tenant.id },
      include: { _count: { select: { posts: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.communityPost.count({ where: { group: { tenantId: tenant.id } } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Community</h1>
        <p className="text-muted-foreground">Groups, discussions, and member engagement.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Groups</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{groups.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Posts</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Posts</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{postCount}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Create Group</CardTitle></CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              const t = await getCurrentTenant();
              if (!t) return;
              await db.communityGroup.create({
                data: {
                  tenantId: t.id,
                  name: formData.get("name") as string,
                  description: (formData.get("description") as string) || undefined,
                  isPrivate: formData.get("isPrivate") === "true",
                },
              });
              revalidatePath("/dashboard/community");
            }}
            className="flex flex-wrap gap-4 items-end"
          >
            <div className="space-y-1 flex-1 min-w-[200px]">
              <Label htmlFor="name">Group Name *</Label>
              <Input id="name" name="name" required placeholder="Fat Loss Warriors" />
            </div>
            <div className="space-y-1 flex-1 min-w-[200px]">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Group description" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="isPrivate">Visibility</Label>
              <select id="isPrivate" name="isPrivate" className="h-10 rounded-md border border-input px-3 text-sm">
                <option value="false">Public</option>
                <option value="true">Private</option>
              </select>
            </div>
            <Button type="submit">Create Group</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold">{group.name}</h3>
                <Badge variant={group.isPrivate ? "secondary" : "outline"}>
                  {group.isPrivate ? "Private" : "Public"}
                </Badge>
              </div>
              {group.description && (
                <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
              )}
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{group._count.posts} posts</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {groups.length === 0 && (
          <Card className="col-span-2">
            <CardContent className="py-8 text-center text-muted-foreground">
              No groups yet. Create your first community group above.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
