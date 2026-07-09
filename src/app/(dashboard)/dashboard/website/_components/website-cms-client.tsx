"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Plus, Pencil, Trash2, Globe, FileText, HelpCircle, Save } from "lucide-react";
import {
  createCmsPageAction,
  updateCmsPageAction,
  deleteCmsPageAction,
  createFaqAction,
  deleteFaqAction,
} from "@/features/website/actions/blog-actions";

type CmsPage = {
  id: string;
  slug: string;
  title: string;
  content: unknown;
  status: string;
};

type Faq = {
  id: string;
  question: string;
  answer: string;
  order: number | null;
};

interface Props {
  stats: { pages: number; posts: number; faqs: number };
  pages: CmsPage[];
  faqs: Faq[];
  tenantId: string;
}

export function WebsiteCmsClient({ stats, pages, faqs, tenantId }: Props) {
  const router = useRouter();

  // CMS Pages state
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [pageForm, setPageForm] = useState({ title: "", content: "", status: "DRAFT" as "DRAFT" | "PUBLISHED" });
  const [showNewPage, setShowNewPage] = useState(false);
  const [newPageForm, setNewPageForm] = useState({ title: "", content: "" });
  const [savingPage, setSavingPage] = useState(false);

  // FAQ state
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [addingFaq, setAddingFaq] = useState(false);

  function startEditPage(page: CmsPage) {
    setEditingPage(page.id);
    const contentStr = typeof page.content === "string" ? page.content : JSON.stringify(page.content, null, 2);
    setPageForm({ title: page.title, content: contentStr, status: (page.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT") as "DRAFT" | "PUBLISHED" });
  }

  async function handleSavePage(pageId: string) {
    setSavingPage(true);
    try {
      await updateCmsPageAction(tenantId, pageId, {
        title: pageForm.title,
        content: pageForm.content,
        status: pageForm.status,
      });
      toast.success("Page saved");
      setEditingPage(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingPage(false);
    }
  }

  async function handleDeletePage(pageId: string, title: string) {
    if (!confirm(`Delete page "${title}"?`)) return;
    try {
      await deleteCmsPageAction(tenantId, pageId);
      toast.success("Page deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function handleCreatePage(e: React.FormEvent) {
    e.preventDefault();
    if (!newPageForm.title.trim()) { toast.error("Title required"); return; }
    setSavingPage(true);
    try {
      await createCmsPageAction(tenantId, { title: newPageForm.title, content: newPageForm.content || undefined });
      toast.success("Page created");
      setNewPageForm({ title: "", content: "" });
      setShowNewPage(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setSavingPage(false);
    }
  }

  async function handleTogglePublished(pageId: string, currentStatus: string) {
    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await updateCmsPageAction(tenantId, pageId, { status: newStatus as "DRAFT" | "PUBLISHED" });
      toast.success(newStatus === "PUBLISHED" ? "Page published" : "Page unpublished");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  }

  async function handleAddFaq(e: React.FormEvent) {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      toast.error("Question and answer required");
      return;
    }
    setAddingFaq(true);
    try {
      await createFaqAction(tenantId, faqForm);
      toast.success("FAQ added");
      setFaqForm({ question: "", answer: "" });
      setShowFaqForm(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add FAQ");
    } finally {
      setAddingFaq(false);
    }
  }

  async function handleDeleteFaq(faqId: string) {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await deleteFaqAction(tenantId, faqId);
      toast.success("FAQ deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Website CMS</h1>
        <p className="text-muted-foreground mt-1">
          Edit your public website pages, blog posts, and FAQs.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Pages", value: stats.pages, icon: FileText, href: null },
          { label: "Blog Posts", value: stats.posts, icon: Globe, href: "/dashboard/blog" },
          { label: "FAQs", value: stats.faqs, icon: HelpCircle, href: null },
        ].map(({ label, value, icon: Icon, href }) => (
          <Card key={label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              {href && (
                <Link href={href} className="text-xs text-primary hover:underline mt-1 block">
                  View all →
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/blog">Manage Blog Posts</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/settings/branding">Branding & Theme</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/settings/domains">Custom Domains</Link>
        </Button>
      </div>

      {/* CMS Pages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              CMS Pages ({pages.length})
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowNewPage(!showNewPage)}>
              <Plus className="h-4 w-4 me-1" />New Page
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showNewPage && (
            <form onSubmit={handleCreatePage} className="rounded-lg border p-4 space-y-3 bg-muted/30">
              <p className="font-medium text-sm">New CMS Page</p>
              <div className="space-y-1">
                <Label className="text-xs">Title *</Label>
                <Input value={newPageForm.title}
                  onChange={(e) => setNewPageForm({ ...newPageForm, title: e.target.value })}
                  placeholder="e.g. About Us" className="h-8" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Initial Content</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newPageForm.content}
                  onChange={(e) => setNewPageForm({ ...newPageForm, content: e.target.value })}
                  placeholder="Page content..." />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={savingPage}>{savingPage ? "Creating..." : "Create"}</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowNewPage(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {pages.map((page) => (
            <div key={page.id} className="rounded-lg border">
              {editingPage === page.id ? (
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Title</Label>
                    <Input value={pageForm.title}
                      onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })} className="h-8" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Content</Label>
                    <textarea
                      className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                      value={pageForm.content}
                      onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id={`pub-${page.id}`} checked={pageForm.status === "PUBLISHED"}
                      onChange={(e) => setPageForm({ ...pageForm, status: e.target.checked ? "PUBLISHED" : "DRAFT" })} className="h-4 w-4" />
                    <Label htmlFor={`pub-${page.id}`} className="text-sm">Published</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSavePage(page.id)} disabled={savingPage}>
                      <Save className="h-4 w-4 me-1" />{savingPage ? "Saving..." : "Save"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingPage(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{page.title}</p>
                    <p className="text-xs text-muted-foreground">/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={page.status === "PUBLISHED" ? "default" : "secondary"}
                      className="cursor-pointer text-xs"
                      onClick={() => handleTogglePublished(page.id, page.status)}
                    >
                      {page.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => startEditPage(page)} className="h-7 w-7 p-0">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeletePage(page.id, page.title)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {pages.length === 0 && !showNewPage && (
            <p className="text-muted-foreground text-sm text-center py-4">No CMS pages yet.</p>
          )}
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              FAQs ({faqs.length})
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowFaqForm(!showFaqForm)}>
              <Plus className="h-4 w-4 me-1" />Add FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showFaqForm && (
            <form onSubmit={handleAddFaq} className="rounded-lg border p-4 space-y-3 bg-muted/30">
              <p className="font-medium text-sm">New FAQ</p>
              <div className="space-y-1">
                <Label className="text-xs">Question *</Label>
                <Input value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="e.g. How do I book a session?" className="h-8" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Answer *</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Your answer..." required />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={addingFaq}>{addingFaq ? "Adding..." : "Add FAQ"}</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowFaqForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          <div className="divide-y">
            {faqs.map((faq) => (
              <div key={faq.id} className="py-4 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{faq.question}</p>
                  <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleDeleteFaq(faq.id)}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {faqs.length === 0 && (
              <p className="text-muted-foreground text-sm py-4 text-center">No FAQs yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
