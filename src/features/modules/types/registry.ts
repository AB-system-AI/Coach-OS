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
