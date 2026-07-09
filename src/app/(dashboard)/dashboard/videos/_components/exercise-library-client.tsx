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
import { Plus, Trash2, Pencil, Dumbbell, Search } from "lucide-react";
import {
  updateExerciseAction,
  deleteExerciseAction,
} from "@/features/exercises/actions/exercise-actions";

const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Arms", "Core", "Legs", "Glutes", "Full Body", "Cardio"];
const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

type Exercise = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  muscleGroup: string | null;
  level: string | null;
  tips: string | null;
  equipment: string | null;
  duration: number | null;
};

interface Props {
  exercises: Exercise[];
  stats: { total: number };
  tenantId: string;
}

export function ExerciseLibraryClient({ exercises, stats, tenantId }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "", muscleGroup: "", level: "", tips: "", equipment: "", duration: "",
  });
  const [saving, setSaving] = useState(false);

  const filtered = exercises.filter((ex) => {
    const matchesSearch = search === "" ||
      ex.title.toLowerCase().includes(search.toLowerCase()) ||
      (ex.muscleGroup ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = filterMuscle === "ALL" || ex.muscleGroup === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  function startEdit(ex: Exercise) {
    setEditingId(ex.id);
    setEditForm({
      title: ex.title,
      muscleGroup: ex.muscleGroup ?? "",
      level: ex.level ?? "",
      tips: ex.tips ?? "",
      equipment: ex.equipment ?? "",
      duration: ex.duration?.toString() ?? "",
    });
  }

  async function handleSave(id: string) {
    setSaving(true);
    try {
      await updateExerciseAction(tenantId, id, {
        title: editForm.title,
        muscleGroup: editForm.muscleGroup || undefined,
        level: editForm.level || undefined,
        tips: editForm.tips || undefined,
        equipment: editForm.equipment || undefined,
        duration: editForm.duration ? parseInt(editForm.duration) : undefined,
      });
      toast.success("Exercise updated");
      setEditingId(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteExerciseAction(tenantId, id);
      toast.success("Exercise deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exercise Library</h1>
          <p className="text-muted-foreground mt-1">
            Database of exercises with muscle group, level, video, tips, and common mistakes.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/videos/new">
            <Plus className="h-4 w-4 me-2" />Add Exercise
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">Total Exercises</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={filterMuscle}
          onChange={(e) => setFilterMuscle(e.target.value)}
        >
          <option value="ALL">All muscle groups</option>
          {MUSCLE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((ex) => (
          <Card key={ex.id}>
            <CardContent className="pt-4">
              {editingId === ex.id ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Title</Label>
                    <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="h-8" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Muscle Group</Label>
                      <select className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={editForm.muscleGroup} onChange={(e) => setEditForm({ ...editForm, muscleGroup: e.target.value })}>
                        <option value="">None</option>
                        {MUSCLE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Level</Label>
                      <select className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}>
                        <option value="">None</option>
                        {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Equipment</Label>
                      <Input value={editForm.equipment} onChange={(e) => setEditForm({ ...editForm, equipment: e.target.value })} className="h-8" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duration (sec)</Label>
                      <Input type="number" value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })} className="h-8" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tips</Label>
                    <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm" rows={2}
                      value={editForm.tips} onChange={(e) => setEditForm({ ...editForm, tips: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave(ex.id)} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{ex.title}</p>
                    <div className="flex gap-1 shrink-0 ms-2">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(ex)} className="h-7 w-7 p-0">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(ex.id, ex.title)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {ex.muscleGroup && <Badge variant="outline" className="text-xs">{ex.muscleGroup}</Badge>}
                    {ex.level && <Badge variant="secondary" className="text-xs">{ex.level}</Badge>}
                    {ex.equipment && <Badge variant="outline" className="text-xs">{ex.equipment}</Badge>}
                    {ex.duration && <Badge variant="outline" className="text-xs">{ex.duration}s</Badge>}
                  </div>
                  {ex.tips && <p className="text-xs text-muted-foreground">{ex.tips}</p>}
                  {ex.videoUrl && (
                    <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-block">
                      Watch video ↗
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 py-12 text-center">
            <Dumbbell className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {search || filterMuscle !== "ALL" ? "No exercises match your filters." : "No exercises yet."}
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/dashboard/videos/new">Add your first exercise</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
