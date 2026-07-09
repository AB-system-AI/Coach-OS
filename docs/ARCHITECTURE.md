# CoachOS Architecture

## Overview

CoachOS follows **Clean Architecture** with **feature-based folder organization**. Each layer has a single responsibility and dependencies point inward.

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                          │
│  (app/, components/, pages, layouts, UI)                │
├─────────────────────────────────────────────────────────┤
│                    APPLICATION                           │
│  (actions/, hooks/, services — use cases)               │
├─────────────────────────────────────────────────────────┤
│                      DOMAIN                              │
│  (types/, schemas/, constants — business rules)         │
├─────────────────────────────────────────────────────────┤
│                  INFRASTRUCTURE                          │
│  (lib/, prisma/, auth/, email/, payments/)              │
└─────────────────────────────────────────────────────────┘
```

---

## Multi-Tenancy Model

### Tenant Resolution Strategy

```
Request → Middleware → Resolve Tenant → Inject Context → Route Handler
```

**Resolution order:**
1. Custom domain (`coach.johndoe.com` → tenant lookup)
2. Subdomain (`johndoe.coachos.app` → slug lookup)
3. Path prefix (`/t/johndoe/*` → slug lookup)
4. Session tenant (dashboard routes)

### Tenant Isolation

Every database table includes `tenantId`. All queries are automatically scoped:

```typescript
// Automatic tenant scoping via Prisma extension
const clients = await db.client.findMany({
  where: { tenantId: ctx.tenantId }
});
```

---

## Routing Structure

```
/                           → Platform landing (CoachOS marketing)
/auth/*                     → Authentication pages
/admin/*                    → Super Admin dashboard
/dashboard/*                → Coach dashboard (tenant from session)
/portal/*                   → Client portal (tenant from session)
/[tenantSlug]/*             → Public coach website
/api/*                      → API routes & webhooks
```

---

## Role-Based Access Control

| Role | Scope | Access |
|------|-------|--------|
| `SUPER_ADMIN` | Platform | All tenants, system settings |
| `COACH` | Tenant | Full tenant management |
| `ASSISTANT_COACH` | Tenant | Limited coach permissions |
| `CLIENT` | Tenant | Own data only |

Permissions are checked at:
1. Middleware (route level)
2. Server Actions (operation level)
3. Database queries (data level via tenant_id)

---

## Data Flow

### Server Actions Pattern

```
Client Component → Server Action → Service → Prisma → Database
                     ↓
                  Zod Validation
                     ↓
                  RBAC Check
                     ↓
                  Tenant Scope
```

### API Routes (Webhooks & External)

```
Stripe/Paymob Webhook → API Route → Service → Database
UploadThing Callback  → API Route → Media Service
```

---

## Feature Module Structure

Each feature follows this pattern:

```
src/features/[feature-name]/
├── components/          # Feature-specific UI
├── actions/             # Server actions
├── hooks/               # Client hooks (TanStack Query)
├── schemas/             # Zod validation schemas
├── types/               # TypeScript types
├── services/            # Business logic
└── index.ts             # Public API barrel export
```

---

## Theme Engine

Per-tenant theming via CSS custom properties:

```css
:root {
  --tenant-primary: #6366f1;
  --tenant-secondary: #8b5cf6;
  --tenant-font: 'Inter', sans-serif;
}
```

Theme config stored in `TenantTheme` model, injected at layout level.

---

## Caching Strategy

| Layer | Strategy |
|-------|----------|
| Static pages | ISR with revalidation |
| Tenant websites | Edge cache + stale-while-revalidate |
| Dashboard data | TanStack Query client cache |
| Database | Prisma connection pooling |
| Images | Next/Image + Cloudinary CDN |

---

## Security Layers

1. **Middleware** — Auth check, tenant resolution, rate limiting
2. **Server Actions** — Zod validation, RBAC, tenant scoping
3. **Database** — Row-level tenant isolation
4. **API** — Webhook signature verification
5. **Audit** — All sensitive operations logged

---

## Deployment Architecture

```
                    ┌──────────────┐
                    │  Cloudflare  │
                    │  CDN + WAF   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   Vercel     │
                    │  Edge + SSR  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──┐  ┌─────▼─────┐ ┌────▼────┐
       │PostgreSQL│  │Cloudinary │ │ Stripe  │
       │ (Neon)   │  │   CDN     │ │ Paymob  │
       └──────────┘  └───────────┘ └─────────┘
```

---

## Module Documentation Index

| Module | Doc |
|--------|-----|
| Authentication | `docs/modules/auth.md` |
| Multi-Tenancy | `docs/modules/tenancy.md` |
| Theme Engine | `docs/modules/theme-engine.md` |
| Payments | `docs/modules/payments.md` |
| Recovery Booking | `docs/modules/recovery.md` |
| Programs | `docs/modules/programs.md` |
