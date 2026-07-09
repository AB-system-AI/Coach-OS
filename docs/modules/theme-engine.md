# Theme Engine Module

## Overview

The theme engine allows each coach to customize their public website appearance without touching code. Theme settings are stored per-tenant and injected as CSS custom properties.

## Customizable Properties

| Property | Default | Description |
|----------|---------|-------------|
| `primaryColor` | `#6366f1` | Primary brand color |
| `secondaryColor` | `#8b5cf6` | Secondary accent |
| `accentColor` | `#06b6d4` | Highlight color |
| `backgroundColor` | `#ffffff` | Page background |
| `textColor` | `#0f172a` | Body text |
| `fontFamily` | `Inter` | Body font |
| `headingFont` | `Inter` | Heading font |
| `borderRadius` | `0.625rem` | Component radius |
| `logoUrl` | — | Brand logo |
| `heroImageUrl` | — | Hero section image |
| `heroTitle` | — | Hero headline |
| `heroSubtitle` | — | Hero description |
| `whatsappNumber` | — | WhatsApp contact |
| `socialLinks` | `{}` | Social media URLs |

## Key Files

| File | Purpose |
|------|---------|
| `features/theme/types/index.ts` | Theme types and CSS variable mapping |
| `features/theme/components/tenant-theme-provider.tsx` | Injects theme into DOM |
| `features/theme/actions/theme-actions.ts` | Update theme server action |

## Usage

Wrap tenant pages with the theme provider:

```tsx
import { TenantThemeProvider } from "@/features/theme";

<TenantThemeProvider theme={tenant.theme}>
  {children}
</TenantThemeProvider>
```

Use CSS variables in components:

```css
.button {
  background-color: var(--tenant-primary);
  font-family: var(--tenant-font);
  border-radius: var(--tenant-radius);
}
```

## Updating Theme

Coaches update their theme from `/dashboard/website`:

```typescript
import { updateTenantTheme } from "@/features/theme";

await updateTenantTheme({
  tenantId: "xxx",
  primaryColor: "#ff6b00",
  logoUrl: "https://...",
  heroTitle: "Transform Your Life",
});
```

## Database Model

Theme data lives in the `TenantTheme` table with a 1:1 relationship to `Tenant`. A default theme is created automatically when a tenant is provisioned.
