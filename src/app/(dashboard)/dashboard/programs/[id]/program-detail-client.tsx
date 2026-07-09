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
import { Trash2, Plus, Copy, UserPlus, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import {
  updateProgramAction,
  deleteProgramAction,
  updateProgramStatusAction,
  copyProgramAction,
  addWorkoutPlanAction,
  deleteWorkoutPlanAction,
  addExerciseAction,
  deleteExerciseAction,
  assignProgramAction,
} from "@/features/programs/actions/program-actions";

type Program = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  durationWeeks: number | null;
  price: number | string;
  isTemplate: boolean;
  workoutPlans: Array<{
    id: string;
    name: string;
    weekNumber: number | null;
    dayNumber: number | null;
    exercises: Array<{
      id: string;
      name: string;
      muscleGroup: string | null;
      sets: number | null;
      reps: string | null;
      restSeconds: number | null;
      notes: string | null;
    }>;
  }>;
  enrollments: Array<{
    id: string;
    progress: number | null;
    isActive: boolean;
    user: { id: string; name: string | null; email: string };
  }>;
};

type Client = {
  id: string;
  user: { id: string; name: string | null; email: string };
};

interface Props {
  program: Program;
  clients: Client[];
  tenantId: string;
}

export function ProgramDetailClient({ program: initial, clients, tenantId }: Props) {
  const router = useRouter();
  const [program] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: initial.name,
    description: initial.description ?? "",
    durationWeeks: initial.durationWeeks?.toString() ?? "",
    price: Number(initial.price).toString(),
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Workout plan add form
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [planForm, setPlanForm] = useState({ name: "", weekNumber: "", dayNumber: "" });
  const [addingPlan, setAddingPlan] = useState(false);

  // Exercise add state (per plan)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [exForm, setExForm] = useState({ name: "", muscleGroup: "", sets: "", reps: "", restSeconds: "", notes: "" });
  const [addingEx, setAddingEx] = useState(false);

  // Assign client
  const [showAssign, setShowAssign] = useState(false);
  const [selectedClientUserId, setSelectedClientUserId] = useState("");
  const [assigning, setAssigning] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateProgramAction(tenantId, program.id, {
        name: editForm.name,
        description: editForm.description || undefined,
        durationWeeks: editForm.durationWeeks ? parseInt(editForm.durationWeeks) : undefined,
        price: editForm.price ? parseFloat(editForm.price) : undefined,
      });
      toast.success("Program updated");
      setEditing(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this program? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteProgramAction(tenantId, program.id);
      toast.success("Program deleted");
      router.push("/dashboard/programs");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
      setDeleting(false);
    }
  }

  async function handleStatusToggle() {
    const next = program.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    try {
      await updateProgramStatusAction(tenantId, program.id, next as "ACTIVE" | "DRAFT");
      toast.success(`Program set to ${next}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    }
  }

  async function handleCopy() {
    try {
      const result = await copyProgramAction(tenantId, program.id);
      toast.success("Program duplicated");
      router.push(`/dashboard/programs/${result.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to copy");
    }
  }

  async function handleAddPlan() {
    if (!planForm.name.trim()) { toast.error("Plan name required"); return; }
    setAddingPlan(true);
    try {
      await addWorkoutPlanAction(tenantId, program.id, {
        name: planForm.name,
        weekNumber: planForm.weekNumber ? parseInt(planForm.weekNumber) : undefined,
        dayNumber: planForm.dayNumber ? parseInt(planForm.dayNumber) : undefined,
      });
      toast.success("Workout day added");
      setPlanForm({ name: "", weekNumber: "", dayNumber: "" });
      setShowAddPlan(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add");
    } finally {
      setAddingPlan(false);
    }
  }

  async function handleDeletePlan(planId: string) {
    if (!confirm("Delete this workout day and all its exercises?")) return;
    try {
      await deleteWorkoutPlanAction(tenantId, planId, program.id);
      toast.success("Workout day deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function handleAddExercise(planId: string) {
    if (!exForm.name.trim()) { toast.error("Exercise name required"); return; }
    setAddingEx(true);
    try {
      await addExerciseAction(tenantId, planId, program.id, {
        name: exForm.name,
        muscleGroup: exForm.muscleGroup || undefined,
        sets: exForm.sets ? parseInt(exForm.sets) : undefined,
        reps: exForm.reps || undefined,
        restSeconds: exForm.restSeconds ? parseInt(exForm.restSeconds) : undefined,
        notes: exForm.notes || undefined,
      });
      toast.success("Exercise added");
      setExForm({ name: "", muscleGroup: "", sets: "", reps: "", restSeconds: "", notes: "" });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add exercise");
    } finally {
      setAddingEx(false);
    }
  }

  async function handleDeleteExercise(exerciseId: string) {
    if (!confirm("Remove this exercise?")) return;
    try {
      await deleteExerciseAction(tenantId, exerciseId, program.id);
      toast.success("Exercise removed");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove");
    }
  }

  async function handleAssign() {
    if (!selectedClientUserId) { toast.error("Select a client"); return; }
    setAssigning(true);
    try {
      await assignProgramAction(tenantId, program.id, selectedClientUserId);
      toast.success("Client assigned to program");
      setShowAssign(false);
      setSelectedClientUserId("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to assign");
    } finally {
      setAssigning(false);
    }
  }

  const enrolledUserIds = new Set(program.enrollments.map((e) => e.user.id));
  const availableClients = clients.filter((c) => !enrolledUserIds.has(c.user.id));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/programs" className="text-sm text-muted-foreground hover:text-foreground">
          ← Programs
        </Link>
        {editing ? (
          <div className="mt-2 space-y-3 max-w-lg">
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="text-2xl font-bold h-auto py-1"
            />
            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={2}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Description"
            />
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Weeks"
                value={editForm.durationWeeks}
                onChange={(e) => setEditForm({ ...editForm, durationWeeks: e.target.value })}
                className="w-28"
              />
              <Input
                type="number"
                placeholder="Price $"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                className="w-28"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm">{saving ? "Saving..." : "Save"}</Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mt-2">{program.name}</h1>
            {program.description && <p className="text-muted-foreground mt-1">{program.description}</p>}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge>{program.status}</Badge>
              {program.durationWeeks && <Badge variant="outline">{program.durationWeeks} weeks</Badge>}
              {program.isTemplate && <Badge variant="secondary">Template</Badge>}
              <span className="text-sm text-muted-foreground">${Number(program.price).toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Action buttons */}
      {!editing && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 me-1" />Edit
          </Button>
          <Button size="sm" variant="outline" onClick={handleStatusToggle}>
            {program.status === "ACTIVE" ? "Set Draft" : "Set Active"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopy}>
            <Copy className="h-4 w-4 me-1" />Duplicate
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowAssign(!showAssign)}>
            <UserPlus className="h-4 w-4 me-1" />Assign Client
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4 me-1" />{deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      )}

      {/* Assign client panel */}
      {showAssign && (
        <Card>
          <CardHeader><CardTitle className="text-base">Assign Client</CardTitle></CardHeader>
          <CardContent className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <Label>Client</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedClientUserId}
                onChange={(e) => setSelectedClientUserId(e.target.value)}
              >
                <option value="">Select client...</option>
                {availableClients.map((c) => (
                  <option key={c.user.id} value={c.user.id}>
                    {c.user.name ?? c.user.email}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleAssign} disabled={assigning}>
              {assigning ? "Assigning..." : "Assign"}
            </Button>
            <Button variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
          </CardContent>
        </Card>
      )}

      {/* Workout Plans */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workout Days ({program.workoutPlans.length})</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowAddPlan(!showAddPlan)}>
              <Plus className="h-4 w-4 me-1" />Add Day
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddPlan && (
            <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
              <p className="font-medium text-sm">New Workout Day</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Day name (e.g. Push Day)"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Week"
                  value={planForm.weekNumber}
                  onChange={(e) => setPlanForm({ ...planForm, weekNumber: e.target.value })}
                  className="w-20"
                />
                <Input
                  type="number"
                  placeholder="Day"
                  value={planForm.dayNumber}
                  onChange={(e) => setPlanForm({ ...planForm, dayNumber: e.target.value })}
                  className="w-20"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddPlan} disabled={addingPlan}>
                  {addingPlan ? "Adding..." : "Add"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddPlan(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {program.workoutPlans.map((plan) => (
            <div key={plan.id} className="rounded-lg border">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30"
                onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
              >
                <div>
                  <p className="font-medium">{plan.name}</p>
                  {(plan.weekNumber != null || plan.dayNumber != null) && (
                    <p className="text-xs text-muted-foreground">
                      {plan.weekNumber != null && `Week ${plan.weekNumber}`}
                      {plan.dayNumber != null && ` · Day ${plan.dayNumber}`}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.exercises.length} exercises</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {expandedPlan === plan.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>

              {expandedPlan === plan.id && (
                <div className="border-t px-4 py-3 space-y-3">
                  {plan.exercises.map((ex) => (
                    <div key={ex.id} className="flex justify-between items-start text-sm py-2 border-b last:border-0">
                      <div>
                        <span className="font-medium">{ex.name}</span>
                        {ex.muscleGroup && <span className="text-muted-foreground ms-2">({ex.muscleGroup})</span>}
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {ex.sets != null && `${ex.sets} sets`}
                          {ex.reps && ` × ${ex.reps}`}
                          {ex.restSeconds != null && ` · ${ex.restSeconds}s rest`}
                          {ex.notes && ` · ${ex.notes}`}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteExercise(ex.id)}
                        className="text-destructive hover:text-destructive h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {/* Add exercise form */}
                  <div className="bg-muted/30 rounded-md p-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Add Exercise</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Exercise name *"
                        value={exForm.name}
                        onChange={(e) => setExForm({ ...exForm, name: e.target.value })}
                        className="col-span-2 text-sm h-8"
                      />
                      <Input
                        placeholder="Muscle group"
                        value={exForm.muscleGroup}
                        onChange={(e) => setExForm({ ...exForm, muscleGroup: e.target.value })}
                        className="text-sm h-8"
                      />
                      <Input
                        type="number"
                        placeholder="Sets"
                        value={exForm.sets}
                        onChange={(e) => setExForm({ ...exForm, sets: e.target.value })}
                        className="text-sm h-8"
                      />
                      <Input
                        placeholder="Reps (e.g. 8-12)"
                        value={exForm.reps}
                        onChange={(e) => setExForm({ ...exForm, reps: e.target.value })}
                        className="text-sm h-8"
                      />
                      <Input
                        type="number"
                        placeholder="Rest (secs)"
                        value={exForm.restSeconds}
                        onChange={(e) => setExForm({ ...exForm, restSeconds: e.target.value })}
                        className="text-sm h-8"
                      />
                    </div>
                    <Input
                      placeholder="Notes"
                      value={exForm.notes}
                      onChange={(e) => setExForm({ ...exForm, notes: e.target.value })}
                      className="text-sm h-8"
                    />
                    <Button size="sm" onClick={() => handleAddExercise(plan.id)} disabled={addingEx} className="h-7 text-xs">
                      {addingEx ? "Adding..." : "Add Exercise"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {program.workoutPlans.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">
              No workout days yet. Add your first day above.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Enrolled Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Clients ({program.enrollments.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {program.enrollments.map((e) => (
            <div key={e.id} className="flex justify-between py-3 text-sm">
              <div>
                <Link href={`/dashboard/clients/${e.user.id}`} className="font-medium hover:underline">
                  {e.user.name ?? e.user.email}
                </Link>
                <p className="text-muted-foreground text-xs">{e.user.email}</p>
              </div>
              <div className="text-end">
                <span className="text-muted-foreground">{e.progress ?? 0}% complete</span>
                <Badge variant={e.isActive ? "default" : "secondary"} className="ms-2 text-xs">
                  {e.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          ))}
          {program.enrollments.length === 0 && (
            <p className="text-muted-foreground text-sm py-4">
              No clients assigned. Use the &quot;Assign Client&quot; button above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
