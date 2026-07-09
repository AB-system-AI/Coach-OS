"use client";

import { Badge } from "@/components/ui/badge";
import type { AuditAction } from "@prisma/client";

type AuditLog = {
  id: string;
  action: AuditAction;
  entity: string | null;
  entityId: string | null;
  reason: string | null;
  canRollback: boolean;
  ipAddress: string | null;
  createdAt: Date;
  user: { name: string; email: string } | null;
};

const ACTION_VARIANT: Record<AuditAction, "default" | "secondary" | "destructive" | "outline"> = {
  CREATE: "default",
  UPDATE: "outline",
  DELETE: "destructive",
  LOGIN: "secondary",
  LOGOUT: "secondary",
  PAYMENT: "default",
  BOOKING: "default",
};

export function AuditModule({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Audit Log</h2>
        <p className="text-sm text-muted-foreground">
          {logs.length} entries — every action tracked.
        </p>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-left font-medium">Entity</th>
              <th className="px-4 py-3 text-left font-medium">Reason</th>
              <th className="px-4 py-3 text-left font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No audit logs yet.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {log.user ? (
                    <div>
                      <div className="font-medium">{log.user.name}</div>
                      <div className="text-xs text-muted-foreground">{log.user.email}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">System</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ACTION_VARIANT[log.action]}>{log.action}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {log.entity ?? "—"}
                  {log.entityId && (
                    <span className="ml-1 font-mono text-xs">#{log.entityId.slice(-6)}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{log.reason ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {log.ipAddress ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
