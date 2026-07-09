"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Lock } from "lucide-react";
import { updateWhiteLabel } from "@/features/white-label/actions/branding-actions";
import Link from "next/link";

type Config = {
  theme?: {
    logoUrl?: string | null;
    faviconUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    fontFamily?: string | null;
    headingFont?: string | null;
  } | null;
  settings?: {
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    emailFromName?: string | null;
    emailFromAddress?: string | null;
    emailLogoUrl?: string | null;
    emailPrimaryColor?: string | null;
    emailFooterText?: string | null;
  } | null;
} | null;

interface Props {
  tenantId: string;
  config: Config;
  hasWhiteLabel: boolean;
}

export function BrandingClient({ tenantId, config, hasWhiteLabel }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    logoUrl: config?.theme?.logoUrl ?? "",
    faviconUrl: config?.theme?.faviconUrl ?? "",
    primaryColor: config?.theme?.primaryColor ?? "#6366f1",
    secondaryColor: config?.theme?.secondaryColor ?? "",
    accentColor: config?.theme?.accentColor ?? "",
    fontFamily: config?.theme?.fontFamily ?? "Inter",
    headingFont: config?.theme?.headingFont ?? "",
    seoTitle: config?.settings?.seoTitle ?? "",
    seoDescription: config?.settings?.seoDescription ?? "",
    seoKeywords: config?.settings?.seoKeywords ?? "",
    emailFromName: config?.settings?.emailFromName ?? "",
    emailFromAddress: config?.settings?.emailFromAddress ?? "",
    emailLogoUrl: config?.settings?.emailLogoUrl ?? "",
    emailPrimaryColor: config?.settings?.emailPrimaryColor ?? "#6366f1",
    emailFooterText: config?.settings?.emailFooterText ?? "",
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateWhiteLabel({
        tenantId,
        logoUrl: form.logoUrl || null,
        faviconUrl: form.faviconUrl || null,
        primaryColor: form.primaryColor || undefined,
        secondaryColor: form.secondaryColor || undefined,
        accentColor: form.accentColor || undefined,
        fontFamily: form.fontFamily || undefined,
        headingFont: form.headingFont || undefined,
        seoTitle: form.seoTitle || null,
        seoDescription: form.seoDescription || null,
        seoKeywords: form.seoKeywords || null,
        emailFromName: form.emailFromName || null,
        emailFromAddress: form.emailFromAddress || null,
        emailLogoUrl: form.emailLogoUrl || null,
        emailPrimaryColor: form.emailPrimaryColor || undefined,
        emailFooterText: form.emailFooterText || null,
      });
      toast.success("Branding settings saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!hasWhiteLabel) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Palette className="h-8 w-8" />White Label Branding
          </h1>
        </div>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Lock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">White Label not available on your plan</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upgrade to Professional or above to customize branding.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/settings/subscription">Upgrade Plan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Palette className="h-8 w-8" />White Label Branding
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize your brand identity for clients and public pages.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Visual Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visual Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" type="url" placeholder="https://cdn.example.com/logo.png"
                value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
              {form.logoUrl && (
                <img src={form.logoUrl} alt="Logo preview" className="h-12 mt-2 object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input id="faviconUrl" type="url" placeholder="https://cdn.example.com/favicon.ico"
                value={form.faviconUrl} onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="h-10 w-12 cursor-pointer rounded border" />
                  <Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="h-10 font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.secondaryColor || "#64748b"}
                    onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    className="h-10 w-12 cursor-pointer rounded border" />
                  <Input value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} className="h-10 font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.accentColor || "#f97316"}
                    onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                    className="h-10 w-12 cursor-pointer rounded border" />
                  <Input value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="h-10 font-mono" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Body Font</Label>
                <Input id="fontFamily" placeholder="Inter" value={form.fontFamily}
                  onChange={(e) => setForm({ ...form, fontFamily: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headingFont">Heading Font</Label>
                <Input id="headingFont" placeholder="Same as body" value={form.headingFont}
                  onChange={(e) => setForm({ ...form, headingFont: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SEO & Meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input id="seoTitle" placeholder="My Coaching Business" value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDescription">Meta Description</Label>
              <textarea id="seoDescription"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Transform your fitness with professional coaching..."
                value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoKeywords">Keywords (comma-separated)</Label>
              <Input id="seoKeywords" placeholder="personal trainer, fitness coach, nutrition" value={form.seoKeywords}
                onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        {/* Email Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emailFromName">From Name</Label>
                <Input id="emailFromName" placeholder="Coach John" value={form.emailFromName}
                  onChange={(e) => setForm({ ...form, emailFromName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailFromAddress">From Email</Label>
                <Input id="emailFromAddress" type="email" placeholder="hello@mycoach.com" value={form.emailFromAddress}
                  onChange={(e) => setForm({ ...form, emailFromAddress: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailLogoUrl">Email Logo URL</Label>
              <Input id="emailLogoUrl" type="url" placeholder="https://..." value={form.emailLogoUrl}
                onChange={(e) => setForm({ ...form, emailLogoUrl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailFooterText">Email Footer Text</Label>
              <textarea id="emailFooterText"
                className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="© 2026 My Coaching Business. All rights reserved."
                value={form.emailFooterText} onChange={(e) => setForm({ ...form, emailFooterText: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Branding Settings"}
        </Button>
      </form>
    </div>
  );
}
