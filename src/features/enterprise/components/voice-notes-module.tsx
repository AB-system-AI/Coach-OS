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
import { createVoiceNoteAction, deleteVoiceNoteAction } from "@/features/enterprise/actions/enterprise-actions";
import type { VoiceNoteStatus } from "@prisma/client";

type VoiceNote = {
  id: string;
  title: string | null;
  audioUrl: string | null;
  transcript: string | null;
  durationSec: number | null;
  status: VoiceNoteStatus;
  createdAt: Date;
  user: { name: string };
};

const STATUS_VARIANT: Record<VoiceNoteStatus, "default" | "secondary" | "destructive" | "outline"> = {
  RECORDING: "outline",
  TRANSCRIBING: "secondary",
  COMPLETED: "default",
  FAILED: "destructive",
};

export function VoiceNotesModule({
  tenantId,
  userId,
  initialNotes,
}: {
  tenantId: string;
  userId: string;
  initialNotes: VoiceNote[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", audioUrl: "", durationSec: "" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createVoiceNoteAction(tenantId, userId, {
      title: form.title || undefined,
      audioUrl: form.audioUrl || undefined,
      durationSec: form.durationSec ? Number(form.durationSec) : undefined,
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setForm({ title: "", audioUrl: "", durationSec: "" });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this voice note?")) return;
    await deleteVoiceNoteAction(tenantId, id);
    router.refresh();
  }

  function formatDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Voice Notes</h2>
          <p className="text-sm text-muted-foreground">
            {initialNotes.filter((n) => n.status === "COMPLETED").length} transcribed
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Voice Note</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Voice Note</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Client session notes"
                />
              </div>
              <div className="space-y-2">
                <Label>Audio URL</Label>
                <Input
                  value={form.audioUrl}
                  onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                  placeholder="https://storage.example.com/audio.mp3"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (seconds)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.durationSec}
                  onChange={(e) => setForm({ ...form, durationSec: e.target.value })}
                  placeholder="120"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Note"}
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
              <th className="px-4 py-3 text-left font-medium">Recorded By</th>
              <th className="px-4 py-3 text-left font-medium">Duration</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialNotes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No voice notes yet.
                </td>
              </tr>
            )}
            {initialNotes.map((note) => (
              <tr key={note.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="font-medium">{note.title ?? "Untitled"}</div>
                  {note.transcript && (
                    <div className="text-xs text-muted-foreground line-clamp-1">{note.transcript}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{note.user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {note.durationSec != null ? formatDuration(note.durationSec) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[note.status]}>{note.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(note.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {note.audioUrl && (
                      <a href={note.audioUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">Play</Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(note.id)}
                    >
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
