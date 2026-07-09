"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Plus, Trash2, Pencil, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  updateRecoveryServiceAction,
  deleteRecoveryServiceAction,
  createRecoveryPackageAction,
  deleteRecoveryPackageAction,
} from "@/features/recovery/actions/recovery-actions";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number | string;
  capacity: number;
  isActive: boolean;
  _count: { bookings: number };
};

type RecoveryPackage = {
  id: string;
  name: string;
  description: string | null;
  sessions: number;
  price: number | string;
  validityDays: number | null;
  isActive: boolean;
};

interface Props {
  services: Service[];
  packages: RecoveryPackage[];
  stats: { services: number; packages: number };
  tenantId: string;
}

export function RecoveryClient({ services, packages, stats, tenantId }: Props) {
  const router = useRouter();
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", duration: "", capacity: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const [showAddPackage, setShowAddPackage] = useState(false);
  const [pkgForm, setPkgForm] = useState({ name: "", sessions: "", price: "", validityDays: "" });
  const [addingPkg, setAddingPkg] = useState(false);

  function startEdit(s: Service) {
    setEditingService(s.id);
    setEditForm({
      name: s.name,
      price: String(Number(s.price)),
      duration: String(s.duration),
      capacity: String(s.capacity),
      isActive: s.isActive,
    });
  }

  async function handleSaveService() {
    if (!editingService) return;
    setSaving(true);
    try {
      await updateRecoveryServiceAction(tenantId, editingService, {
        name: editForm.name,
        price: parseFloat(editForm.price),
        duration: parseInt(editForm.duration),
        capacity: parseInt(editForm.capacity),
        isActive: editForm.isActive,
      });
      toast.success("Service updated");
      setEditingService(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteService(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteRecoveryServiceAction(tenantId, id);
      toast.success("Service deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function handleToggleActive(id: string, current: boolean) {
    try {
      await updateRecoveryServiceAction(tenantId, id, { isActive: !current });
      toast.success(current ? "Service deactivated" : "Service activated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }

  async function handleAddPackage() {
    if (!pkgForm.name || !pkgForm.sessions || !pkgForm.price) {
      toast.error("Fill in name, sessions, and price");
      return;
    }
    setAddingPkg(true);
    try {
      await createRecoveryPackageAction(tenantId, {
        name: pkgForm.name,
        sessions: parseInt(pkgForm.sessions),
        price: parseFloat(pkgForm.price),
        validityDays: pkgForm.validityDays ? parseInt(pkgForm.validityDays) : undefined,
      });
      toast.success("Package created");
      setPkgForm({ name: "", sessions: "", price: "", validityDays: "" });
      setShowAddPackage(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setAddingPkg(false);
    }
  }

  async function handleDeletePackage(id: string, name: string) {
    if (!confirm(`Delete package "${name}"?`)) return;
    try {
      await deleteRecoveryPackageAction(tenantId, id);
      toast.success("Package deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recovery Services</h1>
          <p className="text-muted-foreground mt-1">
            Massage, sports massage, ice bath, stretching, cupping, rehabilitation.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/recovery/new">
            <Plus className="h-4 w-4 me-2" />Add Service
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Active Services", value: stats.services },
          { label: "Packages", value: stats.packages },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services ({services.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {services.map((s) => (
            <div key={s.id} className="py-4">
              {editingService === s.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Name</Label>
                      <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Price ($)</Label>
                      <Input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration (min)</Label>
                      <Input type="number" value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })} className="h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Capacity</Label>
                      <Input type="number" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} className="h-8" />
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <input type="checkbox" id={`active-${s.id}`} checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} className="h-4 w-4" />
                      <Label htmlFor={`active-${s.id}`} className="text-sm">Active</Label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveService} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingService(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                    <p className="text-sm text-muted-foreground">
                      {s.duration} min · Capacity {s.capacity} · {s._count.bookings} bookings
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{formatCurrency(Number(s.price))}</span>
                    <Badge
                      variant={s.isActive ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleToggleActive(s.id, s.isActive)}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => startEdit(s)} className="h-7 w-7 p-0">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteService(s.id, s.name)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {services.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">No services yet.</p>
              <Button asChild className="mt-3" size="sm">
                <Link href="/dashboard/recovery/new">Add your first service</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Packages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Session Packages ({packages.length})
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowAddPackage(!showAddPackage)}>
              <Plus className="h-4 w-4 me-1" />Add Package
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddPackage && (
            <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
              <p className="text-sm font-medium">New Package</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Name *</Label>
                  <Input placeholder="e.g. 10-Session Bundle" value={pkgForm.name}
                    onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Sessions *</Label>
                  <Input type="number" min="1" value={pkgForm.sessions}
                    onChange={(e) => setPkgForm({ ...pkgForm, sessions: e.target.value })} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Price ($) *</Label>
                  <Input type="number" step="0.01" value={pkgForm.price}
                    onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })} className="h-8" />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Validity (days)</Label>
                  <Input type="number" placeholder="e.g. 90" value={pkgForm.validityDays}
                    onChange={(e) => setPkgForm({ ...pkgForm, validityDays: e.target.value })} className="h-8" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddPackage} disabled={addingPkg}>{addingPkg ? "Adding..." : "Add"}</Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddPackage(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="divide-y">
            {packages.map((pkg) => (
              <div key={pkg.id} className="flex justify-between items-center py-3">
                <div>
                  <p className="font-medium">{pkg.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {pkg.sessions} sessions
                    {pkg.validityDays && ` · valid ${pkg.validityDays} days`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatCurrency(Number(pkg.price))}</span>
                  <Badge variant={pkg.isActive ? "default" : "secondary"}>{pkg.isActive ? "Active" : "Inactive"}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {packages.length === 0 && (
              <p className="text-muted-foreground text-sm py-4 text-center">No packages yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
