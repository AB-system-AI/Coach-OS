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
    description: "Public profile on CoachOS marketplace",
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

const CORE_AUTO_MODULES: TenantModuleKey[] = [
  "PROGRAMS",
  "NUTRITION",
  "RECOVERY",
  "BOOKINGS",
  "REPORTS",
  "BLOG",
  "MARKETING",
  "FINANCE",
  "SMART_CALENDAR",
  "NOTIFICATION_CENTER",
  "HELP_CENTER",
  "MARKETPLACE",
  "CRM",
  "MEDIA_PRO",
];

const BUSINESS_AUTO_MODULES: Record<BusinessType, TenantModuleKey[]> = {
  FITNESS_COACH: [
    ...CORE_AUTO_MODULES,
    "CHALLENGES",
    "AUTOMATION",
    "DIGITAL_PRODUCTS",
    "CLIENT_APP",
  ],
  PERSONAL_TRAINER: [
    ...CORE_AUTO_MODULES,
    "AUTOMATION",
    "CHALLENGES",
    "CLIENT_APP",
  ],
  NUTRITION_COACH: [
    ...CORE_AUTO_MODULES,
    "DIGITAL_PRODUCTS",
    "COURSES",
    "AUTOMATION",
    "CLIENT_APP",
  ],
  GYM: [
    ...CORE_AUTO_MODULES,
    "ATTENDANCE",
    "LOYALTY",
    "COMMUNITY",
    "SHOP",
    "STAFF",
    "MEMBERSHIP_CARDS",
    "POS",
    "INVENTORY",
    "CLIENT_APP",
  ],
  FITNESS_ACADEMY: [
    ...CORE_AUTO_MODULES,
    "COURSES",
    "COMMUNITY",
    "CHALLENGES",
    "STAFF",
    "CLIENT_APP",
  ],
  FOOTBALL_COACH: [
    ...CORE_AUTO_MODULES,
    "COURSES",
    "CHALLENGES",
    "CLIENT_APP",
  ],
  SWIMMING_COACH: [
    ...CORE_AUTO_MODULES,
    "COURSES",
    "CLIENT_APP",
  ],
  CROSSFIT_COACH: [
    ...CORE_AUTO_MODULES,
    "CHALLENGES",
    "COMMUNITY",
    "ATTENDANCE",
    "CLIENT_APP",
  ],
  YOGA_INSTRUCTOR: [
    ...CORE_AUTO_MODULES,
    "COURSES",
    "DIGITAL_PRODUCTS",
    "CLIENT_APP",
  ],
  PILATES_INSTRUCTOR: [
    ...CORE_AUTO_MODULES,
    "COURSES",
    "CLIENT_APP",
  ],
  BOXING_COACH: [
    ...CORE_AUTO_MODULES,
    "CHALLENGES",
    "CLIENT_APP",
  ],
  MARTIAL_ARTS_COACH: [
    ...CORE_AUTO_MODULES,
    "COURSES",
    "LOYALTY",
    "CLIENT_APP",
  ],
  RUNNING_COACH: [
    ...CORE_AUTO_MODULES,
    "CHALLENGES",
    "CLIENT_APP",
  ],
  CYCLING_COACH: [
    ...CORE_AUTO_MODULES,
    "CHALLENGES",
    "CLIENT_APP",
  ],
  PHYSIOTHERAPIST: [
    ...CORE_AUTO_MODULES,
    "DIGITAL_PRODUCTS",
    "AUTOMATION",
    "FORMS_BUILDER",
    "CLIENT_APP",
  ],
  REHABILITATION_CENTER: [
    ...CORE_AUTO_MODULES,
    "AUTOMATION",
    "STAFF",
    "FORMS_BUILDER",
    "ATTENDANCE",
    "CLIENT_APP",
  ],
  SPORTS_CLINIC: [
    ...CORE_AUTO_MODULES,
    "STAFF",
    "FORMS_BUILDER",
    "CLIENT_APP",
  ],
};

export const COACHING_SPECIALTIES: Record<BusinessType, string[]> = {
  FITNESS_COACH: [
    "Strength Training",
    "Weight Loss",
    "Body Transformation",
    "Functional Fitness",
    "HIIT",
  ],
  PERSONAL_TRAINER: [
    "1-on-1 Training",
    "Strength & Conditioning",
    "Fat Loss",
    "Muscle Building",
    "Senior Fitness",
  ],
  NUTRITION_COACH: [
    "Meal Planning",
    "Macro Coaching",
    "Sports Nutrition",
    "Weight Management",
    "Plant-Based Nutrition",
  ],
  GYM: [
    "Group Classes",
    "Strength Training",
    "Cardio",
    "Cross-Training",
    "Youth Fitness",
  ],
  FITNESS_ACADEMY: [
    "Coach Certification",
    "Sports Science",
    "Youth Development",
    "Elite Performance",
    "Group Training",
  ],
  FOOTBALL_COACH: [
    "Youth Football",
    "Tactical Training",
    "Goalkeeper Coaching",
    "Fitness for Football",
    "Team Development",
  ],
  SWIMMING_COACH: [
    "Learn to Swim",
    "Competitive Swimming",
    "Open Water",
    "Triathlon Swimming",
    "Adult Swimming",
  ],
  CROSSFIT_COACH: [
    "CrossFit WODs",
    "Olympic Lifting",
    "Competition Prep",
    "Beginner CrossFit",
    "Mobility & Recovery",
  ],
  YOGA_INSTRUCTOR: [
    "Vinyasa Flow",
    "Hatha Yoga",
    "Yin Yoga",
    "Prenatal Yoga",
    "Meditation",
  ],
  PILATES_INSTRUCTOR: [
    "Mat Pilates",
    "Reformer Pilates",
    "Clinical Pilates",
    "Prenatal Pilates",
    "Post-Rehab Pilates",
  ],
  BOXING_COACH: [
    "Boxing Fundamentals",
    "Competition Prep",
    "Fitness Boxing",
    "Pad Work",
    "Self-Defense",
  ],
  MARTIAL_ARTS_COACH: [
    "Brazilian Jiu-Jitsu",
    "MMA",
    "Karate",
    "Muay Thai",
    "Kids Martial Arts",
  ],
  RUNNING_COACH: [
    "Marathon Training",
    "5K/10K Prep",
    "Trail Running",
    "Speed Development",
    "Beginner Running",
  ],
  CYCLING_COACH: [
    "Road Cycling",
    "Indoor Cycling",
    "Triathlon Cycling",
    "Mountain Biking",
    "Endurance Training",
  ],
  PHYSIOTHERAPIST: [
    "Sports Injury Rehab",
    "Post-Surgery Recovery",
    "Manual Therapy",
    "Dry Needling",
    "Movement Assessment",
  ],
  REHABILITATION_CENTER: [
    "Orthopedic Rehab",
    "Neurological Rehab",
    "Sports Recovery",
    "Pain Management",
    "Post-Injury Programs",
  ],
  SPORTS_CLINIC: [
    "Sports Medicine",
    "Injury Prevention",
    "Performance Testing",
    "Return to Sport",
    "Biomechanics",
  ],
};

export function getAutoEnabledModules(businessType: BusinessType): TenantModuleKey[] {
  return BUSINESS_AUTO_MODULES[businessType] ?? CORE_AUTO_MODULES;
}

export function getRecommendedModules(
  businessType: BusinessType
): TenantModuleKey[] {
  return getAutoEnabledModules(businessType);
}

/** Nav items hidden from coach dashboard — technical / super-admin only */
export const COACH_HIDDEN_NAV_KEYS = new Set([
  "enterprise",
  "mobile-api",
  "audit",
  "backup",
  "theme-builder",
  "landing-builder",
  "email-builder",
  "automation-builder",
  "voice-notes",
  "multi-brand",
  "franchise",
  "security",
]);

export const BUSINESS_TYPES: BusinessTypeDefinition[] = [
  { type: "FITNESS_COACH", label: "Fitness Coach", description: "General fitness coaching", category: "coaching", recommendedModules: getAutoEnabledModules("FITNESS_COACH") },
  { type: "PERSONAL_TRAINER", label: "Personal Trainer", description: "1-on-1 personal training", category: "coaching", recommendedModules: getAutoEnabledModules("PERSONAL_TRAINER") },
  { type: "NUTRITION_COACH", label: "Nutrition Coach", description: "Meal plans and nutrition", category: "coaching", recommendedModules: getAutoEnabledModules("NUTRITION_COACH") },
  { type: "GYM", label: "Gym", description: "Fitness facility", category: "facility", recommendedModules: getAutoEnabledModules("GYM") },
  { type: "FITNESS_ACADEMY", label: "Fitness Academy", description: "Training academy", category: "facility", recommendedModules: getAutoEnabledModules("FITNESS_ACADEMY") },
  { type: "FOOTBALL_COACH", label: "Football Coach", description: "Soccer/football coaching", category: "coaching", recommendedModules: getAutoEnabledModules("FOOTBALL_COACH") },
  { type: "SWIMMING_COACH", label: "Swimming Coach", description: "Swim coaching", category: "coaching", recommendedModules: getAutoEnabledModules("SWIMMING_COACH") },
  { type: "CROSSFIT_COACH", label: "CrossFit Coach", description: "CrossFit box coaching", category: "coaching", recommendedModules: getAutoEnabledModules("CROSSFIT_COACH") },
  { type: "YOGA_INSTRUCTOR", label: "Yoga Instructor", description: "Yoga classes and retreats", category: "coaching", recommendedModules: getAutoEnabledModules("YOGA_INSTRUCTOR") },
  { type: "PILATES_INSTRUCTOR", label: "Pilates Instructor", description: "Pilates instruction", category: "coaching", recommendedModules: getAutoEnabledModules("PILATES_INSTRUCTOR") },
  { type: "BOXING_COACH", label: "Boxing Coach", description: "Boxing and combat sports", category: "coaching", recommendedModules: getAutoEnabledModules("BOXING_COACH") },
  { type: "MARTIAL_ARTS_COACH", label: "Martial Arts Coach", description: "Martial arts dojo", category: "coaching", recommendedModules: getAutoEnabledModules("MARTIAL_ARTS_COACH") },
  { type: "RUNNING_COACH", label: "Running Coach", description: "Running and endurance", category: "coaching", recommendedModules: getAutoEnabledModules("RUNNING_COACH") },
  { type: "CYCLING_COACH", label: "Cycling Coach", description: "Cycling coaching", category: "coaching", recommendedModules: getAutoEnabledModules("CYCLING_COACH") },
  { type: "PHYSIOTHERAPIST", label: "Physiotherapist", description: "Physical therapy", category: "therapy", recommendedModules: getAutoEnabledModules("PHYSIOTHERAPIST") },
  { type: "REHABILITATION_CENTER", label: "Rehabilitation Center", description: "Rehab facility", category: "therapy", recommendedModules: getAutoEnabledModules("REHABILITATION_CENTER") },
  { type: "SPORTS_CLINIC", label: "Sports Clinic", description: "Sports medicine clinic", category: "therapy", recommendedModules: getAutoEnabledModules("SPORTS_CLINIC") },
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
