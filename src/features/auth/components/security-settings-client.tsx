"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Smartphone,
  Tablet,
  Loader2,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import {
  changePasswordAction,
  revokeSessionAction,
  revokeAllOtherSessionsAction,
} from "../actions/auth-actions";
import type {
  ActiveSession,
  LoginHistoryEntry,
  UserDeviceEntry,
} from "../services/session-service";

interface Props {
  sessions: ActiveSession[];
  loginHistory: LoginHistoryEntry[];
  devices: UserDeviceEntry[];
}

function DeviceIcon({ type }: { type: string | null }) {
  if (type === "mobile") return <Smartphone className="h-4 w-4" />;
  if (type === "tablet") return <Tablet className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown device";
  if (/firefox/i.test(ua)) return "Firefox";
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/edg/i.test(ua)) return "Edge";
  if (/opr|opera/i.test(ua)) return "Opera";
  return "Browser";
}

export function SecuritySettingsClient({ sessions, loginHistory, devices }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessionList, setSessionList] = useState(sessions);

  function handleRevokeSession(sessionId: string) {
    startTransition(async () => {
      const result = await revokeSessionAction(sessionId);
      if (result.success) {
        setSessionList((prev) => prev.filter((s) => s.id !== sessionId));
        toast.success("Session revoked");
      } else {
        toast.error(result.error ?? "Failed to revoke session");
      }
    });
  }

  function handleRevokeAll() {
    startTransition(async () => {
      const result = await revokeAllOtherSessionsAction();
      if (result.success) {
        setSessionList((prev) => prev.filter((s) => s.isCurrent));
        toast.success(`Revoked ${result.count} other session(s)`);
      } else {
        toast.error(result.error ?? "Failed to revoke sessions");
      }
    });
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const currentPassword = data.get("currentPassword") as string;
    const newPassword = data.get("newPassword") as string;
    const confirmPassword = data.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    startTransition(async () => {
      const result = await changePasswordAction(currentPassword, newPassword);
      if (result.success) {
        toast.success("Password changed successfully");
        form.reset();
      } else {
        toast.error(result.error ?? "Failed to change password");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Devices currently signed in to your account.
            </CardDescription>
          </div>
          {sessionList.filter((s) => !s.isCurrent).length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRevokeAll}
              disabled={isPending}
            >
              <LogOut className="me-2 h-4 w-4" />
              Sign out all others
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {sessionList.length === 0 && (
            <p className="text-sm text-muted-foreground">No active sessions found.</p>
          )}
          {sessionList.map((session) => (
            <div
              key={session.id}
              className="flex items-start justify-between gap-4 rounded-lg border p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-muted-foreground">
                  <Monitor className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {parseUserAgent(session.userAgent)}
                    </span>
                    {session.isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  {session.ipAddress && (
                    <p className="text-xs text-muted-foreground">
                      IP: {session.ipAddress}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Signed in{" "}
                    {formatDistanceToNow(new Date(session.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={isPending}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Login History
          </CardTitle>
          <CardDescription>Recent sign-in activity on your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {loginHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No login history found.</p>
          ) : (
            <div className="space-y-3">
              {loginHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 py-2"
                >
                  <div className="mt-0.5">
                    {entry.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {entry.success ? "Successful sign-in" : "Failed sign-in attempt"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.createdAt), "MMM d, yyyy HH:mm")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {[
                        entry.ipAddress && `IP: ${entry.ipAddress}`,
                        entry.location,
                        parseUserAgent(entry.userAgent),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
