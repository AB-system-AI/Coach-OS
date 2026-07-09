"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  upsertCalendarSyncAction,
  disconnectCalendarSyncAction,
  createCalendarEventAction,
  deleteCalendarEventAction,
} from "@/features/enterprise/actions/enterprise-actions";
import type { CalendarSyncProvider } from "@prisma/client";

type CalendarSyncConnection = {
  id: string;
  provider: CalendarSyncProvider;
  isActive: boolean;
  lastSyncAt: Date | null;
  createdAt: Date;
};

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date;
  location: string | null;
  allDay: boolean;
  color: string | null;
};

const PROVIDERS: CalendarSyncProvider[] = ["GOOGLE", "OUTLOOK", "APPLE"];

export function SmartCalendarModule({
  tenantId,
  initialConnections,
  initialEvents,
}: {
  tenantId: string;
  initialConnections: CalendarSyncConnection[];
  initialEvents: CalendarEvent[];
}) {
  const router = useRouter();
  const [eventOpen, setEventOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<CalendarSyncProvider>("GOOGLE");
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    location: "",
    allDay: false,
    color: "#4f46e5",
  });

  const connectionMap = new Map(initialConnections.map((c) => [c.provider, c]));

  async function handleConnect(provider: CalendarSyncProvider) {
    await upsertCalendarSyncAction(tenantId, provider);
    router.refresh();
  }

  async function handleDisconnect(id: string) {
    await disconnectCalendarSyncAction(tenantId, id);
    router.refresh();
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createCalendarEventAction(tenantId, {
      title: eventForm.title,
      description: eventForm.description || undefined,
      startAt: new Date(eventForm.startAt),
      endAt: new Date(eventForm.endAt),
      location: eventForm.location || undefined,
      allDay: eventForm.allDay,
      color: eventForm.color || undefined,
    });
    setLoading(false);
    if (result.success) {
      setEventOpen(false);
      setEventForm({ title: "", description: "", startAt: "", endAt: "", location: "", allDay: false, color: "#4f46e5" });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    await deleteCalendarEventAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Smart Calendar</h2>
        <p className="text-sm text-muted-foreground">
          Sync with external calendars and manage events.
        </p>
      </div>

      <Tabs defaultValue="sync">
        <TabsList>
          <TabsTrigger value="sync">Calendar Sync</TabsTrigger>
          <TabsTrigger value="events">Events ({initialEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {PROVIDERS.map((provider) => {
              const conn = connectionMap.get(provider);
              return (
                <div key={provider} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{provider}</div>
                    <Badge variant={conn?.isActive ? "default" : "secondary"}>
                      {conn?.isActive ? "Connected" : "Not connected"}
                    </Badge>
                  </div>
                  {conn?.lastSyncAt && (
                    <div className="text-xs text-muted-foreground">
                      Last sync: {new Date(conn.lastSyncAt).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    {conn?.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDisconnect(conn.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleConnect(provider)}>
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={eventOpen} onOpenChange={setEventOpen}>
              <DialogTrigger asChild>
                <Button>New Event</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Calendar Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      required
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="Event title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start</Label>
                      <Input
                        type="datetime-local"
                        required
                        value={eventForm.startAt}
                        onChange={(e) => setEventForm({ ...eventForm, startAt: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End</Label>
                      <Input
                        type="datetime-local"
                        required
                        value={eventForm.endAt}
                        onChange={(e) => setEventForm({ ...eventForm, endAt: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={eventForm.location}
                      onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                      placeholder="Room 1, Gym Floor..."
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={eventForm.allDay}
                      onCheckedChange={(v) => setEventForm({ ...eventForm, allDay: v })}
                    />
                    <Label>All day event</Label>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setEventOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Event"}
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
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Start</th>
                  <th className="px-4 py-3 text-left font-medium">End</th>
                  <th className="px-4 py-3 text-left font-medium">Location</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {initialEvents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No events yet.
                    </td>
                  </tr>
                )}
                {initialEvents.map((event) => (
                  <tr key={event.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {event.color && (
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: event.color }} />
                        )}
                        <span className="font-medium">{event.title}</span>
                        {event.allDay && <Badge variant="outline" className="text-xs">All day</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(event.startAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(event.endAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{event.location ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
