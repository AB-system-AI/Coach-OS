import { NextRequest, NextResponse } from "next/server";
import {
  extractSubdomain,
  isPlatformHost,
  isReservedSlug,
} from "@/lib/middleware/tenancy";
import {
  GUEST_ONLY_ROUTES,
  isOnboardingRoute,
  isProtectedRoute,
  ONBOARDING_ROUTE,
  stripLocalePrefix,
} from "@/lib/middleware/routes";
import { buildSecurityHeaders } from "@/lib/middleware/security-headers";
import { isMaintenanceModeEnabled } from "@/lib/deployment/service-status";

const ADMIN_PREFIX = "/admin";
const DASHBOARD_PREFIX = "/dashboard";
const PORTAL_PREFIX = "/portal";
const API_PREFIX = "/api";

const STATIC_APP_PATHS = ["/icon", "/apple-icon", "/manifest.json"];

/** Routes that stay reachable during maintenance or partial outages. */
const PUBLIC_DURING_MAINTENANCE = [
  "/",
  "/pricing",
  "/features",
  "/about",
  "/developers",
  "/marketplace",
  "/maintenance",
  "/status",
];

function getSessionCookie(request: NextRequest): string | undefined {
  return (
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value
  );
}

function isPublicDuringMaintenance(pathname: string): boolean {
  const clean = stripLocalePrefix(pathname);
  return PUBLIC_DURING_MAINTENANCE.some(
    (route) => clean === route || clean.startsWith(`${route}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  if (
    pathname.startsWith(API_PREFIX) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    STATIC_APP_PATHS.includes(pathname)
  ) {
    return NextResponse.next();
  }

  if (
    isMaintenanceModeEnabled() &&
    !isPublicDuringMaintenance(pathname) &&
    !pathname.startsWith("/maintenance")
  ) {
    const maintenanceUrl = new URL("/maintenance", request.url);
    const response = NextResponse.rewrite(maintenanceUrl);
    applySecurityHeaders(response);
    return response;
  }

  const tenantRewrite = await resolveTenantRewrite(host, pathname, request.url);
  if (tenantRewrite) {
    applySecurityHeaders(tenantRewrite);
    return tenantRewrite;
  }

  const sessionToken = getSessionCookie(request);
  const isAuthenticated = !!sessionToken;
  const cleanPath = stripLocalePrefix(pathname);

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", cleanPath);
    return NextResponse.redirect(loginUrl);
  }

  if (isOnboardingRoute(pathname) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/register", request.url));
  }

  // Authenticated users on guest-only routes are redirected in server page
  // components via resolveAuthenticatedDestination() (role + onboarding aware).

  const response = NextResponse.next();
  response.headers.set("x-host", host);
  response.headers.set("x-pathname", pathname);
  applySecurityHeaders(response);

  return response;
}

function applySecurityHeaders(response: NextResponse): void {
  const headers = buildSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
}

async function resolveTenantRewrite(
  host: string,
  pathname: string,
  baseUrl: string
): Promise<NextResponse | null> {
  const hostname = host.split(":")[0].toLowerCase();

  if (isPlatformHost(hostname)) {
    return null;
  }

  const cleanPath = stripLocalePrefix(pathname);
  const platformPrefixes = [
    ADMIN_PREFIX,
    DASHBOARD_PREFIX,
    PORTAL_PREFIX,
    ...GUEST_ONLY_ROUTES,
    ONBOARDING_ROUTE,
    "/marketplace",
    "/pricing",
    "/features",
    "/about",
    "/developers",
    API_PREFIX,
  ];

  if (platformPrefixes.some((p) => cleanPath.startsWith(p))) {
    return null;
  }

  let slug: string | null = null;

  const subdomain = extractSubdomain(host);
  if (subdomain && !isReservedSlug(subdomain)) {
    slug = subdomain;
  }

  if (!slug) {
    slug = hostname;
  }

  const pathSegments = cleanPath.split("/").filter(Boolean);
  if (
    pathSegments[0] === slug ||
    (slug.includes(".") && pathSegments[0] === slug)
  ) {
    return null;
  }

  const rewritePath = `/${slug}${cleanPath === "/" ? "" : cleanPath}`;
  const url = new URL(rewritePath, baseUrl);
  const response = NextResponse.rewrite(url);
  response.headers.set("x-tenant-slug", slug);
  response.headers.set("x-host", host);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|icons|images|manifest.json).*)",
  ],
};
