# CoachOS

> **The Ultimate Operating System for Fitness Coaches**

A production-ready multi-tenant SaaS platform that allows unlimited fitness coaches to run their entire business — professional website, client management, programs, recovery booking, payments — from a single shared codebase.

## Features

- **Multi-Tenant Architecture** — Complete tenant isolation with custom domains
- **Coach Dashboard** — Programs, clients, recovery, bookings, payments, analytics
- **Client Portal** — Programs, progress tracking, recovery booking, chat
- **Website Builder** — Theme engine with logo, colors, fonts customization
- **Recovery Booking** — Massage, ice bath, stretching with online booking & payments
- **Payments** — Stripe + Paymob integration with invoicing
- **i18n** — Arabic & English with full RTL support
- **Super Admin** — Platform management, analytics, support tickets

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS, shadcn/ui, Framer Motion |
| Database | PostgreSQL + Prisma ORM |
| Auth | Better Auth |
| Payments | Stripe + Paymob |
| Files | UploadThing + Cloudinary |
| Email | Resend |
| Real-time | Pusher |
| i18n | next-intl |
| Hosting | Vercel + Cloudflare |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm

### Installation

```bash
# Clone and install
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL and API keys

# Push database schema
npm run db:push

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts

| Role | Email | Notes |
|------|-------|-------|
| Super Admin | admin@coachos.app | Platform administration |
| Demo Coach | coach@demo.com | Coach dashboard at `/dashboard` |
| Demo Website | — | Public site at `/demo-coach` |

## Project Structure

```
src/
├── app/                  # Next.js routes (presentation)
├── components/           # Shared UI components
├── features/             # Feature modules (application + domain)
│   ├── auth/
│   ├── tenancy/
│   ├── theme/
│   ├── admin/
│   ├── coach-dashboard/
│   ├── recovery/
│   ├── payments/
│   └── ...
├── lib/                  # Infrastructure (db, auth, email, payments)
├── i18n/                 # Internationalization
└── middleware.ts         # Tenant resolution + auth
```

See [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) for the complete structure.

## Documentation

- [Development Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)
- [Multi-Tenancy Module](docs/modules/tenancy.md)
- [Authentication Module](docs/modules/auth.md)
- [Theme Engine](docs/modules/theme-engine.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## Architecture

CoachOS follows **Clean Architecture** with feature-based modules:

```
Presentation → Application → Domain → Infrastructure
```

Every tenant-scoped query is isolated via `tenantId`. Tenant resolution happens in middleware via custom domain, subdomain, or path slug.

## License

Proprietary — All rights reserved.
