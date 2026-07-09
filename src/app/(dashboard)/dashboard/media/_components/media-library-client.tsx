"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, FileIcon, Image as ImageIcon, Video, FileText, Upload } from "lucide-react";
import { bytesToReadable } from "@/lib/utils";
import { validateFile } from "@/lib/uploads/validate";

type MediaFile = {
  id: string;
  name: string;
  url: string;
  mimeType: string | null;
  sizeBytes: bigint | null;
  category: string;
  createdAt: Date;
};

type StorageCategory = { category: string; label: string; description: string };

interface Props {
  usage: { usedBytes: number; limitBytes: number; usedPercent: number; byCategory: Array<{ category: string; count: number; sizeBytes: number }> };
  mediaFiles: MediaFile[];
  tenantId: string;
  storageCategories: StorageCategory[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  IMAGE: <ImageIcon className="h-4 w-4" />,
  VIDEO: <Video className="h-4 w-4" />,
  PDF: <FileText className="h-4 w-4" />,
  DOCUMENT: <FileText className="h-4 w-4" />,
  EXERCISE_FILE: <FileIcon className="h-4 w-4" />,
  GENERAL: <FileIcon className="h-4 w-4" />,
};

export function MediaLibraryClient({ usage, mediaFiles, tenantId, storageCategories }: Props) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [addForm, setAddForm] = useState({
    name: "", url: "", mimeType: "", sizeBytes: "", category: "GENERAL",
  });
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = filterCategory === "ALL"
    ? mediaFiles
    : mediaFiles.filter((f) => f.category === filterCategory);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.url.trim()) {
      toast.error("Name and URL are required");
      return;
    }
    if (addForm.mimeType) {
      const sizeBytes = parseInt(addForm.sizeBytes) || 0;
      const validation = validateFile(addForm.mimeType, sizeBytes);
      if (!validation.valid) {
        toast.error(validation.error!);
        return;
      }
    }
    setAdding(true);
    try {
      const res = await fetch("/api/v1/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          name: addForm.name,
          url: addForm.url,
          mimeType: addForm.mimeType || null,
          sizeBytes: addForm.sizeBytes ? parseInt(addForm.sizeBytes) : null,
          category: addForm.category,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to add media");
      }
      toast.success("File added to media library");
      setAddForm({ name: "", url: "", mimeType: "", sizeBytes: "", category: "GENERAL" });
      setShowAdd(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file from the library?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("File deleted");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  const usedPercent = Math.min(usage.usedPercent, 100);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground mt-1">
            Cloud storage for images, videos, documents, and exercise files.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 me-2" />Add File
        </Button>
      </div>

      {/* Storage usage bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Storage Used</span>
            <span className="text-muted-foreground">
              {bytesToReadable(usage.usedBytes)} / {bytesToReadable(usage.limitBytes)}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${usedPercent > 90 ? "bg-destructive" : usedPercent > 70 ? "bg-yellow-500" : "bg-primary"}`}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {usage.byCategory.map((c) => (
              <div key={c.category} className="text-xs">
                <span className="font-medium">{c.category}</span>
                <span className="text-muted-foreground ms-1">
                  {c.count} files · {bytesToReadable(c.sizeBytes)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add form */}
      {showAdd && (
        <Card>
          <CardHeader><CardTitle className="text-base">Add File (URL)</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">File Name *</Label>
                <Input placeholder="my-photo.jpg" value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">URL *</Label>
                <Input placeholder="https://..." value={addForm.url}
                  onChange={(e) => setAddForm({ ...addForm, url: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">MIME Type</Label>
                <Input placeholder="image/jpeg" value={addForm.mimeType}
                  onChange={(e) => setAddForm({ ...addForm, mimeType: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Size (bytes)</Label>
                <Input type="number" placeholder="0" value={addForm.sizeBytes}
                  onChange={(e) => setAddForm({ ...addForm, sizeBytes: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-xs">Category</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                >
                  <option value="GENERAL">General</option>
                  {storageCategories.map((c) => (
                    <option key={c.category} value={c.category}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" disabled={adding}>{adding ? "Adding..." : "Add to Library"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={filterCategory === "ALL" ? "default" : "outline"} onClick={() => setFilterCategory("ALL")}>
          All ({mediaFiles.length})
        </Button>
        {storageCategories.map((cat) => {
          const count = mediaFiles.filter((f) => f.category === cat.category).length;
          return (
            <Button key={cat.category} size="sm" variant={filterCategory === cat.category ? "default" : "outline"}
              onClick={() => setFilterCategory(cat.category)}>
              {cat.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Media grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((file) => (
          <Card key={file.id} className="group overflow-hidden">
            <div className="relative aspect-video bg-muted flex items-center justify-center">
              {file.mimeType?.startsWith("image/") ? (
                <img src={file.url} alt={file.name} className="object-cover w-full h-full" />
              ) : (
                <div className="text-muted-foreground">
                  {CATEGORY_ICONS[file.category] ?? <FileIcon className="h-8 w-8" />}
                </div>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(file.id)}
                disabled={deletingId === file.id}
                className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <CardContent className="p-3">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{file.category}</Badge>
                {file.sizeBytes != null && (
                  <span className="text-xs text-muted-foreground">{bytesToReadable(Number(file.sizeBytes))}</span>
                )}
              </div>
              <a href={file.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-1 inline-block">
                Open ↗
              </a>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No files yet. Add your first file above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
