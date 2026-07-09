import { getCurrentTenant } from "@/lib/auth/session";
import { getBlogPosts } from "@/features/website";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export default async function BlogPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");
  const posts = await getBlogPosts(tenant.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-muted-foreground mt-1">Content marketing and SEO blog posts.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Posts</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {posts.map((post) => (
            <div key={post.id} className="py-4">
              <p className="font-medium">{post.title}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{post.status}</Badge>
                <span className="text-xs text-muted-foreground">
                  {post.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-muted-foreground py-4">No blog posts yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
