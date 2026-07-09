"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  createBookingAction,
  updateBookingStatusAction,
  cancelBookingAction,
} from "@/features/bookings/actions/booking-actions";

type Booking = {
  id: string;
  status: string;
  date: Date;
  startTime: string;
  endTime: string;
  price: number | string;
  notes: string | null;
  user: { id: string; name: string | null; email: string };
  service: { name: string; duration: number };
};

type Service = { id: string; name: string; price: number | string; duration: number };
type Client = { id: string; user: { id: string; name: string | null; email: string } };

const STATUS_OPTIONS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  NO_SHOW: "bg-gray-100 text-gray-800 border-gray-200",
};

interface Props {
  bookings: Booking[];
  stats: { upcoming: number; pending: number; completed: number };
  services: Service[];
  clients: Client[];
  tenantId: string;
}

export function BookingsClient({ bookings, stats, services, clients, tenantId }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: "",
    serviceId: "",
    date: "",
    startTime: "",
    endTime: "",
    price: "",
    notes: "",
  });
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "ALL") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.userId || !createForm.serviceId || !createForm.date || !createForm.startTime) {
      toast.error("Fill in all required fields");
      return;
    }
    setCreating(true);
    try {
      await createBookingAction(tenantId, {
        userId: createForm.userId,
        serviceId: createForm.serviceId,
        date: createForm.date,
        startTime: createForm.startTime,
        endTime: createForm.endTime || createForm.startTime,
        price: parseFloat(createForm.price) || 0,
        notes: createForm.notes || undefined,
      });
      toast.success("Booking created");
      setShowCreate(false);
      setCreateForm({ userId: "", serviceId: "", date: "", startTime: "", endTime: "", price: "", notes: "" });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create booking");
    } finally {
      setCreating(false);
    }
  }

  async function handleStatus(bookingId: string, status: "CONFIRMED" | "COMPLETED" | "NO_SHOW") {
    setUpdatingId(bookingId);
    try {
      await updateBookingStatusAction(tenantId, bookingId, status);
      toast.success(`Booking ${status.toLowerCase()}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleCancel(bookingId: string) {
    if (!confirm("Cancel this booking?")) return;
    setUpdatingId(bookingId);
    try {
      await cancelBookingAction(tenantId, bookingId);
      toast.success("Booking cancelled");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to cancel");
    } finally {
      setUpdatingId(null);
    }
  }

  // Auto-fill price when service is selected
  function handleServiceChange(serviceId: string) {
    const service = services.find((s) => s.id === serviceId);
    setCreateForm({
      ...createForm,
      serviceId,
      price: service ? String(Number(service.price)) : "",
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage client bookings and appointments.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 me-2" />New Booking
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Upcoming", value: stats.upcoming, icon: Calendar },
          { label: "Pending", value: stats.pending, icon: Clock },
          { label: "Completed", value: stats.completed, icon: CheckCircle },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Client *</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={createForm.userId}
                  onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                  required
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.user.id} value={c.user.id}>
                      {c.user.name ?? c.user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Service *</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={createForm.serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  required
                >
                  <option value="">Select service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {s.duration}min · ${Number(s.price)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Date *</Label>
                <Input
                  type="date"
                  value={createForm.date}
                  onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={createForm.price}
                  onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Start Time *</Label>
                <Input
                  type="time"
                  value={createForm.startTime}
                  onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Time</Label>
                <Input
                  type="time"
                  value={createForm.endTime}
                  onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-xs">Notes</Label>
                <Input
                  placeholder="Optional notes..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Booking"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {s === "ALL" ? "All" : s}
            {s !== "ALL" && (
              <span className="ms-1 text-xs opacity-70">
                ({bookings.filter((b) => b.status === s).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Bookings list */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === "ALL" ? "All Bookings" : filter} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {filtered.map((b) => (
            <div key={b.id} className="py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{b.user.name ?? b.user.email}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[b.status] ?? ""}`}>
                    {b.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {b.service.name} · {new Date(b.date).toLocaleDateString()} {b.startTime}–{b.endTime}
                </p>
                {b.notes && <p className="text-xs text-muted-foreground mt-1">{b.notes}</p>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{formatCurrency(Number(b.price))}</span>
                {b.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatus(b.id, "CONFIRMED")}
                    disabled={updatingId === b.id}
                    className="h-7 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 me-1" />Confirm
                  </Button>
                )}
                {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatus(b.id, "COMPLETED")}
                      disabled={updatingId === b.id}
                      className="h-7 text-xs"
                    >
                      Done
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatus(b.id, "NO_SHOW")}
                      disabled={updatingId === b.id}
                      className="h-7 text-xs"
                    >
                      <AlertCircle className="h-3 w-3 me-1" />No Show
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancel(b.id)}
                      disabled={updatingId === b.id}
                      className="h-7 text-xs"
                    >
                      <XCircle className="h-3 w-3 me-1" />Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground py-8 text-center">
              No {filter === "ALL" ? "" : filter.toLowerCase()} bookings.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
