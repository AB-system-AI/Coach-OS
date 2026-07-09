"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createInvoiceTemplateAction,
  updateInvoiceTemplateAction,
  deleteInvoiceTemplateAction,
} from "@/features/enterprise/actions/enterprise-actions";

type InvoiceTemplate = {
  id: string;
  name: string;
  logoUrl: string | null;
  showQr: boolean;
  taxRate: number | string | null;
  isDefault: boolean;
  createdAt: Date;
};

export function InvoiceDesignerModule({
  tenantId,
  initialTemplates,
}: {
  tenantId: string;
  initialTemplates: InvoiceTemplate[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", logoUrl: "", showQr: true, taxRate: "" });

  function openCreate() {
    setEditingTemplate(null);
    setForm({ name: "", logoUrl: "", showQr: true, taxRate: "" });
    setOpen(true);
  }

  function openEdit(tmpl: InvoiceTemplate) {
    setEditingTemplate(tmpl);
    setForm({
      name: tmpl.name,
      logoUrl: tmpl.logoUrl ?? "",
      showQr: tmpl.showQr,
      taxRate: tmpl.taxRate != null ? String(tmpl.taxRate) : "",
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = {
      name: form.name,
      logoUrl: form.logoUrl || undefined,
      showQr: form.showQr,
      taxRate: form.taxRate ? Number(form.taxRate) : undefined,
    };
    const result = editingTemplate
      ? await updateInvoiceTemplateAction(tenantId, editingTemplate.id, data)
      : await createInvoiceTemplateAction(tenantId, data);
    setLoading(false);
    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleSetDefault(id: string) {
    await updateInvoiceTemplateAction(tenantId, id, { isDefault: true });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this template?")) return;
    await deleteInvoiceTemplateAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Invoice Templates</h2>
          <p className="text-sm text-muted-foreground">{initialTemplates.length} templates</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>New Template</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTemplate ? "Edit Template" : "New Invoice Template"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Standard Invoice"
                />
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.showQr}
                  onCheckedChange={(v) => setForm({ ...form, showQr: v })}
                />
                <Label>Show QR Code on invoice</Label>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {initialTemplates.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No invoice templates yet.
          </div>
        )}
        {initialTemplates.map((tmpl) => (
          <div key={tmpl.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="font-medium">{tmpl.name}</div>
              {tmpl.isDefault && <Badge>Default</Badge>}
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Tax: {tmpl.taxRate != null ? `${Number(tmpl.taxRate).toFixed(2)}%` : "No tax"}</div>
              <div>QR Code: {tmpl.showQr ? "Yes" : "No"}</div>
            </div>
            {tmpl.logoUrl && (
              <img
                src={tmpl.logoUrl}
                alt="Logo"
                className="h-8 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(tmpl)}>Edit</Button>
              {!tmpl.isDefault && (
                <Button variant="outline" size="sm" onClick={() => handleSetDefault(tmpl.id)}>
                  Set Default
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(tmpl.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
