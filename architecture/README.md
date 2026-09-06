# Ecommerce and RBAC Architecture

Open the diagrams with `bun view-archi`, or one of the focused commands listed in the project `package.json`.

## Product and inventory model

The admin catalog is not a separate data model. It manages the same ecommerce records used by the public shop:

- A `Category` defines hierarchy, brand policy, and attribute templates.
- A `Product` belongs to a category and may belong to a `ProductBrand`.
- A `ProductVariant` holds a sellable SKU, price, option values, and images.
- `InventoryStock` stores per-location on-hand and reserved quantities; `InventoryMovement` records changes.
- Checkout creates an `Order` and `StockReservation` transactionally.

A public product must be active, in an active category, have an active variant, and respect brand availability. Available quantity is on-hand minus reserved stock.

## RBAC

Admin catalog, product, inventory, order, and image routes run through authentication and permission guards. RBAC roles and permissions are stored in PostgreSQL; Redis only caches computed effective permissions. The RBAC seed provisions the ecommerce permission families for protected owner/admin roles.

## Diagram index

- `component/ecommerce-system.html` — component map
- `security/rbac-authorization.html` — authorization path
- `workflow/product-management.html` — admin product workflow
- `sequence/storefront-checkout.html` — browse and checkout calls
- `dataflow/product-inventory.html` — product-to-order lineage
- `lifecycle/product-stock-order.html` — stock and order state changes
