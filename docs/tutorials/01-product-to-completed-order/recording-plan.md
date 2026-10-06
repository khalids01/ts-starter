# Recording plan

Status: recorded and rendered for first review on 2026-10-05. The storyboard below remains the reproducible source for future revisions.

Record at 1440 × 900 in the light theme with reduced motion and a clean notification state. Use only the isolated tutorial environment and fictional data. Hide browser chrome where practical. Do not show login credentials, developer tools, setup commands, tokens or email verification links.

## Storyboard

| Segment | Screen and action | Result to show |
| --- | --- | --- |
| 1. Goal | Admin overview, then Products | Brief title card: “From product setup to a completed order” |
| 2. Prerequisites | Catalog category and Inventory locations, read-only views | One active category and one location exist |
| 3. Start product | Products → Product | New product builder with six steps |
| 4. Category | Select the prepared category | Brand policy and field counts appear |
| 5. Basics | Enter fictional name, description, optional brand, cover image and search information; Save basics | Success message and draft product URL |
| 6. Specs | Fill the prepared category fields; Save specs | Required values saved |
| 7. Highlights | Add two concise factual highlights; Save highlights | Highlights retained after save |
| 8. Variants | Create one active default SKU with price, currency and image; Save variants | Variant appears with valid SKU and price |
| 9. Receive inventory | Inventory → Receive; select product, SKU and location; enter quantity; Receive stock | Stock row and available quantity update |
| 10. Validate and activate | Return to product → Validate; Validate; Activate product | Readiness succeeds and product becomes Active |
| 11. Storefront order | Open product, add to cart and complete fictional checkout | Confirmation page shows order number |
| 12. Review order | Admin → Orders → order detail | Customer, address, line item, totals and timeline are visible |
| 13. Confirm | Change Order status to Confirmed; review bar → Update order | Order becomes Confirmed and inventory becomes Committed |
| 14. Payment | Record confirmed payment with fictional reference and evidence note | Outstanding balance reaches zero and payment history updates |
| 15. Ship | Mark shipped; enter fictional carrier and tracking number | Delivery becomes Shipped and timeline updates |
| 16. Deliver | Mark delivered with a brief note | Delivery becomes Delivered |
| 17. Complete | Change Order status to Completed; Update order | Completion succeeds |
| 18. Verify | Scroll timeline and totals; open Inventory stock row | Full event chain and reduced available stock are visible |

## Recording rules

- Use a fictional, ordinary product with one SKU. Do not use a serial-tracked gadget or expiring batch in the main demonstration; mention those paths in narration only.
- Pause after each save until the visible success state appears, then remove unnecessary waiting during editing.
- Keep the pointer still while narration explains a screen.
- Zoom or crop only when it improves readability; keep navigation context visible.
- Do not show cancellation, refund or destructive controls beyond the closing explanation.
- Record the successful workflow in sections so individual parts can be replaced after UI changes.
- Final captions must be retimed from the supplied audio rather than relying on the draft timings.

## Completion checks

- Product is Active and publicly visible.
- Checkout created one order and reserved the expected quantity.
- Confirmation changed inventory from Reserved to Committed.
- Confirmed payment evidence makes outstanding amount zero.
- Shipment and delivery timestamps plus tracking appear on the timeline.
- Order can move to Completed only after all completion guards pass.
- Available stock decreased by exactly the purchased quantity.
