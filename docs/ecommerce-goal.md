# Ecommerce branch goal

Last reviewed: 2026-07-02

This branch exists to turn the original TypeScript starter template into a reusable ecommerce starter branch. The goal is that when a new food, gadget, or mixed-product ecommerce project starts, this branch can be cloned and already has roughly 90% of the boring but important ecommerce foundation ready: schema, admin workflows, storefront basics, checkout, stock safety, order operations, media, RBAC, and tests.

## Target use cases

Primary shops:

- Food: mango, fruit, honey, packaged food, store/private-label products, expiry-aware batches.
- Gadgets: phones, laptops, PC parts, accessories, manufacturer-branded products with specs and variants.

Secondary shops:

- Generic physical products that still need product variants, inventory, orders, and media.

The design should stay template-driven instead of hardcoding "mango" or "phone" logic. Category templates decide the fields, brand behavior, variant choices, and batch metadata.

## What "90% ready" means

A new ecommerce project cloned from this branch should already have:

- Admin catalog setup: categories, brands, attributes, category templates.
- Admin product builder: draft products, specs, highlights, variants, media, validation, activation.
- Inventory: suppliers, locations, batch receiving, expiry/batch fields, stock adjustment, movement audit.
- Storefront: product listing, product detail, variant selection, cart, checkout, order success.
- Checkout safety: stock reservation at checkout and inventory side effects when admins confirm, cancel, or return orders.
- Orders: order list, detail, status timeline, customer/contact/address edits, payment/delivery/inventory state.
- Media: ecommerce image upload, browsing, picking, and public URLs through the file server.
- Auth/RBAC: ecommerce admin permissions wired into owner/admin roles and frontend nav visibility.
- Seed data: reusable food/gadget category templates, attribute values, brands, main location, shipping rates.
- Tests: focused backend tests for ecommerce service and controller behavior.

It does not mean every production store feature is finished. Payments, advanced shipping, promotions, analytics, UI polish, and store-specific copy/images can still be project work.

## Core data flow

The ecommerce system is split into three layers:

- Catalog: `Category`, `ProductBrand`, `Product`, `ProductVariant`, product specs, variant attributes, highlights.
- Inventory: `Supplier`, `InventoryLocation`, `InventoryBatch`, `InventoryStock`, `InventoryMovement`, `StockReservation`.
- Orders: `Cart`, `CartItem`, `ShippingRate`, `Order`, `OrderAddress`, `OrderLineItem`, `OrderStatusEvent`.

The important flow is:

1. Admin creates category templates.
2. Admin creates a product draft in a category.
3. Category template controls brand field, product specs, variant choices, and batch fields.
4. Admin creates variants/SKUs.
5. Admin receives stock for variants into locations and optional batches.
6. Storefront only sells active products with active variants and available stock.
7. Checkout creates an order, snapshots line items/addresses/shipping, reserves stock, and clears the cart.
8. Admin status changes commit, release, or restock inventory.

## Food and gadget rules

Food products need:

- Store-brand/default-brand behavior for fresh/local goods.
- Weight-pack variants such as 250 g, 500 g, 1 kg, 5 kg.
- Batch fields like expiry date, harvest season, and storage temperature.
- Supplier and purchase-cost tracking.
- Future expiry/low-stock alerts.

Gadget products need:

- Required manufacturer brand for phones/laptops.
- Product specs such as processor, camera, display size, warranty.
- Variant-defining options such as color, RAM, storage.
- SKU/barcode, compare-at price, cost price, images, and weight.
- Future comparison/filter UI based on category attributes.

## Non-goals for this branch

These can be added per project or later:

- Marketplace/multi-vendor flows.
- Digital products, licenses, subscriptions as ecommerce products.
- POS/cashier mode.
- Warehouse picking/packing/scanning.
- Full accounting/invoicing.
- Country-specific tax compliance.

## Reference files

- Existing schema docs: `docs/ecommerce-prisma.md`
- Existing flow diagrams: `docs/ecommerce-flows.md`
- Progress tracker: `docs/ecommerce-todo-progress.md`
- Prisma schema: `packages/db/prisma/schema/ecommerce.prisma`
- Seed templates: `packages/db/prisma/seed/ecommerce.ts`
- Admin backend: `apps/server/src/modules/admin`
- Storefront backend: `apps/server/src/modules/shop`
- Admin UI: `apps/web/src/features/admin/ecommerce`
- Storefront UI: `apps/web/src/features/shop`
