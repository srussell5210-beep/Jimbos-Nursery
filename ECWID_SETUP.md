# Setting up paid events through Ecwid

## What this does

Priced events on `/events` now charge through Ecwid checkout — the same
Ecwid store already embedded on `/shop`, with Stripe and PayPal already
configured as payment methods there. When you create or edit a priced event
in `/admin`, this app automatically creates a matching Ecwid product; when a
customer clicks "Reserve & Pay", they're added to the Ecwid cart and sent to
Ecwid's own checkout. When Ecwid tells us the order was paid, the reservation
is recorded here automatically (spot counts, capacity, etc.).

Events priced "Free" are unaffected — they keep using the existing free
reservation form.

## What you need to do

### 1. Get your Ecwid API credentials

1. Go to **https://my.ecwid.com/#develop-apps**. Ecwid auto-generates a
   custom app for your store the first time you open this page.
2. Open that app's **Details** page. Copy two values (they are *different*
   from each other — both are needed):
   - **Secret token** — grants REST API access. Make sure the app has the
     `create_catalog`, `update_catalog`, and `read_orders` scopes enabled.
   - **client_secret** — used only to verify webhook signatures.

### 2. Set the environment variables

In Netlify → your site → **Site configuration → Environment variables**
(and in your local `.env` for local testing):

```
ECWID_STORE_ID       = 9145043   # already the default; only needed if it ever changes
ECWID_API_TOKEN       = <the secret token from step 1>
ECWID_WEBHOOK_SECRET   = <the client_secret from step 1>
```

### 3. Register the webhook

Still in the Ecwid app dashboard, add a webhook handler:

- **URL**: `https://jimbos-nursery.netlify.app/api/webhooks/ecwid`
  (or your local tunnel URL + `/api/webhooks/ecwid` for local testing)
- **Events**: `order.created` and `order.updated`

You can copy the exact webhook URL for your current deployment from
`/admin` → the **Ecwid** button in the top nav.

### 4. Redeploy

Redeploy the site (or restart your local dev server) so the new environment
variables take effect.

### 5. Sync your events

Open `/admin` and edit (or re-save) any priced event — this triggers the
automatic sync to Ecwid and shows a "Synced to Ecwid" badge once it
succeeds. If a sync fails (e.g. the token wasn't set yet), the event still
saves — use the **Sync to Ecwid** button on that event's card to retry.

## Known limitations

- **Per-time-slot capacity isn't enforced at Ecwid checkout.** The overall
  ticket count is (Ecwid tracks stock on the ticket product itself), but if
  an event has multiple time slots, Ecwid doesn't block a specific slot from
  overselling — slot fill is informational only, same as before.
- **Switching an already-synced event back to "Free" doesn't remove its
  Ecwid product.** Hide or delete it manually in the Ecwid dashboard if you
  don't want it listed there anymore.
- Add-ons with a price are synced as their own separate Ecwid products (so
  each gets its own stock tracking and doesn't scale with guest count) —
  named `"<Event Title> — <Add-on Name>"` in your Ecwid catalog.
