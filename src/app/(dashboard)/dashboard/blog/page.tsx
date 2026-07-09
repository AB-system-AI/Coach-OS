import { getCurrentTenant } from "@/lib/auth/session";
import { getBlogPosts } from "@/features/website";
import { redirect } from "next/navigation";
import { BlogClient } from "./_components/blog-client";

export default async function BlogPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const posts = await getBlogPosts(tenant.id);

  return <BlogClient posts={posts} tenantId={tenant.id} />;
}
