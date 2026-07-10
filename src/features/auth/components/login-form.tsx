"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, getSession, magicLink } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { Dumbbell, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import {
  AuthFormActions,
  AuthFormBody,
  AuthFormShell,
} from "@/features/auth/components/auth-form-shell";

type LoginMode = "password" | "magic";

const ROLE_REDIRECT: Record<string, string> = {
  CLIENT: "/portal",
  SUPER_ADMIN: "/admin",
};
const DEFAULT_REDIRECT = "/dashboard";

function getRoleRedirect(role?: string | null, callbackUrl?: string): string {
  if (callbackUrl && callbackUrl.startsWith("/")) return callbackUrl;
  return (role && ROLE_REDIRECT[role]) ?? DEFAULT_REDIRECT;
}

type LoginFormProps = {
  embedded?: boolean;
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
};

export function LoginForm({
  embedded = false,
  onSuccess,
  onSwitchToRegister,
}: LoginFormProps) {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;

  const [mode, setMode] = useState<LoginMode>("password");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result?.error) {
        toast.error(result.error.message ?? "Login failed");
        return;
      }

      toast.success("Welcome back!");
      onSuccess?.();

      const session = await getSession();
      const role = (session?.data?.user as { role?: string } | null)?.role;
      router.push(getRoleRedirect(role, callbackUrl));
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: callbackUrl ?? DEFAULT_REDIRECT,
      });
    } catch {
      toast.error("Google sign-in failed. Please try again.");
      setLoading(false);
    }
  }

  async function handleMagicLinkSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    setMagicEmail(email);

    try {
      const result = await magicLink.signIn(email);

      if (result?.error) {
        toast.error(result.error.message ?? "Failed to send magic link");
        return;
      }

      setMagicSent(true);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  const registerLink =
    embedded && onSwitchToRegister ? (
      <button
        type="button"
        className="text-primary hover:underline"
        onClick={onSwitchToRegister}
      >
        {t("register")}
      </button>
    ) : (
      <Link href="/register" className="text-primary hover:underline">
        {t("register")}
      </Link>
    );

  if (mode === "magic" && magicSent) {
    return (
      <AuthFormShell
        embedded={embedded}
        icon={<MailCheck className="h-6 w-6" />}
        title="Check your email"
        description={
          <>
            We sent a sign-in link to{" "}
            <span className="font-medium text-foreground">{magicEmail}</span>.
            The link expires in 5 minutes.
          </>
        }
        footer={
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setMagicSent(false);
              setMode("password");
            }}
          >
            Use password instead
          </Button>
        }
      />
    );
  }

  return (
    <AuthFormShell
      embedded={embedded}
      icon={<Dumbbell className="h-6 w-6" />}
      title={t("title")}
      description={t("subtitle")}
    >
      <AuthFormBody embedded={embedded} className="space-y-4 pb-0">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="me-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 border-t border-border" />
        </div>
      </AuthFormBody>

      {mode === "password" ? (
        <form onSubmit={handlePasswordSubmit}>
          <AuthFormBody embedded={embedded} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={embedded ? "modal-email" : "email"}>{t("email")}</Label>
              <Input
                id={embedded ? "modal-email" : "email"}
                name="email"
                type="email"
                placeholder="coach@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={embedded ? "modal-password" : "password"}>
                  {t("password")}
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <Input
                id={embedded ? "modal-password" : "password"}
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={embedded ? "modal-rememberMe" : "rememberMe"}
                name="rememberMe"
                className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
              />
              <Label
                htmlFor={embedded ? "modal-rememberMe" : "rememberMe"}
                className="text-sm font-normal cursor-pointer"
              >
                Remember me for 30 days
              </Label>
            </div>
          </AuthFormBody>
          <AuthFormActions embedded={embedded}>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t("submit")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={() => setMode("magic")}
            >
              Sign in with magic link instead
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {t("noAccount")} {registerLink}
            </p>
          </AuthFormActions>
        </form>
      ) : (
        <form onSubmit={handleMagicLinkSubmit}>
          <AuthFormBody embedded={embedded} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={embedded ? "modal-magic-email" : "magic-email"}>
                {t("email")}
              </Label>
              <Input
                id={embedded ? "modal-magic-email" : "magic-email"}
                name="email"
                type="email"
                placeholder="coach@example.com"
                required
                autoComplete="email"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              We&apos;ll send a one-click sign-in link to your email. No password
              needed.
            </p>
          </AuthFormBody>
          <AuthFormActions embedded={embedded}>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              Send magic link
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={() => setMode("password")}
            >
              Use password instead
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {t("noAccount")} {registerLink}
            </p>
          </AuthFormActions>
        </form>
      )}
    </AuthFormShell>
  );
}
