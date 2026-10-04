# Ecommerce public pages, customer area and content plan

Date: 2026-10-04
Status: planning only; implementation has not been authorized.
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

## 10. Current next action and progress

Completed: read-only source assessment and this planning document. No product/code/schema change, runtime test, database operation, commit, push or tutorial in this planning turn.

Next: settle section 9 and refine the visual/page/content proposal with the user. Implementation remains blocked by the user's explicit “do not start” instruction until they say to begin. After that authorization, start with the approved design contract and prerequisite assessment, retaining all existing data-operation boundaries.
