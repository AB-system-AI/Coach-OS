"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Users, Activity } from "lucide-react";
import { replyToCheckInAction } from "@/features/progress/actions/progress-actions";

type CheckIn = {
  id: string;
  status: string;
  weekStartDate: Date;
  weight: number | null;
  bodyFatPercent: number | null;
  adherenceScore: number | null;
  programRating: number | null;
  notes: string | null;
  coachReply: string | null;
  client: {
    id: string;
    user: { name: string | null; email: string };
  };
};

interface Props {
  checkIns: CheckIn[];
  stats: { pendingCheckIns: number; clients: number };
  tenantId: string;
}

export function ProgressClient({ checkIns, stats, tenantId }: Props) {
  const router = useRouter();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

  async function handleReply(checkInId: string) {
    const reply = replies[checkInId];
    if (!reply?.trim()) { toast.error("Reply cannot be empty"); return; }
    setSending(checkInId);
    try {
      await replyToCheckInAction(tenantId, checkInId, reply.trim());
      toast.success("Reply sent");
      setReplyingTo(null);
      setReplies({ ...replies, [checkInId]: "" });
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send reply");
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Client Progress & Check-ins</h1>
        <p className="text-muted-foreground mt-1">
          Review weekly check-ins, reply to clients, and track progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Active Clients", value: stats.clients, icon: Users },
          { label: "Pending Check-ins", value: stats.pendingCheckIns, icon: Activity },
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

      <div className="flex flex-wrap gap-2">
        {["Weight", "BMI", "Body Fat", "Measurements", "Adherence", "Weekly Check-in"].map((f) => (
          <Badge key={f} variant="secondary">{f}</Badge>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Weekly Check-ins ({checkIns.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {checkIns.map((c) => (
            <div key={c.id} className="py-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/dashboard/clients/${c.client.id}`}
                    className="font-medium hover:underline"
                  >
                    {c.client.user.name ?? c.client.user.email}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Week of {new Date(c.weekStartDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge>{c.status}</Badge>
              </div>

              {/* Check-in data */}
              <div className="flex flex-wrap gap-3 text-sm">
                {c.weight != null && (
                  <span className="bg-muted px-2 py-1 rounded text-xs">
                    ⚖️ Weight: {c.weight} kg
                  </span>
                )}
                {c.bodyFatPercent != null && (
                  <span className="bg-muted px-2 py-1 rounded text-xs">
                    Body Fat: {c.bodyFatPercent}%
                  </span>
                )}
                {c.adherenceScore != null && (
                  <span className="bg-muted px-2 py-1 rounded text-xs">
                    Adherence: {c.adherenceScore}/10
                  </span>
                )}
                {c.programRating != null && (
                  <span className="bg-muted px-2 py-1 rounded text-xs">
                    Program Rating: {c.programRating}/10
                  </span>
                )}
              </div>

              {c.notes && (
                <div className="rounded-md bg-muted/50 p-3 text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Client notes:</p>
                  <p>{c.notes}</p>
                </div>
              )}

              {c.coachReply && (
                <div className="rounded-md bg-primary/5 border-l-2 border-primary p-3 text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Your reply:</p>
                  <p>{c.coachReply}</p>
                </div>
              )}

              {/* Reply form */}
              {replyingTo === c.id ? (
                <div className="space-y-2">
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Write your coaching reply..."
                    value={replies[c.id] ?? ""}
                    onChange={(e) => setReplies({ ...replies, [c.id]: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReply(c.id)}
                      disabled={sending === c.id}
                    >
                      <MessageSquare className="h-4 w-4 me-1" />
                      {sending === c.id ? "Sending..." : "Send Reply"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReplyingTo(c.id)}
                >
                  <MessageSquare className="h-4 w-4 me-1" />
                  {c.coachReply ? "Edit Reply" : "Reply"}
                </Button>
              )}
            </div>
          ))}
          {checkIns.length === 0 && (
            <div className="py-12 text-center">
              <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No pending check-ins. All caught up!</p>
              <Button asChild className="mt-4" size="sm" variant="outline">
                <Link href="/dashboard/clients">View Clients</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
