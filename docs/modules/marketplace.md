# Marketplace Module

## Overview

The marketplace is a public directory where visitors discover and compare fitness coaches. Each coach controls their own visibility.

## Features

- Public coach profiles with verification badge, ratings, reviews
- Specialties, certifications, languages, gallery, videos
- Recovery services, programs, pricing, available slots
- Filters: country, city, specialty, gender, rating, price, language
- Search by name
- Per-coach visibility toggle

## Key Files

| File | Purpose |
|------|---------|
| `features/marketplace/services/marketplace-search.ts` | Search, filter, profile lookup |
| `features/marketplace/actions/marketplace-actions.ts` | Profile CRUD, visibility toggle |
| `features/marketplace/components/coach-card.tsx` | Marketplace listing card |
| `features/marketplace/components/marketplace-filters.tsx` | Filter sidebar |
| `app/(platform)/marketplace/` | Public marketplace routes |

## Routes

- `/marketplace` — Browse all visible coaches
- `/marketplace/[slug]` — Full public coach profile

## Visibility

Coaches enable marketplace from `/dashboard/settings/marketplace`. Requires Starter plan or above (`marketplace` feature flag).

## Rating Sync

Call `syncMarketplaceRatings(tenantId)` after review create/update to refresh cached `averageRating` and `reviewCount`.
