"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, magicLink } from "@/lib/auth/client";
import { getPostLoginDestination } from "@/features/auth/actions/redirect-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { Dumbbell, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import {
  AuthFormActions,
  AuthFormBody,
  AuthFormField,
  AuthFormShell,
  authButtonClassName,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
} from "@/features/auth/components/auth-form-shell";

type LoginMode = "password" | "magic";

type LoginFormProps = {
  embedded?: boolean;
  callbackUrl?: string;
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
};

function LoginFormInner({
  embedded = false,
  callbackUrl,
  onSuccess,
  onSwitchToRegister,
}: LoginFormProps) {
  const t = useTranslations("auth.login");
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>("password");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");

  async function navigateAfterLogin(destination: string) {
    onSuccess?.();
    if (embedded) {
      router.push(destination);
      return;
    }
    window.location.assign(destination);
  }

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

      const destination = await getPostLoginDestination(callbackUrl);
      await navigateAfterLogin(destination);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      const destination = await getPostLoginDestination(callbackUrl);
      await signIn.social({
        provider: "google",
        callbackURL: destination,
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
      const destination = await getPostLoginDestination(callbackUrl);
      const result = await magicLink.signIn(email, destination);

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
        className={authLinkClassName}
        onClick={onSwitchToRegister}
      >
        {t("register")}
      </button>
    ) : (
      <Link href="/register" className={authLinkClassName}>
        {t("register")}
      </Link>
    );

  if (mode === "magic" && magicSent) {
    return (
      <AuthFormShell
        embedded={embedded}
        icon={<MailCheck className="h-5 w-5" />}
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
            className={authButtonClassName}
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
      icon={<Dumbbell className="h-5 w-5" />}
      title={t("title")}
      description={t("subtitle")}
    >
      <AuthFormBody embedded={embedded} className="space-y-4 pb-0">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl border-border/50 bg-muted/30 text-[15px] font-medium shadow-none hover:bg-muted/50"
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
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
            or
          </span>
          <div className="h-px flex-1 bg-border/60" />
        </div>
      </AuthFormBody>

      {mode === "password" ? (
        <form onSubmit={handlePasswordSubmit}>
          <AuthFormBody embedded={embedded} className="space-y-3.5">
            <AuthFormField label={t("email")} htmlFor={embedded ? "modal-email" : "email"}>
              <Input
                id={embedded ? "modal-email" : "email"}
                name="email"
                type="email"
                placeholder="coach@example.com"
                required
                autoComplete="email"
                className={authInputClassName}
              />
            </AuthFormField>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={embedded ? "modal-password" : "password"}
                  className={authLabelClassName}
                >
                  {t("password")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
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
                className={authInputClassName}
              />
            </div>
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id={embedded ? "modal-rememberMe" : "rememberMe"}
                name="rememberMe"
                className="h-4 w-4 cursor-pointer rounded border-border/60 accent-primary"
              />
              <Label
                htmlFor={embedded ? "modal-rememberMe" : "rememberMe"}
                className="cursor-pointer text-sm font-normal text-muted-foreground"
              >
                Remember me for 30 days
              </Label>
            </div>
          </AuthFormBody>
          <AuthFormActions embedded={embedded}>
            <Button
              type="submit"
              className={authButtonClassName}
              disabled={loading}
            >
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {t("submit")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-full text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMode("magic")}
            >
              Sign in with magic link instead
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("noAccount")} {registerLink}
            </p>
          </AuthFormActions>
        </form>
      ) : (
        <form onSubmit={handleMagicLinkSubmit}>
          <AuthFormBody embedded={embedded} className="space-y-3.5">
            <AuthFormField
              label={t("email")}
              htmlFor={embedded ? "modal-magic-email" : "magic-email"}
            >
              <Input
                id={embedded ? "modal-magic-email" : "magic-email"}
                name="email"
                type="email"
                placeholder="coach@example.com"
                required
                autoComplete="email"
                className={authInputClassName}
              />
            </AuthFormField>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We&apos;ll send a one-click sign-in link to your email. No password
              needed.
            </p>
          </AuthFormBody>
          <AuthFormActions embedded={embedded}>
            <Button
              type="submit"
              className={authButtonClassName}
              disabled={loading}
            >
              {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              Send magic link
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-full text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMode("password")}
            >
              Use password instead
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("noAccount")} {registerLink}
            </p>
          </AuthFormActions>
        </form>
      )}
    </AuthFormShell>
  );
}

function LoginFormWithSearchParams(props: Omit<LoginFormProps, "callbackUrl">) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;
  return <LoginFormInner {...props} callbackUrl={callbackUrl} />;
}

function LoginFormFallback() {
  return (
    <div className="flex w-full max-w-md items-center justify-center rounded-xl border bg-card p-12 shadow">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function LoginForm(props: LoginFormProps) {
  if (props.embedded || props.callbackUrl !== undefined) {
    return <LoginFormInner {...props} />;
  }

  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginFormWithSearchParams {...props} />
    </Suspense>
  );
}
