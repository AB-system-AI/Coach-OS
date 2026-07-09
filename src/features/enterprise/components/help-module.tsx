"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  createKnowledgeArticleAction,
  updateKnowledgeArticleAction,
  deleteKnowledgeArticleAction,
} from "@/features/enterprise/actions/enterprise-actions";

type Article = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  isPublished: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export function HelpModule({
  tenantId,
  initialArticles,
}: {
  tenantId: string;
  initialArticles: Article[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    isPublished: false,
  });

  function openCreate() {
    setEditingArticle(null);
    setForm({ title: "", content: "", category: "", isPublished: false });
    setOpen(true);
  }

  function openEdit(article: Article) {
    setEditingArticle(article);
    setForm({
      title: article.title,
      content: article.content,
      category: article.category ?? "",
      isPublished: article.isPublished,
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = {
      title: form.title,
      content: form.content,
      category: form.category || undefined,
      isPublished: form.isPublished,
    };
    const result = editingArticle
      ? await updateKnowledgeArticleAction(tenantId, editingArticle.id, data)
      : await createKnowledgeArticleAction(tenantId, data);
    setLoading(false);
    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this article?")) return;
    await deleteKnowledgeArticleAction(tenantId, id);
    router.refresh();
  }

  async function handleTogglePublish(article: Article) {
    await updateKnowledgeArticleAction(tenantId, article.id, {
      isPublished: !article.isPublished,
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Knowledge Base</h2>
          <p className="text-sm text-muted-foreground">
            {initialArticles.filter((a) => a.isPublished).length} published articles
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>New Article</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingArticle ? "Edit Article" : "New Knowledge Article"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Article title"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Getting Started, Billing, Technical"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  required
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Article content..."
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.isPublished}
                  onCheckedChange={(v) => setForm({ ...form, isPublished: v })}
                />
                <Label>Publish immediately</Label>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingArticle ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-right font-medium">Views</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialArticles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No articles yet.
                </td>
              </tr>
            )}
            {initialArticles.map((article) => (
              <tr key={article.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{article.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{article.category ?? "—"}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{article.viewCount}</td>
                <td className="px-4 py-3">
                  <Badge variant={article.isPublished ? "default" : "secondary"}>
                    {article.isPublished ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(article)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublish(article)}
                    >
                      {article.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(article.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
