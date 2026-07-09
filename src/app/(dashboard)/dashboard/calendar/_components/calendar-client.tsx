"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar } from "lucide-react";
import {
  createCalendarEventAction,
  deleteCalendarEventAction,
} from "@/features/calendar/actions/calendar-actions";

type Booking = {
  id: string;
  date: Date;
  startTime: string;
  status: string;
  user: { name: string | null; email: string };
  service: { name: string };
};

type CalendarEvent = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  description: string | null;
  color: string | null;
};

interface Props {
  bookings: Booking[];
  events: CalendarEvent[];
  tenantId: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

export function CalendarClient({ bookings, events, tenantId }: Props) {
  const router = useRouter();
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    title: "", description: "", startAt: "", endAt: "", color: "#6366f1",
  });
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  // Group items by date string "YYYY-MM-DD"
  const itemsByDate = useMemo(() => {
    const map: Record<string, Array<{ id: string; title: string; type: "booking" | "event"; status?: string; color?: string | null }>> = {};
    for (const b of bookings) {
      const key = new Date(b.date).toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push({
        id: b.id,
        title: `${b.user.name ?? b.user.email} — ${b.service.name}`,
        type: "booking",
        status: b.status,
      });
    }
    for (const e of events) {
      const key = new Date(e.startAt).toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push({ id: e.id, title: e.title, type: "event", color: e.color });
    }
    return map;
  }, [bookings, events]);

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  }

  function handleDayClick(day: number) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.title || !createForm.startAt) { toast.error("Title and start date/time required"); return; }
    setCreating(true);
    try {
      await createCalendarEventAction(tenantId, {
        title: createForm.title,
        description: createForm.description || undefined,
        startAt: createForm.startAt,
        endAt: createForm.endAt || createForm.startAt,
        color: createForm.color,
      });
      toast.success("Event created");
      setShowCreate(false);
      setCreateForm({ title: "", description: "", startAt: "", endAt: "", color: "#6366f1" });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!confirm("Delete this event?")) return;
    setDeletingId(eventId);
    try {
      await deleteCalendarEventAction(tenantId, eventId);
      toast.success("Event deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  const selectedDateItems = selectedDate ? (itemsByDate[selectedDate] ?? []) : [];
  const allUpcoming = [...bookings.map(b => ({
    id: b.id,
    title: `${b.user.name ?? b.user.email} — ${b.service.name}`,
    date: new Date(b.date),
    type: "booking" as const,
    status: b.status,
  })), ...events.map(e => ({
    id: e.id,
    title: e.title,
    date: new Date(e.startAt),
    type: "event" as const,
    status: undefined,
    color: e.color,
  }))].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 20);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />Calendar
          </h1>
          <p className="text-muted-foreground mt-1">Bookings and scheduled events.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 me-2" />New Event
        </Button>
      </div>

      {/* Create event form */}
      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-base">New Calendar Event</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEvent} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-1">
                <Label className="text-xs">Event Title *</Label>
                <Input placeholder="e.g. Team meeting" value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Start *</Label>
                <Input type="datetime-local" value={createForm.startAt}
                  onChange={(e) => setCreateForm({ ...createForm, startAt: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End</Label>
                <Input type="datetime-local" value={createForm.endAt}
                  onChange={(e) => setCreateForm({ ...createForm, endAt: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label className="text-xs">Description</Label>
                <Input placeholder="Optional description..." value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Color</Label>
                <input type="color" value={createForm.color}
                  onChange={(e) => setCreateForm({ ...createForm, color: e.target.value })}
                  className="h-8 w-16 cursor-pointer rounded border" />
              </div>
              <div className="flex gap-3 md:col-span-2">
                <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create Event"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Month grid */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{MONTHS[currentMonth]} {currentYear}</CardTitle>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => { setCurrentYear(now.getFullYear()); setCurrentMonth(now.getMonth()); }}>
                  Today
                </Button>
                <Button size="sm" variant="ghost" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
              ))}
              {cells.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="min-h-[60px]" />;
                }
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const items = itemsByDate[dateStr] ?? [];
                const isToday = dateStr === now.toISOString().slice(0, 10);
                const isSelected = dateStr === selectedDate;
                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`min-h-[60px] p-1 rounded-md cursor-pointer border transition-colors ${
                      isSelected ? "bg-primary/10 border-primary" : isToday ? "border-primary/50 bg-primary/5" : "border-transparent hover:bg-muted/50"
                    }`}
                  >
                    <p className={`text-xs font-medium mb-1 ${isToday ? "text-primary" : ""}`}>{day}</p>
                    {items.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="text-[10px] px-1 py-0.5 rounded truncate mb-0.5"
                        style={{ backgroundColor: item.color ?? (item.type === "booking" ? "#e0f2fe" : "#ede9fe"), color: "#1e293b" }}
                      >
                        {item.title}
                      </div>
                    ))}
                    {items.length > 2 && (
                      <p className="text-[10px] text-muted-foreground">+{items.length - 2} more</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Side panel */}
        <div className="space-y-4">
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedDateItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nothing scheduled.</p>
                ) : (
                  selectedDateItems.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <Badge variant="outline" className="text-xs">{item.type}</Badge>
                        {item.status && <Badge variant="secondary" className="ms-1 text-xs">{item.status}</Badge>}
                      </div>
                      {item.type === "event" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEvent(item.id)}
                          disabled={deletingId === item.id}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Upcoming</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {allUpcoming.slice(0, 10).map((item) => (
                <div key={item.id} className="text-sm border-b pb-2 last:border-0">
                  <p className="font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.date.toLocaleDateString()} · {item.type}
                  </p>
                  {item.status && <Badge variant="outline" className="text-xs mt-0.5">{item.status}</Badge>}
                </div>
              ))}
              {allUpcoming.length === 0 && (
                <p className="text-muted-foreground text-sm">No upcoming items.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
