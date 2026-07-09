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
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
} from "@/features/enterprise/actions/enterprise-actions";

type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  isDefault: boolean;
  createdAt: Date;
};

export function MultiBrandModule({
  tenantId,
  initialBrands,
}: {
  tenantId: string;
  initialBrands: Brand[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    primaryColor: "#000000",
  });

  function openCreate() {
    setEditingBrand(null);
    setForm({ name: "", logoUrl: "", primaryColor: "#000000" });
    setOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditingBrand(brand);
    setForm({
      name: brand.name,
      logoUrl: brand.logoUrl ?? "",
      primaryColor: brand.primaryColor ?? "#000000",
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
      primaryColor: form.primaryColor || undefined,
    };
    const result = editingBrand
      ? await updateBrandAction(tenantId, editingBrand.id, data)
      : await createBrandAction(tenantId, data);
    setLoading(false);
    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this brand?")) return;
    await deleteBrandAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Brands</h2>
          <p className="text-sm text-muted-foreground">{initialBrands.length} brands</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Add Brand</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBrand ? "Edit Brand" : "Add Brand"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Brand Name</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Brand name"
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
                <Label>Primary Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="h-9 w-12 cursor-pointer rounded border"
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingBrand ? "Update" : "Create Brand"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {initialBrands.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No brands yet. Add your first brand.
          </div>
        )}
        {initialBrands.map((brand) => (
          <div key={brand.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {brand.primaryColor && (
                  <div
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: brand.primaryColor }}
                  />
                )}
                <div>
                  <div className="font-medium">{brand.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{brand.slug}</div>
                </div>
              </div>
              {brand.isDefault && <Badge>Default</Badge>}
            </div>
            {brand.logoUrl && (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(brand)}>
                Edit
              </Button>
              {!brand.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDelete(brand.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
