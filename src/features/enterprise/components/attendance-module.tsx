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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { checkInAction, checkOutAction } from "@/features/enterprise/actions/enterprise-actions";
import type { AttendanceMethod } from "@prisma/client";

type AttendanceRecord = {
  id: string;
  method: AttendanceMethod;
  checkedInAt: Date;
  checkedOutAt: Date | null;
  location: string | null;
  notes: string | null;
  client: { user: { name: string } } | null;
};

const METHODS: AttendanceMethod[] = ["QR", "BARCODE", "NFC", "MANUAL"];

export function AttendanceModule({
  tenantId,
  initialRecords,
}: {
  tenantId: string;
  initialRecords: AttendanceRecord[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    method: "MANUAL" as AttendanceMethod,
    location: "",
    notes: "",
  });

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await checkInAction(tenantId, {
      method: form.method,
      location: form.location || undefined,
      notes: form.notes || undefined,
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setForm({ method: "MANUAL", location: "", notes: "" });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleCheckOut(recordId: string) {
    await checkOutAction(tenantId, recordId);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Attendance Records</h2>
          <p className="text-sm text-muted-foreground">{initialRecords.length} records</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Manual Check-in</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Check-in</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div className="space-y-2">
                <Label>Check-in Method</Label>
                <Select
                  value={form.method}
                  onValueChange={(v) => setForm({ ...form, method: v as AttendanceMethod })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Main Gym Floor"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Recording..." : "Check In"}
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
              <th className="px-4 py-3 text-left font-medium">Client</th>
              <th className="px-4 py-3 text-left font-medium">Method</th>
              <th className="px-4 py-3 text-left font-medium">Check-in</th>
              <th className="px-4 py-3 text-left font-medium">Check-out</th>
              <th className="px-4 py-3 text-left font-medium">Location</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialRecords.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No attendance records yet.
                </td>
              </tr>
            )}
            {initialRecords.map((rec) => (
              <tr key={rec.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">{rec.client?.user.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{rec.method}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(rec.checkedInAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {rec.checkedOutAt ? new Date(rec.checkedOutAt).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{rec.location ?? "—"}</td>
                <td className="px-4 py-3">
                  {!rec.checkedOutAt && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckOut(rec.id)}
                    >
                      Check Out
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
