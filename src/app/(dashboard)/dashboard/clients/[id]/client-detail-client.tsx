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
import { Pencil, Plus, FileUp, Clock } from "lucide-react";
import { updateClientAction, addClientNoteAction, addClientFileAction } from "@/features/clients/actions/client-actions";

const GOAL_TYPES = ["WEIGHT_LOSS", "MUSCLE_GAIN", "FITNESS", "MAINTENANCE", "CUSTOM"];
const SUB_STATUSES = ["ACTIVE", "PAUSED", "EXPIRED", "CANCELLED"];

type Note = { id: string; content: string; createdAt: Date };
type File = { id: string; name: string; url: string; mimeType: string | null; createdAt: Date };
type Activity = { id: string; type: string; title: string; description: string | null; createdAt: Date };
type CheckIn = {
  id: string;
  weekStartDate: Date;
  status: string;
  weight: number | null;
  adherenceScore: number | null;
  notes: string | null;
};

type Client = {
  id: string;
  phone: string | null;
  goals: string | null;
  goalType: string | null;
  height: number | null;
  medicalNotes: string | null;
  subscriptionStatus: string;
  subscriptionEndDate: Date | null;
  isActive: boolean;
  joinedAt: Date;
  user: { id: string; name: string | null; email: string; image: string | null };
  notes: Note[];
  files: File[];
  activities: Activity[];
  weeklyCheckIns: CheckIn[];
};

export function ClientDetailClient({ client: initial, tenantId }: { client: Client; tenantId: string }) {
  const router = useRouter();
  const [client] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: initial.phone ?? "",
    goals: initial.goals ?? "",
    goalType: initial.goalType ?? "",
    height: initial.height?.toString() ?? "",
    medicalNotes: initial.medicalNotes ?? "",
    subscriptionStatus: initial.subscriptionStatus,
    isActive: initial.isActive,
  });
  const [saving, setSaving] = useState(false);

  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [fileForm, setFileForm] = useState({ name: "", url: "", mimeType: "" });
  const [addingFile, setAddingFile] = useState(false);
  const [showFileForm, setShowFileForm] = useState(false);

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await updateClientAction(tenantId, client.id, {
        phone: editForm.phone || undefined,
        goals: editForm.goals || undefined,
        goalType: (editForm.goalType as "WEIGHT_LOSS" | "MUSCLE_GAIN" | "FITNESS" | "MAINTENANCE" | "CUSTOM") || undefined,
        subscriptionStatus: editForm.subscriptionStatus as "ACTIVE" | "PAUSED" | "EXPIRED" | "CANCELLED",
        isActive: editForm.isActive,
      });
      toast.success("Profile updated");
      setEditing(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) { toast.error("Note cannot be empty"); return; }
    setAddingNote(true);
    try {
      await addClientNoteAction(tenantId, client.id, noteText.trim());
      toast.success("Note added");
      setNoteText("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  }

  async function handleAddFile() {
    if (!fileForm.name.trim() || !fileForm.url.trim()) {
      toast.error("Name and URL required");
      return;
    }
    setAddingFile(true);
    try {
      await addClientFileAction(tenantId, client.id, {
        name: fileForm.name,
        url: fileForm.url,
        mimeType: fileForm.mimeType || undefined,
      });
      toast.success("File added");
      setFileForm({ name: "", url: "", mimeType: "" });
      setShowFileForm(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add file");
    } finally {
      setAddingFile(false);
    }
  }

  const activityTypeColors: Record<string, string> = {
    ENROLLMENT: "bg-green-500",
    NOTE: "bg-blue-500",
    BOOKING: "bg-purple-500",
    CHECK_IN: "bg-yellow-500",
    PROGRAM_ASSIGNED: "bg-orange-500",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/dashboard/clients" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to clients
          </Link>
          <h1 className="text-3xl font-bold mt-2">{client.user.name ?? "Client"}</h1>
          <p className="text-muted-foreground">{client.user.email}</p>
          <div className="flex gap-2 mt-2">
            <Badge>{client.subscriptionStatus}</Badge>
            <Badge variant={client.isActive ? "default" : "secondary"}>
              {client.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 me-1" />Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Phone</Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+1 555 000 0000"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Goals</Label>
                  <textarea
                    className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    rows={2}
                    value={editForm.goals}
                    onChange={(e) => setEditForm({ ...editForm, goals: e.target.value })}
                    placeholder="Client goals..."
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Goal Type</Label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={editForm.goalType}
                    onChange={(e) => setEditForm({ ...editForm, goalType: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {GOAL_TYPES.map((g) => (
                      <option key={g} value={g}>{g.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Height (cm)</Label>
                  <Input
                    type="number"
                    value={editForm.height}
                    onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Subscription Status</Label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={editForm.subscriptionStatus}
                    onChange={(e) => setEditForm({ ...editForm, subscriptionStatus: e.target.value })}
                  >
                    {SUB_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Medical Notes</Label>
                  <textarea
                    className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    rows={2}
                    value={editForm.medicalNotes}
                    onChange={(e) => setEditForm({ ...editForm, medicalNotes: e.target.value })}
                    placeholder="Allergies, injuries, medications..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isActive" className="text-sm">Active client</Label>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <dl className="space-y-3 text-sm">
                {[
                  { label: "Phone", value: client.phone ?? "—" },
                  { label: "Goal Type", value: client.goalType?.replace(/_/g, " ") ?? "—" },
                  { label: "Height", value: client.height ? `${client.height} cm` : "—" },
                  { label: "Joined", value: new Date(client.joinedAt).toLocaleDateString() },
                  ...(client.subscriptionEndDate
                    ? [{ label: "Sub ends", value: new Date(client.subscriptionEndDate).toLocaleDateString() }]
                    : []),
                  ...(client.medicalNotes ? [{ label: "Medical Notes", value: client.medicalNotes }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right max-w-[60%] break-words">{value}</dd>
                  </div>
                ))}
                {client.goals && (
                  <div>
                    <dt className="text-muted-foreground mb-1">Goals</dt>
                    <dd className="text-sm">{client.goals}</dd>
                  </div>
                )}
              </dl>
            )}
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {client.activities.length === 0 ? (
              <p className="text-muted-foreground text-sm">No activity yet.</p>
            ) : (
              client.activities.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${activityTypeColors[a.type] ?? "bg-muted-foreground"}`} />
                  <div>
                    <p className="font-medium text-sm">{a.title}</p>
                    {a.description && (
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.type} · {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Check-ins */}
      {client.weeklyCheckIns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {client.weeklyCheckIns.map((c) => (
              <div key={c.id} className="py-3 flex justify-between text-sm">
                <div>
                  <p className="font-medium">Week of {new Date(c.weekStartDate).toLocaleDateString()}</p>
                  <p className="text-muted-foreground text-xs">
                    {c.weight != null && `Weight: ${c.weight} kg · `}
                    {c.adherenceScore != null && `Adherence: ${c.adherenceScore}/10`}
                  </p>
                  {c.notes && <p className="text-xs mt-1">{c.notes}</p>}
                </div>
                <Badge variant={c.status === "REVIEWED" ? "success" : "secondary"}>{c.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes ({client.notes.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Add note */}
            <div className="space-y-2">
              <textarea
                className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Add a note about this client..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <Button size="sm" onClick={handleAddNote} disabled={addingNote} className="w-full">
                <Plus className="h-4 w-4 me-1" />{addingNote ? "Adding..." : "Add Note"}
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {client.notes.map((n) => (
                <div key={n.id} className="rounded-lg border p-3 text-sm">
                  <p>{n.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {client.notes.length === 0 && (
                <p className="text-muted-foreground text-sm">No notes yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Files */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Files ({client.files.length})</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowFileForm(!showFileForm)}>
                <FileUp className="h-4 w-4 me-1" />Add File
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showFileForm && (
              <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
                <p className="text-xs font-medium">Add File (URL)</p>
                <Input
                  placeholder="File name *"
                  value={fileForm.name}
                  onChange={(e) => setFileForm({ ...fileForm, name: e.target.value })}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="File URL *"
                  value={fileForm.url}
                  onChange={(e) => setFileForm({ ...fileForm, url: e.target.value })}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="MIME type (e.g. application/pdf)"
                  value={fileForm.mimeType}
                  onChange={(e) => setFileForm({ ...fileForm, mimeType: e.target.value })}
                  className="h-8 text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddFile} disabled={addingFile}>
                    {addingFile ? "Adding..." : "Add"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowFileForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {client.files.map((f) => (
                <a
                  key={f.id}
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted"
                >
                  <span className="font-medium">{f.name}</span>
                  <span className="text-xs text-muted-foreground">{f.mimeType ?? "file"}</span>
                </a>
              ))}
              {client.files.length === 0 && (
                <p className="text-muted-foreground text-sm">No files uploaded.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
