# Ecommerce todo and progress

Last reviewed: 2026-07-02

Current rough state: the core ecommerce backend and admin workflows are mostly in place. The branch feels about 70-75% complete toward the "clone this branch and start a real food/gadget ecommerce project" goal. Backend core is further along than storefront/product polish.

## Already done

### Documentation and schema

- `docs/ecommerce-prisma.md` explains the ecommerce Prisma model groups and lifecycle.
- `docs/ecommerce-flows.md` explains category templates, admin product creation, checkout reservation, commit, release, and return flows.
- Prisma ecommerce schema exists for catalog, attributes, product variants, highlights, inventory, batches, reservations, carts, orders, addresses, line-item snapshots, shipping rates, and order timeline events.
- Migrations exist for ecommerce catalog, product media/highlights/search/merchandising, checkout/cart, admin orders, and order completion behavior.

### Seed data

- Food/gadget starter categories are seeded: generic product, gadgets, phones, laptops, generic gadget, food, fresh fruit, mango, honey, packaged food.
- Starter attributes are seeded: color, storage, RAM, processor, camera, display size, warranty, origin, grade, weight pack, harvest season, expiry date, storage temperature.
- Category templates are seeded for phones, laptops, gadget fallback, fresh fruit, mango, honey, packaged food, and generic products.
- Starter brands are seeded for common gadget examples.
- Main inventory location is seeded.
- Basic shipping rates are seeded for inside-city and outside-city delivery.
- Ecommerce admin permissions are added to RBAC and granted to platform owner/admin roles.

### Backend admin APIs

- Catalog admin API supports categories, attributes, attribute values, category template assignments, and brands.
- Product admin API supports list/detail, draft creation, updates, archive, product specs, variants, highlights, validation, and activation checks.
- Inventory admin API supports suppliers, locations, stock list, movements list, stock receiving, batch attributes, and stock adjustment.
- Orders admin API supports list/detail, order contact/address/notes update, status update, reservation commit/release/restock side effects, timeline events, and manual expired-reservation cleanup.
- Images admin API proxies the file server for ecommerce media upload/list/detail/delete and normalizes public URLs.

### Storefront backend

- Public shop API lists active products and product details.
- Active products require active category, active brand if present, and at least one active variant.
- Product variants expose available quantity from inventory stock.
- Guest cart uses an HTTP-only `cart_token` cookie.
- Signed-in users get user carts, and guest carts merge into user carts after login.
- Cart add/update/remove checks active product/variant and stock availability.
- Checkout uses server-side variant prices and active shipping rates.
- Checkout creates `Order`, `OrderAddress`, `OrderLineItem`, `OrderStatusEvent`, and `StockReservation` records in one transaction.
- Checkout increments reserved stock and writes `sale_reserve` inventory movements.
- Checkout is idempotent when `idempotencyKey` is supplied.
- Customer order lookup exists by signed-in user, email, or phone.

### Frontend admin

- Admin nav includes Catalog, Products, Inventory, Orders, and Images with permission-aware visibility.
- Catalog page has category, attribute, template, and brand management UI.
- Product list has filters, archive action, validation action, and links to builder.
- Product builder has steps for category, basics, specs, highlights, variants, inventory handoff, validation, and activation.
- Product builder follows category brand policy and dynamic template fields.
- Inventory page has tabs for stock, receive, adjustment, suppliers, locations, and movements.
- Receive stock UI loads product variants and batch fields from the category template.
- Orders page has filtering and expired reservation release action.
- Order detail page shows line items, status badges, operational dates, addresses, totals, notes, timeline, edit form, and status controls.
- Image admin page and image picker fields are wired into product/image workflows.

### Storefront UI

- `/shop` product listing exists with search plus basic category/brand filtering.
- `/shop/products/$slug` product detail exists with media, variant selection, stock display, highlights, and add-to-cart.
- `/cart` supports cart review, quantity increment/decrement, remove, and checkout link.
- `/checkout` supports customer details, shipping address, active shipping rates, COD/manual-payment checkout, and order placement.
- `/checkout/success/$orderId` confirms order placement.

### Tests

- Backend ecommerce-focused tests exist for catalog, product service/controller, inventory service/controller, orders service/controller, shop service, images service/controller, and ecommerce RBAC permissions.
- Verification run on 2026-07-02: ecommerce backend subset passed with 48 tests, and `bun run check-types` passed.

## Important gaps left

### Payments

- Ecommerce checkout currently behaves like COD/manual payment.
- `online_gateway` exists in enums, but no ecommerce payment gateway flow is wired.
- No payment authorization/capture/refund webhook flow is connected to orders.
- No customer-facing manual payment instructions or upload/verification workflow.

### Shipping, tax, discounts

- `ShippingRate` exists and checkout snapshots it, but there is no admin CRUD UI/API for shipping rates yet.
- Shipping is flat-rate only; no zones, city/area rules, courier integration, delivery slots, pickup, or COD fee rules.
- Tax and discount fields exist on orders/line items, but checkout always uses `0.00`.
- No coupon/promo-code model or checkout flow yet.

### Storefront experience

- Public category/brand/filter discovery is weak. The `/shop` page derives category/brand filters from currently loaded products instead of dedicated public category/brand endpoints.
- Category pages are not implemented.
- Public dynamic attribute filtering is not implemented yet, even though templates mark fields as filterable.
- Product sorting, pagination controls, price filters, availability filters, and merchandising sections need work.
- Product detail does not yet show full structured specs from product attributes.
- Add-to-cart only adds quantity `1`; no quantity selector on product detail yet.
- Checkout success shows internal `orderId`; customer-friendly order number/tracking should be shown instead.
- There is no customer-facing order history/tracking page, even though backend order lookup exists.

### Admin workflow polish

- Product builder inventory step only links to the inventory page; it does not inline initial stock receive.
- No clone/duplicate product flow.
- No bulk product actions.
- No admin product preview of the storefront product page.
- No admin shipping-rate management.
- No admin dashboard ecommerce KPIs yet: revenue, order count, low stock, expiring stock, top products.
- No import/export tools for products, inventory, or orders.

### Inventory operations

- `transfer_in` and `transfer_out` movement types exist, but transfer workflows are not implemented.
- Checkout reservation chooses active stock by `updatedAt`, not FIFO/FEFO expiry-aware allocation.
- Expired reservations are released by manual admin endpoint; no scheduled job is wired.
- No low-stock or expiry notifications yet.
- No purchase order, receiving document, damage/wastage, or stock count workflow yet.

### Order operations

- Status changes commit/release/restock stock, but there is no strict state-machine enforcement for every invalid transition.
- Returns/restocks are coarse-grained at order level, not per line item.
- Refund fields/statuses exist, but no refund transaction model or gateway behavior exists.
- No invoice, packing slip, shipping label, or courier tracking number.
- No order email/SMS notifications.

### Testing and quality

- Backend unit/controller coverage exists, but browser/e2e tests for admin and storefront flows are not present.
- No Playwright flow that creates product -> receives stock -> buys product -> confirms order.
- No seeded demo products/stock/orders for immediately seeing a working shop after cloning.
- Need a full release verification script that runs server tests, `bun run check-types`, web build, and ideally an e2e smoke before calling the branch close to release-ready.

## Suggested next milestones

### Milestone 1: make the current ecommerce loop demo-ready

- Add demo seed products with variants and stock for mango, honey, phone, and laptop.
- Improve checkout success to show `orderNumber` and link to a public order lookup page.
- Build customer order lookup/history UI using existing `/shop/orders` APIs.
- Add product detail structured specs display.
- Add quantity selector on product detail.
- Add public category/brand endpoints and real category filters.
- Add a simple admin shipping-rate CRUD page/API.

### Milestone 2: make food/gadget selling stronger

- Add attribute-based public filters per category.
- Add category landing pages for food, mango, honey, phones, laptops.
- Add low-stock and expiring-batch views/alerts.
- Add FEFO/FIFO stock allocation option, especially for food expiry.
- Add stock transfer workflow between inventory locations.
- Add product duplicate flow for similar SKUs.

### Milestone 3: make it production ecommerce

- Wire a real payment gateway or a clean adapter interface for gateway-specific projects.
- Add payment webhook handling for ecommerce orders.
- Add coupons/discounts and tax calculation hooks.
- Add order emails/SMS events.
- Add invoice/packing slip output.
- Add e2e tests for the main buyer/admin lifecycle.
- Add deployment/runbook docs for the ecommerce branch.

## Practical next task recommendation

Do Milestone 1 first. The branch already has the hard backend foundation, so the fastest path to feeling like a complete ecommerce starter is to seed demo products/stock, expose customer-friendly order tracking, improve storefront filters/specs, and add shipping-rate admin CRUD.
