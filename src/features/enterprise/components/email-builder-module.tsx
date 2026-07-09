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
import {
  createEmailTemplateAction,
  updateEmailTemplateAction,
  deleteEmailTemplateAction,
} from "@/features/enterprise/actions/enterprise-actions";

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function EmailBuilderModule({
  tenantId,
  initialTemplates,
}: {
  tenantId: string;
  initialTemplates: EmailTemplate[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", subject: "", htmlContent: "" });

  function openCreate() {
    setEditingTemplate(null);
    setForm({ name: "", subject: "", htmlContent: "" });
    setOpen(true);
  }

  function openEdit(tmpl: EmailTemplate) {
    setEditingTemplate(tmpl);
    setForm({ name: tmpl.name, subject: tmpl.subject, htmlContent: tmpl.htmlContent });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = editingTemplate
      ? await updateEmailTemplateAction(tenantId, editingTemplate.id, form)
      : await createEmailTemplateAction(tenantId, form);
    setLoading(false);
    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleSetDefault(id: string) {
    await updateEmailTemplateAction(tenantId, id, { isDefault: true });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    await deleteEmailTemplateAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Email Templates</h2>
          <p className="text-sm text-muted-foreground">{initialTemplates.length} templates</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>New Template</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? "Edit Template" : "New Email Template"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Welcome Email"
                />
              </div>
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Welcome to {{gym_name}}!"
                />
              </div>
              <div className="space-y-2">
                <Label>HTML Content</Label>
                <Textarea
                  required
                  rows={10}
                  value={form.htmlContent}
                  onChange={(e) => setForm({ ...form, htmlContent: e.target.value })}
                  placeholder="<h1>Welcome!</h1><p>Thank you for joining us...</p>"
                  className="font-mono text-xs"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingTemplate ? "Update" : "Create"}
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
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Subject</th>
              <th className="px-4 py-3 text-left font-medium">Updated</th>
              <th className="px-4 py-3 text-left font-medium">Default</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialTemplates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No templates yet.
                </td>
              </tr>
            )}
            {initialTemplates.map((tmpl) => (
              <tr key={tmpl.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{tmpl.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{tmpl.subject}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(tmpl.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {tmpl.isDefault ? (
                    <Badge>Default</Badge>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(tmpl.id)}>
                      Set Default
                    </Button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(tmpl)}>Edit</Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(tmpl.id)}
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
