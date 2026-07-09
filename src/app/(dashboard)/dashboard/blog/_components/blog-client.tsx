"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Pencil, Trash2, Globe, FileText } from "lucide-react";
import {
  updateBlogPostAction,
  deleteBlogPostAction,
} from "@/features/website/actions/blog-actions";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  createdAt: Date;
};

interface Props {
  posts: Post[];
  tenantId: string;
}

export function BlogClient({ posts, tenantId }: Props) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleToggleStatus(post: Post) {
    const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setUpdatingId(post.id);
    try {
      await updateBlogPostAction(tenantId, post.id, { status: newStatus as "DRAFT" | "PUBLISHED" });
      toast.success(newStatus === "PUBLISHED" ? "Post published" : "Post moved to draft");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(post: Post) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setUpdatingId(post.id);
    try {
      await deleteBlogPostAction(tenantId, post.id);
      toast.success("Post deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setUpdatingId(null);
    }
  }

  const published = posts.filter((p) => p.status === "PUBLISHED").length;
  const drafts = posts.filter((p) => p.status === "DRAFT").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-muted-foreground mt-1">Content marketing and SEO blog posts.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/blog/new">
            <Plus className="h-4 w-4 me-2" />New Post
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Posts", value: posts.length },
          { label: "Published", value: published },
          { label: "Drafts", value: drafts },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Blog Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {posts.map((post) => (
            <div key={post.id} className="py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/dashboard/blog/${post.id}`} className="font-medium hover:underline truncate">
                    {post.title}
                  </Link>
                  <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"} className="shrink-0 text-xs">
                    {post.status}
                  </Badge>
                </div>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {post.status === "PUBLISHED" && post.publishedAt
                    ? `Published ${new Date(post.publishedAt).toLocaleDateString()}`
                    : `Created ${new Date(post.createdAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(post)}
                  disabled={updatingId === post.id}
                  className="h-7 text-xs"
                >
                  <Globe className="h-3 w-3 me-1" />
                  {post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                </Button>
                <Button size="sm" variant="ghost" asChild className="h-7 w-7 p-0">
                  <Link href={`/dashboard/blog/${post.id}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(post)}
                  disabled={updatingId === post.id}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No blog posts yet.</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/dashboard/blog/new">Write your first post</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
