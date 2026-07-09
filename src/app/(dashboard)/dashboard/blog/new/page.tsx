import { getCurrentTenant } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NewBlogPostForm } from "./new-blog-post-form";

export default async function NewBlogPostPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/dashboard/blog" className="text-sm text-muted-foreground hover:text-foreground">
          ← Blog
        </Link>
        <h1 className="text-3xl font-bold mt-2">New Blog Post</h1>
      </div>
      <NewBlogPostForm tenantId={tenant.id} />
    </div>
  );
}
