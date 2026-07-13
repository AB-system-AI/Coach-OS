"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signUp } from "@/lib/auth/client";
import { createTenant } from "@/features/tenancy/actions/tenant-actions";
import { completeOnboarding } from "@/features/onboarding/actions/onboarding-actions";
import {
  BUSINESS_TYPES,
  COACHING_SPECIALTIES,
  getAutoEnabledModules,
} from "@/features/modules";
import type { BusinessType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  Globe,
  Palette,
  Building2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PLATFORM_DOMAIN } from "@/features/tenancy/types";

const STEPS = ["Your Business", "Location", "Your Brand"];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Egypt",
  "Saudi Arabia",
  "UAE",
  "India",
  "Brazil",
  "Mexico",
  "Spain",
  "Italy",
  "Netherlands",
  "South Africa",
];

const LANGUAGES = ["English", "Arabic", "Spanish", "French", "German", "Portuguese"];

const BRAND_PRESETS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#ef4444",
  "#0ea5e9",
];

type WizardState = {
  name: string;
  email: string;
  password: string;
  businessName: string;
  tenantId: string;
  businessType: BusinessType | "";
  coachingSpecialty: string;
  country: string;
  language: string;
  brandColor: string;
};

const initialState: WizardState = {
  name: "",
  email: "",
  password: "",
  businessName: "",
  tenantId: "",
  businessType: "",
  coachingSpecialty: "",
  country: "",
  language: "English",
  brandColor: "#6366f1",
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
  });
  const [loading, setLoading] = useState(false);

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function selectBusinessType(type: BusinessType) {
    update("businessType", type);
    const specialties = COACHING_SPECIALTIES[type];
    if (specialties?.[0]) {
      update("coachingSpecialty", specialties[0]);
    }
  }

  const websitePreview =
    state.businessName
      ? `${state.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.${PLATFORM_DOMAIN}`
      : `yourname.${PLATFORM_DOMAIN}`;

  const autoModuleCount = state.businessType
    ? getAutoEnabledModules(state.businessType).length
    : 0;

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
      toast.success("Welcome to CoachOS! Let's set up your coaching business.");
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
      const result = await completeOnboarding({
        tenantId: state.tenantId,
        businessType: state.businessType,
        coachingSpecialty: state.coachingSpecialty,
        country: state.country,
        language: state.language,
        businessName: state.businessName,
        brandColor: state.brandColor,
        businessEmail: state.email || userEmail,
      });

      if (result && !result.success) {
        toast.error(result.error);
        setLoading(false);
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "NEXT_REDIRECT" || error.message.includes("NEXT_REDIRECT"))
      ) {
        return;
      }
      toast.error(error instanceof Error ? error.message : "Onboarding failed");
      setLoading(false);
    }
  }

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${state.brandColor}, ${state.brandColor}99)`,
          }}
        >
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to CoachOS</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Your coaching business, ready in minutes
        </p>
      </motion.div>

      {step > 0 && (
        <div className="flex items-center justify-center gap-3 mb-8">
          {STEPS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={label} className="flex items-center gap-2">
                <motion.div
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isDone && "bg-primary text-primary-foreground",
                    isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isDone && !isActive && "bg-muted text-muted-foreground"
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : stepNum}
                </motion.div>
                <span
                  className={cn(
                    "text-sm hidden sm:block",
                    isActive ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-0.5 w-6 sm:w-10", isDone ? "bg-primary" : "bg-muted")} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <motion.div
        layout
        className="rounded-2xl border bg-background/80 backdrop-blur-xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="account"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-semibold">Create Your Coach Account</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    14-day free trial — no credit card required
                  </p>
                </div>
                {[
                  { id: "name", label: "Your Name", key: "name" as const },
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
                      className="h-11"
                    />
                  </div>
                ))}
                <Button
                  className="w-full h-11 text-base"
                  onClick={handleAccountCreate}
                  disabled={
                    loading ||
                    !state.name ||
                    !state.email ||
                    !state.password ||
                    !state.businessName
                  }
                >
                  {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  Get Started
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="business"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    What type of coaching business?
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    We&apos;ll configure everything automatically for you
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pe-1">
                  {BUSINESS_TYPES.map((bt) => (
                    <button
                      key={bt.type}
                      type="button"
                      onClick={() => selectBusinessType(bt.type)}
                      className={cn(
                        "text-start rounded-xl border p-3 transition-all hover:border-primary hover:shadow-sm",
                        state.businessType === bt.type &&
                          "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                      )}
                    >
                      <p className="font-medium text-sm">{bt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{bt.description}</p>
                    </button>
                  ))}
                </div>
                {state.businessType && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-2"
                  >
                    <Label>Coaching Specialty</Label>
                    <Select
                      value={state.coachingSpecialty}
                      onValueChange={(v) => update("coachingSpecialty", v)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {COACHING_SPECIALTIES[state.businessType]?.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
                {autoModuleCount > 0 && (
                  <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/10 p-3">
                    <Zap className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{autoModuleCount} features</span>{" "}
                      will be enabled automatically — clients, programs, payments, website, and more.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="location"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Where do you coach?
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    We&apos;ll localize your website and marketplace profile
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select value={state.country} onValueChange={(v) => update("country", v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={state.language} onValueChange={(v) => update("language", v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="brand"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Brand your coaching business
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Your website, dashboard, and client experience — all themed instantly
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    value={state.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brand Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {BRAND_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => update("brandColor", color)}
                        className={cn(
                          "h-10 w-10 rounded-xl border-2 transition-transform hover:scale-110",
                          state.brandColor === color
                            ? "border-foreground scale-110 ring-2 ring-offset-2 ring-foreground/20"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                    <input
                      type="color"
                      value={state.brandColor}
                      onChange={(e) => update("brandColor", e.target.value)}
                      className="h-10 w-10 rounded-xl border cursor-pointer"
                    />
                  </div>
                </div>
                <motion.div
                  layout
                  className="rounded-2xl overflow-hidden border"
                  style={{
                    background: `linear-gradient(135deg, ${state.brandColor}, ${state.brandColor}88)`,
                  }}
                >
                  <div className="p-6 text-white text-center">
                    <p className="text-xs uppercase tracking-widest opacity-80 mb-2">Your Coach Website</p>
                    <p className="text-2xl font-bold">{state.businessName || "Your Business"}</p>
                    <p className="text-sm opacity-90 mt-2">{state.coachingSpecialty}</p>
                    <Badge variant="secondary" className="mt-4 bg-white/20 text-white border-0">
                      {websitePreview}
                    </Badge>
                  </div>
                </motion.div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                  {["Hero", "Programs", "Booking"].map((section) => (
                    <div
                      key={section}
                      className="rounded-lg border p-2 bg-muted/30"
                      style={{ borderColor: `${state.brandColor}33` }}
                    >
                      {section}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step > 0 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(existingTenantId ? 1 : 0, s - 1))}
                disabled={step <= (existingTenantId ? 1 : 0) || loading}
                className="h-11"
              >
                <ChevronLeft className="h-4 w-4 me-1" />
                Back
              </Button>
              {step < 3 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={
                    (step === 1 && (!state.businessType || !state.coachingSpecialty)) ||
                    (step === 2 && !state.country) ||
                    loading
                  }
                  className="h-11"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ms-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={loading || !state.businessName}
                  className="h-11 px-6"
                  style={{ backgroundColor: state.brandColor }}
                >
                  {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  Launch My Coaching Business
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
