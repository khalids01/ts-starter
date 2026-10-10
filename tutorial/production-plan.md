# Tutorial production checklist

43 focused topics plus one retained full workflow. Tutorial 01 is accepted and uploaded. Tutorial 02 has accepted Heart narration and a production UI video uploaded unlisted and published in the Guide catalog. Tutorials 03–20 now have rendered synchronized videos; 03–11 have saved YouTube upload receipts, while 12–20 await upload. Playback acceptance and Guide publication remain pending for 03–20. Tutorial 21 has a rendered synchronized video awaiting playback review and upload. Tutorial 22 has verified marker-owned fixtures prepared; tutorials 22–43 are blocked at audio generation because the Voicebox service at http://127.0.0.1:17493 is unreachable. See [production instructions](./synchronized-production.readme.md).

| Folder | Topic | Capture mode (prepared code) | Audio | Review |
| --- | --- | --- | --- | --- |
| `00-product-to-completed-order` | From product setup to a completed order | Legacy continuous | Existing | Pending |
| `01-admin-overview` | Find your way around the admin panel | Accepted synchronized | Existing | Accepted |
| `02-catalog-categories` | Create categories and configure handling | Accepted synchronized workflow | Generated | Accepted |
| `03-catalog-brands` | Create and manage product brands | workflow (rendered) | Generated | Pending playback |
| `04-catalog-attributes` | Configure product attributes and options | walkthrough (rendered) | Generated | Pending playback |
| `05-catalog-lifecycle` | Archive, restore and safely delete catalog records | walkthrough (rendered) | Generated | Pending playback |
| `06-product-create` | Create a product draft | walkthrough (rendered) | Generated | Pending playback |
| `07-product-content` | Edit specifications, highlights and images | walkthrough (rendered) | Generated | Pending playback |
| `08-product-variants` | Configure SKUs, variants and pricing | walkthrough (rendered) | Generated | Pending playback |
| `09-product-activation` | Validate, activate and manage product visibility | walkthrough (rendered) | Generated | Pending playback |
| `10-inventory-locations-suppliers` | Manage inventory locations and suppliers | walkthrough (rendered) | Generated | Pending playback |
| `11-inventory-receive` | Receive stock into inventory | walkthrough (rendered) | Generated | Pending playback |
| `12-inventory-availability` | Understand on-hand, reserved and available stock | walkthrough (rendered) | Generated | Pending playback |
| `13-inventory-adjustments` | Record an inventory adjustment | walkthrough (rendered) | Generated | Pending playback |
| `14-inventory-serialized-units` | Register gadget serial numbers and IMEIs | walkthrough (rendered) | Generated | Pending playback |
| `15-inventory-movements` | Trace inventory movement history | walkthrough (rendered) | Generated | Pending playback |
| `16-order-review` | Review a new customer order | walkthrough (rendered) | Generated | Pending playback |
| `17-order-confirmation` | Confirm an order and commit its stock | walkthrough (rendered) | Generated | Pending playback |
| `18-order-payment-evidence` | Record and correct payment evidence | walkthrough (rendered) | Generated | Pending playback |
| `19-order-shipping-tracking` | Mark an order shipped and update tracking | walkthrough (rendered) | Generated | Pending playback |
| `20-order-delivery-completion` | Record delivery and complete an order | walkthrough (rendered) | Generated | Pending playback |
| `21-order-cancellation` | Cancel an order with the correct stock outcome | walkthrough (rendered) | Generated | Pending playback |
| `22-order-refunds-recovery` | Record refunds and recover physical inventory | walkthrough (rendered) | Generated | Pending playback |
| `23-order-special-handling` | Handle food preparation, tracked gadgets and warranty | walkthrough (rendered) | Generated | Pending playback |
| `24-shipping-methods` | Configure checkout shipping methods | walkthrough (rendered) | Generated | Pending playback |
| `25-courier-overview` | Understand courier operations and exceptions | walkthrough (rendered) | Generated | Pending playback |
| `26-courier-connections` | Configure and review a courier connection | walkthrough | Pending | Pending |
| `27-courier-delivery-options` | Map courier delivery options to shipping methods | walkthrough | Pending | Pending |
| `28-courier-assignment-rules` | Configure and verify courier assignment rules | walkthrough | Pending | Pending |
| `29-courier-shipments` | Review shipment booking and parcel handoff | walkthrough | Pending | Pending |
| `30-courier-returns` | Track courier returns and recover received goods | walkthrough | Pending | Pending |
| `31-courier-cod-collections` | Record courier COD collection evidence | walkthrough | Pending | Pending |
| `32-store-settings` | Configure store details and checkout defaults | walkthrough | Pending | Pending |
| `33-store-page-seo` | Save and publish home and about page SEO | walkthrough | Pending | Pending |
| `34-image-library` | Upload, find and reuse images | walkthrough | Pending | Pending |
| `35-customer-records` | Review and maintain customer records | walkthrough | Pending | Pending |
| `36-users-invitations` | Manage users and invitations | walkthrough | Pending | Pending |
| `37-roles-permissions` | Configure roles and permission boundaries | walkthrough | Pending | Pending |
| `38-feedback-moderation` | Review and moderate submitted feedback | walkthrough | Pending | Pending |
| `39-visitor-analytics` | Read visitor trends and filters | walkthrough | Pending | Pending |
| `40-activity-audit` | Use the activity log to trace admin changes | walkthrough | Pending | Pending |
| `41-rate-limit-settings` | Review and configure request rate limits | walkthrough | Pending | Pending |
| `42-webhook-events` | Inspect webhook events and failures | walkthrough | Pending | Pending |
| `43-discount-codes` | Create and manage discount codes | walkthrough | Pending | Pending |

## Tutorial 02 accepted video

Produced on 2026-10-09: 15 synchronized sections, 74.921029 seconds, Heart/Kokoro narration. All 30 encoded boundary-frame comparisons passed (minimum SSIM 0.999401). Category creation and saved handling were verified against the isolated API; recording categories were removed and temporary servers stopped.

[Watch the unlisted review copy](https://www.youtube.com/watch?v=dWxX6RGObqM). The user accepted full playback with audio and authorized Guide publication. The Guide catalog now includes this video; rebuild/deploy the web app to expose the updated catalog in an existing production build. Source corrections and canonical plans are tracked; media and upload receipts remain in ignored artifacts. Tutorial 01 is unchanged.

## Videos 01–25 completion check — 2026-10-10

All 25 final videos are present locally. Tutorial 25 was rendered from its completed
production capture and Heart audio (8 sections, 68.121333 seconds). Tutorials
21–24 already had final renders. Their capture frames and tutorial 25 frames were
visually inspected. Upload and full playback approval remain separate; pending
review videos are not published in Guide. See `upload-ledger.json` for current
receipt-backed upload and render status.

Verification completed: all 25 videos passed actual file SHA-256 comparison with
render receipts, ffprobe audio/video stream and duration checks, and full ffmpeg
`-xerror` decoding with no errors. These checks do not replace listening to the
complete videos for playback approval.
