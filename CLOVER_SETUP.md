# Fixing the Admin "Connect Clover" button

## What was wrong

The admin "Connect Clover" panel uses Clover's **v2/OAuth flow**. The app code
reads these environment variables to start that flow:

| Variable | Purpose |
| --- | --- |
| `CLOVER_APP_ID` | Your Clover **App ID** (from the app's Settings page) |
| `CLOVER_APP_SECRET` | Your Clover **App Secret** |
| `CLOVER_MERCHANT_ID` | *(optional)* skips the merchant-selection screen |
| `CLOVER_ENVIRONMENT` | `sandbox` or `production` |
| `CLOVER_CONFIG_SECRET` **or** `SESSION_SECRET` | encrypts the stored tokens |

The problem: the project's `.env` template documented an **older manual-token
setup** (`CLOVER_API_TOKEN`, `NEXT_PUBLIC_CLOVER_API_KEY`) that the current code
**no longer uses**. Whoever configured Netlify following that template set the
wrong variables, so `CLOVER_APP_ID` / `CLOVER_APP_SECRET` were never present.

With those missing, the status endpoint reports `appConfigured: false`, and the
admin UI **disables the Connect button** and shows *"Netlify app credentials
needed."* That is the "not working" behaviour.

The OAuth endpoint URLs in the code are correct (verified against Clover's
official environment table), so this is a **configuration gap, not a code bug**.
The `.env` template has been corrected to list the variables the code actually
needs.

## What you need to do (these steps require your Clover account)

1. **Get your App credentials.** Clover Developer Dashboard → **Your Apps** →
   your app → **Settings**. Copy the **App ID** and **App Secret**.

2. **Register the redirect URL.** In the same app, open **REST Configuration**
   (a.k.a. Site URL / redirect URI) and add this exact value:

   ```
   https://jimbos-nursery.netlify.app/api/admin/clover/callback
   ```

   If it's not registered, Clover rejects the handshake even with valid keys.

3. **Set the Netlify environment variables.** Netlify → your site → **Site
   configuration → Environment variables**. Add:

   ```
   CLOVER_APP_ID        = <your App ID>
   CLOVER_APP_SECRET    = <your App Secret>
   CLOVER_ENVIRONMENT   = sandbox        # switch to "production" when live
   CLOVER_MERCHANT_ID   = <your merchant id>   # optional but recommended
   ```

   Also confirm **`SESSION_SECRET`** (or `CLOVER_CONFIG_SECRET`) is set in
   Netlify — without it the OAuth callback fails when saving the token.

   Then **remove** the now-unused `CLOVER_API_TOKEN` and
   `NEXT_PUBLIC_CLOVER_API_KEY` to avoid confusion.

4. **Redeploy** the site (Netlify → Deploys → Trigger deploy) so the new
   variables take effect.

5. **Connect.** Reload `/admin`, and the **Connect Clover** button will be
   enabled. Click it, approve on Clover's screen, and you should land back on
   `/admin?clover=connected`.

## If it hangs after you approve on Clover

This was a second, separate bug. The OAuth callback made two server-side calls
to Clover with **no timeout**, and it treated the secondary "payment key" (PAKMS)
call as mandatory. If that call stalled, the whole callback hung until the
platform killed the function — the browser just spun, and no connection was
saved.

Fixed in `src/lib/clover-connection.ts`:

- Both Clover calls now abort after 12s (`fetchWithTimeout`), so a stall becomes
  a clear logged error instead of an endless spinner.
- The payment-key fetch is now **non-fatal**: a successful token exchange saves
  the connection immediately, and the payment key is retried lazily. So Clover
  connects even if the key service is slow; gift-card checkout simply reports
  `checkoutReady: false` until the key is obtained.

**This fix must be deployed to take effect** — commit and push (or trigger a
Netlify redeploy), then retry Connect. If it still fails, it will now fail
*fast* with a `[clover]` / `[clover-callback]` line in the Netlify function log
telling us which call broke.

## Sandbox vs. production

Make sure the App ID/Secret you use match the `CLOVER_ENVIRONMENT` you set —
sandbox credentials only work with `sandbox`, production credentials only with
`production`. The redirect URL must be registered on whichever app you're using.
