import { getCurrentTenant } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NewProgramForm } from "./new-program-form";

export default async function NewProgramPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard/programs" className="text-sm text-muted-foreground hover:text-foreground">
          ← Programs
        </Link>
        <h1 className="text-3xl font-bold mt-2">New Program</h1>
        <p className="text-muted-foreground">Create a workout program template or client program.</p>
      </div>
      <NewProgramForm tenantId={tenant.id} />
    </div>
  );
}
