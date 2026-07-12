"use client";

import { useState } from "react";
import { sendVerificationEmail, useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function VerifyEmailResend() {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  async function handleResend() {
    const email = session?.user?.email;
    if (!email) {
      toast.error("Sign in or use the link from your registration email to resend verification.");
      return;
    }

    setLoading(true);
    try {
      const result = await sendVerificationEmail({
        email,
        callbackURL: "/verify-email?success=true",
      });
      if (result?.error) {
        toast.error(result.error.message ?? "Could not resend verification email");
        return;
      }
      toast.success("Verification email sent. Check your inbox.");
    } catch {
      toast.error("Could not resend verification email. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleResend}
      disabled={loading}
    >
      {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
      Resend verification email
    </Button>
  );
}
