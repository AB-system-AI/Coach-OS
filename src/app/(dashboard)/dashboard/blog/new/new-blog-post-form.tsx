"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBlogPostAction } from "@/features/website/actions/blog-actions";

export function NewBlogPostForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", content: "", excerpt: "", coverImageUrl: "", status: "DRAFT" as "DRAFT" | "PUBLISHED",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title required"); return; }
    setLoading(true);
    try {
      const result = await createBlogPostAction(tenantId, {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
        status: form.status,
      });
      toast.success(form.status === "PUBLISHED" ? "Post published" : "Draft saved");
      router.push(`/dashboard/blog/${result.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Post title..." value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt / Meta Description</Label>
            <textarea id="excerpt"
              className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Short description for search engines and previews..."
              value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">Cover Image URL</Label>
            <Input id="coverImageUrl" type="url" placeholder="https://..." value={form.coverImageUrl}
              onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <textarea id="content"
              className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              placeholder="Write your blog post content here (Markdown supported)..."
              value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              onClick={() => setForm({ ...form, status: "DRAFT" })}
              variant="outline"
            >
              {loading ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="submit"
              disabled={loading}
              onClick={() => setForm({ ...form, status: "PUBLISHED" })}
            >
              {loading ? "Publishing..." : "Publish"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
