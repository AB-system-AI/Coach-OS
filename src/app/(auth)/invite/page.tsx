import { redirect } from "next/navigation";
import { XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession as getServerSession } from "@/lib/auth/session";
import { getInviteByToken, acceptInvite } from "@/features/auth/services/invite-service";

export const metadata = {
  title: "Accept Invitation",
};

interface InvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Invalid invitation</CardTitle>
            <CardDescription>
              This invitation link is missing a token. Please use the link from
              your email.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Go to login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const invite = await getInviteByToken(token);

  if (!invite) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Invitation expired</CardTitle>
            <CardDescription>
              This invitation link has expired or already been used. Please
              contact the person who invited you for a new link.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Go to login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const session = await getServerSession();

  if (!session?.user) {
    redirect(
      `/register?callbackUrl=${encodeURIComponent(`/invite?token=${token}`)}&email=${encodeURIComponent(invite.email)}`
    );
  }

  const result = await acceptInvite(token, session.user.id);

  if (!result.success) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Could not accept invitation</CardTitle>
            <CardDescription>{result.error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3">
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">Go to dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  redirect(result.tenantId ? "/dashboard" : "/dashboard");
}
