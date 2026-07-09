import { NextRequest, NextResponse } from "next/server";
import {
  extractSubdomain,
  isPlatformHost,
  isReservedSlug,
} from "@/features/tenancy/types";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/onboarding"];

const ADMIN_PREFIX = "/admin";
const DASHBOARD_PREFIX = "/dashboard";
const PORTAL_PREFIX = "/portal";
const API_PREFIX = "/api";

const STATIC_APP_PATHS = ["/icon", "/apple-icon", "/manifest.json"];

function isAuthRoute(pathname: string): boolean {
  const path = pathname.replace(/^\/(en|ar)/, "") || "/";
  return AUTH_ROUTES.some((route) => path === route);
}

function isProtectedRoute(pathname: string): boolean {
  const path = pathname.replace(/^\/(en|ar)/, "") || "/";
  return (
    path.startsWith(ADMIN_PREFIX) ||
    path.startsWith(DASHBOARD_PREFIX) ||
    path.startsWith(PORTAL_PREFIX)
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

  // Custom domain / subdomain → rewrite to tenant route
  const tenantRewrite = await resolveTenantRewrite(host, pathname, request.url);
  if (tenantRewrite) {
    return tenantRewrite;
  }

  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isAuthenticated = !!sessionCookie;

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();

  response.headers.set("x-host", host);
  response.headers.set("x-pathname", pathname);

  return response;
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

  const cleanPath = pathname.replace(/^\/(en|ar)/, "") || "/";
  const platformPrefixes = [
    "/admin",
    "/dashboard",
    "/portal",
    "/login",
    "/register",
    "/marketplace",
    "/pricing",
    "/features",
    "/about",
    "/onboarding",
    "/developers",
    "/api",
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
