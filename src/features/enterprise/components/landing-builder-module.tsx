"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createLandingPageAction,
  updateLandingPageAction,
  deleteLandingPageAction,
} from "@/features/enterprise/actions/enterprise-actions";

type LandingPage = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
};

const STATUS_OPTIONS: ("DRAFT" | "PUBLISHED" | "ARCHIVED")[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export function LandingBuilderModule({
  tenantId,
  initialPages,
}: {
  tenantId: string;
  initialPages: LandingPage[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", seoTitle: "", seoDescription: "" });

  function openCreate() {
    setForm({ title: "", seoTitle: "", seoDescription: "" });
    setOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createLandingPageAction(tenantId, {
      title: form.title,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setForm({ title: "", seoTitle: "", seoDescription: "" });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleStatusChange(id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    await updateLandingPageAction(tenantId, id, { status });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this landing page?")) return;
    await deleteLandingPageAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Landing Pages</h2>
          <p className="text-sm text-muted-foreground">
            {initialPages.filter((p) => p.status === "PUBLISHED").length} published
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>New Page</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Landing Page</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Summer Campaign 2024"
                />
              </div>
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input
                  value={form.seoTitle}
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  placeholder="Join our summer fitness challenge"
                />
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Input
                  value={form.seoDescription}
                  onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                  placeholder="Transform your body this summer..."
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Page"}
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
              <th className="px-4 py-3 text-left font-medium">Slug</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialPages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No landing pages yet.
                </td>
              </tr>
            )}
            {initialPages.map((page) => (
              <tr key={page.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{page.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{page.slug}</td>
                <td className="px-4 py-3">
                  <Select
                    value={page.status}
                    onValueChange={(v) => handleStatusChange(page.id, v as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
                  >
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(page.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(page.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
