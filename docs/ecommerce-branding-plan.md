# Ecommerce deployment branding plan

Date: 2026-10-04
Status: deployment branding and niche image assets implemented and verified; brand data seeding remains a separate task.
Repository: `/home/khalid/Desktop/projects/saas/ts-starter`, branch `ecommerce`.

## 1. Goal

Use one repository for several niche ecommerce stores. Each deployment selects one brand with the same environment key in web and server:

```dotenv
BRAND=foodshop
```

A typed object registry in the existing `packages/config/src/brand.config.ts` maps that key to branding, niche, public content defaults and a declared seed-data source. The chosen brand controls identity and presentation; it does not create shared-store tenancy.

Every shop retains its separate database, Redis, runtime, domain, credentials and deployment. Never select a brand from a request header, hostname, customer input or query parameter. Changing BRAND is not a way to switch an existing store database to a different business.

Branding comes first. Brand-specific catalog seed data is a later, separately agreed task. No automatic migration, seed, reset, fixture write or provisioning in branding/build/start commands.

## 2. Existing code and reference

- `packages/config/src/brand.config.ts` currently exports one hard-coded `brandConfig`, including logo paths, contact/location, commerce and SEO defaults.
- `packages/config/src/config.ts` re-exports it and derives `siteConfig`; site URL is currently a placeholder.
- `apps/web/src/components/core/logo.tsx` currently renders an initial/text logo; it does not consume `logoUrl`.
- Public footer and homepage metadata already consume branding. New landing copy and decorative fallback image remain generic and need a small set of niche-specific fields.
- `apps/server/src/modules/admin/catalog/catalog.service.ts` uses `brandConfig.name`; server consumers need the same selected brand.
- `packages/env/src/env.public.ts` exposes only selected VITE-prefixed browser values. Server env imports `@config`, so making config import server env would introduce a dependency cycle and leak risk.
- Vite web builds bundle client and SSR code. A plain browser read of `process.env.BRAND` is insufficient. Build-time selection and runtime agreement must be explicit.
- Existing seed entrypoints are under `packages/db/prisma/seed/`. They are separate from brand selection.

Inspected reference: `/home/khalid/Desktop/projects/interspeed/job-apps/job/branding.config.ts`, `lib/branding.ts`, `lib/branding-resolver.ts`. It uses an object registry, typed config and `env.BRAND`, with uppercase keys and a Jobflix fallback. Reuse the registry/resolver pattern here, with the user's lowercase keys and explicit errors for invalid deployment configuration rather than silently serving the wrong store.

## 3. Proposed registry

| Key / env value | Proposed display name | Niche | Domain status |
| --- | --- | --- | --- |
| `foodshop` | FoodShop BD | Food, fruit and seasonal mango collections | User said `foodshopbd`; exact full domain/TLD needs confirmation. |
| `bestsky` | BestSky BD | Electronics and gadgets | `bestskybd.com` supplied by user. |
| `airshop` | AirShop BD | Clothing and footwear, provisional | `airshopbd.com` supplied by user; niche still tentative. |

Display names are proposals, not final logos. Do not assume `foodshopbd.com`, live DNS, a legal business name, physical address, support contacts or social accounts.

Shape proposal, not implementation:

```ts
export const brands = {
  foodshop: { /* food and fruit brand */ },
  bestsky: { /* electronics brand */ },
  airshop: { /* clothing/footwear brand */ },
} satisfies Record<BrandKey, BrandConfig>;

export type BrandKey = "foodshop" | "bestsky" | "airshop";
// resolveBrand(raw) validates the key and returns the selected entry.
// brandConfig remains the stable selected-config export for existing consumers.
```

Keep the existing file rather than creating a second branding source. `BRAND` uses these exact lowercase keys; trim whitespace and reject unknown values. Recommended: require it explicitly in all app environments and add it to reviewed local/test/deployment configuration during implementation. Do not give tests a hidden default that can mask a mismatched deployment.

## 4. Proposed configuration fields

| Group | Fields / responsibility |
| --- | --- |
| Identity | Registry key, display name, short description, tagline and text-logo fallback. |
| Niche | `food`, `electronics` or `fashion`; used for sensible presentation/content defaults, not backend permission or fulfillment decisions. |
| Assets | Header/footer logo, optional dark logo, favicon, app/touch icon, hero and social image. Use versioned local public paths such as `/brands/foodshop/...`. |
| Theme | A small typed set of accent/surface tokens for light/dark themes. Reuse existing design components; no separate CSS/component framework per store. |
| Homepage | Hero heading/body/action label, supporting section headings and approved decorative imagery. Reuse one layout; add niche-specific text/images rather than duplicating the page. |
| Commerce defaults | Country, currency, locale and supported locales; BDT/BD are proposals for these stores. Existing persisted operational settings remain authoritative. |
| Links/contact | Canonical public origin when confirmed, email, phone, WhatsApp URL, optional support/social links. Missing values stay absent; no example support details presented as real. |
| SEO defaults | Brand/site title, description and sharing image. Used as fallback for later published admin home/about SEO; product-specific fields continue to take precedence. |
| Seed declaration | Stable `datasetKey` plus repository-relative `dataPath` for a future explicit brand seed runner. No DB URLs, credentials or executable callbacks. |

Suggested seed paths: `packages/db/prisma/seed/data/brands/foodshop`, `.../bestsky`, `.../airshop`. These are reserved proposals; do not create fake datasets or change current seed execution in this phase. Branding may declare a future path while that dataset is not yet implemented. Later seed execution must require that path to exist before doing any write.

All entries contain configuration only. Never put SMTP, payment, courier, storage, database or authentication secrets in the registry. Filesystem/module-loading code belongs only in a future server-side seed runner.

## 5. Resolve BRAND consistently

Recommended lifecycle:

1. A pure resolver validates BRAND without importing `@env/server`, database code or filesystem modules.
2. API startup resolves runtime `BRAND` and fails early on missing/unknown keys.
3. Vite config validates the same `BRAND` and exposes only that validated public key to the browser/SSR build. A narrowly scoped define for the selector is sufficient; never expose the whole process environment or enable unrestricted env-prefix behavior.
4. Web startup checks runtime BRAND against the recorded brand used to build that web artifact. Reject mismatches and tell the operator to rebuild with the intended key. Changing `.env` after a build cannot silently relabel baked assets/content.
5. Production deployment verifies API and web agree. Use a narrow non-secret brand identity in existing public configuration/bootstrap data or an equivalent startup check. A mismatch must produce an explicit configuration error, never a mixed-brand storefront.
6. Include BRAND in Turbo cache inputs and any relevant Docker build arguments/runtime configuration so artifacts cannot be reused across brands accidentally.

The exact small build-identity implementation should be selected after inspecting current production build scripts. Avoid circular config/env imports and keep all browser imports SSR-safe. No new `VITE_BRAND` variable for the operator: if the build internally derives a Vite-compatible constant, it derives it from BRAND automatically and is not a second manual setting.

Build once per brand/deployment for this first version. Runtime-switchable branding and one artifact serving several stores are out of scope.

## 6. Config versus admin-managed data

- Registry: deployment identity, asset/theme defaults, niche and declared seed source.
- Environment: brand selection and deployment-specific URLs/credentials. Local API/CORS/auth URLs remain localhost when testing; public brand domain must not redirect tests to the live store.
- Existing DB settings: operational store currency/contact/checkout configuration where already supported.
- Future published website content: home/about copy and SEO, with registry fallbacks when absent.
- Catalog: actual product/category/variant data and product SEO, not hard-coded registry rows.

Define precedence explicitly: published admin content overrides editable copy/SEO; persisted operational settings override corresponding defaults; registry supplies deployment identity and defaults. Do not let branding silently overwrite StoreSettings or existing merchant records. Flag conflicting persisted store identity/currency for review rather than rewriting it on startup.

Niche never enables warranty or changes stock/payment policy globally. Product fulfillment kind and eligibility remain authoritative. FoodShop cannot claim certified organic status without supplied evidence; AirShop remains provisional until confirmed.

## 7. Implementation phases after approval

| Phase | Work | Acceptance |
| --- | --- | --- |
| 1. Registry and resolver | Extend existing typed config, add the three entries and pure resolver, preserve stable imports | All keys resolve; missing/unknown values fail; no backend/secret imports in browser path. |
| 2. Environment/build wiring | Same BRAND input for API/web, build identity checks, Turbo/deployment inputs and env examples | Build/start mismatch fails clearly; each brand selects correctly; changing BRAND invalidates build cache. |
| 3. Brand presentation | Logo/favicon/theme/home defaults/footer/site SEO consume selected brand | Desktop/mobile and light/dark show consistent identity; safe text fallback for missing supplied logos; existing bottom navigation/cart preserved. |
| 4. Verification and handoff | Focused resolver/build tests, boundary/build checks, approved local browser review | No mixed brand, unsupported config or unintentional external calls; all started servers stopped afterwards. |
| Later: niche seed plan | Agree real dataset structure, idempotency, existing-data policy and exact target guards | No execution until separately authorized; see section 8. |

No generated logo/brand artwork is assumed in the wiring phase. Approved assets can be supplied or separately commissioned/generated. Never point the application at nonexistent logo/image paths; use the existing text fallback until files exist.

## 8. Later seed contract (not implementation authority)

The future seed runner must explicitly select the dataset declared for BRAND, validate it and the exact approved DB target, and state what it will write before execution. Limit path resolution to a fixed repository seed root and an allowlisted registry entry; never accept arbitrary env-driven imports or paths. Require dataset brand identity to match the selected deployment.

Agree handling of categories, attributes, variants, food batches/expiry, gadget serial/warranty and fashion sizes/colors separately. Proposed scope is curated catalog data, not fake customers/orders/reviews/sales, and not credentials/RBAC bootstrap. Define idempotent keys, repeat behavior and owned-data cleanup; do not overwrite merchant edits by default. Whether provisioning stock or opening balances is needed must be explicitly agreed.

Merely configuring `seed.dataPath` must do nothing at build/start/import time. Existing databases remain unchanged through branding.

## 9. Decisions to settle

1. Confirm exact FoodShop domain including TLD.
2. Confirm lowercase keys `foodshop`, `bestsky`, `airshop` and display names above.
3. Confirm AirShop clothing/footwear niche, or leave it provisional with neutral copy.
4. Decide initial logos/colors/hero assets: supplied assets now or text-logo fallback until a separate design pass.
5. Confirm shared deployment approach: explicit BRAND in both build and startup env, one build per brand, early failure for invalid/mismatched selection.

Currency/contact/social/policy content must come from actual merchant facts; no need to invent them to finish registry wiring. Admin content/SEO work can continue later according to the public/customer content plan.

## 10. Initial planning checkpoint (superseded by section 11)

Completed: read-only inspection of existing ecommerce branding/env consumers and the requested job-apps reference; this plan only. Application code, environment files, database, seeds, runtime and commits untouched. Existing landing work remains uncommitted and preserved.

Next: user reviews the proposed registry/selection contract and confirms the key/domain/design decisions. Implement branding only after explicit instruction. Then plan and authorize niche-specific seed data separately.

No task-owned servers may remain running after work finishes. No migrations/seeds/resets/new DB or tutorials under this planning scope. Public/customer dashboard/pages/admin SEO and failed peak/security/staging/backup-restore/real merchant acceptance remain unfinished; branding does not imply those gates have passed.


## 11. Authorized implementation and verification — 2026-10-04

User confirmed AirShop clothing/footwear, requested retaining its existing hero, generating separate food/gadget heroes and three reusable product images per niche, and explicitly requested committing previous changes first. Landing work committed as `176f5f7`; branding plan committed as `2e9d2bd`, no push. Branding follow-on remains uncommitted.

Implemented:

- Typed `brands` registry in `packages/config/src/brand.config.ts`: keys `foodshop`, `bestsky`, `airshop`, identity/niche, optional supplied public origin, logo override hook, monogram favicon, commerce defaults, SEO/homepage defaults and declared seed paths/product-image tuples. No invented merchant support details, city or FoodShop TLD; no organic certification claim. Full logos can replace monograms through existing `logoUrl`; layout/theme remains shared.
- Pure resolver rejects missing/unknown/inherited keys. Selected exports live in `brand.ts`, keeping registry/resolver safe to import from Vite/build tests without loading the selected deployment or backend env. Existing `@config/brand` imports and TS aliases resolve to the selected wrapper. Server env requires BRAND. No config-to-server-env cycle or entire-env exposure.
- Vite resolves BRAND from inherited env or its local env files and substitutes only the public selector in browser/SSR output. Build writes `dist/brand.json`; production web startup checks runtime BRAND before importing the artifact/listening. Turbo includes BRAND in global cache inputs. One web build per brand; rebuild when changing BRAND.
- API liveness reports its non-secret selected brand. A root server loader validates the configured API's identity before loading any public/customer/admin route. Hostnames and customer input cannot select branding. Deployment identity does not rewrite existing StoreSettings or catalog data.
- Header/logo, favicon, HTML language/brand marker, footer, home hero/copy/banner and brand SEO defaults use selected config. AirShop always retains `/ecommerce/images/shopping-editorial.webp`; seeded product photography no longer replaces the brand hero. Admin-managed home/about SEO is still a later phase.
- Added `BRAND=airshop` to web/server env examples and the ignored reviewed local test env/runtime, preserving other values. No live domain/auth/CORS/API target substituted for localhost.

Assets generated with the built-in image-generation tool and converted to WebP with local ImageMagick, preserving original tool PNGs. Exact final prompts and workspace paths are in `docs/ecommerce-brand-assets.json`; all new files are under `apps/web/public/brands/`. Two new heroes plus nine product images total approximately 650 KB including icons. Visual inspection covered both heroes and a nine-image contact sheet. Product images are illustrative fictional catalog assets for later seeding, not verified real stock/product specifications.

| Brand | Hero | Reusable seed product assets |
| --- | --- | --- |
| FoodShop | `/brands/foodshop/hero.webp` | `mangoes.webp`, `honey.webp`, `dates.webp` under `/brands/foodshop/products/` |
| BestSky | `/brands/bestsky/hero.webp` | `headphones.webp`, `smartwatch.webp`, `earbuds.webp` under `/brands/bestsky/products/` |
| AirShop | Existing shopping-editorial WebP retained | `t-shirt.webp`, `sneakers.webp`, `hoodie.webp` under `/brands/airshop/products/` |

Seed paths are declarations only. Dataset folders/runner changes/data writes were not created. BRAND selection/import/build/start never loads or executes a seed. No migration, reset, new DB, real courier/payment/mail, production/staging action or tutorial.

Validation: five branding tests / 53 assertions passed, covering strict key selection, niche/seed namespaces, mismatch/invalid manifest refusal, missing facts and existence of every referenced local asset. All three production web builds passed. Server production build and server TypeScript passed; web client boundary check and `git diff --check` passed. Full web TypeScript remains failing in pre-existing alias/other-page diagnostics; no diagnostics reference changed branding files. No claim of clean whole-repo types or new courier/money persistence acceptance.

Actual retained isolated-runtime verification: existing guards checked before startup; API/web used localhost 3000/3001, existing test DB/Redis and disabled workers. All three matched-brand pages returned server-rendered identity, favicon and matching hero. Wrong runtime for the web build failed before listening; FoodShop web against AirShop API returned HTTP 500 instead of mixed-brand content. FoodShop/BestSky actual phone CSS width 390 had no horizontal overflow; BestSky desktop reviewed. Final local artifact rebuilt/rechecked as AirShop, matching the local test env. Private evidence is under `tests/artifacts/branding/` (unit/types/boundaries, rendered HTML and asset contact sheet); build logs are local temporary files. Ordinary isolated visitor telemetry may remain; no broad data cleanup.

All task-owned API/web/test PostgreSQL/Redis services were stopped afterwards. Ports 3000/3001/9099/5433/6380 were verified free. Data volumes retained; capacity resources untouched.

Operational configuration/recheck:

1. Set the same `BRAND=foodshop`, `BRAND=bestsky` or `BRAND=airshop` for API runtime, web build and web runtime. `BRAND` is required; there is no separately configured VITE_BRAND.
2. With the reviewed local runtime, direct web build is `BRAND=airshop bun --env-file=tests/artifacts/step14/runtime.env run --cwd apps/web build`. Server build can use the corresponding direct package command. These commands do not provision/seed. Test resolver/assets with `bun test packages/config/src/brand.test.ts`; no app startup is needed for that test.
3. After explicitly guarded isolated API/web startup, inspect `/health/live` and `/`, phone/desktop navigation and the matching hero. Use the existing production server script to check the build/runtime manifest. Stop every task-owned service after review. Do not replace local API/auth targets with merchant domains merely because BRAND changes.

Next: agree and implement the three niche datasets using the registry asset paths, explicit idempotency/merchant-edit policy and exact authorized DB targets. No seed execution is authorized by this branding task. FoodShop's exact full domain remains unconfirmed and unset. Actual merchant logos/contact/policies can be supplied later. Public/customer dashboard/pages/admin SEO and failed peak/security/staging/backup-restore/real merchant acceptance remain open. No tutorials.


Commit checkpoint — 2026-10-04: branding/assets committed as `a5e58ec` under the user’s “do commits and then do the seo from admin” instruction. Shop/product polish committed separately as `c37fed1`. No push. New SEO work is recorded in V3 section 32 and remains uncommitted; brand seed/image expansion is deferred. All verification services are stopped.
