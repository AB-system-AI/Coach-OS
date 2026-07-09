"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBackupAction } from "@/features/enterprise/actions/enterprise-actions";
import type { BackupType, BackupStatus } from "@prisma/client";

type BackupRecord = {
  id: string;
  type: BackupType;
  status: BackupStatus;
  fileUrl: string | null;
  fileSize: number | null;
  completedAt: Date | null;
  createdAt: Date;
};

const BACKUP_TYPES: BackupType[] = ["FULL", "PARTIAL", "INCREMENTAL"];

const STATUS_VARIANT: Record<BackupStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  IN_PROGRESS: "outline",
  COMPLETED: "default",
  FAILED: "destructive",
};

export function BackupModule({
  tenantId,
  initialBackups,
}: {
  tenantId: string;
  initialBackups: BackupRecord[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [backupType, setBackupType] = useState<BackupType>("FULL");

  async function handleCreateBackup() {
    if (!confirm(`Create a ${backupType} backup? This may take a while.`)) return;
    setLoading(true);
    await createBackupAction(tenantId, backupType);
    setLoading(false);
    router.refresh();
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Backup Center</h2>
          <p className="text-sm text-muted-foreground">
            {initialBackups.filter((b) => b.status === "COMPLETED").length} completed backups
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={backupType} onValueChange={(v) => setBackupType(v as BackupType)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BACKUP_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreateBackup} disabled={loading}>
            {loading ? "Creating..." : "Create Backup"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Size</th>
              <th className="px-4 py-3 text-left font-medium">Completed</th>
              <th className="px-4 py-3 text-left font-medium">Download</th>
            </tr>
          </thead>
          <tbody>
            {initialBackups.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No backups yet. Create your first backup above.
                </td>
              </tr>
            )}
            {initialBackups.map((backup) => (
              <tr key={backup.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(backup.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{backup.type}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[backup.status]}>
                    {backup.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {backup.fileSize != null ? formatBytes(backup.fileSize) : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {backup.completedAt ? new Date(backup.completedAt).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  {backup.fileUrl && (
                    <a
                      href={backup.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline text-sm"
                    >
                      Download
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
