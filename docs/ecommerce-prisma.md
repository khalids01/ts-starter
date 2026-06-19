# Ecommerce Prisma Reference

This is the compact reference for `packages/db/prisma/schema/ecommerce.prisma`.

## Catalog

- `Category` is both navigation and template configuration. It controls brand policy, featured display, and which attributes apply to products, variants, and batches.
- `ProductBrand` is a manufacturer or product brand. It is optional because some niches use the store brand from `brandConfig` instead.
- `Product` is the browseable catalog parent. It has no stock fields. Publish lifecycle is `status = draft | active | archived`. It has one optional `coverImageUrl`, search keywords, and merchandising fields such as featured/trending/badge.
- `ProductVariant` is the sellable SKU. Price, barcode, optional `imageUrls`, physical weight, and variant choice snapshots live here.
- `ProductHighlight` stores storefront marketing bullets for a product. Highlights are not technical specs; category template attributes remain the structured specs source.

## Category Templates

- `ProductAttribute` defines reusable fields such as color, storage, RAM, origin, grade, or expiry date.
- `ProductAttributeValue` stores reusable selectable values for attributes.
- `CategoryAttribute` connects a category to an attribute and decides how the admin UI should render it.
- Attribute scopes:
  - `product`: shared specs stored in `ProductAttributeAssignment`
  - `variant`: SKU choices stored in `ProductVariantAttributeValue`
  - `batch`: inventory facts stored in `InventoryBatchAttributeAssignment`

Category template product fields are the source of truth for structured specifications and filters. Do not duplicate those specs into free-form product HTML.

## Brand Policy

`Category.brandPolicy` controls the brand field:

- `hidden`: no brand input and no public brand display
- `optional`: admin may select a `ProductBrand`
- `required`: admin must select a `ProductBrand`
- `default_store`: use the deployment brand from `brandConfig`; public display depends on `Category.showStoreBrand`

## Inventory

- `Supplier` stores supplier contact information.
- `InventoryLocation` stores stock locations such as warehouse, shop, or kitchen.
- `InventoryBatch` stores received lots of stock. This helps with food expiry, harvest data, supplier tracing, purchase cost, and future FIFO behavior.
- `InventoryStock` stores current stock per variant, location, and optional batch.
- `InventoryMovement` is the audit log for every stock change.
- `StockReservation` temporarily holds stock during checkout so two customers cannot buy the same last item.

Available stock is calculated as:

```txt
InventoryStock.quantityOnHand - InventoryStock.quantityReserved
```

## Orders And Checkout

- `Cart` and `CartItem` hold guest or signed-in customer cart state. Guest carts use a cart token; signed-in carts attach to `User`.
- `ShippingRate` stores editable V1 shipping methods such as inside-city and outside-city rates. Checkout snapshots the selected method on `Order`.
- `Order` stores customer contact, totals, `paymentMethod`, order/payment/delivery statuses, and `inventoryStatus`.
- `Order.checkoutKey` makes checkout idempotent so a double submit can return the same order instead of creating duplicates.
- `OrderAddress` stores structured shipping and billing snapshots. It replaces loose address JSON.
- `OrderLineItem` stores product/variant/price/image/attribute snapshots so historical orders stay readable after catalog edits.
- `OrderStatusEvent` records admin/customer-visible timeline changes.

Order inventory lifecycle:

```txt
reserved -> committed -> restocked
reserved -> released
```

- Checkout creates active `StockReservation` rows, increments `quantityReserved`, and writes `sale_reserve`.
- Admin confirmation commits reservations, decrements `quantityOnHand` and `quantityReserved`, and writes `sale_commit`.
- Admin cancellation or expiry releases active reservations, decrements `quantityReserved`, and writes `reservation_release`.
- Returning/cancelling an already committed order restocks once and writes `return`.

## Starter Templates

The ecommerce seed creates editable starter categories and fields:

- phones, laptops, generic gadget
- fresh fruit, mango, honey, packaged food, generic product
- shipping rates: inside city, outside city

These templates are starter data, not hardcoded product behavior. Later admin CRUD should allow editing categories, attributes, and category attribute rules.
