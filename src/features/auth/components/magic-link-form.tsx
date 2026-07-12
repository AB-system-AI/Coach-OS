"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { magicLink } from "@/lib/auth/client";
import { getPostLoginDestination } from "@/features/auth/actions/redirect-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  authLinkClassName,
} from "@/features/auth/components/auth-form-shell";

export function MagicLinkForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const value = formData.get("email") as string;
    setEmail(value);

    try {
      const destination = await getPostLoginDestination(callbackUrl);
      const result = await magicLink.signIn(value, destination);

      if (result?.error) {
        toast.error(result.error.message ?? "Failed to send magic link");
        return;
      }

      setSent(true);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthFormShell
        icon={<MailCheck className="h-5 w-5" />}
        title="Check your email"
        description={
          <>
            We sent a sign-in link to{" "}
            <span className="font-medium text-foreground">{email}</span>. The link
            expires in 5 minutes.
          </>
        }
        footer={
          <Button variant="outline" className={authButtonClassName} asChild>
            <Link href="/login">Back to login</Link>
          </Button>
        }
      />
    );
  }

  return (
    <AuthFormShell
      icon={<Dumbbell className="h-5 w-5" />}
      title="Sign in with magic link"
      description="Enter your email and we'll send you a one-click sign-in link."
    >
      <form onSubmit={handleSubmit}>
        <AuthFormBody className="space-y-3.5">
          <AuthFormField label="Email" htmlFor="magic-email">
            <Input
              id="magic-email"
              name="email"
              type="email"
              placeholder="coach@example.com"
              required
              autoComplete="email"
              className={authInputClassName}
            />
          </AuthFormField>
        </AuthFormBody>
        <AuthFormActions>
          <Button type="submit" className={authButtonClassName} disabled={loading}>
            {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            Send magic link
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Prefer a password?{" "}
            <Link href="/login" className={authLinkClassName}>
              Sign in
            </Link>
          </p>
        </AuthFormActions>
      </form>
    </AuthFormShell>
  );
}
