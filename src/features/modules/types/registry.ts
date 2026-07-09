import type { BusinessType, TenantModuleKey, SubscriptionPlan } from "@prisma/client";

export type ModuleDefinition = {
  key: TenantModuleKey;
  name: string;
  description: string;
  icon: string;
  minPlan?: SubscriptionPlan;
  defaultEnabled: boolean;
};

export const MODULE_REGISTRY: Record<TenantModuleKey, ModuleDefinition> = {
  PROGRAMS: {
    key: "PROGRAMS",
    name: "Programs",
    description: "Workout programs and client assignments",
    icon: "Dumbbell",
    defaultEnabled: true,
  },
  NUTRITION: {
    key: "NUTRITION",
    name: "Nutrition",
    description: "Meal plans, recipes, and macro tracking",
    icon: "UtensilsCrossed",
    defaultEnabled: true,
  },
  RECOVERY: {
    key: "RECOVERY",
    name: "Recovery",
    description: "Recovery services and online booking",
    icon: "Heart",
    defaultEnabled: true,
  },
  MARKETPLACE: {
    key: "MARKETPLACE",
    name: "Marketplace",
    description: "Public profile on TrainerOS marketplace",
    icon: "Store",
    minPlan: "STARTER",
    defaultEnabled: false,
  },
  COURSES: {
    key: "COURSES",
    name: "Courses",
    description: "Online courses with lessons, quizzes, certificates",
    icon: "GraduationCap",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  BLOG: {
    key: "BLOG",
    name: "Blog",
    description: "Content marketing and SEO blog",
    icon: "FileText",
    defaultEnabled: true,
  },
  SHOP: {
    key: "SHOP",
    name: "Shop",
    description: "Sell supplements, equipment, gift cards",
    icon: "ShoppingBag",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  BOOKINGS: {
    key: "BOOKINGS",
    name: "Bookings",
    description: "Appointments and calendar management",
    icon: "Calendar",
    defaultEnabled: true,
  },
  AI: {
    key: "AI",
    name: "AI Assistant",
    description: "AI meal, workout, and client insights",
    icon: "Sparkles",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  REPORTS: {
    key: "REPORTS",
    name: "Reports",
    description: "Revenue, growth, and analytics",
    icon: "BarChart3",
    defaultEnabled: true,
  },
  CRM: {
    key: "CRM",
    name: "CRM",
    description: "Leads, pipeline, tasks, and customer timeline",
    icon: "Users",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  LOYALTY: {
    key: "LOYALTY",
    name: "Loyalty",
    description: "Points, badges, referrals, membership levels",
    icon: "Award",
    minPlan: "BUSINESS",
    defaultEnabled: false,
  },
  CHALLENGES: {
    key: "CHALLENGES",
    name: "Challenges",
    description: "30-day challenges with leaderboards",
    icon: "Trophy",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  COMMUNITY: {
    key: "COMMUNITY",
    name: "Community",
    description: "Groups, posts, comments, announcements",
    icon: "MessageCircle",
    minPlan: "BUSINESS",
    defaultEnabled: false,
  },
  AUTOMATION: {
    key: "AUTOMATION",
    name: "Automation",
    description: "Automatic emails, reminders, welcome messages",
    icon: "Zap",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  MARKETING: {
    key: "MARKETING",
    name: "Marketing",
    description: "SEO, pixels, campaigns, landing pages",
    icon: "Megaphone",
    defaultEnabled: true,
  },
  DIGITAL_PRODUCTS: {
    key: "DIGITAL_PRODUCTS",
    name: "Digital Products",
    description: "Sell PDFs, ebooks, templates, downloads",
    icon: "Download",
    minPlan: "STARTER",
    defaultEnabled: false,
  },
  FINANCE: {
    key: "FINANCE",
    name: "Finance",
    description: "Revenue, expenses, profit, wallet, withdrawals, refunds",
    icon: "Wallet",
    defaultEnabled: true,
  },
  STAFF: {
    key: "STAFF",
    name: "Staff",
    description: "Coaches, reception, nutritionists, physiotherapists, managers",
    icon: "UserCog",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  ATTENDANCE: {
    key: "ATTENDANCE",
    name: "Attendance",
    description: "QR, barcode, NFC, and manual check-in",
    icon: "ScanLine",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  SMART_CALENDAR: {
    key: "SMART_CALENDAR",
    name: "Smart Calendar",
    description: "Drag & drop calendar with Google and Outlook sync",
    icon: "CalendarDays",
    defaultEnabled: true,
  },
  FORMS_BUILDER: {
    key: "FORMS_BUILDER",
    name: "Forms Builder",
    description: "Custom injury, medical, registration, and consultation forms",
    icon: "FileInput",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  AUTOMATION_BUILDER: {
    key: "AUTOMATION_BUILDER",
    name: "Automation Builder",
    description: "Zapier-like workflows: triggers, actions, conditions",
    icon: "Workflow",
    minPlan: "BUSINESS",
    defaultEnabled: false,
  },
  AI_VOICE: {
    key: "AI_VOICE",
    name: "AI Voice Notes",
    description: "Record voice, auto-transcribe, and save notes",
    icon: "Mic",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  MEDIA_PRO: {
    key: "MEDIA_PRO",
    name: "Media Library Pro",
    description: "Folders, tags, compression, CDN, video streaming",
    icon: "FolderTree",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  AUDIT_CENTER: {
    key: "AUDIT_CENTER",
    name: "Audit Center",
    description: "Track every change with who, when, why, and rollback",
    icon: "ShieldCheck",
    minPlan: "BUSINESS",
    defaultEnabled: false,
  },
  BACKUP: {
    key: "BACKUP",
    name: "Backup Center",
    description: "Backup, restore, export, and import tenant data",
    icon: "HardDrive",
    minPlan: "BUSINESS",
    defaultEnabled: false,
  },
  THEME_BUILDER: {
    key: "THEME_BUILDER",
    name: "Theme Builder",
    description: "Full visual theme builder beyond color presets",
    icon: "Palette",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  LANDING_BUILDER: {
    key: "LANDING_BUILDER",
    name: "Landing Page Builder",
    description: "Framer-like sections, blocks, drag & drop pages",
    icon: "LayoutTemplate",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  EMAIL_BUILDER: {
    key: "EMAIL_BUILDER",
    name: "Email Builder",
    description: "Mailchimp-like templates and campaign builder",
    icon: "Mail",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  INVOICE_DESIGNER: {
    key: "INVOICE_DESIGNER",
    name: "Invoice Designer",
    description: "Custom invoices with logo, QR, and tax settings",
    icon: "Receipt",
    defaultEnabled: true,
  },
  INTEGRATIONS: {
    key: "INTEGRATIONS",
    name: "Integrations",
    description: "Stripe, Paymob, WhatsApp, Zoom, Google, analytics pixels",
    icon: "Plug",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  GAMIFICATION: {
    key: "GAMIFICATION",
    name: "Gamification",
    description: "Levels, XP, achievements, badges, leaderboards",
    icon: "Gamepad2",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  MULTI_BRAND: {
    key: "MULTI_BRAND",
    name: "Multi Brand",
    description: "Manage multiple brands under one company",
    icon: "Layers",
    minPlan: "ENTERPRISE",
    defaultEnabled: false,
  },
  FRANCHISE: {
    key: "FRANCHISE",
    name: "Franchise",
    description: "Multi-location franchise management",
    icon: "Building2",
    minPlan: "ENTERPRISE",
    defaultEnabled: false,
  },
  POS: {
    key: "POS",
    name: "POS",
    description: "In-gym point of sale",
    icon: "ShoppingCart",
    minPlan: "BUSINESS",
    defaultEnabled: false,
  },
  INVENTORY: {
    key: "INVENTORY",
    name: "Inventory",
    description: "Supplements, equipment, apparel stock",
    icon: "Package",
    minPlan: "BUSINESS",
    defaultEnabled: false,
  },
  PAYROLL: {
    key: "PAYROLL",
    name: "Staff Payroll",
    description: "Salaries, commissions, and deductions",
    icon: "Banknote",
    minPlan: "BUSINESS",
    defaultEnabled: false,
  },
  MEMBERSHIP_CARDS: {
    key: "MEMBERSHIP_CARDS",
    name: "Membership Cards",
    description: "QR, barcode, and NFC membership cards",
    icon: "CreditCard",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  AFFILIATE: {
    key: "AFFILIATE",
    name: "Affiliate System",
    description: "Affiliate partners, commissions, and tracking",
    icon: "Share2",
    minPlan: "BUSINESS",
    defaultEnabled: false,
  },
  NOTIFICATION_CENTER: {
    key: "NOTIFICATION_CENTER",
    name: "Notification Center",
    description: "Email, SMS, WhatsApp, push, and in-app channels",
    icon: "Bell",
    defaultEnabled: true,
  },
  HELP_CENTER: {
    key: "HELP_CENTER",
    name: "Help Center",
    description: "Knowledge base, support tickets, and FAQs",
    icon: "LifeBuoy",
    defaultEnabled: true,
  },
  SECURITY_CENTER: {
    key: "SECURITY_CENTER",
    name: "Security Center",
    description: "Sessions, devices, 2FA, login history, API logs",
    icon: "Lock",
    minPlan: "BUSINESS",
    defaultEnabled: false,
  },
  CLIENT_APP: {
    key: "CLIENT_APP",
    name: "Client App",
    description: "Mobile client app: meals, workouts, progress, chat",
    icon: "Smartphone",
    minPlan: "PROFESSIONAL",
    defaultEnabled: false,
  },
  MOBILE_API: {
    key: "MOBILE_API",
    name: "Mobile API",
    description: "Flutter & React Native ready APIs with offline sync",
    icon: "TabletSmartphone",
    minPlan: "PROFESSIONAL",
    defaultEnabled: true,
  },
};

export type BusinessTypeDefinition = {
  type: BusinessType;
  label: string;
  description: string;
  category: "coaching" | "facility" | "therapy";
  recommendedModules: TenantModuleKey[];
};

export const BUSINESS_TYPES: BusinessTypeDefinition[] = [
  { type: "FITNESS_COACH", label: "Fitness Coach", description: "General fitness coaching", category: "coaching", recommendedModules: ["PROGRAMS", "NUTRITION", "RECOVERY", "MARKETPLACE"] },
  { type: "PERSONAL_TRAINER", label: "Personal Trainer", description: "1-on-1 personal training", category: "coaching", recommendedModules: ["PROGRAMS", "BOOKINGS", "CRM", "MARKETPLACE"] },
  { type: "NUTRITION_COACH", label: "Nutrition Coach", description: "Meal plans and nutrition", category: "coaching", recommendedModules: ["NUTRITION", "DIGITAL_PRODUCTS", "COURSES"] },
  { type: "GYM", label: "Gym", description: "Fitness facility", category: "facility", recommendedModules: ["BOOKINGS", "SHOP", "LOYALTY", "COMMUNITY"] },
  { type: "FITNESS_ACADEMY", label: "Fitness Academy", description: "Training academy", category: "facility", recommendedModules: ["COURSES", "PROGRAMS", "COMMUNITY", "CRM"] },
  { type: "FOOTBALL_COACH", label: "Football Coach", description: "Soccer/football coaching", category: "coaching", recommendedModules: ["PROGRAMS", "COURSES", "CHALLENGES"] },
  { type: "SWIMMING_COACH", label: "Swimming Coach", description: "Swim coaching", category: "coaching", recommendedModules: ["PROGRAMS", "BOOKINGS", "COURSES"] },
  { type: "CROSSFIT_COACH", label: "CrossFit Coach", description: "CrossFit box coaching", category: "coaching", recommendedModules: ["PROGRAMS", "CHALLENGES", "COMMUNITY"] },
  { type: "YOGA_INSTRUCTOR", label: "Yoga Instructor", description: "Yoga classes and retreats", category: "coaching", recommendedModules: ["COURSES", "BOOKINGS", "DIGITAL_PRODUCTS"] },
  { type: "PILATES_INSTRUCTOR", label: "Pilates Instructor", description: "Pilates instruction", category: "coaching", recommendedModules: ["COURSES", "BOOKINGS", "PROGRAMS"] },
  { type: "BOXING_COACH", label: "Boxing Coach", description: "Boxing and combat sports", category: "coaching", recommendedModules: ["PROGRAMS", "BOOKINGS", "CHALLENGES"] },
  { type: "MARTIAL_ARTS_COACH", label: "Martial Arts Coach", description: "Martial arts dojo", category: "coaching", recommendedModules: ["PROGRAMS", "COURSES", "LOYALTY"] },
  { type: "RUNNING_COACH", label: "Running Coach", description: "Running and endurance", category: "coaching", recommendedModules: ["PROGRAMS", "CHALLENGES", "REPORTS"] },
  { type: "CYCLING_COACH", label: "Cycling Coach", description: "Cycling coaching", category: "coaching", recommendedModules: ["PROGRAMS", "CHALLENGES", "BOOKINGS"] },
  { type: "PHYSIOTHERAPIST", label: "Physiotherapist", description: "Physical therapy", category: "therapy", recommendedModules: ["RECOVERY", "BOOKINGS", "CRM", "DIGITAL_PRODUCTS"] },
  { type: "REHABILITATION_CENTER", label: "Rehabilitation Center", description: "Rehab facility", category: "therapy", recommendedModules: ["RECOVERY", "BOOKINGS", "CRM", "AUTOMATION"] },
  { type: "SPORTS_CLINIC", label: "Sports Clinic", description: "Sports medicine clinic", category: "therapy", recommendedModules: ["RECOVERY", "BOOKINGS", "CRM", "REPORTS"] },
];

export const ALL_MODULE_KEYS = Object.keys(MODULE_REGISTRY) as TenantModuleKey[];

export const PLAN_ORDER: SubscriptionPlan[] = [
  "FREE",
  "STARTER",
  "PROFESSIONAL",
  "BUSINESS",
  "ENTERPRISE",
];

export function isPlanSufficient(
  current: SubscriptionPlan,
  required?: SubscriptionPlan
): boolean {
  if (!required) return true;
  return PLAN_ORDER.indexOf(current) >= PLAN_ORDER.indexOf(required);
}

export function getRecommendedModules(
  businessType: BusinessType
): TenantModuleKey[] {
  const def = BUSINESS_TYPES.find((b) => b.type === businessType);
  return def?.recommendedModules ?? ["PROGRAMS", "BOOKINGS", "REPORTS"];
}
