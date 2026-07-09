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
  createPayrollRecordAction,
  markPayrollPaidAction,
} from "@/features/enterprise/actions/enterprise-actions";

type PayrollRecord = {
  id: string;
  staffName: string;
  periodStart: Date;
  periodEnd: Date;
  baseSalary: number | string;
  commission: number | string;
  deductions: number | string;
  netPay: number | string;
  currency: string;
  status: string;
  paidAt: Date | null;
};

export function PayrollModule({
  tenantId,
  initialRecords,
}: {
  tenantId: string;
  initialRecords: PayrollRecord[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    staffName: "",
    periodStart: "",
    periodEnd: "",
    baseSalary: "",
    commission: "0",
    deductions: "0",
    currency: "USD",
  });

  const netPay =
    (Number(form.baseSalary) || 0) +
    (Number(form.commission) || 0) -
    (Number(form.deductions) || 0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createPayrollRecordAction(tenantId, {
      staffName: form.staffName,
      periodStart: new Date(form.periodStart),
      periodEnd: new Date(form.periodEnd),
      baseSalary: Number(form.baseSalary),
      commission: Number(form.commission),
      deductions: Number(form.deductions),
      currency: form.currency,
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setForm({ staffName: "", periodStart: "", periodEnd: "", baseSalary: "", commission: "0", deductions: "0", currency: "USD" });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleMarkPaid(id: string) {
    await markPayrollPaidAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Payroll Records</h2>
          <p className="text-sm text-muted-foreground">
            {initialRecords.filter((r) => r.status === "pending").length} pending
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Payroll</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Payroll Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Staff Name</Label>
                <Input
                  required
                  value={form.staffName}
                  onChange={(e) => setForm({ ...form, staffName: e.target.value })}
                  placeholder="Staff member name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Period Start</Label>
                  <Input
                    type="date"
                    required
                    value={form.periodStart}
                    onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Period End</Label>
                  <Input
                    type="date"
                    required
                    value={form.periodEnd}
                    onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Base Salary</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={form.baseSalary}
                    onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    placeholder="USD"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Commission</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.commission}
                    onChange={(e) => setForm({ ...form, commission: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deductions</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.deductions}
                    onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                  />
                </div>
              </div>
              <div className="rounded-md bg-muted p-3 text-sm font-medium">
                Net Pay: {form.currency} {netPay.toFixed(2)}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Record"}
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
              <th className="px-4 py-3 text-left font-medium">Staff</th>
              <th className="px-4 py-3 text-left font-medium">Period</th>
              <th className="px-4 py-3 text-right font-medium">Base</th>
              <th className="px-4 py-3 text-right font-medium">Commission</th>
              <th className="px-4 py-3 text-right font-medium">Deductions</th>
              <th className="px-4 py-3 text-right font-medium">Net Pay</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialRecords.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No payroll records yet.
                </td>
              </tr>
            )}
            {initialRecords.map((rec) => (
              <tr key={rec.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{rec.staffName}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(rec.periodStart).toLocaleDateString()} –{" "}
                  {new Date(rec.periodEnd).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">{Number(rec.baseSalary).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">{Number(rec.commission).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-destructive">
                  {Number(rec.deductions).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {rec.currency} {Number(rec.netPay).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={rec.status === "paid" ? "default" : "secondary"}>
                    {rec.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {rec.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkPaid(rec.id)}
                    >
                      Mark Paid
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
