"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Globe, Trash2 } from "lucide-react";
import { updateBlogPostAction, deleteBlogPostAction } from "@/features/website/actions/blog-actions";

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
};

export function BlogPostEditClient({ post: initial, tenantId }: { post: Post; tenantId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial.title,
    content: initial.content ?? "",
    excerpt: initial.excerpt ?? "",
    coverImageUrl: initial.coverImageUrl ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(status?: "DRAFT" | "PUBLISHED") {
    setSaving(true);
    try {
      await updateBlogPostAction(tenantId, initial.id, {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
        ...(status ? { status } : {}),
      });
      toast.success(status === "PUBLISHED" ? "Post published" : "Post saved");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteBlogPostAction(tenantId, initial.id);
      toast.success("Post deleted");
      router.push("/dashboard/blog");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/dashboard/blog" className="text-sm text-muted-foreground hover:text-foreground">
          ← Blog
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold truncate">{initial.title}</h1>
          <Badge variant={initial.status === "PUBLISHED" ? "default" : "secondary"}>
            {initial.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Slug: /{initial.slug}
          {initial.publishedAt && ` · Published ${new Date(initial.publishedAt).toLocaleDateString()}`}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <textarea id="excerpt"
              className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">Cover Image URL</Label>
            <Input id="coverImageUrl" value={form.coverImageUrl}
              onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <textarea id="content"
              className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={() => handleSave()} disabled={saving} variant="outline">
              {saving ? "Saving..." : "Save"}
            </Button>
            {initial.status === "DRAFT" ? (
              <Button onClick={() => handleSave("PUBLISHED")} disabled={saving}>
                <Globe className="h-4 w-4 me-1" />Publish
              </Button>
            ) : (
              <Button onClick={() => handleSave("DRAFT")} disabled={saving} variant="outline">
                Unpublish
              </Button>
            )}
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="ms-auto">
              <Trash2 className="h-4 w-4 me-1" />{deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
