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
  createFranchiseLocationAction,
  updateFranchiseLocationAction,
  deleteFranchiseLocationAction,
} from "@/features/enterprise/actions/enterprise-actions";

type FranchiseLocation = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  managerName: string | null;
  isActive: boolean;
  createdAt: Date;
};

export function FranchiseModule({
  tenantId,
  initialLocations,
}: {
  tenantId: string;
  initialLocations: FranchiseLocation[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<FranchiseLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    managerName: "",
  });

  function openCreate() {
    setEditingLocation(null);
    setForm({ name: "", address: "", city: "", country: "", phone: "", managerName: "" });
    setOpen(true);
  }

  function openEdit(loc: FranchiseLocation) {
    setEditingLocation(loc);
    setForm({
      name: loc.name,
      address: loc.address ?? "",
      city: loc.city ?? "",
      country: loc.country ?? "",
      phone: loc.phone ?? "",
      managerName: loc.managerName ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = {
      name: form.name,
      address: form.address || undefined,
      city: form.city || undefined,
      country: form.country || undefined,
      phone: form.phone || undefined,
      managerName: form.managerName || undefined,
    };
    const result = editingLocation
      ? await updateFranchiseLocationAction(tenantId, editingLocation.id, data)
      : await createFranchiseLocationAction(tenantId, data);
    setLoading(false);
    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleToggleActive(loc: FranchiseLocation) {
    await updateFranchiseLocationAction(tenantId, loc.id, { isActive: !loc.isActive });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this location?")) return;
    await deleteFranchiseLocationAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Franchise Locations</h2>
          <p className="text-sm text-muted-foreground">
            {initialLocations.filter((l) => l.isActive).length} active locations
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Add Location</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLocation ? "Edit Location" : "Add Location"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Location Name</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Downtown Branch"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Cairo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="Egypt"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Manager</Label>
                  <Input
                    value={form.managerName}
                    onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                    placeholder="Manager name"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : editingLocation ? "Update" : "Add Location"}
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
              <th className="px-4 py-3 text-left font-medium">Location</th>
              <th className="px-4 py-3 text-left font-medium">Manager</th>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialLocations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No locations yet.
                </td>
              </tr>
            )}
            {initialLocations.map((loc) => (
              <tr key={loc.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{loc.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {[loc.city, loc.country].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">{loc.managerName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{loc.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={loc.isActive ? "default" : "secondary"}>
                    {loc.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(loc)}>Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggleActive(loc)}>
                      {loc.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(loc.id)}>
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
