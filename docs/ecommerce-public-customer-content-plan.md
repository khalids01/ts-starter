# Ecommerce public pages, customer area and content plan

Date: 2026-10-04
Status: landing/navigation, branding and shop/product polish implemented; admin SEO code and read-only runtime checks completed (section 13), with schema provisioning, persisted publication and browser acceptance unfinished. Broader customer/content phases remain planned.
Project: `/home/khalid/Desktop/projects/saas/ts-starter`, branch `ecommerce`.

## 1. Objective and boundaries

Create a polished, coherent ecommerce experience, with particular attention to the landing page and customer dashboard. Cover browsing, product details, saved items, cart, checkout, account/profile, simple settings, order history and essential information pages. Let authorized administrators manage home/about SEO and appropriate public content; derive product SEO from product information and existing optional SEO overrides.

This document is a proposal for discussion. The user explicitly requested no implementation until the scope is settled and they say to start. Writing this plan does not authorize code/schema changes, app startup, database operations, test fixture writes, commits or pushes. Existing unrelated uncommitted courier recovery work must be preserved.

Each shop remains an independent deployment/database/Redis/domain with its own credentials. No tenancy layer. Preserve existing payment, inventory, shipping, ownership and warranty rules. Packaged/fresh food, gadgets and partial payments stay in scope; warranty applies only where eligible, never to food/clothing.

Peak capacity, security, staging, backup/restore and real merchant acceptance remain open in V3 sections 27–28. This visual/content work does not close those gates. No tutorial creation, recording or generation without an explicit request.

## 2. Current repository evidence

This is a source review, not a browser or runtime assessment.

| Area | Current source | Planning implication |
| --- | --- | --- |
| Home | `apps/web/src/features/landing/home.tsx` | Has hero, category/product blocks and shared storefront shell, but technical copy such as “Dynamic product catalog” and synthetic product fallbacks need replacement with merchant-facing content and honest data states. |
| Public shell | `features/shop/public-shop-shell.tsx`, `components/public-header.tsx`, `components/public-footer.tsx` | Reuse and refine header/footer/mobile navigation/cart sheet across public and customer journeys. |
| Commerce routes | `routes/_public/shop`, `cart`, `saved`, `checkout`, `track-order` | Restyle existing flows and preserve validated contracts. Avoid parallel cart/checkout implementations. |
| Dashboard | `routes/_protected/dashboard.tsx` | Currently shows Free/Pro subscription actions; customer dashboard needs ecommerce orders and helpful account actions. |
| Protected shell | `routes/_protected.tsx` | Currently includes SaaS billing navigation and subscription-state fetching; review ecommerce mode and dependencies without breaking other starter consumers. |
| Profile/security | `routes/_protected/account.tsx`, `settings.tsx` | Existing profile/password/social/2FA/session operations can be reused and reorganized. Do not remove working security functionality to simplify presentation. |
| Customer orders | `apps/server/src/modules/shop/shop.controller.ts` | Authenticated order listing/detail endpoints already exist; audit their response and ownership contract before connecting dashboard pages. |
| Home SEO | `routes/_public/index.tsx` | Uses build-time `brandConfig.seo`; proposed admin-managed metadata needs persisted content and server-loaded route data. |
| Product SEO | `packages/db/prisma/schema/ecommerce-catalog.prisma`, admin product builder/service | `seoTitle` and `seoDescription` already exist. Reuse them; avoid duplicate fields. Product route currently has only a component, so route loading and head generation need design. |
| Store settings | `packages/db/prisma/schema/ecommerce-settings.prisma` | Has operational store/contact/checkout settings, not home/about content or SEO. Persistence additions may be needed and must be reviewed separately. |
| Information pages | Current route inventory | No dedicated about/contact/terms/privacy routes were found. Add them within the existing public route system. |

## 3. Proposed page scope

Route names below are proposals. Preserve existing URLs where practical; agree any renames and redirects before implementation.

### Public storefront

| Page | Proposed content and behavior |
| --- | --- |
| Home `/` | Merchant identity, strong product-focused hero, primary shop action, category navigation, curated real products, one useful promotion/editorial section, short about section, factual service assurances and complete footer. |
| Shop `/shop` | Clear search/filter/sort, responsive product grid, selected filters, pagination, genuine loading/empty/error states and easy return to browsing. |
| Product `/shop/products/:slug` | Gallery, title, price, options, availability, quantity, add-to-cart, delivery information, description/specifications, relevant food/gadget information and eligible warranty terms. |
| Saved `/saved` | Consistent product cards, unavailable item handling and clear move-to-cart actions; retain current persistence behavior unless separately agreed. |
| Cart `/cart` | Editable items, accurate totals, stock/price change feedback, empty cart and straightforward checkout action. |
| Checkout `/checkout` | Guest and signed-in flow as currently supported, contact/address, shipping, payment choice, itemized totals, policy links and clear validation. No invented online payment integration or promises. |
| Order confirmation | Clear order number, actual payment/delivery state, next steps and permitted tracking/account links. Refresh must not create another order. |
| Tracking `/track-order` | Customer-friendly timeline and supported lookup flow; expose only permitted public/customer data. |
| About `/about` | Real merchant story, what is sold, operating values and contact/shop links. No invented credentials, locations or achievements. |
| Contact `/contact` | Real email/phone/location/hours and approved support channel. Default to direct contact links; a message form requires a separately agreed storage/delivery workflow. |
| Terms `/terms`, privacy `/privacy` | Merchant-supplied approved policies with effective date, readable headings and consistent layout. Publishing legal text requires supplied facts and merchant review; this plan does not draft legal claims. |
| Delivery and returns | Recommended `/shipping` and `/returns` pages explaining actual service areas, fees, perishable/product-specific restrictions and refund process. Decide whether separate pages or approved sections on terms/contact. |
| Not found/error | Helpful navigation and proper route/error responses, including unavailable products. |

Login, signup, password recovery and verification screens should receive the same visual language and preserve existing authentication flows and safe return-to-page behavior.

### Customer area

| Page | Proposed content and behavior |
| --- | --- |
| Dashboard `/dashboard` | Personal greeting, recent orders with meaningful statuses, links to all orders, saved items and profile. Use real values; omit vanity statistics and SaaS upgrade prompts in ecommerce mode. |
| Orders `/orders` | Paginated history, useful filters only when supported, item/amount/date/status summary and clear detail link. |
| Order detail `/orders/:orderNumber` | Items, address snapshot, order/delivery timeline and authoritative money breakdown: total, received, refunded, remaining balance when determinable. Explain held/ambiguous states; never infer balances from status labels. |
| Profile `/account` | Name/avatar and verified account identity, with clear distinction between login identity and order delivery/contact snapshots. Changing a profile must not rewrite historical orders. |
| Simple settings `/settings` | Appearance where supported, sign-in/security, devices/sessions and logout. Group advanced security instead of exposing a long technical form. Persist only preferences backed by real behavior. |
| Support/warranty | Order-context help and existing eligible gadget warranty claim flow. Show food/clothing return guidance without warranty actions. Show cancellation/refund/return buttons only if existing customer policy/endpoints authorize them. |

Saved address management is a decision item, not assumed functionality. It requires a customer-owned persistent model/API and tests if absent. Keep it out of the first pass unless explicitly selected. Notifications, account deletion and marketing preferences likewise need defined behavior before adding controls.

## 4. Design direction to agree

Recommended starting direction: a clean retail design with strong photography, generous spacing, restrained borders, one primary accent color, readable typography and clear action hierarchy. Prioritize mobile browsing and checkout. Use consistent product imagery ratios, button styles, form labels, cards, status badges, section widths and navigation.

Home sequence proposal:

1. Header with brand, search/shop access, account and cart.
2. One strong hero with approved headline, supporting copy, image and shop action.
3. Categories that reflect the actual catalog.
4. Featured products selected by a defined rule or admin selection.
5. Optional promotion/editorial section only when valid content exists.
6. Short merchant story linked to about.
7. Verified delivery/support/quality information and footer.

Do not fill missing catalog data with purchasable-looking fake products. Avoid fake reviews, countdowns, stock scarcity, sales numbers or delivery promises. Hide optional empty sections; make catalog loading/failure distinguishable from a genuine empty catalog.

Review static layout proposals for home, dashboard, product and checkout before applying a shared visual system. No carousel, elaborate animation, new UI framework or image generation is assumed. Support reduced motion and existing theme behavior; decide whether storefront needs both themes.

## 5. Admin content and publication proposal

Use the existing admin app, permissions, upload mechanisms and component system. Add a small structured “Website content” area instead of a general page builder or second CMS.

Proposed editable content:

- Storefront identity: logo/approved imagery, short brand description and public contact information, avoiding conflicting copies of existing store settings.
- Home: hero heading/body/image/action, featured category/product selection, optional promotion and short about section.
- About: heading, story sections, optional imagery and SEO.
- Contact: contact details/support hours and channels.
- Policy pages: approved terms/privacy/shipping/returns content and effective dates.
- Home/about SEO: title, description and social sharing image; canonical URL derives from the configured deployment domain and fixed page route.

Recommended publication model: draft, preview and explicit publish for public content; public reads return only published fields. Keep the last published version visible while editing. Draft previews require authorization and must not be indexable or publicly cached. Include clear saved/published states and audit publication. Agree version retention and policy editing depth before schema design; avoid a complex editorial workflow.

Persist operational settings separately from content when that keeps ownership and validation clearer. Proposed content records are deployment-local, with fixed allowed page keys and structured sections. Reuse existing product SEO and media references. No arbitrary scripts/raw head tags or unrestricted HTML. Validate text lengths, destinations and image references; use safe structured rendering or an agreed sanitized rich-text format.

Server RBAC must enforce read/manage/publish, with UI reflecting those permissions. Decide whether existing store-settings permissions cover content or whether dedicated content permissions are warranted; never rely on hidden admin navigation as authorization.

## 6. SEO proposal

Home/about metadata must come from published admin content during server rendering. Product metadata must come from the same authoritative product loaded for the page, using existing nonempty SEO overrides first, then product name/description and store name. Images use the product's real public image; omit absent images instead of inventing them.

Planned outputs and checks:

- Per-page title, description, canonical URL, Open Graph and social-card metadata, with sensible store defaults.
- Crawlable server-rendered page/product content and metadata without requiring client JavaScript; inspect the existing TanStack setup before choosing loaders/rendering changes.
- Deployment-configured public origin validated once; never derive canonical URLs from untrusted request headers or admin-entered arbitrary hosts.
- Sitemap containing published informational pages and eligible public active products; exclude drafts, private routes and duplicate/filter URLs.
- Robots/indexing policy: home/about/contact and valid catalog pages indexable as agreed; account/auth/cart/checkout/tracking/confirmation/draft/admin pages excluded. Authentication protects private data independently of robots rules.
- Product structured data and breadcrumbs only for facts present in published product data, including accurate price/currency/availability. No fabricated ratings/reviews. Merchant identity structured data only from approved facts.
- Valid missing/unpublished product handling and canonical handling for query filters/pagination; agree indexable category strategy before building it.
- SEO changes invalidate the relevant cache; product price/availability metadata must not remain stale beyond an agreed cache policy.
- Safe escaping for metadata/JSON-LD and no customer/order information in metadata, public payloads or shared caches.

No ranking guarantee, external crawler submission, analytics/cookie installation or production domain change is included. Verify current primary documentation for the selected technical approach when implementation starts.

## 7. Proposed implementation phases, after authorization

| Phase | Deliverable | Completion evidence |
| --- | --- | --- |
| 0. Confirm scope | Approved brand/design direction, page list, content fields, account behavior and policy sources | Decisions below resolved; plan updated; no implementation yet. |
| 1. UI foundation | Shared storefront/customer shell, typography, spacing, forms, cards, footer and navigation | Review home/dashboard/product/checkout layouts at mobile and desktop widths. |
| 2. Public pages | Home, shop/product, about/contact/policies, saved/cart and coherent auth screens | Real data states, approved copy, working navigation, keyboard/mobile checks. |
| 3. Purchase journey | Cart, checkout, confirmation and tracking polish | Existing totals/reservations/payment/shipping/idempotency contracts preserved; meaningful persisted assertions in authorized isolated tests. |
| 4. Customer area | Dashboard, orders/detail, profile/simple settings and eligible existing help/warranty flows | Two-customer ownership checks, correct money/history, saved profile/security behavior and clear empty/error states. |
| 5. Admin content and SEO | Structured editing/publication, home/about SEO, product-derived SEO and technical SEO output | RBAC, draft isolation, publication/cache behavior, raw response metadata, sitemap/robots and structured data checks. |
| 6. Review and handoff | Cohesive visual review, regressions, docs and explicit unfinished gates | Focused types/build/client-boundary checks plus authorized existing browser/persistence harness; no claim of release acceptance. |

Phases are logical review units; persistence/API dependencies may require preparing phase 5 before public pages can consume real content. Set that execution order after approving the data contract. Do not duplicate temporary hard-coded content systems just to follow table order.

If schema changes are needed, present exact proposed model/permission changes and prerequisites first. No migration, seed, reset, provisioning or new database is authorized by this plan. Later local execution must independently verify exact guards/targets and reuse the established harness.

After each completed implementation phase, update this plan and V3 progress with changes, evidence, commands after startup, next step and unfinished gates. Preserve prior failed checks and distinguish code/type/build evidence from browser/persistence acceptance.

## 8. Acceptance checklist

- Public/customer pages share a coherent identity and work at narrow mobile, tablet and desktop widths without horizontal overflow.
- Keyboard navigation, focus, headings, labels, validation and status feedback are accessible; dialogs/cart sheet manage focus, contrast is readable and reduced motion is respected.
- Responsive images reserve layout space, avoid unnecessary loading and keep the hero practical on mobile; assess page performance after implementation rather than claiming it from design.
- Every page has useful loading/empty/error/disabled states and valid navigation; no fake catalog rows or unsupported actions.
- Dashboard/order detail use authoritative customer-owned data; cross-account and anonymous access cannot read another customer's orders, addresses, payment details or gadget serial identifiers.
- Checkout preserves backend totals, stock/reservation, replay protection, disabled checkout and actual payment choices. Pending/partial/refunded/manual-review cases remain truthful.
- Profile/security changes persist through existing supported operations; no placeholder setting pretends to save.
- Published admin content and SEO persist, survive reload and appear in server responses; draft changes do not leak to public reads/caches/sitemaps.
- Product SEO fallback/override works for active products and missing descriptions/images; inactive/missing products and canonical URLs behave correctly.
- Approved merchant policy/contact facts are present; no invented legal, delivery or warranty claims.
- Unresolved capacity/security/staging/recovery/merchant gates and the tutorial prohibition remain explicit.

## 9. Decisions before starting

1. **Brand and visual references:** shop name/logo, preferred colors, typography direction, two or three reference stores, and supplied imagery. Recommended default: restrained modern retail design.
2. **Catalog emphasis:** should the hero focus on one merchant category or a mixed food/gadget catalog? Which actual products/categories should be featured?
3. **Language and location:** initial language, currency, delivery region and whether localization is needed now. Keep deployment's actual settings authoritative.
4. **Content scope:** home/about SEO is required. Confirm the proposed structured home/about/contact/policy editing and draft/publish workflow; a full page builder is excluded.
5. **Customer scope:** confirm orders/detail and support/warranty links alongside dashboard/profile/settings. Decide whether saved addresses or any new self-service cancellation/return capability is needed in this pass.
6. **Policies/contact:** provide real merchant facts and approved policy text before publication; choose direct contact links or a defined message form workflow.
7. **Starter compatibility:** decide whether customer experience replaces SaaS navigation for this ecommerce deployment or uses an explicit ecommerce mode while retaining reusable starter billing features.
8. **Themes and media:** light-only storefront versus existing theme support; supplied licensed images versus separately requested asset creation.

## 10. Initial planning checkpoint (superseded by section 11)

Completed: read-only source assessment and this planning document. No product/code/schema change, runtime test, database operation, commit, push or tutorial in this planning turn.

Next: settle section 9 and refine the visual/page/content proposal with the user. Implementation remains blocked by the user's explicit “do not start” instruction until they say to begin. After that authorization, start with the approved design contract and prerequisite assessment, retaining all existing data-operation boundaries.


## 11. Landing page implementation — 2026-10-04

The user authorized “first do commits then make” a polished responsive landing page with mobile bottom icon navigation. Previous courier recovery changes committed as `ccba53d`; planning document committed separately as `c076aee`. New landing changes remain uncommitted; no push.

Completed: replace technical demo copy with shopper-focused sections, responsive editorial hero, real category tiles, real product cards with existing save controls and accurate active-variant prices, explicit loading/error/retry/empty states, shopping guide and collection banner. Refine shared header/search/footer and use a mobile bottom bar with Home/Shop/Saved/Cart/Account, active route indication, touch-sized controls and safe-area padding. The cart opens the existing sheet. Search submits once through the form, prevents browser reload and accepts trimmed short queries. Shared spacing reserves space for the fixed navigation. No checkout/payment/inventory/auth API contract or schema change.

Built-in image-generation skill/tool created decorative unbranded shopping imagery at `apps/web/public/ecommerce/images/shopping-editorial.webp` (59 KB). It appears when no product image is available for the hero; actual catalog imagery takes precedence. Original PNG remains under the tool's generated-image directory. Final prompt: “Use case: ads-marketing. Asset type: generic ecommerce landing hero editorial illustration, portrait 4:5 composition. Create a polished studio still life of two unbranded shopping bags, one forest green and one warm ivory, with a folded cream textile and a small simple kraft parcel on a pale sage plinth. Background solid pale sage, soft daylight from upper left, beautiful realistic paper texture and restrained shadows. Clean premium retail art direction, lots of breathing room, centered composition that crops well to square on mobile. No text, no logos, no labels, no prices, no people, no neon, no shopping carts. This is decorative shopping imagery, not product photography.” Conversion to WebP used local ImageMagick without changing scene content.

Validation: production web build and client boundary checker passed; `git diff --check` passed. Browser skill review of the actual retained isolated app verified light/dark layouts, no horizontal overflow at measured CSS widths 320, 390, 768 and desktop 1440/1600, Home's current-page indication, mobile cart opening/closing, and Enter search navigation to `/shop?search=tea`. Desktop/mobile previews are private under `tests/artifacts/landing/`. Full web TypeScript remains failing in server alias resolution and other existing files; no diagnostics reference the changed landing/navigation/header/footer/shell files. This is not a clean whole-project typecheck or a rerun of payment/courier persistence acceptance. Existing isolated catalog rows mostly have test names and no images; no fictional marketing catalog was written for screenshots. Generic brand/contact configuration still needs merchant-provided production facts.

How to review after startup: use the already reviewed `tests/artifacts/step14/runtime.env` guards/targets, retained test PostgreSQL/Redis, API and an explicitly inherited web build/preview. No migrations/seeds/resets. The courier simulator and workers are unnecessary for this page review. Open `/`, check both themes at phone/tablet/desktop sizes, enter a search with Enter, open the bottom cart and follow category/product links. Rebuild and restart preview after changes; preview caches its server modules. Do not use root start/build wrappers that can perform data setup.

Next: user visual review/refinement, then select the customer dashboard/orders/profile/settings phase or the content/persistence/SEO prerequisite work. Remaining page scope: broader shop/product/cart/checkout styling, dashboard/orders, profile/settings/auth consistency, about/contact/policies and admin content/SEO. Existing failed peak/security/staging/backup-restore/real merchant gates remain open. No tutorials.

Runtime at handoff: isolated API `localhost:3000`, web preview `localhost:3001` and the existing test PostgreSQL/Redis remain running for visual review. Courier simulator remains stopped; automatic workers disabled. Test data volumes retained. No production/staging service was started.

Runtime correction — 2026-10-04: user reported `EADDRINUSE` on port 3001 when starting their own build. Stopped the task-owned preview/API and test PostgreSQL/Redis containers; verified ports 3000/3001/9099/5433/6380 are free. Data volumes retained. Standing user instruction: never leave task-owned servers running after work finishes. Earlier running-preview handoff is superseded.


## 12. Shop and product presentation — 2026-10-04

The user paused the additional 21 image/product request and authorized proceeding with product and other pages. No additional images were generated, and no brand products were seeded. Existing branding changes are preserved and remain uncommitted.

Completed this bounded step: niche-aware catalog heading; responsive square-image cards, refined spacing and touch controls; clearer search/sort/results and retry states; product gallery with contained images, named thumbnail controls and selected-state accessibility; active default variant selection, refined purchase panel, genuine gadget/fresh-food guidance and structured product specifications. Crossed-out prices show only when higher than the selling price. Filtered URLs no longer receive unfiltered initial rows. Existing cart and server-authoritative checkout/payment/inventory contracts remain in place. No new content claims, schema or API changes.

Validation: production web build and client boundary check passed; git diff whitespace check passed. Full web TypeScript still reports existing errors outside these three changed shop files; no diagnostics name product-page.tsx, shop-page.tsx or catalog/product-card.tsx. This step has no actual browser/mobile screenshot or persisted purchase evidence, so visual and interaction acceptance remains unfinished. No server/container was started; no DB writes, migrations, seeds or resets.

How to review after the user's app startup: build with the same BRAND as the API; open /shop and a real product; check widths 320/390/768/1440, long names, absent images, unavailable variants, search/filter URLs, gallery controls, save state and existing cart opening. Inspect fresh-food delivery guidance and eligible gadget warranty text; food/clothing must have no gadget warranty text. Failed requests must offer retry rather than masquerading as an empty catalog. Existing pagination is still limited to the current first 100 results and needs a separate follow-up.

Next bounded step: cart/checkout/confirmation/tracking visual polish, followed by customer dashboard/orders/profile/settings. About/contact/approved policies and admin-managed content/SEO remain unfinished. Brand seed datasets and the paused seven additional product images per brand remain pending. Retain failed peak, security, staging, recovery and real merchant acceptance gates. No tutorials; no new commit or push.


## 13. Admin SEO implementation — 2026-10-04

The user authorized committing completed work first, then SEO from admin. Committed branding/assets as `a5e58ec` and shop/product presentation as `c37fed1`, without pushing. New SEO changes remain uncommitted.

Implemented:
- Admin → Store settings has independent home/about SEO editors with title, description and share-image URL, brand-default placeholders, draft search preview, Save draft and Publish SEO. Empty published values restore brand defaults. Publishing requires saved edits. Read/manage use the existing `AdminAccess` plus `AdminStoreSettingsRead`/`AdminStoreSettingsManage` permissions on the server; banned/archived accounts are rejected. Published actions use the existing best-effort activity log with actor/page/source revision.
- Added deployment-local `StoreSeoPage` enum (`home`, `about`) and `StorePageSeo` model mapped to `store_page_seo`. Separate draft and published fields prevent draft leakage. Compare-and-update revisions reject stale saves/publication races. Public queries explicitly select only published fields. An absent optional table yields public brand defaults; admin editing returns an actionable 503. Other database errors are not disguised as unpublished content.
- Home and new `/about` route load published metadata on the server. About renders existing brand copy/imagery without inventing a merchant story. Footer links About. Product pages load the same eligible public product for SSR content and SEO, honor existing admin SEO overrides, and derive missing values from product information. Missing/inactive products use a real 404 with noindex. Products expose safe Product/Breadcrumb JSON-LD with active valid offers, current prices/currencies/availability and no invented reviews.
- Title/description, canonical, Open Graph and Twitter tags use the configured brand origin. FoodShop’s unknown origin remains unset, so no guessed canonical or relative social-image URL is emitted. `/shop` has a canonical; filter/search URLs are noindex. Account/auth/admin/cart/checkout/tracking/saved/setup/payment flows have noindex metadata. `robots.txt` blocks non-production/E2E runtimes and excludes private/purchase paths in production. Replaced the starter static robots file after actual serving exposed its precedence over the dynamic route.
- `/sitemap.xml` includes existing home/about/shop and eligible active product routes through cursor batches; no filtered/private URLs. XML/JSON-LD escaping tested. Sitemap responses are not cached; the single-file protocol limit is 50,000 URLs, above which a sharded sitemap is explicitly required rather than silently truncating. Page/product loaders use zero staleTime and no new shared page cache.

Schema prerequisite (not executed): provision PostgreSQL enum `StoreSeoPage` and table `store_page_seo` from the reviewed Prisma model in the intended deployment database. The table needs enum primary key `page`, integer `revision` default 1, nullable draft/published title (120), description (320), image URL (2048), nullable `publishedAt` and created/updated timestamps. No schema migration was generated/applied, seed/reset/new database or fixture write occurred. Only `prisma generate` ran to update the ignored local client; it does not provision this table. Home/about saving/publication and real persisted draft isolation remain unverified until provisioning is separately authorized/performed. Product SEO reuses already existing columns.

Verification: 24 focused tests / 83 assertions passed (8 draft/publication service tests, 7 HTTP permission/audit tests and 9 metadata/crawler tests), using the existing Bun test setup with mocked storage, not database persistence. Server TypeScript and server/web production builds passed; web client boundary and whitespace checks passed. Full web TypeScript still fails in existing cross-app aliases/other pages; newly added server modules consequently also appear under those unresolved aliases, but no final errors name the SEO editor/helpers/routes in web code.

Read-only runtime verification uses the retained exact guard: NODE_ENV=test, E2E_MODE=true, BRAND=airshop, PostgreSQL 127.0.0.1:5433/e2e_v3_step10_20261003_03043274 and Redis 127.0.0.1:6380 with the matching isolated prefix. Courier workers disabled by E2E guards; no simulator/provider/payment/mail call. Verified actual raw HTML metadata/canonicals for home/about, actual product Product/Breadcrumb JSON-LD and missing-product 404; robots and sitemap HTTP output, cart/login/filter noindex, anonymous draft denial and unknown-page rejection: all 12 read-only HTTP checks passed. Private evidence: tests/artifacts/admin-seo/. This is not persisted publication or browser acceptance.

How to test after startup/provisioning: build/start API and web with matching BRAND using direct package commands and reviewed env; no root data-setup wrappers. At /admin/store-settings, compare an anonymous user, read-only admin and manager. Save a distinctive home/about draft, reload admin and confirm it persists while public raw HTML retains the previous published/default values; publish, reload public HTML and confirm tags change. Edit another draft without publishing and confirm public tags stay unchanged. Two editors with the same revision must receive conflict rather than overwrite. Blank published fields should restore brand defaults. Change existing product SEO overrides and inspect raw product tags/JSON-LD; inactive/missing products must return 404. Check /robots.txt, /sitemap.xml, /shop?search=... and cart/auth noindex. Stop all task-owned services at completion.

Next: review/provision the precise schema prerequisite before database-backed SEO save/publish/browser acceptance. Then continue cart/checkout/confirmation/tracking and customer dashboard/orders/profile/settings. Structured editable home/about body content, approved contact/policies, brand seed datasets/additional images, FoodShop’s exact domain and large-catalog sitemap sharding remain unfinished. Failed peak capacity, security, staging, recovery and real merchant acceptance remain open. No tutorial, push or additional commit.

SEO handoff runtime: task-owned API/web processes and retained test PostgreSQL/Redis containers stopped; verified ports 3000/3001/9099/5433/6380 free. Data volumes retained. No service left running.

## 14. FoodShop catalog/inventory seed — 2026-10-04

User authorized committing existing work, FoodShop product/inventory seeding and continuing public/customer pages in sequence. Existing admin SEO and the user-supplied migration are committed as `91f1c9c`; no push. Read-only inspection confirmed the local merchant development target `localhost:5432/ecommerce`, matching BRAND=foodshop, and the already present `store_page_seo` table. No migration, reset or new database was executed.

Completed: an explicit local database guard and brand-specific create-only seed add ten fictional FoodShop products/variants (four mango, three honey, three dates), three food categories, one owned brand/location, ten batches and 300 units. Reuses the three existing product images; no image generation. Re-running preserves merchant edits, expiry dates, stock balances and receipts. Two runs and read-only verification confirmed ten receipt movements and eight existing orders unchanged; older mixed catalog remains intact. Seed safeguard/data tests: two passed, 40 assertions.

How to repeat on the reviewed local development target: `bun --env-file=apps/server/.env packages/db/prisma/seed/ecommerce.ts`. The command requires BRAND=foodshop and DATABASE_URL identifying a local non-production/non-E2E database; no additional database selector is required. Other brand datasets are not prepared. Do not use the legacy `--catalog` seed for this task. Fresh mango ordering still requires real merchant-configured delivery slots; none were seeded under product/inventory authorization.

Next: verify cart/checkout/confirmation, customer orders/profile/settings and contact/shipping in the established isolated harness. Approved legal policies, FoodShop public domain/contact facts, editable home/about body content and persisted SEO publication acceptance remain open. Peak capacity/security/staging/recovery/real merchant acceptance remain unresolved. No tutorial.

## 15. Cart, checkout, confirmation and tracking — 2026-10-04

Completed: consistent cart/sheet/saved cards and contained images; named quantity and shipping-radio controls; item-subtotal labels without misleading zero delivery/tax promises. Checkout shows actual available delivery choices, required contact/address fields, retryable settings/rate errors and accurate COD copy. Fresh-food windows are required for fresh items, with postal-code changes clearing selection. Cart snapshots preserve fulfillment type; older saved carts resolve missing policies through existing product reads and block ordering until checked. Server checkout remains authoritative for availability, slots, fee and idempotency. Confirmation displays the accepted response's order number/total from browser-session receipt; a missing receipt does not claim an accepted order. Tracking adds address, minimal food window, public history and evidence-backed received/refunded/outstanding values. No gateway/provider call or worker-trigger endpoint.

Verification: final established Playwright journey passed. It created an owned fictional packaged-food product/stock via the existing isolated harness, purchased through the browser and asserted persisted order total 1050 BDT, history, on-hand 10/reserved 1 and an active reservation. A fictional 300 BDT admin receipt persisted and customer API/UI showed 750 BDT outstanding. Fresh-food checkout remained disabled without a selected window, including a legacy cart missing fulfillment type. Fixture payments/orders/stock/catalog/location/rate were cleaned in finally; unrelated order count was preserved. Earlier failures uncovered an unnamed radio and dropped cart fulfillment field, both corrected and rerun. Screenshot assets are private under tests/artifacts/customer.

How to test after startup: use matching FoodShop builds and the reviewed isolated runtime.env, then run `bun --env-file=tests/artifacts/step14/runtime.env run node node_modules/@playwright/test/cli.js test tests/e2e/__step_8_3__/customer-journey.spec.ts --project=chromium --no-deps --workers=1`. Retained persona sessions must be valid; this command skips broad user provisioning/seeding. Do not run root data-setup wrappers or migrations. For merchant development, fresh mango checkout requires real configured slots; the seed does not invent them.

Next: customer account verification below. Remaining: visual merchant review, real policy/delivery content and broader acceptance gates; no new payment gateway or customer returns portal under this phase.

## 16. Customer dashboard, orders, profile, settings and auth — 2026-10-04

Completed: storefront account shell with Overview/Orders/Profile/Settings and mobile account navigation; recent orders instead of SaaS billing/upgrade content; owned paginated order list/detail with loading/error/retry/empty states. API pagination applies the identical user ownership condition to both rows and count, with deterministic ordering and limit validation. Customer output strips staff history notes/actors/provider metadata and internal food-booking capacity. Balance computation reuses receipt/refund accounting and reports ambiguous legacy money rather than fabricating amounts. Profile retains existing name/avatar/security operations in a clearer layout; device/settings error states and actual light/dark/system controls. Auth pages share storefront branding; password/magic-link return destinations are restricted to local paths. Existing social/2FA default-dashboard flows are retained; no live mail/OAuth test was run.

Verification: 19 server tests/51 assertions passed, including owner-scoped pagination, denied other-user lookup and ledger/privacy mapping. Safe-return/seed/SEO pure tests: 12 passed/82 assertions; existing SEO service/controller tests: 15 passed/48 assertions. Server TypeScript and server/web builds passed; client boundary and whitespace checks passed. Full web TypeScript still fails in existing cross-app aliases/admin/payment files; no diagnostics reference the changed customer/auth/shop/information routes/features. The browser journey verified profile writes through the real UI and persistence/reload, restoring the original fictional user's name; dark preference survived reload. Eleven routes (home/about/dashboard/orders/owned detail/profile/settings/contact/shipping/saved/cart) had no horizontal overflow at 320/390/768/1440px. Anonymous and another authenticated customer received 404 for the owned order; purchaser email in the URL did not bypass ownership. Out-of-range limit was rejected.

How to test after startup: run the same customer-journey spec after starting the retained isolated services with matching BRAND and valid persona states; inspect dashboard/order screenshots and manually review account/security dialogs without deleting shared accounts. Existing security operations were retained but password changes, 2FA, device revocation, account deletion, real OAuth/mail and gadget warranty claim flows were not rerun in this page checkpoint.

Next: publication facts/content prerequisites below. Remaining: human visual review, deeper security-operation acceptance and the existing release gates. No tutorial.

## 17. Contact, shipping and policy page publication — 2026-10-04

Completed: responsive contact page reads current public store support settings with brand fallback, uses only configured email/phone/address and provides owned-orders navigation. Shipping page shows actual active rate values/free thresholds without invented delivery guarantees. Structured policy renderer supports separately approved terms/privacy/returns content, with effective dates and plain paragraphs rather than injected HTML. Policy routes stay 404/noindex and absent from footer/sitemap until approved sections are configured. Contact/shipping have SSR metadata and sitemap entries; product metadata remains derived from product information. No fake contact submission form, certifications or legal policies.

Verification: contact/shipping and unavailable policy routes covered by the final browser pass; home/about raw HTTP remained 200 under FoodShop. Read-only isolated target inspection confirmed `public.store_page_seo` is absent, although the merchant local development database has the user-provisioned table. Therefore persisted admin SEO save/publish/conflict/browser acceptance remains blocked on applying the already committed `20261004144706_store_seo` migration to the separately reviewed isolated target under explicit migration authorization. No migration was run by this work.

How to test after startup: open /contact and /shipping; compare contact facts with admin settings and rates with checkout. /terms, /privacy and /returns currently return 404. Once merchant-approved sections/effective dates are supplied, configure brand policies and rebuild; then verify published routes/footer/sitemap. FoodShop requires its exact HTTPS public origin before canonical URLs and sitemap publication can be accepted; sitemap intentionally returns 503 while unset.

Next: supply FoodShop's exact domain/contact facts and approved policies, and separately authorize/provision the isolated SEO table for persistence acceptance. Editable home/about body content still needs a reviewed draft/published content model (validated section data, revision/conflict control and permission/audit boundaries); existing StoreSettings/StorePageSeo have no body-content storage. Implementing/provisioning that CMS prerequisite is unfinished under the no-migration boundary. BestSky/AirShop seed datasets and extra images remain deferred. Failed peak capacity, security, staging, recovery and real merchant/courier acceptance remain open; no tutorials.

Runtime handoff: task-owned API/web and retained isolated PostgreSQL/Redis are stopped. Ports 3000/3001/9099/5433/6380 verified free; test volumes and preexisting merchant development services retained. Seed work is committed as `3fa1bde`; public/customer pages and tests are committed with this checkpoint under the user’s explicit commit request. No push.

Seed configuration correction — 2026-10-04: removed the redundant database acknowledgement variable at the user’s request. DATABASE_URL determines the seed target; existing local/non-production/non-E2E guards and create-only behavior remain. Focused safeguard/data tests passed (2 tests, 43 assertions); no database seed, migration or service startup was run for this correction. Next and unfinished publication/release gates remain as recorded above.

Image spacing refinement — 2026-10-04: landing product tiles now use square, edge-filling cover images, matching catalog cards and removing the portrait container’s top/bottom letterboxing. Category tiles use compact centered 80/96px square image icons with reduced card padding and no inner image padding. Product source assets and data remain unchanged. Web build and client boundary checks passed; responsive browser visual acceptance was not rerun in this correction. After rebuilding/restarting web, inspect home category/product rows and /shop at phone/desktop widths. No database operation, service startup, commit or push; existing publication/release gates remain open.

Category action correction — 2026-10-04: category menus now show Disable for active rows and Enable for inactive rows. Disabling retains the existing disable endpoint; enabling uses the existing catalog update endpoint with isActive=true, followed by catalog invalidation and the correct success message. Existing manager permission boundaries remain. Web build/boundary and whitespace checks passed; browser persistence was not rerun and no database writes/services were executed. After app startup, disable a category, reopen its menu, enable it and confirm active status after reload. Historical category UI also only offered Disable; current categories/brands remain retained on disable and products on archive. A complete catalog trash/delete/restore workflow is absent and was not added under this correction. Existing publication/release gates remain open; no commit/push.

## Catalog Current/Archived workflow — 2026-10-04

User authorized categories, brands, attributes and products moving Current ↔ Archived, followed by safe restore/permanent delete. Implemented nullable indexed archivedAt on the four catalog models, independent of enabled/disabled and product publication status. Existing disabled categories/brands stay Current; legacy status=archived products appear in Archived and restore to draft without silently republishing. Current admin lists exclude archive markers; public category/product discovery, product details, sitemap and checkout eligibility also exclude archives. Archived lists are paginated with loading/error/retry/empty states. Manager-only actions use confirmations, retain dependency failure reasons in the dialog and invalidate catalog/product lists. Product Archive is alongside the existing actions to keep confirmation mounted; categories/brands retain existing enable/disable behavior.

Server lifecycle actions use serializable transactions and row locks; attribute values/product variants are also locked for deletion checks. Archive/restore changes only archivedAt, preserving previous settings; delete requires an archived item. Category/brand archive blocks current dependent categories/products; deletion blocks every child/product reference. Attribute archive/delete blocks category templates, product/variant/batch assignments including multiselect values. Product archive blocks open orders, active courier work and active reservations. Product delete blocks order history and every stock/reservation/batch/movement/serial reference, even zero stock. Owned descriptive product records/unused attribute values may cascade only once these checks pass. Restore requires current parent/category/brand dependencies. Existing attribute DELETE now uses the archive-required guard; existing product archive endpoint uses the safe lifecycle service; direct PATCH status=archived is rejected. Archived records cannot be edited/reactivated through ordinary update methods. Product reference selectors exclude archived categories/brands/attributes.

Exact schema prerequisite BEFORE restarting the updated app: provision nullable TIMESTAMP(3) archivedAt on category, product_brand, product_attribute and product, plus their Prisma archive indexes. Existing rows default NULL, so no destructive reset/backfill is required; legacy product status remains readable by Archived. The reviewed source is packages/db/prisma/schema/ecommerce-catalog.prisma. Prisma client generation ran, which does NOT apply these columns. No migration was generated/applied, no DB seed/reset/new database/fixture write and no service startup occurred. Under the standing no-migration instruction, schema provisioning and real database/browser acceptance remain UNFINISHED. Until provisioned, updated Prisma reads against the old schema will fail; do not treat a successful build as database acceptance.

Verification: 34 lifecycle safety/preservation/checkout/list tests (66 assertions), 11 HTTP RBAC tests (29 assertions), 16 catalog/product service regression tests (30 assertions), and 19 shop/customer regression tests (51 assertions) passed separately in the existing Bun harness. Permission checks deny read-only/anonymous mutations and prevent catalog permission from granting product management. Server TypeScript and server/web builds passed; client boundary/whitespace checks passed. Full web TypeScript retains existing cross-app alias/admin/payment diagnostics; no diagnostics reference the changed catalog/product features. These mocked checks do not establish real FK/serialization behavior, concurrent dependent-record creation, or browser persistence.

How to test after schema provisioning and app startup: /admin/catalog → each Categories/Brands/Attributes pane → Current/Archived; /admin/products → Current/Archived. Create narrowly owned fictional unused records, archive and confirm disappearance from Current/public reads and persistence after reload; restore and compare previous enabled/publication settings; archive again and permanently delete only unused fixtures. Verify dependency blockers using parent/child/product/brand assignments, category templates/variant values, open orders/reservations and historical stock/orders. Compare anonymous, catalog-read/product-read and the respective managers through direct API requests. Two simultaneous archive/restore/delete requests and simultaneous checkout/reference creation still require isolated database concurrency acceptance. Reuse the existing isolated harness after exact-target verification, never merchant production data. Stop task-owned services at completion.

Next: separately authorize/provision this exact schema prerequisite, then perform isolated persistence/browser/concurrency checks. Changes remain uncommitted; no push. FoodShop domain/contact/legal facts, body-content CMS and persisted SEO publication remain unfinished, as do peak capacity/security/staging/recovery/real merchant acceptance. Extra images and tutorials remain deferred.

### Archive menu placement — 2026-10-05

Archive now appears inside the three-dot action menus for categories, brands, attributes and products. The shared confirmation dialog stays mounted outside the dropdown portal; manager permissions and lifecycle safety checks are preserved. Category Template continues to configure category product fields, including product/variant/batch scope, required fields and filtering.

Verification: web production build, client boundary check and git diff --check passed. Full web TypeScript still reports existing cross-app alias/admin/payment errors; no diagnostics reference these changed catalog/product features. Browser persistence and isolated database concurrency were not rerun. No database commands or service startup/shutdown occurred; existing user-owned dev servers were left running. The user-created archive migration is preserved and was not applied by this task. Changes remain uncommitted.

How to test after app startup: open each Current list, select the row three-dot menu, then Archive; cancel to check the dialog without changing data. Next remains isolated persisted archive/restore/delete, dependency, permission and concurrency acceptance after exact schema/target verification. Public content/SEO publication and peak/security/staging/recovery/merchant acceptance gates remain unfinished; images and tutorials remain deferred.

Commit checkpoint — 2026-10-05: user authorized committing the archive feature. Focused lifecycle, HTTP permission, catalog/product and shop regression checks rerun: 76 tests, 171 assertions passed. The existing archive migration file was reviewed and included with its schema change; it was not applied by this task. Backend/schema and admin UI/docs are committed separately. No push, database operation or service startup occurred. Remaining persisted browser/concurrency and release gates above are unchanged.
