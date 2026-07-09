"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createExerciseAction } from "@/features/exercises/actions/exercise-actions";

const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Arms", "Core", "Legs", "Glutes", "Full Body", "Cardio"];
const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

export function NewExerciseForm({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", videoUrl: "", thumbnailUrl: "",
    muscleGroup: "", level: "", tips: "", commonMistakes: "", equipment: "", duration: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.videoUrl.trim()) {
      toast.error("Title and video URL are required");
      return;
    }
    setLoading(true);
    try {
      await createExerciseAction(tenantId, {
        title: form.title,
        description: form.description || undefined,
        videoUrl: form.videoUrl,
        thumbnailUrl: form.thumbnailUrl || undefined,
        muscleGroup: form.muscleGroup || undefined,
        level: form.level || undefined,
        tips: form.tips || undefined,
        commonMistakes: form.commonMistakes || undefined,
        equipment: form.equipment || undefined,
        duration: form.duration ? parseInt(form.duration) : undefined,
      });
      toast.success("Exercise added to library");
      router.push("/dashboard/videos");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Exercise Title *</Label>
            <Input id="title" placeholder="e.g. Barbell Squat" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL *</Label>
            <Input id="videoUrl" type="url" placeholder="https://youtube.com/..." value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input id="thumbnailUrl" type="url" placeholder="https://..." value={form.thumbnailUrl}
              onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Muscle Group</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.muscleGroup} onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}>
                <option value="">Select...</option>
                {MUSCLE_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                <option value="">Select...</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment</Label>
              <Input id="equipment" placeholder="e.g. Barbell, Rack" value={form.equipment}
                onChange={(e) => setForm({ ...form, equipment: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input id="duration" type="number" min="0" value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description"
              className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Brief description of the exercise..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tips">Coaching Tips</Label>
            <textarea id="tips"
              className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Key form cues and tips..."
              value={form.tips} onChange={(e) => setForm({ ...form, tips: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commonMistakes">Common Mistakes</Label>
            <textarea id="commonMistakes"
              className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="What to avoid..."
              value={form.commonMistakes} onChange={(e) => setForm({ ...form, commonMistakes: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Exercise"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
