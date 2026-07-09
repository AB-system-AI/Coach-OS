# TrainerOS Enterprise Modules

## Module Registry

All tenant features are controlled via `TenantModuleConfig`. The registry lives in `src/features/modules/types/registry.ts`.

### Available Modules

| Module | Key | Min Plan |
|--------|-----|----------|
| Programs | PROGRAMS | Free |
| Nutrition | NUTRITION | Free |
| Recovery | RECOVERY | Free |
| Marketplace | MARKETPLACE | Starter |
| Courses | COURSES | Professional |
| Blog | BLOG | Free |
| Shop | SHOP | Professional |
| Bookings | BOOKINGS | Free |
| AI | AI | Professional |
| Reports | REPORTS | Free |
| CRM | CRM | Professional |
| Loyalty | LOYALTY | Business |
| Challenges | CHALLENGES | Professional |
| Community | COMMUNITY | Business |
| Automation | AUTOMATION | Professional |
| Marketing | MARKETING | Free |
| Digital Products | DIGITAL_PRODUCTS | Starter |

## Onboarding Wizard

5-step flow at `/onboarding`:

1. **Business Type** — 17 supported business types
2. **Branding** — Logo, colors, fonts
3. **Contact** — WhatsApp, social, location
4. **Plan** — Subscription selection
5. **Modules** — Feature toggles with plan gating

## Business Types

Fitness Coach, Personal Trainer, Nutrition Coach, Gym, Fitness Academy, Football Coach, Swimming Coach, CrossFit Coach, Yoga Instructor, Pilates Instructor, Boxing Coach, Martial Arts Coach, Running Coach, Cycling Coach, Physiotherapist, Rehabilitation Center, Sports Clinic.

Each type gets recommended modules pre-selected in step 5.

## API (Mobile Ready)

- `GET /api/v1` — Discovery document
- `GET /api/v1/courses` — Tenant courses (auth)
- `GET /api/v1/clients` — Clients (auth)
- `GET /api/v1/reports` — Analytics (auth)
- Rate limiting via `X-RateLimit-*` headers

Designed for Flutter, React Native, iOS, and Android clients.
