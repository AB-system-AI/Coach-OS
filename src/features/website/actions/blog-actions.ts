"use server";

import { revalidatePath } from "next/cache";
import { requireTenantAccess } from "@/lib/auth/session";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  createCmsPage,
  updateCmsPage,
  deleteCmsPage,
  createFaq,
  deleteFaq,
} from "@/features/website/services/website-service";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36);
}

export async function createBlogPostAction(
  tenantId: string,
  data: {
    title: string;
    content?: string;
    excerpt?: string;
    status?: "DRAFT" | "PUBLISHED";
    coverImageUrl?: string;
  }
) {
  await requireTenantAccess(tenantId);
  const post = await createBlogPost(tenantId, { ...data, slug: slugify(data.title) });
  revalidatePath("/dashboard/blog");
  return { id: post.id };
}

export async function updateBlogPostAction(
  tenantId: string,
  postId: string,
  data: Partial<{
    title: string;
    content: string;
    excerpt: string;
    status: "DRAFT" | "PUBLISHED";
    coverImageUrl: string;
  }>
) {
  await requireTenantAccess(tenantId);
  await updateBlogPost(tenantId, postId, data);
  revalidatePath(`/dashboard/blog/${postId}`);
  revalidatePath("/dashboard/blog");
}

export async function deleteBlogPostAction(tenantId: string, postId: string) {
  await requireTenantAccess(tenantId);
  await deleteBlogPost(tenantId, postId);
  revalidatePath("/dashboard/blog");
}

export async function createCmsPageAction(
  tenantId: string,
  data: { title: string; content?: string; status?: "DRAFT" | "PUBLISHED" }
) {
  await requireTenantAccess(tenantId);
  const page = await createCmsPage(tenantId, { ...data, slug: slugify(data.title) });
  revalidatePath("/dashboard/website");
  return { id: page.id };
}

export async function updateCmsPageAction(
  tenantId: string,
  pageId: string,
  data: Partial<{ title: string; content: string; status: "DRAFT" | "PUBLISHED" }>
) {
  await requireTenantAccess(tenantId);
  await updateCmsPage(tenantId, pageId, data);
  revalidatePath("/dashboard/website");
}

export async function deleteCmsPageAction(tenantId: string, pageId: string) {
  await requireTenantAccess(tenantId);
  await deleteCmsPage(tenantId, pageId);
  revalidatePath("/dashboard/website");
}

export async function createFaqAction(
  tenantId: string,
  data: { question: string; answer: string }
) {
  await requireTenantAccess(tenantId);
  await createFaq(tenantId, data);
  revalidatePath("/dashboard/website");
}

export async function deleteFaqAction(tenantId: string, faqId: string) {
  await requireTenantAccess(tenantId);
  await deleteFaq(tenantId, faqId);
  revalidatePath("/dashboard/website");
}
