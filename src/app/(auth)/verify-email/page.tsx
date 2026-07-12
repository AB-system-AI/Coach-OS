import { redirect } from "next/navigation";
import { CheckCircle, XCircle, MailCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { isEmailVerificationRequired } from "@/lib/auth/email-verification";
import { VerifyEmailResend } from "@/features/auth/components/verify-email-resend";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Verify Email",
  description: "Email verification status.",
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  if (!isEmailVerificationRequired()) {
    redirect("/login");
  }

  const { error, success } = await searchParams;

  // Success state — redirected here after Better Auth verifies the token
  if (success === "true") {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Email verified!</CardTitle>
            <CardDescription>
              Your email address has been verified successfully. You can now sign
              in to your account.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button className="w-full">Sign in</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessages: Record<string, string> = {
      invalid_token: "This verification link is invalid or has expired.",
      token_expired: "This verification link has expired. Please request a new one.",
    };
    const errorMessage =
      errorMessages[error] ??
      "Something went wrong during email verification. Please try again.";

    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Verification failed</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Link href="/login" className="w-full">
              <Button className="w-full">Go to login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Default state — show "check your inbox" message
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MailCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Check your inbox</CardTitle>
          <CardDescription>
            We sent a verification link to your email address. Click the link to
            verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground text-center space-y-4">
          <p>
            We sent a verification link to your email address. Click the link to
            verify your account before signing in.
          </p>
          <p>
            Didn&apos;t receive the email? Check your spam folder. The link
            expires in 24 hours.
          </p>
          <VerifyEmailResend />
        </CardContent>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
