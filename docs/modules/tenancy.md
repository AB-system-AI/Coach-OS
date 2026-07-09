# Multi-Tenancy Module

## Overview

The tenancy module is the core isolation layer of CoachOS. Every coach operates within their own tenant, with complete data separation enforced at the database and application levels.

## Tenant Resolution

Tenants are resolved in this priority order:

1. **Custom Domain** — `coach.johndoe.com` → lookup by `customDomain`
2. **Subdomain** — `johndoe.coachos.app` → lookup by `slug`
3. **Path Slug** — `/demo-coach/*` → lookup by `slug`
4. **Session** — Dashboard routes use the authenticated user's tenant membership

## Key Files

| File | Purpose |
|------|---------|
| `features/tenancy/types/index.ts` | Types, constants, slug validation |
| `features/tenancy/services/tenant-resolver.ts` | Cached tenant resolution |
| `features/tenancy/actions/tenant-actions.ts` | Create, suspend, delete tenants |
| `middleware.ts` | Request-level tenant context |

## Creating a Tenant

When a coach registers, a tenant is automatically created with:

- Default theme configuration
- Business settings
- Trial subscription (14 days)
- Default CMS pages (home, about, contact, etc.)
- Coach membership linking

```typescript
import { createTenant } from "@/features/tenancy";

await createTenant({
  name: "FitPro Coaching",
  ownerUserId: user.id,
  plan: "FREE",
});
```

## Data Isolation

All tenant-scoped tables include a `tenantId` foreign key. Server actions validate tenant access before any mutation:

```typescript
await requireTenantAccess(tenantId);
```

## Reserved Slugs

System routes are protected from tenant slug conflicts:

`admin`, `api`, `auth`, `dashboard`, `portal`, `login`, `register`, etc.

## Custom Domains

Coaches can connect custom domains via the dashboard. Verification requires DNS CNAME pointing to the platform. Once verified, `domainVerified` is set to `true`.
