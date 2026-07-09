import { requireAuth } from "@/lib/auth/session";
import { listSessions, getLoginHistory, getUserDevices } from "@/features/auth/services/session-service";
import { SecuritySettingsClient } from "@/features/auth/components/security-settings-client";

export const metadata = {
  title: "Security Settings",
};

export default async function SecuritySettingsPage() {
  const authSession = await requireAuth();
  const userId = authSession.user.id;

  const [sessions, loginHistory, devices] = await Promise.all([
    listSessions(userId),
    getLoginHistory(userId, 10),
    getUserDevices(userId),
  ]);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account security, active sessions, and login history.
        </p>
      </div>

      <SecuritySettingsClient
        sessions={sessions}
        loginHistory={loginHistory}
        devices={devices}
      />
    </div>
  );
}
