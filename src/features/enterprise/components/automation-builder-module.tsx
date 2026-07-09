"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
  createWorkflowAction,
  toggleWorkflowAction,
  deleteWorkflowAction,
} from "@/features/enterprise/actions/enterprise-actions";
import { ExternalLink } from "lucide-react";

type Workflow = {
  id: string;
  name: string;
  description: string | null;
  trigger: string;
  isActive: boolean;
  runCount: number;
  createdAt: Date;
  _count: { steps: number };
};

const TRIGGERS = [
  "CLIENT_CREATED",
  "BOOKING_CREATED",
  "BOOKING_REMINDER",
  "PAYMENT_RECEIVED",
  "SUBSCRIPTION_RENEWAL",
  "RECOVERY_REMINDER",
  "APPOINTMENT_REMINDER",
  "BIRTHDAY",
  "COURSE_ENROLLED",
  "CHALLENGE_JOINED",
];

export function AutomationBuilderModule({
  tenantId,
  initialWorkflows,
}: {
  tenantId: string;
  initialWorkflows: Workflow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", trigger: "CLIENT_CREATED" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createWorkflowAction(tenantId, {
      name: form.name,
      description: form.description || undefined,
      trigger: form.trigger,
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setForm({ name: "", description: "", trigger: "CLIENT_CREATED" });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    await toggleWorkflowAction(tenantId, id, !isActive);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this workflow?")) return;
    await deleteWorkflowAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Automation Workflows</h2>
          <p className="text-sm text-muted-foreground">
            {initialWorkflows.filter((w) => w.isActive).length} active workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/automation">
              View Automation Hub
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>New Workflow</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Workflow</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Workflow Name</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Welcome New Client"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Sends welcome email when a client signs up"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trigger</Label>
                  <Select
                    value={form.trigger}
                    onValueChange={(v) => setForm({ ...form, trigger: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGERS.map((t) => (
                        <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Workflow"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Trigger</th>
              <th className="px-4 py-3 text-center font-medium">Steps</th>
              <th className="px-4 py-3 text-center font-medium">Runs</th>
              <th className="px-4 py-3 text-left font-medium">Active</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialWorkflows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No workflows yet.
                </td>
              </tr>
            )}
            {initialWorkflows.map((wf) => (
              <tr key={wf.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="font-medium">{wf.name}</div>
                  {wf.description && (
                    <div className="text-xs text-muted-foreground">{wf.description}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">{wf.trigger.replace(/_/g, " ")}</Badge>
                </td>
                <td className="px-4 py-3 text-center">{wf._count.steps}</td>
                <td className="px-4 py-3 text-center">{wf.runCount}</td>
                <td className="px-4 py-3">
                  <Switch
                    checked={wf.isActive}
                    onCheckedChange={() => handleToggle(wf.id, wf.isActive)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(wf.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
