import { getCurrentTenant } from "@/lib/auth/session";
import { getBlogPostById } from "@/features/website/services/website-service";
import { redirect, notFound } from "next/navigation";
import { BlogPostEditClient } from "./blog-post-edit-client";

type Props = { params: Promise<{ id: string }> };

export default async function BlogPostEditPage({ params }: Props) {
  const { id } = await params;
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const post = await getBlogPostById(tenant.id, id);
  if (!post) notFound();

  return <BlogPostEditClient post={post} tenantId={tenant.id} />;
}
