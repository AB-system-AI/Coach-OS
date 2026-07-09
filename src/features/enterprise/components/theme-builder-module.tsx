"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createThemeTemplateAction,
  applyThemeAction,
  deleteThemeTemplateAction,
} from "@/features/enterprise/actions/enterprise-actions";

type ThemeTemplate = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function ThemeBuilderModule({
  tenantId,
  initialThemes,
}: {
  tenantId: string;
  initialThemes: ThemeTemplate[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createThemeTemplateAction(tenantId, { name });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setName("");
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleApply(id: string) {
    if (!confirm("Apply this theme? It will replace the current active theme.")) return;
    setApplyingId(id);
    await applyThemeAction(tenantId, id);
    setApplyingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this theme?")) return;
    await deleteThemeTemplateAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Theme Templates</h2>
          <p className="text-sm text-muted-foreground">
            {initialThemes.find((t) => t.isActive)?.name ?? "No active theme"}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New Theme</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Theme</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Theme Name</Label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dark Pro, Minimal Light..."
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Theme"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {initialThemes.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No themes yet.
          </div>
        )}
        {initialThemes.map((theme) => (
          <div
            key={theme.id}
            className={`border rounded-lg p-4 space-y-3 ${theme.isActive ? "border-primary bg-primary/5" : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">{theme.name}</div>
              {theme.isActive && <Badge>Active</Badge>}
            </div>
            <div className="text-xs text-muted-foreground">
              Updated {new Date(theme.updatedAt).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              {!theme.isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApply(theme.id)}
                  disabled={applyingId === theme.id}
                >
                  {applyingId === theme.id ? "Applying..." : "Apply Theme"}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => handleDelete(theme.id)}
                disabled={theme.isActive}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
