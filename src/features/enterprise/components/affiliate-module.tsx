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
  createAffiliateAction,
  updateAffiliateStatusAction,
  deleteAffiliateAction,
} from "@/features/enterprise/actions/enterprise-actions";
import type { AffiliateStatus } from "@prisma/client";

type Affiliate = {
  id: string;
  affiliateCode: string;
  referrerName: string | null;
  referrerEmail: string | null;
  status: AffiliateStatus;
  commissionRate: number | string;
  totalEarnings: number | string;
  createdAt: Date;
};

const STATUSES: AffiliateStatus[] = ["PENDING", "ACTIVE", "SUSPENDED"];

export function AffiliateModule({
  tenantId,
  initialAffiliates,
}: {
  tenantId: string;
  initialAffiliates: Affiliate[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    affiliateCode: "",
    referrerName: "",
    referrerEmail: "",
    commissionRate: "10",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createAffiliateAction(tenantId, {
      affiliateCode: form.affiliateCode,
      referrerName: form.referrerName || undefined,
      referrerEmail: form.referrerEmail || undefined,
      commissionRate: Number(form.commissionRate),
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setForm({ affiliateCode: "", referrerName: "", referrerEmail: "", commissionRate: "10" });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleStatusChange(id: string, status: AffiliateStatus) {
    await updateAffiliateStatusAction(tenantId, id, status);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this affiliate?")) return;
    await deleteAffiliateAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Affiliates</h2>
          <p className="text-sm text-muted-foreground">
            {initialAffiliates.filter((a) => a.status === "ACTIVE").length} active
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Affiliate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Affiliate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Affiliate Code</Label>
                <Input
                  required
                  value={form.affiliateCode}
                  onChange={(e) => setForm({ ...form, affiliateCode: e.target.value })}
                  placeholder="PARTNER2024"
                />
              </div>
              <div className="space-y-2">
                <Label>Referrer Name</Label>
                <Input
                  value={form.referrerName}
                  onChange={(e) => setForm({ ...form, referrerName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Referrer Email</Label>
                <Input
                  type="email"
                  value={form.referrerEmail}
                  onChange={(e) => setForm({ ...form, referrerEmail: e.target.value })}
                  placeholder="affiliate@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Commission Rate (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={form.commissionRate}
                  onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Affiliate"}
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
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-left font-medium">Referrer</th>
              <th className="px-4 py-3 text-left font-medium">Commission</th>
              <th className="px-4 py-3 text-right font-medium">Total Earned</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialAffiliates.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No affiliates yet.
                </td>
              </tr>
            )}
            {initialAffiliates.map((aff) => (
              <tr key={aff.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-mono font-medium">{aff.affiliateCode}</td>
                <td className="px-4 py-3">
                  <div>{aff.referrerName ?? "—"}</div>
                  {aff.referrerEmail && (
                    <div className="text-xs text-muted-foreground">{aff.referrerEmail}</div>
                  )}
                </td>
                <td className="px-4 py-3">{Number(aff.commissionRate).toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">${Number(aff.totalEarnings).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <Select
                    value={aff.status}
                    onValueChange={(v) => handleStatusChange(aff.id, v as AffiliateStatus)}
                  >
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(aff.id)}
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
