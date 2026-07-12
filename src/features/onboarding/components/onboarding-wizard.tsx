"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth/client";
import { createTenant } from "@/features/tenancy/actions/tenant-actions";
import { completeOnboarding } from "@/features/onboarding/actions/onboarding-actions";
import {
  BUSINESS_TYPES,
  MODULE_REGISTRY,
  getRecommendedModules,
  isPlanSufficient,
} from "@/features/modules";
import { PLAN_DEFINITIONS } from "@/features/subscriptions/types/plan-limits";
import type { BusinessType, SubscriptionPlan, TenantModuleKey } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronLeft, ChevronRight, Loader2, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STEPS = [
  "Business Type",
  "Branding",
  "Contact",
  "Plan",
  "Modules",
];

const PLANS: SubscriptionPlan[] = ["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"];

type WizardState = {
  // Account (step 0 - before wizard if new user)
  name: string;
  email: string;
  password: string;
  businessName: string;
  tenantId: string;
  // Step 1
  businessType: BusinessType | "";
  // Step 2
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  // Step 3
  businessEmail: string;
  businessPhone: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  city: string;
  country: string;
  // Step 4
  plan: SubscriptionPlan;
  // Step 5
  modules: Set<TenantModuleKey>;
};

const initialState: WizardState = {
  name: "",
  email: "",
  password: "",
  businessName: "",
  tenantId: "",
  businessType: "",
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  fontFamily: "Inter",
  businessEmail: "",
  businessPhone: "",
  whatsappNumber: "",
  instagramUrl: "",
  facebookUrl: "",
  city: "",
  country: "",
  plan: "STARTER",
  modules: new Set(),
};

type OnboardingWizardProps = {
  existingTenantId?: string;
  existingBusinessName?: string;
  userEmail?: string;
};

export function OnboardingWizard({
  existingTenantId,
  existingBusinessName,
  userEmail,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(existingTenantId ? 1 : 0);
  const [state, setState] = useState<WizardState>({
    ...initialState,
    tenantId: existingTenantId ?? "",
    businessName: existingBusinessName ?? "",
    email: userEmail ?? "",
    businessEmail: userEmail ?? "",
  });
  const [loading, setLoading] = useState(false);

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function selectBusinessType(type: BusinessType) {
    update("businessType", type);
    const recommended = getRecommendedModules(type);
    update("modules", new Set(recommended));
  }

  function toggleModule(key: TenantModuleKey) {
    const next = new Set(state.modules);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    update("modules", next);
  }

  async function handleAccountCreate() {
    setLoading(true);
    try {
      const result = await signUp.email({
        email: state.email,
        password: state.password,
        name: state.name,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Registration failed");
        return;
      }
      if (!result.data?.user?.id) return;

      const tenant = await createTenant({
        name: state.businessName,
        ownerUserId: result.data.user.id,
      });

      update("tenantId", tenant.id);
      setStep(1);
      toast.success("Account created! Let's set up your business.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (!state.businessType || !state.tenantId) return;
    setLoading(true);
    try {
      await completeOnboarding({
        tenantId: state.tenantId,
        step1: {
          businessType: state.businessType,
          businessName: state.businessName,
        },
        step2: {
          primaryColor: state.primaryColor,
          secondaryColor: state.secondaryColor,
          fontFamily: state.fontFamily,
          headingFont: state.fontFamily,
        },
        step3: {
          businessEmail: state.businessEmail || state.email,
          businessPhone: state.businessPhone,
          whatsappNumber: state.whatsappNumber,
          instagramUrl: state.instagramUrl,
          facebookUrl: state.facebookUrl,
          city: state.city,
          country: state.country,
        },
        step4: { plan: state.plan },
        step5: { modules: Array.from(state.modules) },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Onboarding failed");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Dumbbell className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Welcome to TrainerOS</h1>
        <p className="text-muted-foreground mt-1">
          Set up your business in 5 simple steps
        </p>
      </div>

      {step > 0 && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                    isDone && "bg-primary text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                    !isDone && !isActive && "bg-muted text-muted-foreground"
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : stepNum}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-0.5 w-8", isDone ? "bg-primary" : "bg-muted")} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          {/* Step 0: Account */}
          {step === 0 && (
            <div className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Create Your Account</CardTitle>
                <CardDescription>Start your 14-day free trial</CardDescription>
              </CardHeader>
              {[
                { id: "name", label: "Full Name", key: "name" as const },
                { id: "businessName", label: "Business Name", key: "businessName" as const },
                { id: "email", label: "Email", key: "email" as const, type: "email" },
                { id: "password", label: "Password", key: "password" as const, type: "password" },
              ].map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input
                    id={field.id}
                    type={field.type ?? "text"}
                    value={state[field.key] as string}
                    onChange={(e) => update(field.key, e.target.value)}
                    required
                  />
                </div>
              ))}
              <Button
                className="w-full"
                onClick={handleAccountCreate}
                disabled={loading || !state.name || !state.email || !state.password || !state.businessName}
              >
                {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </div>
          )}

          {/* Step 1: Business Type */}
          {step === 1 && (
            <div className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>What type of business are you?</CardTitle>
                <CardDescription>We&apos;ll recommend the right modules for you</CardDescription>
              </CardHeader>
              <div className="grid sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {BUSINESS_TYPES.map((bt) => (
                  <button
                    key={bt.type}
                    type="button"
                    onClick={() => selectBusinessType(bt.type)}
                    className={cn(
                      "text-start rounded-lg border p-3 transition-all hover:border-primary",
                      state.businessType === bt.type && "border-primary bg-primary/5 ring-1 ring-primary"
                    )}
                  >
                    <p className="font-medium text-sm">{bt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{bt.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Branding */}
          {step === 2 && (
            <div className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Brand Your Business</CardTitle>
                <CardDescription>Logo, colors, and fonts — fully white-labeled</CardDescription>
              </CardHeader>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={state.primaryColor}
                      onChange={(e) => update("primaryColor", e.target.value)}
                      className="h-9 w-12 rounded border cursor-pointer"
                    />
                    <Input
                      value={state.primaryColor}
                      onChange={(e) => update("primaryColor", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={state.secondaryColor}
                      onChange={(e) => update("secondaryColor", e.target.value)}
                      className="h-9 w-12 rounded border cursor-pointer"
                    />
                    <Input
                      value={state.secondaryColor}
                      onChange={(e) => update("secondaryColor", e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={state.fontFamily}
                  onValueChange={(value) => update("fontFamily", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Inter", "Roboto", "Poppins", "Montserrat", "Open Sans"].map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div
                className="rounded-lg p-6 text-center"
                style={{
                  background: `linear-gradient(135deg, ${state.primaryColor}, ${state.secondaryColor})`,
                }}
              >
                <p className="text-white font-bold text-lg" style={{ fontFamily: state.fontFamily }}>
                  {state.businessName || "Your Brand Preview"}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Contact */}
          {step === 3 && (
            <div className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Contact & Social</CardTitle>
                <CardDescription>How clients can reach you</CardDescription>
              </CardHeader>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Business Email", key: "businessEmail" as const, type: "email" },
                  { label: "Phone", key: "businessPhone" as const },
                  { label: "WhatsApp", key: "whatsappNumber" as const },
                  { label: "Instagram URL", key: "instagramUrl" as const },
                  { label: "Facebook URL", key: "facebookUrl" as const },
                  { label: "City", key: "city" as const },
                  { label: "Country", key: "country" as const },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Input
                      type={field.type}
                      value={state[field.key]}
                      onChange={(e) => update(field.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Plan */}
          {step === 4 && (
            <div className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Choose Your Plan</CardTitle>
                <CardDescription>14-day free trial on all plans</CardDescription>
              </CardHeader>
              <div className="grid sm:grid-cols-2 gap-4">
                {PLANS.map((planKey) => {
                  const plan = PLAN_DEFINITIONS[planKey];
                  return (
                    <button
                      key={planKey}
                      type="button"
                      onClick={() => update("plan", planKey)}
                      className={cn(
                        "text-start rounded-xl border p-4 transition-all",
                        state.plan === planKey && "border-primary ring-2 ring-primary/20"
                      )}
                    >
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-2xl font-bold mt-1">
                        ${plan.monthlyPrice}
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Modules */}
          {step === 5 && (
            <div className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Choose Your Modules</CardTitle>
                <CardDescription>
                  Enable the features you need. Change anytime from settings.
                </CardDescription>
              </CardHeader>
              <div className="grid sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {Object.values(MODULE_REGISTRY).map((mod) => {
                  const available = isPlanSufficient(state.plan, mod.minPlan);
                  const enabled = state.modules.has(mod.key);
                  return (
                    <button
                      key={mod.key}
                      type="button"
                      disabled={!available}
                      onClick={() => available && toggleModule(mod.key)}
                      className={cn(
                        "text-start rounded-lg border p-3 transition-all",
                        enabled && available && "border-primary bg-primary/5",
                        !available && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{mod.name}</p>
                        {enabled && available && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                      {mod.minPlan && !available && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Requires {mod.minPlan}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          {step > 0 && (
            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(existingTenantId ? 1 : 0, s - 1))}
                disabled={step <= (existingTenantId ? 1 : 0) || loading}
              >
                <ChevronLeft className="h-4 w-4 me-1" />
                Back
              </Button>
              {step < 5 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={
                    (step === 1 && !state.businessType) ||
                    loading
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4 ms-1" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading || state.modules.size === 0}>
                  {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  Launch Dashboard
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
