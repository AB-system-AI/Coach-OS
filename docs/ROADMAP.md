# CoachOS Development Roadmap

> **The Ultimate Operating System for Fitness Coaches**

## Vision

CoachOS is a multi-tenant SaaS platform enabling unlimited fitness coaches to operate their entire business — website, clients, programs, recovery booking, payments — from a single shared codebase with complete tenant isolation.

---

## Phase 1: Foundation (Weeks 1–2) ✅ In Progress

| Module | Status | Description |
|--------|--------|-------------|
| Project scaffolding | ✅ | Next.js 15, TypeScript, Tailwind, shadcn/ui |
| Clean architecture | ✅ | Feature-based folders, domain/application/infrastructure layers |
| Database schema | ✅ | Prisma + PostgreSQL, full multi-tenant model |
| Multi-tenancy core | ✅ | Tenant resolution, middleware, context |
| Authentication | ✅ | Better Auth, sessions, OAuth ready |
| RBAC | ✅ | Super Admin, Coach, Assistant, Client roles |
| i18n | ✅ | Arabic/English, RTL support via next-intl |
| Theme engine | ✅ | Per-tenant colors, fonts, logo |
| Shared UI | ✅ | shadcn/ui components, layouts, design system |
| Landing page | ✅ | Marketing site for CoachOS platform |

---

## Phase 2: Core Dashboards (Weeks 3–4)

| Module | Status | Description |
|--------|--------|-------------|
| Super Admin Dashboard | 🔲 | Coach management, revenue, analytics |
| Coach Dashboard shell | 🔲 | Sidebar, navigation, overview |
| Client Dashboard shell | 🔲 | Client portal layout |
| Profile & Settings | 🔲 | User profile, tenant settings |
| Media Library | 🔲 | UploadThing + Cloudinary integration |
| Notifications | 🔲 | In-app, email via Resend |

---

## Phase 3: Coach Website & CMS (Weeks 5–6)

| Module | Status | Description |
|--------|--------|-------------|
| Website Builder | 🔲 | Section-based page builder |
| Theme customization UI | 🔲 | Logo, colors, fonts editor |
| CMS pages | 🔲 | Home, About, Contact, FAQ, etc. |
| Blog | 🔲 | Posts, categories, SEO |
| Custom domains | 🔲 | Cloudflare DNS integration |
| SEO engine | 🔲 | Meta tags, sitemap, structured data |
| PWA | 🔲 | Service worker, offline support |

---

## Phase 4: Programs & Coaching (Weeks 7–8)

| Module | Status | Description |
|--------|--------|-------------|
| Programs | 🔲 | Create, sell, assign programs |
| Workout Plans | 🔲 | Exercises, sets, reps, rest |
| Meal Plans | 🔲 | Recipes, macros, meal scheduling |
| Exercise Videos | 🔲 | Video library per tenant |
| Recipe Library | 🔲 | Searchable recipe database |
| Progress Tracking | 🔲 | Weight, measurements, photos |
| Progress Charts | 🔲 | Recharts visualizations |

---

## Phase 5: Recovery & Booking (Weeks 9–10)

| Module | Status | Description |
|--------|--------|-------------|
| Recovery Services | 🔲 | Massage, ice bath, stretching, etc. |
| Recovery Packages | 🔲 | Bundled session packages |
| Time Slots | 🔲 | Capacity, availability rules |
| Online Booking | 🔲 | Client self-service booking |
| Calendar | 🔲 | Coach calendar view |
| Appointments | 🔲 | Appointment management |

---

## Phase 6: Payments & Billing (Weeks 11–12)

| Module | Status | Description |
|--------|--------|-------------|
| Stripe integration | 🔲 | Cards, subscriptions |
| Paymob integration | 🔲 | MENA region payments |
| Invoices | 🔲 | Auto-generated invoices |
| Coupons | 🔲 | Discount codes |
| Subscriptions | 🔲 | Coach SaaS billing |
| Refunds | 🔲 | Refund workflow |

---

## Phase 7: Communication (Weeks 13–14)

| Module | Status | Description |
|--------|--------|-------------|
| Chat | 🔲 | Real-time via Pusher |
| Email templates | 🔲 | Transactional emails |
| WhatsApp ready | 🔲 | Webhook architecture |
| Reviews | 🔲 | Client reviews |
| Contact forms | 🔲 | Lead capture |

---

## Phase 8: Analytics & AI (Weeks 15–16)

| Module | Status | Description |
|--------|--------|-------------|
| Coach analytics | 🔲 | Revenue, bookings, visitors |
| Super admin analytics | 🔲 | Platform-wide metrics |
| Audit logs | 🔲 | Security audit trail |
| AI Assistant | 🔲 | Coach AI helper |
| Support tickets | 🔲 | Admin support system |

---

## Phase 9: Performance & Security (Week 17)

| Module | Status | Description |
|--------|--------|-------------|
| Rate limiting | 🔲 | API & auth rate limits |
| Edge caching | 🔲 | Cloudflare + Vercel edge |
| Image optimization | 🔲 | Next/Image + Cloudinary |
| Security hardening | 🔲 | CSRF, XSS, input validation |
| Load testing | 🔲 | k6 performance tests |

---

## Phase 10: Launch (Week 18)

| Task | Status |
|------|--------|
| Production deployment (Vercel) | 🔲 |
| Database migration (production) | 🔲 |
| DNS & SSL setup | 🔲 |
| Monitoring & alerting | 🔲 |
| Documentation | 🔲 |
| Onboarding flow | 🔲 |

---

## Architecture Principles

1. **Tenant isolation** — Every query scoped by `tenant_id`
2. **Clean architecture** — Domain → Application → Infrastructure → Presentation
3. **Feature modules** — Self-contained features with own components, actions, types
4. **Server-first** — Server Components + Server Actions by default
5. **Type safety** — Zod validation at every boundary
6. **Scalability** — Stateless, edge-ready, horizontally scalable

---

## Tech Stack Reference

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router |
| UI | React 19, Tailwind CSS, shadcn/ui, Framer Motion |
| Database | PostgreSQL + Prisma ORM |
| Auth | Better Auth |
| Payments | Stripe + Paymob |
| Files | UploadThing + Cloudinary |
| Email | Resend |
| Real-time | Pusher |
| i18n | next-intl |
| Charts | Recharts |
| Hosting | Vercel + Cloudflare |
