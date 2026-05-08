# Branding Change Guide

Use this guide when turning this starter into a new SaaS or app. Give this file to an AI agent and ask it to apply the branding for the new product.

## Inputs to Decide First

- Product name: the human-readable name, for example `Acme CRM`.
- Short text logo: the nav/logo text, for example `AcmeCRM` or `Acme`.
- Package/app slug: the lowercase machine name, for example `acme-crm`.
- Redis key prefix: usually the slug plus a colon, for example `acme-crm:`.
- One-line product description: used in landing page, footer, emails, metadata, and docs.
- Primary brand color or theme direction, if the UI should visually change.

## What to Replace

Replace machine identifiers separately from display text:

- Replace `ts-starter` with the new package/app slug.
- Replace `TS Starter` with the new product name.
- Replace `TS<span className="text-primary text-blue-600">Starter</span>` with the new text logo markup.
- Replace the placeholder logo text `Logo` in `apps/web/src/components/core/logo.tsx`.
- Replace `REDIS_KEY_PREFIX=ts-starter:` and the default `REDIS_KEY_PREFIX` value with the new Redis prefix.
- Replace generic starter/boilerplate landing page copy with product-specific copy.

## Files to Check

Start with these likely branding locations:

- `package.json`: root package name.
- `bun.lock`: lockfile package metadata. Run `bun install` after changing `package.json` so this updates cleanly.
- `README.md`: project title, setup examples, Redis container names, and project tree.
- `apps/server/.env.example`: Redis key prefix.
- `packages/env/src/server.ts`: default Redis key prefix.
- `packages/auth/src/index.ts`: auth email subject text.
- `packages/email/src/templates/magic-link.tsx`: magic-link email preview, heading, and copyright.
- `apps/web/src/components/core/logo.tsx`: shared app logo used in auth/admin/protected layouts.
- `apps/web/src/features/landing/components/landing-nav.tsx`: public landing nav text logo.
- `apps/web/src/features/landing/components/footer.tsx`: footer logo, description, and copyright.
- `apps/web/src/features/landing/components/hero.tsx`: hero badge, headline, and description.
- `apps/web/src/features/landing/components/faq.tsx`: FAQ text that mentions the starter.
- `apps/web/src/features/landing/components/cta.tsx`: CTA text that mentions the starter.
- `apps/web/src/features/landing/components/testimonials.tsx`: starter-specific testimonials.
- `apps/server/tests/admin.users.service.test.ts`: seeded/test display name if it should match the new brand.
- `apps/server/tsdown.config.ts`: check whether the `@ts-starter` pattern is still needed or should be changed/removed.

Use search to find any remaining references:

```bash
rg -n "ts-starter|TS Starter|TSStarter|TS<span|Starter|starter|boilerplate|Logo|REDIS_KEY_PREFIX" .
```

## Suggested AI Prompt

```text
Apply BRANDING.md for this app.

Product name: <PRODUCT_NAME>
Short text logo: <TEXT_LOGO>
Package/app slug: <APP_SLUG>
Redis key prefix: <APP_SLUG>:
One-line product description: <DESCRIPTION>
Primary brand direction: <COLOR_OR_STYLE>

Update all user-facing branding, docs, email text, env examples, and package metadata. Keep the app behavior unchanged. After editing, run formatting/type checks if available and search for old branding references.
```

## Verification

After applying branding changes:

```bash
bun install
bun run check-types
rg -n "ts-starter|TS Starter|TSStarter|TS<span|Starter|starter|boilerplate|Logo" .
```

Some lowercase uses of `starter` may remain intentionally in documentation if you still want to describe the repository as a starter template. Otherwise, rewrite them to describe the actual product.
