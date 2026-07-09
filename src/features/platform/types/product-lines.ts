import type { BusinessType, ProductLine, TenantModuleKey } from "@prisma/client";

export type ProductLineDefinition = {
  line: ProductLine;
  name: string;
  tagline: string;
  description: string;
  defaultModules: TenantModuleKey[];
  businessTypes: BusinessType[];
};

export const PRODUCT_LINES: ProductLineDefinition[] = [
  {
    line: "COACH_OS",
    name: "CoachOS",
    tagline: "For coaches & trainers",
    description: "Personal training, nutrition, and online coaching",
    defaultModules: [
      "PROGRAMS",
      "NUTRITION",
      "BOOKINGS",
      "MARKETPLACE",
      "FINANCE",
      "SMART_CALENDAR",
      "MOBILE_API",
      "CLIENT_APP",
    ],
    businessTypes: [
      "FITNESS_COACH",
      "PERSONAL_TRAINER",
      "NUTRITION_COACH",
      "YOGA_INSTRUCTOR",
      "PILATES_INSTRUCTOR",
      "RUNNING_COACH",
      "CYCLING_COACH",
    ],
  },
  {
    line: "GYM_OS",
    name: "GymOS",
    tagline: "For gyms & fitness clubs",
    description: "Memberships, attendance, POS, inventory, and payroll",
    defaultModules: [
      "BOOKINGS",
      "ATTENDANCE",
      "MEMBERSHIP_CARDS",
      "POS",
      "INVENTORY",
      "PAYROLL",
      "STAFF",
      "LOYALTY",
      "FINANCE",
      "SMART_CALENDAR",
    ],
    businessTypes: ["GYM", "CROSSFIT_COACH"],
  },
  {
    line: "ACADEMY_OS",
    name: "AcademyOS",
    tagline: "For academies & schools",
    description: "Courses, community, CRM, and multi-brand campuses",
    defaultModules: [
      "COURSES",
      "COMMUNITY",
      "CRM",
      "FORMS_BUILDER",
      "GAMIFICATION",
      "FRANCHISE",
      "MULTI_BRAND",
      "LANDING_BUILDER",
    ],
    businessTypes: ["FITNESS_ACADEMY", "FOOTBALL_COACH", "SWIMMING_COACH"],
  },
  {
    line: "PHYSIO_OS",
    name: "PhysioOS",
    tagline: "For physiotherapy & rehab",
    description: "Recovery, forms, smart calendar, and client progress",
    defaultModules: [
      "RECOVERY",
      "FORMS_BUILDER",
      "BOOKINGS",
      "SMART_CALENDAR",
      "AI_VOICE",
      "CRM",
      "INVOICE_DESIGNER",
    ],
    businessTypes: [
      "PHYSIOTHERAPIST",
      "REHABILITATION_CENTER",
      "SPORTS_CLINIC",
    ],
  },
  {
    line: "SPORTS_OS",
    name: "SportsOS",
    tagline: "For sports teams & clubs",
    description: "Programs, challenges, gamification, and performance",
    defaultModules: [
      "PROGRAMS",
      "CHALLENGES",
      "GAMIFICATION",
      "COMMUNITY",
      "ATTENDANCE",
      "REPORTS",
      "MARKETPLACE",
    ],
    businessTypes: [
      "FOOTBALL_COACH",
      "BOXING_COACH",
      "MARTIAL_ARTS_COACH",
      "SPORTS_CLINIC",
    ],
  },
];

export function getProductLineForBusinessType(
  businessType: BusinessType
): ProductLine {
  const match = PRODUCT_LINES.find((p) =>
    p.businessTypes.includes(businessType)
  );
  return match?.line ?? "COACH_OS";
}

export function getProductLineDefinition(
  line: ProductLine
): ProductLineDefinition {
  return (
    PRODUCT_LINES.find((p) => p.line === line) ??
    PRODUCT_LINES[0]
  );
}

export function getDefaultModulesForProductLine(
  line: ProductLine
): TenantModuleKey[] {
  return getProductLineDefinition(line).defaultModules;
}
