# CoachOS Database Setup

Guide for provisioning PostgreSQL, applying the Prisma schema, and loading demo data.

## Overview

| Item | Details |
|------|---------|
| ORM | Prisma 6 |
| Database | PostgreSQL 14+ |
| Models | 120+ (multi-tenant SaaS) |
| Migrations | `prisma/migrations/` |
| Seed | `prisma/seed.ts` |

## Prerequisites

- PostgreSQL 14 or newer (local, Docker, Neon, Supabase, Railway, etc.)
- Node.js 20+
- `DATABASE_URL` set in `.env` (see `.env.example`)

## 1. Create a PostgreSQL database

### Docker (local)

```bash
docker run --name coachos-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=coachos \
  -p 5432:5432 \
  -d postgres:16
```

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/coachos?schema=public
```

### Managed providers (production)

1. Create a project on [Neon](https://neon.tech), [Supabase](https://supabase.com), or similar.
2. Copy the connection string into `DATABASE_URL`.
3. Prefer the **pooled** connection string for serverless (Vercel).

## 2. Validate and generate Prisma client

```bash
npx prisma validate
npx prisma generate
```

`prisma validate` requires `DATABASE_URL` to be set (any valid-format URL works for syntax validation).

## 3. Apply schema (choose one approach)

### Option A — Migrations (recommended for production)

Initial migration: `prisma/migrations/20250709180000_init/`

**Development** (creates DB + applies migrations):

```bash
npm run db:migrate
# or: npx prisma migrate dev
```

**Production / staging**:

```bash
npm run db:migrate:deploy
# or: npx prisma migrate deploy
```

### Option B — db push (prototyping only)

```bash
npm run db:push
```

Skips migration history. Use only for local experiments, not production.

## 4. Seed demo data

Loads a fitness coaching demo tenant with clients, programs, exercises, bookings, and subscription data.

```bash
npm run db:seed
# or: npx prisma db seed
```

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Super admin | `admin@coachos.app` | `CoachOS-Demo-2026!` |
| Coach | `coach@demo.coachos.app` | `CoachOS-Demo-2026!` |
| Client | `client-alpha@demo.coachos.app` | `CoachOS-Demo-2026!` |

Override the password with `DEMO_SEED_PASSWORD` in `.env` for staging environments.

### Demo tenant

| Field | Value |
|-------|-------|
| Business | Apex Performance Coaching |
| Slug | `apex-performance` |
| Plan | Professional (active subscription) |
| Clients | 3 demo profiles |
| Program | 12-Week Strength Foundation |
| Bookings | 2 sample appointments |

All demo data uses fictional business and account names — no real personal information.

## 5. Production commands

| Task | Command |
|------|---------|
| Validate schema | `npx prisma validate` |
| Generate client | `npx prisma generate` |
| Apply migrations | `npx prisma migrate deploy` |
| Seed demo (staging only) | `npx prisma db seed` |
| Open DB GUI | `npm run db:studio` |

### Vercel / CI pipeline

1. Set `DATABASE_URL` in environment variables.
2. On deploy, run `prisma migrate deploy` before or after the app build (recommended via CI or post-deploy hook).
3. Do **not** run seed on production unless setting up a dedicated demo/staging environment.

Example CI step:

```bash
export DATABASE_URL="your-production-url"
npx prisma migrate deploy
```

## Schema readiness audit

### Migrations

- Initial migration captures the full schema (`20250709180000_init`).
- Use `prisma migrate dev` locally when changing `schema.prisma`, then commit new migration folders.

### Indexes

Tenant-scoped tables include `@@index([tenantId])` for multi-tenant query isolation. Additional indexes cover:

- Unique slugs per tenant (`@@unique([tenantId, slug])`)
- Booking dates (`@@index([date])`)
- Audit logs by action and `createdAt`
- Foreign-key lookup columns (`userId`, `clientId`, `programId`, etc.)

### Relations and cascading

- **Tenant deletion** cascades to all tenant-owned data (`onDelete: Cascade`).
- **User deletion** cascades sessions, accounts, and tenant memberships.
- **Client profile deletion** cascades notes, files, activities, and check-ins.
- **Program enrollment** cascades when program or user is removed.
- Optional relations (e.g. `WorkoutPlan.program`) use default restrict — delete programs carefully or reassign plans first.

### Auth tables

Better Auth uses `User`, `Session`, `Account`, and `Verification` models. The seed creates credential accounts with hashed passwords via Better Auth's `hashPassword` utility.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `DATABASE_URL` not found | Copy `.env.example` → `.env` and set the URL |
| Migration drift | Run `npx prisma migrate status` and resolve pending migrations |
| Seed already run | Seed is idempotent for the demo tenant slug `apex-performance` |
| Login fails after seed | Ensure seed completed; passwords are in the table above |
| `prisma validate` fails | Export `DATABASE_URL` before running |

## Related docs

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel deployment and environment variables
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design overview
