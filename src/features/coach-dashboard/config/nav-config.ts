import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  Users,
  Heart,
  Calendar,
  Video,
  FileText,
  Image,
  CreditCard,
  Tag,
  BarChart3,
  Globe,
  Settings,
  BookOpen,
  Sparkles,
  Store,
  GraduationCap,
  ShoppingBag,
  Award,
  Trophy,
  MessageCircle,
  Zap,
  Megaphone,
  Download,
  FolderOpen,
  Wallet,
  UserCog,
  ScanLine,
  CalendarDays,
  FileInput,
  Workflow,
  Mic,
  FolderTree,
  ShieldCheck,
  HardDrive,
  Palette,
  LayoutTemplate,
  Mail,
  Receipt,
  Plug,
  Gamepad2,
  Layers,
  Building2,
  ShoppingCart,
  Package,
  Banknote,
  Share2,
  Bell,
  LifeBuoy,
  Lock,
  Smartphone,
  TabletSmartphone,
  LineChart,
  TrendingUp,
} from "lucide-react";
import type { TenantModuleKey } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import { listNavigableEnterprisePages } from "@/features/enterprise/config/modules";

export type NavItem = {
  key: string;
  href: string;
  icon: LucideIcon;
  module?: TenantModuleKey;
  labelKey: string;
};

export const CORE_NAV: NavItem[] = [
  { key: "overview", href: "/dashboard", icon: LayoutDashboard, labelKey: "overview" },
  {
    key: "enterprise",
    href: "/dashboard/enterprise",
    icon: LineChart,
    labelKey: "enterprise",
  },
];

const ENTERPRISE_ICONS: Record<string, LucideIcon> = {
  finance: Wallet,
  staff: UserCog,
  attendance: ScanLine,
  "smart-calendar": CalendarDays,
  forms: FileInput,
  "automation-builder": Workflow,
  "voice-notes": Mic,
  "media-pro": FolderTree,
  audit: ShieldCheck,
  backup: HardDrive,
  "theme-builder": Palette,
  "landing-builder": LayoutTemplate,
  "email-builder": Mail,
  "invoice-designer": Receipt,
  integrations: Plug,
  gamification: Gamepad2,
  "multi-brand": Layers,
  franchise: Building2,
  pos: ShoppingCart,
  inventory: Package,
  payroll: Banknote,
  "membership-cards": CreditCard,
  affiliate: Share2,
  notifications: Bell,
  help: LifeBuoy,
  security: Lock,
  "client-app": Smartphone,
  "mobile-api": TabletSmartphone,
};

export const MODULE_NAV: NavItem[] = [
  { key: "programs", href: "/dashboard/programs", icon: Dumbbell, module: "PROGRAMS", labelKey: "programs" },
  { key: "meals", href: "/dashboard/meals", icon: UtensilsCrossed, module: "NUTRITION", labelKey: "meals" },
  { key: "clients", href: "/dashboard/clients", icon: Users, labelKey: "clients" },
  { key: "progress", href: "/dashboard/progress", icon: TrendingUp, labelKey: "progress" },
  { key: "recovery", href: "/dashboard/recovery", icon: Heart, module: "RECOVERY", labelKey: "recovery" },
  { key: "bookings", href: "/dashboard/bookings", icon: BookOpen, module: "BOOKINGS", labelKey: "bookings" },
  { key: "calendar", href: "/dashboard/calendar", icon: Calendar, module: "BOOKINGS", labelKey: "calendar" },
  { key: "courses", href: "/dashboard/courses", icon: GraduationCap, module: "COURSES", labelKey: "courses" },
  { key: "digital-products", href: "/dashboard/digital-products", icon: Download, module: "DIGITAL_PRODUCTS", labelKey: "digitalProducts" },
  { key: "shop", href: "/dashboard/shop", icon: ShoppingBag, module: "SHOP", labelKey: "shop" },
  { key: "crm", href: "/dashboard/crm", icon: Users, module: "CRM", labelKey: "crm" },
  { key: "challenges", href: "/dashboard/challenges", icon: Trophy, module: "CHALLENGES", labelKey: "challenges" },
  { key: "community", href: "/dashboard/community", icon: MessageCircle, module: "COMMUNITY", labelKey: "community" },
  { key: "loyalty", href: "/dashboard/loyalty", icon: Award, module: "LOYALTY", labelKey: "loyalty" },
  { key: "videos", href: "/dashboard/videos", icon: Video, labelKey: "videos" },
  { key: "blog", href: "/dashboard/blog", icon: FileText, module: "BLOG", labelKey: "blog" },
  { key: "media", href: "/dashboard/media", icon: Image, labelKey: "media" },
  { key: "files", href: "/dashboard/files", icon: FolderOpen, labelKey: "files" },
  { key: "payments", href: "/dashboard/payments", icon: CreditCard, labelKey: "payments" },
  { key: "coupons", href: "/dashboard/coupons", icon: Tag, labelKey: "coupons" },
  { key: "reports", href: "/dashboard/reports", icon: BarChart3, module: "REPORTS", labelKey: "reports" },
  { key: "ai", href: "/dashboard/ai", icon: Sparkles, module: "AI", labelKey: "ai" },
  { key: "automation", href: "/dashboard/automation", icon: Zap, module: "AUTOMATION", labelKey: "automation" },
  { key: "marketing", href: "/dashboard/marketing", icon: Megaphone, module: "MARKETING", labelKey: "marketing" },
  { key: "marketplace", href: "/dashboard/settings/marketplace", icon: Store, module: "MARKETPLACE", labelKey: "marketplace" },
  { key: "website", href: "/dashboard/website", icon: Globe, labelKey: "website" },
  ...listNavigableEnterprisePages().map((page) => ({
    key: page.slug,
    href: `/dashboard/enterprise/${page.slug}`,
    icon: ENTERPRISE_ICONS[page.slug] ?? Settings,
    module: page.module,
    labelKey: page.slug,
  })),
];

export const SETTINGS_NAV: NavItem[] = [
  { key: "settings", href: "/dashboard/settings/subscription", icon: Settings, labelKey: "settings" },
  { key: "branding", href: "/dashboard/settings/branding", icon: Palette, labelKey: "branding" },
  { key: "domains", href: "/dashboard/settings/domains", icon: Globe, labelKey: "domains" },
  { key: "security", href: "/dashboard/settings/security", icon: Lock, labelKey: "security" },
];

export function filterNavByModules(
  items: NavItem[],
  enabledModules: Set<TenantModuleKey>
): NavItem[] {
  return items.filter((item) => {
    if (!item.module) return true;
    return enabledModules.has(item.module);
  });
}
