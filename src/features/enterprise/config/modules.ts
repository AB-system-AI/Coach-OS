import type { TenantModuleKey } from "@prisma/client";

export type EnterpriseModulePage = {
  slug: string;
  module: TenantModuleKey;
  title: string;
  description: string;
  features: string[];
  actions: { label: string; href: string }[];
};

export const ENTERPRISE_MODULE_PAGES: EnterpriseModulePage[] = [
  {
    slug: "finance",
    module: "FINANCE",
    title: "Finance",
    description: "Revenue, expenses, profit, wallet, withdrawals, transactions, and refunds.",
    features: ["Revenue", "Expenses", "Profit", "Wallet", "Withdrawals", "Transactions", "Refunds"],
    actions: [
      { label: "Wallet", href: "/dashboard/enterprise/finance/wallet" },
      { label: "Transactions", href: "/dashboard/enterprise/finance/transactions" },
      { label: "Expenses", href: "/dashboard/enterprise/finance/expenses" },
    ],
  },
  {
    slug: "staff",
    module: "STAFF",
    title: "Staff Management",
    description: "Coaches, reception, nutritionists, physiotherapists, and managers with full permissions.",
    features: ["Coaches", "Reception", "Nutritionists", "Physiotherapists", "Managers", "Role Permissions"],
    actions: [{ label: "Add Staff", href: "/dashboard/enterprise/staff/new" }],
  },
  {
    slug: "attendance",
    module: "ATTENDANCE",
    title: "Attendance",
    description: "QR check-in, barcode, NFC, and manual check-in for members and clients.",
    features: ["QR Check-in", "Barcode", "NFC", "Manual Check-in"],
    actions: [{ label: "Check-in", href: "/dashboard/enterprise/attendance/check-in" }],
  },
  {
    slug: "smart-calendar",
    module: "SMART_CALENDAR",
    title: "Smart Calendar",
    description: "Google Calendar-style scheduling with drag & drop, week/month/agenda views, and sync.",
    features: ["Drag & Drop", "Week View", "Month View", "Agenda", "Google Sync", "Outlook Sync"],
    actions: [
      { label: "Calendar", href: "/dashboard/enterprise/smart-calendar" },
      { label: "Sync Settings", href: "/dashboard/enterprise/smart-calendar/sync" },
    ],
  },
  {
    slug: "forms",
    module: "FORMS_BUILDER",
    title: "Forms Builder",
    description: "Build custom forms: injury, medical history, registration, consultation, and more.",
    features: ["Injury Form", "Medical History", "Registration", "Consultation", "Custom Fields"],
    actions: [{ label: "Create Form", href: "/dashboard/enterprise/forms/new" }],
  },
  {
    slug: "automation-builder",
    module: "AUTOMATION_BUILDER",
    title: "Automation Builder",
    description: "Zapier-like workflows: client joined → welcome email → create program → notify coach.",
    features: ["Triggers", "Actions", "Conditions", "Delays", "Multi-step Flows"],
    actions: [{ label: "New Workflow", href: "/dashboard/enterprise/automation-builder/new" }],
  },
  {
    slug: "voice-notes",
    module: "AI_VOICE",
    title: "AI Voice Notes",
    description: "Record voice notes, auto-transcribe to text, and save to client records.",
    features: ["Record", "Transcribe", "Save", "Search"],
    actions: [{ label: "New Recording", href: "/dashboard/enterprise/voice-notes/new" }],
  },
  {
    slug: "media-pro",
    module: "MEDIA_PRO",
    title: "Media Library Pro",
    description: "Folders, tags, compression, CDN delivery, and video streaming.",
    features: ["Folders", "Tags", "Compression", "CDN", "Video Streaming"],
    actions: [{ label: "Upload", href: "/dashboard/files" }],
  },
  {
    slug: "audit",
    module: "AUDIT_CENTER",
    title: "Audit Center",
    description: "Every change tracked: who, when, why — with rollback support.",
    features: ["Change Log", "Who / When / Why", "Rollback", "Export"],
    actions: [{ label: "View Logs", href: "/dashboard/enterprise/audit/logs" }],
  },
  {
    slug: "backup",
    module: "BACKUP",
    title: "Backup Center",
    description: "Backup, restore, export, and import your tenant data.",
    features: ["Full Backup", "Partial Backup", "Restore", "Export", "Import"],
    actions: [
      { label: "Create Backup", href: "/dashboard/enterprise/backup/create" },
      { label: "Restore", href: "/dashboard/enterprise/backup/restore" },
    ],
  },
  {
    slug: "theme-builder",
    module: "THEME_BUILDER",
    title: "Theme Builder",
    description: "Full visual theme builder — not just color presets.",
    features: ["Layout", "Typography", "Components", "Preview", "Publish"],
    actions: [{ label: "Open Builder", href: "/dashboard/settings/branding" }],
  },
  {
    slug: "landing-builder",
    module: "LANDING_BUILDER",
    title: "Landing Page Builder",
    description: "Framer-like sections, blocks, and drag & drop page builder.",
    features: ["Sections", "Blocks", "Drag & Drop", "Preview", "Publish"],
    actions: [{ label: "Pages", href: "/dashboard/marketing" }],
  },
  {
    slug: "email-builder",
    module: "EMAIL_BUILDER",
    title: "Email Builder",
    description: "Mailchimp-like template builder and campaign management.",
    features: ["Template Builder", "Campaigns", "A/B Test", "Analytics"],
    actions: [{ label: "Templates", href: "/dashboard/enterprise/email-builder/templates" }],
  },
  {
    slug: "invoice-designer",
    module: "INVOICE_DESIGNER",
    title: "Invoice Designer",
    description: "Design invoices with logo, QR code, and tax configuration.",
    features: ["Logo", "QR Code", "Tax", "Custom Layout"],
    actions: [{ label: "Design Invoice", href: "/dashboard/enterprise/invoice-designer" }],
  },
  {
    slug: "integrations",
    module: "INTEGRATIONS",
    title: "Integrations",
    description: "Connect Stripe, Paymob, WhatsApp, Zoom, Google, Dropbox, and analytics pixels.",
    features: [
      "Stripe",
      "Paymob",
      "WhatsApp",
      "Zoom",
      "Google Calendar",
      "Meta Pixel",
      "Google Analytics",
      "TikTok Pixel",
    ],
    actions: [{ label: "Connect", href: "/dashboard/enterprise/integrations" }],
  },
  {
    slug: "gamification",
    module: "GAMIFICATION",
    title: "Gamification",
    description: "Levels, XP, achievements, badges, and leaderboards.",
    features: ["Levels", "XP", "Achievements", "Badges", "Leaderboards"],
    actions: [{ label: "Leaderboard", href: "/dashboard/enterprise/gamification/leaderboard" }],
  },
  {
    slug: "multi-brand",
    module: "MULTI_BRAND",
    title: "Multi Brand",
    description: "One company, multiple brands — each with its own identity.",
    features: ["Multiple Brands", "Brand Switching", "Per-brand Themes"],
    actions: [{ label: "Add Brand", href: "/dashboard/enterprise/multi-brand/new" }],
  },
  {
    slug: "franchise",
    module: "FRANCHISE",
    title: "Franchise",
    description: "Manage 20+ gym branches from a single enterprise account.",
    features: ["Locations", "Franchise Tree", "Central Reporting"],
    actions: [{ label: "Locations", href: "/dashboard/enterprise/franchise" }],
  },
  {
    slug: "pos",
    module: "POS",
    title: "POS",
    description: "In-gym point of sale for products and services.",
    features: ["Quick Sale", "Cash", "Card", "Wallet", "Receipts"],
    actions: [{ label: "Open POS", href: "/dashboard/enterprise/pos" }],
  },
  {
    slug: "inventory",
    module: "INVENTORY",
    title: "Inventory",
    description: "Track supplements, equipment, and apparel stock.",
    features: ["SKU", "Stock Levels", "Low Stock Alerts", "Categories"],
    actions: [{ label: "Add Item", href: "/dashboard/enterprise/inventory/new" }],
  },
  {
    slug: "payroll",
    module: "PAYROLL",
    title: "Staff Payroll",
    description: "Salaries, commissions, deductions, and pay runs.",
    features: ["Salaries", "Commissions", "Deductions", "Pay Runs"],
    actions: [{ label: "Run Payroll", href: "/dashboard/enterprise/payroll/run" }],
  },
  {
    slug: "membership-cards",
    module: "MEMBERSHIP_CARDS",
    title: "Membership Cards",
    description: "QR, barcode, and NFC membership cards for members.",
    features: ["QR", "Barcode", "NFC", "Issue / Revoke"],
    actions: [{ label: "Issue Card", href: "/dashboard/enterprise/membership-cards/new" }],
  },
  {
    slug: "affiliate",
    module: "AFFILIATE",
    title: "Affiliate System",
    description: "Affiliate partners with commission tracking and payouts.",
    features: ["Affiliate Links", "Commissions", "Payouts", "Reports"],
    actions: [{ label: "Affiliates", href: "/dashboard/enterprise/affiliate" }],
  },
  {
    slug: "notifications",
    module: "NOTIFICATION_CENTER",
    title: "Notification Center",
    description: "Email, SMS, WhatsApp, push, and in-app notifications.",
    features: ["Email", "SMS", "WhatsApp", "Push", "In-App"],
    actions: [{ label: "Channels", href: "/dashboard/enterprise/notifications" }],
  },
  {
    slug: "help",
    module: "HELP_CENTER",
    title: "Help Center",
    description: "Knowledge base, support tickets, and self-service help.",
    features: ["Knowledge Base", "Support Tickets", "Categories"],
    actions: [{ label: "Articles", href: "/dashboard/enterprise/help/articles" }],
  },
  {
    slug: "security",
    module: "SECURITY_CENTER",
    title: "Security Center",
    description: "Sessions, devices, 2FA, login history, trusted devices, and API logs.",
    features: ["Sessions", "Devices", "2FA", "Login History", "API Logs"],
    actions: [{ label: "Security", href: "/dashboard/enterprise/security" }],
  },
  {
    slug: "client-app",
    module: "CLIENT_APP",
    title: "Client App",
    description: "Mobile client experience: dashboard, meals, workouts, progress, payments, chat.",
    features: [
      "Dashboard",
      "Meals",
      "Workout",
      "Progress",
      "Payments",
      "Bookings",
      "Chat",
      "Community",
    ],
    actions: [{ label: "App Settings", href: "/dashboard/enterprise/client-app" }],
  },
  {
    slug: "mobile-api",
    module: "MOBILE_API",
    title: "Mobile API",
    description: "Flutter & React Native ready APIs with push, deep links, and offline sync.",
    features: ["Flutter API", "React Native API", "Push", "Deep Links", "Offline Sync"],
    actions: [
      { label: "API Docs", href: "/developers" },
      { label: "API Keys", href: "/dashboard/settings/api" },
    ],
  },
];

export function getEnterprisePage(slug: string): EnterpriseModulePage | undefined {
  return ENTERPRISE_MODULE_PAGES.find((p) => p.slug === slug);
}

export function getEnterprisePageByModule(
  module: TenantModuleKey
): EnterpriseModulePage | undefined {
  return ENTERPRISE_MODULE_PAGES.find((p) => p.module === module);
}
