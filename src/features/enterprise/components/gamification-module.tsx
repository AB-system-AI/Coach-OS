"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createBadgeAction,
  deleteBadgeAction,
  createAchievementAction,
  deleteAchievementAction,
} from "@/features/enterprise/actions/enterprise-actions";

type Badge = {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  xpRequired: number;
  _count: { userBadges: number };
};

type Achievement = {
  id: string;
  name: string;
  description: string | null;
  xpReward: number;
  _count: { userAchievements: number };
};

export function GamificationModule({
  tenantId,
  initialBadges,
  initialAchievements,
}: {
  tenantId: string;
  initialBadges: Badge[];
  initialAchievements: Achievement[];
}) {
  const router = useRouter();
  const [badgeDialog, setBadgeDialog] = useState(false);
  const [achDialog, setAchDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [badgeForm, setBadgeForm] = useState({ name: "", description: "", iconUrl: "", xpRequired: "100" });
  const [achForm, setAchForm] = useState({ name: "", description: "", xpReward: "50" });

  async function handleCreateBadge(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createBadgeAction(tenantId, {
      name: badgeForm.name,
      description: badgeForm.description || undefined,
      iconUrl: badgeForm.iconUrl || undefined,
      xpRequired: Number(badgeForm.xpRequired),
    });
    setLoading(false);
    if (result.success) {
      setBadgeDialog(false);
      setBadgeForm({ name: "", description: "", iconUrl: "", xpRequired: "100" });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleCreateAchievement(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createAchievementAction(tenantId, {
      name: achForm.name,
      description: achForm.description || undefined,
      xpReward: Number(achForm.xpReward),
    });
    setLoading(false);
    if (result.success) {
      setAchDialog(false);
      setAchForm({ name: "", description: "", xpReward: "50" });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleDeleteBadge(id: string) {
    if (!confirm("Delete badge?")) return;
    await deleteBadgeAction(tenantId, id);
    router.refresh();
  }

  async function handleDeleteAchievement(id: string) {
    if (!confirm("Delete achievement?")) return;
    await deleteAchievementAction(tenantId, id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Gamification</h2>
        <p className="text-sm text-muted-foreground">
          Manage badges and achievements for your clients.
        </p>
      </div>

      <Tabs defaultValue="badges">
        <TabsList>
          <TabsTrigger value="badges">Badges ({initialBadges.length})</TabsTrigger>
          <TabsTrigger value="achievements">Achievements ({initialAchievements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setBadgeDialog(true)}>New Badge</Button>
          </div>

          <Dialog open={badgeDialog} onOpenChange={setBadgeDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Badge</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateBadge} className="space-y-4">
                <div className="space-y-2">
                  <Label>Badge Name</Label>
                  <Input
                    required
                    value={badgeForm.name}
                    onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                    placeholder="First Check-in"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={badgeForm.description}
                    onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
                    placeholder="Awarded for first gym check-in"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon URL</Label>
                  <Input
                    value={badgeForm.iconUrl}
                    onChange={(e) => setBadgeForm({ ...badgeForm, iconUrl: e.target.value })}
                    placeholder="https://example.com/badge.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label>XP Required</Label>
                  <Input
                    type="number"
                    min={0}
                    value={badgeForm.xpRequired}
                    onChange={(e) => setBadgeForm({ ...badgeForm, xpRequired: e.target.value })}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setBadgeDialog(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Badge"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {initialBadges.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No badges yet.
              </div>
            )}
            {initialBadges.map((badge) => (
              <div key={badge.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="font-medium">{badge.name}</div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDeleteBadge(badge.id)}>×</Button>
                </div>
                {badge.description && <p className="text-xs text-muted-foreground">{badge.description}</p>}
                <div className="text-xs text-muted-foreground">
                  {badge.xpRequired} XP required · {badge._count.userBadges} awarded
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setAchDialog(true)}>New Achievement</Button>
          </div>

          <Dialog open={achDialog} onOpenChange={setAchDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Achievement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAchievement} className="space-y-4">
                <div className="space-y-2">
                  <Label>Achievement Name</Label>
                  <Input
                    required
                    value={achForm.name}
                    onChange={(e) => setAchForm({ ...achForm, name: e.target.value })}
                    placeholder="30-Day Streak"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={achForm.description}
                    onChange={(e) => setAchForm({ ...achForm, description: e.target.value })}
                    placeholder="Worked out 30 days in a row"
                  />
                </div>
                <div className="space-y-2">
                  <Label>XP Reward</Label>
                  <Input
                    type="number"
                    min={0}
                    value={achForm.xpReward}
                    onChange={(e) => setAchForm({ ...achForm, xpReward: e.target.value })}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setAchDialog(false)}>Cancel</Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Achievement"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {initialAchievements.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No achievements yet.
              </div>
            )}
            {initialAchievements.map((ach) => (
              <div key={ach.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="font-medium">{ach.name}</div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDeleteAchievement(ach.id)}>×</Button>
                </div>
                {ach.description && <p className="text-xs text-muted-foreground">{ach.description}</p>}
                <div className="text-xs text-muted-foreground">
                  {ach.xpReward} XP reward · {ach._count.userAchievements} unlocked
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
